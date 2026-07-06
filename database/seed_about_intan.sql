-- seed_about_intan.sql
-- Data awal (seed) untuk tabel About Intan, dimigrasikan dari hardcoded aboutIntanService.js

-- ==========================================
-- 1. STATISTIK
-- ==========================================
INSERT INTO intan_stats (id, label, value, icon, description, sort_order) VALUES
  ('stat-1', 'Total Show Teater', '128+ Show', 'Theater', 'Jumlah penampilan resmi di Teater JKT48', 1),
  ('stat-2', 'Total Live Showroom', '256+ Live', 'Radio', 'Siaran langsung menyapa penggemar secara interaktif', 2),
  ('stat-3', 'Partisipasi Setlist', '3 Setlist', 'ListMusic', 'Setlist panggung teater yang aktif dikuasai', 3),
  ('stat-4', 'Total Event / Konser', '8+ Event', 'Mic2', 'Penampilan di konser anniversary, regional tour, & festival', 4)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. SETLIST
-- ==========================================
INSERT INTO intan_setlists (id, name, period, shows, theme, image_url, status, note, sort_order) VALUES
  ('setlist-1', 'Aitakatta', 'Desember 2024 - Sekarang', '45+ Shows', 'aitakatta', '/setlistaitakatta.webp', 'Aktif', 'Setlist reguler pertunjukan teater bagi Trainee JKT48 Generasi 13.', 1),
  ('setlist-2', 'Pajama Drive', 'Desember 2024 - Sekarang', '38+ Shows', 'pajama', '/setlistpajamadrive.webp', 'Aktif', 'Setlist legendaris trainee JKT48 yang dibawakan kembali dengan penuh semangat oleh Generasi 13.', 2),
  ('setlist-3', 'Kira-kira Girls', '2025 - Sekarang', '12+ Shows', 'kirakira', '/setlistkirakiragirls.webp', 'Aktif', 'Setlist pertunjukan teater khusus Trainee JKT48 yang menampilkan potensi luar biasa para member baru.', 3)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2b. UNIT SONGS (per setlist)
-- ==========================================
-- Aitakatta
INSERT INTO intan_unit_songs (setlist_id, song_name, sort_order) VALUES
  ('setlist-1', 'Nageki no Figure (Boneka yang Menyedihkan)', 1),
  ('setlist-1', 'Glass no I Love You (Kaca Berbentuk I Love You)', 2),
  ('setlist-1', 'Senaka Kara Dakishimete (Dekap Aku dari Belakang)', 3),
  ('setlist-1', 'Koi no Plan (Rencana Cinta)', 4)
ON CONFLICT (setlist_id, sort_order) DO UPDATE SET song_name = EXCLUDED.song_name;

-- Pajama Drive
INSERT INTO intan_unit_songs (setlist_id, song_name, sort_order) VALUES
  ('setlist-2', 'Tenshi no Shippo (Ekor Malaikat)', 1),
  ('setlist-2', 'Pajama Drive', 2),
  ('setlist-2', 'Temodemo no Namida', 3)
ON CONFLICT (setlist_id, sort_order) DO UPDATE SET song_name = EXCLUDED.song_name;

-- Kira-kira Girls
INSERT INTO intan_unit_songs (setlist_id, song_name, sort_order) VALUES
  ('setlist-3', 'Blue Rose', 1),
  ('setlist-3', 'Kinjirareta Futari (Dua Orang yang Terlarang)', 2),
  ('setlist-3', 'Faint', 3)
ON CONFLICT (setlist_id, sort_order) DO UPDATE SET song_name = EXCLUDED.song_name;

-- ==========================================
-- 3. VIDEO HIGHLIGHTS
-- ==========================================
INSERT INTO intan_videos (id, title, youtube_id, category, duration, sort_order) VALUES
  ('vid-1', 'JKT48 13th Generation Profile: Intan', 'SojGpGHMYEA', 'Profile', '03:45', 1),
  ('vid-2', 'Belajar Konseling bersama Intan', 'nZL7vtku_o4', 'Vlog', '11:24', 2),
  ('vid-3', '[JAHAT-JAHATAN] SPESIAL DIRGAHAYU RI KE-80!', 'ek8xyzdx0NI', 'Jahat-Jahatan', '15:40', 3),
  ('vid-4', '[LAST CONTENT] GRACIA VS ADIK-ADIK', '1p-0wQB-5M8', 'Last Content', '18:12', 4),
  ('vid-5', 'TEMEN MAIN EP.4: THE FINAL GAME ON! - Intan vs Trisha', 'HRA-zTDD4Ek', 'Temen Main', '14:50', 5),
  ('vid-6', '[SECRET CAM] Personal Meet & Greet: LOVE DREAM PASSION', '8j_SX3BgWVc', 'Secret Cam', '08:12', 6)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. TRIVIA & FUN FACTS
