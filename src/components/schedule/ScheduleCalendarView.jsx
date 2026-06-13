import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ArrowRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

export default function ScheduleCalendarView({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date) => isSameDate(date, new Date());

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const upcomingEvents = calendarEvents.filter(e => e.date !== selectedDateStr).slice(0, selectedEvents.length <= 1 ? 3 : 0);

  const getDotColor = (type) => {
    if (type === 'Show Theater') return 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]';
    if (type === 'Video Call') return 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]';
    if (type === 'Birthday') return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) return 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]';
    return 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]';
  };

  const getTypeStyle = (type) => {
    if (type === 'Show Theater') return 'bg-rose-50 text-rose-600 border-rose-200/50';
    if (type === 'Video Call') return 'bg-cyan-50 text-cyan-700 border-cyan-200/50';
    if (type === 'Birthday') return 'bg-amber-50 text-amber-700 border-amber-200/50';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    return 'bg-purple-50 text-purple-700 border-purple-200/50';
  };

  const categoryLegend = [
    { label: 'Theater', color: 'bg-rose-500' },
    { label: 'Video Call', color: 'bg-cyan-500' },
    { label: 'Birthday', color: 'bg-amber-500' },
    { label: 'Live/Other', color: 'bg-indigo-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: PREMIUM_EASE }}
      className="relative overflow-visible rounded-[2rem] border border-[var(--border-color)] bg-white/70 p-4 shadow-[0_8px_32px_rgba(23,12,121,0.06)] backdrop-blur-xl sm:p-5 lg:p-6"
    >
      {/* Decorative inner glow blobs */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-indigo-400/8 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-pink-500/6 blur-[80px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-cyan-400/5 blur-[60px]" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[320px_1fr] justify-between gap-6 lg:gap-8 items-start">
        {/* Left Panel: Mini Calendar */}
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-indigo-100/30 shadow-[0_4px_20px_rgba(23,12,121,0.04)] mx-auto w-full max-w-sm lg:max-w-none">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-black text-[var(--color-primary)] font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="p-2 hover:bg-indigo-50 rounded-xl transition-all duration-300 cursor-pointer text-slate-400 hover:text-[var(--color-primary)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]" aria-label="Bulan sebelumnya">
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-indigo-50 rounded-xl transition-all duration-300 cursor-pointer text-slate-400 hover:text-[var(--color-primary)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]" aria-label="Bulan berikutnya">
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 mb-2.5 text-center border-b border-indigo-100/30 pb-2.5">
            {dayNames.map(day => (
              <div key={day} className={`text-[9px] font-black uppercase tracking-[0.12em] ${day === 'Min' || day === 'Sab' ? 'text-rose-400' : 'text-slate-400'}`}>{day}</div>
            ))}
          </div>

          {/* Grid Days with sliding transition */}
          <div className="relative overflow-hidden min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                initial={{ opacity: 0, x: slideDir * 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDir * -25 }}
                transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                className="grid grid-cols-7 gap-y-1.5 gap-x-0.5"
              >
                {/* Empty slots before day 1 */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9"></div>
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                  const isSelected = isSameDate(date, selectedDate);
                  const todayMark = isToday(date);
                  const dayEvents = getEventsForDate(date);
                  const dayOfWeek = date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div key={i} className="flex flex-col items-center justify-center">
                      <button
                        onClick={() => setSelectedDate(date)}
                        aria-label={`Pilih tanggal ${i + 1} ${monthNames[currentDate.getMonth()]}`}
                        aria-pressed={isSelected}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-[12px] font-black transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] relative ${isSelected
                            ? 'bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 text-white shadow-[0_4px_14px_rgba(23,12,121,0.35)] scale-110'
                            : todayMark
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
                            : isWeekend
                            ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-[var(--color-primary)]'
                          }`}
                      >
                        {i + 1}
                      </button>
                      {/* Subtle Event Dot Indicators */}
                      <div className="flex gap-0.5 mt-1 h-1.5 items-center justify-center">
                        {dayEvents.length > 0 && [...new Set(dayEvents.map(e => e.type))].map((type, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getDotColor(type)} transition-all duration-300`}></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 border-t border-indigo-100/30 pt-3.5">
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">
              {categoryLegend.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Details */}
        <div className="flex flex-col h-full rounded-3xl border border-indigo-100/30 bg-white/95 p-5 shadow-[0_4px_20px_rgba(23,12,121,0.04)]">
          <div className="mb-5 border-b border-indigo-100/30 pb-4 text-left">
            <h3 className="text-xl sm:text-2xl font-black text-[var(--color-primary)] font-heading flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 flex items-center justify-center shadow-[0_4px_12px_rgba(23,12,121,0.2)]">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <span>{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 font-bold">
              {selectedEvents.length > 0 ? `Ada ${selectedEvents.length} aktivitas di tanggal ini` : 'Belum ada jadwal terkonfirmasi'}
            </p>
          </div>

          <div className="space-y-3 min-h-[200px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDateStr}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                className="space-y-3"
              >
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: PREMIUM_EASE, delay: idx * 0.08 }}
                      className="group p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-indigo-100/50 hover:shadow-[0_4px_20px_rgba(23,12,121,0.06)] transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-left"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.75 text-[9px] font-black uppercase tracking-[0.12em] rounded-full border ${getTypeStyle(event.type)}`}>
                            {event.type}
                          </span>
                          <span className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-500" />
                            {event.time}
                          </span>
                        </div>
                        <h4 className="text-[15px] font-black text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors duration-300 leading-tight">{event.title}</h4>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          {event.location}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                        {event.link ? (
                          <>
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 text-white hover:from-indigo-700 hover:to-[var(--color-primary)] rounded-xl text-xs font-black transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_14px_rgba(23,12,121,0.2)] hover:shadow-[0_6px_18px_rgba(23,12,121,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                            >
                              {['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(event.type) ? 'Tonton Live' : 'Buka Detail'} <ArrowRight className="w-3 h-3" />
                            </a>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold px-2.5 py-1 bg-slate-100/50 rounded-lg border border-slate-100 select-none">Jadwal Internal</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-14 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-indigo-100/40 bg-gradient-to-br from-slate-50/50 to-indigo-50/20">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                      <CalendarIcon className="w-7 h-7 text-indigo-300 animate-pulse" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Tidak ada jadwal untuk hari ini.</p>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">Pilih tanggal lain yang memiliki penanda titik, atau nantikan pengumuman acara selanjutnya.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Upcoming Mini List if <= 1 event */}
          {upcomingEvents.length > 0 && selectedEvents.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: PREMIUM_EASE, delay: 0.2 }}
              className="mt-6 pt-5 border-t border-indigo-100/30 text-left"
            >
              <h4 className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase mb-3">Agenda Terdekat</h4>
              <div className="space-y-2.5">
                {upcomingEvents.map((evt, idx) => {
                  const day = evt.date.split('-')[2];
                  const monthIdx = parseInt(evt.date.split('-')[1]) - 1;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: PREMIUM_EASE, delay: 0.3 + idx * 0.08 }}
                      onClick={() => setSelectedDate(new Date(evt.date))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDate(new Date(evt.date));
                        }
                      }}
                      aria-label={`Lihat jadwal tanggal ${day} ${monthNames[monthIdx]}: ${evt.title}`}
                      className="w-full text-left flex items-center justify-between group cursor-pointer bg-slate-50/30 hover:bg-white p-3.5 rounded-2xl border border-transparent hover:border-indigo-100/30 hover:shadow-[0_4px_16px_rgba(23,12,121,0.05)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-[var(--color-primary)] group-hover:bg-gradient-to-br group-hover:from-[var(--color-primary)] group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 group-hover:shadow-[0_4px_12px_rgba(23,12,121,0.2)]">
                          <span className="text-[10px] font-black leading-none">{day}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider">{monthNames[monthIdx].substring(0, 3)}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-black text-slate-700 group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-1">{evt.title}</h5>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5 text-cyan-500 shrink-0" />{evt.time} - {evt.location}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
