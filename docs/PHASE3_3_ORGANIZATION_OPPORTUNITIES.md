# POEM Phase 3.3 — Organization & Opportunities CMS

## Scope

This phase adds:

- Partners CMS + public partners page
- Team / Board / Advisors CMS + public team page
- News / Updates CMS + public news pages
- Careers CMS + public vacancy detail pages
- Tenders CMS + public tender detail pages
- Dedicated `team` and `partners` Supabase Storage buckets
- Updated admin navigation
- Updated public header/footer navigation

## Admin routes

- `/admin/partners`
- `/admin/partners/new`
- `/admin/partners/[id]`
- `/admin/team`
- `/admin/team/new`
- `/admin/team/[id]`
- `/admin/news`
- `/admin/news/new`
- `/admin/news/[id]`
- `/admin/careers`
- `/admin/careers/new`
- `/admin/careers/[id]`
- `/admin/tenders`
- `/admin/tenders/new`
- `/admin/tenders/[id]`

## Public routes

- `/partners`
- `/about/team`
- `/news`
- `/news/[slug]`
- `/careers`
- `/careers/[slug]`
- `/tenders`
- `/tenders/[slug]`

## Database tables

- `partners`
- `team_members`
- `news_posts`
- `careers`
- `tenders`

## Storage

- `team` — public team photos, max 5 MB
- `partners` — public partner logos, max 5 MB

Existing:
- `project-media`
- `documents`

## Important

These buckets are public-facing content buckets. Do not upload confidential HR documents, CVs, IDs, contracts, beneficiary records or private procurement submissions.

## Local migration

```bash
cd /home/noman/projects/poem-web
npx supabase migration up
```

or, if a reset is acceptable:

```bash
npx supabase db reset
```

## Cloud

After confirming the CLI is linked to the correct POEM cloud Supabase project:

```bash
npx supabase db push
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```
