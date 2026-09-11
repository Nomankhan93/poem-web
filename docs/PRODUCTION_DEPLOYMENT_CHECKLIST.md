# POEM Production Deployment Checklist

## Before database push

```bash
git status
npm run release:check
```

Confirm:

- no `.env` or `.env.local` tracked
- no real `sb_secret_...` value in source
- local migration succeeds
- TypeScript clean
- ESLint clean
- production build clean

## Supabase

Confirm the linked project:

```bash
cat supabase/.temp/project-ref
```

Push migrations:

```bash
npx supabase db push
```

Do not run a production `db reset`.

Supabase Dashboard:

- Authentication → URL Configuration
- Site URL = production domain
- Redirect URLs include production domain
- verify first trusted account is `super_admin`
- verify Storage buckets are present
- review database backup/PITR options appropriate to the Supabase plan

## Vercel environment

Required:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SITE_URL
```

Production `NEXT_PUBLIC_SITE_URL` should be the canonical public domain, not a random deployment URL.

## Vercel protection

Recommended:

- Production domain accessible publicly
- Preview/generated deployments protected
- Do not rely on Vercel login to protect `/admin`
- POEM `/admin` remains protected by application auth/RLS

## Domain / TLS

Verify:

- HTTPS works
- canonical domain opens without certificate warnings
- HTTP redirects to HTTPS
- old temporary deployment URLs are not used in public materials

## Public smoke tests

Check:

```text
/
 /about
 /programs
 /projects
 /impact
 /resources
 /stories
 /news
 /partners
 /about/team
 /careers
 /tenders
 /contact
 /donate
 /robots.txt
 /sitemap.xml
 /api/health
```

## Admin smoke tests

Check:

```text
/admin/login
/admin
/admin/projects
/admin/programs
/admin/impact
/admin/resources
/admin/stories
/admin/news
/admin/partners
/admin/team
/admin/careers
/admin/tenders
/admin/media
/admin/messages
/admin/audit
/admin/settings
/admin/users
```

Role checks:

- editor cannot access Users & Access
- editor cannot access Site Settings
- admin cannot access Users & Access
- super_admin can access Users & Access
- disabled user is rejected from admin workspace

## Content checks

Before launch, remove or replace:

- placeholder project text
- unverified partner names
- unverified impact figures
- placeholder banking details
- placeholder contact numbers
- test news/careers/tenders
- test media

## Final verification

```bash
npm run release:check
git status
git log -1 --oneline
```
