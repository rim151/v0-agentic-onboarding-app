# Quick Login Guide - Test Credentials

## Default Test Account

Use these credentials to access the OnboardAI dashboard immediately:

**Email:** `admin@company.com`  
**Password:** `12345`

---

## How to Set Up Test User

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click **Authentication** in the left sidebar
3. Click **Users** tab
4. Click **Add user** button
5. Enter:
   - Email: `admin@company.com`
   - Password: `12345`
   - Auto confirm user (toggle on)
6. Click **Create user**

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already done
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Create the user
supabase auth users create --email admin@company.com --password 12345
```

### Option 3: SQL Script (After User Creation)

Once the user exists in Supabase Auth, run this to make them admin:

```sql
-- Copy this to Supabase SQL Editor and run
INSERT INTO public.profiles (id, first_name, last_name, is_admin, created_at)
SELECT id, 'Admin', 'User', true, now()
FROM auth.users
WHERE email = 'admin@company.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

---

## Testing Flows

### Login Flow
1. Open app → See splash screen (5 seconds)
2. Login page appears
3. Enter `admin@company.com` and `12345`
4. Click **Sign In**
5. Redirected to **Dashboard**

### Sign Up Flow (Create New Account)
1. Open app → See splash screen (5 seconds)
2. Login page appears
3. Click **Create account** link
4. On signup page, enter:
   - Email: Any email (e.g., `user@company.com`)
   - Password: Any password (e.g., `12345`)
5. Click **Sign Up**
6. Confirm email (Supabase will send confirmation link)
7. After confirmation, you can login

---

## User Roles

The test admin account has these permissions:
- ✅ Can add new employees
- ✅ Can assign tasks
- ✅ Can view audit logs
- ✅ Can configure agents
- ✅ Can manage onboarding workflows

---

## Troubleshooting

### "Email already exists" error
- The user is already created in Supabase
- Just login with the credentials instead

### "Invalid login credentials" 
- Check the email is exactly: `admin@company.com`
- Check the password is exactly: `12345`
- Make sure user was confirmed in Supabase

### "User not found"
- Create the user in Supabase using one of the methods above

### Splash screen doesn't disappear
- Wait 5 seconds for the splash to auto-hide
- Or check browser console for JavaScript errors

---

## After Login

Once logged in, you'll see:
- **Dashboard** - Overview of onboarding system
- **Employees** - Add and manage employees
- **Onboarding** - Track employee progress
- **Tasks** - View all tasks
- **Audit Logs** - See AI agent decisions
- **Settings** - Configure agents

Click the hamburger menu (≡) to show/hide the sidebar.

---

## Additional Test Users (Optional)

You can create more users with different roles:

```sql
-- Manager role
INSERT INTO public.profiles (id, first_name, last_name, is_admin, created_at)
SELECT id, 'Manager', 'User', false, now()
FROM auth.users
WHERE email = 'manager@company.com'
ON CONFLICT (id) DO UPDATE SET is_admin = false;

-- Employee role
INSERT INTO public.profiles (id, first_name, last_name, is_admin, created_at)
SELECT id, 'Employee', 'User', false, now()
FROM auth.users
WHERE email = 'employee@company.com'
ON CONFLICT (id) DO UPDATE SET is_admin = false;
```

Then create these users in Supabase Auth:
- Email: `manager@company.com` | Password: `12345`
- Email: `employee@company.com` | Password: `12345`

---

## Important Notes

⚠️ **For Development Only**
- These are test credentials for development/demo
- Never use simple passwords like "12345" in production
- Always use Supabase's password reset for real users

🔐 **Security**
- Passwords are hashed by Supabase Auth
- Sessions are secure and httpOnly
- Row Level Security protects all data
