'use client';

import { useState, useEffect, useMemo } from 'react';
import { scheduleService } from '../../services/public/scheduleService';
import ScheduleFilter from '../../components/schedule/ScheduleFilter';
import ScheduleCalendarView from '../../components/schedule/ScheduleCalendarView';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEventTime, getEventStatus } from '../../lib/formatDate';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

const isSameDate = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

function formatEventDayHeader(date) {
  if (!date) return '';
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function CompactEventCard({ event }) {
  const { title, time, platform, link, duration, thumbnail } = event;

  const timeStr = formatEventTime(time);
  const status = getEventStatus(time);

    const badgeStyles = {
    upcoming: 'bg-[var(--color-blue-tint-12)] text-[var(--color-blue-dark)] border border-[var(--color-blue-tint-25)]',
    live: 'bg-[var(--color-pink)] text-white animate-pulse',
    completed: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    live: 'Live Now',
    completed: 'Selesai',
  };

  return (
    <div className="group relative flex gap-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 text-left">
      {/* Setlist Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shrink-0 relative">
        {thumbnail ? (
          <img
            src={thumbnail.src || thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[var(--gradient-pink-purple)] flex items-center justify-center text-white">
            <Calendar className="w-6 h-6 opacity-80" />
          </div>
        )}
      </div>

      {/* Details info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-black text-[var(--color-blue-dark)] uppercase tracking-wide bg-[var(--color-blue-tint-12)] border border-[var(--color-blue-tint-25)] px-2 py-0.5 rounded-full">
              {platform}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${badgeStyles[status]}`}>
              {statusLabels[status]}
            </span>
            {duration && <span className="text-[8px] text-[var(--color-text-secondary)] font-bold">± {duration}</span>}
          </div>
          <h4 className="text-xs font-black text-[var(--color-heading)] leading-snug line-clamp-2 group-hover:text-[var(--color-pink)] transition-colors" title={title}>
            {title}
          </h4>
        </div>

        {/* Footer date & link */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 mt-1 gap-2">
          <div className="text-[9px] font-bold text-[var(--color-text-secondary)] flex items-center gap-1 min-w-0">
                      <Clock className="w-3 h-3 text-[var(--color-blue)] shrink-0" />
            <span className="truncate">{timeStr}</span>
          </div>
          {link && (status === 'live' || status === 'upcoming') && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-[9px] font-bold text-[var(--color-pink)] hover:text-[var(--color-primary-hover)] flex items-center gap-0.5 hover:underline shrink-0"
            >
              Link <ArrowRight className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarEventsPanel({ events, selectedDate }) {
  const activeEvents = useMemo(() => {
    return events.filter(e => {
      const dateObj = new Date(e.time);
      return isSameDate(dateObj, selectedDate);
    });
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.time) >= now)
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .slice(0, 4);
  }, [events]);

  return (
    <div className="bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-[2rem] p-5 shadow-[var(--shadow-sm)] backdrop-blur-xl space-y-6 text-left h-full">
      <div>
        <h3 className="text-sm font-black text-[var(--color-pink)] uppercase tracking-widest leading-none mb-1.5">Agenda Kegiatan</h3>
                <h4 className="text-base font-black text-[var(--color-heading)]">{formatEventDayHeader(selectedDate)}</h4>
      </div>

      <div className="space-y-4">
        {activeEvents.length > 0 ? (
          <div className="space-y-3">
            {activeEvents.map(event => (
              <CompactEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="py-8 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30">
                          <Calendar className="w-8 h-8 text-[var(--color-text-secondary)] mb-2" />
                          <p className="text-xs font-bold text-[var(--color-text-secondary)]">Tidak ada agenda khusus pada tanggal ini.</p>
            </div>

            {upcomingEvents.length > 0 && (
              <div className="space-y-3">
                <div className="border-b border-[var(--color-border)] pb-2">
                                  <h4 className="text-xs font-black text-[var(--color-heading)] uppercase tracking-wider flex items-center gap-1.5">
                    Agenda Terdekat
                  </h4>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <CompactEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SchedulePage({ initialEvents = [] }) {
  const [activePlatform, setActivePlatform] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Jadwal & Kegiatan | Official Website IRIS';
  }, []);

  const filteredEvents = useMemo(() => {
    if (activePlatform === 'All') return initialEvents;
    return initialEvents.filter(e => e.platform === activePlatform || e.type === activePlatform);
  }, [initialEvents, activePlatform]);

  return (
    <div className="relative space-y-8 w-full pb-6 overflow-visible">
      {/* ========= PAGE HEADER & CONTROLS SECTION ========= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: PREMIUM_EASE }}
      >
        <section className="border-b border-[var(--color-border)] pb-5 text-left">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-pink)]">Kalender Aktivitas</p>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--color-heading)] sm:text-4xl">Jadwal & Kegiatan</h1>
                            <p className="max-w-xl text-sm leading-relaxed text-[var(--color-body)] font-semibold">
                Pantau jadwal teater, video call, birthday, dan event streaming Nur Intan agar Anda tidak ketinggalan momen seru.
              </p>
            </div>

            {/* Category Filter */}
            <div className="relative z-10 w-full md:w-auto flex justify-start md:justify-end">
              <ScheduleFilter
                activePlatform={activePlatform}
                onPlatformChange={setActivePlatform}
              />
            </div>
          </div>
        </section>
      </motion.div>

      {/* Ambient background glows */}
      <div className="absolute top-[30%] -left-24 w-80 h-80 bg-[var(--color-purple-tint-12)] rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-[20%] -right-20 w-72 h-72 bg-[var(--color-blue-tint-15)] rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* ========= MAIN CONTENT VIEW LAYOUT ========= */}
      <div className="relative min-h-[350px] overflow-visible">
        <AnimatePresence mode="wait">
          {!mounted ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <div className="w-8 h-8 border-4 border-[var(--color-pink)] border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                title="Tidak Ada Jadwal Aktivitas"
                description="Saat ini belum ada jadwal yang terdaftar untuk filter ini. Coba ganti kategori lainnya."
                icon={Calendar}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: PREMIUM_EASE }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10"
            >
              {/* Kolom Kiri: Kalender */}
              <div className="lg:col-span-7 xl:col-span-8">
                <ScheduleCalendarView
                  events={filteredEvents}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Kolom Kanan: Sidebar Detail */}
              <div className="lg:col-span-5 xl:col-span-4 h-full">
                <SidebarEventsPanel
                  events={filteredEvents}
                  selectedDate={selectedDate}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
