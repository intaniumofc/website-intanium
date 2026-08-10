'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { FaThreads } from 'react-icons/fa6';
import Button from '../../components/common/Button';
import { newsService } from '../../services/public/newsService';
import { merchandiseService } from '../../services/public/merchandiseService';
import { ROUTES } from '../../lib/constants';
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  User,
  ChevronRight
} from 'lucide-react';
import { ImageSwiper } from '../../components/ui/ImageSwiper';
import { aboutIntanService } from '../../services/public/aboutIntanService';
import { SocialTooltip } from '../../components/ui/social-media';
import HomeHeroSection from './HomeHeroSection';
import KenalanIntanCarousel from './KenalanIntanCarousel';
import { LoadingProvider } from '../../components/loading/LoadingContext';
import Preloader from '../../components/loading/Preloader';
import { usePreloader } from '../../hooks/usePreloader';
import dynamic from 'next/dynamic';

const HomeNewsSection = dynamic(() => import('../news/HomeNewsSection'));
const HomeMerchandiseSection = dynamic(() => import('../merchandise/HomeMerchandiseSection'));
const HomeGallerySection = dynamic(() => import('../gallery/HomeGallerySection'));
const HomeHashtagsSection = dynamic(() => import('../hashtags/HomeHashtagsSection'));
const MadingPreviewSection = dynamic(() => import('../mading/MadingPreviewSection'));
import intan1 from '../../assets/images/intan-01.webp';
import intan2 from '../../assets/images/intan-02.webp';
import intan3 from '../../assets/images/intan-03.webp';
import intan4 from '../../assets/images/intan-04.webp';

const scrollRevealVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function HomePage() {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bio, setBio] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // Set correct initial value after mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const socialLinks = React.useMemo(() => [
    {
      href: "https://x.com/N_IntanJKT48",
      ariaLabel: "Twitter / X",
      tooltip: "Twitter / X",
      color: "var(--color-heading)",
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      href: "https://www.instagram.com/intan.jkt48",
      ariaLabel: "Instagram",
      tooltip: "Instagram",
      color: "#E1306C",
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      href: "https://www.threads.net/@intan.jkt48",
      ariaLabel: "Threads",
      tooltip: "Threads",
      color: "var(--color-heading)",
      icon: (
        <FaThreads className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      )
    },
    {
      href: "https://www.tiktok.com/@jkt48.intan",
      ariaLabel: "TikTok",
      tooltip: "TikTok",
      color: "var(--color-heading)",
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      )
    },
    {
      href: "https://www.idn.app/jkt48_intan",
      ariaLabel: "IDN Live",
      tooltip: "IDN Live",
      color: "#E1251B",
      icon: (
        <span className="font-bold text-[10px] sm:text-xs tracking-wider select-none">IDN</span>
      )
    },
    {
      href: "https://www.showroom-live.com/r/JKT48_Intan",
      ariaLabel: "Showroom",
      tooltip: "Showroom",
      color: "var(--color-heading)",
      icon: (
        <div className="flex flex-col items-center leading-none text-[7px] sm:text-[8px] font-black tracking-tight select-none">
          <span>SHOW</span>
          <span>ROOM</span>
        </div>
      )
    }
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data parallelly from existing services
        const [news, products, bioData] = await Promise.all([
          newsService.getNews(),
          merchandiseService.getProducts('All'),
          aboutIntanService.getBio(),
        ]);

        // Pick top 4 news articles
        setFeaturedNews(news.slice(0, 4));

        // Keep all products for premium paginated carousel storefront
        setFeaturedProducts(products);

        // Set bio data
        setBio(bioData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);
  return (
    <LoadingProvider>
      <Preloader />
      <PreloaderBridge videoSrc="/hero-intan-vidio.webm" imageSources={[intan1, intan2, intan3, intan4]} />
      <div className="relative min-h-screen main-content-wrapper bg-transparent">
        {/* ================= HERO INTRO SECTION (FULLSCREEN) ================= */}
        <HomeHeroSection />

        {/* ================= BODY CONTENT SECTION (CONTAINED) ================= */}
        <div className="relative z-10 space-y-16 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* ================= KENALAN DENGAN NUR INTAN SECTION ================= */}
          {bio && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={scrollRevealVariants}
            >
              <KenalanIntanCarousel socialLinks={socialLinks} bio={bio} />
            </motion.div>
          )}

          {/* ================= MIDDLE SECTION: PREMIUM NEWS FEED ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)]">Memuat...</div>}>
              <HomeNewsSection articles={featuredNews} />
            </React.Suspense>
          </motion.div>

          {/* ================= MERCHANDISE PROMOTION ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)]">Memuat...</div>}>
              <HomeMerchandiseSection products={featuredProducts} />
            </React.Suspense>
          </motion.div>

          {/* ================= SOCIAL TAGS LOOPING BOARD ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)]">Memuat...</div>}>
              <HomeHashtagsSection />
            </React.Suspense>
          </motion.div>

          {/* ================= INTERACTIVE PHOTO GALLERY ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)]">Memuat...</div>}>
              <HomeGallerySection />
            </React.Suspense>
          </motion.div>

          {/* ================= MADING PREVIEW SECTION ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)]">Memuat...</div>}>
              <MadingPreviewSection />
            </React.Suspense>
          </motion.div>
        </div>
      </div>
    </LoadingProvider>
  );
}

/**
 * PreloaderBridge
 * 
 * Helper component to use the usePreloader hook inside LoadingProvider.
 * This triggers the asset loading process.
 */
function PreloaderBridge({ videoSrc, imageSources }) {
  usePreloader({ videoSrc, imageSources });
  return null;
}
