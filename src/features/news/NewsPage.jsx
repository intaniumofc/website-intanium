import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Newspaper,
} from 'lucide-react';
import { newsService } from './newsService';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../lib/formatDate';
import { getOptimizedImageUrl } from '../../lib/helpers';
import bannerIntanium from '../../assets/logos/banner-nium.webp';
import intanOne from '../../assets/images/intan-01.webp';
import intanTwo from '../../assets/images/intan-02.webp';
import intanThree from '../../assets/images/intan-03.webp';
import intanFour from '../../assets/images/intan-04.webp';
import logoNobg from '../../assets/logos/logo-nobg.webp';

const CATEGORIES = ['Semua', 'Pengumuman', 'Schedule', 'Event', 'Merch', 'Project', 'Media', 'Important'];

const CATEGORY_STYLES = {
  Pengumuman: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Schedule: 'border-sky-200 bg-sky-50 text-sky-700',
  Event: 'border-violet-200 bg-violet-50 text-violet-700',
  Merch: 'border-pink-200 bg-pink-50 text-pink-700',
  Project: 'border-amber-200 bg-amber-50 text-amber-700',
  Media: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Important: 'border-red-200 bg-red-50 text-red-700',
};

const CATEGORY_ALIASES = {
  Announcement: 'Pengumuman',
  Release: 'Pengumuman',
  Stream: 'Media',
  Community: 'Project',
};

const CATEGORY_IMAGES = {
  Pengumuman: bannerIntanium,
  Schedule: intanOne,
  Event: intanTwo,
  Merch: bannerIntanium,
  Project: intanThree,
  Media: intanFour,
  Important: bannerIntanium,
};

function getNewsImage(item, category) {
  const image = item.imageUrl || item.image_url;
  const isGenericImage = !image || image.includes('images.unsplash.com');
  return isGenericImage ? CATEGORY_IMAGES[category] || bannerIntanium : image;
}

