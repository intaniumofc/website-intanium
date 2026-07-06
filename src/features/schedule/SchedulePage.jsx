'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { scheduleService } from './scheduleService';
import ScheduleFilter from '../../components/schedule/ScheduleFilter';
import ScheduleCard from '../../components/schedule/ScheduleCard';
import ScheduleCalendarView from '../../components/schedule/ScheduleCalendarView';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, CalendarDays, List, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: PREMIUM_EASE, delay: i * 0.1 }
  })
};

// Floating background particles for horizontal scroll parallax
function TimelineParallaxBackground({ scrollX }) {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 300, // spreads across horizontal timeline area
      y: Math.random() * 70 + 15,
      speed: Math.random() * 0.22 + 0.08,
      opacity: Math.random() * 0.35 + 0.1,
    })),
    []
  );

  return (
    <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {particles.map((p) => {
        const translationX = useTransform(scrollX, (val) => -val * p.speed);
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-indigo-500/20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              x: translationX,
            }}
          />
        );
      })}
    </div>
  );
}

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('All');

  const scrollContainerRef = useRef(null);
  const { scrollX } = useScroll({ container: scrollContainerRef });

  useEffect(() => {
    document.title = 'Jadwal & Kegiatan | Official Website Intanium';
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    scheduleService.getEvents('all', activePlatform)
      .then((data) => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [activePlatform]);

  return (
    <div className="relative space-y-12 max-w-5xl mx-auto py-6 overflow-visible">

      {/* ========= PAGE HEADER & CONTROLS SECTION (Unified Row on Desktop) ========= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: PREMIUM_EASE }}
      >
        <section className="border-b border-indigo-100/70 pb-5 text-left">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">Kalender Aktivitas</p>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#170C79] sm:text-4xl">Jadwal & Kegiatan</h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                Pantau jadwal teater, video call, birthday, dan event streaming Nur Intan agar Anda tidak ketinggalan momen seru.
              </p>
            </div>

            {/* Category Filter aligned on the right in Desktop */}
            <div className="relative z-10 w-full md:w-auto flex justify-start md:justify-end">
              <ScheduleFilter
                activePlatform={activePlatform}
                onPlatformChange={setActivePlatform}
              />
            </div>
          </div>
        </section>
      </motion.div>

      {/* ========= AMBIENT BACKGROUND ORBS ========= */}
      <div className="absolute top-[40%] -left-24 w-80 h-80 bg-gradient-to-tr from-indigo-500/8 to-transparent rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] -right-20 w-72 h-72 bg-gradient-to-tr from-cyan-500/6 to-transparent rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-[30%] w-64 h-64 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />

      {/* ========= VIEW LAYOUT WITH SMOOTH TRANSITIONS ========= */}
      <div className="relative min-h-[350px] overflow-visible">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Loading message="Memuat schedule..." />
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyState
                title="Tidak Ada Jadwal Aktivitas"
                description="Saat ini belum ada jadwal yang terdaftar untuk filter ini. Coba ganti kategori lainnya."
                icon={Calendar}
              />
            </motion.div>
          ) : (
            <div className="space-y-20 overflow-visible relative">

              {/* ========= 1. LINIMASA JADWAL SECTION (Horizontal Scroll) ========= */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: PREMIUM_EASE, delay: 0.2 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100/80 pb-2">
                  <h2 className="text-xl font-black text-[#170C79] flex items-center gap-2">
                    <Sparkles className="w-5.5 h-5.5 text-cyan-500" /> Linimasa Kegiatan
                  </h2>
                </div>

                <div className="relative overflow-visible">
                  {/* Parallax Background for Horizontal Timeline */}
                  <TimelineParallaxBackground scrollX={scrollX} />

                  <motion.div
                    key="list"
                    ref={scrollContainerRef}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.06
                        }
                      }
                    }}
                    className="relative flex flex-col md:flex-row md:overflow-x-auto md:overflow-y-hidden md:min-h-[500px] md:items-center md:gap-8 md:px-8 md:py-16 md:space-y-0 border-l-2 border-indigo-100/40 md:border-l-0 ml-4 md:ml-0 pl-6 md:pl-0 space-y-12 py-6 text-left"
                  >
                    {/* Horizontal central track line on desktop */}
                    <div className="hidden md:block absolute left-0 right-0 top-[50%] h-[3px] bg-gradient-to-r from-[var(--color-primary)] via-cyan-500 to-pink-500 pointer-events-none -translate-y-[50%] opacity-80" />
                    {/* Vertical track line on mobile */}
                    <div className="md:hidden absolute top-0 bottom-0 left-[-2px] w-[2px] bg-gradient-to-b from-[var(--color-primary)]/50 via-cyan-400/20 to-pink-400/10 pointer-events-none" />

                    {events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        variants={{
                          hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
                          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: PREMIUM_EASE } }
                        }}
                        className={`relative shrink-0 ${index % 2 === 0
                          ? 'md:-translate-y-16'
                          : 'md:translate-y-16'
                          }`}
                      >
                        <ScheduleCard event={event} isHorizontal={true} index={index} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.section>

              {/* ========= 2. KALENDER BULANAN SECTION (Full-Page Grid) ========= */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: PREMIUM_EASE, delay: 0.35 }}
                className="space-y-6 text-left"
              >
                <div className="border-b border-slate-100/80 pb-2">
                  <h2 className="text-xl font-black text-[#170C79] flex items-center gap-2">
                    <Calendar className="w-5.5 h-5.5 text-indigo-500" /> Kalender Bulanan
                  </h2>
                </div>

                <ScheduleCalendarView events={events} />
              </motion.section>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
