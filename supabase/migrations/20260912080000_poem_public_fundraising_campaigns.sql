begin;

-- =========================================================
-- POEM Phase 4.0C — Public Fundraising Campaigns & Analytics
-- =========================================================

do $$
begin
  if to_regclass('public.grant_awards') is null
     or to_regclass('public.fundraising_donors') is null then
    raise exception 'Phase 4.0A and Phase 4.0B are required before Phase 4.0C';
  end if;
end
$$;

-- ---------------------------------------------------------
-- 1) Project-level funding targets and public funding status
-- ---------------------------------------------------------

create table if not exists public.project_funding_profiles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  funding_target numeric(16,2) not null default 0 check (funding_target >= 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  fundraising_status text not null default 'seeking' check (
    fundraising_status in ('seeking','partially_funded','fully_funded','closed')
  ),
  funding_deadline date,
  public_fundraising_enabled boolean not null default false,
  public_summary text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists project_funding_profiles_set_updated_at
  on public.project_funding_profiles;
create trigger project_funding_profiles_set_updated_at
before update on public.project_funding_profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 2) Public fundraising campaigns
-- ---------------------------------------------------------

create table if not exists public.fundraising_campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  slug text not null unique,
  title text not null,
  short_summary text not null default '',
  story text not null default '',
  expected_impact text not null default '',
  beneficiary_target integer check (beneficiary_target is null or beneficiary_target >= 0),
  location text not null default '',
  category text not null default '',
  funding_target numeric(16,2) not null default 0 check (funding_target >= 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  start_date date,
  end_date date,
  status text not null default 'draft' check (
    status in ('draft','active','paused','completed','closed')
  ),
  featured boolean not null default false,
  published boolean not null default false,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  donation_instructions text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fundraising_campaigns_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint fundraising_campaigns_date_order
    check (end_date is null or start_date is null or end_date >= start_date)
);

drop trigger if exists fundraising_campaigns_set_updated_at
  on public.fundraising_campaigns;
create trigger fundraising_campaigns_set_updated_at
before update on public.fundraising_campaigns
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 3) Donation ledger + verification workflow
-- ---------------------------------------------------------

create table if not exists public.fundraising_donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.fundraising_campaigns(id) on delete restrict,
  donor_name text not null default '',
  donor_type text not null default 'individual' check (
    donor_type in ('individual','corporate','foundation','community','anonymous','other')
  ),
  amount numeric(16,2) not null check (amount > 0),
  currency text not null default 'PKR' check (char_length(currency) = 3),
  donation_date date not null default current_date,
  payment_method text not null default 'bank_transfer' check (
    payment_method in ('bank_transfer','cash','cheque','online_transfer','corporate_donation','other')
  ),
  transaction_reference text not null default '',
  receipt_number text not null default '',
  show_donor_publicly boolean not null default false,
  status text not null default 'pending' check (
    status in ('pending','verified','rejected','refunded')
  ),
  notes text not null default '',
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists fundraising_donations_set_updated_at
  on public.fundraising_donations;
create trigger fundraising_donations_set_updated_at
before update on public.fundraising_donations
for each row execute function public.set_updated_at();

create unique index if not exists fundraising_donations_receipt_number_uidx
  on public.fundraising_donations (receipt_number)
  where receipt_number <> '';

create or replace function public.normalize_fundraising_values()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_table_name = 'project_funding_profiles' then
    new.currency := upper(trim(new.currency));
    return new;
  end if;

  if tg_table_name = 'fundraising_campaigns' then
    new.currency := upper(trim(new.currency));
    new.slug := lower(trim(new.slug));
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_project_funding_values on public.project_funding_profiles;
create trigger normalize_project_funding_values
before insert or update on public.project_funding_profiles
for each row execute function public.normalize_fundraising_values();

drop trigger if exists normalize_campaign_values on public.fundraising_campaigns;
create trigger normalize_campaign_values
before insert or update on public.fundraising_campaigns
for each row execute function public.normalize_fundraising_values();

