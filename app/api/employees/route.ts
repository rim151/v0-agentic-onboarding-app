import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { Employee, ApiResponse } from '@/lib/types';
import { generateOnboardingTasks } from '@/lib/agents/task-agent';
import { mockEmployees } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const employees = await query<Employee>(
      `SELECT * FROM employees ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: employees,
    } as ApiResponse<Employee[]>);
  } catch (error) {
    console.error('[v0] Error fetching employees, using mock data:', error);
    // Return mock data when database is unavailable
    return NextResponse.json({
      success: true,
      data: mockEmployees,
      note: 'Using mock data - database connection unavailable',
    } as ApiResponse<Employee[]>);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, department, position, manager_id, role_type, start_date } = body;

    // Validation
    if (!first_name || !last_name || !email || !department || !position || !start_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Create employee
    const result = await execute(
      `INSERT INTO employees (first_name, last_name, email, department, position, manager_id, role_type, onboarding_status, start_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'not_started', ?)`,
      [first_name, last_name, email, department, position, manager_id || null, role_type || 'Custom', start_date]
    );

    const newEmployee = await query<Employee>(
      'SELECT * FROM employees WHERE id = ?',
      [(result as any).insertId]
    );

    if (newEmployee.length === 0) {
      throw new Error('Failed to retrieve created employee');
    }

    const employee = newEmployee[0];

    // Trigger Task Agent to generate onboarding tasks
    try {
      await generateOnboardingTasks(employee);
      
      // Update onboarding status
      await execute(
        'UPDATE employees SET onboarding_status = ? WHERE id = ?',
        ['in_progress', employee.id]
      );
    } catch (agentError) {
      console.error('[v0] Task agent error:', agentError);
      // Don't fail the employee creation, but log the error
    }

    return NextResponse.json(
      {
        success: true,
        data: employee,
        message: 'Employee created successfully',
      } as ApiResponse<Employee>,
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Error creating employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
