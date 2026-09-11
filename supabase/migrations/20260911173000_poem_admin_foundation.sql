begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer'
    check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text not null,
  summary text not null default '',
  description text not null default '',
  focus text[] not null default '{}',
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programs_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete set null,
  slug text not null unique,
  title text not null,
  category text not null default '',
  summary text not null default '',
  challenge text not null default '',
  response text not null default '',
  outcomes text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  location text not null default '',
  district text not null default '',
  province text not null default 'Sindh',
  start_date date,
  end_date date,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint projects_date_order check (
    end_date is null or start_date is null or end_date >= start_date
  )
);

create table if not exists public.project_sdgs (
  project_id uuid not null references public.projects(id) on delete cascade,
  sdg_code text not null,
  primary key (project_id, sdg_code)
);

create table if not exists public.project_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reporting_year integer not null
    check (reporting_year between 2000 and 2100),
  people_reached integer not null default 0 check (people_reached >= 0),
  women_reached integer not null default 0 check (women_reached >= 0),
  men_reached integer not null default 0 check (men_reached >= 0),
  children_reached integer not null default 0 check (children_reached >= 0),
  youth_trained integer not null default 0 check (youth_trained >= 0),
  communities_reached integer not null default 0 check (communities_reached >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, reporting_year)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null default '' check (char_length(phone) <= 40),
  inquiry_type text not null default 'General inquiry'
    check (char_length(inquiry_type) between 2 and 80),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists project_metrics_set_updated_at on public.project_metrics;
create trigger project_metrics_set_updated_at
before update on public.project_metrics
for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  'viewer'
from auth.users u
on conflict (id) do nothing;

create or replace function public.can_manage_content(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'admin'
  );
$$;

revoke all on function public.can_manage_content(uuid) from public;
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.can_manage_content(uuid) to anon, authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.projects enable row level security;
alter table public.project_sdgs enable row level security;
alter table public.project_metrics enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read published programs" on public.programs;
create policy "public read published programs"
on public.programs for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff insert programs" on public.programs;
create policy "staff insert programs"
on public.programs for insert
to authenticated
with check (public.can_manage_content());

drop policy if exists "staff update programs" on public.programs;
create policy "staff update programs"
on public.programs for update
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "staff delete programs" on public.programs;
create policy "staff delete programs"
on public.programs for delete
to authenticated
using (public.can_manage_content());

drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects"
on public.projects for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff insert projects" on public.projects;
create policy "staff insert projects"
on public.projects for insert
to authenticated
with check (public.can_manage_content());

drop policy if exists "staff update projects" on public.projects;
create policy "staff update projects"
on public.projects for update
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "staff delete projects" on public.projects;
create policy "staff delete projects"
on public.projects for delete
to authenticated
using (public.can_manage_content());

drop policy if exists "public read project sdgs" on public.project_sdgs;
create policy "public read project sdgs"
on public.project_sdgs for select
to anon, authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_sdgs.project_id
      and (p.published or public.can_manage_content())
  )
);

drop policy if exists "staff manage project sdgs" on public.project_sdgs;
create policy "staff manage project sdgs"
on public.project_sdgs for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read project metrics" on public.project_metrics;
create policy "public read project metrics"
on public.project_metrics for select
to anon, authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_metrics.project_id
      and (p.published or public.can_manage_content())
  )
);

drop policy if exists "staff manage project metrics" on public.project_metrics;
create policy "staff manage project metrics"
on public.project_metrics for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "anyone submit contact message" on public.contact_messages;
create policy "anyone submit contact message"
on public.contact_messages for insert
to anon, authenticated
with check (true);

drop policy if exists "admins read contact messages" on public.contact_messages;
create policy "admins read contact messages"
on public.contact_messages for select
to authenticated
using (public.is_admin());

drop policy if exists "admins update contact messages" on public.contact_messages;
create policy "admins update contact messages"
on public.contact_messages for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins delete contact messages" on public.contact_messages;
create policy "admins delete contact messages"
on public.contact_messages for delete
to authenticated
using (public.is_admin());

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.programs, public.projects, public.project_sdgs, public.project_metrics, public.site_settings to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on public.programs, public.projects, public.project_sdgs, public.project_metrics to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;

insert into public.programs
  (slug, title, short_title, summary, description, focus, display_order, published)
