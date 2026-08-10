import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../features/home/HomePage';
import { newsService } from '../services/public/newsService';
import { merchandiseService } from '../services/public/merchandiseService';
import { aboutIntanService } from '../services/public/aboutIntanService';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export const metadata = {
  title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
  description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
    url: '/',
    images: [
      {
        url: '/cover.jpeg',
        width: 1200,
        height: 630,
        alt: 'IRIS Official Website',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRIS Official Website | Fanbase Nur Intan JKT48',
    description: 'Website resmi komunitas fanbase Nur Intan JKT48 (IRIS). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri foto, dan mini-games.',
    images: ['/cover.jpeg'],
  },
};

export default async function Home() {
  let featuredNews = [];
  let featuredProducts = [];
  let bioData = null;

  try {
    const [news, products, bio] = await Promise.all([
      newsService.getNews(),
      merchandiseService.getProducts('All'),
      aboutIntanService.getBio(),
    ]);
    
    featuredNews = news || [];
    featuredProducts = products || [];
    bioData = bio || null;
  } catch (err) {
    console.error('Error fetching home data:', err);
  }

  return (
    <MainLayout isHome>
      <HomePage 
        initialFeaturedNews={featuredNews.slice(0, 4)} 
        initialFeaturedProducts={featuredProducts} 
        initialBio={bioData} 
      />
    </MainLayout>
  );
}
