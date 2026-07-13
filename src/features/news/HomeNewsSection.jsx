'use client';

import { useState } from 'react';
import Link from 'next/link';

import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import { BookmarkIcon, X, ArrowRight, Newspaper } from 'lucide-react';
import { ROUTES } from '../../lib/constants';
import Card from '../../components/common/Card';
import bannerIris from '../../assets/logos/banner-nium.webp';
import intanOne from '../../assets/images/intan-01.webp';
import intanTwo from '../../assets/images/intan-02.webp';
import intanThree from '../../assets/images/intan-03.webp';
import intanFour from '../../assets/images/intan-04.webp';

// Mapping categories to premium gradient glow color schemes
const CATEGORY_THEMES = {
  'Announcement': {
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    gradientColors: ['from-indigo-500/20', 'to-violet-500/20']
  },
  'Schedule': {
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    gradientColors: ['from-sky-500/20', 'to-cyan-500/20']
  },
  'Merch': {
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
    gradientColors: ['from-pink-500/20', 'to-purple-500/20']
  },
  'Event': {
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-300',
    gradientColors: ['from-violet-500/20', 'to-purple-500/20']
  },
  'Stream': {
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    gradientColors: ['from-emerald-500/20', 'to-teal-500/20']
  },
  'Project': {
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    gradientColors: ['from-amber-500/20', 'to-orange-500/20']
  },
  'Media': {
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    gradientColors: ['from-emerald-500/20', 'to-teal-500/20']
  },
  'Important': {
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    gradientColors: ['from-red-500/20', 'to-rose-500/20']
  },
  'Default': {
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    gradientColors: ['from-blue-500/20', 'to-cyan-500/20']
  }
};

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

function getArticleImage(article) {
  const isGenericImage = !article.imageUrl || article.imageUrl.includes('images.unsplash.com');
  return isGenericImage ? CATEGORY_IMAGES[article.category] || bannerIris : article.imageUrl;
}

