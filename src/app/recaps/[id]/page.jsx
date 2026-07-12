import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import RecapDetailPage from '../../../features/recaps/RecapDetailPage';
import { recapService } from '../../../services/public/recapService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const recap = await recapService.getRecapById(id);
  if (!recap) {
    return {
      title: 'Recap Tidak Ditemukan | Intanium Official Website',
    };
  }
  return {
    title: `${recap.title} | Zine & Recap Intanium`,
    description: recap.summary || 'Detail E-Magazine digital dan recap aktivitas Nur Intan JKT48.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <RecapDetailPage />
    </MainLayout>
  );
}
