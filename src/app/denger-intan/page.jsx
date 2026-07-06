import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import DengerIntanPage from '../../features/denger-intan/DengerIntanPage';

export const metadata = {
  title: '#dengerINTAN | Intanium Official Website',
  description: 'Arsip audio rekaman stream, podcast, serta playlist lagu cover orisinal dari Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <DengerIntanPage />
    </MainLayout>
  );
}
