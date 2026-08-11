import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import GosokIntanPage from '../../../features/games/gosok-intan/GosokIntanPage';

export async function generateMetadata({ searchParams }) {
  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const user = params?.user;
  const score = params?.score;
  
  // Use Vercel's public URL if available, fallback to localhost for dev
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  if (user && score) {
    const ogImageUrl = `${baseUrl}/api/og/game-score?user=${encodeURIComponent(user)}&score=${score}&game=gosok-intan`;
    
    return {
      title: `${user} meraih ${score} Pts di Gosok Intan!`,
      description: `Bisa kalahkan rekor ${user}? Mainkan game Gosok Intan sekarang dan temukan diamond keberuntunganmu!`,
      openGraph: {
        title: `${user} meraih ${score} Pts!`,
        description: 'Mainkan mini game Gosok Intan IRIS sekarang!',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Skor Gosok Intan - ${user}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${user} meraih ${score} Pts di Gosok Intan!`,
        description: 'Mainkan mini game Gosok Intan IRIS sekarang!',
        images: [ogImageUrl],
      },
    };
  }

  return {
    title: 'Game Gosok Intan | IRIS Official Community',
    description: 'Temukan diamond keberuntunganmu dengan menggosok titik hitam. Hindari bom dan raih skor tertinggi!',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <GosokIntanPage />
    </MainLayout>
  );
}
