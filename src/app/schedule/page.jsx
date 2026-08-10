import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SchedulePage from '../../features/schedule/SchedulePage';
import { scheduleService } from '../../services/public/scheduleService';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  'name': 'Pertunjukan Theater & Event Nur Intan JKT48',
  'description': 'Jadwal show theater, live streaming IDN/Showroom, dan agenda event Nur Intan JKT48.',
  'startDate': new Date().toISOString(),
  'eventAttendanceMode': 'https://schema.org/MixedEventAttendanceMode',
  'eventStatus': 'https://schema.org/EventScheduled',
  'location': {
    '@type': 'Place',
    'name': 'JKT48 Theater / Online Streaming',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Jakarta',
      'addressCountry': 'ID'
    }
  },
  'organizer': {
    '@type': 'Organization',
    'name': 'IRIS Official Fanbase'
  }
};

export const metadata = {
  title: 'Jadwal Acara & Kegiatan | IRIS Official Website',
  description: 'Kalender jadwal lengkap theater, video call, birthday event, streaming IDN, dan agenda kegiatan Nur Intan JKT48.',
  alternates: {
    canonical: '/schedule',
  },
  openGraph: {
    title: 'Jadwal Acara & Kegiatan | IRIS Official Website',
    description: 'Kalender jadwal lengkap theater, video call, birthday event, streaming IDN, dan agenda kegiatan Nur Intan JKT48.',
    url: '/schedule',
    images: [{ url: '/cover.jpeg', width: 1200, height: 630, alt: 'Jadwal Nur Intan JKT48' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jadwal Acara & Kegiatan | IRIS Official Website',
    description: 'Kalender jadwal lengkap theater, video call, birthday event, streaming IDN, dan agenda kegiatan Nur Intan JKT48.',
    images: ['/cover.jpeg'],
  },
};

export default async function Page() {
  let initialEvents = [];
  try {
    initialEvents = await scheduleService.getEvents('all') || [];
  } catch (err) {
    console.error('Error fetching schedules:', err);
  }

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <SchedulePage initialEvents={initialEvents} />
    </MainLayout>
  );
}
