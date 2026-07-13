import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import RecapListPage from '../../features/recaps/RecapListPage';

export const metadata = {
  title: 'Zine & Recap Bulanan | IRIS Official Website',
  description: 'Arsip e-magazine digital dan recap bulanan aktivitas, pertunjukan, serta kegiatan Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <RecapListPage />
    </MainLayout>
  );
}
