# Deployment Checklist

## Pre-Deployment (Local Development)

### Database Setup
- [ ] Access your Supabase project dashboard
- [ ] Go to SQL Editor section
- [ ] Create new query
- [ ] Copy entire `/scripts/supabase-migrations.sql` content
- [ ] Paste into SQL editor
- [ ] Execute query successfully
- [ ] Verify all 7 tables created:
  - [ ] profiles
  - [ ] employees
  - [ ] task_templates
  - [ ] tasks
  - [ ] task_assignments
  - [ ] task_delays
  - [ ] audit_logs

### Admin User Setup
- [ ] Go to Supabase Authentication → Users
- [ ] Click "Add user"
- [ ] Enter admin email: `admin@company.com`
- [ ] Create strong password
- [ ] Note the user's UUID
- [ ] Run this SQL query:
  ```sql
  UPDATE public.profiles SET is_admin = TRUE WHERE id = 'PASTE_UUID_HERE';
  ```
- [ ] Verify admin flag is set

### Local Testing
- [ ] Run `npm install` to add Supabase packages
- [ ] Create `.env.local` with Supabase variables (if needed):
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  ```
- [ ] Run `npm run dev`
- [ ] Navigate to `http://localhost:3000`
- [ ] Verify redirected to `/auth/login`
- [ ] Check login page renders with professional styling
- [ ] Login with admin credentials
- [ ] Verify redirect to `/dashboard`
- [ ] Check employee list loads (may show mock data initially)
- [ ] Test navigation menu
- [ ] Test responsive design on mobile
- [ ] Check browser console for errors

### Feature Testing
- [ ] Login/logout flow works
- [ ] Dashboard displays stats
- [ ] Employees page loads
- [ ] Add employee form validates
- [ ] Onboarding page shows progress
- [ ] Tasks page displays
- [ ] Audit logs page accessible (admin only)
- [ ] Settings page opens
- [ ] No console errors or warnings

### Performance Check
- [ ] Page loads in < 2 seconds
- [ ] No layout shift (CLS)
- [ ] Images optimize correctly
- [ ] CSS loads efficiently
- [ ] Run `npm run build` succeeds

## Pre-Deployment (Production Checks)

### Environment Variables
- [ ] Verify Supabase URL is correct
- [ ] Verify anon key is correct (public key)
- [ ] Service role key is NOT exposed in client code
- [ ] All env vars in Vercel project settings
- [ ] No hardcoded credentials in code
- [ ] `.env.local` NOT committed to git

### Security Review
- [ ] RLS policies enabled on all tables
- [ ] Admin-only endpoints protected
- [ ] Authentication checks in API routes
- [ ] No sensitive data in client logs
- [ ] CORS configured properly
- [ ] Supabase rate limiting enabled
- [ ] Email confirmation required (set in Auth)

### Code Quality
- [ ] No `console.log` statements with sensitive data
- [ ] No TODO/FIXME comments left
- [ ] No hardcoded test credentials
- [ ] TypeScript strict mode enabled
- [ ] Linting passes: `npm run lint`
- [ ] No warnings in build output

### Styling & UX
- [ ] Login page matches design brief
- [ ] Professional Navy/Slate/Teal colors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility checks pass:
  - [ ] Alt text on all images
  - [ ] ARIA labels present
  - [ ] Keyboard navigation works
  - [ ] Color contrast adequate
  - [ ] Focus states visible

## Vercel Deployment

### Before Deploying
- [ ] Repository pushed to GitHub
- [ ] All changes committed
- [ ] No uncommitted files
- [ ] Branch is clean

### Deploy Configuration
- [ ] Connected to Vercel
- [ ] Correct repository selected
- [ ] Production branch selected (main)
- [ ] Framework: Next.js detected
- [ ] Build command: `next build` (auto-detected)
- [ ] Output directory: `.next` (auto-detected)
- [ ] Root directory: `./` (correct)

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `GROQ_API_KEY` added (if using Groq)
- [ ] All vars marked correctly:
  - [ ] Public vars with `NEXT_PUBLIC_` prefix
  - [ ] Secret vars NOT prefixed
- [ ] Env vars match between local and Vercel

