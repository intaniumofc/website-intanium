import '../index.css';
import SmoothScroll from '../components/common/SmoothScroll';
import TabTitleTyper from '../components/common/TabTitleTyper';
import { Plus_Jakarta_Sans, Inter, Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body>
        <div id="root">
          <SmoothScroll />
          <TabTitleTyper />
          {children}
        </div>
      </body>
    </html>
  );
}
