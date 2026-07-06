-- Leaderboard for the Menangkap Kecoa mini-game.
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 2 and 24),
  score integer not null check (score between 0 and 100000),
  caught_count integer not null check (caught_count >= 0),
  max_combo integer not null check (max_combo between 0 and caught_count),
  mode text not null default 'classic' check (mode in ('classic')),
  title text,
  created_at timestamp with time zone not null default now()
);

create index if not exists game_scores_leaderboard_idx
  on public.game_scores (mode, score desc, created_at asc);

alter table public.game_scores enable row level security;

drop policy if exists "Anyone can read game leaderboard" on public.game_scores;
create policy "Anyone can read game leaderboard"
  on public.game_scores for select using (true);

drop policy if exists "Anyone can submit game score" on public.game_scores;
create policy "Anyone can submit game score"
  on public.game_scores for insert
  with check (
    score between 0 and 100000
    and caught_count between 0 and 500
    and max_combo between 0 and caught_count
    and char_length(username) between 2 and 24
    and mode = 'classic'
  );

drop policy if exists "Allow admin all on game_scores" on public.game_scores;
create policy "Allow admin all on game_scores"
  on public.game_scores for all
  using (auth.role() = 'authenticated');

