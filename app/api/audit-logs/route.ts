import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuditLog, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const searchParams = request.nextUrl.searchParams;
    const agentType = searchParams.get('agentType');
    const actionType = searchParams.get('actionType');
    const employeeId = searchParams.get('employeeId');
    const taskId = searchParams.get('taskId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (agentType && agentType !== 'all') {
      query = query.eq('agent_type', agentType);
    }

    if (actionType && actionType !== 'all') {
      query = query.eq('action_type', actionType);
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
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
