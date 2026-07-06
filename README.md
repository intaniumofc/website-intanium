# INTANIUM - Official Website 🌟

Website resmi komunitas fanbase **Nur Intan JKT48 (INTANIUM)**. Dibuat menggunakan **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Supabase SSR**, dan **Cloudflare R2 Storage**.

---

## 🛠️ Tech Stack & Fitur Utama

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack Compiler)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan dukungan CSS variables premium untuk light/dark glassmorphism theme.
- **Database & Auth**: [Supabase](https://supabase.com/) (SSR integration untuk autentikasi admin, penyimpanan sesi lewat `proxy.js` middleware).
- **Media Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (Penyimpanan aset terdistribusi berbiaya rendah dengan otorisasi upload menggunakan API presigned URL).
- **Animasi & Interaktivitas**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lenis Smooth Scroll](https://lenis.darkroom.engineering/), dan [Lottie Web](https://airbnb.design/lottie/).
- **Mini-Game**: Mini-game interaktif "Menangkap Kecoa" dengan papan skor waktu nyata (leaderboard).

---

## 📂 Struktur Proyek

```bash
website-intanium/
├── public/                # Aset statis (gambar, logo, JSON Lottie, robots.txt)
├── src/
│   ├── app/               # Next.js App Router (Wrapper Halaman & Server Components)
│   ├── admin/             # Implementasi Halaman Dashboard & Portal Admin
│   ├── assets/            # Aset gambar lokal untuk di-import di komponen
│   ├── components/        # Komponen UI/UX global, layout (Navbar, Footer), dan elemen UI
│   ├── features/          # Modul fitur (Home, About, Merchandise, Games, dsb.)
│   ├── hooks/             # Custom React Hooks (Debounce, Media Upload, dsb.)
│   ├── lib/               # Konstanta global, helper, dan inisialisasi Supabase
│   ├── styles/            # File CSS, pengaturan Tailwind v4 theme, dan font custom
│   ├── utils/             # Utilitas server/client Supabase
│   └── proxy.js           # Next.js 16 Middleware untuk otentikasi admin
├── next.config.mjs        # Konfigurasi Next.js (optimasi gambar, remote patterns)
├── tsconfig.json          # Konfigurasi TypeScript / Path Alias (@/*)
└── tailwind.config.js     # Tailwind configurations (bila diperlukan)
```

---

## ⚙️ Pengembangan Lokal (Local Development)

### 1. Prasyarat (Prerequisites)
Pastikan Node.js telah terinstal (versi 18.x atau yang lebih baru direkomendasikan).

### 2. Duplikasi Berkas Environment
Salin berkas `.env` dan lengkapi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
NEXT_PUBLIC_R2_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-public-url.dev
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

### 5. Kompilasi & Build Produksi
```bash
npm run build
npm run start
```
