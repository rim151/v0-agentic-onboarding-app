import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { processAllDelays, makeDelayDecision } from '@/lib/agents/decision-agent';
import { TaskDelay, ApiResponse } from '@/lib/types';
import { logAuditEvent } from '@/lib/agents/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { delay_id } = body;

    console.log('[v0] Decision Agent: Starting decision making');

    if (delay_id) {
      // Process specific delay
      const delays = await query<TaskDelay>(
        'SELECT * FROM task_delays WHERE id = ?',
        [delay_id]
      );

      if (delays.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Delay not found',
          } as ApiResponse,
          { status: 404 }
        );
      }

      const decision = await makeDelayDecision(delays[0]);

      return NextResponse.json(
        {
          success: true,
          data: decision,
          message: 'Delay decision made successfully',
        } as ApiResponse,
        { status: 200 }
      );
    } else {
      // Process all delays
      const decisions = await processAllDelays();

      await logAuditEvent({
        agent_name: 'Decision Agent',
        agent_type: 'DECISION_AGENT',
        action_type: 'ESCALATE_TASK',
        description: `Made decisions for ${decisions.length} delays`,
        reasoning: 'Batch processing of all unresolved task delays',
        parameters: {
          delays_processed: decisions.length,
          escalations: decisions.filter(d => d.should_escalate).length,
          reassignments: decisions.filter(d => d.should_reassign).length,
        },
        result_status: 'success',
      });

      return NextResponse.json(
        {
          success: true,
          data: decisions,
          message: `Made decisions for ${decisions.length} delays`,
        } as ApiResponse,
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[v0] Decision Agent Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Decision Agent',
      agent_type: 'DECISION_AGENT',
      action_type: 'ESCALATE_TASK',
      description: 'Failed to make delay decisions',
      result_status: 'failure',
      error_message: errorMessage,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to make delay decisions',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
