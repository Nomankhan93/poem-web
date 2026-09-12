# POEM Phase 4.0A — Fundraising & Grants Foundation

Adds a private Fundraising & Grants workspace for POEM administration.

## Includes
- Fundraising dashboard
- Donor CRM
- Funding opportunities
- Grant application / proposal pipeline
- Proposal submission checklist
- Deadline center
- Private proposal document storage

## Admin routes
- `/admin/fundraising`
- `/admin/fundraising/donors`
- `/admin/fundraising/opportunities`
- `/admin/fundraising/applications`
- `/admin/fundraising/applications/[id]`
- `/admin/fundraising/deadlines`

## Access
Phase 4.0A is intentionally limited to active `super_admin` and `admin` accounts. It is not public and Editors cannot access it.

## Private grant documents
The new `grant-documents` bucket is private. Proposal documents are accessed through short-lived signed URLs from the authenticated admin workspace.

## Application stages
Draft → Concept Note → Internal Review → Proposal Development → Budget Review → Management Approval → Ready to Submit → Submitted → Under Review → Clarification Requested → Shortlisted → Awarded / Rejected / Withdrawn.

## Phase 4.0B recommendation
Grant Awards, Agreements, Installments, Funds Received, Donor Reporting Calendar, Narrative/Financial Reports, Donor Feedback and Impact integration.

## Apply
```bash
cd /home/noman/projects/poem-web
npx supabase migration up
npx tsc --noEmit
npm run lint
npm run build
```

Cloud after local validation:
```bash
cat supabase/.temp/project-ref
npx supabase db push
```
