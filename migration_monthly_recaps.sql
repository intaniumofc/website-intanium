-- migration_monthly_recaps.sql
-- Create monthly_recaps table
CREATE TABLE IF NOT EXISTS monthly_recaps (
  id TEXT PRIMARY KEY, -- e.g., '2026-01'
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  theme TEXT NOT NULL,
  left_page JSONB NOT NULL,
  right_page JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_recaps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on monthly_recaps" ON monthly_recaps;
DROP POLICY IF EXISTS "Allow admin all on monthly_recaps" ON monthly_recaps;

-- Create policies
CREATE POLICY "Allow public read on monthly_recaps" 
  ON monthly_recaps FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin all on monthly_recaps" 
  ON monthly_recaps FOR ALL 
  USING (auth.role() = 'authenticated');

-- Seed data for Januari 2026
INSERT INTO monthly_recaps (id, year, month, theme, left_page, right_page)
VALUES (
  '2026-01',
  2026,
  'Januari',
  'A Bright New Chapter',
  '{
    "theater": {
      "total": 10,
      "items": [
        {"date": "11 Jan 2026", "title": "Zenza (Aturan Anti Cinta)"},
        {"date": "17 Jan 2026", "title": "Zenza (Aturan Anti Cinta)"},
        {"date": "22 Jan 2026", "title": "Zenza (Aturan Anti Cinta)"},
        {"date": "25 Jan 2026", "title": "Zenza (Aturan Anti Cinta)"},
        {"date": "31 Jan 2026", "title": "Zenza (Aturan Anti Cinta)"},
        {"date": "10 Jan 2026", "title": "Back Dancer (Cara Meminum Ramune)"},
        {"date": "18 Jan 2026", "title": "Back Dancer (Cara Meminum Ramune)"},
        {"date": "24 Jan 2026", "title": "Back Dancer (Cara Meminum Ramune)"},
        {"date": "25 Jan 2026", "title": "Back Dancer (Cara Meminum Ramune)"},
        {"date": "31 Jan 2026", "title": "Back Dancer (Cara Meminum Ramune)"}
      ]
    },
    "youtube": {
      "date": "10 Jan 2026",
      "title": "Senshuraku Setlist \"Ingin Bertemu\" \"Aturan Anti Cinta\" \"Kira Kira Girls\""
    },
    "live": {
      "platform": "IDN Live & Showroom Live",
      "total": 13,
      "dates": [2, 6, 9, 13, 13, 19, 20, 21, 22, 26, 27, 29, 31]
    }
  }'::jsonb,
  '{
    "privateMessage": {
      "bubbleChat": 611,
      "voiceNote": 31,
      "photo": 302
    },
    "videoCall": {
      "title": "JKT48 14th Anniversary Concert & Gracia Graduation Ceremony",
      "dates": ["15 Januari 2026", "20 Januari 2026"]
    },
    "event": {
      "date": "13 Jan 2026",
      "title": "Content Channel IDN Live: TEMEN MAIN Youthful & Energetic Januari Ep.1 New Year Starts With Us! { Intan & Ekin }"
    },
    "monthlyNote": "Januari 2026 dibuka dengan panggung theater yang padat (5x Zenza & 5x Back Dancer), konten seru Temen Main di IDN Live, serta momen berharga di Video Call JKT48 14th Anniversary & konser kelulusan Gracia."
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET year = EXCLUDED.year,
    month = EXCLUDED.month,
    theme = EXCLUDED.theme,
    left_page = EXCLUDED.left_page,
    right_page = EXCLUDED.right_page;

-- Seed data for Februari 2026
INSERT INTO monthly_recaps (id, year, month, theme, left_page, right_page)
VALUES (
  '2026-02',
  2026,
  'Februari',
  'A Month Full of Heart',
  '{
    "theater": {
      "total": 5,
      "items": [
        {"date": "21 Feb 2026", "title": "Variety Show: Pertunjukan Z vs Alpha"},
        {"date": "22 Feb 2026", "title": "JKT48 School"},
        {"date": "05 Feb 2026", "title": "Zenza"},
        {"date": "13 Feb 2026", "title": "Zenza"},
        {"date": "12 Feb 2026", "title": "Back Dancer {TWT}"}
      ]
    },
    "youtube": {
      "date": "-",
      "title": "-"
    },
    "live": {
      "platform": "IDN Live",
      "total": 22,
      "dates": [3, 4, 5, 6, 7, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 24, 25, 26, 27]
    }
  }'::jsonb,
  '{
    "privateMessage": {
      "bubbleChat": 813,
      "voiceNote": 19,
      "photo": 295
    },
    "videoCall": {
      "title": "JKT48 27th Single: Andai ''Ku Bukan Idola - Idol Nanka Janakattara",
      "dates": ["8 Februari 2026", "25 Februari 2026"]
    },
    "event": {
      "date": "24 Feb 2026",
      "title": "Nur Intan Birthday Project: Luce In A Cup: Where The Light Begins"
    },
    "monthlyNote": "Februari dipenuhi dengan kemeriahan perayaan ulang tahun Intan lewat Birthday Project ''Luce In A Cup'', 5 kali pertunjukan theater termasuk Variety Show dan JKT48 School, serta interaksi pesan PM yang semakin intens."
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET year = EXCLUDED.year,
    month = EXCLUDED.month,
    theme = EXCLUDED.theme,
    left_page = EXCLUDED.left_page,
    right_page = EXCLUDED.right_page;
