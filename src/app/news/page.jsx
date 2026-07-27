import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import NewsPage from '../../features/news/NewsPage';

export const metadata = {
  title: 'Berita & Pengumuman Terbaru | IRIS Official Website',
  description: 'Dapatkan berita terkini, pengumuman proyek fanbase, rilis acara komunitas, dan artikel seputar Nur Intan JKT48.',
  alternates: {
    canonical: '/news',
  },
  openGraph: {
    title: 'Berita & Pengumuman Terbaru | IRIS Official Website',
    description: 'Dapatkan berita terkini, pengumuman proyek fanbase, rilis acara komunitas, dan artikel seputar Nur Intan JKT48.',
    url: '/news',
    images: [{ url: '/cover.jpeg', width: 1200, height: 630, alt: 'Berita IRIS Official' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berita & Pengumuman Terbaru | IRIS Official Website',
    description: 'Dapatkan berita terkini, pengumuman proyek fanbase, rilis acara komunitas, dan artikel seputar Nur Intan JKT48.',
    images: ['/cover.jpeg'],
  },
};

export default function Page() {
  return (
    <MainLayout>
      <NewsPage />
    </MainLayout>
  );
}
