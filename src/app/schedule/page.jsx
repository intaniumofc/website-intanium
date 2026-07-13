import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SchedulePage from '../../features/schedule/SchedulePage';

export const metadata = {
  title: 'Jadwal Acara & Kegiatan | IRIS Official Website',
  description: 'Kalender jadwal lengkap theater, video call, birthday event, streaming IDN, dan agenda kegiatan Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <SchedulePage />
    </MainLayout>
  );
}
