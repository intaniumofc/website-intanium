import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { scheduleService } from '../schedule/scheduleService';
import { newsService } from '../news/newsService';
import { merchandiseService } from '../merchandise/merchandiseService';
import { madingService } from '../mading/madingService';
import { getEventStatus } from '../../lib/formatDate';
import { ROUTES, SOCIALS } from '../../lib/constants';
import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  User,
  ChevronRight
} from 'lucide-react';
import { ContainerScroll, ContainerStagger, ContainerAnimated, ContainerInset } from '../../components/ui/hero-video';
import { AnimatedText } from '../../components/ui/animated-text';
import intanVideo from '../../assets/images/intan-02.mp4';
import { ImageSwiper } from '../../components/ui/ImageSwiper';
import { aboutIntanService } from '../about-intan/aboutIntanService';
import { SocialTooltip } from '../../components/ui/social-media';
import HomeNewsSection from '../news/HomeNewsSection';
import HomeMerchandiseSection from '../merchandise/HomeMerchandiseSection';
import HomeGallerySection from '../gallery/HomeGallerySection';
import HomeHashtagsSection from '../hashtags/HomeHashtagsSection';
import HomeTestimonialsSection from '../mading/HomeTestimonialsSection';
import intan1 from '../../assets/images/intan-01.jpg';
import intan2 from '../../assets/images/intan-02.jpg';
import intan3 from '../../assets/images/intan-03.jpg';
import intan4 from '../../assets/images/intan-04.jpg';

const scrollRevealVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function HomePage() {
  const [nextEvent, setNextEvent] = useState(null);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const socialLinks = React.useMemo(() => [
    {
      href: SOCIALS.TWITTER,
      ariaLabel: "Twitter / X",
      tooltip: "Twitter / X",
      color: "#111111",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      href: SOCIALS.INSTAGRAM,
      ariaLabel: "Instagram",
      tooltip: "Instagram",
      color: "#E1306C",
      icon: (
        <svg className="w-5 h-5 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      href: SOCIALS.TIKTOK,
      ariaLabel: "TikTok",
      tooltip: "TikTok",
      color: "#111111",
      icon: (
        <svg className="w-5 h-5 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      )
    },
    {
      href: "https://www.idn.app/",
      ariaLabel: "IDN Live",
      tooltip: "IDN Live",
      color: "#E1251B",
      icon: (
        <span className="font-bold text-xs tracking-wider text-white select-none">IDN</span>
      )
    },
    {
      href: "https://www.showroom-live.com/",
      ariaLabel: "Showroom",
      tooltip: "Showroom",
      color: "#111111",
      icon: (
        <div className="flex flex-col items-center leading-none text-[8px] font-black tracking-tight select-none text-white">
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
        const [events, news, products, notes, bioData] = await Promise.all([
          scheduleService.getEvents('all'),
          newsService.getNews(),
          merchandiseService.getProducts('All'),
          madingService.getNotes(),
          aboutIntanService.getBio(),
        ]);

        // Pick the first upcoming/live stream event
        const active = events.find(e => getEventStatus(e.time) !== 'completed') || events[0];
        setNextEvent(active);

        // Pick top 4 news articles
        setFeaturedNews(news.slice(0, 4));

        // Keep all products for premium paginated carousel storefront
        setFeaturedProducts(products);

        // Pick top 3 community mading notes
        setRecentNotes(notes.slice(0, 3));

        // Set bio data
        setBio(bioData);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Decorative blue floral vine repeating background pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%234A7ABF' opacity='0.22'%3E%3Ccircle cx='60' cy='60' r='4' stroke-width='1.2'/%3E%3Ccircle cx='60' cy='60' r='8' stroke-width='0.8'/%3E%3Cpath d='M60 52 C56 48,56 40,60 36 C64 40,64 48,60 52' stroke-width='1'/%3E%3Cpath d='M60 68 C56 72,56 80,60 84 C64 80,64 72,60 68' stroke-width='1'/%3E%3Cpath d='M52 60 C48 56,40 56,36 60 C40 64,48 64,52 60' stroke-width='1'/%3E%3Cpath d='M68 60 C72 56,80 56,84 60 C80 64,72 64,68 60' stroke-width='1'/%3E%3Cpath d='M54 54 C50 50,44 50,42 42 C50 44,50 50,54 54' stroke-width='0.8'/%3E%3Cpath d='M66 54 C70 50,76 50,78 42 C70 44,70 50,66 54' stroke-width='0.8'/%3E%3Cpath d='M54 66 C50 70,44 70,42 78 C50 76,50 70,54 66' stroke-width='0.8'/%3E%3Cpath d='M66 66 C70 70,76 70,78 78 C70 76,70 70,66 66' stroke-width='0.8'/%3E%3Cpath d='M0 60 Q15 50,30 58 Q40 62,50 58' stroke-width='0.8'/%3E%3Cpath d='M70 62 Q80 58,90 62 Q105 70,120 60' stroke-width='0.8'/%3E%3Cpath d='M60 0 Q50 15,58 30 Q62 40,58 50' stroke-width='0.8'/%3E%3Cpath d='M62 70 Q58 80,62 90 Q70 105,60 120' stroke-width='0.8'/%3E%3Cpath d='M20 56 C18 52,20 48,24 50 C22 52,20 54,20 56Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M96 58 C98 54,100 50,104 52 C102 54,100 56,96 58Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M56 20 C52 18,48 20,50 24 C52 22,54 20,56 20Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M58 96 C54 98,50 100,52 104 C54 102,56 100,58 96Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Ccircle cx='0' cy='0' r='2' stroke-width='0.8'/%3E%3Ccircle cx='120' cy='0' r='2' stroke-width='0.8'/%3E%3Ccircle cx='0' cy='120' r='2' stroke-width='0.8'/%3E%3Ccircle cx='120' cy='120' r='2' stroke-width='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />
      <div className="relative z-10 space-y-12 animate-fade-in max-w-6xl mx-auto">
        {/* ================= HERO INTRO SECTION ================= */}
        <ContainerScroll className="text-center text-[var(--text-primary)] pt-4 pb-12">
          <ContainerStagger viewport={{ once: true }}>
            <ContainerAnimated animation="top">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-extrabold tracking-widest rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-sm mb-4">
                <Sparkles className="h-3 w-3" /> Official Website Fanbase of Nur Intan.
              </span>
            </ContainerAnimated>

            <ContainerAnimated animation="top" className="flex justify-center my-7 select-none">
              <div className="relative pb-6 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-2">
                <AnimatedText
                  text="INTANIUM"
                  underlineHeight="h-0"
                  textClassName="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent"
                  duration={0.12}
                  delay={0.2}
                />
                <AnimatedText
                  text="#BERKILAU"
                  underlineHeight="h-0"
                  textClassName="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight text-transparent"
                  style={{ WebkitTextStroke: '2px var(--color-primary)' }}
                  duration={0.12}
                  delay={0.5}
                />
                {/* Unified, glowing premium bottom divider line */}
                <motion.div
                  initial={{ width: "0%", left: "50%" }}
                  animate={{ width: "100%", left: "0%" }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 h-1.5 sm:h-2 md:h-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full shadow-[0_0_12px_rgba(74,122,191,0.4)]"
                />
              </div>
            </ContainerAnimated>

            <ContainerAnimated animation="blur" className="my-4 max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Ruang interaksi resmi dan pusat informasi bagi seluruh penikmat karya Intan. Dapatkan pembaruan jadwal streaming, rilisan eksklusif, serta ruang diskusi interaktif bersama komunitas INTANIUM di sini.
              </p>
            </ContainerAnimated>

            <ContainerAnimated
              animation="bottom"
              className="flex justify-center gap-4 pt-2"
            >
              <Button
                variant="primary"
                size="md"
                className="group gap-2 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  const target = document.getElementById('kenalan-intan');
                  if (target) {
                    const headerOffset = 90; // Exclude header height so section header is visible
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                    const startPosition = window.scrollY;
                    const distance = targetPosition - startPosition - headerOffset;

                    let startTime = null;
                    const duration = 1200; // 1.2 seconds smooth flow
                    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4); // Silky Quart Deceleration

                    const step = (currentTime) => {
                      if (startTime === null) startTime = currentTime;
                      const elapsed = currentTime - startTime;
                      const progress = Math.min(elapsed / duration, 1);

                      window.scrollTo(0, startPosition + distance * easeOutQuart(progress));

                      if (elapsed < duration) {
                        requestAnimationFrame(step);
                      }
                    };

                    requestAnimationFrame(step);
                  }
                }}
              >
                Kenali Sosok Intan <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              </Button>
              <Link to={ROUTES.ABOUT_INTANIUM}>
                <Button variant="outline" size="md" className="group gap-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-[var(--neon-glow-primary)]">
                  Gabung Komunitas <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </ContainerAnimated>
          </ContainerStagger>

          <ContainerInset
            insetXRange={[20, 0]}
            insetTopRange={[0, 0]}
            insetBottomRange={[45, 0]}
            roundednessRange={[1000, 16]}
            className="mx-2 sm:mx-8 mt-12 border-2 border-[var(--color-primary)]/30 rounded-2xl overflow-hidden shadow-2xl bg-black/40"
          >
            <video
              width="100%"
              height="100%"
              loop
              playsInline
              autoPlay
              muted
              className="relative z-10 block h-auto max-h-full max-w-full object-contain align-middle"
            >
              <source
                src={intanVideo}
                type="video/mp4"
              />
            </video>
          </ContainerInset>
        </ContainerScroll>

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

            <div className="relative overflow-hidden rounded-3xl bg-[#345B8B] border border-white/10 shadow-2xl p-8 md:p-12">
              {/* Decorative background glow elements inside card */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:gap-16 xl:gap-24">

                {/* Left Side: Details */}
                <div className="w-full lg:flex-1 lg:max-w-xl space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                  <h3 className="text-5xl sm:text-6xl font-playfair font-black tracking-wide text-white uppercase leading-none">
                    NUR <br className="hidden lg:block" /> INTAN
                  </h3>

                  <div className="w-16 h-[2px] bg-white/40 my-1" />

                  <p className="text-xl sm:text-2xl font-playfair italic text-white/95 leading-relaxed max-w-lg">
                    "Intan permata yang berkilau, <br className="hidden sm:inline" />
                    <span className="text-[#FFE285] font-semibold">temukan cahaya ku di hatimu!"</span>
                  </p>

                  {/* Social Media Section */}
                  <div className="pt-2 w-full flex flex-col items-center lg:items-start gap-3">
                    <span className="text-[11px] sm:text-xs tracking-[0.15em] text-white/70 uppercase font-extrabold select-none">
                      temukan nur intan di:
                    </span>
                    <SocialTooltip items={socialLinks} />
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link to={ROUTES.ABOUT_INTAN}>
                      <button className="inline-flex items-center gap-3.5 px-8 py-3.5 rounded-full bg-white text-[#4A7ABF] font-extrabold text-[10px] sm:text-xs uppercase tracking-[0.15em] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300">
                        Yuk Kenali Lebih Lanjut
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4A7ABF]/10 text-[#4A7ABF]">
                          <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Right Side: ImageSwiper */}
                <div className="w-full lg:w-auto flex-shrink-0 flex justify-center items-center py-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 opacity-20 blur-2xl rounded-2xl -m-4 pointer-events-none" />
                    <ImageSwiper
                      images={`${intan1},${intan2},${intan3},${intan4}`}
                      cardWidth={280}
                      cardHeight={390}
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
          <HomeNewsSection articles={featuredNews} />
        </motion.div>

        {/* ================= MERCHANDISE PROMOTION ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollRevealVariants}
        >
          <HomeMerchandiseSection products={featuredProducts} />
        </motion.div>

        {/* ================= SOCIAL TAGS LOOPING BOARD ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollRevealVariants}
        >
          <HomeHashtagsSection />
        </motion.div>

        {/* ================= INTERACTIVE PHOTO GALLERY ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollRevealVariants}
        >
          <HomeGallerySection />
        </motion.div>

        {/* ================= FAN TESTIMONIALS SCROLLING BOARD ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollRevealVariants}
        >
          <HomeTestimonialsSection />
        </motion.div>
      </div>
    </div>
  );
}
