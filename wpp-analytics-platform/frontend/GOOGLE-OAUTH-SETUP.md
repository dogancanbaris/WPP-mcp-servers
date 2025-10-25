# Google OAuth Setup Guide

This guide walks through setting up Google OAuth authentication for the WPP Analytics Platform.

## Overview

The platform uses Supabase Auth with Google OAuth provider for secure user authentication. Once configured:

- ✅ Users sign in with their Google account
- ✅ Each user gets isolated workspace (RLS enforced)
- ✅ Dashboard routes are protected (middleware)
- ✅ Automatic redirect to /dashboard after login

---

## Step 1: Configure Google Cloud Console

### 1.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one): **mcp-servers-475317**
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select application type: **Web application**
6. Name: `WPP Analytics Platform`

### 1.2 Set Authorized Redirect URIs

Add these redirect URIs:

**For Development**:
```
http://localhost:3000/auth/callback
https://nbjlehblqctblhpbwgry.supabase.co/auth/v1/callback
```

**For Production** (when deployed):
```
https://your-domain.com/auth/callback
https://nbjlehblqctblhpbwgry.supabase.co/auth/v1/callback
```

### 1.3 Save Credentials

After creating, you'll receive:
- **Client ID**: `XXXXXXXX.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-XXXXXXXX`

**⚠️ Keep these secure - you'll need them in Step 2**

---

## Step 2: Configure Supabase Dashboard

### 2.1 Navigate to Auth Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nbjlehblqctblhpbwgry)
2. Click **Authentication** in sidebar
3. Click **Providers** tab
4. Find **Google** in the list

### 2.2 Enable Google Provider

1. Toggle **Enable Sign in with Google** to ON
2. Enter your credentials from Step 1:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
3. Leave other settings as default
4. Click **Save**

### 2.3 Configure Site URL (Important!)

1. Still in Authentication settings, click **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add to **Redirect URLs**:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/**
   ```
4. Click **Save**

---

## Step 3: Verify Configuration

### 3.1 Test OAuth Flow

1. Navigate to: `http://localhost:3000/login`
2. Click **Continue with Google**
3. You should see Google OAuth consent screen
4. After consenting:
   - ✅ Redirected to `/dashboard`
   - ✅ User session created
   - ✅ Workspace auto-created (via trigger)

### 3.2 Check Database

Verify workspace creation in Supabase:

```sql
-- Check if workspace was created for new user
SELECT * FROM workspaces WHERE user_id = '[your-user-id]';

-- Check if user can access dashboards
SELECT * FROM dashboards WHERE workspace_id IN (
  SELECT id FROM workspaces WHERE user_id = auth.uid()
);
```

### 3.3 Test Protected Routes

Try accessing `/dashboard` without logging in:
- ✅ Should redirect to `/login`

Try accessing `/login` when already logged in:
- ✅ Should redirect to `/dashboard`

---

## Step 4: Production Checklist

Before deploying to production:

### 4.1 Update Environment Variables

Ensure `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://nbjlehblqctblhpbwgry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0tWfXgStCR6WvulxGFLw5w_p8VyuDE6
```

### 4.2 Update OAuth URLs

In Google Cloud Console:
1. Add production redirect URI
2. Update authorized JavaScript origins

In Supabase Dashboard:
1. Update Site URL to production domain
2. Add production redirect URLs

### 4.3 Test RLS Policies

Verify users can only see their own data:

```sql
-- User A should NOT see User B's dashboards
-- This should return empty for different users
SELECT * FROM dashboards
WHERE workspace_id NOT IN (
  SELECT id FROM workspaces WHERE user_id = auth.uid()
);
```

---

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Solution**: Ensure redirect URI in Google Cloud Console exactly matches Supabase callback URL.

```
Supabase callback: https://nbjlehblqctblhpbwgry.supabase.co/auth/v1/callback
```

### Issue: User Redirected to Login After OAuth

**Possible causes**:
1. Cookies not being set (check browser settings)
2. Site URL mismatch in Supabase
3. Middleware configuration error

**Debug steps**:
```typescript
// Add logging in middleware.ts
console.log('User:', user);
console.log('Path:', request.nextUrl.pathname);
```

### Issue: Workspace Not Created

**Solution**: Check if trigger exists:

```sql
-- Verify trigger is active
SELECT * FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Manually create workspace if needed
INSERT INTO workspaces (user_id, name)
VALUES (auth.uid(), 'My Workspace');
```

### Issue: RLS Blocking Dashboard Access

**Solution**: Verify RLS policies allow SELECT:

```sql
-- Check if policy exists
SELECT * FROM pg_policies
WHERE tablename = 'dashboards'
AND policyname LIKE '%select%';

-- Test policy directly
SELECT policy_definition FROM pg_policies
WHERE tablename = 'dashboards';
```

---

## Security Best Practices

### ✅ DO:
- Store credentials in environment variables
- Use HTTPS in production
- Enable RLS on all tables
- Validate user permissions server-side
- Use Supabase's built-in rate limiting

### ❌ DON'T:
- Commit credentials to git
- Expose service role key client-side
- Disable RLS policies
- Trust client-side auth checks only
- Share OAuth credentials publicly

---

## Next Steps

After OAuth is configured:

1. ✅ Users can sign in securely
2. ✅ Test dashboard save/load with real user
3. ✅ Invite team members to test
4. ⏭️ Add email auth (optional)
5. ⏭️ Configure SSO for enterprise (optional)

---

## Support

If you encounter issues:

1. Check [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
2. Review [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
3. Check Supabase logs: Dashboard → Logs → Auth
4. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

---

**🎉 OAuth setup complete! Users can now sign in with Google.**
