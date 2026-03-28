# Getting Started with OnboardAI

Your AI-powered employee onboarding system is ready to use. Follow this guide to get started in minutes.

---

## 📋 Pre-Requisites

- Supabase project created
- Database migrations executed
- Test user created (admin@company.com)

---

## 🚀 Step-by-Step Walkthrough

### Step 1: Create Admin User in Supabase (2 min)

See `QUICK_LOGIN_GUIDE.md` for detailed instructions.

**Quick version:**
1. Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `admin@company.com`, Password: `12345`
4. Click "Create user"

### Step 2: Run Database Migrations (5 min)

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Click "New query"
4. Copy entire content from `/scripts/supabase-migrations.sql`
5. Paste into SQL Editor
6. Click "Run"
7. Wait for success message

### Step 3: Seed Admin Profile (2 min)

1. In SQL Editor, create new query
2. Copy this SQL:
```sql
INSERT INTO public.profiles (id, first_name, last_name, is_admin, created_at)
SELECT id, 'Admin', 'User', true, now()
FROM auth.users
WHERE email = 'admin@company.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```
3. Click "Run"

### Step 4: Install Dependencies (3 min)

```bash
cd your-project
npm install
```

### Step 5: Add Environment Variables (2 min)

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase Dashboard → Settings → API

### Step 6: Start the Application (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🎯 First Time User Experience

### 1. Splash Screen (5 seconds)
- See OnboardAI logo
- Read tagline: "Intelligent Employee Onboarding, Powered by AI Agents"
- App auto-loads

### 2. Login Page
- Enter `admin@company.com`
- Enter `12345`
- Click "Sign In"

### 3. Dashboard
- See overview statistics
- View employee count, onboarding status
- Check task completion rates
- Monitor AI agent activity

---

## 👥 Adding Your First Employee

### Quick Demo (2 min)

1. Click **Employees** in sidebar (or hamburger menu)
2. Click **Add Employee** button
3. Fill in form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@company.com`
   - Department: `Engineering`
   - Position: `Software Engineer`
   - Start Date: `Today`
4. Click **Create Employee**
5. AI Task Agent automatically generates 15+ onboarding tasks!

### What Happens Next

1. **Task Agent** creates comprehensive task list
2. **Execution Agent** assigns tasks to available team members
3. **Monitoring Agent** watches task progress
4. **Decision Agent** escalates delayed tasks
5. **Audit Log** records every AI decision

---

## 📊 Exploring the Dashboard

### Employees Section
- View all employees
- Filter by onboarding status
- Add new employees
- Click employee to view details

### Onboarding Section
- Track individual employee progress
- See assigned tasks
- Update task status
- Mark tasks complete

### Tasks Section
- View all tasks system-wide
- Filter by type, status, priority
- See task assignments
- Track due dates

### Audit Logs Section
- View every AI decision
- See agent reasoning
- Filter by agent type
- Track system decisions

### Settings Section
- Configure agent parameters
- Adjust delay thresholds
- Enable/disable agents
- Set escalation rules

---

## 🤖 Understanding the Multi-Agent System

### Task Agent
**Role:** Generate comprehensive task lists
**Triggers:** When new employee is added
**Output:** 15+ tasks covering IT, HR, Training, Department Orientation

### Execution Agent
**Role:** Intelligently assign tasks
**Logic:** Considers skills, availability, experience
**Output:** Task assignments with confidence scores

### Monitoring Agent
**Role:** Track task progress in real-time
**Triggers:** Runs every hour (configurable)
**Output:** Identifies at-risk and delayed tasks

### Decision Agent
**Role:** Make escalation decisions
**Triggers:** When task exceeds 24-hour threshold
**Output:** Escalation notices, reassignments, notifications

---

## 📈 Key Features

✅ **AI-Powered Task Generation**
- Automatically creates comprehensive task lists
- Uses Groq LLM for intelligent reasoning
- Customizable task templates

✅ **Smart Task Assignment**
- AI considers multiple factors
- Optimizes workload distribution
- Tracks assignment history

✅ **Real-Time Monitoring**
- Continuous task status tracking
- Automatic delay detection
- Performance alerts

✅ **Intelligent Escalation**
- AI makes escalation decisions
- Auto-reassignment capabilities
- Complete audit trail

✅ **Complete Audit Trail**
- Every AI decision is logged
- Full reasoning available
- Compliance-ready reporting

---

## 🔐 Security Features

- Row Level Security on all tables
- Admin-only sensitive operations
- Secure authentication via Supabase
- Complete decision audit trail
- Token-based session management

---

## 🐛 Troubleshooting

### App won't load
- Check `.env.local` has correct Supabase credentials
- Verify database migrations completed
- Check browser console for errors

### Login fails
- Ensure admin user exists in Supabase Auth
- Check email is exactly: `admin@company.com`
- Verify password is: `12345`

### Can't add employees
- Make sure you're logged in as admin
- Check "Employees" page loads
- Verify database tables exist

### Tasks not appearing
- Run the migration scripts again
- Check database connection
- Verify auth user has correct profile

### Sidebar stuck open
- Click hamburger menu to toggle
- Refresh page
- Check browser console

---

## 📚 Additional Resources

- `SUPABASE_SETUP.md` - Detailed Supabase configuration
- `QUICK_LOGIN_GUIDE.md` - Login troubleshooting
- `SUPABASE_INTEGRATION_COMPLETE.md` - Full implementation details
- `README_SUPABASE_READY.md` - Project overview

---

## 🎉 You're Ready!

Your OnboardAI system is now live. Start by:

1. **Login** with admin@company.com / 12345
2. **Add an employee** to see AI in action
3. **Watch the magic** as tasks are generated
4. **Monitor progress** on the dashboard

Questions? Check the troubleshooting section or review the detailed documentation files.

Happy onboarding! 🚀
