# Spesifikasi Desain: Game Gosok Intan (Scratch Card)

Dokumen ini mendefinisikan spesifikasi teknis dan desain untuk menggantikan mini-game "Tebak Kata" dengan game gosok titik hitam interaktif bernama **"Gosok Intan"** di website Intanium.

---

## 1. Deskripsi Game

**Gosok Intan** adalah mini-game berbasis keberuntungan dan taktik (push-your-luck) di mana pemain menggosok titik hitam untuk menemukan foto Kak Intan (Diamond) sebanyak mungkin tanpa mengenai bom.

### Aturan Permainan:
1. Pemain memasukkan username sebelum bermain (menyatu dengan data `menangkap-kecoa`).
2. Sesi permainan dimulai dengan 16 titik hitam tertutup (grid 4x4).
3. Pemain menggunakan mouse/touchpad/jari untuk menggosok titik hitam tersebut secara interaktif.
4. Di balik titik hitam terdapat salah satu dari:
   * **Intan (Gem/Diamond)**: Memberikan skor +10. Setiap diamond yang terbuka akan menampilkan foto ekspresi Kak Intan yang berbeda.
   * **Bom (Bomb)**: Menghentikan permainan secara instan (Game Over) dan menghanguskan sesi aktif.
   * **Zonk (Kosong)**: Titik terbuka kosong, tidak memberikan poin, namun aman untuk terus bermain.
5. **Kondisi Menang**: Menemukan seluruh diamond di papan (misalnya ada 8 diamond).
6. **Kondisi Kalah**: Mengenai bom.
7. **Sistem Tiket**: Setiap pemain dibatasi maksimal 5 sesi bermain per hari (dihitung per IP address + username).

---

## 2. Arsitektur & Keamanan (Anti-Cheat)

Untuk menghindari manipulasi skor melalui Inspect Element:
1. **Server-side State**: Grid jawaban (posisi bom/diamond/zonk) tidak pernah dikirim ke client di awal permainan. Jawaban disimpan dengan aman di database.
2. **On-Demand Reveal**: Ketika pemain selesai menggosok satu titik di client-side (>50% terhapus), client mengirim request koordinat titik ke server. Server mengembalikan isi titik tersebut secara real-time.
3. **Session Verification**: Skor akhir diverifikasi di server berdasarkan hasil pembukaan sesi tersebut sebelum disimpan ke leaderboard global.

---

## 3. Skema Database (Supabase)

### A. Tabel `scratch_sessions`
Digunakan untuk menyimpan status sesi aktif dan melacak kecurangan:
```sql
create table if not exists public.scratch_sessions (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  ip_hash text not null,
  grid_data jsonb not null, -- Array acak: ["diamond", "bomb", "zonk", ...]
  revealed_cells integer[] default array[]::integer[], -- Index yang sudah dibuka
  score integer default 0,
  status text not null default 'playing' check (status in ('playing', 'won', 'lost')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Indeks untuk query performa
create index if not exists scratch_sessions_ip_today_idx 
  on public.scratch_sessions (ip_hash, created_at);
```

### B. Pembaruan Tabel `game_scores`
Memperbarui kendala pemeriksaan `mode` untuk mendukung `'gosok-intan'`:
```sql
alter table public.game_scores drop constraint if exists game_scores_mode_check;
alter table public.game_scores add constraint game_scores_mode_check check (mode in ('classic', 'gosok-intan'));

-- Update policy RLS untuk insert agar mendukung mode 'gosok-intan'
drop policy if exists "Anyone can submit game score" on public.game_scores;
create policy "Anyone can submit game score"
  on public.game_scores for insert
  with check (
    score between 0 and 100000
    and char_length(username) between 2 and 24
    and mode in ('classic', 'gosok-intan')
  );
```

---

## 4. API Endpoints (Next.js)

