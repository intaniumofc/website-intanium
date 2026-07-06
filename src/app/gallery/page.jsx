import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import GalleryPage from '../../features/gallery/GalleryPage';

export const metadata = {
  title: 'Galeri Foto Memori | Intanium Official Website',
  description: 'Kumpulan foto dokumentasi, screenshot stream, kegiatan bersama, dan kenangan indah Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <GalleryPage />
    </MainLayout>
  );
}
