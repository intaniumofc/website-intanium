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
const HomeNewsSection = React.lazy(() => import('../news/HomeNewsSection'));
const HomeMerchandiseSection = React.lazy(() => import('../merchandise/HomeMerchandiseSection'));
const HomeGallerySection = React.lazy(() => import('../gallery/HomeGallerySection'));
const HomeHashtagsSection = React.lazy(() => import('../hashtags/HomeHashtagsSection'));
const MadingPreviewSection = React.lazy(() => import('../mading/MadingPreviewSection'));
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  const [loadVideo, setLoadVideo] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const startLoadingVideo = () => {
      setTimeout(() => {
        setLoadVideo(true);
      }, 500);
    };

    if (document.readyState === 'complete') {
      startLoadingVideo();
    } else {
      window.addEventListener('load', startLoadingVideo);
      return () => window.removeEventListener('load', startLoadingVideo);
    }
  }, []);

  useEffect(() => {
    if (loadVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.log("Autoplay blocked or video load error:", err);
      });
    }
  }, [loadVideo]);

  const socialLinks = React.useMemo(() => [
    {
      href: "https://x.com/N_IntanJKT48",
      ariaLabel: "Twitter / X",
      tooltip: "Twitter / X",
      color: "#111111",
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current text-white" viewBox="0 0 24 24">
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
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
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
      color: "#000000",
      icon: (
        <FaThreads className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
      )
    },
    {
      href: "https://www.tiktok.com/@jkt48.intan",
      ariaLabel: "TikTok",
      tooltip: "TikTok",
      color: "#111111",
      icon: (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
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
        <span className="font-bold text-[10px] sm:text-xs tracking-wider text-white select-none">IDN</span>
      )
    },
    {
      href: "https://www.showroom-live.com/r/JKT48_Intan",
      ariaLabel: "Showroom",
      tooltip: "Showroom",
      color: "#111111",
      icon: (
        <div className="flex flex-col items-center leading-none text-[7px] sm:text-[8px] font-black tracking-tight select-none text-white">
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
    <div className="relative min-h-screen">
      {/* ================= HERO INTRO SECTION (FULLSCREEN) ================= */}
      <HomeHeroSection />

      {/* ================= BODY CONTENT SECTION (CONTAINED) ================= */}
      <div className="relative z-10 space-y-16 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ================= KENALAN DENGAN NURINTAN SECTION ================= */}
        {bio && (
          <motion.section
            id="kenalan-intan"
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <h2 className="text-xl font-extrabold text-[#170C79] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
              <User className="h-5 w-5 text-[var(--color-primary)]" /> Kenalan dengan Nur Intan
            </h2>

            <div className="relative overflow-hidden rounded-3xl bg-[#345B8B] border border-white/10 shadow-2xl p-5 sm:p-8 md:p-12">
              {/* Decorative background glow elements inside card */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:gap-16 xl:gap-24">

                {/* Left Side: Details */}
                <div className="w-full lg:flex-1 lg:max-w-xl space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                  <h3 className="text-5xl sm:text-6xl font-playfair font-black tracking-wide uppercase leading-none">
                    <motion.span
                      className="inline-block bg-[linear-gradient(110deg,#ffffff,28%,#dbeafe,40%,#ffffff,50%,#7dd3fc,58%,#ffe285,68%,#ffffff)] bg-[length:240%_100%] bg-clip-text text-transparent drop-shadow-[0_3px_14px_rgba(255,255,255,0.24)]"
                      initial={{ backgroundPosition: '200% 0' }}
                      animate={{ backgroundPosition: '-200% 0' }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.2,
                        ease: 'linear',
                      }}
                    >
                      NUR <br className="hidden lg:block" /> INTAN
                    </motion.span>
                  </h3>

                  <div className="w-16 h-[2px] bg-white/40 my-1" />

                  <p className="text-xl sm:text-2xl font-playfair italic text-white/95 leading-relaxed max-w-lg">
                    "Intan permata yang berkilau, <br className="hidden sm:inline" />
                    <span className="text-[#FFE285] font-semibold">temukan cahaya ku di hatimu!"</span>
                  </p>

                  {/* Social Media Section */}
                  <div className="pt-2 w-full flex flex-col items-center lg:items-start gap-3">
                    <span className="text-[11px] sm:text-xs tracking-[0.15em] text-white/70 font-semibold select-none">
                      Temukan Nur Intan di:
                    </span>
                    <SocialTooltip items={socialLinks} />
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link
                      href={ROUTES.ABOUT_INTAN}
                      className="inline-flex items-center gap-3.5 px-8 py-3.5 rounded-full bg-white text-[#4A7ABF] font-extrabold text-[10px] sm:text-xs uppercase tracking-[0.15em] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#345B8B]"
                    >
                      Yuk Kenali Lebih Lanjut
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4A7ABF]/10 text-[#4A7ABF]">
                        <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Right Side: ImageSwiper */}
                <div className="w-full lg:w-auto flex-shrink-0 flex justify-center items-center py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 opacity-20 blur-2xl rounded-2xl -m-4 pointer-events-none" />
                    <ImageSwiper
                      images={[intan1, intan2, intan3, intan4]}
                      cardWidth={isMobile ? 220 : 280}
                      cardHeight={isMobile ? 310 : 390}
                      className="z-10"
                    />
                  </div>
                </div>

              </div>
            </div>
          </motion.section>
        )}

        {/* ================= MIDDLE SECTION: PREMIUM NEWS FEED ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollRevealVariants}
        >
          <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Memuat...</div>}>
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
          <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Memuat...</div>}>
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
          <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Memuat...</div>}>
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
          <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Memuat...</div>}>
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
          <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Memuat...</div>}>
            <MadingPreviewSection />
          </React.Suspense>
        </motion.div>
      </div>
    </div>
  );
}
