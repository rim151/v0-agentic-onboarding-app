import { NextRequest, NextResponse } from 'next/server';
import { monitorTaskStatus } from '@/lib/agents/monitoring-agent';
import { ApiResponse } from '@/lib/types';
import { logAuditEvent } from '@/lib/agents/audit-logger';

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Monitoring Agent: Starting task monitoring');

    const result = await monitorTaskStatus();

    await logAuditEvent({
      agent_name: 'Monitoring Agent',
      agent_type: 'MONITORING_AGENT',
      action_type: 'UPDATE_TASK_STATUS',
      description: result.summary,
      reasoning: 'Periodic task status monitoring with 24-hour delay threshold',
      parameters: {
        total_checked: result.total_tasks_checked,
        at_risk: result.tasks_at_risk,
        delays_detected: result.delays_detected.length,
      },
      result_status: 'success',
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: result.summary,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Monitoring Agent Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Monitoring Agent',
      agent_type: 'MONITORING_AGENT',
      action_type: 'UPDATE_TASK_STATUS',
      description: 'Failed to monitor task status',
      result_status: 'failure',
      error_message: errorMessage,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to monitor task status',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
