'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Calendar, User } from 'lucide-react';
import { newsService } from '../../services/public/newsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../lib/formatDate';
import { ROUTES } from '../../lib/constants';
import bannerIris from '../../assets/logos/banner-nium.webp';
import logoNobg from '../../assets/logos/logo-nobg.webp';
import intanOne from '../../assets/images/intan-01.webp';
import intanTwo from '../../assets/images/intan-02.webp';
import intanThree from '../../assets/images/intan-03.webp';
import intanFour from '../../assets/images/intan-04.webp';

const CATEGORY_IMAGES = {
  Announcement: bannerIris,
  Schedule: intanOne,
  Event: intanTwo,
  Merch: bannerIris,
  Project: intanThree,
  Media: intanFour,
  Stream: intanFour,
  Important: bannerIris,
};

function getNewsImage(news) {
  const isGenericImage = !news.imageUrl || news.imageUrl.includes('images.unsplash.com');
  return isGenericImage ? CATEGORY_IMAGES[news.category] || bannerIris : news.imageUrl;
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
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div>
        <Link
          href={ROUTES.NEWS}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[var(--color-heading)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-pink-tint-12)] hover:border-[var(--color-pink-tint-25)] hover:text-[var(--color-pink)] transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[var(--color-pink)]" />
          <span>Kembali ke Semua Berita</span>
        </Link>
      </div>

      <Card hoverEffect={false} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl" padding="none">
        {/* Banner image */}
        <div className="relative w-full min-h-[250px] max-h-[480px] sm:max-h-[540px] overflow-hidden bg-slate-950 flex items-center justify-center border-b border-[var(--color-border)]">
          {/* Ambient Blurred Background */}
          <img
            src={(getNewsImage(news))?.src || (getNewsImage(news))}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
          />
          
          {/* Main Full Image (Uncropped) */}
          <img
            src={(getNewsImage(news))?.src || (getNewsImage(news))}
            alt={news.title}
            className="relative z-10 w-full h-auto max-h-[480px] sm:max-h-[540px] object-contain mx-auto"
          />
        </div>

        {/* Content Details */}
        <div className="space-y-6 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-pink-tint-8)] p-6 sm:p-10 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="rounded-md border border-purple-300 bg-purple-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-800 shadow-sm">
                {news.category || 'Announcement'}
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text-secondary)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-pink)]" />
                <span>Dipublikasikan: {formatDate(news.date)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold text-[var(--color-heading)]">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-pink-tint-25)] bg-white p-0.5 shadow-sm">
                <img src={(logoNobg)?.src || (logoNobg)} alt="IRIS" className="size-4.5 object-contain" />
              </div>
              <span className="text-xs font-bold text-[var(--color-heading)]">IRIS Official Admin</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-[var(--color-heading)] tracking-tight break-all [word-break:break-all] [overflow-wrap:anywhere]">
            {news.title}
          </h1>

          <div className="max-w-none space-y-4 text-sm font-medium leading-relaxed text-[var(--color-body)] sm:text-base sm:leading-8 break-all [word-break:break-all] [overflow-wrap:anywhere] whitespace-pre-line min-w-0">
            {news.content}
          </div>
        </div>
      </Card>
    </div>
  );
}
