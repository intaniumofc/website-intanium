import '../index.css';
import SmoothScroll from '../components/common/SmoothScroll';

export const metadata = {
  title: 'IRIS Official Website',
  description: 'Website resmi Fanbase Nur Intan JKT48 (IRIS). Temukan jadwal pertunjukan, merchandise eksklusif, berita terbaru, galeri foto, dan mini-game interaktif.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/webp" href="/logo-nobg.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">
          <SmoothScroll />
          {children}
        </div>
      </body>
    </html>
  );
}
