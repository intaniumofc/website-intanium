import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import EsportPage from '../../features/esport/EsportPage';

export const metadata = {
  title: 'Intanium Esport | Intanium Official Website',
  description: 'Divisi olahraga elektronik resmi komunitas Intanium. Ikuti info turnamen, mabar komunitas, dan tim esport pendukung Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <EsportPage />
    </MainLayout>
  );
}
