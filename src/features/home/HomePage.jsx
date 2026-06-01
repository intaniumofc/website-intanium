import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { scheduleService } from '../schedule/scheduleService';
import { newsService } from '../news/newsService';
import { merchandiseService } from '../merchandise/merchandiseService';
import { madingService } from '../mading/madingService';
import { formatEventTime, getEventStatus } from '../../lib/formatDate';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import {
  Sparkles,
  Tv,
  Newspaper,
  Pin,
  ShoppingBag,
  Video,
  Bell,
  ArrowRight,
  ArrowDown,
  User
} from 'lucide-react';
import { ContainerScroll, ContainerStagger, ContainerAnimated, ContainerInset } from '../../components/ui/hero-video';
import { AnimatedText } from '../../components/ui/animated-text';
import intanVideo from '../../assets/images/intan-02.mp4';
import { ImageSwiper } from '../../components/ui/ImageSwiper';
import { aboutIntanService } from '../about-intan/aboutIntanService';

export default function HomePage() {
  const [nextEvent, setNextEvent] = useState(null);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

        // Pick top 2 news articles
        setFeaturedNews(news.slice(0, 2));

        // Pick top 2 available products
        setFeaturedProducts(products.filter(p => p.isAvailable).slice(0, 2));

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
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
      {/* ================= HERO INTRO SECTION ================= */}
      <ContainerScroll className="text-center text-[var(--text-primary)] pt-4 pb-12">
        <ContainerStagger viewport={{ once: true }}>
          <ContainerAnimated animation="top">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-extrabold tracking-widest rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-sm mb-4">
              <Sparkles className="h-3 w-3" /> Official Website Fanbase of Nur Intan.
            </span>
          </ContainerAnimated>

          <ContainerAnimated animation="top" className="flex justify-center my-7">
            <AnimatedText
              text="INTANIUM"
              textClassName="text-6xl sm:text-8xl md:text-9xl font-black leading-none tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent pb-4"
              underlineGradient="from-[var(--color-primary)] to-[var(--color-primary-hover)]"
              underlineHeight="h-1.5 sm:h-2 md:h-2.5"
              underlineOffset="-bottom-3"
              duration={0.15}
              delay={0.3}
            />
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
            <Link to={ROUTES.ABOUT_INTAN}>
              <Button variant="primary" size="md" className="group gap-2 hover:scale-105 transition-all duration-300">
                Kenali Sosok Intan <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              </Button>
            </Link>
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
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-[#170C79] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--color-primary)]" /> Kenalan dengan Nur Intan
          </h2>

          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--color-primary-light)]/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">

              {/* Left Side: Image Swiper Stack */}
              <div className="w-full md:w-auto flex flex-col items-center justify-center flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] opacity-10 blur-xl rounded-xl -m-4 pointer-events-none" />
                  <ImageSwiper
                    images="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80,https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80"
                    cardWidth={240}
                    cardHeight={320}
                    className="z-10"
                  />
                </div>
              </div>

              {/* Right Side: Description and details */}
              <div className="flex-grow space-y-5">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-2xl font-black text-[#170C79] leading-tight">
                    {bio.fullName}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed text-center md:text-left">
                  {bio.description}
                </p>

                {/* Quick Profile Bio Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/60 border border-[var(--border-color)]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] block">Panggilan</span>
                    <span className="text-xs font-extrabold text-[var(--color-primary)] mt-0.5 block">{bio.nickname}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 border border-[var(--border-color)]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] block">Zodiak</span>
                    <span className="text-xs font-extrabold text-[var(--color-primary)] mt-0.5 block">{bio.zodiac}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 border border-[var(--border-color)]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] block">Tinggi Badan</span>
                    <span className="text-xs font-extrabold text-[var(--color-primary)] mt-0.5 block">{bio.height}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 border border-[var(--border-color)]">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--text-muted)] block">Debut Resmi</span>
                    <span className="text-xs font-extrabold text-[var(--color-primary)] mt-0.5 block">15 Mei</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center md:justify-start">
                  <Link to={ROUTES.ABOUT_INTAN}>
                    <Button variant="primary" size="md" className="group gap-2 hover:scale-105 transition-all duration-300">
                      Lihat Profil Lengkap <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </Card>
        </section>
      )}

      {/* ================= MIDDLE SECTIONS: NEWS & MADING TEASERS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest News Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
            <h2 className="text-xl font-extrabold text-[#170C79] flex items-center gap-2">
              <Newspaper className="h-5 w-5" /> Berita & Update Terbaru
            </h2>
            <Link to={ROUTES.NEWS} className="text-xs text-[var(--color-primary-hover)] hover:underline font-bold flex items-center gap-1">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredNews.map((news) => (
              <Card
                key={news.id}
                className="flex flex-col justify-between h-full border border-[var(--border-color)] group hover:shadow-[var(--neon-glow-primary)] transition-all"
                padding="none"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-black/20 relative">
                  <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[8px] font-bold bg-black/60 text-purple-300">
                    {news.category}
                  </span>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#170C79] group-hover:text-[var(--color-primary)] line-clamp-2 leading-tight">
                      {news.title}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{news.date}</p>
                  </div>
                  <Link to={`/news/${news.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs py-1.5">
                      Baca Berita
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Mading board teaser */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
            <h2 className="text-xl font-extrabold text-[#170C79] flex items-center gap-2">
              <Pin className="h-5 w-5" /> Mading Komunitas
            </h2>
            <Link to={ROUTES.MADING} className="text-xs text-[var(--color-primary-hover)] hover:underline font-bold flex items-center gap-1">
              Kirim Pesan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Kumpulan ucapan hangat dan coretan lucu yang baru tertempel dari member komunitas Intanium:
            </p>
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs space-y-1">
                  <p className="italic text-[var(--text-secondary)] break-words">"{note.message}"</p>
                  <span className="font-bold text-[var(--color-primary-hover)] block text-right">- {note.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ================= MERCHANDISE PROMOTION ================= */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h2 className="text-xl font-extrabold text-[#170C79] flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Best-Selling Merchandise
          </h2>
          <Link to={ROUTES.MERCHANDISE} className="text-xs text-[var(--color-primary-hover)] hover:underline font-bold flex items-center gap-1">
            Kunjungi Toko <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              hoverEffect={true}
              padding="none"
              className="border border-[var(--border-color)] overflow-hidden flex flex-col sm:flex-row group transition-all"
            >
              <div className="w-full sm:w-44 aspect-square flex-shrink-0 bg-black/20 border-b sm:border-b-0 sm:border-r border-[var(--border-color)]">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-purple-600 bg-purple-100/50 border border-purple-200 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  <h4 className="font-bold text-sm text-[#170C79] group-hover:text-[var(--color-primary)] mt-2 line-clamp-1 leading-snug">
                    {product.name}
                  </h4>
                  <span className="text-xs font-extrabold text-[var(--color-secondary)] block">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <Link to={`/merchandise/${product.id}`}>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Detail Produk
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
