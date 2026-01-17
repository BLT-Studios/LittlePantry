-- ==============================================
-- LittlePantry Full Supabase Schema
-- ==============================================

-- ==============================================
-- Extensions
-- ==============================================
create extension if not exists moddatetime schema extensions;
create extension if not exists pgcrypto;
create extension if not exists cube;
create extension if not exists earthdistance;

-- ==============================================
-- Types
-- ==============================================
do $$
begin
  create type public.user_role as enum ('user', 'org', 'admin');
exception when duplicate_object then null;
end $$;

-- ==============================================
-- PROFILES (needed for is_admin)
-- ==============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role public.user_role not null default 'user',
  avatar text,
  zip text,
  city text,
  state text,
  lat double precision,
  lng double precision,
  radius int default 30,
  gender text,
  age int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger (fully qualified)
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure extensions.moddatetime(updated_at);

-- ==============================================
-- ADMIN HELPER (must exist before policies use it)
-- ==============================================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- ==============================================
-- ZIPS
-- ==============================================
create table if not exists public.zip_locations (
  zip text primary key,
  city text,
  state text,
  lat double precision not null,
  lng double precision not null
);

create index if not exists zip_locations_earth_idx
on public.zip_locations
using gist (ll_to_earth(lat, lng));

-- ==============================================
-- ZIPS RLS
-- ==============================================
alter table public.zip_locations enable row level security;

drop policy if exists "zip_locations_read_authenticated" on public.zip_locations;
create policy "zip_locations_read_authenticated"
on public.zip_locations
for select
using (auth.role() = 'authenticated');

drop policy if exists "zip_locations_admin_write" on public.zip_locations;
create policy "zip_locations_admin_write"
on public.zip_locations
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- ==============================================
-- Sync profile location from ZIP (fixed old/new handling)
-- ==============================================
create or replace function public.sync_profile_location()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.zip is distinct from old.zip then
    select
      z.city,
      z.state,
      z.lat,
      z.lng
    into
      new.city,
      new.state,
      new.lat,
      new.lng
    from public.zip_locations z
    where z.zip = new.zip;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_location on public.profiles;
create trigger profiles_sync_location
before insert or update of zip
on public.profiles
for each row
execute procedure public.sync_profile_location();

-- ==============================================
-- PROFILES RLS
-- ==============================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated"
on public.profiles
for select
using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_self" on public.profiles;
create policy "profiles_delete_self"
on public.profiles
for delete
using (auth.uid() = id);

-- ==============================================
-- AUTO PROFILE CREATION
-- ==============================================
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, name, zip, radius)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'zip',
    30
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- ==============================================
-- DONATIONS
-- ==============================================
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  image text,
  claimed boolean default false,
  expiration_date date,
  zip text,
  city text,
  state text,
  lat double precision,
  lng double precision,
  ttl int,
  reported boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists donations_user_id_idx on public.donations(user_id);
create index if not exists donations_zip_idx on public.donations(zip);
create index if not exists donations_earth_idx
on public.donations
using gist (ll_to_earth(lat, lng));
create index if not exists donations_claimed_reported_created_idx
on public.donations (claimed, reported, created_at desc);

drop trigger if exists donations_updated_at on public.donations;
create trigger donations_updated_at
before update on public.donations
for each row execute procedure extensions.moddatetime(updated_at);

create or replace function public.sync_donation_location()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.zip is distinct from old.zip then
    select
      z.city,
      z.state,
      z.lat,
      z.lng
    into
      new.city,
      new.state,
      new.lat,
      new.lng
    from public.zip_locations z
    where z.zip = new.zip;
  end if;

  return new;
end;
$$;

drop trigger if exists donations_sync_location on public.donations;
create trigger donations_sync_location
before insert or update of zip
on public.donations
for each row
execute procedure public.sync_donation_location();

-- ==============================================
-- DONATIONS RLS
-- ==============================================
alter table public.donations enable row level security;

drop policy if exists "donations_read_authenticated" on public.donations;
create policy "donations_read_authenticated"
on public.donations
for select
using (auth.role() = 'authenticated');

drop policy if exists "donations_insert_self" on public.donations;
create policy "donations_insert_self"
on public.donations
for insert
with check (auth.uid() = user_id);

drop policy if exists "donations_update_self" on public.donations;
create policy "donations_update_self"
on public.donations
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "donations_delete_self" on public.donations;
create policy "donations_delete_self"
on public.donations
for delete
using (auth.uid() = user_id);

