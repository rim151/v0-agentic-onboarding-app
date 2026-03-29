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
      console.error('GET TASK ERROR:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('GET CATCH ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    let {
      employee_id,
      task_type,
      title,
      description,
      priority,
      due_date,
    } = body;

    console.log('Incoming body:', body);

    // 🔥 Email → UUID convert
    if (employee_id && employee_id.includes('@')) {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('email', employee_id)
        .single();

      if (empError || !employee) {
        return NextResponse.json(
          { success: false, error: 'Employee not found for this email' },
          { status: 400 }
        );
      }

      employee_id = employee.id;
    }

    // ✅ Validation
    if (!employee_id || !task_type || !title || !due_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        employee_id,
        task_type,
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        status: 'in_progress',
        due_date,
      })
      .select()
      .single();

    if (error) {
      console.error('INSERT ERROR:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: task,
        message: 'Task created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST CATCH ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

//
// 🔥 ADD THIS (DELETE API)
//
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE ERROR:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE CATCH ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}

//
// 🔥 ADD THIS (UPDATE API)
//
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        priority,
      })
      .eq('id', id);

    if (error) {
      console.error('UPDATE ERROR:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    console.error('PUT CATCH ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}