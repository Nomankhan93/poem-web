-- POEM Phase 4.0C smoke checks. Run locally after migration.

-- Tables exist.
select to_regclass('public.project_funding_profiles') as project_funding_profiles,
       to_regclass('public.fundraising_campaigns') as fundraising_campaigns,
       to_regclass('public.fundraising_donations') as fundraising_donations;

-- Donation ledger must not be readable by anon through a direct policy.
select policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'fundraising_donations'
order by policyname;

-- Sanitized public functions are exposed, while donor ledger stays private.
select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'get_public_fundraising_campaigns',
    'get_public_campaign_supporters',
    'get_public_project_funding_by_slug'
  )
order by routine_name;

-- Verified donation totals should be campaign/currency aligned by trigger.
select d.id, d.campaign_id, d.currency as donation_currency, c.currency as campaign_currency
from public.fundraising_donations d
join public.fundraising_campaigns c on c.id = d.campaign_id
where d.currency is distinct from c.currency;

-- Should return zero rows.
