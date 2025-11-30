-- ==============================================
-- LittlePantry Full Supabase Schema
-- ==============================================

-- Required extension for updated_at automation
create extension if not exists moddatetime schema extensions;

-- ==============================================
-- PROFILES
-- ==============================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  username text unique,
  avatar text,
  zip text,
  radius int default 30,
  gender text,
  age int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure moddatetime(updated_at);

alter table public.profiles enable row level security;

-- RLS Policies
create policy "profiles_read_all"
on public.profiles
for select
using (true);

create policy "profiles_insert_self"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id);


-- ==============================================
-- DONATIONS
-- ==============================================

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  tag text,
  description text,
  image text,
  claimed boolean default false,
  expiration_date date,
  zip text,
  ttl int,
  reported boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index donations_user_id_idx on public.donations(user_id);
create index donations_zip_idx on public.donations(zip);
create index donations_tag_idx on public.donations(tag);

create trigger donations_updated_at
before update on public.donations
for each row execute procedure moddatetime(updated_at);

alter table public.donations enable row level security;

-- RLS Policies
create policy "donations_read_authenticated"
on public.donations
for select
using (auth.role() = 'authenticated');

create policy "donations_insert_self"
on public.donations
for insert
with check (auth.uid() = user_id);

create policy "donations_update_self"
on public.donations
for update
using (auth.uid() = user_id);

create policy "donations_delete_self"
on public.donations
for delete
using (auth.uid() = user_id);


-- ==============================================
-- MESSAGES (Realtime Ready)
-- ==============================================

-- create table public.messages (
--   id uuid primary key default gen_random_uuid(),
--   room_id uuid not null,
--   sender_id uuid not null references public.profiles(id) on delete cascade,
--   recipient_id uuid not null references public.profiles(id) on delete cascade,
--   message text not null,
--   created_at timestamptz default now()
-- );

-- create index messages_room_idx on public.messages(room_id);
-- create index messages_recipient_idx on public.messages(recipient_id);

-- alter table public.messages enable row level security;

-- -- RLS Policies
-- create policy "messages_read_participants"
-- on public.messages
-- for select
-- using (
--   auth.uid() = sender_id
--   or auth.uid() = recipient_id
-- );

-- create policy "messages_insert_sender"
-- on public.messages
-- for insert
-- with check (auth.uid() = sender_id);


-- ==============================================
-- STORAGE BUCKETS
-- ==============================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('donations', 'donations', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logs', 'logs', false)
on conflict (id) do nothing;


-- ==============================================
-- STORAGE RLS POLICIES
-- ==============================================

-- Public read (avatars + donations)
create policy "public_read_storage"
on storage.objects
for select
using (bucket_id in ('avatars', 'donations'));

-- Upload avatar
create policy "upload_avatars"
on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars');

-- Upload donation image
create policy "upload_donations"
on storage.objects
for insert to authenticated
with check (bucket_id = 'donations');

-- Logs bucket restricted
create policy "logs_admin_only"
on storage.objects
for select
using (bucket_id = 'logs' and auth.role() = 'authenticated');
