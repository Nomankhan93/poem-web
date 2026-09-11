# POEM Phase 3.5 — Production Hardening

## Scope

Phase 3.5 moves POEM from a feature-complete CMS toward a safer production deployment.

### Security

- CSP and common browser security headers
- HSTS in production
- admin/API `no-store` and `noindex`
- server-side contact rate limiting
- contact-form honeypot
- minimum form-completion time
- irreversible SHA-256 IP/email fingerprints only
- safer public contact errors
- Site Settings URL validation
- security scan script
- private env-file Git check

### Auditability

- `content_audit_log`
- create/update/delete audit triggers
- `/admin/audit`
- logs table/action/record/actor/time only
- no content bodies or contact-message contents copied into audit records

### Reliability

- `/api/health`
- route error boundary
- global error boundary
- 404 page
- public loading state
- admin loading state
- production database indexes

### SEO / crawl control

- `/robots.txt`
- `/sitemap.xml`
- dynamic published project/resource/story/news/career/tender URLs
- `/admin` metadata marked noindex
- `/api` disallowed from crawlers
- canonical site origin via `NEXT_PUBLIC_SITE_URL`

### Release checks

- `npm run security:check`
- `npm run release:check`

`release:check` runs:

1. secret/env checks
2. TypeScript
3. ESLint
4. production build

## Compatibility repair

Phase 3.1 created:

`project_metrics.reporting_year`

Phase 3.4 application code standardized on:

`project_metrics.year`

The Phase 3.5 migration safely renames `reporting_year` to `year` when required.

## Environment variables

Production Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
```

`SUPABASE_SECRET_KEY` is server-only.

Never create:

`NEXT_PUBLIC_SUPABASE_SECRET_KEY`

or:

`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Contact rate limits

Accepted contact submissions are limited to approximately:

- 6 per IP fingerprint / 10 minutes
- 20 per IP fingerprint / hour
- 4 per email fingerprint / hour

Only SHA-256 hashes are stored. Raw visitor IP addresses are not saved by this feature.

Old rate-limit events are cleaned automatically after 24 hours when the rate-limit function runs.

## CSP

The CSP permits:

- same-origin scripts/styles/assets
- Supabase API, realtime and storage
- Vercel toolbar/insights endpoints
- localhost development connections outside production

If POEM later embeds YouTube, maps, analytics or another third-party browser resource, explicitly extend the CSP instead of disabling it.

## Deployment sequence

Local:

```bash
npx supabase migration up
npm run release:check
```

Cloud:

```bash
cat supabase/.temp/project-ref
npx supabase db push
```

Then deploy/redeploy Vercel.

## Smoke tests

Verify:

- `/`
- `/projects`
- `/impact`
- `/resources`
- `/stories`
- `/news`
- `/careers`
- `/tenders`
- `/contact`
- `/admin/login`
- `/admin`
- `/admin/audit`
- `/robots.txt`
- `/sitemap.xml`
- `/api/health`

## Contact form test

Submit one genuine inquiry and confirm:

`Admin → Messages`

Do not repeatedly spam the form while testing or the rate limiter will intentionally block submissions.

## Production protection model

Recommended:

- production public domain: public
- Vercel preview/generated deployments: protected
- `/admin`: protected by Supabase Auth + role/RLS
- `/admin/users`: Super Admin only
- Supabase Studio: developer/system-owner access only
