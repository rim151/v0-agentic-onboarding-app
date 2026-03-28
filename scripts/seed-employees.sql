-- Seed sample employees
INSERT INTO employees (first_name, last_name, email, department, position, role_type, onboarding_status, start_date) VALUES
('John', 'Smith', 'john.smith@company.com', 'Engineering', 'Senior Software Engineer', 'Custom', 'in_progress', '2024-03-28'),
('Sarah', 'Johnson', 'sarah.johnson@company.com', 'Product', 'Product Manager', 'Custom', 'in_progress', '2024-03-27'),
('Michael', 'Brown', 'michael.brown@company.com', 'Engineering', 'Frontend Developer', 'Custom', 'in_progress', '2024-03-26'),
('Emily', 'Davis', 'emily.davis@company.com', 'Marketing', 'Marketing Manager', 'Custom', 'in_progress', '2024-03-25'),
('David', 'Wilson', 'david.wilson@company.com', 'Sales', 'Sales Executive', 'Custom', 'in_progress', '2024-03-24');

-- Insert sample tasks for John Smith
INSERT INTO tasks (employee_id, task_type, title, description, priority, status, due_date, generated_by_agent, agent_reasoning) VALUES
((SELECT id FROM employees WHERE email = 'john.smith@company.com'), 'IT_SETUP', 'Set up laptop and email', 'Provision company laptop with necessary software and create email account', 'HIGH', 'in_progress', NOW() + INTERVAL 2 DAY, 'TASK_AGENT', 'New engineer requires immediate IT setup'),
((SELECT id FROM employees WHERE email = 'john.smith@company.com'), 'TRAINING', 'Complete company onboarding module', 'Complete the online company orientation and policies training', 'HIGH', 'pending', NOW() + INTERVAL 3 DAY, 'TASK_AGENT', 'Mandatory training for all new employees'),
((SELECT id FROM employees WHERE email = 'john.smith@company.com'), 'HR_PAPERWORK', 'Complete employment contract', 'Review and sign employment contract and related documents', 'HIGH', 'pending', NOW() + INTERVAL 1 DAY, 'TASK_AGENT', 'Required before employee starts work'),
((SELECT id FROM employees WHERE email = 'john.smith@company.com'), 'DEPARTMENT_ORIENTATION', 'Meet with team lead', 'Initial meeting with team lead to discuss role and expectations', 'HIGH', 'pending', NOW() + INTERVAL 1 DAY, 'TASK_AGENT', 'Manager introduction is priority task');

-- Insert sample tasks for Sarah Johnson
INSERT INTO tasks (employee_id, task_type, title, description, priority, status, due_date, generated_by_agent, agent_reasoning) VALUES
((SELECT id FROM employees WHERE email = 'sarah.johnson@company.com'), 'HR_PAPERWORK', 'Benefits enrollment', 'Enroll in health insurance and retirement plans', 'HIGH', 'pending', NOW() + INTERVAL 2 DAY, 'TASK_AGENT', 'Benefits enrollment window for new hires'),
((SELECT id FROM employees WHERE email = 'sarah.johnson@company.com'), 'TRAINING', 'Product training bootcamp', 'Complete 3-day product training program', 'MEDIUM', 'pending', NOW() + INTERVAL 5 DAY, 'TASK_AGENT', 'Essential training for product management role'),
((SELECT id FROM employees WHERE email = 'sarah.johnson@company.com'), 'DEPARTMENT_ORIENTATION', 'Team introduction meeting', 'Meet with product team members and other departments', 'MEDIUM', 'pending', NOW() + INTERVAL 2 DAY, 'TASK_AGENT', 'Cross-functional relationship building');

-- Insert sample tasks for Michael Brown
INSERT INTO tasks (employee_id, task_type, title, description, priority, status, due_date, generated_by_agent, agent_reasoning) VALUES
((SELECT id FROM employees WHERE email = 'michael.brown@company.com'), 'IT_SETUP', 'Developer environment setup', 'Set up development tools, Git access, and IDE configuration', 'HIGH', 'in_progress', NOW() + INTERVAL 1 DAY, 'TASK_AGENT', 'Critical for developer productivity'),
((SELECT id FROM employees WHERE email = 'michael.brown@company.com'), 'TRAINING', 'Codebase and architecture overview', 'Learn the company codebase structure and architectural patterns', 'HIGH', 'pending', NOW() + INTERVAL 3 DAY, 'TASK_AGENT', 'Must understand tech stack before contributing'),
((SELECT id FROM employees WHERE email = 'michael.brown@company.com'), 'TRAINING', 'Frontend best practices training', 'Learn company frontend standards and practices', 'MEDIUM', 'pending', NOW() + INTERVAL 5 DAY, 'TASK_AGENT', 'Team-specific training for consistency');

-- Insert sample task assignments
INSERT INTO task_assignments (task_id, assigned_to, status, notes) VALUES
((SELECT id FROM tasks WHERE employee_id = (SELECT id FROM employees WHERE email = 'john.smith@company.com') AND title = 'Set up laptop and email' LIMIT 1), 
 (SELECT id FROM employees WHERE department = 'Engineering' LIMIT 1), 
 'in_progress', 'Ordered laptop, email setup in progress');
