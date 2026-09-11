begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'project-media',
    'project-media',
    true,
    10485760,
    array['image/jpeg','image/png','image/webp','image/gif']
  ),
  (
    'documents',
    'documents',
    true,
    26214400,
    array['application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('project-media', 'documents')),
  path text not null,
  file_name text not null,
  mime_type text not null default '',
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  alt_text text not null default '',
  caption text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (
    category in (
      'annual-report',
      'project-report',
      'policy',
      'publication',
      'research',
      'case-study'
    )
  ),
  year integer not null check (year between 2000 and 2100),
  description text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  pdf_asset_id uuid references public.media_assets(id) on delete set null,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  person_name text not null default '',
  location text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  role text not null default 'gallery' check (role in ('cover', 'gallery')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, media_asset_id)
);

create unique index if not exists project_media_one_cover_idx
on public.project_media (project_id)
where role = 'cover';

create table if not exists public.story_media (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (story_id, media_asset_id)
);

alter table public.projects
  add column if not exists donor_partner text not null default '';

alter table public.projects
  add column if not exists featured_story_id uuid references public.stories(id) on delete set null;

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists stories_set_updated_at on public.stories;
create trigger stories_set_updated_at
before update on public.stories
for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;
alter table public.resources enable row level security;
alter table public.stories enable row level security;
alter table public.project_media enable row level security;
alter table public.story_media enable row level security;

drop policy if exists "public read media metadata" on public.media_assets;
create policy "public read media metadata"
on public.media_assets for select
to anon, authenticated
using (true);

drop policy if exists "staff insert media metadata" on public.media_assets;
create policy "staff insert media metadata"
on public.media_assets for insert
to authenticated
with check (public.can_manage_content());

drop policy if exists "staff update media metadata" on public.media_assets;
create policy "staff update media metadata"
on public.media_assets for update
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "staff delete media metadata" on public.media_assets;
create policy "staff delete media metadata"
on public.media_assets for delete
to authenticated
using (public.can_manage_content());

drop policy if exists "public read published resources" on public.resources;
create policy "public read published resources"
on public.resources for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage resources" on public.resources;
create policy "staff manage resources"
on public.resources for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read published stories" on public.stories;
create policy "public read published stories"
on public.stories for select
to anon, authenticated
using (published or public.can_manage_content());

drop policy if exists "staff manage stories" on public.stories;
create policy "staff manage stories"
on public.stories for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read project media" on public.project_media;
create policy "public read project media"
on public.project_media for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_media.project_id
      and (p.published or public.can_manage_content())
  )
);

drop policy if exists "staff manage project media" on public.project_media;
create policy "staff manage project media"
on public.project_media for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "public read story media" on public.story_media;
create policy "public read story media"
on public.story_media for select
to anon, authenticated
using (
  exists (
    select 1
    from public.stories s
    where s.id = story_media.story_id
      and (s.published or public.can_manage_content())
  )
);

drop policy if exists "staff manage story media" on public.story_media;
create policy "staff manage story media"
on public.story_media for all
to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

grant select on public.media_assets, public.resources, public.stories, public.project_media, public.story_media to anon, authenticated;
grant insert, update, delete on public.media_assets, public.resources, public.stories, public.project_media, public.story_media to authenticated;

drop policy if exists "public read poem storage objects" on storage.objects;
create policy "public read poem storage objects"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('project-media', 'documents'));

drop policy if exists "staff upload poem storage objects" on storage.objects;
create policy "staff upload poem storage objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('project-media', 'documents')
  and public.can_manage_content()
);

drop policy if exists "staff update poem storage objects" on storage.objects;
create policy "staff update poem storage objects"
on storage.objects for update
to authenticated
using (
  bucket_id in ('project-media', 'documents')
  and public.can_manage_content()
)
with check (
  bucket_id in ('project-media', 'documents')
  and public.can_manage_content()
);

drop policy if exists "staff delete poem storage objects" on storage.objects;
create policy "staff delete poem storage objects"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('project-media', 'documents')
  and public.can_manage_content()
);

commit;
