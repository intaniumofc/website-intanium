import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import MadingPage from '../../features/mading/MadingPage';

export const metadata = {
  title: 'Papan Mading Digital | IRIS Official Website',
  description: 'Tempelkan pesan dukungan hangat, ucapan selamat, dan ucapan penuh cinta Anda untuk Nur Intan JKT48 di mading digital IRIS.',
};

export default function Page() {
  return (
    <MainLayout>
      <MadingPage />
    </MainLayout>
  );
}