### Deploy & Verify
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (usually 2-3 min)
- [ ] Verify no build errors
- [ ] Verify no runtime errors
- [ ] Check deployment logs for warnings
- [ ] Visit deployed URL
- [ ] Verify login page loads
- [ ] Test login with admin credentials
- [ ] Verify redirect to dashboard
- [ ] Check data loads (or shows demo data gracefully)
- [ ] Test key features:
  - [ ] Navigation works
  - [ ] Responsive design intact
  - [ ] Styling looks correct
  - [ ] No 404 errors
  - [ ] API routes accessible

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (optional):
  - [ ] Sentry, LogRocket, or similar
- [ ] Monitor Supabase logs:
  - [ ] Auth errors
  - [ ] RLS violations
  - [ ] Database errors
- [ ] Check Vercel analytics:
  - [ ] Page load times
  - [ ] Error rates
  - [ ] Usage stats

### Testing
- [ ] Create test employee account
- [ ] Add test employees via dashboard
- [ ] Verify tasks are generated (if AI enabled)
- [ ] Check assignments appear
- [ ] Verify audit logs capture decisions
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test on mobile:
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Check touch targets (44px minimum)

### Security Verification
- [ ] Test unauthenticated access blocked
  - [ ] Try accessing `/dashboard` without login
  - [ ] Should redirect to `/auth/login`
- [ ] Test RLS policies:
  - [ ] Non-admin user cannot add employees
  - [ ] Regular user cannot view audit logs
  - [ ] Users only see their own data
- [ ] Check for CORS errors
- [ ] Verify no XSS vulnerabilities:
  - [ ] Try injecting HTML in forms
  - [ ] Should be sanitized
- [ ] Check SQL injection protection:
  - [ ] Supabase parameterizes queries automatically
  - [ ] No dynamic SQL construction

### Performance Verification
- [ ] Run Lighthouse audit:
  - [ ] Performance: > 85
  - [ ] Accessibility: > 90
  - [ ] Best Practices: > 85
  - [ ] SEO: > 90
- [ ] Check Core Web Vitals:
  - [ ] LCP (Largest Contentful Paint): < 2.5s
  - [ ] FID (First Input Delay): < 100ms
  - [ ] CLS (Cumulative Layout Shift): < 0.1
- [ ] Monitor database query times
- [ ] Check API response times

### User Communication
- [ ] Prepare documentation for users
- [ ] Create user guide for login
- [ ] Document admin procedures
- [ ] Set up support email/channel
- [ ] Create FAQ with common issues
- [ ] Brief team on features

## Rollback Plan

If issues occur after deployment:

### Minor Issues
1. Check error logs in Vercel
2. Check Supabase logs
3. Review recent code changes
4. Fix in development
5. Test locally
6. Redeploy

### Critical Issues
1. Disable new deployments in Vercel
2. Revert to previous working version
3. Diagnose issue
4. Test fix thoroughly
5. Redeploy

### Database Issues
1. Check Supabase status page
2. Review RLS policies for errors
3. Check table integrity
4. Restore from backup if needed
5. Document issue for future prevention

## Long-term Maintenance

### Weekly
- [ ] Check error logs in Sentry/Vercel
- [ ] Monitor Supabase usage
- [ ] Verify backups are running
- [ ] Check for security updates

### Monthly
- [ ] Review access logs
- [ ] Update dependencies (npm update)
- [ ] Security audit
- [ ] Performance review
- [ ] User feedback review

### Quarterly
- [ ] Major version updates (Next.js, React)
- [ ] Supabase version updates
- [ ] Security penetration test
- [ ] Disaster recovery drill
- [ ] Cost optimization review

## Support Resources

**Supabase Issues**
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com
- Discord: https://discord.supabase.io

**Vercel Issues**
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com
- Support: https://vercel.com/support

**Next.js Issues**
- Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js

**Application Issues**
- Check logs in Vercel
- Check Supabase dashboard
- Check browser console
- Review environment variables

## Quick Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run dev
```

### Environment variables not loading
- Verify in Vercel project settings
- Restart deployment
- Check variable naming (case-sensitive)

### Login not working
- Check Supabase credentials
- Verify admin user exists
- Check auth policies in Supabase

### Database errors
- Run migrations again
- Check RLS policies
- Verify user has admin access

### Styling broken
- Clear cache: Ctrl+Shift+Delete
- Rebuild: `npm run build`
- Restart server: `npm run dev`

---

**Deployment Date**: ___________

**Deployed By**: ___________

**Version**: 1.0.0

**Status**: ✅ Ready for Deployment
