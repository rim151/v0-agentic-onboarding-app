import { callGroq, parseJSONFromGroq, getAgentPrompt } from '../groq';
import { query, execute } from '../db';
import { TaskDelay, Employee, DelayDecision } from '../types';
import { logAuditEvent } from './audit-logger';

export async function makeDelayDecision(delay: TaskDelay): Promise<DelayDecision> {
  const startTime = Date.now();

  try {
    // Get full context about the delayed task
    const context = await query<any>(
      `SELECT ta.*, t.title, t.task_type, t.priority, e.first_name, e.last_name, 
              a.first_name as assigned_to_first, a.last_name as assigned_to_last,
              m.first_name as manager_first, m.last_name as manager_last
       FROM task_assignments ta
       JOIN tasks t ON ta.task_id = t.id
       JOIN employees e ON t.employee_id = e.id
       JOIN employees a ON ta.assigned_to = a.id
       LEFT JOIN employees m ON e.manager_id = m.id
       WHERE ta.id = ?`,
      [delay.task_assignment_id]
    );

    if (context.length === 0) {
      throw new Error('Context not found for delayed task');
    }

    const taskContext = context[0];

    // Get available team members for potential reassignment
    const availableTeam = await query<Employee>(
      `SELECT * FROM employees WHERE id != ? AND department = ? LIMIT 5`,
      [taskContext.assigned_to, taskContext.department]
    );

    const userPrompt = `
You are an intelligent decision maker for resolving task delays in employee onboarding.

DELAYED TASK INFORMATION:
- Task: ${taskContext.title}
- Type: ${taskContext.task_type}
- Priority: ${taskContext.priority}
- Currently Assigned To: ${taskContext.assigned_to_first} ${taskContext.assigned_to_last}
- New Employee: ${taskContext.first_name} ${taskContext.last_name}
- Department: ${taskContext.department}
- Hours Overdue: ${delay.hours_overdue}
- Manager: ${taskContext.manager_first ? taskContext.manager_first + ' ' + taskContext.manager_last : 'Not assigned'}

AVAILABLE TEAM FOR REASSIGNMENT:
${JSON.stringify(availableTeam.map(e => ({ id: e.id, name: e.first_name + ' ' + e.last_name, position: e.position })), null, 2)}

Analyze this delay and provide a decision in JSON format:
{
  "action": "escalate" | "reassign" | "extend_deadline" | "provide_support",
  "escalation_reason": "Reason if escalating",
  "recommended_reassign_to": number (employee id if reassigning),
  "new_deadline_days": number (if extending deadline),
  "reasoning": "Detailed reasoning for the decision",
  "risk_assessment": "High" | "Medium" | "Low",
  "success_probability": number (0-100)
}

Consider: task priority, employee workload, available resources, and impact on onboarding timeline.
`;

    const prompt = getAgentPrompt('DECISION_AGENT');

    const response = await callGroq({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1024,
    });

    const decision = await parseJSONFromGroq(response);

    // Execute the decision
    if (decision.action === 'escalate' && !delay.escalated) {
      await execute(
        `UPDATE task_delays SET escalated = TRUE, escalation_reason = ? WHERE id = ?`,
        [decision.escalation_reason, delay.id]
      );

      if (decision.recommended_reassign_to) {
        await execute(
          `UPDATE task_assignments SET assigned_to = ?, status = 'reassigned' WHERE id = ?`,
          [decision.recommended_reassign_to, delay.task_assignment_id]
        );

        await execute(
          `UPDATE task_delays SET reassigned = TRUE, reassigned_to = ? WHERE id = ?`,
          [decision.recommended_reassign_to, delay.id]
        );
      }

      await execute(
        `UPDATE task_assignments SET delay_escalated = TRUE WHERE id = ?`,
        [delay.task_assignment_id]
      );
    } else if (decision.action === 'reassign' && decision.recommended_reassign_to) {
      await execute(
        `UPDATE task_assignments SET assigned_to = ?, status = 'reassigned' WHERE id = ?`,
        [decision.recommended_reassign_to, delay.task_assignment_id]
      );

      await execute(
        `UPDATE task_delays SET reassigned = TRUE, reassigned_to = ? WHERE id = ?`,
        [decision.recommended_reassign_to, delay.id]
      );
    } else if (decision.action === 'extend_deadline' && decision.new_deadline_days) {
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + decision.new_deadline_days);

      await execute(
        `UPDATE tasks SET due_date = ? WHERE id = (SELECT task_id FROM task_assignments WHERE id = ?)`,
        [newDueDate.toISOString().slice(0, 19).replace('T', ' '), delay.task_assignment_id]
      );
    }

    // Log the decision
    const executionTime = Date.now() - startTime;
    await logAuditEvent({
      agent_name: 'Decision Maker',
      agent_type: 'DECISION_AGENT',
      action_type: 'ESCALATE_TASK',
      description: `Made decision for delayed task: ${decision.action}`,
      reasoning: decision.reasoning,
      parameters: {
        delay_id: delay.id,
        action: decision.action,
        hours_overdue: delay.hours_overdue,
      },
      result_status: 'success',
      delay_id: delay.id,
      groq_response: { tokens_used: response.tokens_used },
      execution_time_ms: executionTime,
    });

    console.log(`[v0] Decision Agent: Made ${decision.action} decision for delay ${delay.id}`);

    return {
      task_assignment_id: delay.task_assignment_id,
      hours_overdue: delay.hours_overdue,
      should_escalate: decision.action === 'escalate',
      escalation_reason: decision.escalation_reason,
      should_reassign: decision.action === 'reassign' || decision.action === 'escalate',
      recommended_reassign_to: decision.recommended_reassign_to,
      reasoning: decision.reasoning,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Decision Maker',
      agent_type: 'DECISION_AGENT',
      action_type: 'ESCALATE_TASK',
      description: 'Failed to make delay decision',
      result_status: 'failure',
      error_message: errorMessage,
      delay_id: delay.id,
      execution_time_ms: executionTime,
    });

    throw error;
  }
}

export async function processAllDelays(): Promise<DelayDecision[]> {
  try {
    // Get all unresolved delays
    const delays = await query<TaskDelay>(
      `SELECT * FROM task_delays WHERE resolved = FALSE AND !escalated ORDER BY hours_overdue DESC`
    );

    const decisions: DelayDecision[] = [];

    for (const delay of delays) {
      try {
        const decision = await makeDelayDecision(delay);
        decisions.push(decision);
      } catch (error) {
        console.error(`[v0] Error processing delay ${delay.id}:`, error);
        // Continue with next delay
      }
    }

    console.log(`[v0] Decision Agent: Processed ${decisions.length} delays`);
    return decisions;
  } catch (error) {
    console.error('[v0] Error processing all delays:', error);
    throw error;
  }
}
