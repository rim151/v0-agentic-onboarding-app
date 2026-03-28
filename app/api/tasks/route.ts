import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Task, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let query = supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[v0] Error fetching tasks:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch tasks',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    } as ApiResponse<Task[]>);
  } catch (error) {
    console.error('[v0] Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { employee_id, task_type, title, description, required_skills, priority, due_date } = body;

    if (!employee_id || !task_type || !title || !due_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if employee exists
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employee_id)
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        employee_id,
        task_type,
        title,
        description: description || null,
        required_skills: required_skills || null,
        priority: priority || 'MEDIUM',
        status: 'pending',
        due_date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: task,
        message: 'Task created successfully',
      } as ApiResponse<Task>,
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create task',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
