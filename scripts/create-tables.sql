-- Employee Onboarding System Database Schema
-- Multi-Agent AI System with comprehensive audit logging

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  manager_id INT,
  role_type ENUM('IT', 'HR', 'Training', 'Department', 'Custom') DEFAULT 'Custom',
  onboarding_status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_department (department),
  INDEX idx_status_date (onboarding_status, created_at)
);

-- Task Templates Table (predefined task templates)
CREATE TABLE IF NOT EXISTS task_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_type ENUM('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  estimated_hours INT DEFAULT 4,
  template_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_type (task_type),
  INDEX idx_priority (priority)
);

-- Tasks Table (instances created for employees)
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  template_id INT,
  task_type ENUM('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  required_skills VARCHAR(255),
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM('pending', 'in_progress', 'completed', 'blocked', 'escalated') DEFAULT 'pending',
  due_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  generated_by_agent VARCHAR(100),
  agent_reasoning TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES task_templates(id) ON DELETE SET NULL,
  INDEX idx_employee_status (employee_id, status),
  INDEX idx_due_date (due_date),
  INDEX idx_task_type (task_type)
);

-- Task Assignments Table
CREATE TABLE IF NOT EXISTS task_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  assigned_to INT NOT NULL,
  assigned_by INT,
  assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_date DATETIME,
  completion_date DATETIME,
  status ENUM('assigned', 'in_progress', 'completed', 'reassigned', 'escalated') DEFAULT 'assigned',
  is_delayed BOOLEAN DEFAULT FALSE,
  delay_escalated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_task_status (task_id, status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_is_delayed (is_delayed),
  INDEX idx_updated_at (updated_at)
);

-- Task Delays Table
CREATE TABLE IF NOT EXISTS task_delays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_assignment_id INT NOT NULL,
  delay_detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hours_overdue INT DEFAULT 0,
  delay_reason VARCHAR(255),
  escalated BOOLEAN DEFAULT FALSE,
  escalation_level ENUM('manager', 'department_head', 'executive') DEFAULT 'manager',
  escalated_to INT,
  reassigned BOOLEAN DEFAULT FALSE,
  reassigned_to INT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (task_assignment_id) REFERENCES task_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (escalated_to) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (reassigned_to) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_resolved (resolved),
  INDEX idx_escalated (escalated),
  INDEX idx_delay_detected (delay_detected_at)
);

-- Audit Logs Table (comprehensive AI decision tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_name VARCHAR(100) NOT NULL,
  agent_type ENUM('TASK_AGENT', 'EXECUTION_AGENT', 'MONITORING_AGENT', 'DECISION_AGENT') NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  parameters JSON,
  result_status ENUM('success', 'failure', 'partial') DEFAULT 'success',
  error_message TEXT,
  task_id INT,
  employee_id INT,
  assignment_id INT,
  delay_id INT,
  groq_response JSON,
  groq_model VARCHAR(100),
  groq_prompt_tokens INT,
  groq_completion_tokens INT,
  execution_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (assignment_id) REFERENCES task_assignments(id) ON DELETE SET NULL,
  FOREIGN KEY (delay_id) REFERENCES task_delays(id) ON DELETE SET NULL,
  INDEX idx_agent_type (agent_type, created_at),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_task_audit (task_id),
  INDEX idx_employee_audit (employee_id)
);

-- AI Agent Configuration Table
CREATE TABLE IF NOT EXISTS ai_agent_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_type ENUM('TASK_AGENT', 'EXECUTION_AGENT', 'MONITORING_AGENT', 'DECISION_AGENT') UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  delay_threshold_hours INT DEFAULT 24,
  auto_escalate BOOLEAN DEFAULT TRUE,
  auto_reassign BOOLEAN DEFAULT TRUE,
  max_retries INT DEFAULT 3,
  retry_delay_seconds INT DEFAULT 300,
  groq_model VARCHAR(100) DEFAULT 'mixtral-8x7b-32768',
  max_tokens INT DEFAULT 1024,
  temperature FLOAT DEFAULT 0.7,
  config JSON,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by VARCHAR(100),
  notes TEXT
);

-- Insert default task templates
INSERT INTO task_templates (task_type, title, description, category, priority, estimated_hours) VALUES
('IT_SETUP', 'Set up laptop and email account', 'Provision company laptop, email, and essential software', 'IT', 'HIGH', 2),
('IT_SETUP', 'Configure VPN and network access', 'Set up VPN credentials and ensure network connectivity', 'IT', 'HIGH', 1),
('IT_SETUP', 'Create accounts in required systems', 'Set up accounts in CRM, project management, and collaboration tools', 'IT', 'MEDIUM', 3),
('HR_PAPERWORK', 'Complete employment contract', 'Review and sign employment contract and related documents', 'HR', 'HIGH', 1),
('HR_PAPERWORK', 'Complete benefits enrollment', 'Enroll in health insurance, retirement plans, and other benefits', 'HR', 'HIGH', 2),
('HR_PAPERWORK', 'Tax form completion (I-9, W-4)', 'Complete tax identification and payroll forms', 'HR', 'HIGH', 1),
('TRAINING', 'Complete company onboarding module', 'Complete online onboarding course and policy training', 'Training', 'MEDIUM', 3),
('TRAINING', 'Complete role-specific training', 'Complete training specific to job role and responsibilities', 'Training', 'MEDIUM', 8),
('DEPARTMENT_ORIENTATION', 'Schedule one-on-one with manager', 'Initial meeting to discuss role and expectations', 'Department', 'HIGH', 1),
('DEPARTMENT_ORIENTATION', 'Meet team members', 'Introductions and informal meetings with team members', 'Department', 'MEDIUM', 2),
('DEPARTMENT_ORIENTATION', 'Office tour and facilities', 'Tour of office, explained facilities and amenities', 'Department', 'LOW', 1);

-- Insert default agent configurations
INSERT INTO ai_agent_config (agent_type, enabled, delay_threshold_hours, auto_escalate, auto_reassign, groq_model, max_tokens, temperature, notes)
VALUES
  ('TASK_AGENT', TRUE, 24, FALSE, FALSE, 'mixtral-8x7b-32768', 1024, 0.7, 'Generates comprehensive task lists for new employees'),
  ('EXECUTION_AGENT', TRUE, 24, FALSE, FALSE, 'mixtral-8x7b-32768', 1024, 0.5, 'Intelligently assigns tasks to team members'),
  ('MONITORING_AGENT', TRUE, 24, TRUE, FALSE, 'mixtral-8x7b-32768', 512, 0.3, 'Monitors task status and detects delays'),
  ('DECISION_AGENT', TRUE, 24, TRUE, TRUE, 'mixtral-8x7b-32768', 1024, 0.6, 'Makes escalation and reassignment decisions')
ON DUPLICATE KEY UPDATE enabled = VALUES(enabled);

-- Create additional indexes for performance
CREATE INDEX idx_task_employee_type ON tasks(employee_id, task_type);
CREATE INDEX idx_assignment_date ON task_assignments(assignment_date);
CREATE INDEX idx_employee_department ON employees(department);
