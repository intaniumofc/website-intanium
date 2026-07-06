import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../features/home/HomePage';

export const metadata = {
  title: 'Intanium Official Website | Fanbase Nur Intan JKT48',
  description: 'Website resmi komunitas fanbase Nur Intan JKT48 (INTANIUM). Temukan jadwal show, merchandise eksklusif, berita terbaru, galeri, dan mini-games.',
};

export default function Home() {
  return (
    <MainLayout isHome>
      <HomePage />
    </MainLayout>
  );
}
