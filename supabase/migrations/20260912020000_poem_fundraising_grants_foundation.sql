begin;

create or replace function public.can_manage_fundraising(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = coalesce(user_id, auth.uid())
      and p.status = 'active'
      and p.role in ('super_admin', 'admin')
  );
$$;

revoke all on function public.can_manage_fundraising(uuid) from public;
grant execute on function public.can_manage_fundraising(uuid) to authenticated;

create table if not exists public.fundraising_donors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  donor_type text not null default 'other' check (donor_type in (
    'un_agency','government','embassy','foundation','ingo','corporate_csr',
    'development_agency','international_donor','local_philanthropy','individual_hnwi','other'
  )),
  country text not null default '',
  website_url text not null default '',
  contact_person text not null default '',
  contact_title text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  funding_areas text[] not null default '{}',
  preferred_sdgs text[] not null default '{}',
  preferred_geographies text[] not null default '{}',
  typical_grant_min numeric(16,2),
  typical_grant_max numeric(16,2),
  currency text not null default 'USD',
  funding_cycle text not null default '',
  relationship_status text not null default 'prospect' check (relationship_status in ('prospect','active','past','inactive')),
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (typical_grant_min is null or typical_grant_min >= 0),
  check (typical_grant_max is null or typical_grant_max >= 0),
  check (typical_grant_min is null or typical_grant_max is null or typical_grant_max >= typical_grant_min)
);

drop trigger if exists fundraising_donors_set_updated_at on public.fundraising_donors;
create trigger fundraising_donors_set_updated_at before update on public.fundraising_donors
for each row execute function public.set_updated_at();

create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.fundraising_donors(id) on delete set null,
  title text not null,
  funding_program text not null default '',
  reference_number text not null default '',
  source_url text not null default '',
  currency text not null default 'USD',
  minimum_grant numeric(16,2),
  maximum_grant numeric(16,2),
  eligible_locations text[] not null default '{}',
  eligible_themes text[] not null default '{}',
  relevant_sdgs text[] not null default '{}',
  opening_date date,
  deadline date,
  eligibility_notes text not null default '',
  internal_notes text not null default '',
  responsible_person text not null default '',
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'identified' check (status in ('identified','reviewing','eligible','not_eligible','preparing','submitted','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (minimum_grant is null or minimum_grant >= 0),
  check (maximum_grant is null or maximum_grant >= 0),
  check (minimum_grant is null or maximum_grant is null or maximum_grant >= minimum_grant)
);

drop trigger if exists funding_opportunities_set_updated_at on public.funding_opportunities;
create trigger funding_opportunities_set_updated_at before update on public.funding_opportunities
for each row execute function public.set_updated_at();

create table if not exists public.grant_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.funding_opportunities(id) on delete set null,
  donor_id uuid references public.fundraising_donors(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  title text not null,
  stage text not null default 'draft' check (stage in (
    'draft','concept_note','internal_review','proposal_development','budget_review','management_approval',
    'ready_to_submit','submitted','under_review','clarification_requested','shortlisted','awarded','rejected','withdrawn'
  )),
  requested_amount numeric(16,2),
  currency text not null default 'USD',
  project_duration_months integer,
  proposal_summary text not null default '',
  objectives text not null default '',
  expected_outcomes text not null default '',
  target_population text not null default '',
  geographic_area text not null default '',
  relevant_sdgs text[] not null default '{}',
  lead_person text not null default '',
  submission_deadline date,
  submitted_at date,
  decision_date date,
  decision_notes text not null default '',
  internal_notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requested_amount is null or requested_amount >= 0),
  check (project_duration_months is null or project_duration_months > 0)
);

drop trigger if exists grant_applications_set_updated_at on public.grant_applications;
create trigger grant_applications_set_updated_at before update on public.grant_applications
for each row execute function public.set_updated_at();

create table if not exists public.grant_application_checklist (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.grant_applications(id) on delete cascade,
  item_key text not null,
  label text not null,
  display_order integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (application_id, item_key)
);

