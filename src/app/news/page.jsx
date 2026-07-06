import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import NewsPage from '../../features/news/NewsPage';

export const metadata = {
  title: 'Berita & Pengumuman Terbaru | Intanium Official Website',
  description: 'Dapatkan berita terkini, pengumuman proyek fanbase, rilis acara komunitas, dan artikel seputar Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <NewsPage />
    </MainLayout>
  );
}
