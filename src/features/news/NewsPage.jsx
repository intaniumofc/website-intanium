import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsService } from './newsService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatDate } from '../../lib/formatDate';

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    newsService.getNews()
      .then((data) => {
        setNewsList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Berita & Pengumuman"
        subtitle="Dapatkan informasi update paling valid seputar event kolaborasi, perilisan merchandise, perubahan jadwal, dan pengumuman resmi dari Intan."
      />

      {isLoading ? (
        <Loading message="Mengambil data berita terbaru..." />
      ) : (
        <div className="space-y-6">
          {newsList.map((news) => (
            <Card
              key={news.id}
              hoverEffect={true}
              className="border border-[var(--border-color)] flex flex-col md:flex-row gap-6 overflow-hidden transition-all duration-300"
              padding="none"
            >
              {/* News Image Header banner */}
              <div className="w-full md:w-64 aspect-[16/10] md:aspect-[4/3] rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden bg-black/20 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* News summaries */}
              <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase tracking-wider">
                      {news.category}
                    </span>
                    <span className="text-[var(--text-muted)] font-semibold">
                      {formatDate(news.date)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                    {news.title}
                  </h3>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {news.summary}
                  </p>
                </div>

                <div className="pt-2">
                  <Link to={`/news/${news.id}`}>
                    <Button variant="secondary" size="sm">
                      Baca Selengkapnya →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
