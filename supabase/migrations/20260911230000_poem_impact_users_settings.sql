begin;

-- ---------------------------------------------------------
-- Profiles / access governance
-- ---------------------------------------------------------

alter table public.profiles
  add column if not exists full_name text not null default '';

alter table public.profiles
  add column if not exists status text not null default 'active';

alter table public.profiles
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'viewer'));

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('active', 'disabled'));

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
    where p.id = coalesce(user_id, auth.uid())
      and p.status = 'active'
      and p.role in ('super_admin', 'admin', 'editor')
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
    where p.id = coalesce(user_id, auth.uid())
      and p.status = 'active'
      and p.role in ('super_admin', 'admin')
  );
$$;

create or replace function public.is_super_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = coalesce(user_id, auth.uid())
      and p.status = 'active'
      and p.role = 'super_admin'
  );
$$;

create or replace function public.touch_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_seen_at = now()
  where id = auth.uid()
    and status = 'active';
end;
$$;

revoke all on function public.can_manage_content(uuid) from public;
revoke all on function public.is_admin(uuid) from public;
revoke all on function public.is_super_admin(uuid) from public;
revoke all on function public.touch_last_seen() from public;

grant execute on function public.can_manage_content(uuid) to anon, authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_super_admin(uuid) to authenticated;
grant execute on function public.touch_last_seen() to authenticated;

-- Replace profile policies so only super admins can manage other users.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select polname
    from pg_policy
    where polrelid = 'public.profiles'::regclass
  loop
    execute format('drop policy if exists %I on public.profiles', policy_name);
  end loop;
end
$$;

create policy "profiles read own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "super admins read profiles"
on public.profiles for select
to authenticated
using (public.is_super_admin());

create policy "super admins update profiles"
on public.profiles for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

grant select on public.profiles to authenticated;
grant update (full_name, role, status, invited_by) on public.profiles to authenticated;

-- ---------------------------------------------------------
-- Admin access audit
-- ---------------------------------------------------------

create table if not exists public.admin_access_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null
    check (action in ('invite', 'role_change', 'status_change')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_access_log enable row level security;

drop policy if exists "super admins read access log" on public.admin_access_log;
create policy "super admins read access log"
on public.admin_access_log for select
to authenticated
using (public.is_super_admin());

drop policy if exists "super admins insert access log" on public.admin_access_log;
create policy "super admins insert access log"
on public.admin_access_log for insert
to authenticated
with check (
  public.is_super_admin()
  and actor_id = auth.uid()
);

grant select, insert on public.admin_access_log to authenticated;

-- ---------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------

create table if not exists public.site_content_settings (
  id smallint primary key default 1 check (id = 1),
  organization_name text not null default 'Participatory Organization for Empowering Marginalized',
  short_name text not null default 'POEM',
  tagline text not null default 'Communities leading change.',
  address text not null default '',
  city text not null default 'Mirpurkhas',
  province text not null default 'Sindh',
  country text not null default 'Pakistan',
  phone text not null default '',
  email text not null default '',
  facebook_url text not null default '',
  linkedin_url text not null default '',
  donation_instructions text not null default '',
  homepage_eyebrow text not null default 'Participatory development',
  homepage_title text not null default 'Communities leading change.',
  homepage_description text not null default 'POEM works alongside marginalized communities to strengthen opportunity, resilience and participation.',
  homepage_primary_label text not null default 'Explore our work',
  homepage_primary_href text not null default '/projects',
  homepage_secondary_label text not null default 'About POEM',
  homepage_secondary_href text not null default '/about',
  seo_title text not null default 'POEM Pakistan',
  seo_description text not null default 'Participatory Organization for Empowering Marginalized — Pakistan.',
  updated_at timestamptz not null default now()
);

insert into public.site_content_settings (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists site_content_settings_set_updated_at on public.site_content_settings;
create trigger site_content_settings_set_updated_at
before update on public.site_content_settings
for each row execute function public.set_updated_at();

alter table public.site_content_settings enable row level security;

drop policy if exists "public read site settings" on public.site_content_settings;
create policy "public read site settings"
on public.site_content_settings for select
to anon, authenticated
using (true);

drop policy if exists "admins update site settings" on public.site_content_settings;
create policy "admins update site settings"
on public.site_content_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.site_content_settings to anon, authenticated;
grant update on public.site_content_settings to authenticated;

-- ---------------------------------------------------------
-- Impact metrics
-- Phase 3.1 already created project_metrics. Extend it.
-- ---------------------------------------------------------

alter table public.project_metrics
  add column if not exists district text not null default '';

alter table public.project_metrics
  add column if not exists trainings_conducted integer not null default 0;

alter table public.project_metrics
  add column if not exists livelihoods_supported integer not null default 0;

alter table public.project_metrics
  add column if not exists published boolean not null default false;

alter table public.project_metrics
  add constraint project_metrics_trainings_nonnegative
  check (trainings_conducted >= 0) not valid;

alter table public.project_metrics
  validate constraint project_metrics_trainings_nonnegative;

alter table public.project_metrics
  add constraint project_metrics_livelihoods_nonnegative
  check (livelihoods_supported >= 0) not valid;

alter table public.project_metrics
  validate constraint project_metrics_livelihoods_nonnegative;

alter table public.project_metrics enable row level security;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select polname
    from pg_policy
    where polrelid = 'public.project_metrics'::regclass
  loop
    execute format('drop policy if exists %I on public.project_metrics', policy_name);
  end loop;
end
$$;

create policy "public read published impact metrics"
on public.project_metrics for select
to anon, authenticated
using (
  (
    published
    and exists (
      select 1
      from public.projects p
      where p.id = project_metrics.project_id
        and p.published
    )
  )
  or public.can_manage_content()
);

create policy "staff insert impact metrics"
on public.project_metrics for insert
to authenticated
with check (public.can_manage_content());

create policy "staff update impact metrics"
on public.project_metrics for update
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy "staff delete impact metrics"
on public.project_metrics for delete
to authenticated
using (public.can_manage_content());

grant select on public.project_metrics to anon, authenticated;
grant insert, update, delete on public.project_metrics to authenticated;

commit;
