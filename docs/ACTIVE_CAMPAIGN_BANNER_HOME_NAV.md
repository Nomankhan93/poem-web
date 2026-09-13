# POEM Small UI Patch — Active Campaign Banner + Home Navigation

This patch adds two public-site UX improvements:

1. **Global active fundraising campaign banner**
   - Appears above the public navigation on every page that uses `SiteHeader`.
   - Uses the existing Phase 4.0C public campaign RPC; no schema migration is required.
   - Only published campaigns with `status = active` and valid start/end dates are eligible.
   - If multiple campaigns are active, a featured campaign wins; otherwise the nearest campaign end date wins.
   - Shows campaign title, verified amount raised, funding progress, and a Support CTA.
   - Visitors may dismiss the banner for the current browser session.
   - Admin pages are unaffected.

2. **Explicit Home navigation**
   - Adds `Home` before `About` on desktop and mobile navigation.
   - POEM logo continues to link to `/`.

## No database migration

This is a UI-only patch. Do **not** run `npx supabase db push` for this patch.

## Validation

```bash
cd /home/noman/projects/poem-web
npx tsc --noEmit
npm run lint
npm run build
```

or:

```bash
npm run release:check
```

## Manual QA

- Open `/` and verify an active campaign banner appears above the header.
- Open `/about`, `/programs`, `/projects`, `/impact`, `/resources`, `/stories`,
  `/news`, `/fundraising`, `/contact`, and `/donate`; the same banner should appear.
- Click **Support now** and verify it opens `/fundraising/[slug]`.
- Click **X** and navigate to another public page in the same tab; the banner should remain dismissed.
- Open a new browser tab/session; the banner should be eligible to appear again.
- Verify `Home` is the first navigation item and returns to `/`.
- Verify the Home item receives the active state on `/`.
- Verify mobile navigation includes Home.
