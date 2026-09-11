begin;

-- Extend media bucket metadata validation from Phase 3.2.
alter table public.media_assets
  drop constraint if exists media_assets_bucket_check;

alter table public.media_assets
  add constraint media_assets_bucket_check
  check (bucket in ('project-media', 'documents', 'team', 'partners'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'team',
    'team',
    true,
    5242880,
    array['image/jpeg','image/png','image/webp']
  ),
  (
    'partners',
    'partners',
    true,
    5242880,
    array['image/jpeg','image/png','image/webp','image/svg+xml']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  partner_type text not null default 'partner'
    check (partner_type in ('donor', 'government', 'ngo', 'ingo', 'corporate', 'academic', 'network', 'partner')),
  description text not null default '',
  website_url text not null default '',
  logo_asset_id uuid references public.media_assets(id) on delete set null,
  display_order integer not null default 0,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partners_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null,
  member_type text not null default 'team'
    check (member_type in ('team', 'board', 'advisor')),
  bio text not null default '',
  email text not null default '',
  linkedin_url text not null default '',
  photo_asset_id uuid references public.media_assets(id) on delete set null,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'update'
    check (category in ('update', 'event', 'announcement', 'press-release')),
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  department text not null default '',
  location text not null default '',
  employment_type text not null default 'Full-time',
  summary text not null default '',
  description text not null default '',
  requirements text not null default '',
  apply_instructions text not null default '',
  apply_url text not null default '',
  deadline timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'archived')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint careers_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  reference_number text not null default '',
  summary text not null default '',
  description text not null default '',
  issue_date date,
  deadline timestamptz,
  document_asset_id uuid references public.media_assets(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'cancelled', 'archived')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenders_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

drop trigger if exists careers_set_updated_at on public.careers;
create trigger careers_set_updated_at
before update on public.careers
for each row execute function public.set_updated_at();

drop trigger if exists tenders_set_updated_at on public.tenders;
create trigger tenders_set_updated_at
before update on public.tenders
for each row execute function public.set_updated_at();

alter table public.partners enable row level security;
alter table public.team_members enable row level security;
alter table public.news_posts enable row level security;
alter table public.careers enable row level security;
alter table public.tenders enable row level security;

drop policy if exists "public read published partners" on public.partners;
create policy "public read published partners"
on public.partners for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage partners" on public.partners;
create policy "staff manage partners"
on public.partners for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read published team" on public.team_members;
create policy "public read published team"
on public.team_members for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage team" on public.team_members;
create policy "staff manage team"
on public.team_members for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read published news" on public.news_posts;
create policy "public read published news"
on public.news_posts for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage news" on public.news_posts;
create policy "staff manage news"
on public.news_posts for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read published careers" on public.careers;
create policy "public read published careers"
on public.careers for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage careers" on public.careers;
create policy "staff manage careers"
on public.careers for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read published tenders" on public.tenders;
create policy "public read published tenders"
on public.tenders for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage tenders" on public.tenders;
create policy "staff manage tenders"
on public.tenders for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

grant select on public.partners, public.team_members, public.news_posts, public.careers, public.tenders to anon, authenticated;
grant insert, update, delete on public.partners, public.team_members, public.news_posts, public.careers, public.tenders to authenticated;

-- Replace Phase 3.2 storage policies to include the new public image buckets.
drop policy if exists "public read poem storage objects" on storage.objects;
create policy "public read poem storage objects"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('project-media', 'documents', 'team', 'partners'));

drop policy if exists "staff upload poem storage objects" on storage.objects;
create policy "staff upload poem storage objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('project-media', 'documents', 'team', 'partners')
  and public.can_manage_content()
);

drop policy if exists "staff update poem storage objects" on storage.objects;
create policy "staff update poem storage objects"
on storage.objects for update
to authenticated
using (
  bucket_id in ('project-media', 'documents', 'team', 'partners')
  and public.can_manage_content()
)
with check (
  bucket_id in ('project-media', 'documents', 'team', 'partners')
  and public.can_manage_content()
);

drop policy if exists "staff delete poem storage objects" on storage.objects;
create policy "staff delete poem storage objects"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('project-media', 'documents', 'team', 'partners')
  and public.can_manage_content()
);

commit;