create or replace function public.seed_grant_application_checklist()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.grant_application_checklist(application_id,item_key,label,display_order) values
    (new.id,'eligibility_confirmed','Eligibility confirmed',10),
    (new.id,'concept_approved','Concept approved internally',20),
    (new.id,'technical_proposal_complete','Technical proposal complete',30),
    (new.id,'budget_complete','Budget complete',40),
    (new.id,'logframe_complete','Logframe / results framework complete',50),
    (new.id,'supporting_documents_attached','Supporting documents attached',60),
    (new.id,'management_approval','Management approval received',70),
    (new.id,'final_review','Final quality review complete',80),
    (new.id,'submitted','Application submitted',90)
  on conflict (application_id,item_key) do nothing;
  return new;
end;
$$;
revoke all on function public.seed_grant_application_checklist() from public;
drop trigger if exists seed_grant_application_checklist on public.grant_applications;
create trigger seed_grant_application_checklist after insert on public.grant_applications
for each row execute function public.seed_grant_application_checklist();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('grant-documents','grant-documents',false,26214400,array[
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain'
])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table if not exists public.grant_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.grant_applications(id) on delete cascade,
  document_type text not null default 'other' check (document_type in (
    'concept_note','proposal','budget','logframe','workplan','organization_profile','registration_document','policy','previous_report','annex','other'
  )),
  title text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.fundraising_donors enable row level security;
alter table public.funding_opportunities enable row level security;
alter table public.grant_applications enable row level security;
alter table public.grant_application_checklist enable row level security;
alter table public.grant_application_documents enable row level security;

do $$
declare t text;
begin
  foreach t in array array['fundraising_donors','funding_opportunities','grant_applications','grant_application_checklist','grant_application_documents'] loop
    execute format('drop policy if exists %I on public.%I', 'fundraising admins select '||t, t);
    execute format('create policy %I on public.%I for select to authenticated using (public.can_manage_fundraising())', 'fundraising admins select '||t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins insert '||t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.can_manage_fundraising())', 'fundraising admins insert '||t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins update '||t, t);
    execute format('create policy %I on public.%I for update to authenticated using (public.can_manage_fundraising()) with check (public.can_manage_fundraising())', 'fundraising admins update '||t, t);
    execute format('drop policy if exists %I on public.%I', 'fundraising admins delete '||t, t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.can_manage_fundraising())', 'fundraising admins delete '||t, t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

drop policy if exists "fundraising admins read grant documents" on storage.objects;
create policy "fundraising admins read grant documents" on storage.objects for select to authenticated
using (bucket_id='grant-documents' and public.can_manage_fundraising());
drop policy if exists "fundraising admins upload grant documents" on storage.objects;
create policy "fundraising admins upload grant documents" on storage.objects for insert to authenticated
with check (bucket_id='grant-documents' and public.can_manage_fundraising());
drop policy if exists "fundraising admins update grant documents" on storage.objects;
create policy "fundraising admins update grant documents" on storage.objects for update to authenticated
using (bucket_id='grant-documents' and public.can_manage_fundraising())
with check (bucket_id='grant-documents' and public.can_manage_fundraising());
drop policy if exists "fundraising admins delete grant documents" on storage.objects;
create policy "fundraising admins delete grant documents" on storage.objects for delete to authenticated
using (bucket_id='grant-documents' and public.can_manage_fundraising());

create index if not exists fundraising_donors_status_name_idx on public.fundraising_donors(relationship_status,name);
create index if not exists funding_opportunities_deadline_idx on public.funding_opportunities(status,deadline);
create index if not exists funding_opportunities_donor_idx on public.funding_opportunities(donor_id,deadline);
create index if not exists grant_applications_stage_deadline_idx on public.grant_applications(stage,submission_deadline);
create index if not exists grant_applications_donor_idx on public.grant_applications(donor_id,created_at desc);
create index if not exists grant_application_checklist_app_idx on public.grant_application_checklist(application_id,display_order);
create index if not exists grant_application_documents_app_idx on public.grant_application_documents(application_id,created_at desc);

commit;
