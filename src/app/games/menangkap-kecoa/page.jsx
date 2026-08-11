import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import MenangkapKecoaPage from '../../../features/games/menangkap-kecoa/MenangkapKecoaPage';

export async function generateMetadata({ searchParams }) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const user = params?.user;
  const score = params?.score;
  
  // Use Vercel's public URL if available, fallback to localhost for dev
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  if (user && score) {
    const ogImageUrl = `${baseUrl}/api/og/game-score?user=${encodeURIComponent(user)}&score=${score}&game=menangkap-kecoa`;
    
    return {
      title: `${user} meraih ${score} Pts di Menangkap Kecoa!`,
      description: `Bisa kalahkan rekor ${user}? Mainkan game Menangkap Kecoa sekarang!`,
      openGraph: {
        title: `${user} meraih ${score} Pts!`,
        description: 'Mainkan mini game Menangkap Kecoa IRIS sekarang!',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Skor Menangkap Kecoa - ${user}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${user} meraih ${score} Pts di Menangkap Kecoa!`,
        description: 'Mainkan mini game Menangkap Kecoa IRIS sekarang!',
        images: [ogImageUrl],
      },
    };
  }

  return {
    title: 'Game Menangkap Kecoa | IRIS Official Website',
    description: 'Bantu Nur Intan menangkap kecoa yang berkeliaran! Kumpulkan skor tertinggi, raih combo, dan masuki papan peringkat (leaderboard) global fanbase.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <MenangkapKecoaPage />
    </MainLayout>
  );
}
