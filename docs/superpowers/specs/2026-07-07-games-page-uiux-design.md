# Spesifikasi Desain: Peningkatan UI/UX Arena Games (Bento Grid & Parallaks 3D)

Dokumen ini mendefinisikan perubahan desain visual dan pengalaman pengguna (UI/UX) pada halaman utama Arena Games (`/games`) di website Intanium untuk menyajikan pengalaman interaktif yang imersif sekelas penghargaan **Awwwards**.

---

## 1. Konsep & Arah Kreatif

Peningkatan ini berpusat pada tiga pilar utama:
1.  **Ambient Theme Morphing**: Latar belakang halaman merespons kursor secara emosional dengan mengubah rona gradasi cahaya mengikuti tema permainan yang sedang disorot.
2.  **3D Tilt Parallax & Glare Reflex**: Kartu game merespons gerakan fisik kursor dengan kemiringan 3D dan kilauan cahaya dinamis (pantulan kaca).
3.  **Bento Grid Layout**: Mengatur semua elemen (game utama, game kedua, papan peringkat, statistik) ke dalam grid modular asimetris yang futuristik.

---

## 2. Struktur Bento Grid (Layout Baru)

Kontainer utama menggunakan CSS Grid dengan 3 kolom pada layar lebar (Desktop):

*   **Baris 1**:
    *   **Modul Kiri (Kolom 1 & 2 - lebar 2/3)**: Kartu Game Unggulan (**Menangkap Kecoa**). Ukuran besar untuk menarik fokus utama.
    *   **Modul Kanan (Kolom 3 - lebar 1/3)**: Kartu Game **Gosok Intan**. Menampilkan kilauan berlian dan rute `/games/gosok-intan`.
*   **Baris 2**:
    *   **Modul Kiri (Kolom 1 & 2 - lebar 2/3)**: **Klasemen Mingguan** (Leaderboard) e-sport terintegrasi.
    *   **Modul Kanan (Kolom 3 - lebar 1/3)**: Statistik Ringkasan Komunitas (Total Pemain, Game Dimainkan, Rata-rata Skor).

---

## 3. Detail Implementasi & Animasi

### A. Ambient Glow Morphing
Di dalam state `GamesPage`, kita menambahkan:
```javascript
const [activeTheme, setActiveTheme] = useState('default'); // 'default' | 'amber' | 'cyan'
```
Setiap kartu game ditambahkan event hover:
*   Game Kecoa: `onMouseEnter={() => setActiveTheme('amber')}`
*   Game Gosok Intan: `onMouseEnter={() => setActiveTheme('cyan')}`
*   Ketika kursor keluar dari grid: `onMouseLeave={() => setActiveTheme('default')}`

Dua div orbs besar di latar belakang menggunakan transisi properti `background-color` dan `opacity` yang didelegasikan ke GPU dengan durasi `duration-1000 ease-in-out` untuk menghasilkan pergeseran warna yang lembut seperti bernapas.

### B. Komponen Pembungkus 3D Tilt & Glare Card
Kita akan mengemas pembungkus efek 3D Tilt ini sebagai state interaktif lokal pada kartu game:
1.  **State Kemiringan & Pantulan**:
    ```javascript
    const [tiltStyle, setTiltStyle] = useState({});
    const [glareStyle, setGlareStyle] = useState({});
    ```
2.  **Kalkulasi Event Mouse**:
    ```javascript
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateY = ((x - xc) / xc) * 8; // Rotasi sumbu Y maks 8 derajat
      const rotateX = ((yc - y) / yc) * 8; // Rotasi sumbu X maks 8 derajat
      
      const glareXPercentage = (x / rect.width) * 100;
      const glareYPercentage = (y / rect.height) * 100;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
        transition: 'transform 0.1s ease-out',
      });

      setGlareStyle({
        background: `radial-gradient(circle at ${glareXPercentage}% ${glareYPercentage}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
      });
    };

    const handleMouseLeave = () => {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      });
      setGlareStyle({
        background: 'transparent',
      });
      setActiveTheme('default');
    };
    ```

---

## 4. Rencana Pengujian & Validasi

### A. Uji Coba Transisi Latar Belakang
*   Pastikan perpindahan warna orb latar belakang saat hover di kartu kecoa (menjadi amber) dan kartu gosok intan (menjadi cyan) terjadi secara halus tanpa jeda tersendat (*jank-free*).

### B. Uji Coba 3D Parallax & Glare
*   Uji pada browser Chrome, Firefox, dan Safari untuk memastikan kemiringan 3D dan pantulan cahaya glar radial ter-render dengan benar.
*   Pastikan transisi kembali ke semula (*reset*) saat kursor keluar dari kartu terasa mulus dan responsif.
