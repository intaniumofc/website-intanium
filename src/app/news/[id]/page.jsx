import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import NewsDetailPage from '../../../features/news/NewsDetailPage';
import { newsService } from '../../../features/news/newsService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await newsService.getNewsById(id);
  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan | Intanium Official Website',
    };
  }
  return {
    title: `${article.title} | Berita Intanium`,
    description: article.summary || article.content?.substring(0, 150) || 'Detail berita resmi dari fanbase Intanium.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <NewsDetailPage />
    </MainLayout>
  );
}
