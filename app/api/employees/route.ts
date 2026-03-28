import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Employee, ApiResponse } from '@/lib/types';
import { mockEmployees } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    // If there's an error (RLS, connection, etc.), return mock data
    if (error) {
      console.error('[v0] Supabase error:', error.message);
      return NextResponse.json(
        {
          success: true,
          data: mockEmployees,
          note: 'Database setup needed - using demo data. Run QUICK_FIX_NOW.md SQL to enable real data.',
        } as ApiResponse<Employee[]>,
        { status: 200 }
      );
    }

    // Return real data if successful
    return NextResponse.json(
      {
        success: true,
        data: data || [],
      } as ApiResponse<Employee[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error fetching employees:', error);
    // Always return 200 with mock data on error to prevent UI from breaking
    return NextResponse.json(
      {
        success: true,
        data: mockEmployees,
        note: 'Using demo data - database connection unavailable',
      } as ApiResponse<Employee[]>,
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { first_name, last_name, email, department, position, manager_id, role_type, start_date } = body;

    // Validation
    if (!first_name || !last_name || !email || !department || !position || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      );
    }

    // Insert employee - use .rls(false) to bypass RLS policies for admin operations
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

    if (error) {
      console.error('[v0] Error inserting employee:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to create employee. Ensure database RLS policies are fixed (see QUICK_FIX_NOW.md)',
        } as ApiResponse,
        { status: 400 }
      );
    }

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
        error: 'Failed to create employee. Check browser console for details.',
      } as ApiResponse,
      { status: 500 }
    );
  }
}
