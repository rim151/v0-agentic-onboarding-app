# Quick Start Guide - Employee Onboarding AI System

## Prerequisites

- Node.js 18+ installed
- MySQL database running
- Groq API key from https://console.groq.com/keys

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# MySQL must be running
mysql -u root -p < scripts/create-tables.sql
```

### Step 3: Configure Environment
Create `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_onboarding
```

### Step 4: Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 and you'll be redirected to the dashboard.

## Using the System

### Add Your First Employee
1. Go to **Employees** page
2. Click **"Add Employee"** button
3. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Email: john@company.com
   - Department: Engineering
   - Position: Senior Engineer
   - Start Date: Today
4. Submit - **Task Agent automatically generates onboarding tasks!**

### View Generated Tasks
1. Go to **Onboarding** page
2. Select the employee you just added
3. See all auto-generated tasks with:
   - Task type (IT Setup, HR, Training, etc.)
   - Due dates (calculated from start date)
   - Priority levels
   - Current status

### Monitor Progress
1. Go to **Dashboard**
2. See real-time statistics:
   - Total employees
   - Active onboarding
   - Tasks at risk
   - Delays detected
3. System automatically detects delays after 24 hours overdue

### View AI Decisions
1. Go to **Audit Logs**
2. See all AI agent activity:
   - What agent made the decision
   - Why it made that decision (reasoning)
   - Success/failure status
   - Token usage
3. Filter by agent type or action type

## System Flow

```
New Employee Added
    ↓
Task Agent generates comprehensive task list
    ↓
Execution Agent assigns tasks to team members
    ↓
Monitoring Agent checks progress every 15 min
    ↓
If delays detected (24h+ overdue)...
    ↓
Decision Agent decides: escalate/reassign/extend
    ↓
All decisions logged in Audit Trail
```

## Configuration (Optional)

Go to **Settings** page to:
- Enable/disable individual agents
- Adjust Groq model temperature (0.3 = focused, 0.7 = creative)
- Change delay detection threshold (default 24 hours)
- Toggle auto-escalation and auto-reassignment

## AI Agents Overview

| Agent | Role | Trigger | Model |
|-------|------|---------|-------|
| **Task Agent** | Generate task lists | Employee added | Mixtral 8x7B @ 0.7 |
| **Execution Agent** | Assign tasks intelligently | After task generation | Mixtral 8x7B @ 0.5 |
| **Monitoring Agent** | Detect delays | Every 15 minutes | Mixtral 8x7B @ 0.3 |
| **Decision Agent** | Handle escalations | Delay detected | Mixtral 8x7B @ 0.6 |

## Key Features

✨ **Auto Task Generation** - Creates appropriate tasks based on role/department
✨ **Smart Assignment** - Considers skills, availability, expertise
✨ **Delay Detection** - Automatically flags overdue tasks
✨ **Intelligent Escalation** - AI decides best course of action
✨ **Complete Audit Trail** - Every decision logged with reasoning
✨ **Professional UI** - Navy/Slate/Teal enterprise theme

## Troubleshooting

### "No employees found"
- Navigate to Employees page
- Click "Add Employee" to create your first employee

### "GROQ_API_KEY not set"
- Check .env.local file
- Restart dev server after changes: `npm run dev`

### Database connection error
- Verify MySQL is running
- Check credentials in .env.local
- Ensure database `employee_onboarding` exists

### Tasks not generating
- Check Audit Logs page for error details
- Verify employee has all required fields
- Check Groq API quota at console.groq.com

## Pages Overview

| Page | Purpose |
|------|---------|
| **/dashboard** | System overview, statistics, health status |
| **/employees** | Manage employee directory, add new employees |
| **/onboarding** | Track employee onboarding progress |
| **/tasks** | View all tasks across system |
| **/audit-logs** | Complete AI decision audit trail |
| **/settings** | Configure agents and system behavior |

## Example Workflow

1. **Monday Morning**: Add new engineer "Alice Smith"
   - Task Agent generates 15 onboarding tasks
   - Execution Agent assigns to IT, HR, and team leads
   - All tasks appear in Onboarding page

2. **Throughout Week**: Monitor progress
   - Dashboard shows which tasks are completed
   - Monitoring Agent watches for delays

3. **Friday**: Task becomes overdue
   - Monitoring Agent detects delay (24h threshold)
   - Decision Agent escalates to engineering manager
   - Audit Log shows decision and reasoning

4. **Next Week**: View decisions
   - Audit Logs shows all AI decisions
   - See exact reasoning for each escalation
   - Use insights to improve onboarding process

## API for Advanced Users

All endpoints available at:
- `/api/employees` - CRUD operations
- `/api/tasks` - Task management  
- `/api/assignments` - Assignment tracking
- `/api/audit-logs` - Decision logging
- `/api/agents/*` - Manual agent triggering

See `SYSTEM_GUIDE.md` for complete API documentation.

## Next Steps

1. ✅ Setup complete
2. ✅ Add first employee
3. ✅ View generated tasks
4. ✅ Monitor for 24+ hours to see delay detection in action
5. ✅ Check Audit Logs to understand AI reasoning
6. ✅ Customize settings for your organization

---

**Need Help?**
- Check SYSTEM_GUIDE.md for detailed documentation
- Review Audit Logs for error messages
- Verify environment variables are set correctly
