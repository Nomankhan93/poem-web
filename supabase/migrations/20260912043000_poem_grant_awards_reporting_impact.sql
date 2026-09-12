begin;

-- Phase 4.0B depends on Phase 4.0A fundraising foundation.
do $$
begin
  if to_regclass('public.grant_applications') is null then
    raise exception 'Phase 4.0A is required before Phase 4.0B';
  end if;
end
$$;

create table if not exists public.grant_awards (
  id uuid primary key default gen_random_uuid(),
  application_id uuid unique references public.grant_applications(id) on delete set null,
  donor_id uuid references public.fundraising_donors(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  title text not null,
  award_number text not null default '',
  status text not null default 'awarded' check (status in (
    'awarded','active','on_hold','completed','closed','terminated'
  )),
  award_amount numeric(16,2) not null check (award_amount >= 0),
  currency text not null default 'USD',
  award_date date,
  start_date date,
  end_date date,
  grant_manager text not null default '',
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

drop trigger if exists grant_awards_set_updated_at on public.grant_awards;
create trigger grant_awards_set_updated_at
before update on public.grant_awards
for each row execute function public.set_updated_at();

create table if not exists public.grant_agreements (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.grant_awards(id) on delete cascade,
  agreement_type text not null default 'original' check (agreement_type in (
    'original','amendment','extension','memorandum','other'
  )),
  title text not null,
  reference_number text not null default '',
  signed_date date,
  effective_date date,
  expiry_date date,
  agreement_amount numeric(16,2) check (agreement_amount is null or agreement_amount >= 0),
  currency text not null default 'USD',
  storage_path text,
  file_name text,
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  notes text not null default '',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expiry_date is null or effective_date is null or expiry_date >= effective_date)
);

drop trigger if exists grant_agreements_set_updated_at on public.grant_agreements;
create trigger grant_agreements_set_updated_at
before update on public.grant_agreements
for each row execute function public.set_updated_at();

create table if not exists public.grant_installments (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.grant_awards(id) on delete cascade,
  installment_number integer not null check (installment_number > 0),
  label text not null default '',
  expected_amount numeric(16,2) not null check (expected_amount >= 0),
  expected_date date,
  status text not null default 'planned' check (status in (
    'planned','due','partially_received','received','overdue','cancelled'
  )),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grant_id, installment_number)
);

drop trigger if exists grant_installments_set_updated_at on public.grant_installments;
create trigger grant_installments_set_updated_at
before update on public.grant_installments
for each row execute function public.set_updated_at();

create table if not exists public.grant_fund_receipts (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.grant_awards(id) on delete cascade,
  installment_id uuid references public.grant_installments(id) on delete set null,
  amount numeric(16,2) not null check (amount > 0),
  currency text not null default 'USD',
  received_date date not null,
  reference_number text not null default '',
  bank_reference text not null default '',
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.grant_reporting_obligations (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.grant_awards(id) on delete cascade,
  report_type text not null default 'narrative' check (report_type in (
    'inception','monthly','quarterly','semi_annual','annual','narrative',
    'financial','audit','final_narrative','final_financial','impact','other'
  )),
  title text not null,
  period_start date,
  period_end date,
  due_date date,
  responsible_person text not null default '',
  status text not null default 'not_started' check (status in (
    'not_started','in_progress','ready_for_review','submitted',
    'revision_requested','accepted','overdue'
  )),
  submitted_at date,
  accepted_at date,
  donor_feedback text not null default '',
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end is null or period_start is null or period_end >= period_start)
);

drop trigger if exists grant_reporting_obligations_set_updated_at on public.grant_reporting_obligations;
create trigger grant_reporting_obligations_set_updated_at
before update on public.grant_reporting_obligations
for each row execute function public.set_updated_at();

