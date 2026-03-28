-- Seed test user for OnboardAI application
-- Email: admin@company.com
-- Password: 12345
-- This script should be run AFTER the migration scripts

-- Note: In Supabase, you need to create users through the Auth UI or API
-- For development, use the Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user"
-- 3. Email: admin@company.com
-- 4. Password: 12345
-- 5. Click "Create user"

-- Then run this SQL to set admin profile:
INSERT INTO public.profiles (id, first_name, last_name, is_admin, created_at)
SELECT id, 'Admin', 'User', true, now()
FROM auth.users
WHERE email = 'admin@company.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