function normalizeNews(item) {
  const category = CATEGORY_ALIASES[item.category] || item.category || 'Pengumuman';

  return {
    ...item,
    category,
    image: getNewsImage(item, category),
    excerpt: item.summary || item.content || 'Baca kabar terbaru dari INTANIUM.',
    isPinned: Boolean(item.isPinned ?? item.is_pinned),
    isImportant: Boolean(item.isImportant ?? item.is_important) || category === 'Important',
    isFeatured: Boolean(item.isFeatured ?? item.is_featured),
    ctaLabel: item.ctaLabel || item.cta_label || 'Baca Detail',
  };
}

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${CATEGORY_STYLES[category] || CATEGORY_STYLES.Pengumuman}`}>
      {category}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">{eyebrow}</p>
      <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#170C79] sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-[28px] border border-dashed border-violet-200 bg-white/70 p-8 text-center shadow-sm">
      <Newspaper className="mx-auto size-8 text-violet-300" />
      <h3 className="mt-4 text-xl font-black text-[#170C79]">Belum ada update untuk kategori ini.</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Pilih kategori lain atau kembali ke Semua untuk melihat kabar terbaru INTANIUM.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 cursor-pointer rounded-full bg-[#170C79] px-5 py-2.5 text-xs font-black text-white transition hover:bg-[#291da9]"
      >
        Lihat Semua Berita
      </button>
    </div>
  );
}

function GlassNewsCard({ item, index = 0, featured = false }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`h-full w-full ${featured ? 'max-w-[420px]' : ''}`}
    >
      <Link
        to={`/news/${item.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/55 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-900/10"
      >
        <div className="relative aspect-video overflow-hidden bg-violet-50">
          <motion.img
            src={getOptimizedImageUrl(item.image, { width: 500 })}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#170C79]/75 via-[#170C79]/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-45" />

          <div className="absolute bottom-3 left-3">
            <div className="flex flex-wrap items-stretch overflow-hidden rounded-md border border-white/20 bg-white/90 shadow-lg backdrop-blur-md">
              {featured && (
                <span className="inline-flex items-center bg-[#170C79] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                  Pilihan Redaksi
                </span>
              )}
              <span className={`inline-flex items-center border-l border-[#170C79]/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Pengumuman}`}>
                {item.category}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full bg-[#170C79] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-950/25">
              <BookOpen className="size-4" />
              Baca Artikel
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-[#170C79] transition-colors group-hover:text-violet-700">
              {item.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-6 text-slate-600">{item.excerpt}</p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-violet-100 pt-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-[#170C79]">
                <img src={logoNobg} alt="" className="size-5 object-contain" />
              </div>
              <div className="min-w-0 text-[10px]">
                <p className="truncate font-black text-[#170C79]">INTANIUM Official</p>
                <p className="truncate font-bold text-slate-400">{formatDate(item.date)}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock className="size-3" />
              <span>Official Update</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    newsService.getNews()
      .then((data) => {
        setNewsList(data.map(normalizeNews));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  const filteredNews = useMemo(
    () => activeCategory === 'Semua'
      ? newsList
      : newsList.filter((item) => item.category === activeCategory),
    [activeCategory, newsList],
  );

  const featuredNews = useMemo(
    () => filteredNews.find((item) => item.isFeatured || item.isPinned) || filteredNews[0],
    [filteredNews],
  );

  const remainingNews = useMemo(
    () => filteredNews.filter((item) => item.id !== featuredNews?.id),
    [featuredNews, filteredNews],
  );

  const latestUpdates = remainingNews.slice(0, 4);
  const archiveNews = remainingNews.slice(4);
  const importantNews = newsList.find((item) => item.isImportant);
  const visibleCategories = CATEGORIES.filter((category) => (
    category === 'Semua' || newsList.some((item) => item.category === category)
  ));

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <section className="border-b border-violet-200/70 pb-5">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-500">INTANIUM Newsroom</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#170C79] sm:text-4xl">Berita & Pengumuman</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Pusat update resmi INTANIUM untuk kabar terbaru seputar Nur Intan, mulai dari jadwal, event, project,
              merchandise, hingga pengumuman penting.
            </p>
          </div>
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Filter kategori berita"
        className="hide-scrollbar flex gap-2 overflow-x-auto pb-1"
      >
        {visibleCategories.map((category) => {
          const count = category === 'Semua'
            ? newsList.length
            : newsList.filter((item) => item.category === category).length;

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-black transition ${activeCategory === category
                ? 'border-[#170C79] bg-[#170C79] text-white shadow-md'
                : 'border-violet-100 bg-white/80 text-[#170C79] hover:bg-violet-50'
                }`}
            >
              {category}
              {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Loading message="Membuka INTANIUM Newsroom..." />
      ) : filteredNews.length === 0 ? (
        <EmptyState onReset={() => setActiveCategory('Semua')} />
      ) : (
        <>
          {featuredNews && (
            <section className="space-y-3">
              <GlassNewsCard item={featuredNews} featured />
            </section>
          )}

          {latestUpdates.length > 0 && (
            <section className="space-y-5">
              <SectionHeading
                eyebrow="Latest Updates"
                title="Update Terbaru"
                description="Kabar terbaru yang dapat dipindai dengan cepat sebelum membaca detail lengkapnya."
              />
              <div className="divide-y divide-violet-100 border-y border-violet-200/70 bg-white/35">
                {latestUpdates.map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="group grid gap-3 px-1 py-4 transition hover:bg-violet-50/60 md:grid-cols-[145px_1fr_auto] md:items-center md:px-3"
                  >
                    <div>
                      <CategoryBadge category={item.category} />
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <CalendarDays className="size-3.5" /> {formatDate(item.date)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-black leading-snug text-[#170C79] transition group-hover:text-violet-700 sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 sm:text-sm">{item.excerpt}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-black text-[#170C79]">
                      {item.ctaLabel} <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {importantNews && activeCategory === 'Semua' && (
            <section className="flex flex-col gap-4 border-y border-rose-200 bg-gradient-to-r from-rose-50/80 to-violet-50/80 px-2 py-4 sm:flex-row sm:items-center">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">Important Update</p>
                <h3 className="mt-1 font-black text-[#170C79]">{importantNews.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{importantNews.excerpt}</p>
              </div>
              <Link to={`/news/${importantNews.id}`} className="flex items-center gap-1 text-xs font-black text-[#170C79]">
                Baca Detail <ArrowRight className="size-3.5" />
              </Link>
            </section>
          )}

          {archiveNews.length > 0 && (
            <section className="space-y-5">
              <SectionHeading eyebrow="Archive" title="Arsip Berita" />
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {archiveNews.map((item, index) => (
                  <GlassNewsCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}
