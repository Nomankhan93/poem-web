-- POEM Phase 4.0B Stabilization & Integrity smoke checks
-- Run after applying 20260912060000_poem_phase4_integrity_stabilization.sql.

-- 1) Direct public contact inserts must be revoked.
select
  has_table_privilege('anon', 'public.contact_messages', 'INSERT')
    as anon_can_insert_contact,
  has_table_privilege('authenticated', 'public.contact_messages', 'INSERT')
    as authenticated_can_insert_contact;

-- Expected: false / false

-- 2) Public/authenticated callers must not be able to invoke the
-- internal contact rate-limit helper directly.
select
  has_function_privilege(
    'anon',
    'public.check_contact_rate_limit(text,text)',
    'EXECUTE'
  ) as anon_can_run_contact_limiter,
  has_function_privilege(
    'authenticated',
    'public.check_contact_rate_limit(text,text)',
    'EXECUTE'
  ) as authenticated_can_run_contact_limiter,
  has_function_privilege(
    'service_role',
    'public.check_contact_rate_limit(text,text)',
    'EXECUTE'
  ) as service_role_can_run_contact_limiter;

-- Expected: false / false / true

-- 3) The installment sync helper is trigger-internal only.
select
  has_function_privilege(
    'authenticated',
    'public.sync_grant_installment_status(uuid)',
    'EXECUTE'
  ) as authenticated_can_run_installment_sync;

-- Expected: false

-- 4) Exact impact reporting periods are present and valid.
select
  count(*) filter (
    where period_start is null or period_end is null
  ) as metrics_missing_period,
  count(*) filter (
    where period_end < period_start
  ) as metrics_with_invalid_period
from public.project_metrics;

-- Expected: 0 / 0

-- 5) No published impact periods overlap for the same project.
select count(*) as overlapping_published_metric_pairs
from public.project_metrics a
join public.project_metrics b
  on a.project_id = b.project_id
 and a.id < b.id
 and a.published = true
 and b.published = true
 and a.period_start <= b.period_end
 and a.period_end >= b.period_start;

-- Expected: 0

-- 6) No receipt points to another grant's installment.
select count(*) as mismatched_receipt_installments
from public.grant_fund_receipts r
join public.grant_installments i
  on i.id = r.installment_id
where r.installment_id is not null
  and i.grant_id <> r.grant_id;

-- Expected: 0

-- 7) Receipt currency must match the grant currency.
select count(*) as receipt_currency_mismatches
from public.grant_fund_receipts r
join public.grant_awards g
  on g.id = r.grant_id
where r.currency is distinct from g.currency;

-- Expected: 0

-- 8) Grant documents bucket remains private.
select id, public
from storage.buckets
where id = 'grant-documents';

-- Expected: grant-documents / false
