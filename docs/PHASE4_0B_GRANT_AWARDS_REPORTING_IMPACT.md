# POEM Phase 4.0B — Grant Awards, Finance, Reporting & Impact

Phase 4.0B continues the Phase 4.0A fundraising pipeline after a proposal wins funding.

## Included

- Grant Awards register
- Award status and grant manager
- Private Grant Agreements / Amendments
- Installment schedule
- Funds Received ledger
- Automatic installment receipt status synchronization
- Donor Reporting obligations and deadlines
- Report status / donor feedback
- Private report document uploads
- Cross-grant Donor Reporting Center
- Project Impact integration
- Point-in-time impact snapshots for donor reports

## Admin routes

- `/admin/fundraising/grants`
- `/admin/fundraising/grants/new`
- `/admin/fundraising/grants/[id]`
- `/admin/fundraising/grants/[id]/finance`
- `/admin/fundraising/grants/[id]/reporting`
- `/admin/fundraising/grants/[id]/impact`
- `/admin/fundraising/reporting`

## Grant award lifecycle

`Awarded → Active → On Hold → Completed → Closed / Terminated`

A grant can be created from a successful Phase 4.0A application. When linked to an application, the application is moved to `awarded`.

## Agreements

Agreement files use the existing private `grant-documents` bucket. They are opened through short-lived signed URLs and are never made public.

Supported agreement types:

- Original Agreement
- Amendment
- Extension
- Memorandum
- Other

## Installments & Funds Received

The module separates:

- Grant Award Amount
- Scheduled Installments
- Actual Funds Received
- Outstanding Amount

Receipts may be allocated to a specific installment or recorded as an unallocated/general receipt.

Installment status updates automatically when receipts are posted:

- Planned
- Due
- Partially Received
- Received
- Overdue
- Cancelled

## Donor Reporting

Reporting types include inception, monthly, quarterly, semi-annual, annual, narrative, financial, audit, final narrative, final financial, impact, and other.

Statuses:

- Not Started
- In Progress
- Ready for Review
- Submitted
- Revision Requested
- Accepted
- Overdue

Private report documents are stored in the same restricted grant document area.

## Impact Integration

A grant can link to an existing POEM Project.

The Impact Integration page reads **published** Project Impact metrics and can capture a snapshot for a specific donor reporting obligation.

The snapshot records:

- People Reached
- Women Reached
- Men Reached
- Children Reached
- Youth Trained
- Communities Reached
- Trainings Conducted
- Livelihoods Supported

This avoids re-entering the same verified figures in multiple donor reports while preserving a point-in-time reporting record.

## Access

Phase 4.0B follows Phase 4.0A access rules:

- Super Admin: allowed
- Admin: allowed
- Editor: not allowed
- Public: not allowed

## Recommended Phase 4.0C

- Public fundraising campaigns
- Funding targets / amount raised / funding gap on selected projects
- Online donation workflow
- Public donor acknowledgements (opt-in only)
- Fundraising analytics by donor, program, project and year
- Multi-currency portfolio analytics
- Reminder / notification automation

## Validation

```bash
cd /home/noman/projects/poem-web
npx supabase migration up
npx tsc --noEmit
npm run lint
npm run build
```

Cloud only after local validation:

```bash
cat supabase/.temp/project-ref
npx supabase db push
```
