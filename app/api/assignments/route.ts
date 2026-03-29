import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskAssignment, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');

    let query = supabase
      .from('task_assignments')
      .select('*') // ✅ FIX: removed join
      .order('id', { ascending: false }); // ✅ FIX: safer column

    if (assignedTo) {
      query = query.eq('employee_id', assignedTo);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    } as ApiResponse);
  } catch (error) {
    console.error('[v0] FULL ERROR:', JSON.stringify(error, null, 2)); // ✅ better debug
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { task_id, assigned_to, assigned_by, notes } = body;

    if (!task_id || !assigned_to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Check if assignee exists
    const { data: assignee, error: assigneeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', assigned_to)
      .single();

    if (assigneeError || !assignee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assignee not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const { data: assignment, error } = await supabase
      .from('task_assignments')
      .insert({
        task_id,
        employee_id: assigned_to,
        assigned_by: assigned_by || null,
        status: 'assigned',
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: assignment,
        message: 'Assignment created successfully',
      } as ApiResponse<TaskAssignment>,
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating assignment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assignment',
      } as ApiResponse,
      { status: 500 }
    );
  }
}