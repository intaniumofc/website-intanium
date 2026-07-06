-- migration_intan_shining_star.sql
-- Database, seed, RLS, and Storage setup for #IntanShiningStar.

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

-- Remove fields from the previous structure when this migration is rerun.
DROP INDEX IF EXISTS intan_shining_star_single_latest_idx;
ALTER TABLE intan_shining_star_achievements
  DROP COLUMN IF EXISTS display_date,
  DROP COLUMN IF EXISTS source_label,
  DROP COLUMN IF EXISTS source_url,
  DROP COLUMN IF EXISTS is_latest;

CREATE OR REPLACE FUNCTION set_intan_shining_star_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS intan_shining_star_updated_at_trigger
  ON intan_shining_star_achievements;
CREATE TRIGGER intan_shining_star_updated_at_trigger
BEFORE UPDATE ON intan_shining_star_achievements
FOR EACH ROW EXECUTE FUNCTION set_intan_shining_star_updated_at();

ALTER TABLE intan_shining_star_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on intan_shining_star_achievements"
  ON intan_shining_star_achievements;
DROP POLICY IF EXISTS "Allow admin all on intan_shining_star_achievements"
  ON intan_shining_star_achievements;

CREATE POLICY "Allow public read on intan_shining_star_achievements"
  ON intan_shining_star_achievements
  FOR SELECT USING (show_in_achievement OR show_in_timeline);

CREATE POLICY "Allow admin all on intan_shining_star_achievements"
  ON intan_shining_star_achievements
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO intan_shining_star_achievements (
  id, sort_date, title, category, description, is_major,
  show_in_achievement, show_in_timeline
) VALUES
  (
    'gen13-introduction',
    '2024-12-31',
    'Resmi Menjadi JKT48 Generasi 13',
    'Milestone',
    'Setelah melewati beberapa proses audisi, Intan resmi memulai babak baru sebagai trainee JKT48 Generasi 13.',
    true,
    true,
    true
  ),
  (
    'profile-content',
    '2025-03-01',
    'JKT48 13th Generation Profile: Intan',
    'Content',
    'Konten profil generasi memperkenalkan karakter, energi, dan cerita Intan kepada lebih banyak penggemar.',
    false,
    true,
    true
  ),
  (
    'first-theater-backdancer',
    '2025-10-19',
    'Penampilan Perdana sebagai Backdancer',
    'Theater',
    'Intan tampil sebagai backdancer untuk lagu Glory Days pada JKT48 5th Stage, menjadi langkah penting dalam perjalanan panggungnya.',
    true,
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Public bucket for optimized WebP achievement images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete assets" ON storage.objects;

CREATE POLICY "Allow public read assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Allow authenticated upload assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Allow authenticated update assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'assets')
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Allow authenticated delete assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assets');
