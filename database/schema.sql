-- schema.sql
CREATE TABLE IF NOT EXISTS merchandise (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  image_urls TEXT[],
  category TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  sizes TEXT[]
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  order_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirm_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  time TIMESTAMPTZ NOT NULL,
  platform TEXT,
  link TEXT,
  duration TEXT,
  thumbnail TEXT
);

CREATE TABLE IF NOT EXISTS mading_notes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  theme_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS recaps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  publish_date DATE NOT NULL,
  summary TEXT,
  thumbnail_url TEXT
);

CREATE TABLE IF NOT EXISTS recap_pages (
  id SERIAL PRIMARY KEY,
  recap_id TEXT REFERENCES recaps(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  page_number INT
);

CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  display_type TEXT DEFAULT 'gallery'
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- 1. Merchandise (Public Read, Admin All)
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on merchandise" ON merchandise FOR SELECT USING (true);
CREATE POLICY "Allow admin all on merchandise" ON merchandise FOR ALL USING (auth.role() = 'authenticated');

-- 2. News (Public Read, Admin All)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow admin all on news" ON news FOR ALL USING (auth.role() = 'authenticated');

-- 3. Events (Public Read, Admin All)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow admin all on events" ON events FOR ALL USING (auth.role() = 'authenticated');

-- 4. Recaps & Recap Pages (Public Read, Admin All)
ALTER TABLE recaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on recaps" ON recaps FOR SELECT USING (true);
CREATE POLICY "Allow admin all on recaps" ON recaps FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE recap_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on recap_pages" ON recap_pages FOR SELECT USING (true);
CREATE POLICY "Allow admin all on recap_pages" ON recap_pages FOR ALL USING (auth.role() = 'authenticated');

-- 5. Gallery (Public Read, Admin All)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow admin all on gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');

-- 6. Mading Notes (Public Approved Read, Public Insert, Admin Delete/Update/Select)
ALTER TABLE mading_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on mading_notes" ON mading_notes FOR SELECT USING (is_approved = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public insert on mading_notes" ON mading_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update/delete on mading_notes" ON mading_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete on mading_notes" ON mading_notes FOR DELETE USING (auth.role() = 'authenticated');
-- 1. Tambahkan kolom is_approved dengan default false
ALTER TABLE mading_notes ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Migrasikan data lama agar pesan yang sudah ada tetap tayang
UPDATE mading_notes SET is_approved = true WHERE is_approved IS NULL;

-- 3. Perbarui kebijakan Row Level Security (RLS) agar tamu hanya membaca data ter-approve
DROP POLICY IF EXISTS "Allow public read on mading_notes" ON mading_notes;
CREATE POLICY "Allow public read on mading_notes" 
ON mading_notes 
FOR SELECT 
USING (is_approved = true OR auth.role() = 'authenticated');


-- 7. Orders & Payments (Public Insert, Admin Read/Update/Delete)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow admin all on orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow admin all on payments" ON payments FOR ALL USING (auth.role() = 'authenticated');

-- 8. Playlists (Public Read, Admin All)
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  badge_text TEXT,
  duration TEXT,
  tracks_count TEXT,
  embed_url TEXT,
  spotify_url TEXT NOT NULL,
  spotify_embed_url TEXT NOT NULL,
  curator_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on playlists" ON playlists FOR SELECT USING (true);
CREATE POLICY "Allow admin all on playlists" ON playlists FOR ALL USING (auth.role() = 'authenticated');

-- 9. Most Played Songs (Public Read, Admin All)
CREATE TABLE IF NOT EXISTS most_played_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  play_count TEXT NOT NULL,
  mood TEXT,
  note TEXT,
  audio_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE most_played_songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on most_played_songs" ON most_played_songs FOR SELECT USING (true);
CREATE POLICY "Allow admin all on most_played_songs" ON most_played_songs FOR ALL USING (auth.role() = 'authenticated');

-- 10. #IntanShiningStar Achievements & Timeline
CREATE TABLE IF NOT EXISTS intan_shining_star_achievements (
  id TEXT PRIMARY KEY,
  sort_date DATE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Milestone', 'Theater', 'Live', 'Video Call', 'Event', 'Content', 'Fan Project')
  ),
  description TEXT NOT NULL,
  image_url TEXT,
  is_major BOOLEAN NOT NULL DEFAULT false,
  show_in_achievement BOOLEAN NOT NULL DEFAULT true,
  show_in_timeline BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (show_in_achievement OR show_in_timeline)
);

CREATE INDEX IF NOT EXISTS intan_shining_star_sort_date_idx
  ON intan_shining_star_achievements (sort_date DESC);

ALTER TABLE intan_shining_star_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on intan_shining_star_achievements"
  ON intan_shining_star_achievements FOR SELECT
  USING (show_in_achievement OR show_in_timeline);
CREATE POLICY "Allow admin all on intan_shining_star_achievements"
  ON intan_shining_star_achievements FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 11. Hashtags (Public Read, Admin All)
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  count TEXT DEFAULT '0 Tweets',
  explanation TEXT,
  row_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on hashtags" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Allow admin all on hashtags" ON hashtags FOR ALL USING (auth.role() = 'authenticated');
