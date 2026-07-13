import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import MenangkapKecoaPage from '../../../features/games/menangkap-kecoa/MenangkapKecoaPage';

export const metadata = {
  title: 'Game Menangkap Kecoa | IRIS Official Website',
  description: 'Bantu Nur Intan menangkap kecoa yang berkeliaran! Kumpulkan skor tertinggi, raih combo, dan masuki papan peringkat (leaderboard) global fanbase.',
};

export default function Page() {
  return (
    <MainLayout>
      <MenangkapKecoaPage />
    </MainLayout>
  );
}
