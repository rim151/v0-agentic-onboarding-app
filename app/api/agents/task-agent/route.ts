import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateOnboardingTasks } from '@/lib/agents/task-agent';
import { Employee, ApiResponse } from '@/lib/types';
import { logAuditEvent } from '@/lib/agents/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employee_id } = body;

    if (!employee_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'employee_id is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get employee
    const employees = await query<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [employee_id]
    );

    if (employees.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const employee = employees[0];
    console.log('[v0] Task Agent: Processing employee', employee.id);

    // Generate tasks
    const decision = await generateOnboardingTasks(employee);

    await logAuditEvent({
      agent_name: 'Task Agent',
      agent_type: 'TASK_AGENT',
      action_type: 'GENERATE_TASKS',
      description: `Generated onboarding tasks for employee ${employee.id}`,
      reasoning: decision.reasoning,
      parameters: {
        employee_id: employee.id,
        task_count: decision.tasks.length,
      },
      result_status: 'success',
      employee_id: employee.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          employee_id,
          tasks_generated: decision.tasks.length,
          tasks: decision.tasks,
          reasoning: decision.reasoning,
        },
        message: `Generated ${decision.tasks.length} tasks for ${employee.first_name} ${employee.last_name}`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Task Agent Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Task Agent',
      agent_type: 'TASK_AGENT',
      action_type: 'GENERATE_TASKS',
      description: 'Failed to generate tasks',
      result_status: 'failure',
      error_message: errorMessage,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate tasks',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
