// Employee Types
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  manager_id?: number;
  role_type: 'IT' | 'HR' | 'Training' | 'Department' | 'Custom';
  onboarding_status: 'not_started' | 'in_progress' | 'completed';
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  manager_id?: number;
  role_type?: 'IT' | 'HR' | 'Training' | 'Department' | 'Custom';
  start_date: string;
}

// Task Types
export type TaskType = 'IT_SETUP' | 'HR_PAPERWORK' | 'TRAINING' | 'DEPARTMENT_ORIENTATION' | 'CUSTOM';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'escalated';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskTemplate {
  id: number;
  task_type: TaskType;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  estimated_hours: number;
  template_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  employee_id: number;
  template_id?: number;
  task_type: TaskType;
  title: string;
  description?: string;
  required_skills?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
  generated_by_agent?: string;
  agent_reasoning?: string;
}

export interface CreateTaskRequest {
  employee_id: number;
  task_type: TaskType;
  title: string;
  description?: string;
  required_skills?: string;
  priority?: TaskPriority;
  due_date: string;
}

// Task Assignment Types
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'reassigned' | 'escalated';

export interface TaskAssignment {
  id: number;
  task_id: number;
  assigned_to: number;
  assigned_by?: number;
  assignment_date: string;
  start_date?: string;
  completion_date?: string;
  status: AssignmentStatus;
  is_delayed: boolean;
  delay_escalated: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssignmentRequest {
  task_id: number;
  assigned_to: number;
  assigned_by?: number;
  notes?: string;
}

// Task Delay Types
export interface TaskDelay {
  id: number;
  task_assignment_id: number;
  delay_detected_at: string;
  hours_overdue: number;
  delay_reason?: string;
  escalated: boolean;
  escalation_level: 'manager' | 'department_head' | 'executive';
  escalated_to?: number;
  reassigned: boolean;
  reassigned_to?: number;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

// Audit Log Types
export type AgentType = 'TASK_AGENT' | 'EXECUTION_AGENT' | 'MONITORING_AGENT' | 'DECISION_AGENT';
export type ActionType = 'GENERATE_TASKS' | 'ASSIGN_TASK' | 'UPDATE_TASK_STATUS' | 'DETECT_DELAY' | 'ESCALATE_TASK' | 'REASSIGN_TASK' | 'RESOLVE_DELAY';
export type ResultStatus = 'success' | 'failure' | 'partial';

export interface AuditLog {
  id: number;
  agent_name: string;
  agent_type: AgentType;
  action_type: ActionType;
  description: string;
  reasoning?: string;
  parameters?: Record<string, any>;
  result_status: ResultStatus;
  error_message?: string;
  task_id?: number;
  employee_id?: number;
  assignment_id?: number;
  delay_id?: number;
  groq_response?: Record<string, any>;
  groq_model?: string;
  groq_prompt_tokens?: number;
  groq_completion_tokens?: number;
  execution_time_ms?: number;
  created_at: string;
}

export interface CreateAuditLogRequest {
  agent_name: string;
  agent_type: AgentType;
  action_type: ActionType;
  description: string;
  reasoning?: string;
  parameters?: Record<string, any>;
  result_status?: ResultStatus;
  error_message?: string;
  task_id?: number;
  employee_id?: number;
  assignment_id?: number;
  delay_id?: number;
  groq_response?: Record<string, any>;
  execution_time_ms?: number;
}

// Agent Configuration Types
export interface AgentConfig {
  id: number;
  agent_type: AgentType;
  enabled: boolean;
  delay_threshold_hours: number;
  auto_escalate: boolean;
  auto_reassign: boolean;
  max_retries: number;
  retry_delay_seconds: number;
  groq_model: string;
  max_tokens: number;
  temperature: number;
  config?: Record<string, any>;
  last_modified: string;
  modified_by?: string;
  notes?: string;
}

// Agent Decision Types
export interface TaskGenerationDecision {
  employee_id: number;
  tasks: {
    template_id?: number;
    task_type: TaskType;
    title: string;
    description: string;
    priority: TaskPriority;
    estimated_hours: number;
    due_date_days: number;
  }[];
  reasoning: string;
}

export interface AssignmentDecision {
  task_id: number;
  assigned_to_id: number;
  reasoning: string;
  confidence: number;
}

export interface DelayDecision {
  task_assignment_id: number;
  hours_overdue: number;
  should_escalate: boolean;
  escalation_reason?: string;
  should_reassign: boolean;
  recommended_reassign_to?: number;
  reasoning: string;
}

export interface MonitoringResult {
  total_tasks_checked: number;
  tasks_at_risk: number;
  tasks_completed: number;
  delays_detected: TaskDelay[];
  summary: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Task Templates for onboarding
export interface TaskTemplate {
  type: TaskType;
  title: string;
  description: string;
  requiredSkills: string[];
  priority: TaskPriority;
  estimatedDays: number;
}

export const TASK_TEMPLATES: Record<TaskType, TaskTemplate[]> = {
  IT_SETUP: [
    {
      type: 'IT_SETUP',
      title: 'Provide Laptop and Peripherals',
      description: 'Set up laptop, monitor, keyboard, and other IT equipment',
      requiredSkills: ['IT Hardware Setup'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'IT_SETUP',
      title: 'Create Email Account',
      description: 'Create company email and configure email client',
      requiredSkills: ['Email Administration'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'IT_SETUP',
      title: 'Setup VPN Access',
      description: 'Configure VPN credentials and access',
      requiredSkills: ['Network Administration'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'IT_SETUP',
      title: 'Provision Software Access',
      description: 'Install and license required software',
      requiredSkills: ['Software License Management'],
      priority: 'MEDIUM',
      estimatedDays: 2,
    },
  ],
  HR_PAPERWORK: [
    {
      type: 'HR_PAPERWORK',
      title: 'Employment Contract Review',
      description: 'Review and sign employment contract',
      requiredSkills: ['HR Administration'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'HR_PAPERWORK',
      title: 'Tax Forms Completion',
      description: 'Complete W-4, I-9, and other tax documentation',
      requiredSkills: ['Payroll Administration'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'HR_PAPERWORK',
      title: 'Benefits Enrollment',
      description: 'Enroll in health insurance, 401k, and other benefits',
      requiredSkills: ['Benefits Administration'],
      priority: 'HIGH',
      estimatedDays: 3,
    },
  ],
  TRAINING: [
    {
      type: 'TRAINING',
      title: 'Onboarding Module Completion',
      description: 'Complete company onboarding training module',
      requiredSkills: ['Training Coordination'],
      priority: 'MEDIUM',
      estimatedDays: 2,
    },
    {
      type: 'TRAINING',
      title: 'Product/Service Training',
      description: 'Complete product or service-specific training',
      requiredSkills: ['Training Coordination'],
      priority: 'MEDIUM',
      estimatedDays: 3,
    },
    {
      type: 'TRAINING',
      title: 'Systems and Tools Training',
      description: 'Training on company systems and tools',
      requiredSkills: ['Technical Training'],
      priority: 'MEDIUM',
      estimatedDays: 2,
    },
  ],
  DEPARTMENT_ORIENTATION: [
    {
      type: 'DEPARTMENT_ORIENTATION',
      title: 'Meet Department Head',
      description: 'Introduction meeting with department leadership',
      requiredSkills: ['Department Management'],
      priority: 'HIGH',
      estimatedDays: 1,
    },
    {
      type: 'DEPARTMENT_ORIENTATION',
      title: 'Team Introduction',
      description: 'Meet and greet with team members',
      requiredSkills: ['Team Coordination'],
      priority: 'MEDIUM',
      estimatedDays: 1,
    },
  ],
  CUSTOM: [],
};
