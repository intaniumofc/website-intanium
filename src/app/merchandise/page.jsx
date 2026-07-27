import React, { Suspense } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import MerchandisePage from '../../features/merchandise/MerchandisePage';

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': 'Official Fanbase Merchandise Nur Intan JKT48',
  'image': 'https://website-IRIS.vercel.app/cover.jpeg',
  'description': 'Koleksi merchandise eksklusif resmi fanbase Nur Intan JKT48 (IRIS).',
  'brand': {
    '@type': 'Brand',
    'name': 'IRIS Fanbase'
  },
  'offers': {
    '@type': 'Offer',
    'url': 'https://website-IRIS.vercel.app/merchandise',
    'priceCurrency': 'IDR',
    'availability': 'https://schema.org/InStock'
  }
};

export const metadata = {
  title: 'Toko Merchandise Resmi | IRIS Official Website',
  description: 'Dukung Nur Intan JKT48 dengan memesan merchandise eksklusif resmi fanbase IRIS. Kaos, gantungan kunci, photocard, dan lainnya.',
  alternates: {
    canonical: '/merchandise',
  },
  openGraph: {
    title: 'Toko Merchandise Resmi | IRIS Official Website',
    description: 'Dukung Nur Intan JKT48 dengan memesan merchandise eksklusif resmi fanbase IRIS. Kaos, gantungan kunci, photocard, dan lainnya.',
    url: '/merchandise',
    images: [{ url: '/cover.jpeg', width: 1200, height: 630, alt: 'Merchandise Resmi IRIS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toko Merchandise Resmi | IRIS Official Website',
    description: 'Dukung Nur Intan JKT48 dengan memesan merchandise eksklusif resmi fanbase IRIS. Kaos, gantungan kunci, photocard, dan lainnya.',
    images: ['/cover.jpeg'],
  },
};

export default function Page() {
  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading merchandise...</div>}>
        <MerchandisePage />
      </Suspense>
    </MainLayout>
  );
}
