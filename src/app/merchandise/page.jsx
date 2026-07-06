import React, { Suspense } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import MerchandisePage from '../../features/merchandise/MerchandisePage';

export const metadata = {
  title: 'Toko Merchandise Resmi | Intanium Official Website',
  description: 'Dukung Nur Intan JKT48 dengan memesan merchandise eksklusif resmi fanbase Intanium. Kaos, gantungan kunci, photocard, dan lainnya.',
};

export default function Page() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading merchandise...</div>}>
        <MerchandisePage />
      </Suspense>
    </MainLayout>
  );
}
