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
  is_admin BOOLEAN DEFAULT false
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
  url TEXT NOT NULL
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

-- 6. Mading Notes (Public Read, Public Insert, Admin Delete/Update)
ALTER TABLE mading_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on mading_notes" ON mading_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mading_notes" ON mading_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update/delete on mading_notes" ON mading_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete on mading_notes" ON mading_notes FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Orders & Payments (Public Insert, Admin Read/Update/Delete)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all on orders" ON orders FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin all on payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
