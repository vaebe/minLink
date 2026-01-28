create extension if not exists "pgcrypto";

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  original_url text not null,
  short_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_public boolean not null default false,
  visits_count integer not null default 0,
  title text,
  description text,
  expires_at timestamptz,
  constraint links_short_code_key unique (short_code)
);

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  link_id uuid not null references public.links(id) on delete cascade,
  user_agent text,
  ip inet,
  country text,
  country_code text,
  region_code text,
  region_name text,
  city text,
  referrer text,
  device_type text,
  browser_name text,
  os_name text
);

alter table public.visits add column if not exists country_code text;
alter table public.visits add column if not exists region_code text;
alter table public.visits add column if not exists region_name text;
alter table public.visits add column if not exists device_type text;
alter table public.visits add column if not exists browser_name text;
alter table public.visits add column if not exists os_name text;

alter table public.links enable row level security;
alter table public.visits enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.links to anon, authenticated;
grant select, insert, update, delete on table public.visits to anon, authenticated;

drop policy if exists "Users can view their own links" on public.links;
create policy "Users can view their own links" on public.links
for select
using (auth.uid() = user_id);

drop policy if exists "Public links are viewable by everyone" on public.links;
create policy "Public links are viewable by everyone" on public.links
for select
using (is_public = true);

drop policy if exists "Users can insert their own links" on public.links;
create policy "Users can insert their own links" on public.links
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own links" on public.links;
create policy "Users can update their own links" on public.links
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own links" on public.links;
create policy "Users can delete their own links" on public.links
for delete
using (auth.uid() = user_id);