### A. `POST /api/games/scratch/start`
* **Input (JSON Body)**: `{ "username": "string" }`
* **Logika**:
  1. Dapatkan IP address pemain dan buat hash (SHA-256).
  2. Hitung jumlah rekaman di `scratch_sessions` dengan `ip_hash` atau `username` pada hari yang sama (UTC).
  3. Jika count >= 5, return `429 Too Many Requests` dengan pesan kuota habis.
  4. Jika lolos, acak grid 4x4 (16 kotak). Contoh komposisi:
     * 3 Bom (`bomb`)
     * 7 Diamond (`diamond`)
     * 6 Kosong (`zonk`)
  5. Simpan sesi baru ke tabel `scratch_sessions` dengan status `playing`.
  6. Return:
     ```json
     {
       "success": true,
       "sessionId": "uuid-session",
       "ticketsLeft": 4
     }
     ```

### B. `POST /api/games/scratch/reveal`
* **Input (JSON Body)**: `{ "sessionId": "uuid", "cellIndex": integer }`
* **Logika**:
  1. Ambil baris sesi berdasarkan `sessionId` dari database.
  2. Pastikan sesi masih berstatus `playing` dan `cellIndex` belum ada di `revealed_cells`.
  3. Baca nilai `grid_data[cellIndex]`:
     * **`bomb`**: 
       * Update status sesi menjadi `lost`.
       * Kembalikan hasil `bomb` dan selesaikan game.
     * **`diamond`**:
       * Tambahkan skor sesi (+10).
       * Cek apakah semua `diamond` di `grid_data` sudah terbuka. Jika ya, ubah status sesi menjadi `won`.
       * Masukkan skor akhir ke tabel `game_scores` jika status berubah menjadi `won` atau `lost`.
     * **`zonk`**:
       * Tetap simpan sesi sebagai `playing`.
  4. Tambahkan `cellIndex` ke array `revealed_cells` di database.
  5. Return:
     ```json
     {
       "result": "diamond" | "bomb" | "zonk",
       "score": 40,
       "status": "playing" | "won" | "lost"
     }
     ```

---

## 5. Implementasi Frontend

### A. Alur Halaman `/games/gosok-intan`
1. **Layar Awal**: Input nama + cek sisa tiket hari ini.
2. **Layar Arena**:
   * Grid 4x4 berisi 16 komponen Canvas Scratch-off.
   * Skor Counter dan status tiket dinamis.
3. **Pemberian Umpan Balik (Feedback Visual)**:
   * **Animasi Gosok**: Serpihan abu-abu berterbangan saat pointer digesek.
   * **Ledakan**: Jika terkena bom, memunculkan efek goyang layar (screen shake) dan animasi partikel ledakan merah.
   * **Sparkle**: Jika mendapatkan diamond, memunculkan kilauan bintang kuning di sekitar gambar wajah Kak Intan yang terbuka.

### B. Detail Komponen Canvas Scratch-Off
* Canvas menggambar lingkaran abu-abu metalik sebagai penutup.
* Mendeteksi sentuhan/gesekan kursor dengan metode `destination-out`.
* Ketika gesekan selesai (`pointerup`), sistem mengekstrak pixel data:
  ```javascript
  const imgData = ctx.getImageData(0, 0, width, height);
  // Hitung persentase pixel yang transparan (alpha = 0)
  ```
* Jika transparan > 50%, hancurkan lapisan canvas penutup (fade-out) dan panggil API reveal.

---

## 6. Rencana Pengujian (Verification Plan)

### A. Uji Coba Keamanan (Anti-Cheat)
* Mencoba mencari kata kunci bom/diamond di DOM/HTML menggunakan Inspect Element (harus nihil).
* Mencoba menembak API `/api/games/scratch/reveal` dengan session ID palsu atau indeks di luar batas.
* Memverifikasi bypass tiket dengan menghapus LocalStorage (harus tetap dibatasi oleh IP Hash di server).

### B. Uji Coba Fungsionalitas
* Verifikasi efek suara (jika ada) dan animasi ledakan saat bom tergosok.
* Verifikasi pengiriman skor akhir ke leaderboard global.
