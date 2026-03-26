import { callGroq, parseJSONFromGroq, getAgentPrompt } from '../groq';
import { query, execute } from '../db';
import { Task, Employee, AssignmentDecision } from '../types';
import { logAuditEvent } from './audit-logger';

export async function assignTasksToTeam(tasks: Task[], availableEmployees: Employee[]): Promise<AssignmentDecision[]> {
  const startTime = Date.now();

  try {
    // Build context for assignment decision
    const taskDetails = tasks.map(t => ({
      id: t.id,
      type: t.task_type,
      title: t.title,
      description: t.description,
      required_skills: t.required_skills,
      priority: t.priority,
    }));

    const employeeDetails = availableEmployees.map(e => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
      department: e.department,
      position: e.position,
    }));

    const userPrompt = `
You are assigning onboarding tasks to team members. Analyze each task and assign it to the most suitable person.

TASKS TO ASSIGN:
${JSON.stringify(taskDetails, null, 2)}

AVAILABLE TEAM MEMBERS:
${JSON.stringify(employeeDetails, null, 2)}

For each task, provide an assignment recommendation in JSON format:
{
  "task_id": number,
  "assigned_to_id": number,
  "reasoning": "Why this person is best suited",
  "confidence": number (0-100)
}

Consider: task type, skills, department relevance, and availability.
`;

    const prompt = getAgentPrompt('EXECUTION_AGENT');

    const response = await callGroq({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });

    const assignments = await parseJSONFromGroq(response);
    const assignmentList = Array.isArray(assignments) ? assignments : [assignments];

    const decisions: AssignmentDecision[] = [];

    // Persist assignments
    for (const assignment of assignmentList) {
      if (assignment.task_id && assignment.assigned_to_id) {
        const task = tasks.find(t => t.id === assignment.task_id);
        
        if (task) {
          const dueDate = new Date(task.due_date);

          await execute(
            `INSERT INTO task_assignments (task_id, assigned_to, assigned_by, status, start_date)
             VALUES (?, ?, ?, 'assigned', NOW())`,
            [assignment.task_id, assignment.assigned_to_id, null]
          );

          decisions.push({
            task_id: assignment.task_id,
            assigned_to_id: assignment.assigned_to_id,
            reasoning: assignment.reasoning,
            confidence: assignment.confidence,
          });
        }
      }
    }

    // Log audit event
    const executionTime = Date.now() - startTime;
    await logAuditEvent({
      agent_name: 'Task Executor',
      agent_type: 'EXECUTION_AGENT',
      action_type: 'ASSIGN_TASK',
      description: `Assigned ${decisions.length} tasks to team members`,
      reasoning: `Optimally distributed ${tasks.length} onboarding tasks across ${availableEmployees.length} team members`,
      parameters: {
        task_count: tasks.length,
        team_member_count: availableEmployees.length,
        assignment_count: decisions.length,
      },
      result_status: decisions.length > 0 ? 'success' : 'partial',
      groq_response: { tokens_used: response.tokens_used },
      execution_time_ms: executionTime,
    });

    console.log(`[v0] Execution Agent: Assigned ${decisions.length} tasks`);
    return decisions;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Task Executor',
      agent_type: 'EXECUTION_AGENT',
      action_type: 'ASSIGN_TASK',
      description: `Failed to assign tasks`,
      result_status: 'failure',
      error_message: errorMessage,
      execution_time_ms: executionTime,
    });

    throw error;
  }
}

export async function getOptimalAssignment(
  taskId: number,
  availableEmployees: Employee[]
): Promise<number> {
  const task = await query<Task>(
    'SELECT * FROM tasks WHERE id = ?',
    [taskId]
  );

  if (task.length === 0) {
    throw new Error('Task not found');
  }

  const assignments = await assignTasksToTeam(task, availableEmployees);
  
  if (assignments.length > 0) {
    return assignments[0].assigned_to_id;
  }

  // Fallback: assign to first available employee
  return availableEmployees[0].id;
}
