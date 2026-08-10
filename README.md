# IRIS - Official Website Nur Intan JKT48

<div align="center">
  <img src="public/cover.jpeg" alt="IRIS Official Website" width="100%" />
</div>

<br />

Website resmi untuk fanbase **Nur Intan JKT48 (Generasi 13)** yang dinamakan **IRIS**. Proyek ini merupakan aplikasi web modern berskala produksi yang dirancang dengan estetika premium, animasi *cinematic*, dan performa tinggi untuk mewadahi seluruh dukungan, dokumentasi, dan aktivitas Wota (penggemar).

---

## Fitur Utama

- **Desain Premium & Glassmorphism**: UI/UX memukau yang dibangun dari nol dengan **Tailwind CSS**, menampilkan desain bernuansa pink/biru khas Intan, transisi halus, dan _micro-animations_ yang membuat website terasa "hidup".
- **Peta Jejak Penampilan (Performance Map)**: Peta interaktif yang mencatat seluruh lokasi pertunjukan teater (*On-Air*) maupun konser luar kota (*Off-Air*) Nur Intan di seluruh Indonesia.
- **Cinematic Journey Timeline**: Linimasa (*milestone*) berbasis scroll menggunakan **GSAP ScrollTrigger** yang membawa pengguna seolah masuk ke dalam lorong waktu perjalanan karir Intan dari audisi hingga saat ini.
- **Sistem Jadwal Pintar (Schedule)**: Kalender kegiatan (Theater, Video Call, Birthday, Event) yang selalu *up-to-date*. Memiliki fitur **Sinkronisasi Otomatis** menarik jadwal resmi secara langsung dari *JKT48.com*.
- **Photobooth Virtual & Mading Fanart**: Fitur komunitas untuk berfoto virtual dengan berbagai *frame* cantik, serta ruang karya (mading) tempat penggemar bisa mengunggah dan menampilkan *fanart*.
- **Mini-Games**: Halaman interaktif (seperti *Catch the Roach*) yang dilengkapi papan skor (*leaderboard*) global secara _real-time_.
- **Admin Dashboard Terintegrasi**: Panel kontrol super aman (didukung Supabase Auth & Middleware) bagi pengelola *fanbase* untuk mengatur konten website tanpa harus menyentuh kode (CRUD Berita, Jadwal, Penampilan, Moderasi Fanart, dll).

---

## Tech Stack & Arsitektur

Website ini mengandalkan teknologi _cutting-edge_ web modern:

