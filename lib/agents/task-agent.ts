import { callGroq, getAgentPrompt, GroqResponse } from '../groq';
import { query, execute } from '../db';
import { Employee, Task, TaskType, TaskPriority, TASK_TEMPLATES, CreateAuditLogRequest } from '../types';
import { logAuditEvent } from './audit-logger';

export interface GeneratedTask {
  task_type: TaskType;
  title: string;
  description: string;
  required_skills: string;
  priority: TaskPriority;
  days_to_due: number;
}

export async function generateOnboardingTasks(employee: Employee): Promise<Task[]> {
  const startTime = Date.now();

  try {
    // Get templates based on role type
    const templates = TASK_TEMPLATES[employee.role_type as TaskType] || [];
    
    // Prepare context for Groq
    const context = `
Employee: ${employee.first_name} ${employee.last_name}
Department: ${employee.department}
Position: ${employee.position}
Role Type: ${employee.role_type}
Start Date: ${employee.start_date}
Manager: ${employee.manager_id || 'Not assigned'}

Available task templates for this role:
${JSON.stringify(templates, null, 2)}

Please generate a comprehensive onboarding task list tailored to this employee's needs.`;

    const prompt = getAgentPrompt('TASK_AGENT');
    
    const response = await callGroq({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    // Parse response
    let generatedTasks: GeneratedTask[] = [];
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedTasks = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[v0] Failed to parse Groq response:', parseError);
      // Fallback to default templates
      generatedTasks = templates.map((t) => ({
        task_type: t.type,
        title: t.title,
        description: t.description,
        required_skills: t.requiredSkills.join(', '),
        priority: t.priority,
        days_to_due: t.estimatedDays,
      }));
    }

    // Save tasks to database
    const savedTasks: Task[] = [];
    for (const taskData of generatedTasks) {
      const dueDate = new Date(employee.start_date);
      dueDate.setDate(dueDate.getDate() + taskData.days_to_due);

      const result = await execute(
        `INSERT INTO tasks (employee_id, task_type, title, description, required_skills, priority, due_date, generated_by_agent, agent_reasoning)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.id,
          taskData.task_type,
          taskData.title,
          taskData.description,
          taskData.required_skills,
          taskData.priority,
          dueDate.toISOString(),
          'TASK_AGENT',
          `Generated for ${employee.role_type} role in ${employee.department}`,
        ]
      );

      const task = await query<Task>(
        'SELECT * FROM tasks WHERE id = ?',
        [result.insertId]
      );

      if (task.length > 0) {
        savedTasks.push(task[0]);
      }
    }

    // Log audit event
    const executionTime = Date.now() - startTime;
    await logAuditEvent({
      agent_name: 'Task Generator',
      agent_type: 'TASK_AGENT',
      action_type: 'GENERATE_TASKS',
      description: `Generated ${savedTasks.length} onboarding tasks for employee ${employee.id}`,
      reasoning: `Created comprehensive onboarding plan for ${employee.position} in ${employee.department}`,
      parameters: {
        employee_id: employee.id,
        role_type: employee.role_type,
        task_count: savedTasks.length,
      },
      result_status: 'success',
      employee_id: employee.id,
      groq_response: { tokens_used: response.tokens_used, model: response.model },
      execution_time_ms: executionTime,
    });

    console.log(`[v0] Task Agent: Generated ${savedTasks.length} tasks for employee ${employee.id}`);
    return savedTasks;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logAuditEvent({
      agent_name: 'Task Generator',
      agent_type: 'TASK_AGENT',
      action_type: 'GENERATE_TASKS',
      description: `Failed to generate tasks for employee ${employee.id}`,
      result_status: 'failure',
      error_message: errorMessage,
      employee_id: employee.id,
      execution_time_ms: executionTime,
    });

    throw error;
  }
}

export async function getTaskTemplatesForRole(roleType: string): Promise<GeneratedTask[]> {
  const templates = TASK_TEMPLATES[roleType as TaskType] || [];
  return templates.map((t) => ({
    task_type: t.type,
    title: t.title,
    description: t.description,
    required_skills: t.requiredSkills.join(', '),
    priority: t.priority,
    days_to_due: t.estimatedDays,
  }));
}
