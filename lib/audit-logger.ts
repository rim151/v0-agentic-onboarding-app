import { execute } from './db';

export interface AuditLogEntry {
  agentName: string;
  actionType: string;
  entityType: string;
  entityId?: number;
  description: string;
  decisionRationale?: string;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  status?: string;
  errorMessage?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const {
    agentName,
    actionType,
    entityType,
    entityId,
    description,
    decisionRationale,
    inputData,
    outputData,
    status = 'completed',
    errorMessage,
  } = entry;

  const sql = `
    INSERT INTO audit_logs 
    (agent_name, action_type, entity_type, entity_id, description, decision_rationale, 
     input_data, output_data, status, error_message, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'system')
  `;

  const params = [
    agentName,
    actionType,
    entityType,
    entityId || null,
    description,
    decisionRationale || null,
    JSON.stringify(inputData || {}),
    JSON.stringify(outputData || {}),
    status,
    errorMessage || null,
  ];

  try {
    await execute(sql, params);
    console.log(`[Audit] ${agentName}: ${actionType} - ${description}`);
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging should not crash the system
  }
}

export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0
) {
  const sql = `
    SELECT * FROM audit_logs
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;
  
  const rows = await execute(sql, [limit, offset]);
  return rows;
}

export async function getAuditLogsForEntity(
  entityType: string,
  entityId: number
) {
  const sql = `
    SELECT * FROM audit_logs
    WHERE entity_type = ? AND entity_id = ?
    ORDER BY timestamp DESC
  `;
  
  const rows = await execute(sql, [entityType, entityId]);
  return rows;
}
