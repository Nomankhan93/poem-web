begin;

-- =========================================================
-- Phase 4.0B Stabilization & Integrity
-- =========================================================

-- ---------------------------------------------------------
-- 1) Contact submissions must pass through the server layer.
--    Remove direct public table inserts and direct access to
--    the rate-limit helper. The server-only Supabase secret
--    remains allowed to call the limiter and write messages.
-- ---------------------------------------------------------

drop policy if exists "anyone submit contact message"
  on public.contact_messages;

revoke insert on public.contact_messages from anon, authenticated;

revoke all
  on function public.check_contact_rate_limit(text, text)
  from public, anon, authenticated;

grant execute
  on function public.check_contact_rate_limit(text, text)
  to service_role;

-- ---------------------------------------------------------
-- 2) Reporting-period integrity for project impact metrics.
--    Existing annual records are backfilled to Jan 1-Dec 31.
--    New records can represent monthly/quarterly/custom periods.
-- ---------------------------------------------------------

alter table public.project_metrics
  add column if not exists period_start date,
  add column if not exists period_end date;

update public.project_metrics
set
  period_start = coalesce(period_start, make_date(year, 1, 1)),
  period_end = coalesce(period_end, make_date(year, 12, 31));

create or replace function public.normalize_project_metric_period()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.period_start is null then
    new.period_start := make_date(new.year, 1, 1);
  end if;

  if new.period_end is null then
    new.period_end := make_date(new.year, 12, 31);
  end if;

  if new.period_end < new.period_start then
    raise exception 'Impact reporting period end cannot be before period start';
  end if;

  new.year := extract(year from new.period_start)::integer;
  return new;
end;
$$;

drop trigger if exists normalize_project_metric_period
  on public.project_metrics;

create trigger normalize_project_metric_period
before insert or update on public.project_metrics
for each row execute function public.normalize_project_metric_period();

alter table public.project_metrics
  alter column period_start set not null,
  alter column period_end set not null;

alter table public.project_metrics
  drop constraint if exists project_metrics_project_id_reporting_year_key;

alter table public.project_metrics
  drop constraint if exists project_metrics_project_id_year_key;

alter table public.project_metrics
  drop constraint if exists project_metrics_period_order;

alter table public.project_metrics
  add constraint project_metrics_period_order
  check (period_end >= period_start);

create unique index if not exists project_metrics_project_period_uidx
  on public.project_metrics (project_id, period_start, period_end);

create index if not exists project_metrics_period_lookup_idx
  on public.project_metrics (
    project_id,
    published,
    period_start,
    period_end
  );

create or replace function public.prevent_overlapping_published_project_metrics()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.published and exists (
    select 1
    from public.project_metrics existing
    where existing.project_id = new.project_id
      and existing.id <> new.id
      and existing.published = true
      and existing.period_start <= new.period_end
      and existing.period_end >= new.period_start
  ) then
    raise exception 'Published impact periods for the same project cannot overlap';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_overlapping_published_project_metrics
  on public.project_metrics;

create trigger prevent_overlapping_published_project_metrics
before insert or update on public.project_metrics
for each row execute function public.prevent_overlapping_published_project_metrics();

-- ---------------------------------------------------------
-- 3) Receipt/installment integrity.
--    A receipt can only point to an installment of the same
--    grant. Receipt currency is normalized to grant currency.
-- ---------------------------------------------------------

do $$
begin
  if exists (
    select 1
    from public.grant_fund_receipts r
    join public.grant_installments i on i.id = r.installment_id
    where r.installment_id is not null
      and i.grant_id <> r.grant_id
  ) then
    raise exception 'Existing grant receipt/installment mismatch detected. Correct the data before applying the stabilization migration.';
  end if;
end
$$;

create or replace function public.validate_grant_fund_receipt()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  installment_grant_id uuid;
  grant_currency text;
begin
  select currency
    into grant_currency
  from public.grant_awards
  where id = new.grant_id;

  if not found then
    raise exception 'Grant award does not exist';
  end if;

  if new.installment_id is not null then
    select grant_id
      into installment_grant_id
    from public.grant_installments
    where id = new.installment_id;

    if not found then
      raise exception 'Grant installment does not exist';
    end if;

    if installment_grant_id <> new.grant_id then
      raise exception 'Receipt installment must belong to the same grant';
    end if;
  end if;

  new.currency := grant_currency;
  return new;
end;
$$;

drop trigger if exists validate_grant_fund_receipt
  on public.grant_fund_receipts;

create trigger validate_grant_fund_receipt
before insert or update on public.grant_fund_receipts
for each row execute function public.validate_grant_fund_receipt();

update public.grant_fund_receipts r
set currency = g.currency
from public.grant_awards g
where g.id = r.grant_id
  and r.currency is distinct from g.currency;

-- The installment sync helper is trigger-internal only.
revoke all
  on function public.sync_grant_installment_status(uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------
-- 4) Atomic grant-award creation.
--    Award insert + linked application status update happen in
--    one database transaction.
-- ---------------------------------------------------------

create or replace function public.create_grant_award_atomic(
  p_application_id uuid,
  p_donor_id uuid,
  p_project_id uuid,
  p_program_id uuid,
  p_title text,
  p_award_number text,
  p_status text,
  p_award_amount numeric,
  p_currency text,
  p_award_date date,
  p_start_date date,
  p_end_date date,
  p_grant_manager text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_grant_id uuid;
begin
  if not public.can_manage_fundraising() then
    raise exception 'Insufficient privileges';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'Grant title is required';
  end if;

  if p_award_amount is null or p_award_amount < 0 then
    raise exception 'Award amount is required';
  end if;

  if p_end_date is not null
     and p_start_date is not null
     and p_end_date < p_start_date then
    raise exception 'Grant end date cannot be before start date';
  end if;

  if p_application_id is not null
     and not exists (
       select 1
       from public.grant_applications
       where id = p_application_id
     ) then
    raise exception 'Grant application does not exist';
  end if;

  insert into public.grant_awards (
    application_id,
    donor_id,
    project_id,
    program_id,
    title,
    award_number,
    status,
    award_amount,
    currency,
    award_date,
    start_date,
    end_date,
    grant_manager,
    notes,
    created_by
  )
  values (
    p_application_id,
    p_donor_id,
    p_project_id,
    p_program_id,
    trim(p_title),
    coalesce(p_award_number, ''),
    coalesce(nullif(p_status, ''), 'awarded'),
    p_award_amount,
    upper(coalesce(nullif(trim(p_currency), ''), 'USD')),
    p_award_date,
    p_start_date,
    p_end_date,
    coalesce(p_grant_manager, ''),
    coalesce(p_notes, ''),
    auth.uid()
  )
  returning id into new_grant_id;

  if p_application_id is not null then
    update public.grant_applications
    set
      stage = 'awarded',
      decision_date = coalesce(p_award_date, current_date)
    where id = p_application_id;

    if not found then
      raise exception 'Grant application could not be updated';
    end if;
  end if;

  return new_grant_id;
end;
$$;

revoke all
  on function public.create_grant_award_atomic(
    uuid,
    uuid,
    uuid,
    uuid,
    text,
    text,
    text,
    numeric,
    text,
    date,
    date,
    date,
    text,
    text
  )
  from public;

grant execute
  on function public.create_grant_award_atomic(
    uuid,
    uuid,
    uuid,
    uuid,
    text,
    text,
    text,
    numeric,
    text,
    date,
    date,
    date,
    text,
    text
  )
  to authenticated;

commit;
