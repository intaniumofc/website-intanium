import '../index.css';
import Script from 'next/script';
import SmoothScroll from '../components/common/SmoothScroll';
import TabTitleTyper from '../components/common/TabTitleTyper';
import IrisChatWidget from '../components/iris/IrisChatWidget';
import { Plus_Jakarta_Sans, Inter, Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  variable: '--font-playfair',
  display: 'swap',
  adjustFontFallback: false,
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cormorant',
  display: 'swap',
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'swap',
  adjustFontFallback: false,
});

const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-IRIS.vercel.app';

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${defaultSiteUrl}/#organization`,
      'name': 'IRIS Official Fanbase Nur Intan JKT48',
      'url': defaultSiteUrl,
      'logo': `${defaultSiteUrl}/logo-nobg.webp`,
      'image': `${defaultSiteUrl}/cover.jpeg`,
      'description': 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS).',
      'sameAs': [
        'https://x.com/IRIS_IntanJKT48',
        'https://instagram.com/iris.intanjkt48'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${defaultSiteUrl}/#website`,
      'url': defaultSiteUrl,
      'name': 'IRIS Official Website',
      'publisher': {
        '@id': `${defaultSiteUrl}/#organization`
      },
      'inLanguage': 'id-ID'
    }
  ]
};

export const metadata = {
  metadataBase: new URL(defaultSiteUrl),
  title: {
    default: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    template: '%s | IRIS Official Website',
  },
  description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal pertunjukan theater, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
  keywords: ['Nur Intan JKT48', 'Intan JKT48', 'IRIS Fanbase', 'JKT48', 'Merchandise JKT48', 'Jadwal Show JKT48', 'Mini Games IRIS'],
  authors: [{ name: 'IRIS Tech Team' }],
  creator: 'IRIS Fanbase',
  publisher: 'IRIS Official',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal pertunjukan, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
    url: defaultSiteUrl,
    siteName: 'IRIS Official Website',
    images: [
      {
        url: '/cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'IRIS Official Website Fanbase Nur Intan JKT48',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri, dan mini-games.',
    images: ['/cover.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/webp" href="/logo-nobg.webp" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="preload" href="/hero-intan-vidio.webm" as="video" type="video/webm" />
        <link rel="preload" as="image" href="/_next/static/media/intan-01.webp" type="image/webp" />
      </head>
      <body>
        {/* Skip-to-content link for screen readers & keyboard navigation (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Lewati ke konten utama
        </a>
        <div id="main-content">
          <SmoothScroll />
          <TabTitleTyper />
          {children}
          <IrisChatWidget />
        </div>
        <Script
          id="json-ld-organization"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </body>
    </html>
  );
}
