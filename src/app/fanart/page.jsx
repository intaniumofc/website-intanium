import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import FanartPage from '../../features/fanart/FanartPage';

export const metadata = {
  title: 'Karya Seni Fanart | IRIS Official Website',
  description: 'Galeri karya seni dan fanart kontribusi dari para fans bertalenta untuk mendukung Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <FanartPage />
    </MainLayout>
  );
}