-- ==============================================
-- TAGS
-- ==============================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null
);

create table if not exists public.donation_tags (
  donation_id uuid references public.donations(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (donation_id, tag_id)
);

create index if not exists donation_tags_donation_id_idx
on public.donation_tags(donation_id);

create index if not exists donation_tags_tag_id_idx
on public.donation_tags(tag_id);

-- ==============================================
-- TAGS RLS
-- ==============================================
alter table public.tags enable row level security;
alter table public.donation_tags enable row level security;

drop policy if exists "tags_read_authenticated" on public.tags;
create policy "tags_read_authenticated"
on public.tags
for select
using (auth.role() = 'authenticated');

drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write"
on public.tags
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "donation_tags_read_authenticated" on public.donation_tags;
create policy "donation_tags_read_authenticated"
on public.donation_tags
for select
using (auth.role() = 'authenticated');

drop policy if exists "donation_tags_insert_owner" on public.donation_tags;
create policy "donation_tags_insert_owner"
on public.donation_tags
for insert
with check (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.donations d
    where d.id = donation_id
      and d.user_id = auth.uid()
  )
);

drop policy if exists "donation_tags_delete_owner" on public.donation_tags;
create policy "donation_tags_delete_owner"
on public.donation_tags
for delete
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.donations d
    where d.id = donation_id
      and d.user_id = auth.uid()
  )
);

-- ==============================================
-- STORAGE BUCKETS
-- ==============================================
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('donations', 'donations', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logs', 'logs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('system', 'system', false)
on conflict (id) do nothing;

-- ==============================================
-- STORAGE RLS
-- ==============================================

-- ------------------------------
-- PROFILES bucket
-- ------------------------------

drop policy if exists "profiles_read_authenticated" on storage.objects;
drop policy if exists "profiles_upload_own" on storage.objects;
drop policy if exists "profiles_update_own" on storage.objects;
drop policy if exists "profiles_delete_own" on storage.objects;

-- Read requires auth
create policy "profiles_read_authenticated"
on storage.objects
for select
using (
  bucket_id = 'profiles'
  and auth.role() = 'authenticated'
);

-- Upload only into own folder: {uid}/...
create policy "profiles_upload_own"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Update only own objects
create policy "profiles_update_own"
on storage.objects
for update to authenticated
using (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Delete only own objects (useful for replacing avatar)
create policy "profiles_delete_own"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- ------------------------------
-- DONATIONS bucket
-- ------------------------------

drop policy if exists "donations_read_authenticated" on storage.objects;
drop policy if exists "donations_upload_owner" on storage.objects;
drop policy if exists "donations_update_owner" on storage.objects;
drop policy if exists "donations_delete_owner" on storage.objects;

-- Read requires auth
create policy "donations_read_authenticated"
on storage.objects
for select
using (
  bucket_id = 'donations'
  and auth.role() = 'authenticated'
);

-- Upload only if you own the donation.
-- Path convention: {donationId}/image.jpg (or similar)
create policy "donations_upload_owner"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'donations'
  and exists (
    select 1
    from public.donations d
    where d.id::text = split_part(name, '/', 1)
      and d.user_id = auth.uid()
  )
);

-- Update only if you own the donation
create policy "donations_update_owner"
on storage.objects
for update to authenticated
using (
  bucket_id = 'donations'
  and exists (
    select 1
    from public.donations d
    where d.id::text = split_part(name, '/', 1)
      and d.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'donations'
  and exists (
    select 1
    from public.donations d
    where d.id::text = split_part(name, '/', 1)
      and d.user_id = auth.uid()
  )
);

-- Delete only if you own the donation
create policy "donations_delete_owner"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'donations'
  and exists (
    select 1
    from public.donations d
    where d.id::text = split_part(name, '/', 1)
      and d.user_id = auth.uid()
  )
);

-- ------------------------------
-- LOGS bucket
-- ------------------------------

drop policy if exists "logs_admin_read" on storage.objects;
drop policy if exists "logs_admin_insert" on storage.objects;
drop policy if exists "logs_admin_update" on storage.objects;
drop policy if exists "logs_admin_delete" on storage.objects;

-- Admin-only read
create policy "logs_admin_read"
on storage.objects
for select
using (
  bucket_id = 'logs'
  and public.is_admin(auth.uid())
);

-- Admin-only insert
create policy "logs_admin_insert"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'logs'
  and public.is_admin(auth.uid())
);