values
  (
    'education-youth',
    'Education & Youth',
    'Education',
    'Expanding access to learning, skills and opportunities that help young people build stronger futures.',
    'POEM supports community-centered education and youth development initiatives designed around local needs, inclusion and practical opportunity.',
    array['Access to inclusive learning','Youth skills and leadership','Community learning spaces','Career readiness and mentoring'],
    10,
    true
  ),
  (
    'livelihoods-skills',
    'Livelihoods & Skills',
    'Livelihoods',
    'Building practical skills and pathways that support dignified, sustainable livelihoods.',
    'Our livelihood work connects people with practical skills, local market opportunities and support systems that strengthen economic resilience.',
    array['Market-oriented skills','Enterprise readiness','Employment pathways','Community economic resilience'],
    20,
    true
  ),
  (
    'community-empowerment',
    'Community Empowerment',
    'Community',
    'Helping communities participate in decisions, organize around priorities and lead local change.',
    'POEM places participation at the center of development by working with communities as partners in identifying needs, shaping responses and reviewing results.',
    array['Community participation','Local leadership','Inclusive planning','Social accountability'],
    30,
    true
  ),
  (
    'resilience-development',
    'Resilience & Development',
    'Resilience',
    'Supporting stronger, more resilient communities through sustainable and people-centered development.',
    'POEM works to strengthen community resilience by connecting immediate priorities with longer-term social, environmental and institutional capacity.',
    array['Community resilience','Sustainable development','Local preparedness','Inclusive recovery'],
    40,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  short_title = excluded.short_title,
  summary = excluded.summary,
  description = excluded.description,
  focus = excluded.focus,
  display_order = excluded.display_order;

insert into public.projects
  (
    program_id, slug, title, category, summary, challenge, response, outcomes,
    status, location, district, province, featured, published
  )
select
  p.id,
  'youth-skills-economic-empowerment',
  'Youth Skills & Economic Empowerment',
  'Livelihoods',
  'Creating practical pathways for young people through market-oriented skills, confidence building and community support.',
  'Young people in underserved communities often face limited access to practical training, career guidance and local earning opportunities.',
  'This project model combines skills development, mentoring and community engagement to help participants move from training toward economic opportunity.',
  array['Improved access to practical skills','Stronger employment and enterprise readiness','Greater confidence and community participation'],
  'active',
  'Mirpurkhas, Sindh',
  'Mirpurkhas',
  'Sindh',
  true,
  true
from public.programs p
where p.slug = 'livelihoods-skills'
on conflict (slug) do nothing;

insert into public.projects
  (
    program_id, slug, title, category, summary, challenge, response, outcomes,
    status, location, district, province, featured, published
  )
select
  p.id,
  'inclusive-community-learning',
  'Inclusive Community Learning',
  'Education',
  'Strengthening inclusive learning opportunities for children, youth and underserved communities.',
  'Geography, poverty and social exclusion can reduce access to consistent, relevant learning opportunities.',
  'POEM works with communities to identify learning barriers and develop locally appropriate education and youth support activities.',
  array['Improved participation in learning','Stronger community ownership','More inclusive local education support'],
  'active',
  'Sindh, Pakistan',
  '',
  'Sindh',
  true,
  true
from public.programs p
where p.slug = 'education-youth'
on conflict (slug) do nothing;

insert into public.projects
  (
    program_id, slug, title, category, summary, challenge, response, outcomes,
    status, location, district, province, featured, published
  )
select
  p.id,
  'community-led-development',
  'Community-Led Development',
  'Community',
  'Working directly with communities to identify priorities and build sustainable local solutions.',
  'Development efforts are less effective when communities have limited influence over priorities, implementation and accountability.',
  'POEM facilitates participatory planning and locally-led action so communities can contribute to decisions and track progress.',
  array['Stronger local participation','More responsive interventions','Greater community ownership'],
  'active',
  'Rural Sindh',
  '',
  'Sindh',
  true,
  true
from public.programs p
where p.slug = 'community-empowerment'
on conflict (slug) do nothing;

insert into public.project_sdgs (project_id, sdg_code)
select id, unnest(array['SDG 4','SDG 5','SDG 8','SDG 10'])
from public.projects
where slug = 'youth-skills-economic-empowerment'
on conflict do nothing;

insert into public.project_sdgs (project_id, sdg_code)
select id, unnest(array['SDG 4','SDG 5','SDG 10'])
from public.projects
where slug = 'inclusive-community-learning'
on conflict do nothing;

insert into public.project_sdgs (project_id, sdg_code)
select id, unnest(array['SDG 10','SDG 11','SDG 16','SDG 17'])
from public.projects
where slug = 'community-led-development'
on conflict do nothing;

insert into public.site_settings (key, value)
values
  ('organization', jsonb_build_object(
    'name', 'Participatory Organization for Empowering Marginalized',
    'short_name', 'POEM',
    'location', 'Mirpurkhas, Sindh, Pakistan'
  ))
on conflict (key) do nothing;

commit;
