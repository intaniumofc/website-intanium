import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import IntanShiningStarPage from '../../features/intan-shining-star/IntanShiningStarPage';

export const metadata = {
  title: 'Intan Shining Star | IRIS Official Website',
  description: 'Timeline sejarah pencapaian, jejak pertunjukan, milestone penting, dan perjalanan karir Nur Intan di JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <IntanShiningStarPage />
    </MainLayout>
  );
}
