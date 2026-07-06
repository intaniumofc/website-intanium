-- Add audio_url and cover_url to most_played_songs table
ALTER TABLE most_played_songs ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE most_played_songs ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Audio and cover URLs are now managed dynamically via the Admin panel.
-- No seed data updates are needed.
