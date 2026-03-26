-- Employee Onboarding Database Schema

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  manager_id INT,
  start_date DATE NOT NULL,
  status ENUM('active', 'onboarding', 'completed') DEFAULT 'onboarding',
  onboarding_progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- Task Templates Table
CREATE TABLE IF NOT EXISTS task_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category ENUM('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM') NOT NULL,
  description TEXT,
  default_assignee VARCHAR(100),
  estimated_hours INT DEFAULT 2,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_template (name, category)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  template_id INT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category ENUM('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM') NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'delayed', 'escalated') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_to VARCHAR(100),
  due_date DATETIME NOT NULL,
  completed_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES task_templates(id) ON DELETE SET NULL,
  INDEX idx_employee (employee_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- Task Assignments Table (for tracking task transitions)
CREATE TABLE IF NOT EXISTS task_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  assigned_from VARCHAR(100),
  assigned_to VARCHAR(100),
  assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  assignment_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task (task_id)
);

-- Task Delays Table (for tracking delay events)
CREATE TABLE IF NOT EXISTS task_delays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  delay_detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  hours_overdue INT,
  delay_reason VARCHAR(255),
  action_taken VARCHAR(255),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_task (task_id),
  INDEX idx_resolved (resolved)
);

-- Audit Log Table (for tracking all AI decisions and system actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  description TEXT NOT NULL,
  decision_rationale TEXT,
  input_data JSON,
  output_data JSON,
  status VARCHAR(50) DEFAULT 'completed',
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'system',
  INDEX idx_agent (agent_name),
  INDEX idx_timestamp (timestamp),
  INDEX idx_entity (entity_type, entity_id)
);

-- AI Agent Configuration Table
CREATE TABLE IF NOT EXISTS ai_agent_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_name VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  last_run DATETIME,
  next_run DATETIME,
  config JSON,
  error_log TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Task Templates
INSERT INTO task_templates (name, category, description, default_assignee, estimated_hours, priority) VALUES
('Setup Laptop', 'IT_SETUP', 'Provision laptop and install required software', 'IT_TEAM', 4, 'high'),
('Email Account Setup', 'IT_SETUP', 'Create email account and configure email client', 'IT_TEAM', 2, 'high'),
('Network Access', 'IT_SETUP', 'Grant access to company network and systems', 'IT_TEAM', 2, 'high'),
('Employee Contract', 'HR_PAPERWORK', 'Complete employment contract paperwork', 'HR_TEAM', 2, 'high'),
('Benefits Enrollment', 'HR_PAPERWORK', 'Enroll employee in benefits program', 'HR_TEAM', 3, 'medium'),
('Tax Documents', 'HR_PAPERWORK', 'Collect tax forms and documentation', 'HR_TEAM', 1, 'high'),
('Compliance Training', 'TRAINING', 'Complete compliance and security training', 'TRAINING_TEAM', 4, 'high'),
('Department Training', 'TRAINING', 'Complete department-specific training', 'TRAINING_TEAM', 8, 'medium'),
('Meet Manager', 'DEPARTMENT_ORIENTATION', 'Meet with direct manager', 'MANAGER', 1, 'high'),
('Team Introduction', 'DEPARTMENT_ORIENTATION', 'Meet team members and colleagues', 'MANAGER', 2, 'medium'),
('Office Tour', 'DEPARTMENT_ORIENTATION', 'Complete office tour and orientation', 'ADMIN_TEAM', 1, 'low'),
('Security Badge', 'DEPARTMENT_ORIENTATION', 'Issue security badge and access card', 'ADMIN_TEAM', 1, 'high');

-- Insert AI Agent Configuration
INSERT INTO ai_agent_config (agent_name, status, config) VALUES
('TaskGeneratorAgent', 'active', '{
  "provider": "groq",
  "model": "mixtral-8x7b-32768",
  "temperature": 0.3,
  "max_tokens": 1000,
  "run_interval_minutes": 60
}'),
('ExecutorAgent', 'active', '{
  "provider": "groq",
  "model": "mixtral-8x7b-32768",
  "temperature": 0.3,
  "max_tokens": 1000,
  "run_interval_minutes": 30
}'),
('MonitorAgent', 'active', '{
  "provider": "groq",
  "model": "mixtral-8x7b-32768",
  "temperature": 0.3,
  "max_tokens": 1500,
  "run_interval_minutes": 15
}'),
('DecisionAgent', 'active', '{
  "provider": "groq",
  "model": "mixtral-8x7b-32768",
  "temperature": 0.4,
  "max_tokens": 2000,
  "run_interval_minutes": 30,
  "delay_threshold_hours": 24
}');