create or replace function public.validate_fundraising_donation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  campaign_currency text;
begin
  select currency into campaign_currency
  from public.fundraising_campaigns
  where id = new.campaign_id;

  if not found then
    raise exception 'Fundraising campaign does not exist';
  end if;

  new.currency := campaign_currency;

  if new.status = 'verified' then
    new.verified_at := coalesce(new.verified_at, now());
    new.verified_by := coalesce(new.verified_by, auth.uid());
  else
    new.verified_at := null;
    new.verified_by := null;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_fundraising_donation on public.fundraising_donations;
create trigger validate_fundraising_donation
before insert or update on public.fundraising_donations
for each row execute function public.validate_fundraising_donation();

-- ---------------------------------------------------------
-- 4) RLS boundaries
-- ---------------------------------------------------------

alter table public.project_funding_profiles enable row level security;
alter table public.fundraising_campaigns enable row level security;
alter table public.fundraising_donations enable row level security;

-- Project funding profiles contain operational funding totals. Direct table
-- access is admin-only; the public receives a sanitized aggregate RPC.
drop policy if exists "fundraising admins read project funding profiles"
  on public.project_funding_profiles;
create policy "fundraising admins read project funding profiles"
on public.project_funding_profiles for select
to authenticated
using (public.can_manage_fundraising());

drop policy if exists "fundraising admins manage project funding profiles"
  on public.project_funding_profiles;
create policy "fundraising admins manage project funding profiles"
on public.project_funding_profiles for all
to authenticated
using (public.can_manage_fundraising())
with check (public.can_manage_fundraising());

-- Campaign table access remains admin-only. Public pages use the sanitized
-- SECURITY DEFINER RPC below so internal metadata such as created_by is not
-- exposed by direct table reads.
drop policy if exists "public read published fundraising campaigns"
  on public.fundraising_campaigns;

drop policy if exists "fundraising admins read campaigns"
  on public.fundraising_campaigns;
create policy "fundraising admins read campaigns"
on public.fundraising_campaigns for select
to authenticated
using (public.can_manage_fundraising());

drop policy if exists "fundraising admins manage campaigns"
  on public.fundraising_campaigns;
create policy "fundraising admins manage campaigns"
on public.fundraising_campaigns for all
to authenticated
using (public.can_manage_fundraising())
with check (public.can_manage_fundraising());

-- Donation ledger remains private. Public supporter information is exposed
-- only through a sanitized SECURITY DEFINER function below.
drop policy if exists "fundraising admins read donations"
  on public.fundraising_donations;
create policy "fundraising admins read donations"
on public.fundraising_donations for select
to authenticated
using (public.can_manage_fundraising());

drop policy if exists "fundraising admins manage donations"
  on public.fundraising_donations;
create policy "fundraising admins manage donations"
on public.fundraising_donations for all
to authenticated
using (public.can_manage_fundraising())
with check (public.can_manage_fundraising());

grant select, insert, update, delete on public.project_funding_profiles to authenticated;
grant select, insert, update, delete on public.fundraising_campaigns to authenticated;
revoke all on public.fundraising_campaigns from anon;
grant select, insert, update, delete on public.fundraising_donations to authenticated;

-- ---------------------------------------------------------
-- 5) Sanitized public campaign aggregate
-- ---------------------------------------------------------

