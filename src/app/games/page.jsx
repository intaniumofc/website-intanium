import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import GamesPage from '../../features/games/GamesPage';

export const metadata = {
  title: 'Game Corner | Intanium Official Website',
  description: 'Pusat mini-game interaktif komunitas Intanium. Mainkan game seru bertema Nur Intan JKT48.',
};

export default function Page() {
  return (
    <MainLayout>
      <GamesPage />
    </MainLayout>
  );
}
