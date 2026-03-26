# Employee Onboarding AI System - Implementation Guide

## Overview

This is a complete multi-agent AI-powered employee onboarding system built with Next.js, Node.js backend, MySQL database, and Groq AI integration. The system features 4 specialized AI agents that work together to automate and optimize the employee onboarding process.

## Tech Stack

- **Frontend**: React.js with Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **AI Engine**: Groq (Mixtral 8x7B model)
- **Styling**: Tailwind CSS with professional Navy/Slate/Teal theme
- **UI Components**: shadcn/ui

## Color Theme

Professional 3-color theme:
- **Primary (Navy)**: #1E3A8A - Deep professional blue for trust and stability
- **Secondary (Slate)**: #64748B - Neutral gray for balance
- **Accent (Teal)**: #0891B2 - Vibrant teal for progress and energy

## Multi-Agent System

### 1. Task Agent (TASK_AGENT)
- **Purpose**: Generates comprehensive onboarding task lists for new employees
- **Trigger**: When a new employee is added to the system
- **Output**: Structured list of tasks across 5 categories:
  - IT Setup (laptop, email, VPN, tools access)
  - HR Paperwork (contracts, benefits, tax forms)
  - Training (onboarding modules, role-specific training)
  - Department Orientation (team meetings, introductions)
  - Custom tasks (user-defined requirements)
- **Model**: Mixtral 8x7B via Groq
- **Temperature**: 0.7 (balanced creativity)

### 2. Execution Agent (EXECUTION_AGENT)
- **Purpose**: Intelligently assigns tasks to team members
- **Trigger**: After tasks are generated
- **Decision Factors**:
  - Task type and skill requirements
  - Assignee current workload
  - Department expertise
  - Team structure
- **Model**: Mixtral 8x7B via Groq
- **Temperature**: 0.5 (more deterministic)

### 3. Monitoring Agent (MONITORING_AGENT)
- **Purpose**: Continuously monitors task status and detects delays
- **Frequency**: Periodic checks (every 15 minutes recommended)
- **Detection Method**: Compares due dates against current time
- **Delay Threshold**: Global 24-hour setting
- **Actions**: Flags tasks at risk and creates delay records
- **Model**: Mixtral 8x7B via Groq
- **Temperature**: 0.3 (focused, deterministic)

### 4. Decision Agent (DECISION_AGENT)
- **Purpose**: Makes intelligent decisions about delay management
- **Trigger**: When monitoring agent detects delays
- **Decision Options**:
  - **Escalate**: Move to manager/department head/executive
  - **Reassign**: Move task to different team member
  - **Extend Deadline**: Provide additional time
  - **Provide Support**: Identify blockers and solutions
- **Reasoning**: Detailed explanation of each decision
- **Model**: Mixtral 8x7B via Groq
- **Temperature**: 0.6 (balanced reasoning)

## Database Schema

### Core Tables

#### `employees`
```sql
- id: INT (primary key)
- first_name, last_name: VARCHAR
- email: VARCHAR (unique)
- department, position: VARCHAR
- manager_id: INT (foreign key, self-referencing)
- onboarding_status: ENUM (not_started, in_progress, completed)
- start_date: DATE
- created_at, updated_at: TIMESTAMP
```

#### `task_templates`
Predefined task templates for common onboarding activities

#### `tasks`
Instances of tasks created for specific employees
```sql
- employee_id: INT (foreign key)
- task_type: ENUM (IT_SETUP, HR_PAPERWORK, TRAINING, DEPARTMENT_ORIENTATION, CUSTOM)
- status: ENUM (pending, in_progress, completed, blocked, escalated)
- priority: ENUM (LOW, MEDIUM, HIGH, URGENT)
- due_date: DATETIME
- generated_by_agent: VARCHAR (which agent created it)
- agent_reasoning: TEXT (why it was created)
```

#### `task_assignments`
Maps tasks to assignees
```sql
- task_id, assigned_to: INT (foreign keys)
- status: ENUM (assigned, in_progress, completed, reassigned, escalated)
- is_delayed, delay_escalated: BOOLEAN
- start_date, completion_date: DATETIME
```

#### `task_delays`
Tracks detected delays and escalation history
```sql
- task_assignment_id: INT (foreign key)
- hours_overdue: INT
- escalated, reassigned, resolved: BOOLEAN
- escalated_to, reassigned_to: INT (foreign keys)
- resolution_notes: TEXT
```

#### `audit_logs`
Comprehensive audit trail of all AI decisions
```sql
- agent_type: ENUM (TASK_AGENT, EXECUTION_AGENT, MONITORING_AGENT, DECISION_AGENT)
- action_type: VARCHAR (GENERATE_TASKS, ASSIGN_TASK, UPDATE_TASK_STATUS, DETECT_DELAY, ESCALATE_TASK)
- description, reasoning: TEXT
- parameters, groq_response: JSON
- result_status: ENUM (success, failure, partial)
- execution_time_ms, groq_prompt_tokens, groq_completion_tokens: INT
- created_at: TIMESTAMP
```

