# POEM Phase 3.4 — Impact, Users, Settings & Homepage CMS

## Scope

This patch adds four production-facing systems:

1. **Impact Metrics CMS**
   - project/year/district records
   - people reached
   - women / men / children reached
   - youth trained
   - communities reached
   - trainings conducted
   - livelihoods supported
   - draft/published verification state
   - public `/impact` page
   - homepage verified impact counters
   - no hard-coded impact claims

2. **Admin Users & Access**
   - new `super_admin` role
   - `/admin/users`
   - invite staff by email
   - assign `super_admin`, `admin`, `editor`, `viewer`
   - enable/disable access
   - last admin activity timestamp
   - recent access-change audit
   - only Super Admin can manage users or roles

3. **Site Settings**
   - `/admin/settings`
   - organization identity
   - address / phone / email
   - social URLs
   - donation instructions
   - homepage hero text and CTAs
   - default SEO text
   - footer now reads live settings

4. **Homepage CMS Integration**
   - live hero settings
   - verified impact metrics
   - projects
   - featured story
   - latest news
   - resources
   - partner logos

## Important new server environment key

User invitations use Supabase's server-side Admin API.

Add:

```env
SUPABASE_SECRET_KEY=sb_secret_...
```

The patch also accepts the legacy:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

### Security rule

**Never** use:

```env
NEXT_PUBLIC_SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
```

The admin/secret key must never be available in browser JavaScript.

### Vercel

Project → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Add the secret key to server environments where `/admin/users` must work.

## Initial Super Admin

The migration adds the role but does **not** silently promote anyone.

After the migration, promote the trusted POEM account once from the Supabase SQL Editor:

```sql
update public.profiles
set role = 'super_admin',
    status = 'active'
where email = 'YOUR-TRUSTED-ADMIN@example.com';

select id, email, role, status
from public.profiles
where email = 'YOUR-TRUSTED-ADMIN@example.com';
```

After that, user management happens at:

`/admin/users`

Normal POEM staff should not need Supabase Studio for user management.

## Role model

### super_admin
- all CMS access
- impact
- site settings
- users & roles
- can invite/disable staff

### admin
- all normal CMS content
- impact
- site settings
- cannot manage users or roles

### editor
- content CMS
- media
- impact
- cannot manage site settings
- cannot manage users

### viewer
- no admin workspace access

## Local development secret

If using local Supabase, obtain the local service role key:

```bash
npx supabase status -o env
```

Put the local service role value in `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not commit `.env.local`.

## Migration

Preserve local data:

```bash
cd /home/noman/projects/poem-web
npx supabase migration up
```

Clean local rebuild:

```bash
npx supabase db reset
```

Cloud, after confirming the correct linked project:

```bash
npx supabase db push
```

Never run `db reset` against the cloud production project.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Then test:

- `/admin/impact`
- `/admin/settings`
- `/admin/users` as Super Admin
- `/impact`
- `/`
