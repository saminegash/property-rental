# Production Operations & Deployment Guide

This document serves as the official operational guide to configure, launch, and maintain the production environment for **MyEthioProperties**.

---

## 1. Environment Variable Setup (.env)
When deploying to your hosting provider (e.g. Vercel, Netlify), make sure to configure these keys in their respective environment dashboards.

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Your production Supabase project API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | The Supabase client Anonymous key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private / Server | **CRITICAL SECURITY ASSET**. Key to bypass RLS for admin approvals and audit trails. Keep secret. |
| `ANALYTICS_SALT` | Private / Server | **MANDATORY IN PROD**. Long random string used to anonymize visitor hashes. If missing in prod, analytics tracking fails safely without inserting data. |
| `RESEND_API_KEY` | Private / Server | Key from your Resend.com account to trigger admin emails. |
| `ADMIN_NOTIFICATION_EMAIL` | Private / Server | Target email address where admin alerts are dispatched (e.g. `admin@myethioproperties.com`). |
| `ADMIN_NOTIFICATION_PHONE` | Private / Server | Destination phone number for admin SMS notifications. |

---

## 2. Supabase Production Configuration Checklist

Before pointing production traffic to your Supabase instance, complete these mandatory configuration items:

### 2.1 Database Migrations
Ensure all schema files inside `/supabase/migrations` are applied to the production database:
1. Link your local environment to the production project using the Supabase CLI:
   ```bash
   supabase link --project-ref your-prod-project-ref
   ```
2. Apply all migration scripts:
   ```bash
   supabase db push
   ```

### 2.2 Storage Bucket Setup
The application requires a public storage bucket to host listing images.
1. Navigate to the **Storage** section in the Supabase Dashboard.
2. Click **New Bucket**.
3. Set Name to `listing-images`.
4. Enable **Public Bucket** (so images are accessible publicly via CDN).
5. Apply the following storage policies under **Policies**:
   - **SELECT**: Allowed for all users (public read access).
   - **INSERT/UPDATE/DELETE**: Restricted to authenticated owners/admin (ensure RLS applies).

### 2.3 Row-Level Security (RLS) Verification
Run this SQL audit inside the Supabase SQL Editor to verify that all critical tables have RLS enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
Ensure that `rowsecurity` is `true` for all main tables:
- `listings`
- `rental_requests`
- `listing_requests`
- `profiles`
- `listing_events`

### 2.4 Auth Site URL & Redirect URLs
Supabase Auth requires strict whitelisting of the production domain for callbacks:
1. Navigate to **Authentication** > **URL Configuration**.
2. Set **Site URL** to:
   ```
   https://myethioproperties.com
   ```
3. In **Redirect URLs**, add:
   ```
   https://myethioproperties.com/auth/callback
   ```
   *(Ensure you also add any staging or preview domains if applicable).*

### 2.5 Seed the First Admin User
To perform admin tasks (listing verification checklist, view dashboard audits), you need a user with the `admin` role in the database.
1. Sign up on your production site using your email.
2. Run this SQL query in the Supabase **SQL Editor** to grant your account absolute administrative rights:
```sql
-- 1. Ensure user profile exists
INSERT INTO public.profiles (user_id, email, full_name)
VALUES ('your-user-uuid-from-auth-users', 'admin@myethioproperties.com', 'Lead Administrator')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Associate the user with the 'admin' role inside public.user_roles
INSERT INTO public.user_roles (user_id, role_id)
VALUES (
  'your-user-uuid-from-auth-users',
  (SELECT id FROM public.roles WHERE role_name = 'admin')
)
ON CONFLICT (user_id, role_id) DO NOTHING;
```

### 2.6 Enable Automatic Backups
Don't risk data loss. Ensure point-in-time recovery and database backups are configured:
1. Go to **Project Settings** > **Database** in Supabase.
2. Under **Daily Backups**, confirm the backup schedule is active.
3. For production safety, it is highly recommended to upgrade to Supabase's Pro Plan or set up an automated script utilizing `pg_dump` to dump to an external secure S3 bucket daily.

---

## 3. Post-Launch Monitoring
1. Monitor your Vercel/hosting server logs for any warning:
   `CRITICAL SECURITY ERROR: ANALYTICS_SALT is missing in production!`
2. Ensure you verify the Resend account setup is complete, domain validated, and the first few property/car test inquiries successfully hit your `ADMIN_NOTIFICATION_EMAIL`.
