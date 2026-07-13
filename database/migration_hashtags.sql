-- Table: hashtags
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  count TEXT DEFAULT '0 Tweets',
  explanation TEXT,
  row_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on hashtags" ON hashtags FOR SELECT USING (true);
CREATE POLICY "Allow admin all on hashtags" ON hashtags FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial data
INSERT INTO hashtags (text, count, row_number, explanation) VALUES
('#IRIS', '14.2K Tweets', 1, 'Tagar resmi untuk fanclub dan komunitas penggemar Intan. Digunakan untuk obrolan umum dan info.'),
('#BerkilauIntan', '8.5K Tweets', 1, 'Tagar untuk momen spesial ketika Intan bersinar terang, baik di stage maupun di konten.'),
('#IntanJKT48', '10.1K Tweets', 1, 'Tagar umum yang sering digunakan untuk menyebut member JKT48 Nur Intan.'),
('#PermataIntan', '4.3K Tweets', 1, 'Sebutan sayang untuk fans Intan, saling mendukung bagaikan permata.'),
('#MatchaVibes', '6.8K Tweets', 1, 'Tagar seru karena Intan sangat menyukai Matcha! Biasa digunakan saat membahas makanan favoritnya.'),
('#ShowTheaterIntan', '7.2K Tweets', 1, 'Gunakan tagar ini saat Intan sedang atau selesai perform di Theater JKT48.'),
('#CahayaIRIS', '5.1K Tweets', 2, 'Cahaya penyemangat dari fans yang selalu mendukung Intan tanpa lelah.'),
('#IntanUntukDunia', '3.9K Tweets', 2, 'Harapan besar agar Intan terus bersinar hingga ke kancah global.'),
('#WajibMatcha', '2.4K Tweets', 2, 'Candaan antar fans bahwa setiap momen harus ada unsur matcha.'),
('#ChibiIntan', '4.8K Tweets', 2, 'Menyoroti sisi imut dan menggemaskan dari Intan.'),
('#IntanLevelUp', '9.2K Tweets', 2, 'Dukungan untuk perkembangan skill dan karir Intan di JKT48.'),
('#LoveIntan', '11.5K Tweets', 2, 'Cinta tanpa batas dan tanpa syarat untuk Intan dari seluruh penggemar.');