create table if not exists public.grant_report_documents (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid not null references public.grant_reporting_obligations(id) on delete cascade,
  document_kind text not null default 'other' check (document_kind in (
    'narrative','financial','impact','audit','annex','evidence','other'
  )),
  title text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.grant_impact_snapshots (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid not null unique references public.grant_reporting_obligations(id) on delete cascade,
  grant_id uuid not null references public.grant_awards(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  period_start date,
  period_end date,
  source_metric_count integer not null default 0 check (source_metric_count >= 0),
  people_reached integer not null default 0 check (people_reached >= 0),
  women_reached integer not null default 0 check (women_reached >= 0),
  men_reached integer not null default 0 check (men_reached >= 0),
  children_reached integer not null default 0 check (children_reached >= 0),
  youth_trained integer not null default 0 check (youth_trained >= 0),
  communities_reached integer not null default 0 check (communities_reached >= 0),
  trainings_conducted integer not null default 0 check (trainings_conducted >= 0),
  livelihoods_supported integer not null default 0 check (livelihoods_supported >= 0),
  notes text not null default '',
  captured_by uuid references auth.users(id) on delete set null,
  captured_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists grant_impact_snapshots_set_updated_at on public.grant_impact_snapshots;
create trigger grant_impact_snapshots_set_updated_at
before update on public.grant_impact_snapshots
for each row execute function public.set_updated_at();

-- Keep installment receipt status synchronized whenever money is recorded or removed.
create or replace function public.sync_grant_installment_status(p_installment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected numeric(16,2);
  received numeric(16,2);
  due_date date;
begin
  if p_installment_id is null then
    return;
  end if;

  select expected_amount, expected_date
    into expected, due_date
  from public.grant_installments
  where id = p_installment_id;

  if not found then
    return;
  end if;

  select coalesce(sum(amount), 0)
    into received
  from public.grant_fund_receipts
  where installment_id = p_installment_id;

  update public.grant_installments
  set status = case
    when status = 'cancelled' then 'cancelled'
    when received >= expected and expected > 0 then 'received'
    when received > 0 then 'partially_received'
    when due_date is not null and due_date < current_date then 'overdue'
    when due_date is not null and due_date <= current_date then 'due'
    else 'planned'
  end
  where id = p_installment_id;
end;
$$;

revoke all on function public.sync_grant_installment_status(uuid) from public;
grant execute on function public.sync_grant_installment_status(uuid) to authenticated;

create or replace function public.sync_grant_receipt_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_grant_installment_status(old.installment_id);
    return old;
  end if;

  perform public.sync_grant_installment_status(new.installment_id);

  if tg_op = 'UPDATE' and old.installment_id is distinct from new.installment_id then
    perform public.sync_grant_installment_status(old.installment_id);
  end if;

  return new;
end;
$$;

revoke all on function public.sync_grant_receipt_trigger() from public;

drop trigger if exists sync_grant_receipt_status on public.grant_fund_receipts;
create trigger sync_grant_receipt_status
after insert or update or delete on public.grant_fund_receipts
for each row execute function public.sync_grant_receipt_trigger();

-- RLS: Phase 4.0B follows Phase 4.0A fundraising access boundary.
alter table public.grant_awards enable row level security;
alter table public.grant_agreements enable row level security;
alter table public.grant_installments enable row level security;
alter table public.grant_fund_receipts enable row level security;
alter table public.grant_reporting_obligations enable row level security;
alter table public.grant_report_documents enable row level security;
alter table public.grant_impact_snapshots enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'grant_awards',
    'grant_agreements',
    'grant_installments',
    'grant_fund_receipts',
    'grant_reporting_obligations',
    'grant_report_documents',
    'grant_impact_snapshots'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'fundraising admins select ' || t, t);
    execute format('create policy %I on public.%I for select to authenticated using (public.can_manage_fundraising())', 'fundraising admins select ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins insert ' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_manage_fundraising())', 'fundraising admins insert ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins update ' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_manage_fundraising()) with check (public.can_manage_fundraising())', 'fundraising admins update ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins delete ' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.can_manage_fundraising())', 'fundraising admins delete ' || t, t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end
$$;

create index if not exists grant_awards_status_dates_idx on public.grant_awards(status,start_date,end_date);
create index if not exists grant_awards_donor_idx on public.grant_awards(donor_id,created_at desc);
create index if not exists grant_awards_project_idx on public.grant_awards(project_id,created_at desc);
create index if not exists grant_agreements_grant_idx on public.grant_agreements(grant_id,created_at desc);
create index if not exists grant_installments_grant_date_idx on public.grant_installments(grant_id,expected_date);
create index if not exists grant_receipts_grant_date_idx on public.grant_fund_receipts(grant_id,received_date desc);
create index if not exists grant_receipts_installment_idx on public.grant_fund_receipts(installment_id,received_date desc);
create index if not exists grant_reporting_due_idx on public.grant_reporting_obligations(status,due_date);
create index if not exists grant_reporting_grant_idx on public.grant_reporting_obligations(grant_id,due_date);
create index if not exists grant_report_documents_obligation_idx on public.grant_report_documents(obligation_id,created_at desc);
create index if not exists grant_impact_snapshots_grant_idx on public.grant_impact_snapshots(grant_id,captured_at desc);

-- Register the new operational records with Phase 3.5 audit logging when available.
do $$
declare
  t text;
begin
  if to_regprocedure('public.log_content_change()') is not null then
    foreach t in array array[
      'grant_awards',
      'grant_agreements',
      'grant_installments',
      'grant_fund_receipts',
      'grant_reporting_obligations',
      'grant_report_documents',
      'grant_impact_snapshots'
    ] loop
      execute format('drop trigger if exists audit_content_change on public.%I', t);
      execute format(
        'create trigger audit_content_change after insert or update or delete on public.%I for each row execute function public.log_content_change()',
        t
      );
    end loop;
  end if;
end
$$;

commit;
