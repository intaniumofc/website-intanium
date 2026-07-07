-- Migration for the Gosok Intan (Scratch Card) mini-game

-- 1. Create scratch_sessions table
create table if not exists public.scratch_sessions (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 2 and 24),
  ip_hash text not null,
  grid_data jsonb not null, -- Array of strings: ["diamond", "bomb", "zonk", ...]
  revealed_cells integer[] default array[]::integer[], -- Indices already scratched
  score integer default 0 check (score >= 0),
  status text not null default 'playing' check (status in ('playing', 'won', 'lost')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Index for daily ticket count query performance
create index if not exists scratch_sessions_ip_today_idx 
  on public.scratch_sessions (ip_hash, created_at);

-- Enable Row Level Security (RLS)
alter table public.scratch_sessions enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow admin all on scratch_sessions" on public.scratch_sessions;
drop policy if exists "Allow anyone to start scratch session" on public.scratch_sessions;
drop policy if exists "Allow anyone to read scratch session by id" on public.scratch_sessions;
drop policy if exists "Allow anyone to update scratch session" on public.scratch_sessions;

-- Create policies for public gameplay and admin moderation
create policy "Allow admin all on scratch_sessions"
  on public.scratch_sessions for all
  using (auth.role() = 'authenticated');

create policy "Allow anyone to start scratch session"
  on public.scratch_sessions for insert
  with check (true);

create policy "Allow anyone to read scratch session by id"
  on public.scratch_sessions for select
  using (true);

create policy "Allow anyone to update scratch session"
  on public.scratch_sessions for update
  using (true)
  with check (true);


-- 2. Update game_scores check constraints and RLS policies for gosok-intan mode

-- Alter check constraint on game_scores.mode column
alter table public.game_scores drop constraint if exists game_scores_mode_check;
alter table public.game_scores add constraint game_scores_mode_check check (mode in ('classic', 'gosok-intan'));

-- Recreate policy to allow anyone to submit game scores for classic and gosok-intan
drop policy if exists "Anyone can submit game score" on public.game_scores;
create policy "Anyone can submit game score"
  on public.game_scores for insert
  with check (
    score between 0 and 100000
    and caught_count >= 0
    and max_combo between 0 and caught_count
    and char_length(username) between 2 and 24
    and mode in ('classic', 'gosok-intan')
  );
