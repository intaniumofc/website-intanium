import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import PerformanceMapSection from '../../components/performance-map/PerformanceMapSection';
import { getPerformanceLocations } from '../../lib/performance-locations';

export const metadata = {
  title: 'Peta Jejak Penampilan Nur Intan JKT48 | IRIS Official Website',
  description: 'Peta interaktif lokasi pertunjukan theater dan event offair Nur Intan JKT48 di seluruh wilayah Indonesia.',
  alternates: {
    canonical: '/peta-penampilan',
  },
  openGraph: {
    title: 'Peta Jejak Penampilan Nur Intan JKT48 | IRIS Official Website',
    description: 'Peta interaktif lokasi pertunjukan theater dan event offair Nur Intan JKT48 di seluruh wilayah Indonesia.',
    url: '/peta-penampilan',
    images: [{ url: '/cover.jpeg', width: 1200, height: 630, alt: 'Peta Penampilan Nur Intan JKT48' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peta Jejak Penampilan Nur Intan JKT48 | IRIS Official Website',
    description: 'Peta interaktif lokasi pertunjukan theater dan event offair Nur Intan JKT48 di seluruh wilayah Indonesia.',
    images: ['/cover.jpeg'],
  },
};

const mapSchema = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  'name': 'Peta Penampilan Nur Intan JKT48',
  'description': 'Peta interaktif pertunjukan theater (On-Air) dan event panggung luar kota (Off-Air) Nur Intan JKT48.',
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'ID',
  },
  'organizer': {
    '@type': 'Organization',
    'name': 'IRIS Official Fanbase',
  },
};

export default async function Page() {
  const locations = await getPerformanceLocations();

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mapSchema) }}
      />
      <PerformanceMapSection initialLocations={locations} />
    </MainLayout>
  );
}
