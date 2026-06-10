-- migration_about_intan.sql
-- Migrasi tabel untuk fitur Halaman About Intan (Profil, Statistik, Setlist, Video, Trivia)

-- ==========================================
-- 1. STATISTIK INTAN
-- ==========================================
CREATE TABLE IF NOT EXISTS intan_stats (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INT DEFAULT 0
);

ALTER TABLE intan_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_stats" ON intan_stats;
DROP POLICY IF EXISTS "Allow admin all on intan_stats" ON intan_stats;
CREATE POLICY "Allow public read on intan_stats" ON intan_stats FOR SELECT USING (true);
CREATE POLICY "Allow admin all on intan_stats" ON intan_stats FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 2. SETLIST & UNIT SONGS
-- ==========================================
CREATE TABLE IF NOT EXISTS intan_setlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  shows TEXT,
  theme TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'Aktif',
  note TEXT,
  sort_order INT DEFAULT 0
);

ALTER TABLE intan_setlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_setlists" ON intan_setlists;
DROP POLICY IF EXISTS "Allow admin all on intan_setlists" ON intan_setlists;
CREATE POLICY "Allow public read on intan_setlists" ON intan_setlists FOR SELECT USING (true);
CREATE POLICY "Allow admin all on intan_setlists" ON intan_setlists FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS intan_unit_songs (
  id SERIAL PRIMARY KEY,
  setlist_id TEXT REFERENCES intan_setlists(id) ON DELETE CASCADE,
  song_name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE (setlist_id, sort_order)
);
CREATE UNIQUE INDEX IF NOT EXISTS intan_unit_songs_setlist_sort_order_idx
  ON intan_unit_songs (setlist_id, sort_order);

ALTER TABLE intan_unit_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_unit_songs" ON intan_unit_songs;
DROP POLICY IF EXISTS "Allow admin all on intan_unit_songs" ON intan_unit_songs;
CREATE POLICY "Allow public read on intan_unit_songs" ON intan_unit_songs FOR SELECT USING (true);
CREATE POLICY "Allow admin all on intan_unit_songs" ON intan_unit_songs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 3. VIDEO HIGHLIGHTS YOUTUBE
-- ==========================================
CREATE TABLE IF NOT EXISTS intan_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT,
  sort_order INT DEFAULT 0
);

ALTER TABLE intan_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_videos" ON intan_videos;
DROP POLICY IF EXISTS "Allow admin all on intan_videos" ON intan_videos;
CREATE POLICY "Allow public read on intan_videos" ON intan_videos FOR SELECT USING (true);
CREATE POLICY "Allow admin all on intan_videos" ON intan_videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. TRIVIA & FUN FACTS FAQ
-- ==========================================
CREATE TABLE IF NOT EXISTS intan_trivia (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE (question)
);
CREATE UNIQUE INDEX IF NOT EXISTS intan_trivia_question_idx ON intan_trivia (question);

ALTER TABLE intan_trivia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_trivia" ON intan_trivia;
DROP POLICY IF EXISTS "Allow admin all on intan_trivia" ON intan_trivia;
CREATE POLICY "Allow public read on intan_trivia" ON intan_trivia FOR SELECT USING (true);
CREATE POLICY "Allow admin all on intan_trivia" ON intan_trivia FOR ALL TO authenticated USING (true) WITH CHECK (true);
