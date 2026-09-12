# POEM Phase 4.0B — Stabilization & Integrity

This patch hardens the existing Phase 4.0A/4.0B fundraising and grants implementation before Phase 4.0C.

## What it fixes

### Contact form anti-abuse integrity

- removes direct `anon` / `authenticated` INSERT access to `contact_messages`
- keeps the public form working through the server action
- moves the contact write path to the server-only Supabase client
- restricts `check_contact_rate_limit()` to `service_role`
- changes IP/email fingerprints from plain SHA-256 to HMAC-SHA256
- supports optional `CONTACT_RATE_LIMIT_SECRET` with server secret fallback

### Public content integrity

- removes demo project/program fallbacks from production public queries
- public Programs/Projects now return empty/not-found states when data is unavailable
- switches `public-content.ts` to the cookie-free public Supabase client

### Grant financial integrity

- validates that a receipt installment belongs to the same grant
- normalizes receipt currency to the grant currency
- removes direct authenticated execution of the internal installment-sync function

### Atomic grant award creation

New grant awards created from an application now use one database RPC transaction:

1. create grant award
2. mark the linked application `awarded`
3. set the decision date

If the operation fails, the database transaction rolls back.

### Donor impact reporting integrity

`project_metrics` now has exact:

- `period_start`
- `period_end`

Existing annual records are backfilled as Jan 1 → Dec 31.

The Impact CMS now records an exact reporting period instead of only a year.
Published periods for the same project cannot overlap.

Donor impact snapshots only use published impact records that are fully contained in the donor reporting period. This prevents an annual result from being reused as a quarterly result.

### Private grant document uploads

Grant agreement and donor-report files now upload directly from the authenticated admin browser to the private `grant-documents` bucket. This avoids Server Action request-size limits while preserving private storage and RLS.

Donor report documents can also be deleted from the reporting screen.

## New migration

`supabase/migrations/20260912060000_poem_phase4_integrity_stabilization.sql`

## QA

Static source check:

```bash
node scripts/test-phase4-integrity.mjs
```

Database smoke SQL:

`supabase/qa/phase4-integrity-smoke.sql`

## Recommended validation order

```bash
cd /home/noman/projects/poem-web

npx supabase migration up
node scripts/test-phase4-integrity.mjs
npx tsc --noEmit
npm run lint
npm run build
```

After local validation:

```bash
cat supabase/.temp/project-ref
npx supabase db push
```

Do not run production `db reset`.

## Post-migration impact note

Existing annual metrics remain valid and are converted to full-year reporting periods. If a donor report is quarterly, create verified quarterly/monthly impact records for that project before capturing a donor snapshot. The system will no longer treat a full-year metric as a quarterly metric.
