# POEM Phase 3.1 — Local Supabase + Admin

## What this phase adds

- Local Supabase/PostgreSQL
- RLS security foundation
- `profiles`, `programs`, `projects`, `project_sdgs`, `project_metrics`
- `contact_messages`, `site_settings`
- Supabase SSR clients for Next.js
- Next.js 16 `proxy.ts` auth cookie refresh
- Admin login
- Protected admin dashboard
- Programs CMS
- Projects CMS
- Contact inbox
- Public Programs/Projects pages backed by Supabase, with static fallback
- Functional public contact form

## Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Start local Supabase

If another local Supabase project is using the default ports, stop that project first.

```bash
npx supabase start
npx supabase db reset
bash scripts/setup-local-supabase-env.sh
```

Restart Next.js after changing `.env.local`.

## Create the first local admin

1. Open local Studio: `http://127.0.0.1:54323`
2. Authentication → Users → Add user
3. Create the user with your preferred email/password.
4. Open SQL Editor and run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR-ADMIN-EMAIL@example.com';
```

5. Visit `http://localhost:3000/admin/login`.

Do not expose a public admin-registration page. New Auth users default to `viewer`.

## Security model

- Anonymous: read published programs/projects; submit contact messages.
- Viewer: same public content access.
- Editor: manage programs/projects.
- Admin: manage programs/projects and contact messages; can update profile roles.
- RLS is enabled on every Phase 3.1 application table.

## Placeholder content

Seed projects and public impact figures are still development content. Verify real POEM data before production launch.
