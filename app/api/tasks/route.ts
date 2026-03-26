import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { Task, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND employee_id = ?';
      params.push(parseInt(employeeId));
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY due_date ASC, priority DESC';

    const tasks = await query<Task>(sql, params);

    return NextResponse.json({
      success: true,
      data: tasks,
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
    const employee = await query(
      'SELECT id FROM employees WHERE id = ?',
      [employee_id]
    );

    if (employee.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const result = await execute(
      `INSERT INTO tasks (employee_id, task_type, title, description, required_skills, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [employee_id, task_type, title, description || null, required_skills || null, priority || 'MEDIUM', due_date]
    );

    const newTask = await query<Task>(
      'SELECT * FROM tasks WHERE id = ?',
      [(result as any).insertId]
    );

    return NextResponse.json(
      {
        success: true,
        data: newTask[0],
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
