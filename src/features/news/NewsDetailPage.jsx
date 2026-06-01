import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService } from './newsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../lib/formatDate';
import { ROUTES } from '../../lib/constants';

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    newsService.getNewsById(id)
      .then((data) => {
        setNews(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <Loading message="Membuka artikel berita..." />;

  if (!news) {
    return (
      <Card className="text-center py-12 border border-[var(--border-color)]">
        <span className="text-4xl mb-2">🔎</span>
        <h3 className="text-lg font-bold mb-2">Artikel Tidak Ditemukan</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Kami tidak dapat menemukan berita dengan kode pengenal ini.</p>
        <Link to={ROUTES.NEWS}>
          <Button variant="outline" size="sm">Kembali ke Berita</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
      <div>
        <Link to={ROUTES.NEWS} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
          ← Kembali ke Semua Berita
        </Link>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]" padding="none">
        {/* Banner image */}
        <div className="aspect-[21/9] w-full bg-black/20 overflow-hidden border-b border-[var(--border-color)]">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase tracking-wider">
              {news.category}
            </span>
            <span className="text-[var(--text-muted)] font-semibold">
              Dipublikasi: {formatDate(news.date)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
            {news.title}
          </h1>

          <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
            {news.content}
          </div>
        </div>
      </Card>
    </div>
  );
}