* **Framework & UI**: [Next.js (App Router)](https://nextjs.org/), [React 18](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
* **Animasi**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lenis Smooth Scroll](https://lenis.darkroom.engineering/)
* **Database & Autentikasi**: [Supabase](https://supabase.com/) (PostgreSQL + GoTrue Auth)
* **Media / Object Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (Penyimpanan aset super cepat untuk memuat ribuan foto beresolusi tinggi tanpa batasan _bandwidth_ berlebih)
* **Hosting / Deployment**: Dioptimalkan untuk Vercel dengan strategi _Incremental Static Regeneration (ISR)_ untuk menyeimbangkan performa tinggi dan data yang segar.

---

## Struktur Direktori Proyek

```bash
website-intanium/
├── public/                # Aset statis (SEO images, base fonts, icons, Lottie JSON)
├── src/
│   ├── admin/             # Core Admin Panel (Dashboard, Manajemen Jadwal, Maps, dll)
│   ├── app/               # Next.js App Router (Halaman Publik & API Routes)
│   ├── assets/            # Aset gambar internal (logo, background statis)
│   ├── components/        # Komponen UI Reusable (Navbar, Footer, Card, Layout)
│   ├── features/          # Kode spesifik untuk fitur tertentu (Journey, Schedule)
│   ├── hooks/             # Custom React Hooks untuk _state_ dan animasi
│   ├── lib/               # Konfigurasi Supabase, Helper Date, proxy URL
│   ├── services/          # Fungsi abstraksi untuk berinteraksi dengan API & Database
│   ├── styles/            # Tailwind Global CSS, Keyframes, dan CSS Variables
│   └── middleware.js      # Middleware proteksi halaman Admin (Server-side Auth)
├── next.config.mjs        # Aturan domain gambar R2, optimasi, & security headers
└── tailwind.config.js     # Konfigurasi utility classes
```

---

## Dokumentasi & Alur Sistem

Berikut adalah ringkasan cara kerja fitur-fitur krusial di dalam *website* ini:

### 1. Sinkronisasi Jadwal Otomatis
Website ini memiliki integrasi langsung ke sistem jadwal JKT48. 
- Di dalam Panel Admin, pengelola cukup menekan tombol **"Sync JKT48.com"**.
- API internal (`/api/admin/schedule/sync`) akan menarik data dari web resmi, mendeteksi jadwal yang melibatkan "Nur Intan", dan memasukkannya ke _database_ dengan status **Draft**.
- Admin hanya perlu meninjau jadwal tersebut lalu melakukan **Publish**.

### 2. Animasi Peta Perjalanan (GSAP Cinematic Timeline)
Halaman Milestone menggunakan `gsap` dan `ScrollTrigger` untuk menciptakan efek _cinematic camera_. 
- Alih-alih memindahkan karakter, kamera (peta latar) akan bergeser dinamis berlawanan arah saat pengguna melakukan *scroll* (menggunakan teknik *Pinned Container*).
- Setiap *node* (titik peristiwa) dihitung secara matematis di atas kurva Bezier (`getTotalLength()`) sehingga posisi karakter presisi di ukuran layar (HP maupun Desktop) apapun.

### 3. Arsitektur Upload Aset (Cloudflare R2)
Website dirancang agar *server* utama Next.js tidak terbebani oleh lalu lintas _file_ gambar yang berat:
- Proses *upload* (Fanart, Banner, Thumbnail) akan meminta izin berupa *Presigned URL* ke API Next.js terlebih dahulu.
- Setelah izin didapat, *browser* klien akan mengunggah _file_ **langsung ke bucket Cloudflare R2**. 
- Arsitektur ini menjamin keamanan aset, mencegah _bottleneck_ pada *server*, dan memastikan _loading_ gambar sangat cepat secara global.

### 4. Moderasi Karya Penggemar (Mading)
Penggemar setia (IRIS) dapat mengirimkan karya apresiasi visual (*Fanart*) mereka secara bebas.
- Karya yang dikirim akan tersimpan dengan status *Pending* secara *default*.
- Admin dapat menyetujui (*Approve*) atau menolak (*Reject*) karya tersebut langsung dari **Dashboard Admin**. Hanya karya yang disetujui yang akan tampil di Galeri Mading publik secara otomatis berkat sistem revalidasi pintar.

---

## Panduan Instalasi Lokal (Local Development)

Ingin ikut berkontribusi atau menjalankan *project* ini di komputermu sendiri? Ikuti langkah berikut:

### 1. Kloning Repositori & Instalasi
Pastikan kamu menggunakan **Node.js 18+**.
```bash
git clone https://github.com/intaniumofc/website-intanium.git
cd website-intanium
npm install
```

### 2. Siapkan Environment Variables (`.env.local`)
Buat file `.env.local` di _root directory_ dan isi dengan kredensial layanan:
```env
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Cloudflare R2 (Image Storage)
R2_ACCESS_KEY_ID=[YOUR_R2_ACCESS_KEY]
R2_SECRET_ACCESS_KEY=[YOUR_R2_SECRET_KEY]
NEXT_PUBLIC_R2_ENDPOINT=https://[ACCOUNT-ID].r2.cloudflarestorage.com
NEXT_PUBLIC_R2_BUCKET_NAME=[BUCKET_NAME]
NEXT_PUBLIC_R2_PUBLIC_URL=https://[CUSTOM_DOMAIN_R2]

# Internal API Secret (Opsional untuk Cron Jobs/Sync)
API_SECRET_KEY=[ANY-SECURE-STRING]
```

### 3. Jalankan Server Dev
```bash
npm run dev
```
Aplikasi akan menyala! Buka `http://localhost:3000` di browsermu.

### 4. Build untuk Produksi
```bash
npm run build
npm start
```

---

## Mengakses Panel Admin Lokal
Secara *default*, rute `/admin` dilindungi. Untuk masuk ke _dashboard_ lokal:
1. Pastikan kamu sudah membuat *user* di Supabase Authentication.
2. Berikan role atau *policy* yang tepat jika diperlukan.
3. Login di rute `http://localhost:3000/admin/login`.

---

<div align="center">
  <p><i>Terus Bersinar Terang Bersama Bintang Utama Kita, Nur Intan! ✨</i></p>
  <p><b>Hak Cipta © 2026 IRIS Official Fanbase</b></p>
</div>