-- Admin-only update
create policy "logs_admin_update"
on storage.objects
for update to authenticated
using (
  bucket_id = 'logs'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'logs'
  and public.is_admin(auth.uid())
);

-- Admin-only delete
create policy "logs_admin_delete"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'logs'
  and public.is_admin(auth.uid())
);

-- ------------------------------
-- SYSTEM bucket
-- ------------------------------

drop policy if exists "system_public_read" on storage.objects;
drop policy if exists "system_admin_write" on storage.objects;

-- Public read (anon + authed)
create policy "system_public_read"
on storage.objects
for select
using (bucket_id = 'system');

-- Admin-only write (insert/update/delete)
create policy "system_admin_write"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'system'
  and public.is_admin(auth.uid())
);

create policy "system_admin_update"
on storage.objects
for update to authenticated
using (
  bucket_id = 'system'
  and public.is_admin(auth.uid())
)
with check (
  bucket_id = 'system'
  and public.is_admin(auth.uid())
);

create policy "system_admin_delete"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'system'
  and public.is_admin(auth.uid())
);

-- ==============================================
-- SPECIAL FUNCTIONS
-- ==============================================
create or replace function public.get_donations_feed(
  p_limit int default 10,
  p_offset int default 0,
  p_tag_slugs text[] default null,
  p_require_all_tags boolean default false
)
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  image text,
  claimed boolean,
  expiration_date date,
  zip text,
  city text,
  state text,
  lat double precision,
  lng double precision,
  ttl int,
  reported boolean,
  created_at timestamptz,
  updated_at timestamptz,
  distance_miles double precision,
  score double precision,
  tags jsonb
)
language sql
security invoker
set search_path = public
as $$
with me as (
  select
    p.id as uid,
    p.lat as my_lat,
    p.lng as my_lng,
    coalesce(p.radius, 30) as radius_miles
  from public.profiles p
  where p.id = auth.uid()
),
base as (
  select
    d.*,
    (earth_distance(
      ll_to_earth(d.lat, d.lng),
      ll_to_earth(me.my_lat, me.my_lng)
    ) / 1609.34) as distance_miles,
    (extract(epoch from (now() - d.created_at)) / 3600.0) as age_hours
  from public.donations d
  cross join me
  where
    d.claimed = false
    and d.reported = false
    and d.lat is not null
    and d.lng is not null
    and me.my_lat is not null
    and me.my_lng is not null
    and earth_distance(
      ll_to_earth(d.lat, d.lng),
      ll_to_earth(me.my_lat, me.my_lng)
    ) <= (me.radius_miles * 1609.34)
),
tag_rollup as (
  select
    dt.donation_id,
    coalesce(
      jsonb_agg(
        distinct jsonb_build_object('id', t.id, 'slug', t.slug, 'label', t.label)
      ) filter (where t.id is not null),
      '[]'::jsonb
    ) as tags,
    count(distinct t.slug) filter (where t.slug is not null and (p_tag_slugs is null or t.slug = any(p_tag_slugs))) as matched_tag_count
  from public.donation_tags dt
  join public.tags t on t.id = dt.tag_id
  group by dt.donation_id
),
filtered as (
  select
    b.*,
    coalesce(tr.tags, '[]'::jsonb) as tags,
    coalesce(tr.matched_tag_count, 0) as matched_tag_count
  from base b
  left join tag_rollup tr on tr.donation_id = b.id
  where
    p_tag_slugs is null
    or (
      case
        when p_require_all_tags then coalesce(tr.matched_tag_count, 0) = cardinality(p_tag_slugs)
        else coalesce(tr.matched_tag_count, 0) > 0
      end
    )
),
scored as (
  select
    f.*,
    (
      (1.0 / (1.0 + f.distance_miles)) * 0.55
      +
      (1.0 / (1.0 + (f.age_hours / 12.0))) * 0.45
    ) as score
  from filtered f
)
select
  s.id,
  s.user_id,
  s.title,
  s.description,
  s.image,
  s.claimed,
  s.expiration_date,
  s.zip,
  s.city,
  s.state,
  s.lat,
  s.lng,
  s.ttl,
  s.reported,
  s.created_at,
  s.updated_at,
  s.distance_miles,
  s.score,
  s.tags
from scored s
order by s.score desc, s.created_at desc
limit p_limit
offset p_offset;
$$;