-- SayItBetter — progress sync schema (v1)
-- Paste into Supabase Dashboard → SQL Editor → Run
--
-- Does NOT store: question bank, drafts, message history, AI models.
-- Auth users live in auth.users (created by Sign up / Sign in).

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_settings (synced preferences — not secrets)
-- ---------------------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  default_tone text not null default 'professional'
    check (default_tone in (
      'professional', 'friendly', 'polite', 'confident', 'casual', 'concise'
    )),
  theme_preference text not null default 'system'
    check (theme_preference in ('light', 'dark', 'system')),
  daily_test_reminder boolean not null default false,
  reduce_motion boolean not null default false,
  onboarding_completed boolean not null default false,
  improve_tip_dismissed boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_progress (lightweight flags / streak helpers)
-- ---------------------------------------------------------------------------

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  placement_done boolean not null default false,
  daily_completed_date text,
  mistake_question_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_progress_set_updated_at on public.user_progress;
create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

alter table public.user_progress enable row level security;

drop policy if exists "user_progress_select_own" on public.user_progress;
create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "user_progress_insert_own" on public.user_progress;
create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_progress_update_own" on public.user_progress;
create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile + settings + progress on signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- test_attempts
-- ---------------------------------------------------------------------------

create table if not exists public.test_attempts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pack_id text not null,
  pack_title text not null,
  score numeric not null,
  max_score numeric not null,
  answers jsonb not null default '[]'::jsonb,
  weak_skills text[] not null default '{}',
  skill_breakdown jsonb not null default '[]'::jsonb,
  suggestions text[] not null default '{}',
  question_ids text[] not null default '{}',
  timed boolean not null default false,
  mcq_only boolean not null default false,
  difficulty text,
  is_daily boolean not null default false,
  is_placement boolean not null default false,
  created_at timestamptz not null,
  synced_at timestamptz not null default timezone('utc', now())
);

create index if not exists test_attempts_user_created_idx
  on public.test_attempts (user_id, created_at desc);

alter table public.test_attempts enable row level security;

drop policy if exists "test_attempts_select_own" on public.test_attempts;
create policy "test_attempts_select_own"
  on public.test_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "test_attempts_insert_own" on public.test_attempts;
create policy "test_attempts_insert_own"
  on public.test_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "test_attempts_update_own" on public.test_attempts;
create policy "test_attempts_update_own"
  on public.test_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "test_attempts_delete_own" on public.test_attempts;
create policy "test_attempts_delete_own"
  on public.test_attempts for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- test_badges (unlocked badges only)
-- ---------------------------------------------------------------------------

create table if not exists public.test_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  unlocked_at timestamptz not null,
  primary key (user_id, badge_id)
);

alter table public.test_badges enable row level security;

drop policy if exists "test_badges_select_own" on public.test_badges;
create policy "test_badges_select_own"
  on public.test_badges for select
  using (auth.uid() = user_id);

drop policy if exists "test_badges_insert_own" on public.test_badges;
create policy "test_badges_insert_own"
  on public.test_badges for insert
  with check (auth.uid() = user_id);

drop policy if exists "test_badges_update_own" on public.test_badges;
create policy "test_badges_update_own"
  on public.test_badges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "test_badges_delete_own" on public.test_badges;
create policy "test_badges_delete_own"
  on public.test_badges for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- spaced_review_items
-- ---------------------------------------------------------------------------

create table if not exists public.spaced_review_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('mistake', 'library', 'history')),
  ref_id text not null,
  prompt text not null,
  hint text,
  next_at timestamptz not null,
  interval_days integer not null default 1,
  reps integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists spaced_review_user_next_idx
  on public.spaced_review_items (user_id, next_at);

drop trigger if exists spaced_review_set_updated_at on public.spaced_review_items;
create trigger spaced_review_set_updated_at
  before update on public.spaced_review_items
  for each row execute function public.set_updated_at();

alter table public.spaced_review_items enable row level security;

drop policy if exists "spaced_review_select_own" on public.spaced_review_items;
create policy "spaced_review_select_own"
  on public.spaced_review_items for select
  using (auth.uid() = user_id);

drop policy if exists "spaced_review_insert_own" on public.spaced_review_items;
create policy "spaced_review_insert_own"
  on public.spaced_review_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "spaced_review_update_own" on public.spaced_review_items;
create policy "spaced_review_update_own"
  on public.spaced_review_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "spaced_review_delete_own" on public.spaced_review_items;
create policy "spaced_review_delete_own"
  on public.spaced_review_items for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- situation_scores
-- ---------------------------------------------------------------------------

create table if not exists public.situation_scores (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  template_id text not null,
  title text not null,
  score numeric not null,
  max_score numeric not null default 1,
  tip text not null default '',
  -- Optional cloud fields; leave null from the app for stricter privacy.
  user_answer text,
  model_answer text,
  created_at timestamptz not null,
  synced_at timestamptz not null default timezone('utc', now())
);

create index if not exists situation_scores_user_created_idx
  on public.situation_scores (user_id, created_at desc);

alter table public.situation_scores enable row level security;

drop policy if exists "situation_scores_select_own" on public.situation_scores;
create policy "situation_scores_select_own"
  on public.situation_scores for select
  using (auth.uid() = user_id);

drop policy if exists "situation_scores_insert_own" on public.situation_scores;
create policy "situation_scores_insert_own"
  on public.situation_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "situation_scores_update_own" on public.situation_scores;
create policy "situation_scores_update_own"
  on public.situation_scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "situation_scores_delete_own" on public.situation_scores;
create policy "situation_scores_delete_own"
  on public.situation_scores for delete
  using (auth.uid() = user_id);

-- Backfill rows for users who already signed up before this migration
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

insert into public.user_progress (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;
