import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AboutIrisPage from '../../features/about-iris/AboutIrisPage';

export const metadata = {
  title: 'Tentang IRIS | IRIS Official Website',
  description: 'Asal usul, filosofi logo, struktur organisasi, dan sejarah komunitas fanbase official Nur Intan JKT48 (IRIS).',
};

export default function Page() {
  return (
    <MainLayout fullWidth>
      <AboutIrisPage />
    </MainLayout>
  );
}
