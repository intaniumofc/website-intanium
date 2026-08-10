import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AboutIntanPage from '../../features/about-intan/AboutIntanPage';
import { aboutIntanService } from '../../services/public/aboutIntanService';
import { scheduleService } from '../../services/public/scheduleService';

export const revalidate = 60; // ISR cache revalidation every 60 seconds


export const metadata = {
  title: 'Tentang Nur Intan | IRIS Official Website',
  description: 'Profil lengkap, biodata resmi, fakta unik, dan jejak karir Nur Intan di JKT48.',
};

export default async function Page() {
  let initialBio = null;
  let initialSchedule = [];
  try {
    const [bio, sched] = await Promise.all([
      aboutIntanService.getBio(),
      scheduleService.getEvents('all'),
    ]);
    initialBio = bio || null;
    initialSchedule = sched || [];
  } catch (err) {
    console.error('Error fetching about data:', err);
  }

  return (
    <MainLayout>
      <AboutIntanPage initialBio={initialBio} initialSchedule={initialSchedule} />
    </MainLayout>
  );
}
