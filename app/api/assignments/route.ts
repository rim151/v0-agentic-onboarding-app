import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { TaskAssignment, ApiResponse } from '@/lib/types';
import { mockAssignments } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');

    let sql = `SELECT ta.*, t.title, t.priority, t.due_date, e.first_name, e.last_name
               FROM task_assignments ta
               JOIN tasks t ON ta.task_id = t.id
               JOIN employees e ON t.employee_id = e.id
               WHERE 1=1`;
    const params: any[] = [];

    if (assignedTo) {
      sql += ' AND ta.assigned_to = ?';
      params.push(parseInt(assignedTo));
    }

    if (status) {
      sql += ' AND ta.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.due_date ASC';

    const assignments = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: assignments,
    } as ApiResponse);
  } catch (error) {
    console.error('[v0] Error fetching assignments, using mock data:', error);
    let filtered = mockAssignments;
    const searchParams = request.nextUrl.searchParams;
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');
    
    if (assignedTo) {
      filtered = filtered.filter(a => a.assigned_to === parseInt(assignedTo));
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    return NextResponse.json({
      success: true,
      data: filtered,
      note: 'Using mock data - database connection unavailable',
    } as ApiResponse);
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const task = await query(
      'SELECT * FROM tasks WHERE id = ?',
      [task_id]
    );

    if (task.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Check if assignee exists
    const assignee = await query(
      'SELECT id FROM employees WHERE id = ?',
      [assigned_to]
    );

    if (assignee.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assignee not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const result = await execute(
      `INSERT INTO task_assignments (task_id, assigned_to, assigned_by, status, notes)
       VALUES (?, ?, ?, 'assigned', ?)`,
      [task_id, assigned_to, assigned_by || null, notes || null]
    );

    const newAssignment = await query<TaskAssignment>(
      'SELECT * FROM task_assignments WHERE id = ?',
      [(result as any).insertId]
    );

    return NextResponse.json(
      {
        success: true,
        data: newAssignment[0],
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
