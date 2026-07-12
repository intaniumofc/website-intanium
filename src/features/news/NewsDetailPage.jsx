'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { newsService } from '../../services/public/newsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../lib/formatDate';
import { ROUTES } from '../../lib/constants';
import bannerIntanium from '../../assets/logos/banner-nium.webp';
import intanOne from '../../assets/images/intan-01.webp';
import intanTwo from '../../assets/images/intan-02.webp';
import intanThree from '../../assets/images/intan-03.webp';
import intanFour from '../../assets/images/intan-04.webp';

const CATEGORY_IMAGES = {
  Announcement: bannerIntanium,
  Schedule: intanOne,
  Event: intanTwo,
  Merch: bannerIntanium,
  Project: intanThree,
  Media: intanFour,
  Stream: intanFour,
  Important: bannerIntanium,
};

function getNewsImage(news) {
  const isGenericImage = !news.imageUrl || news.imageUrl.includes('images.unsplash.com');
  return isGenericImage ? CATEGORY_IMAGES[news.category] || bannerIntanium : news.imageUrl;
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    newsService.getNewsById(id)
      .then((data) => {
        if (!isActive) return;
        setNews(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isActive) return;
        console.error(err);
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) return <Loading message="Membuka artikel berita..." />;

  if (!news) {
    return (
      <Card className="text-center py-12 border border-[var(--border-color)]">
        <span className="text-4xl mb-2">🔎</span>
        <h3 className="text-lg font-bold mb-2">Artikel Tidak Ditemukan</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Kami tidak dapat menemukan berita dengan kode pengenal ini.</p>
        <Link href={ROUTES.NEWS}>
          <Button variant="outline" size="sm">Kembali ke Berita</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
      <div>
        <Link href={ROUTES.NEWS} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
          ← Kembali ke Semua Berita
        </Link>
      </div>

      <Card hoverEffect={false} className="overflow-hidden border border-indigo-100 bg-[#fffdfd] shadow-lg" padding="none">
        {/* Banner image */}
        <div className="aspect-[21/9] w-full bg-black/20 overflow-hidden border-b border-[var(--border-color)]">
          <img
            src={(getNewsImage(news))?.src || (getNewsImage(news))}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Details */}
        <div className="space-y-6 bg-gradient-to-b from-[#fffdfd] to-[#fff7fb] p-6 sm:p-10">
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded border border-purple-300 bg-purple-100 px-2.5 py-1 font-bold uppercase tracking-wider text-purple-800">
              {news.category}
            </span>
            <span className="font-semibold text-slate-500">
              Dipublikasi: {formatDate(news.date)}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-[#170C79] sm:text-3xl">
            {news.title}
          </h1>

          <div className="whitespace-pre-wrap border-t border-indigo-100 pt-5 text-sm font-medium leading-7 text-slate-700 sm:text-base sm:leading-8">
            {news.content}
          </div>
        </div>
      </Card>
    </div>
  );
}
