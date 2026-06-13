import { useState, useEffect, useMemo } from 'react';
import { scheduleService } from './scheduleService';
import ScheduleFilter from '../../components/schedule/ScheduleFilter';
import ScheduleCard from '../../components/schedule/ScheduleCard';
import ScheduleCalendarView from '../../components/schedule/ScheduleCalendarView';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, CalendarDays, List, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: PREMIUM_EASE, delay: i * 0.1 }
  })
};

// Floating ambient particles for the hero
function HeroParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.4 + 0.15,
    })),
    []
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/80"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -5, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
}

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('All');
  const [viewMode, setViewMode] = useState('list');

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
    <div className="relative space-y-10 max-w-5xl mx-auto py-6 overflow-visible">

      {/* ========= HERO SECTION ========= */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: PREMIUM_EASE }}
        className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-gradient-to-br from-[#170C79] via-[#1e1494] to-[#0e0a52] p-8 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(23,12,121,0.3)]"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-400/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/8 to-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
        <HeroParticles />

        <div className="relative z-10 text-center md:text-left">
          {/* Decorative badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span className="text-[10px] font-black text-cyan-200 uppercase tracking-[0.2em]">Kalender Aktivitas</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4"
          >
            Schedule &{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Kegiatan
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium"
          >
            Pantau kalender jadwal teater, video call, birthday, dan event Nur Intan agar Anda tidak ketinggalan momen seru.
          </motion.p>
        </div>
      </motion.div>

      {/* ========= CONTROLS BAR ========= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: PREMIUM_EASE, delay: 0.3 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10"
      >
        <ScheduleFilter
          activePlatform={activePlatform}
          onPlatformChange={setActivePlatform}
        />

        <div className="flex items-center bg-white/75 backdrop-blur-xl p-1.5 rounded-2xl border border-[var(--border-color)] shadow-[0_4px_24px_rgba(23,12,121,0.06)] w-full lg:w-auto">
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_16px_rgba(23,12,121,0.3)]' : 'text-slate-500 hover:text-[var(--color-primary)] hover:bg-white/80'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            aria-pressed={viewMode === 'calendar'}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] ${viewMode === 'calendar' ? 'bg-[var(--color-primary)] text-white shadow-[0_4px_16px_rgba(23,12,121,0.3)]' : 'text-slate-500 hover:text-[var(--color-primary)] hover:bg-white/80'}`}
          >
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
        </div>
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
          ) : viewMode === 'list' ? (
            <motion.div
              key="list"
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
              className="relative border-l-2 border-indigo-100/40 ml-4 md:ml-36 pl-6 md:pl-10 space-y-12 py-6 text-left"
            >
              {/* Connecting gradient overlay on timeline line */}
              <div className="absolute top-0 bottom-0 left-[-2px] w-[2px] bg-gradient-to-b from-[var(--color-primary)]/50 via-cyan-400/20 to-pink-400/10 pointer-events-none" />

              {events.map((event) => (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: PREMIUM_EASE } }
                  }}
                  className="relative"
                >
                  <ScheduleCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: PREMIUM_EASE }}
            >
              <ScheduleCalendarView events={events} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
