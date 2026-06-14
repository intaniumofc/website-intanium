-- ========================================================
-- MIGRATION: INTIANIUM ESPORT SCHEMA & SEED DATA
-- ========================================================

-- 1. Esport Divisions Table
CREATE TABLE IF NOT EXISTS public.esport_divisions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  logo TEXT NOT NULL,
  banner_gradient TEXT NOT NULL,
  wallpaper TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Esport Rosters Table
CREATE TABLE IF NOT EXISTS public.esport_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id TEXT NOT NULL REFERENCES public.esport_divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ign TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Esport Matches Table
CREATE TABLE IF NOT EXISTS public.esport_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id TEXT NOT NULL REFERENCES public.esport_divisions(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  opponent_logo TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Past', 'Upcoming')),
  score TEXT,
  result TEXT CHECK (result IN ('win', 'lose', 'draw', '', NULL)),
  stream_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Esport Achievements Table
CREATE TABLE IF NOT EXISTS public.esport_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id TEXT NOT NULL REFERENCES public.esport_divisions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rank TEXT NOT NULL,
  date TEXT NOT NULL,
  badge TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS
ALTER TABLE public.esport_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esport_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esport_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esport_achievements ENABLE ROW LEVEL SECURITY;

-- 1. Esport Divisions Policies
DROP POLICY IF EXISTS "Allow public read on public.esport_divisions" ON public.esport_divisions;
CREATE POLICY "Allow public read on public.esport_divisions" ON public.esport_divisions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin all on public.esport_divisions" ON public.esport_divisions;
CREATE POLICY "Allow admin all on public.esport_divisions" ON public.esport_divisions FOR ALL USING (auth.role() = 'authenticated');

-- 2. Esport Rosters Policies
DROP POLICY IF EXISTS "Allow public read on public.esport_rosters" ON public.esport_rosters;
CREATE POLICY "Allow public read on public.esport_rosters" ON public.esport_rosters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin all on public.esport_rosters" ON public.esport_rosters;
CREATE POLICY "Allow admin all on public.esport_rosters" ON public.esport_rosters FOR ALL USING (auth.role() = 'authenticated');

-- 3. Esport Matches Policies
DROP POLICY IF EXISTS "Allow public read on public.esport_matches" ON public.esport_matches;
CREATE POLICY "Allow public read on public.esport_matches" ON public.esport_matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin all on public.esport_matches" ON public.esport_matches;
CREATE POLICY "Allow admin all on public.esport_matches" ON public.esport_matches FOR ALL USING (auth.role() = 'authenticated');

-- 4. Esport Achievements Policies
DROP POLICY IF EXISTS "Allow public read on public.esport_achievements" ON public.esport_achievements;
CREATE POLICY "Allow public read on public.esport_achievements" ON public.esport_achievements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin all on public.esport_achievements" ON public.esport_achievements;
CREATE POLICY "Allow admin all on public.esport_achievements" ON public.esport_achievements FOR ALL USING (auth.role() = 'authenticated');

-- ========================================================
-- SEED DATA
-- ========================================================

-- Clean tables (optional but keeps migration idempotent)
TRUNCATE public.esport_achievements CASCADE;
TRUNCATE public.esport_matches CASCADE;
TRUNCATE public.esport_rosters CASCADE;
TRUNCATE public.esport_divisions CASCADE;

-- Insert Divisions
INSERT INTO public.esport_divisions (id, name, tagline, logo, banner_gradient) VALUES
('mobile_legends', 'Mobile Legends', 'Menguasai Land of Dawn dengan Strategi dan Harmoni.', '🎮', 'from-blue-600/20 to-purple-600/20'),
('efootball', 'eFootball', 'Mengukir Kemenangan Virtual Lewat Sentuhan Akurat.', '⚽', 'from-emerald-600/20 to-teal-600/20'),
('pubg_mobile', 'PUBG Mobile', 'Bertahan, Berkoordinasi, dan Menjadi yang Terakhir Berdiri.', '🔫', 'from-amber-600/20 to-orange-600/20'),
('free_fire', 'Free Fire', 'Kecepatan, Ketepatan, dan Booyah Tiada Henti.', '🔥', 'from-red-600/20 to-orange-600/20');

-- Insert Rosters
-- Mobile Legends
INSERT INTO public.esport_rosters (division_id, name, ign, role, image_url, social_instagram, social_twitter, sort_order) VALUES
('mobile_legends', 'Siska Amelia', 'Siska', 'Team Manager', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Siska', 'https://instagram.com', 'https://x.com', 0),
('mobile_legends', 'Rian Hidayat', 'Xavi', 'Head Coach', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Xavi', 'https://instagram.com', NULL, 1),
('mobile_legends', 'Reza Pratama', 'Kyra', 'Captain / Mid Laner', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kyra', 'https://instagram.com', 'https://x.com', 2),
('mobile_legends', 'Budi Santoso', 'Zenith', 'Gold Laner', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zenith', 'https://instagram.com', NULL, 3),
('mobile_legends', 'Adi Wijaya', 'Rogue', 'Roamer', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rogue', NULL, 'https://x.com', 4),
('mobile_legends', 'Fikri Haikal', 'Vortex', 'EXP Laner', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Vortex', NULL, NULL, 5),
('mobile_legends', 'Doni Setiawan', 'Shadow', 'Jungler', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow', 'https://instagram.com', NULL, 6);

-- eFootball
INSERT INTO public.esport_rosters (division_id, name, ign, role, image_url, social_instagram, social_twitter, sort_order) VALUES
('efootball', 'Andi Wijaya', 'Andi', 'Team Manager', 'https://api.dicebear.com/7.x/adventurer/svg?seed=AndiManager', 'https://instagram.com', NULL, 0),
('efootball', 'Elga Cahya Putra', 'Elga', 'Main Player', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Elga', 'https://instagram.com', 'https://x.com', 1),
('efootball', 'Akbar Paudie', 'Paudie', 'Substitute Player', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Paudie', 'https://instagram.com', NULL, 2);

-- PUBG Mobile
INSERT INTO public.esport_rosters (division_id, name, ign, role, image_url, social_instagram, social_twitter, sort_order) VALUES
('pubg_mobile', 'Rina Kartika', 'Rina', 'Team Manager', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rina', 'https://instagram.com', NULL, 0),
('pubg_mobile', 'Taufik Hidayat', 'CoachT', 'Head Coach', 'https://api.dicebear.com/7.x/adventurer/svg?seed=CoachT', NULL, 'https://x.com', 1),
('pubg_mobile', 'Genta Efendi', 'Genta', 'In-Game Leader / Rusher', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Genta', 'https://instagram.com', 'https://x.com', 2),
('pubg_mobile', 'Bagus Prabaswara', 'Bagus', 'Main Sniper', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bagus', 'https://instagram.com', NULL, 3),
('pubg_mobile', 'Made Bagas', 'Zuxxy-Junior', 'Scout / Support', 'https://api.dicebear.com/7.x/adventurer/svg?seed=MadeBagas', NULL, NULL, 4),
('pubg_mobile', 'Alvin Pratama', 'Alvin', 'Support / Healer', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alvin', NULL, 'https://x.com', 5);

-- Free Fire
INSERT INTO public.esport_rosters (division_id, name, ign, role, image_url, social_instagram, social_twitter, sort_order) VALUES
('free_fire', 'Hendra Wijaya', 'Hendra', 'Team Manager', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hendra', 'https://instagram.com', NULL, 0),
('free_fire', 'Muhammad Fatah', 'Fatah', 'Captain / Rusher', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fatah', 'https://instagram.com', 'https://x.com', 1),
('free_fire', 'Rian Hermawan', 'Rian', 'Main Grenadier', 'https://api.dicebear.com/7.x/adventurer/svg?seed=RianFF', 'https://instagram.com', NULL, 2),
('free_fire', 'Syahrul Ramadhan', 'Syahrul', 'Support', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Syahrul', NULL, NULL, 3),
('free_fire', 'Farhan Alamsyah', 'Farhan', 'Flanker', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Farhan', NULL, 'https://x.com', 4);

-- Insert Matches
-- Mobile Legends
INSERT INTO public.esport_matches (division_id, opponent, opponent_logo, date, time, stage, status, score, result, stream_url) VALUES
('mobile_legends', 'EVOS Hope', '🦁', '10 Juni 2026', '19:00 WIB', 'Grand Finals - Intanium Cup', 'Past', '2 - 1', 'win', 'https://youtube.com'),
('mobile_legends', 'RRQ Sena', '👑', '20 Juni 2026', '15:30 WIB', 'Regular Season - MDL ID S13', 'Upcoming', '', '', 'https://youtube.com'),
('mobile_legends', 'Alter Ego X', '🎭', '24 Juni 2026', '17:00 WIB', 'Regular Season - MDL ID S13', 'Upcoming', '', '', 'https://youtube.com');

-- eFootball
INSERT INTO public.esport_matches (division_id, opponent, opponent_logo, date, time, stage, status, score, result, stream_url) VALUES
('efootball', 'Persija Esport', '🐯', '05 Juni 2026', '16:00 WIB', 'Pekan 4 - eLeague Indonesia', 'Past', '3 - 1', 'win', 'https://youtube.com'),
('efootball', 'Bali United', '🔴', '22 Juni 2026', '18:00 WIB', 'Pekan 5 - eLeague Indonesia', 'Upcoming', '', '', 'https://youtube.com');

-- PUBG Mobile
INSERT INTO public.esport_matches (division_id, opponent, opponent_logo, date, time, stage, status, score, result, stream_url) VALUES
('pubg_mobile', 'Bigetron Beta', '🤖', '08 Juni 2026', '14:00 WIB', 'Finals Day 3 - PMCS S5', 'Past', 'Rank 5', 'lose', 'https://youtube.com'),
('pubg_mobile', 'PMPL Community League', '⭐', '25 Juni 2026', '13:00 WIB', 'Grand Finals - Day 1', 'Upcoming', '', '', 'https://youtube.com');

-- Free Fire
INSERT INTO public.esport_matches (division_id, opponent, opponent_logo, date, time, stage, status, score, result, stream_url) VALUES
('free_fire', 'SES Alfaink', '🐺', '12 Juni 2026', '20:30 WIB', 'Finals Match 6 - FFML Nusantara', 'Past', 'Booyah! (12 Kills)', 'win', 'https://youtube.com'),
('free_fire', 'Free Fire Master League', '🔥', '28 Juni 2026', '19:00 WIB', 'Group Stage Round 1', 'Upcoming', '', '', 'https://youtube.com');

-- Insert Achievements
INSERT INTO public.esport_achievements (division_id, title, rank, date, badge, image_url) VALUES
('mobile_legends', 'Champion - Intanium Cup 2026', '1st Place', 'Juni 2026', '🏆', NULL),
('mobile_legends', 'Runner Up - Community League Championship', '2nd Place', 'Desember 2025', '🥈', NULL),
('efootball', 'Champion - eFootball Community League 2026', '1st Place', 'Mei 2026', '🏆', NULL),
('pubg_mobile', '3rd Place - PMPL Community Season 5', '3rd Place', 'April 2026', '🥉', NULL),
('free_fire', 'Champion - FFML Nusantara Series 2026', '1st Place', 'Mei 2026', '🏆', NULL);
