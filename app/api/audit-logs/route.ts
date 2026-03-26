import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AuditLog, ApiResponse } from '@/lib/types';
import { getAuditLogs } from '@/lib/agents/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentType = searchParams.get('agentType');
    const actionType = searchParams.get('actionType');
    const employeeId = searchParams.get('employeeId');
    const taskId = searchParams.get('taskId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (agentType) {
      sql += ' AND agent_type = ?';
      params.push(agentType);
    }

    if (actionType) {
      sql += ' AND action_type = ?';
      params.push(actionType);
    }

    if (employeeId) {
      sql += ' AND employee_id = ?';
      params.push(parseInt(employeeId));
    }

    if (taskId) {
      sql += ' AND task_id = ?';
      params.push(parseInt(taskId));
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = await query<AuditLog>(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const countParams: any[] = [];

    if (agentType) {
      countSql += ' AND agent_type = ?';
      countParams.push(agentType);
    }
    if (actionType) {
      countSql += ' AND action_type = ?';
      countParams.push(actionType);
    }
    if (employeeId) {
      countSql += ' AND employee_id = ?';
      countParams.push(parseInt(employeeId));
    }
    if (taskId) {
      countSql += ' AND task_id = ?';
      countParams.push(parseInt(taskId));
    }

    const countResult = await query<any>(countSql, countParams);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as ApiResponse & { pagination: any });
  } catch (error) {
    console.error('[v0] Error fetching audit logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