#### `ai_agent_config`
Configuration for each agent
```sql
- agent_type: ENUM (TASK_AGENT, EXECUTION_AGENT, MONITORING_AGENT, DECISION_AGENT)
- enabled: BOOLEAN
- delay_threshold_hours: INT (default 24)
- auto_escalate, auto_reassign: BOOLEAN
- groq_model, max_tokens, temperature: config values
```

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee (triggers Task Agent)

### Tasks
- `GET /api/tasks?employeeId=X` - Get tasks for employee
- `POST /api/tasks` - Create manual task

### Task Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment

### Audit Logs
- `GET /api/audit-logs?agentType=X&actionType=Y` - Filter audit logs

### Agent Endpoints
- `POST /api/agents/task-agent` - Trigger task generation
- `POST /api/agents/execution-agent` - Trigger task assignment
- `POST /api/agents/monitoring-agent` - Trigger monitoring
- `POST /api/agents/decision-agent` - Process delays

## Pages

### Dashboard (`/dashboard`)
- Overview statistics
- Employee onboarding progress
- System health indicators
- Recent activity feed

### Employees (`/employees`)
- Employee list with search
- Add new employee dialog
- Status tracking per employee
- Department and role filtering

### Onboarding (`/onboarding`)
- Select employee to view details
- Task list with status indicators
- Progress tracking visualization
- Task status updates

### Tasks (`/tasks`)
- All tasks across system
- Filter by type, priority, status
- Task cards with details
- Due date indicators

### Audit Logs (`/audit-logs`)
- Complete decision audit trail
- Filter by agent, action type
- Detailed reasoning display
- Token usage tracking
- Error logging

### Settings (`/settings`)
- Agent configuration
- Enable/disable agents
- Model and temperature settings
- Delay threshold configuration
- System preferences

## Environment Variables

Required:
```
GROQ_API_KEY=your_groq_api_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_onboarding
```

## Setup Instructions

### 1. Database Setup
```sql
mysql -u root -p < scripts/create-tables.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
Create `.env.local`:
```
GROQ_API_KEY=your_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=employee_onboarding
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Workflow Example

1. **Employee Added** → Dashboard → "Add Employee"
   - Task Agent automatically generates tasks

2. **Tasks Created** → Execution Agent assigns them
   - Smart assignment based on skills/availability

3. **Monitoring Runs** → Monitoring Agent checks progress
   - Every 15 minutes by default
   - Flags any tasks nearing due date

4. **Delay Detected** → Decision Agent acts
   - Escalates or reassigns task
   - Documents decision with reasoning
   - Creates audit log entry

5. **Audit Trail** → View in /audit-logs
   - See all AI decisions
   - Understand reasoning behind each action
   - Track token usage and performance

## Delay Detection & Response

### Detection
- Runs periodically (configurable interval)
- Compares task due_date with current time
- Uses 24-hour global threshold
- Flags tasks overdue by 24+ hours

### Response
Decision Agent chooses from:
1. **Escalate**: Send to manager/department head for intervention
2. **Reassign**: Move to available team member with needed skills
3. **Extend**: Add days to deadline
4. **Support**: Identify blockers and provide solutions

### Reasoning
All decisions include:
- Why this action was chosen
- Risk assessment
- Success probability
- Supporting factors considered

## Key Features

✅ **Multi-Agent Orchestration**: 4 specialized AI agents with clear roles
✅ **Comprehensive Audit Trail**: Every AI decision is logged with reasoning
✅ **Automatic Task Generation**: Smart task lists based on role/department
✅ **Intelligent Assignment**: Considers skills, availability, expertise
✅ **Delay Detection**: 24-hour threshold with auto-escalation
✅ **Professional UI**: Navy/Slate/Teal theme with complete navigation
✅ **Real-time Monitoring**: Continuous task status tracking
✅ **Flexible Configuration**: Agent settings customizable per deployment
✅ **Error Handling**: Comprehensive error logging and recovery

## Performance Notes

- Groq Model: Mixtral 8x7B-32768 (fast inference)
- Average response time: <1 second per agent call
- Audit logs stored in DB for compliance
- Task monitoring every 15 minutes (configurable)
- Connection pooling for database efficiency

## Troubleshooting

### Agent Failures
Check `/audit-logs` for detailed error messages and agent reasoning

### Database Errors
Verify MySQL connection with credentials in `.env.local`

### Groq API Issues
Check GROQ_API_KEY and rate limits at console.groq.com

### Task Generation Issues
Ensure employee has all required fields (name, email, department, position)

## Future Enhancements

- Email notifications for delays
- Webhook integrations
- Advanced analytics dashboard
- Machine learning for prediction
- Multi-language support
- Mobile app
- Workflow customization UI
- Integration with HRIS systems

---

**System Built**: Multi-agent AI architecture with Groq, Next.js, and MySQL
**Last Updated**: 2024
**Support**: Full audit trail and comprehensive logging throughout system
