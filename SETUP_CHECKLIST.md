# Setup Checklist - Employee Onboarding AI System

Complete these steps in order to get your system running.

## Pre-Requisites
- [ ] Node.js 18+ installed
- [ ] MySQL database installed and running
- [ ] Groq API key obtained from https://console.groq.com/keys

## Installation

- [ ] Clone/download the project
- [ ] Run `npm install` to install all dependencies
- [ ] Verify installation: `npm list groq-sdk mysql2` should show both packages

## Database Setup

- [ ] MySQL is running locally or accessible remotely
- [ ] Run: `mysql -u root -p < scripts/create-tables.sql`
- [ ] Verify tables created: `mysql -u root -p employee_onboarding -e "SHOW TABLES;"`
- [ ] Should show: employees, tasks, task_assignments, task_delays, audit_logs, etc.

## Environment Configuration

- [ ] Create `.env.local` file in project root
- [ ] Add these 5 environment variables:
  ```
  GROQ_API_KEY=your_groq_api_key_here
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=employee_onboarding
  ```
- [ ] Verify variables are correct before starting server
- [ ] Never commit .env.local to version control

## Application Startup

- [ ] Run `npm run dev` to start development server
- [ ] Server should start on http://localhost:3000
- [ ] Open browser and navigate to http://localhost:3000
- [ ] Should redirect to http://localhost:3000/dashboard
- [ ] Dashboard loads without errors

## Verify All Components

### Dashboard
- [ ] Dashboard page loads
- [ ] Shows "Total Employees: 0" (no employees yet)
- [ ] Shows system health indicators

### Employees
- [ ] Navigate to /employees page
- [ ] "Add Employee" button visible
- [ ] Employee list is empty (table headers visible)

### Add Employee Test
- [ ] Click "Add Employee"
- [ ] Dialog appears with form
- [ ] Fill in test data:
  - First Name: John
  - Last Name: Doe
  - Email: john@company.com
  - Department: Engineering
  - Position: Senior Engineer
  - Start Date: Today
- [ ] Click "Add Employee"
- [ ] Success notification appears
- [ ] Employee appears in list

### Task Generation
- [ ] Go to Onboarding page
- [ ] Select John Doe from dropdown
- [ ] Tasks appear in list (should have 10-15 auto-generated tasks)
- [ ] Tasks have types: IT_SETUP, HR_PAPERWORK, TRAINING, DEPARTMENT_ORIENTATION
- [ ] Each task has a due date
- [ ] Each task has a priority level

### Audit Logs
- [ ] Navigate to /audit-logs page
- [ ] See entries for Task Agent execution
- [ ] See entries for Execution Agent execution (task assignments)
- [ ] Each log entry shows:
  - Agent name
  - Action type
  - Description
  - Status (success/failure)
  - Timestamp
  - Reasoning (for AI decisions)

### Settings
- [ ] Navigate to /settings page
- [ ] See agent configuration options
- [ ] See toggles for enabling/disabling agents
- [ ] See temperature and model settings

### Dashboard Update
- [ ] Go back to /dashboard
- [ ] Should now show:
  - Total Employees: 1
  - Active Onboarding: 1
  - Tasks completed: 0 (all pending/in progress)

## Extended Verification

### Database Queries (Optional)
Open MySQL and verify data:
```sql
mysql -u root -p employee_onboarding

-- Check employees
SELECT COUNT(*) FROM employees;  -- Should show 1

-- Check tasks generated
SELECT COUNT(*) FROM tasks;  -- Should show 10+

-- Check assignments
SELECT COUNT(*) FROM task_assignments;  -- Should show 10+

-- Check audit logs
SELECT COUNT(*) FROM audit_logs;  -- Should show multiple entries

-- View audit log details
SELECT agent_name, action_type, description, result_status FROM audit_logs ORDER BY created_at DESC LIMIT 5;
```

### Agent Performance
- [ ] Task Agent successfully generated tasks (check audit logs)
- [ ] Execution Agent assigned tasks (check audit logs)
- [ ] Response times are fast (<1 second per agent)
- [ ] No errors in console or audit logs

## Groq Integration Verification

- [ ] API key is valid (no 401 errors in logs)
- [ ] Groq model responds correctly (check audit logs)
- [ ] Token usage is tracked (visible in audit logs)
- [ ] Temperature settings are applied per agent

## Production Preparation

- [ ] Environment variables configured for production
- [ ] Database has appropriate backups set up
- [ ] Error handling is in place
- [ ] Audit logs are being collected
- [ ] Groq API quota is sufficient for expected load

## Feature Testing (Optional)

- [ ] Add multiple employees and verify task generation for each
- [ ] Test filters in audit logs (by agent type, action type)
- [ ] Test search functionality in employees and audit logs
- [ ] Verify responsive design on mobile
- [ ] Test navigation between pages
- [ ] Verify logout functionality

## Deployment Checklist (If Deploying)

- [ ] All environment variables configured in deployment platform
- [ ] Database is accessible from deployment environment
- [ ] npm build completes without errors: `npm run build`
- [ ] Preview/staging environment tested
- [ ] Production domain configured
- [ ] SSL/TLS certificate configured
- [ ] Error logging configured
- [ ] Monitoring set up for production

## Common Issues & Solutions

### Issue: "GROQ_API_KEY not set"
- **Solution**: Check .env.local file exists and is in project root
- Restart dev server after adding/changing .env.local

### Issue: Database connection failed
- **Solution**: Verify MySQL is running
- Check credentials in .env.local match your MySQL setup
- Ensure database `employee_onboarding` exists

### Issue: Tasks not generating
- **Solution**: Check Audit Logs page for errors
- Verify employee has all required fields
- Check Groq API quota at https://console.groq.com/

### Issue: "Cannot find module 'groq-sdk'"
- **Solution**: Run `npm install` again
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Success Criteria

Your system is ready for use when:
- ✅ Dashboard loads without errors
- ✅ Can add employees
- ✅ Tasks automatically generate for new employees
- ✅ Audit logs show all agent decisions
- ✅ No error messages in browser console
- ✅ Database contains employee and task data
- ✅ Groq API is responding (check audit logs)
- ✅ All 4 agents show activity in audit logs

## Next Steps

1. ✅ Review QUICKSTART.md for basic usage
2. ✅ Review SYSTEM_GUIDE.md for detailed documentation
3. ✅ Test with real employee onboarding workflow
4. ✅ Monitor audit logs to understand AI decisions
5. ✅ Customize agent settings for your organization
6. ✅ Set up automated monitoring/alerts if needed

## Support

Refer to:
- **QUICKSTART.md** - Get running in 5 minutes
- **SYSTEM_GUIDE.md** - Complete system documentation
- **Audit Logs Page** - Real-time error messages and reasoning
- **Console** - Node.js console for debug information

---

**Status**: Ready to use once all checks are complete ✓
