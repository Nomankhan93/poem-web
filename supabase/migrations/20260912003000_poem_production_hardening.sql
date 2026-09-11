begin;

-- =========================================================
-- Phase 3.4 compatibility
-- Phase 3.1 named this column reporting_year while Phase 3.4
-- application code standardized on year.
-- =========================================================

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'project_metrics'
      and column_name = 'reporting_year'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'project_metrics'
      and column_name = 'year'
  ) then
    alter table public.project_metrics
      rename column reporting_year to year;
  end if;
end
$$;

-- =========================================================
-- Contact anti-abuse / rate limiting
-- Only irreversible SHA-256 hashes are stored, never raw IPs.
-- =========================================================

create table if not exists public.contact_rate_limit_events (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  email_hash text not null,
  created_at timestamptz not null default now(),
  constraint contact_rate_limit_ip_hash_format
    check (ip_hash ~ '^[a-f0-9]{64}$'),
  constraint contact_rate_limit_email_hash_format
    check (email_hash ~ '^[a-f0-9]{64}$')
);

alter table public.contact_rate_limit_events enable row level security;

revoke all on public.contact_rate_limit_events from anon, authenticated;

create index if not exists contact_rate_limit_events_created_at_idx
  on public.contact_rate_limit_events (created_at);

create index if not exists contact_rate_limit_events_ip_idx
  on public.contact_rate_limit_events (ip_hash, created_at desc);

create index if not exists contact_rate_limit_events_email_idx
  on public.contact_rate_limit_events (email_hash, created_at desc);

create or replace function public.check_contact_rate_limit(
  p_ip_hash text,
  p_email_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ip_ten_minute_count integer;
  ip_hour_count integer;
  email_hour_count integer;
begin
  if p_ip_hash !~ '^[a-f0-9]{64}$'
     or p_email_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;

  delete from public.contact_rate_limit_events
  where created_at < now() - interval '24 hours';

  select count(*)
    into ip_ten_minute_count
  from public.contact_rate_limit_events
  where ip_hash = p_ip_hash
    and created_at >= now() - interval '10 minutes';

  if ip_ten_minute_count >= 6 then
    return false;
  end if;

  select count(*)
    into ip_hour_count
  from public.contact_rate_limit_events
  where ip_hash = p_ip_hash
    and created_at >= now() - interval '1 hour';

  if ip_hour_count >= 20 then
    return false;
  end if;

  select count(*)
    into email_hour_count
  from public.contact_rate_limit_events
  where email_hash = p_email_hash
    and created_at >= now() - interval '1 hour';

  if email_hour_count >= 4 then
    return false;
  end if;

  insert into public.contact_rate_limit_events (
    ip_hash,
    email_hash
  )
  values (
    p_ip_hash,
    p_email_hash
  );

  return true;
end;
$$;

revoke all on function public.check_contact_rate_limit(text, text) from public;
grant execute on function public.check_contact_rate_limit(text, text)
  to anon, authenticated;

-- =========================================================
-- Content audit log
-- Does not store document bodies or contact-message content.
-- =========================================================

create table if not exists public.content_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  operation text not null
    check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  record_id text,
  created_at timestamptz not null default now()
);

alter table public.content_audit_log enable row level security;

drop policy if exists "admins read content audit log"
  on public.content_audit_log;

create policy "admins read content audit log"
on public.content_audit_log for select
to authenticated
using (public.is_admin());

revoke insert, update, delete
  on public.content_audit_log
  from anon, authenticated;

grant select on public.content_audit_log to authenticated;

create index if not exists content_audit_log_created_at_idx
  on public.content_audit_log (created_at desc);

create index if not exists content_audit_log_table_idx
  on public.content_audit_log (table_name, created_at desc);

create or replace function public.log_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  resolved_record_id text;
begin
  if tg_op = 'DELETE' then
    payload := to_jsonb(old);
  else
    payload := to_jsonb(new);
  end if;

  resolved_record_id := coalesce(
    payload ->> 'id',
    payload ->> 'project_id',
    payload ->> 'key'
  );

  insert into public.content_audit_log (
    actor_id,
    table_name,
    operation,
    record_id
  )
  values (
    auth.uid(),
    tg_table_name,
    tg_op,
    resolved_record_id
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.log_content_change() from public;

do $$
declare
  table_name_item text;
begin
  foreach table_name_item in array array[
    'programs',
    'projects',
    'project_sdgs',
    'project_metrics',
    'media_assets',
    'project_media',
    'story_media',
    'resources',
    'stories',
    'partners',
    'team_members',
    'news_posts',
    'careers',
    'tenders',
    'site_content_settings'
  ]
  loop
    if to_regclass('public.' || table_name_item) is not null then
      execute format(
        'drop trigger if exists audit_content_change on public.%I',
        table_name_item
      );

      execute format(
        'create trigger audit_content_change
         after insert or update or delete on public.%I
         for each row execute function public.log_content_change()',
        table_name_item
      );
    end if;
  end loop;
end
$$;

-- =========================================================
-- Production query indexes
-- =========================================================

create index if not exists programs_public_order_idx
  on public.programs (published, display_order, title);

create index if not exists projects_public_order_idx
  on public.projects (published, featured desc, created_at desc);

create index if not exists projects_program_idx
  on public.projects (program_id, published);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create index if not exists media_assets_bucket_created_idx
  on public.media_assets (bucket, created_at desc);

create index if not exists project_media_project_role_idx
  on public.project_media (project_id, role, display_order);

create index if not exists story_media_story_order_idx
  on public.story_media (story_id, display_order);

create index if not exists resources_public_order_idx
  on public.resources (published, featured desc, year desc, created_at desc);

create index if not exists resources_project_idx
  on public.resources (project_id, published, year desc);

create index if not exists stories_public_order_idx
  on public.stories (published, featured desc, published_at desc);

create index if not exists news_posts_public_order_idx
  on public.news_posts (published, featured desc, published_at desc);

create index if not exists partners_public_order_idx
  on public.partners (published, featured desc, display_order, name);

create index if not exists team_members_public_order_idx
  on public.team_members (published, member_type, display_order, name);

create index if not exists careers_public_order_idx
  on public.careers (published, status, deadline, created_at desc);

create index if not exists tenders_public_order_idx
  on public.tenders (published, status, deadline, created_at desc);

create index if not exists project_metrics_public_year_idx
  on public.project_metrics (published, year desc, project_id);

commit;
