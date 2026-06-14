# Spesifikasi Desain: Perombakan Visual Halaman Admin Intanium

Dokumen spesifikasi ini menjelaskan rencana detail perombakan tata letak dan visual seluruh area Administrator (`src/admin`) pada proyek **Website Intanium** untuk menyamakan gayanya dengan model minimalis **referensi-admin** (`intanium-web`) dengan aksen warna putih dan biru primary (`#170C79`).

---

## 🎯 Sasaran Desain

1. **Penyelarasan Tata Letak**: Mengubah layout halaman admin dari model lama (sidebar pekat melayang yang kompleks) menjadi layout grid 2-kolom bersih dengan latar belakang terang (`bg-[#F4F5FC]`) dan sidebar putih bersih (`bg-white border-r`).
2. **Permainan Warna Putih & Biru Primary**: Mengintegrasikan warna biru primary (`#170C79`) sebagai warna aksen aktif untuk tautan navigasi, tombol utama, ring fokus input, dan batas aktif komponen, dipadukan dengan permukaan kartu putih bersih (`bg-white`).
3. **Kepatuhan Aksesibilitas & Performa**: Menyelesaikan seluruh temuan audit web interface guidelines:
   - Menambahkan ring fokus visual (`focus-visible:ring-*`) pada elemen interaktif.
   - Menambahkan `aria-label` pada seluruh tombol aksi ikon.
   - Memastikan seluruh input form memiliki atribut `name`, `autocomplete`, dan `spellCheck={false}` (pada email/URL).
   - Menghindari transisi berat `transition-all` dan menggantinya dengan transisi spesifik.
   - Menambahkan dimensi `width` dan `height` pada elemen `<img>` untuk mencegah CLS (Cumulative Layout Shift).
   - Mengubah seluruh literal tiga titik `...` menjadi elipsis tunggal `…`.

---

## 🛠️ Token Desain Visual Baru (Tema Admin)

Kami akan mendefinisikan/menggunakan variabel berikut di dalam kelas styling Tailwind:

* **Background Global**: `bg-[#F4F5FC]`
* **Background Kartu & Sidebar**: `bg-white`
* **Warna Aksen Primary (Biru)**: `#170C79` (Tailwind: `[#170C79]`)
* **Warna Tautan Aktif**: Teks `text-[#170C79]`, background `bg-[#170C79]/8`, border kiri `border-l-4 border-[#170C79]`.
* **Warna Tautan Tidak Aktif**: `text-slate-500 hover:bg-slate-50 hover:text-slate-800`
* **Border Kartu**: `border border-slate-200/80`
* **Border Input Fokus**: `focus-visible:border-[#170C79] focus-visible:ring-2 focus-visible:ring-[#170C79]/15`
* **Radius Sudut**: `rounded-2xl` (untuk kartu/sidebar), `rounded-xl` (untuk input/tombol)

---

## 📐 Tata Letak Struktur (ASCII Wireframe)

### Layout Desktop:
```
+-----------------------------------------------------------------------------------+
|  [Logo] Intanium Admin           |  [Dashboard Administrator]       [Web Publik]  |
+----------------------------------+------------------------------------------------+
|  o Dashboard                     |                                                |
|  o Merchandise                   |  +------------------------------------------+  |
|    - Daftar Produk               |  | Kartu Statistik / Ringkasan Data         |  |
|    - Kategori Produk             |  | [ schedules: 12 ] [ messages: 45 ]       |  |
|    - Kelola Order                |  +------------------------------------------+  |
|  o Profil Intan                  |                                                |
|  o Recap & Zine                  |  +------------------------------------------+  |
|  o Berita & News                 |  | Kartu Form Tambah / Daftar Tabel Utama   |  |
|  o Denger Intan                  |  |                                          |  |
|  o Galeri Album                  |  | Nama Field: [ Input Box ]                |  |
|  o Moderasi Mading               |  |                                          |  |
|  o Kelola Tagar                  |  | [ Simpan Data ]                          |  |
|  o Kelola Game                   |  |                                          |  |
|                                  |  +------------------------------------------+  |
|  [SA] Super Admin       [Logout] |                                                |
+----------------------------------+------------------------------------------------+
```

---

## 📂 Komponen yang Akan Dimodifikasi

Semua modifikasi akan diimplementasikan pada file-file berikut tanpa mengubah logika fungsionalitas Supabase:

1. **`src/admin/AdminLayout.jsx`**:
   - Ubah layout menjadi grid 2-kolom statis desktop dengan latar belakang `bg-[#F4F5FC]`.
   - Ubah sidebar menjadi kartu putih bersih dengan aksen biru primary pada status tautan aktif.
   - Bersihkan dari `transition-all` yang tidak perlu dan perbaiki dimensi gambar logo.
2. **`src/admin/DashboardPage.jsx`**:
   - Ubah visual kartu bento lama yang berwarna biru gradasi gelap menjadi kartu putih dengan border abu-abu bersih, menggunakan aksen teks dan ikon biru primary.
3. **`src/admin/LoginPage.jsx`**:
   - Restrukturisasi form login agar menggunakan ring fokus biru, penambahan name & autocomplete standar, serta perbaikan dimensi gambar karakter interaktif.
4. **Halaman Manajemen Admin Lainnya** (merchandise, categories, orders, recaps, schedule, news, gallery, mading, playlists, hashtags, games, dll.):
   - Ubah seluruh form dan tabel menjadi card putih bersih.
   - Terapkan focus ring biru, elipsis tunggal `…`, `aria-label` pada tombol ikon, serta name & autocomplete pada input field.

---

## 🔍 Evaluasi Mandiri (Spec Self-Review)

1. **Pemindaian Placeholder**: Tidak ada placeholder "TBD" atau "TODO". Semua detail komponen dan token warna telah ditentukan secara definitif.
2. **Konsistensi Internal**: Arsitektur layout grid 2-kolom di desktop selaras dengan pola tata letak `referensi-admin`.
3. **Pemeriksaan Cakupan**: Skala perubahan ini difokuskan hanya pada modifikasi visual (HTML & CSS className) dan atribut aksesibilitas pada halaman-halaman `src/admin/*`. Logika fetch database Supabase, state handler, dan router guard tetap dipertahankan utuh.

---

## 🧪 Rencana Verifikasi

### Verifikasi Otomatis
- Menjalankan script `npm run dev` untuk memastikan aplikasi berjalan tanpa error kompilasi.
- Menjalankan kembali script `audit.js` setelah perbaikan selesai untuk memastikan jumlah pelanggaran menurun drastis mendekati 0.

### Verifikasi Manual
- Memeriksa tampilan visual sidebar dan kartu-kartu baru di browser.
- Memastikan navigasi keyboard (menekan tombol `Tab`) menampilkan outline/ring fokus biru yang jelas pada input dan tombol.
- Memeriksa keandalan input di handphone (apakah autocomplete berfungsi dan spellcheck dinonaktifkan pada email).
