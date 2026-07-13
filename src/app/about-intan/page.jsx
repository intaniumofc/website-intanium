import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AboutIntanPage from '../../features/about-intan/AboutIntanPage';

export const metadata = {
  title: 'Tentang Nur Intan | IRIS Official Website',
  description: 'Profil lengkap, biodata resmi, fakta unik, dan jejak karir Nur Intan di JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <AboutIntanPage />
    </MainLayout>
  );
}
