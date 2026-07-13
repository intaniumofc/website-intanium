import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import EsportPage from '../../features/esport/EsportPage';

export const metadata = {
  title: 'IRIS Esport | IRIS Official Website',
  description: 'Divisi olahraga elektronik resmi komunitas IRIS. Ikuti info turnamen, mabar komunitas, dan tim esport pendukung Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <EsportPage />
    </MainLayout>
  );
}