function formatDateSafely(dateStr) {
  if (!dateStr) return '1 Jan 2024';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

export default function HomeNewsSection({ articles = [] }) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(() => new Set());
  const shouldReduceMotion = useSafeReducedMotion();
  const shouldAnimate = !shouldReduceMotion;

  const toggleBookmark = (articleId, e) => {
    e.stopPropagation();
    setBookmarkedArticles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  // Convert service raw article to premium layout article structure
  const formattedArticles = articles.map(art => {
    const theme = CATEGORY_THEMES[art.category] || CATEGORY_THEMES['Default'];
    return {
      ...art,
      image: getArticleImage(art),
      published: formatDateSafely(art.date),
      timeAgo: art.date ? 'Baru Rilis' : 'Baru saja',
      author: 'Official Admin',
      location: 'Online',
      contentParagraphs: art.content ? art.content.split('\n\n') : [art.summary || ''],
      badgeClass: theme.badgeClass,
      gradientColors: theme.gradientColors
    };
  });

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
      },
    },
  };

  return (
    <section className="space-y-6">
      {/* Header section identical to layout */}
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
        <h2 className="text-xl font-extrabold text-[#170C79] flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[var(--color-primary)]" /> Berita & Update Terbaru
        </h2>
        <Link 
          href={ROUTES.NEWS} 
          className="text-xs text-[var(--color-primary-hover)] hover:underline font-bold flex items-center gap-1 transition-all"
        >
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <LayoutGroup>
        <motion.div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={shouldAnimate ? cardContainerVariants : {}}
        >
          {formattedArticles.map((article) => {


            return (
              <motion.article
                key={article.id}
                layoutId={`article-${article.id}`}
                variants={shouldAnimate ? cardVariants : {}}
                whileHover={
                  shouldAnimate
                    ? {
                        y: -5,
                        transition: { type: "spring", stiffness: 450, damping: 25 },
                      }
                    : {}
                }
                onClick={() => openArticle(article)}
                className="cursor-pointer h-full select-none animate-fade-in"
              >
                <Card 
                  hoverEffect={true} 
                  padding="none" 
                  className="grid grid-rows-[auto_1fr] border border-[var(--border-color)] overflow-hidden h-full shadow-sm bg-white hover:shadow-md transition-all duration-300 rounded-xl"
                >
                  {/* Card Image Banner */}
                  <motion.div
                    layoutId={`article-image-${article.id}`}
                    className="aspect-[4/3] w-full relative overflow-hidden bg-black/5"
                  >
                    <img
                      src={(article.image)?.src || (article.image)}
                      alt={article.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Dark gradient overlap */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                    
                    {/* Hover Glow Gradient */}
                    {article.gradientColors && (
                      <div
                        className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${article.gradientColors[0]} ${article.gradientColors[1]} to-transparent opacity-40 z-10`}
                      />
                    )}

                    {/* Bookmark Overlay Trigger */}
                    <motion.div
                      className="absolute top-2.5 right-2.5 z-20"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleBookmark(article.id, e)}
                    >
                      <div className="flex items-center justify-center w-7.5 h-7.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white">
                        <BookmarkIcon
                          className={`w-4 h-4 transition-all duration-300 ${
                            bookmarkedArticles.has(article.id)
                              ? "text-yellow-400 fill-yellow-400 scale-105"
                              : "text-white/80 hover:text-white"
                          }`}
                        />
                      </div>
                    </motion.div>

                    {/* Meta info tags on card image */}
                    <motion.div
                      className="absolute bottom-2.5 left-3 text-white z-20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className={`inline-block px-1.5 py-0.5 text-[8px] uppercase font-extrabold tracking-wider border rounded-md ${article.badgeClass}`}>
                        {article.category}
                      </span>
                      <div className="text-[9px] text-white/70 mt-1">
                        {article.published}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Card Main Info */}
                  <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                    <div className="space-y-1.5">
                      <motion.h3
                        layoutId={`article-title-${article.id}`}
                        className="text-sm font-extrabold text-[#170C79] leading-tight hover:text-[var(--color-primary)] transition-colors line-clamp-2 h-9"
                      >
                        {article.title}
                      </motion.h3>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="flex items-center text-[10px] font-bold text-[var(--color-primary-hover)] hover:underline gap-1.5 pt-2 border-t border-[var(--border-color)]/60">
                      Baca Selengkapnya
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Card>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Liquid Fluid Detail Modal overlay */}
        <AnimatePresence>
          {selectedArticle && (
            <>
              {/* Blur backdrop overlay */}
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeArticle}
              />

              {/* Centered paper layout */}
              <motion.div
                layoutId={`article-${selectedArticle.id}`}
                className="fixed top-24 bottom-4 inset-x-4 z-[1000] flex flex-col overflow-hidden rounded-2xl border border-[#170C79]/15 bg-[#fffdfd] shadow-2xl md:inset-auto md:top-[53%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:h-[75vh]"
              >
                {/* Float close button */}
                <motion.button
                  className="absolute top-4 right-4 w-9 h-9 bg-black/50 hover:bg-black/75 text-white border border-white/10 rounded-full flex items-center justify-center z-50 cursor-pointer shadow-md"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeArticle}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </motion.button>

                <div
                  className="custom-scrollbar flex h-full flex-col overflow-y-auto overscroll-contain"
                  data-lenis-prevent
                >
                  {/* Hero banner inside modal */}
                  <motion.div
                    layoutId={`article-image-${selectedArticle.id}`}
                    className="relative h-56 md:h-72 lg:h-80 w-full flex-shrink-0 bg-black/10"
                  >
                    <img
                      src={(selectedArticle.image)?.src || (selectedArticle.image)}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Shadow gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                    
                    {selectedArticle.gradientColors && (
                      <div
                        className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${selectedArticle.gradientColors[0]} ${selectedArticle.gradientColors[1]} to-transparent opacity-50 z-10`}
                      />
                    )}

                    <div className="absolute bottom-5 left-6 text-white z-20 space-y-1.5">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border rounded-md ${selectedArticle.badgeClass}`}>
                        {selectedArticle.category}
                      </span>
                      <div className="text-[11px] sm:text-xs text-white/70">
                        Dipublikasikan pada {selectedArticle.published} • {selectedArticle.location}
                      </div>
                    </div>
                  </motion.div>

                  {/* Body Paragraph Content */}
                  <div className="flex-grow bg-gradient-to-b from-[#fffdfd] to-[#fff7fb] px-6 py-7 md:px-10 md:py-9">
                    <div className="mx-auto max-w-4xl space-y-6">
                      <motion.h1
                        layoutId={`article-title-${selectedArticle.id}`}
                        className="text-xl font-black leading-tight text-[#170C79] md:text-3xl"
                      >
                        {selectedArticle.title}
                      </motion.h1>

                      <motion.div
                        className="max-w-none space-y-4 border-t border-indigo-100 pt-5 text-sm leading-7 text-slate-700 md:text-base md:leading-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {selectedArticle.contentParagraphs.map((paragraph, index) => (
                          <p key={index}>
                            {paragraph}
                          </p>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
}
