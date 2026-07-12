'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ArrowRight, Calendar as CalendarIcon, Sparkles, X, PlayCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

export default function ScheduleCalendarView({ events, selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [slideDir, setSlideDir] = useState(1);

  // Format events to match calendar requirements
  const calendarEvents = events.map((event) => {
    const dateObj = new Date(event.time);
    return {
      id: event.id,
      date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
      time: dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      title: event.title,
      location: event.description || 'Online',
      type: event.platform || 'Event',
      link: event.link,
      duration: event.duration,
      thumbnail: event.thumbnail,
      originalEvent: event
    };
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const nextMonth = () => {
    setSlideDir(1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setSlideDir(-1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayNamesShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date) => isSameDate(date, new Date());

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const getPillColor = (type) => {
    if (type === 'Show Theater') return 'bg-rose-50/90 text-rose-600 border-rose-200/60 hover:bg-rose-100/80';
    if (type === 'Video Call') return 'bg-cyan-50/90 text-cyan-700 border-cyan-200/60 hover:bg-cyan-100/80';
    if (type === 'Birthday') return 'bg-amber-50/90 text-amber-700 border-amber-200/60 hover:bg-amber-100/80';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) {
      return 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/80';
    }
    return 'bg-purple-50/90 text-purple-700 border-purple-200/60 hover:bg-purple-100/80';
  };

  const getCellStyle = (dayEvents, todayMark, isSelected) => {
    const baseTodayStyle = todayMark ? 'ring-2 ring-cyan-500/85 ring-offset-1 z-10' : '';
    const selectedStyle = isSelected ? 'ring-2 ring-[#170C79] ring-offset-1 z-20 bg-[#170C79]/5 border-[#170C79]/30 shadow-sm' : '';

    let baseStyle = '';
    if (dayEvents.length === 0) {
      baseStyle = `bg-white/60 hover:bg-slate-50/50 border-indigo-100/30`;
    } else if (dayEvents.length === 1) {
      const type = dayEvents[0].type;
      if (type === 'Show Theater') baseStyle = `bg-rose-50/60 border-rose-200/60 hover:bg-rose-100/40`;
      else if (type === 'Video Call') baseStyle = `bg-cyan-50/65 border-cyan-200/60 hover:bg-cyan-100/40`;
      else if (type === 'Birthday') baseStyle = `bg-amber-50/60 border-amber-200/60 hover:bg-amber-100/40`;
      else if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) {
        baseStyle = `bg-indigo-50/60 border-indigo-200/60 hover:bg-indigo-100/40`;
      } else {
        baseStyle = `bg-purple-50/60 border-purple-200/60 hover:bg-purple-100/40`;
      }
    } else {
      baseStyle = `bg-violet-50/60 border-violet-200/60 hover:bg-violet-100/40`;
    }

    return `${baseStyle} ${baseTodayStyle} ${selectedStyle}`;
  };

  const platformConfig = {
    YouTube: { label: 'YouTube', icon: PlayCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200/40' },
    Twitch: { label: 'Twitch', icon: PlayCircle, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200/40' },
    TikTok: { label: 'TikTok', icon: PlayCircle, color: 'text-pink-500', bg: 'bg-pink-50 border-pink-200/40' },
    Instagram: { label: 'Instagram Live', icon: PlayCircle, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200/40' },
    Discord: { label: 'Discord Stage', icon: PlayCircle, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-200/40' },
    'IDN Live': { label: 'IDN Live', icon: PlayCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200/40' },
    'Show Theater': { label: 'Show Theater', icon: CalendarIcon, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200/40' },
    'Birthday': { label: 'Birthday', icon: CalendarIcon, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200/40' },
  };

  // Collect all days in current month that have events (for mobile fallback view)
  const getDaysWithEventsThisMonth = () => {
    const daysList = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        daysList.push({ date, events: dayEvents });
      }
    }
    return daysList;
  };

  const mobileDaysWithEvents = getDaysWithEventsThisMonth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: PREMIUM_EASE }}
      className="relative overflow-visible rounded-[2rem] border border-[var(--border-color)] bg-white/70 p-4 sm:p-6 shadow-[0_8px_32px_rgba(23,12,121,0.06)] backdrop-blur-xl"
    >
      {/* Decorative background stars / glow blobs */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-indigo-400/8 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-pink-500/6 blur-[80px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-cyan-400/5 blur-[60px]" />

      {/* ================= CALENDAR HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-black text-[var(--color-primary)] font-heading flex items-center gap-2">
          <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2.5 bg-white/85 border border-indigo-100/30 hover:bg-indigo-50 rounded-2xl transition-all duration-300 cursor-pointer text-slate-500 hover:text-[var(--color-primary)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2.5 bg-white/85 border border-indigo-100/30 hover:bg-indigo-50 rounded-2xl transition-all duration-300 cursor-pointer text-slate-500 hover:text-[var(--color-primary)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ================= DESKTOP FULL-PAGE CALENDAR GRID ================= */}
      <div className="hidden md:block overflow-visible relative min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
            initial={{ opacity: 0, x: slideDir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir * -20 }}
            transition={{ duration: 0.35, ease: PREMIUM_EASE }}
            className="grid grid-cols-7 border-t border-l border-indigo-100/30 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(23,12,121,0.03)] bg-white/35 backdrop-blur-xl"
          >
            {/* Days of week header */}
            {dayNamesShort.map((day, idx) => (
              <div
                key={day}
                className={`border-r border-b border-indigo-100/30 py-3 text-center text-xs font-black uppercase tracking-[0.1em] bg-slate-50/50 ${idx === 0 || idx === 6 ? 'text-rose-500 bg-rose-50/20' : 'text-slate-500'
                  }`}
              >
                {day}
              </div>
            ))}

            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-indigo-100/30 bg-slate-50/10 min-h-[110px]"></div>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
              const todayMark = isToday(date);
              const dayEvents = getEventsForDate(date);
              const isSelected = selectedDate && isSameDate(date, selectedDate);

              return (
                <div
                  key={i}
                  onClick={() => onSelectDate && onSelectDate(date)}
                  className={`border-r border-b border-indigo-100/30 p-2.5 min-h-[110px] flex flex-col justify-between transition-all duration-300 cursor-pointer ${getCellStyle(dayEvents, todayMark, isSelected)}`}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-black flex items-center justify-center rounded-full w-6 h-6 ${todayMark
                        ? 'bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 text-white shadow-sm'
                        : dayEvents.length > 0
                          ? 'text-[var(--color-primary)] bg-white/60 border border-[var(--color-primary)]/10 shadow-[0_1px_3px_rgba(23,12,121,0.05)]'
                          : 'text-slate-500'
                        }`}
                    >
                      {i + 1}
                    </span>
                  </div>

                  {/* Event list inside cell */}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[70px] pr-0.5 scrollbar-thin">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate && onSelectDate(date);
                          setSelectedEventDetail(event);
                        }}
                        className={`text-[10px] font-black truncate px-2 py-1 rounded-lg border text-left flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${getPillColor(event.type)}`}
                        title={event.title}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                        <span className="shrink-0 text-[9px] opacity-75">{event.time}</span>
                        <span className="truncate">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ================= MOBILE RESPONSIVE CALENDAR LIST ================= */}
      <div className="md:hidden space-y-4">
        {mobileDaysWithEvents.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4 rounded-3xl border border-dashed border-indigo-100/40 bg-gradient-to-br from-slate-50/50 to-indigo-50/20">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <CalendarIcon className="w-6 h-6 text-indigo-300 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-600">Tidak ada jadwal bulan ini.</p>
            <p className="text-xs text-slate-400 mt-1">Nantikan pengumuman acara selanjutnya untuk bulan ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mobileDaysWithEvents.map((dayObj, idx) => {
              const dayNum = dayObj.date.getDate();
              const dayStr = dayNames[dayObj.date.getDay()];

              return (
                <div
                  key={idx}
                  className="bg-white/80 border border-[var(--border-color)] rounded-2xl p-4 shadow-sm text-left flex gap-4 items-start"
                >
                  {/* Left Date indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-12 py-1.5 bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100/30 rounded-xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">{dayStr.substring(0, 3)}</span>
                    <span className="text-xl font-black text-[var(--color-primary)] leading-none">{dayNum}</span>
                  </div>

                  {/* Right Event details */}
                  <div className="flex-grow space-y-3.5">
                    {dayObj.events.map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate && onSelectDate(dayObj.date);
                          setSelectedEventDetail(event);
                        }}
                        className="w-full text-left group flex gap-3 focus-visible:outline-none"
                      >
                        {/* Event thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                          {event.thumbnail ? (
                            <img
                              src={event.thumbnail.src || event.thumbnail}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#170C79] to-indigo-700 flex items-center justify-center text-cyan-300">
                              <CalendarIcon className="w-4 h-4 opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Text detail */}
                        <div className="flex-grow min-w-0 py-0.5 flex flex-col justify-between">
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black text-slate-400">
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] ${getPillColor(event.type)}`}>
                              {event.type}
                            </span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-500" />{event.time}</span>
                          </div>
                          <h4 className="text-xs font-black text-[var(--color-primary)] group-hover:text-cyan-600 transition-colors duration-200 line-clamp-2">{event.title}</h4>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CALENDAR LEGEND ================= */}
      <div className="mt-6 border-t border-indigo-100/30 pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-black text-slate-500">
        <span className="text-[10px] text-slate-800">Keterangan Warna:</span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-450 border border-rose-300" />
          <span>Theater</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-450 border border-cyan-300" />
          <span>Video Call</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-450 border border-amber-300" />
          <span>Birthday</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-450 border border-indigo-300" />
          <span>Streaming Live</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-purple-450 border border-purple-300" />
          <span>Lainnya / Multiple</span>
        </span>
      </div>

      {/* ================= MODAL DETAIL POPOVER ================= */}
      <AnimatePresence>
        {selectedEventDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Backdrop Dismiss */}
            <div className="absolute inset-0" onClick={() => setSelectedEventDetail(null)} />

            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
              className="bg-white border border-[var(--border-color)] overflow-hidden rounded-[2rem] max-w-sm w-full shadow-2xl relative z-10 text-left flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEventDetail(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 shadow-md cursor-pointer border border-white/10"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Event Poster / Thumbnail */}
              <div className="w-full aspect-video bg-black/20 border-b border-[var(--border-color)] relative">
                {selectedEventDetail.thumbnail ? (
                  <img
                    src={(selectedEventDetail.thumbnail)?.src || (selectedEventDetail.thumbnail)}
                    alt={`Poster ${selectedEventDetail.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#170C79] via-[#1e1494] to-[#2d1f8f] flex flex-col items-center justify-center p-4 text-center select-none relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />
                    <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-cyan-300 mb-2 backdrop-blur-sm">
                      <Sparkles className="h-6 w-6 text-cyan-300" />
                    </div>
                  </div>
                )}

                {/* Platform Badge absolute */}
                <span className={`absolute bottom-3 left-3 px-3 py-1.5 text-[9px] uppercase font-black rounded-lg backdrop-blur-md bg-white/95 text-[var(--color-primary)] border border-indigo-100`}>
                  {selectedEventDetail.type}
                </span>
              </div>

              {/* Event Details Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  {/* Duration & Time detail */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      {selectedEventDetail.time}
                    </span>
                    {selectedEventDetail.duration && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        ± {selectedEventDetail.duration}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-[var(--color-primary)] leading-snug">
                    {selectedEventDetail.title}
                  </h4>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
                    {selectedEventDetail.location}
                  </p>
                </div>

                {/* Event Actions */}
                <div className="pt-2">
                  {selectedEventDetail.link ? (
                    <a
                      href={selectedEventDetail.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-block"
                    >
                      <Button
                        variant="glow"
                        size="md"
                        className="w-full font-black flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(23,12,121,0.2)]"
                      >
                        {['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(selectedEventDetail.type) ? (
                          <>
                            <PlayCircle className="w-4.5 h-4.5" /> Tonton Live Streaming
                          </>
                        ) : (
                          <>
                            Buka Detail Acara <ArrowRight className="w-4.5 h-4.5" />
                          </>
                        )}
                      </Button>
                    </a>
                  ) : (
                    <div className="text-center py-2.5 text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl bg-slate-50/50 select-none">
                      Detail internal belum tersedia
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
