# Demo Mode Authentication - Complete Guide

## Overview
Your Employee Onboarding AI System now has **built-in demo mode** that works instantly without requiring Supabase setup. Users can log in, create accounts, and access the full dashboard immediately.

---

## Demo Credentials

```
📧 Email:    admin@company.com
🔑 Password: 12345
```

These credentials work for:
- ✅ **Login** - Direct access to dashboard
- ✅ **Sign Up** - Create account (same credentials)
- ✅ **Full Dashboard** - All features enabled

---

## How It Works

### Login Page
1. Visit login page
2. See demo credentials displayed in blue info box
3. Email field pre-filled: `admin@company.com`
4. Password field pre-filled: `12345`
5. Click "Sign In"
6. ✅ **Dashboard opens immediately**

### Sign Up Page
1. Visit sign up page
2. See green "Quick Start" button
3. Click button → Auto-fills demo credentials
4. Click "Create Account"
5. ✅ **Dashboard opens immediately**

### Manual Entry
1. Enter `admin@company.com` in email field
2. Enter `12345` in password field
3. Click submit
4. ✅ **Dashboard opens**

---

## What Gets Stored

When user logs in with demo credentials:
- Email stored in `localStorage` as `demo_auth_email`
- Token stored in `localStorage` as `demo_auth_token`
- Session persists across page refreshes
- Auto-redirects to dashboard on page load if logged in

---

## Code Implementation

### Key Files
- `/lib/demo-auth.ts` - Demo authentication utilities
- `/app/auth/login/page.tsx` - Login with demo support
- `/app/auth/signup/page.tsx` - Signup with demo support

### Demo Auth Functions
```typescript
// Check if credentials are valid
isDemoAuthValid('admin@company.com', '12345') // true

// Set demo session
setDemoAuth('admin@company.com', '12345')

// Check if logged in
isDemoLoggedIn() // true

// Get auth state
getDemoAuth() // { email, token }

// Clear session
clearDemoAuth()
```

---

## User Experience

### Login Flow
```
Splash Screen (5 sec)
    ↓
Login Page (Pre-filled Demo Credentials)
    ↓
Click "Sign In"
    ↓
✅ Dashboard
```

### Sign Up Flow
```
Splash Screen (5 sec)
    ↓
Sign Up Page (with Quick Start Button)
    ↓
Click "Use Demo: admin@company.com / 12345"
    ↓
Form Auto-Filled
    ↓
Click "Create Account"
    ↓
✅ Dashboard
```

---

## Features Enabled in Demo

With demo login, users can:
- ✅ View dashboard
- ✅ See employee list
- ✅ View onboarding progress
- ✅ Check audit logs
- ✅ Access settings
- ✅ Full sidebar navigation
- ✅ All admin features

---

## Error Handling

### Login Errors
- **Invalid Credentials** → Suggests demo: `admin@company.com / 12345`
- **Network Error** → Falls back to demo mode
- **Helpful Messages** → Clear guidance on what to try

### Sign Up Errors
- **Password Mismatch** → "Passwords do not match"
- **Too Short** → "Password must be at least 4 characters"
- **Already Registered** → Suggests demo account
- **Supabase Unavailable** → Demo mode works

---

## Fallback Logic

```
User Enters Credentials
    ↓
Check if = Demo Credentials (admin@company.com / 12345)
    ├─ YES → Login immediately ✅
    └─ NO → Try Supabase Auth
         ├─ Success → Dashboard
         └─ Failure → Suggest Demo Mode
```

---

## Testing Checklist

- [x] Login with demo credentials → Dashboard
- [x] Sign up with demo credentials → Dashboard
- [x] Click "Use Demo" button → Form auto-fills
- [x] Pre-filled email/password in login form
- [x] Demo info box displays correctly
- [x] Error messages suggest demo mode
- [x] Session persists on page refresh
- [x] Logout clears demo session
- [x] Non-demo credentials show helpful errors

---

## Production Notes

### For Deployment
1. Demo mode works offline or online
2. No database required for demo
3. All features available
4. Supabase optional for real users

### For Real Users
When Supabase is configured:
- Real users can create accounts
- Demo credentials still work
- Mix of demo + real users supported
- Demo only uses localStorage

### Security
- Demo credentials public (intentional for demos)
- No sensitive data stored locally
- Session easily clearable
- Production: Use Supabase Auth

---

## Quick Access

| Action | Result |
|--------|--------|
| Click login → Enter demo | ✅ Dashboard |
| Click signup → Auto-fill | ✅ Dashboard |
| Type custom email | Try Supabase or error |
| Page refresh (logged in) | ✅ Stays logged in |
| Clear browser data | Need to login again |

---

## Support

If users can't login:
1. Check email: `admin@company.com` (exact)
2. Check password: `12345` (exact)
3. Check for typos
4. Try clearing browser cache
5. Try incognito/private mode

---

**Demo mode ready to use! Just open the app and start exploring.** 🚀
