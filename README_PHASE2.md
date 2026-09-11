# POEM Phase 2 — Routing & Inner Pages

This patch adds the public-site routing layer while preserving the Phase 1 visual system.

## Routes added

- `/about`
- `/programs`
- `/projects`
- `/projects/[slug]`
- `/impact`
- `/resources`
- `/careers`
- `/tenders`
- `/contact`
- `/donate`

## Shared architecture added

- `src/lib/site-data.ts`
- `src/components/inner-page.tsx`
- Updated `SiteHeader`
- Updated `SiteFooter`

## Important content note

The current impact figures and project information are development placeholders. Verify all public-facing metrics, banking information, phone numbers, project dates, donors and results before production launch.

## Next recommended phase

Phase 3:
- PostgreSQL database
- Admin authentication
- Project/program CMS
- Resource/PDF management
- Jobs & tenders CMS
- Contact message storage
- Impact metrics data model