create or replace function public.get_public_fundraising_campaigns(
  p_slug text default null
)
returns table (
  id uuid,
  slug text,
  title text,
  short_summary text,
  story text,
  expected_impact text,
  beneficiary_target integer,
  location text,
  category text,
  funding_target numeric,
  currency text,
  start_date date,
  end_date date,
  status text,
  featured boolean,
  donation_instructions text,
  project_id uuid,
  project_slug text,
  project_title text,
  program_title text,
  cover_bucket text,
  cover_path text,
  cover_alt_text text,
  amount_raised numeric,
  funding_gap numeric,
  progress_percent numeric,
  verified_donations bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with donation_totals as (
    select
      d.campaign_id,
      coalesce(sum(d.amount), 0)::numeric as amount_raised,
      count(*)::bigint as verified_donations
    from public.fundraising_donations d
    where d.status = 'verified'
    group by d.campaign_id
  )
  select
    c.id,
    c.slug,
    c.title,
    c.short_summary,
    c.story,
    c.expected_impact,
    c.beneficiary_target,
    c.location,
    c.category,
    c.funding_target,
    c.currency,
    c.start_date,
    c.end_date,
    c.status,
    c.featured,
    c.donation_instructions,
    p.id as project_id,
    p.slug as project_slug,
    p.title as project_title,
    pr.title as program_title,
    m.bucket as cover_bucket,
    m.path as cover_path,
    m.alt_text as cover_alt_text,
    coalesce(dt.amount_raised, 0)::numeric as amount_raised,
    greatest(c.funding_target - coalesce(dt.amount_raised, 0), 0)::numeric as funding_gap,
    case
      when c.funding_target > 0 then
        least(round((coalesce(dt.amount_raised, 0) / c.funding_target) * 100, 2), 100)
      else 0
    end::numeric as progress_percent,
    coalesce(dt.verified_donations, 0)::bigint as verified_donations
  from public.fundraising_campaigns c
  left join public.projects p on p.id = c.project_id
  left join public.programs pr on pr.id = c.program_id
  left join public.media_assets m on m.id = c.cover_asset_id
  left join donation_totals dt on dt.campaign_id = c.id
  where c.published = true
    and (p_slug is null or c.slug = p_slug)
  order by c.featured desc, c.created_at desc;
$$;

revoke all on function public.get_public_fundraising_campaigns(text) from public;
grant execute on function public.get_public_fundraising_campaigns(text) to anon, authenticated;

create or replace function public.get_public_campaign_supporters(
  p_campaign_id uuid,
  p_limit integer default 10
)
returns table (
  display_name text,
  amount numeric,
  currency text,
  donation_date date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when d.show_donor_publicly and trim(d.donor_name) <> '' then d.donor_name
      else 'Anonymous Donor'
    end as display_name,
    d.amount,
    d.currency,
    d.donation_date
  from public.fundraising_donations d
  join public.fundraising_campaigns c on c.id = d.campaign_id
  where d.campaign_id = p_campaign_id
    and d.status = 'verified'
    and c.published = true
  order by d.donation_date desc, d.created_at desc
  limit least(greatest(coalesce(p_limit, 10), 1), 25);
$$;

revoke all on function public.get_public_campaign_supporters(uuid, integer) from public;
grant execute on function public.get_public_campaign_supporters(uuid, integer) to anon, authenticated;

-- ---------------------------------------------------------
-- 6) Public project funding summary: no donor/contact details.
--    Cross-currency amounts are intentionally excluded.
-- ---------------------------------------------------------

create or replace function public.get_public_project_funding_by_slug(
  p_slug text
)
returns table (
  project_id uuid,
  project_slug text,
  funding_target numeric,
  currency text,
  fundraising_status text,
  funding_deadline date,
  public_summary text,
  grant_secured numeric,
  grant_received numeric,
  public_donations numeric,
  total_secured numeric,
  total_received numeric,
  funding_gap numeric,
  progress_percent numeric,
  campaign_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  with profile as (
    select fp.*, p.slug as project_slug
    from public.project_funding_profiles fp
    join public.projects p on p.id = fp.project_id
    where p.slug = p_slug
      and p.published = true
      and fp.public_fundraising_enabled = true
    limit 1
  ),
  grant_totals as (
    select
      g.project_id,
      coalesce(sum(g.award_amount) filter (
        where g.status <> 'terminated'
      ), 0)::numeric as grant_secured
    from public.grant_awards g
    join profile fp on fp.project_id = g.project_id
    where g.currency = fp.currency
    group by g.project_id
  ),
  receipt_totals as (
    select
      g.project_id,
      coalesce(sum(r.amount), 0)::numeric as grant_received
    from public.grant_fund_receipts r
    join public.grant_awards g on g.id = r.grant_id
    join profile fp on fp.project_id = g.project_id
    where r.currency = fp.currency
    group by g.project_id
  ),
  donation_totals as (
    select
      c.project_id,
      coalesce(sum(d.amount), 0)::numeric as public_donations
    from public.fundraising_donations d
    join public.fundraising_campaigns c on c.id = d.campaign_id
    join profile fp on fp.project_id = c.project_id
    where d.status = 'verified'
      and d.currency = fp.currency
    group by c.project_id
  ),
  primary_campaign as (
    select c.project_id, c.slug
    from public.fundraising_campaigns c
    join profile fp on fp.project_id = c.project_id
    where c.published = true
      and c.status in ('active','paused')
    order by c.featured desc, c.created_at desc
    limit 1
  )
  select
    fp.project_id,
    fp.project_slug,
    fp.funding_target,
    fp.currency,
    fp.fundraising_status,
    fp.funding_deadline,
    fp.public_summary,
    coalesce(gt.grant_secured, 0)::numeric,
    coalesce(rt.grant_received, 0)::numeric,
    coalesce(dt.public_donations, 0)::numeric,
    (coalesce(gt.grant_secured, 0) + coalesce(dt.public_donations, 0))::numeric as total_secured,
    (coalesce(rt.grant_received, 0) + coalesce(dt.public_donations, 0))::numeric as total_received,
    greatest(
      fp.funding_target - (coalesce(gt.grant_secured, 0) + coalesce(dt.public_donations, 0)),
      0
    )::numeric as funding_gap,
    case
      when fp.funding_target > 0 then least(
        round(
          ((coalesce(gt.grant_secured, 0) + coalesce(dt.public_donations, 0)) / fp.funding_target) * 100,
          2
        ),
        100
      )
      else 0
    end::numeric as progress_percent,
    pc.slug as campaign_slug
  from profile fp
  left join grant_totals gt on gt.project_id = fp.project_id
  left join receipt_totals rt on rt.project_id = fp.project_id
  left join donation_totals dt on dt.project_id = fp.project_id
  left join primary_campaign pc on pc.project_id = fp.project_id;
$$;

revoke all on function public.get_public_project_funding_by_slug(text) from public;
grant execute on function public.get_public_project_funding_by_slug(text) to anon, authenticated;

-- ---------------------------------------------------------
-- 7) Indexes and audit coverage
-- ---------------------------------------------------------

create index if not exists project_funding_profiles_public_idx
  on public.project_funding_profiles (public_fundraising_enabled, fundraising_status);

create index if not exists fundraising_campaigns_public_idx
  on public.fundraising_campaigns (published, featured, status, end_date);

create index if not exists fundraising_campaigns_project_idx
  on public.fundraising_campaigns (project_id, published, status);

create index if not exists fundraising_donations_campaign_status_idx
  on public.fundraising_donations (campaign_id, status, donation_date desc);

create index if not exists fundraising_donations_status_date_idx
  on public.fundraising_donations (status, donation_date desc);

do $$
declare
  table_name_item text;
begin
  foreach table_name_item in array array[
    'project_funding_profiles',
    'fundraising_campaigns',
    'fundraising_donations'
  ]
  loop
    if to_regclass('public.' || table_name_item) is not null
       and to_regprocedure('public.log_content_change()') is not null then
      execute format(
        'drop trigger if exists audit_content_change on public.%I',
        table_name_item
      );
      execute format(
        'create trigger audit_content_change after insert or update or delete on public.%I for each row execute function public.log_content_change()',
        table_name_item
      );
    end if;
  end loop;
end
$$;

commit;
