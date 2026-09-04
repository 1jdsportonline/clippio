-- Clippio database schema (Postgres / Supabase)
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "uuid-ossp";

-- Users are managed by Supabase Auth (auth.users). This table stores
-- app-specific profile + plan data, keyed to the auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  videos_used_this_period int not null default 0,
  period_reset_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create table if not exists public.brand_kits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logo_url text,
  brand_color text default '#D9A441',
  caption_font text default 'Space Grotesk',
  watermark_enabled boolean default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  source_video_url text,
  source_duration_seconds int,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  processing_stage text,
  created_at timestamptz not null default now()
);

create table if not exists public.clips (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  start_seconds numeric not null,
  end_seconds numeric not null,
  score int check (score between 0 and 100),
  aspect_ratio text default '9:16',
  video_url text,
  thumbnail_url text,
  captions_enabled boolean default true,
  caption_style jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.captions (
  id uuid primary key default uuid_generate_v4(),
  clip_id uuid not null references public.clips (id) on delete cascade,
  start_seconds numeric not null,
  end_seconds numeric not null,
  text text not null
);

-- Row Level Security: every user can only read/write their own rows.
alter table public.profiles enable row level security;
alter table public.brand_kits enable row level security;
alter table public.projects enable row level security;
alter table public.clips enable row level security;
alter table public.captions enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "brand_kits_self" on public.brand_kits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_self" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clips_self" on public.clips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "captions_self" on public.captions
  for all using (
    exists (select 1 from public.clips c where c.id = clip_id and c.user_id = auth.uid())
  );

-- Usage limits by plan (source of truth, read by the API before allowing an upload).
create table if not exists public.plan_limits (
  plan text primary key,
  monthly_videos int not null,
  watermark boolean not null
);

insert into public.plan_limits (plan, monthly_videos, watermark) values
  ('free', 3, true),
  ('creator', 30, false),
  ('pro', 100, false)
on conflict (plan) do nothing;