-- ==========================================
INSERT INTO intan_trivia (question, answer, sort_order) VALUES
  ('Siapa member tertua di JKT48 Generasi 13?', 'Intan merupakan member tertua di JKT48 Generasi 13 (Trainee).', 1),
  ('Apa makanan favorit Nur Intan?', 'Sangat menyukai hidangan pedas seperti seblak, bakso aci, dan camilan rasa cokelat manis.', 2),
  ('Apa saja hobi dan minat Intan di luar JKT48?', 'Menari (dance cover), mendengarkan lagu pop/K-Pop (terutama GFRIEND), membaca komik, dan fotografi.', 3),
  ('Apakah Intan memiliki ketakutan atau fobia tertentu?', 'Sangat takut terhadap serangga kecil bersayap yang terbang tak teratur, khususnya kecoa terbang.', 4),
  ('Apa saja prestasi Intan di bidang bela diri dan tari sebelum masuk JKT48?', 'Sebelum bergabung dengan JKT48, Intan merupakan atlet pencak silat berprestasi dan penari aktif. Mewakili Perguruan Silat Sabda Sunda, ia berhasil meraih Juara 1 di ajang Pusaka Sunda Cup se-Jabodetabek pada 10 Juli 2022. Ia juga mengikuti kompetisi "DBL Dance Competition 2023 - West Java Series West Region" dan masuk nominasi "DBL Favorite Dancer 2023" mewakili SMA Negeri 3 Bogor.', 5),
  ('Di mana Intan menempuh pendidikan perguruan tinggi?', 'Saat ini, Intan sedang menempuh pendidikan jenjang Diploma 3 (D3) program studi Periklanan Kreatif, Program Pendidikan Vokasi di Universitas Indonesia (UI) Depok, angkatan 2024. Sebelum bergabung dengan JKT48, ia sering melakukan dance cover lagu JKT48 bersama teman-teman kuliahnya.', 6),
  ('Apakah Intan pernah muncul di video YouTube JKT48 sebelum resmi bergabung?', 'Ya! Pada 11 Maret 2025, Intan mengungkapkan lewat akun X resminya bahwa ia pernah berpartisipasi dalam video YouTube "JKT48 Dance Class for Kids" yang diunggah pada 10 Februari 2016 saat ia masih berusia 9 tahun. Menariknya, Diva (Generasi 2 KLP48) juga ikut tampil dalam acara yang sama kala itu.', 7),
  ('Bagaimana kisah perjuangan dan kegagalan Intan saat mengikuti audisi JKT48?', 'Perjalanan Intan tidaklah instan; ia sempat gagal di dua audisi JKT48 dan satu audisi KLP48. Ia awalnya ingin mendaftar JKT48 Generasi 10 pada 2020 tapi diurungkan karena belum siap. Kemudian ia mendaftar Generasi 11 pada 2022 namun gagal di berkas. Pada 2023, formulir pendaftaran Generasi 12 miliknya gagal terkirim. Ia juga mencoba peruntungan di KLP48 Generasi 1 pada awal 2024 namun belum berhasil, sebelum akhirnya resmi lolos di JKT48 Generasi 13 di akhir 2024.', 8),
  ('Apa penyesalan terbesar Intan sebelum resmi terpilih sebagai member?', 'Sebelum resmi terpilih menjadi member, Intan mengaku menyesal karena belum pernah mencoba mendaftar untuk menonton pertunjukan langsung di Teater JKT48 sebagai fans.', 9),
  ('Kapan penampilan perdana Intan sebagai backdancer di Teater JKT48?', 'Penampilan perdana Intan sebagai backdancer (BD) di Teater JKT48 terjadi pada 19 Oktober 2025 membawakan lagu "Glory Days" pada JKT48 5th Stage (Glory).', 10),
  ('Apa quote motivasi yang menjadi prinsip bagi Intan?', '"Seperti permata yang tersembunyi, aku akan terus berlatih dan mengasah kemampuanku agar bisa bersinar terang di hatimu!"', 11)
ON CONFLICT (question) DO UPDATE SET answer = EXCLUDED.answer, sort_order = EXCLUDED.sort_order;
