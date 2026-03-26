import { callGroq, parseJSONFromGroq, getAgentPrompt } from '../groq';
import { query, execute } from '../db';
import { TaskAssignment, Task, TaskDelay, MonitoringResult } from '../types';
import { logAuditEvent } from './audit-logger';

const DELAY_THRESHOLD_HOURS = 24; // Global 24-hour threshold

export async function monitorTaskStatus(): Promise<MonitoringResult> {
  const startTime = Date.now();

  try {
    // Get all active task assignments
    const assignments = await query<any>(
      `SELECT ta.*, t.due_date, t.title, t.priority, e.id as employee_id, a.first_name, a.last_name
       FROM task_assignments ta
       JOIN tasks t ON ta.task_id = t.id
       JOIN employees e ON t.employee_id = e.id
       JOIN employees a ON ta.assigned_to = a.id
       WHERE ta.status IN ('assigned', 'in_progress')`
    );

    const now = new Date();
    const delaysDetected: TaskDelay[] = [];
    let totalChecked = 0;
    let tasksAtRisk = 0;
    let tasksCompleted = 0;

    for (const assignment of assignments) {
      totalChecked++;
      const dueDate = new Date(assignment.due_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Check if task is delayed
      if (hoursUntilDue < 0) {
        const hoursOverdue = Math.abs(hoursUntilDue);

        // Check if delay already recorded
        const existingDelay = await query<TaskDelay>(
          `SELECT * FROM task_delays 
           WHERE task_assignment_id = ? AND resolved = FALSE`,
          [assignment.id]
        );

        if (existingDelay.length === 0 && hoursOverdue >= DELAY_THRESHOLD_HOURS) {
          // Create new delay record
          const result = await execute(
            `INSERT INTO task_delays 
             (task_assignment_id, delay_detected_at, hours_overdue, escalated, escalation_level)
             VALUES (?, NOW(), ?, FALSE, 'manager')`,
            [assignment.id, Math.round(hoursOverdue)]
          );

          const delay = await query<TaskDelay>(
            'SELECT * FROM task_delays WHERE id = ?',
            [result.insertId]
          );

          if (delay.length > 0) {
            delaysDetected.push(delay[0]);
            tasksAtRisk++;
          }
        } else if (existingDelay.length > 0) {
          tasksAtRisk++;
        }

        // Update assignment is_delayed flag
        await execute(
          'UPDATE task_assignments SET is_delayed = TRUE WHERE id = ?',
          [assignment.id]
        );
      } else if (hoursUntilDue > 0 && hoursUntilDue < 24) {
        // Task at risk (within 24 hours of due date)
        tasksAtRisk++;
      }
    }

    // Get completed tasks
    const completed = await query<any>(
      `SELECT COUNT(*) as count FROM task_assignments WHERE status = 'completed'`
    );
    tasksCompleted = completed[0]?.count || 0;

    const summary = `Monitored ${totalChecked} active tasks: ${tasksAtRisk} at risk, ${delaysDetected.length} delays detected, ${tasksCompleted} completed`;

    // Log monitoring event
    const executionTime = Date.now() - startTime;
    await logAuditEvent({
      agent_name: 'Task Monitor',
      agent_type: 'MONITORING_AGENT',
      action_type: 'UPDATE_TASK_STATUS',
      description: summary,
      reasoning: `Periodic task status check with ${DELAY_THRESHOLD_HOURS}-hour delay threshold`,
      parameters: {
        total_checked: totalChecked,
        tasks_at_risk: tasksAtRisk,
        delays_detected: delaysDetected.length,
      },
      result_status: 'success',
      execution_time_ms: executionTime,
    });

    console.log(`[v0] Monitoring Agent: ${summary}`);

    return {
      total_tasks_checked: totalChecked,
      tasks_at_risk: tasksAtRisk,
      tasks_completed: tasksCompleted,
      delays_detected: delaysDetected,
      summary,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Task Monitor',
      agent_type: 'MONITORING_AGENT',
      action_type: 'UPDATE_TASK_STATUS',
      description: 'Failed to monitor task status',
      result_status: 'failure',
      error_message: errorMessage,
      execution_time_ms: executionTime,
    });

    throw error;
  }
}

export async function checkSpecificTaskDelay(assignmentId: number): Promise<TaskDelay | null> {
  try {
    const assignment = await query<any>(
      `SELECT ta.*, t.due_date FROM task_assignments ta
       JOIN tasks t ON ta.task_id = t.id
       WHERE ta.id = ?`,
      [assignmentId]
    );

    if (assignment.length === 0) {
      return null;
    }

    const now = new Date();
    const dueDate = new Date(assignment[0].due_date);
    const hoursOverdue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60);

    if (hoursOverdue >= DELAY_THRESHOLD_HOURS) {
      // Check if delay already exists
      const existingDelay = await query<TaskDelay>(
        `SELECT * FROM task_delays WHERE task_assignment_id = ? AND resolved = FALSE`,
        [assignmentId]
      );

      if (existingDelay.length > 0) {
        return existingDelay[0];
      }

      // Create new delay record
      const result = await execute(
        `INSERT INTO task_delays 
         (task_assignment_id, delay_detected_at, hours_overdue, escalated, escalation_level)
         VALUES (?, NOW(), ?, FALSE, 'manager')`,
        [assignmentId, Math.round(hoursOverdue)]
      );

      const delay = await query<TaskDelay>(
        'SELECT * FROM task_delays WHERE id = ?',
        [result.insertId]
      );

      return delay.length > 0 ? delay[0] : null;
    }

    return null;
  } catch (error) {
    console.error('[v0] Error checking task delay:', error);
    throw error;
  }
}
