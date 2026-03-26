# Supabase Integration Setup Guide

## Overview

This application uses Supabase for authentication and database management. Supabase provides PostgreSQL with built-in authentication, row-level security (RLS), and real-time capabilities.

## Step 1: Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or use an existing one
3. Note your project URL and anon/public key from the API settings

## Step 2: Run Migrations

1. In the Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `/scripts/supabase-migrations.sql`
3. Create a new SQL query and paste the entire content
4. Execute the query

This will create all required tables with proper RLS policies:
- `profiles` - User profiles
- `employees` - Employee information
- `task_templates` - Predefined task templates
- `tasks` - Onboarding tasks for employees
- `task_assignments` - Task assignments to team members
- `task_delays` - Track delayed tasks
- `audit_logs` - AI agent decision audit trail

## Step 3: Environment Variables

The following environment variables are automatically set by Vercel when you connect Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Verify these are set in your Vercel project settings under **Settings > Environment Variables**.

## Step 4: Create Admin User

1. Go to **Authentication > Users** in Supabase
2. Click **Add user** and create an admin account
3. After user creation, go to **SQL Editor** and run:

```sql
UPDATE public.profiles SET is_admin = TRUE WHERE id = '<user_id>';
```

Replace `<user_id>` with the user's UUID from the auth.users table.

## Step 5: Update Signup Page

The signup page redirects to `/auth/sign-up-success`. You can customize this by updating the `emailRedirectTo` in `/app/auth/signup/page.tsx`.

## Authentication Flow

1. **Login** (`/auth/login`) - Enter email and password
2. **Sign Up** (`/auth/signup`) - Create a new account
3. **Confirmation** - Supabase sends a confirmation email by default
4. **Dashboard** (`/dashboard`) - After login, users are redirected here

## Database Structure

### Tables and Policies

All tables have Row Level Security (RLS) enabled:

- **profiles**: Users can only view/edit their own profile. Admins can view all.
- **employees**: Users can view themselves and employees they manage. Admins can view all.
- **tasks**: Users see tasks for employees they manage. Admins see all.
- **task_assignments**: Users see assignments for themselves. Admins see all.
- **task_delays**: Only admins can view.
- **audit_logs**: Only admins can view.

### Key Fields

**employees**
- `user_id` - Links to auth.users(id)
- `onboarding_status` - 'not_started', 'in_progress', 'completed'
- `role_type` - 'IT', 'HR', 'Training', 'Department', 'Custom'

**tasks**
- `status` - 'pending', 'in_progress', 'completed', 'blocked', 'escalated'
- `priority` - 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
- `generated_by_agent` - Name of the AI agent that created it

**task_assignments**
- `status` - 'assigned', 'in_progress', 'completed', 'reassigned', 'escalated'
- `is_delayed` - Boolean flag for delay detection
- `delay_escalated` - Boolean flag for escalated delays

## API Integration

All API routes in `/app/api/` use Supabase for data access:

### Client vs Server

- **Server-side API routes** use `createClient()` from `@/lib/supabase/server`
- **Client-side components** use `createClient()` from `@/lib/supabase/client`

### Example API Call

```typescript
// Server-side API route
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*');

  return NextResponse.json({ data });
}
```

## Middleware

Supabase uses proxy.ts middleware to handle token refresh and session management. This is automatically set up in `/middleware.ts`.

## AI Agent Integration

The Groq AI agents integrate with Supabase to:

1. **Task Agent** - Generates tasks and stores them with `generated_by_agent` field
2. **Execution Agent** - Creates task assignments
3. **Monitoring Agent** - Detects delays and flags tasks
4. **Decision Agent** - Makes escalation decisions

All decisions are logged to `audit_logs` with full reasoning.

## Troubleshooting

### "Unauthorized" Errors

Make sure the user is authenticated:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // User not authenticated
}
```

### RLS Policy Errors

If you get "row level policy" errors, check:
1. User is authenticated
2. RLS policies allow the operation
3. User has necessary permissions (admin status)

### Email Confirmation Required

By default, Supabase requires email confirmation before users can interact with the database. To disable:

1. Go to **Authentication > Providers > Email**
2. Disable "Confirm email" option

⚠️ Only do this for development! Keep it enabled in production.

## Real-time Subscriptions (Optional)

To enable real-time updates, subscribe to table changes:

```typescript
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'tasks' },
    (payload) => console.log('New task:', payload)
  )
  .subscribe();
```

## Backup and Recovery

Supabase automatically backs up your database. To restore:

1. Go to **Project Settings > Backups**
2. Select a backup point
3. Click **Restore**

## Security Best Practices

1. ✅ Always use RLS policies
2. ✅ Use Supabase's built-in authentication
3. ✅ Validate user permissions in your RLS policies
4. ✅ Never expose service role key to client
5. ✅ Use parameterized queries (Supabase does this automatically)
6. ✅ Keep environment variables secret

## Support

- Supabase Docs: https://supabase.com/docs
- Discord Community: https://discord.supabase.io
- GitHub Issues: https://github.com/supabase/supabase/issues
