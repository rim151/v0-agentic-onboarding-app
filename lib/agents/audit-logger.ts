import { execute } from '../db';
import { CreateAuditLogRequest } from '../types';

export async function logAuditEvent(auditData: CreateAuditLogRequest): Promise<number> {
  try {
    const result = await execute(
      `INSERT INTO audit_logs 
       (agent_name, agent_type, action_type, description, reasoning, parameters, 
        result_status, error_message, task_id, employee_id, assignment_id, delay_id, 
        groq_response, execution_time_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        auditData.agent_name,
        auditData.agent_type,
        auditData.action_type,
        auditData.description,
        auditData.reasoning || null,
        auditData.parameters ? JSON.stringify(auditData.parameters) : null,
        auditData.result_status || 'success',
        auditData.error_message || null,
        auditData.task_id || null,
        auditData.employee_id || null,
        auditData.assignment_id || null,
        auditData.delay_id || null,
        auditData.groq_response ? JSON.stringify(auditData.groq_response) : null,
        auditData.execution_time_ms || null,
      ]
    );

    console.log(`[v0] Audit log created: ${auditData.agent_type} - ${auditData.action_type}`);
    return result.insertId;
  } catch (error) {
    console.error('[v0] Failed to log audit event:', error);
    throw error;
  }
}

export async function getAuditLogs(filters?: {
  agent_type?: string;
  action_type?: string;
  task_id?: number;
  employee_id?: number;
  days?: number;
  limit?: number;
}) {
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];

  if (filters?.agent_type) {
    query += ' AND agent_type = ?';
    params.push(filters.agent_type);
  }

  if (filters?.action_type) {
    query += ' AND action_type = ?';
    params.push(filters.action_type);
  }

  if (filters?.task_id) {
    query += ' AND task_id = ?';
    params.push(filters.task_id);
  }

  if (filters?.employee_id) {
    query += ' AND employee_id = ?';
    params.push(filters.employee_id);
  }

  if (filters?.days) {
    query += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    params.push(filters.days);
  }

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  const { query: db } = await import('../db');
  return db(query, params);
}
