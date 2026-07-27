import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../features/home/HomePage';

export const metadata = {
  title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
  description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
    url: '/',
    images: [
      {
        url: '/cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'IRIS Official Website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
    images: ['/cover.jpeg'],
  },
};

export default function Home() {
  return (
    <MainLayout isHome>
      <HomePage />
    </MainLayout>
  );
}
