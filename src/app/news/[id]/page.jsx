import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import NewsDetailPage from '../../../features/news/NewsDetailPage';
import { newsService } from '../../../services/public/newsService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await newsService.getNewsById(id);
  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan | IRIS Official Website',
    };
  }
  return {
    title: `${article.title} | Berita IRIS`,
    description: article.summary || article.content?.substring(0, 150) || 'Detail berita resmi dari fanbase IRIS.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <NewsDetailPage />
    </MainLayout>
  );
}
