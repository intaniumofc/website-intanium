import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import GosokIntanPage from '../../../features/games/gosok-intan/GosokIntanPage';

export const metadata = {
  title: 'Game Gosok Intan | Intanium Official Community',
  description: 'Temukan diamond keberuntunganmu dengan menggosok titik hitam. Hindari bom dan raih skor tertinggi!',
};

export default function Page() {
  return (
    <MainLayout>
      <GosokIntanPage />
    </MainLayout>
  );
}
