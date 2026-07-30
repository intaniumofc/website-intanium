'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Calendar,
  Theater,
  Music,
  MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../lib/constants';
import { SocialTooltip } from '../../components/ui/social-media';
import ScrollFloat from '../../components/ui/ScrollFloat';
import { aboutIntanService } from '../../services/public/aboutIntanService';
import intan1 from '../../assets/images/intan-01.webp';
import intan2 from '../../assets/images/intan-02.webp';
import intan3 from '../../assets/images/intan-03.webp';
import intan4 from '../../assets/images/intan-04.webp';

const images = [intan1, intan2, intan3, intan4];

const cardContent = {
  name: "Nur Intan",
  subTitle: "Member JKT48 Generasi 13 (Trainee)",
  catchphrase: "Intan permata yang berkilau, temukan cahayaku di hatimu!",
  birthInfo: "Bogor, 23 Feb 2006",
  description:
    "Member Generasi 13 JKT48 yang dikenal ramah, penuh energi, dan berdedikasi tinggi. Selain aktif di panggung teater, Intan merupakan mahasiswi D3 Periklanan Kreatif Vokasi Universitas Indonesia dan mantan atlet pencak silat berprestasi.",
};

export default function KenalanIntanCarousel({ socialLinks, className }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dynamicStats, setDynamicStats] = useState({
    showCount: '128+ Show',
    setlistCount: '3 Setlist',
  });

  useEffect(() => {
    let isMounted = true;
    aboutIntanService.getBio().then((bio) => {
      if (!isMounted || !bio) return;
      const theaterStat = bio.stats?.find(s =>
        s.label?.toLowerCase().includes('teater') || s.label?.toLowerCase().includes('show')
      );
      const setlistStat = bio.stats?.find(s =>
        s.label?.toLowerCase().includes('setlist')
      );

      const showVal = theaterStat ? theaterStat.value : (bio.stats?.[0]?.value || '128+ Show');
      const setlistVal = setlistStat ? setlistStat.value : (bio.stats?.[2]?.value || '3 Setlist');

      setDynamicStats({
        showCount: showVal,
        setlistCount: setlistVal,
      });
    }).catch(err => console.error('Error fetching dynamic stats:', err));

    return () => { isMounted = false; };
  }, []);

  // Auto-play slideshow every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () =>
    setCurrentImageIndex((index) => (index + 1) % images.length);
  const handlePrevious = () =>
    setCurrentImageIndex(
      (index) => (index - 1 + images.length) % images.length
    );

  const currentImage = images[currentImageIndex];

  return (
    <section id="kenalan-intan" className="space-y-6">
      <h2 className="text-xl font-extrabold text-[var(--color-heading)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
        <User className="h-5 w-5 text-[var(--color-pink)]" /> Kenalan dengan Nur Intan
      </h2>

      <div className={cn("w-full max-w-6xl mx-auto px-2 sm:px-4", className)}>
        {/* Desktop layout */}
        <div className="hidden md:flex relative items-center">
          {/* Avatar (Auto-changing Photos) */}
          <div className="w-[450px] lg:w-[480px] h-[520px] lg:h-[550px] rounded-3xl overflow-hidden bg-white shadow-lg border border-[var(--color-border)] flex-shrink-0 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={cardContent.name}
                  width={480}
                  height={550}
                  className="w-full h-full object-cover"
                  draggable={false}
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card (Highlighted Design with Lucide Icons) */}
          <div className="bg-white rounded-3xl shadow-xl border border-[var(--color-border)] p-8 lg:p-10 ml-[-60px] z-10 max-w-3xl flex-1 relative overflow-visible">
            {/* Ambient edge glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(248,111,175,0.08)_0%,transparent_70%)] rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header & Subtitle */}
              <div>
                <ScrollFloat
                  as="h3"
                  animationDuration={1}
                  ease="back.inOut(2)"
                  stagger={0.04}
                  textClassName="text-2xl lg:text-3xl font-extrabold text-[var(--color-heading)] tracking-tight block"
                  scrollStart="top 90%"
                >
                  {cardContent.name}
                </ScrollFloat>
                <p className="text-xs font-semibold text-[var(--color-pink-dark)] mt-1">
                  {cardContent.subTitle}
                </p>
              </div>

              {/* Jidoshoukai / Catchphrase */}
              <p className="text-xs lg:text-sm font-semibold italic text-[var(--color-pink-dark)] leading-relaxed block">
                {`"${cardContent.catchphrase}"`}
              </p>

              {/* Quick Stat Chips (Lucide Icons) */}
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[var(--color-body)]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-pink)]" />
                  {cardContent.birthInfo}
                </span>
              </div>

              {/* Short Bio Description */}
              <p className="text-[var(--color-body)] text-xs lg:text-sm leading-relaxed block">
                {cardContent.description}
              </p>

              {/* Theater & Setlist Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-[var(--color-border)]">
                  <div className="p-2 rounded-lg bg-[var(--color-pink-tint-15)] text-[var(--color-pink-dark)]">
                    <Theater className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-heading)]">{dynamicStats.showCount}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">Penampilan Teater</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-[var(--color-border)]">
                  <div className="p-2 rounded-lg bg-[var(--color-pink-tint-15)] text-[var(--color-pink-dark)]">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-heading)]">{dynamicStats.setlistCount}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">Setlist Yang Dibawakan</p>
                  </div>
                </div>
              </div>

              {/* Social media & CTA row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
                {socialLinks && (
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider whitespace-nowrap">Ikuti Intan:</span>
                    <SocialTooltip items={socialLinks} />
                  </div>
                )}
                <Link
                  href={ROUTES.ABOUT_INTAN}
                  className="inline-flex items-center justify-center gap-2 px-5 lg:px-6 py-2.5 rounded-full text-white text-xs lg:text-sm font-extrabold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ml-auto whitespace-nowrap flex-shrink-0"
                  style={{ background: 'var(--gradient-cta)' }}
                >
                  <span className="whitespace-nowrap">Kenali Lebih Dekat</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden max-w-sm mx-auto bg-white rounded-3xl border border-[var(--color-border)] shadow-lg p-5 overflow-hidden">
          {/* Avatar (Auto-changing Photos) */}
          <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-[var(--color-border)] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={cardContent.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  draggable={false}
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card content */}
          <div className="space-y-3">
            <div>
              <ScrollFloat
                as="h3"
                animationDuration={1}
                ease="back.inOut(2)"
                stagger={0.04}
                textClassName="text-xl font-extrabold text-[var(--color-heading)] block"
                scrollStart="top 90%"
              >
                {cardContent.name}
              </ScrollFloat>
              <p className="text-xs font-semibold text-[var(--color-pink-dark)] mt-0.5">
                {cardContent.subTitle}
              </p>
            </div>

            {/* Jidoshoukai / Catchphrase */}
            <p className="text-xs font-semibold italic text-[var(--color-pink-dark)] leading-relaxed block">
              {`"${cardContent.catchphrase}"`}
            </p>

            {/* Stat Chips */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-[var(--color-body)]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <Calendar className="w-3 h-3 text-[var(--color-pink)]" />
                {cardContent.birthInfo}
              </span>
            </div>

            <p className="text-[var(--color-body)] text-xs leading-relaxed block">
              {cardContent.description}
            </p>

            {/* Social & CTA */}
            <div className="flex flex-col items-center gap-3 pt-3 border-t border-[var(--color-border)]">
              {socialLinks && (
                <SocialTooltip items={socialLinks} />
              )}
              <Link
                href={ROUTES.ABOUT_INTAN}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer whitespace-nowrap"
                style={{ background: 'var(--gradient-cta)' }}
              >
                <span className="whitespace-nowrap">Kenali Lebih Dekat</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex justify-center items-center gap-6 mt-6">
          {/* Previous */}
          <button
            onClick={handlePrevious}
            aria-label="Previous photo"
            className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] shadow-md flex items-center justify-center text-[var(--color-heading)] hover:bg-[var(--color-pink-tint-15)] hover:text-[var(--color-pink-dark)] hover:border-[var(--color-pink-dark)] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {images.map((_, imgIndex) => (
              <button
                key={imgIndex}
                onClick={() => setCurrentImageIndex(imgIndex)}
                className={cn(
                  "h-3 rounded-full transition-all cursor-pointer",
                  imgIndex === currentImageIndex
                    ? "w-8 bg-[var(--color-pink-dark)]"
                    : "w-3 bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to photo ${imgIndex + 1}`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            aria-label="Next photo"
            className="w-11 h-11 rounded-full bg-white border border-[var(--color-border)] shadow-md flex items-center justify-center text-[var(--color-heading)] hover:bg-[var(--color-pink-tint-15)] hover:text-[var(--color-pink-dark)] hover:border-[var(--color-pink-dark)] transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
