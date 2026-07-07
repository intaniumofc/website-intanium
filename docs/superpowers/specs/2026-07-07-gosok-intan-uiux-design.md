# Spesifikasi Desain: Pembaruan UI/UX Gosok Intan (Cyber-Arcade Terminal & Foil Logam)

Dokumen ini menjelaskan rancangan peningkatan desain visual, detail mikrogosok, dan alur pengalaman pengguna (UX flow) pada halaman mini-game Gosok Intan (`/games/gosok-intan`) agar terasa lebih modern, interaktif, dan bernyawa sekelas situs pemenang **Awwwards**.

---

## 1. Alur Masuk Cepat (Instant Profile Flow)

Alur masuk permainan saat ini disederhanakan untuk meminimalkan input berulang yang tidak efisien:
*   **Deteksi Username Otomatis**: Halaman lobby langsung memeriksa `localStorage` untuk mengambil nama pengguna.
*   **Greeting State**: Jika nama ditemukan, halaman menyapa pengguna secara personal: `"WELCOME BACK, PLAYER [username]"` di dalam visual panel kaca melayang (*glassmorphic console card*) dengan tombol bertuliskan **`[ INITIALIZE PLAY ]`**.
*   **Edit Profile Mode**: Tombol pensil/edit diletakkan di sisi nama pengguna untuk memungkinkan mereka mengganti nama tanpa harus menampilkan form penuh.
*   **Visual Status Tiket**: Kuota tiket (sisa bermain dari 5 kesempatan harian) disajikan sebagai indikator bar bersinar (*status neon indicator*).

---

## 2. Peningkatan Visual & Game Feel (Satisfaction & Juice)

### A. Kertas Gosok Logam Silver (Silver Metallic Foil)
Warna bulatan abu-abu penutup pada Canvas diganti dengan gradien radial yang memantulkan kilau perak logam asli:
*   **Gradasi Penutup Canvas**:
    *   Center: `#ffffff` (kilatan cahaya koin)
    *   Mid: `#d1d5db` & `#9ca3af` (refleksi bayangan logam)
    *   Outer border: `#4b5563` (tepi koin perak)
*   **Teks Penggosok Kontras**: Font overlay pada koin menggunakan warna biru indigo gelap (`#1e1b4b`) agar terbaca tajam dan kontras.

### B. Animasi Kejutan Reaksi (Micro-FX)
*   **Efek Layar Guncang (Bomb Shake)**: Menggosok bom memicu kelas `.shake-screen` pada elemen grid kontainer untuk memberikan getaran fisik yang memuaskan.
*   **Penyatuan Layar Hasil (No Modal Popups)**: Pop-up modal dialihkan ke transisi layar langsung di dalam kontainer utama. Saat permainan berakhir (`lost` / `won`), modul grid melebur keluar (*fade-out*), digantikan secara instan oleh kartu rangkuman skor e-sport modern.

---

## 3. Rencana Pengujian & Validasi

*   **Verifikasi Flow**: Uji masuk game dengan profil yang sudah tersimpan di browser, pastikan masuk lobby game secara langsung tanpa form isian nama.
*   **Verifikasi Metalik Canvas**: Pastikan koin gosok metalik ter-render dengan gradasi berkilau, dan teks di atas koin terbaca kontras.
