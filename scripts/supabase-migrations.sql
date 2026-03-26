-- Employee Onboarding System - Supabase PostgreSQL Schema
-- Run these migrations in Supabase SQL Editor

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- 2. Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  role_type TEXT CHECK (role_type IN ('IT', 'HR', 'Training', 'Department', 'Custom')) DEFAULT 'Custom',
  onboarding_status TEXT CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_select_own_or_managed" ON public.employees FOR SELECT USING (
  auth.uid() = user_id 
  OR manager_id = (SELECT user_id FROM public.employees WHERE id = auth.uid() LIMIT 1)
  OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "employees_insert_admin" ON public.employees FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "employees_update_own_or_admin" ON public.employees FOR UPDATE USING (
  auth.uid() = user_id 
  OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 3. Create task templates table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL CHECK (task_type IN ('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  estimated_hours INT DEFAULT 4,
  template_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_templates_select_all" ON public.task_templates FOR SELECT USING (TRUE);
CREATE POLICY "task_templates_insert_admin" ON public.task_templates FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 4. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('IT_SETUP', 'HR_PAPERWORK', 'TRAINING', 'DEPARTMENT_ORIENTATION', 'CUSTOM')),
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'escalated')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  generated_by_agent TEXT,
  agent_reasoning TEXT
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own_employee" ON public.tasks FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "tasks_insert_admin" ON public.tasks FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "tasks_update_admin" ON public.tasks FOR UPDATE USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 5. Create task assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'reassigned', 'escalated')),
  is_delayed BOOLEAN DEFAULT FALSE,
  delay_escalated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_select_own" ON public.task_assignments FOR SELECT USING (
  assigned_to IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "assignments_update_admin" ON public.task_assignments FOR UPDATE USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 6. Create task delays table
CREATE TABLE IF NOT EXISTS public.task_delays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_assignment_id UUID NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
  delay_detected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  hours_overdue INT DEFAULT 0,
  delay_reason TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  escalation_level TEXT DEFAULT 'manager' CHECK (escalation_level IN ('manager', 'department_head', 'executive')),
  escalated_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reassigned BOOLEAN DEFAULT FALSE,
  reassigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.task_delays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delays_select_admin" ON public.task_delays FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 7. Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('TASK_AGENT', 'EXECUTION_AGENT', 'MONITORING_AGENT', 'DECISION_AGENT')),
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  parameters JSONB,
  result_status TEXT DEFAULT 'success' CHECK (result_status IN ('success', 'failure', 'partial')),
  error_message TEXT,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.task_assignments(id) ON DELETE SET NULL,
  delay_id UUID REFERENCES public.task_delays(id) ON DELETE SET NULL,
  groq_response JSONB,
  groq_model TEXT,
  groq_prompt_tokens INT,
  groq_completion_tokens INT,
  execution_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "audit_logs_insert_admin" ON public.audit_logs FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 8. Create function to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Create indexes for performance
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_status ON public.employees(onboarding_status);
CREATE INDEX idx_tasks_employee ON public.tasks(employee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_assignments_assigned_to ON public.task_assignments(assigned_to);
CREATE INDEX idx_assignments_status ON public.task_assignments(status);
CREATE INDEX idx_delays_resolved ON public.task_delays(resolved);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

-- 10. Insert default task templates
INSERT INTO public.task_templates (task_type, title, description, category, priority, estimated_hours) VALUES
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
('DEPARTMENT_ORIENTATION', 'Office tour and facilities', 'Tour of office, explained facilities and amenities', 'Department', 'LOW', 1)
ON CONFLICT DO NOTHING;