drop policy if exists "Link owners can view visits for their links" on public.visits;
create policy "Link owners can view visits for their links" on public.visits
for select
using (
  exists (
    select 1
    from public.links
    where links.id = visits.link_id
      and links.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can insert visits" on public.visits;
create policy "Anyone can insert visits" on public.visits
for insert
with check (
  exists (
    select 1
    from public.links
    where links.id = visits.link_id
      and (links.is_public = true or links.user_id = auth.uid())
  )
);

create or replace function public.increment_visits(row_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.links
  set visits_count = visits_count + 1
  where id = row_id
    and (is_public = true or user_id = auth.uid());
$$;

grant execute on function public.increment_visits(uuid) to anon, authenticated;

create index if not exists links_user_id_idx on public.links(user_id);
create index if not exists links_short_code_idx on public.links(short_code);
create index if not exists links_is_public_idx on public.links(is_public);
create index if not exists visits_link_id_idx on public.visits(link_id);
create index if not exists visits_link_id_created_at_idx on public.visits(link_id, created_at);
create index if not exists visits_created_at_idx on public.visits(created_at);
create index if not exists visits_country_code_created_at_idx on public.visits(country_code, created_at);
create index if not exists visits_region_code_created_at_idx on public.visits(region_code, created_at);
create index if not exists visits_device_type_created_at_idx on public.visits(device_type, created_at);
create index if not exists visits_browser_name_created_at_idx on public.visits(browser_name, created_at);
create index if not exists visits_os_name_created_at_idx on public.visits(os_name, created_at);

drop function if exists public.analytics_time(text, timestamptz, timestamptz, text, uuid);
drop function if exists public.analytics_region(text, text, timestamptz, timestamptz, uuid, integer);
drop function if exists public.analytics_device(text, text, timestamptz, timestamptz, uuid, integer);
drop function if exists public.analytics_referrer(text, timestamptz, timestamptz, uuid, integer);

create or replace function public.analytics_time(
  scope text,
  start_at timestamptz,
  end_at timestamptz,
  bucket text,
  p_link_id uuid default null
)
returns table(bucket_start timestamptz, pv bigint, uv bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  interval_step interval;
  allowed boolean;
begin
  if scope not in ('global', 'user', 'link') then
    raise exception 'invalid scope';
  end if;

  if bucket not in ('hour', 'day') then
    raise exception 'invalid bucket';
  end if;

  interval_step := case when bucket = 'hour' then interval '1 hour' else interval '1 day' end;

  if scope = 'link' then
    if p_link_id is null then
      raise exception 'link_id required for scope=link';
    end if;

    select (l.is_public = true or l.user_id = auth.uid())
    into allowed
    from public.links l
    where l.id = p_link_id;

    if allowed is distinct from true then
      return;
    end if;
  end if;

  return query
  with series as (
    select generate_series(date_trunc(bucket, start_at), date_trunc(bucket, end_at), interval_step) as bucket_start
  ),
  filtered as (
    select v.created_at, v.ip
    from public.visits v
    join public.links l on l.id = v.link_id
    where v.created_at >= start_at
      and v.created_at <= end_at
      and (
        scope = 'global'
        or (scope = 'user' and l.user_id = auth.uid())
        or (scope = 'link' and v.link_id = p_link_id)
      )
  ),
  agg as (
    select
      date_trunc(bucket, created_at) as bucket_start,
      count(*)::bigint as pv,
      count(distinct ip) filter (where ip is not null)::bigint as uv
    from filtered
    group by 1
  )
  select
    s.bucket_start,
    coalesce(a.pv, 0) as pv,
    coalesce(a.uv, 0) as uv
  from series s
  left join agg a using (bucket_start)
  order by s.bucket_start asc;
end;
$$;

grant execute on function public.analytics_time(text, timestamptz, timestamptz, text, uuid) to anon, authenticated;

create or replace function public.analytics_region(
  scope text,
  dimension text,
  start_at timestamptz,
  end_at timestamptz,
  p_link_id uuid default null,
  limit_n integer default 20
)
returns table(name text, clicks bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if scope not in ('global', 'user', 'link') then
    raise exception 'invalid scope';
  end if;

  if dimension not in ('country', 'region', 'city') then
    raise exception 'invalid dimension';
  end if;

  if scope = 'link' then
    if p_link_id is null then
      raise exception 'link_id required for scope=link';
    end if;

    select (l.is_public = true or l.user_id = auth.uid())
    into allowed
    from public.links l
    where l.id = p_link_id;

    if allowed is distinct from true then
      return;
    end if;
  end if;

  return query
  with filtered as (
    select
      case
        when dimension = 'country' then v.country
        when dimension = 'region' then v.region_name
        when dimension = 'city' then v.city
        else null
      end as raw_name
    from public.visits v
    join public.links l on l.id = v.link_id
    where v.created_at >= start_at
      and v.created_at <= end_at
      and (
        scope = 'global'
        or (scope = 'user' and l.user_id = auth.uid())
        or (scope = 'link' and v.link_id = p_link_id)
      )
  )
  select
    coalesce(nullif(btrim(raw_name), ''), 'unknown') as name,
    count(*)::bigint as clicks
  from filtered
  group by 1
  order by clicks desc
  limit greatest(1, least(limit_n, 200));
end;
$$;

grant execute on function public.analytics_region(text, text, timestamptz, timestamptz, uuid, integer) to anon, authenticated;

create or replace function public.analytics_device(
  scope text,
  dimension text,
  start_at timestamptz,
  end_at timestamptz,
  p_link_id uuid default null,
  limit_n integer default 20
)
returns table(name text, clicks bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if scope not in ('global', 'user', 'link') then
    raise exception 'invalid scope';
  end if;

  if dimension not in ('device', 'browser', 'os') then
    raise exception 'invalid dimension';
  end if;

  if scope = 'link' then
    if p_link_id is null then
      raise exception 'link_id required for scope=link';
    end if;

    select (l.is_public = true or l.user_id = auth.uid())
    into allowed
    from public.links l
    where l.id = p_link_id;

    if allowed is distinct from true then
      return;
    end if;
  end if;

  return query
  with filtered as (
    select
      case
        when dimension = 'device' then v.device_type
        when dimension = 'browser' then v.browser_name
        when dimension = 'os' then v.os_name
        else null
      end as raw_name
    from public.visits v
    join public.links l on l.id = v.link_id
    where v.created_at >= start_at
      and v.created_at <= end_at
      and (
        scope = 'global'
        or (scope = 'user' and l.user_id = auth.uid())
        or (scope = 'link' and v.link_id = p_link_id)
      )
  )
  select
    coalesce(nullif(btrim(raw_name), ''), 'unknown') as name,
    count(*)::bigint as clicks
  from filtered
  group by 1
  order by clicks desc
  limit greatest(1, least(limit_n, 200));
end;
$$;

grant execute on function public.analytics_device(text, text, timestamptz, timestamptz, uuid, integer) to anon, authenticated;

create or replace function public.analytics_referrer(
  scope text,
  start_at timestamptz,
  end_at timestamptz,
  p_link_id uuid default null,
  limit_n integer default 20
)
returns table(name text, clicks bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if scope not in ('global', 'user', 'link') then
    raise exception 'invalid scope';
  end if;

  if scope = 'link' then
    if p_link_id is null then
      raise exception 'link_id required for scope=link';
    end if;

    select (l.is_public = true or l.user_id = auth.uid())
    into allowed
    from public.links l
    where l.id = p_link_id;

    if allowed is distinct from true then
      return;
    end if;
  end if;

  return query
  with filtered as (
    select v.referrer
    from public.visits v
    join public.links l on l.id = v.link_id
    where v.created_at >= start_at
      and v.created_at <= end_at
      and (
        scope = 'global'
        or (scope = 'user' and l.user_id = auth.uid())
        or (scope = 'link' and v.link_id = p_link_id)
      )
  ),
  normalized as (
    select
      case
        when referrer is null or btrim(referrer) = '' then 'direct'
        when referrer = 'direct' then 'direct'
        when referrer ~* '^https?://' then split_part(split_part(referrer, '://', 2), '/', 1)
        else referrer
      end as raw_name
    from filtered
  )
  select
    coalesce(nullif(btrim(raw_name), ''), 'unknown') as name,
    count(*)::bigint as clicks
  from normalized
  group by 1
  order by clicks desc
  limit greatest(1, least(limit_n, 200));
end;
$$;

grant execute on function public.analytics_referrer(text, timestamptz, timestamptz, uuid, integer) to anon, authenticated;
