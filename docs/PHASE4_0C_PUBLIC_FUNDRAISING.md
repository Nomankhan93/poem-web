# POEM Phase 4.0C — Public Fundraising Campaigns & Analytics

Phase 4.0C connects the private grant-management system to controlled public fundraising.

## Included

- Project funding targets
- Public fundraising enable/disable per project
- Fundraising campaigns
- Campaign cover image
- Funding target / amount raised / gap / progress
- Manual donation ledger
- Donation verification workflow
- Public supporter display with anonymous-name protection
- Public `/fundraising` listing
- Public `/fundraising/[slug]` detail
- Featured homepage campaign
- Project funding summary integration
- Fundraising analytics grouped by currency
- Grant + donation funding visibility without cross-currency conversion

## Important accounting rule

The system keeps these concepts separate:

- Grant awarded / secured
- Grant funds actually received
- Verified public donations
- Funding target
- Funding gap

Only verified donations contribute to public campaign totals.

No automatic currency conversion is performed. PKR, USD and other currencies remain separate.

## Online payments

Phase 4.0C does **not** process online card/wallet payments. It records verified offline/manual donations and displays approved giving instructions. Payment gateway integration should be a separate Phase 4.0D because it requires webhooks, reconciliation, refunds, receipt automation and payment security controls.

## Admin routes

- `/admin/fundraising/projects`
- `/admin/fundraising/projects/[projectId]`
- `/admin/fundraising/campaigns`
- `/admin/fundraising/campaigns/new`
- `/admin/fundraising/campaigns/[id]`
- `/admin/fundraising/donations`
- `/admin/fundraising/donations/new`
- `/admin/fundraising/donations/[id]`
- `/admin/fundraising/analytics`

## Public routes

- `/fundraising`
- `/fundraising/[slug]`

## Validation

```bash
npx supabase migration up
npm run test:phase4c
npm run release:check
```

After local validation:

```bash
cat supabase/.temp/project-ref
npx supabase db push
```

Never use `db reset` against production.
