import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AboutIntaniumPage from '../../features/about-intanium/AboutIntaniumPage';

export const metadata = {
  title: 'Tentang Intanium | Intanium Official Website',
  description: 'Asal usul, filosofi logo, struktur organisasi, dan sejarah komunitas fanbase official Nur Intan JKT48 (INTANIUM).',
};

export default function Page() {
  return (
    <MainLayout fullWidth>
      <AboutIntaniumPage />
    </MainLayout>
  );
}
