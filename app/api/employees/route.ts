import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Employee, ApiResponse } from '@/lib/types';
import { mockEmployees } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    } as ApiResponse<Employee[]>);
  } catch (error) {
    console.error('[v0] Error fetching employees:', error);
    return NextResponse.json({
      success: true,
      data: mockEmployees,
      note: 'Using demo data',
    } as ApiResponse<Employee[]>);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can add employees' } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, department, position, manager_id, role_type, start_date } = body;

    // Validation
    if (!first_name || !last_name || !email || !department || !position || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      );
    }

    // Insert employee
    const { data: employee, error } = await supabase
      .from('employees')
      .insert({
        first_name,
        last_name,
        email,
        department,
        position,
        manager_id: manager_id || null,
        role_type: role_type || 'Custom',
        onboarding_status: 'in_progress',
        start_date,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Task Agent asynchronously
    if (employee) {
      try {
        // Call the task agent endpoint to generate onboarding tasks
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/agents/task-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employee.id }),
        });
      } catch (agentError) {
        console.error('[v0] Task agent error:', agentError);
      }
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
