import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScheduleCalendarView({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const upcomingEvents = calendarEvents.filter(e => e.date !== selectedDateStr).slice(0, selectedEvents.length <= 1 ? 3 : 0);

  const getDotColor = (type) => {
    if (type === 'Show Theater') return 'bg-rose-400';
    if (type === 'Video Call') return 'bg-sky-400';
    if (type === 'Birthday') return 'bg-amber-400';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) return 'bg-indigo-400';
    return 'bg-purple-400';
  };

  const getTypeStyle = (type) => {
    if (type === 'Show Theater') return 'bg-rose-50 text-rose-600 border-rose-100';
    if (type === 'Video Call') return 'bg-sky-50 text-sky-600 border-sky-100';
    if (type === 'Birthday') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(type)) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
  };

  const categoryLegend = [
    { label: 'Theater', color: 'bg-rose-400' },
    { label: 'Video Call', color: 'bg-sky-400' },
    { label: 'Birthday', color: 'bg-amber-400' },
    { label: 'Live/Other', color: 'bg-indigo-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-[2rem] border border-(--border-color) bg-white/72 p-4 shadow-(--box-shadow-md) backdrop-blur-md sm:p-5 lg:p-6"
    >
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-(--color-primary-light)/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-[rgba(236,72,153,0.08)] blur-3xl" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[300px_1fr] justify-between gap-5 lg:gap-7 items-start">
        {/* Left Panel: Mini Calendar */}
        <div className="bg-[#fdfcf8]/95 p-4 rounded-3xl border border-(--border-color) shadow-(--box-shadow-sm) mx-auto w-full max-w-sm lg:max-w-none">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-(--color-primary) font-heading">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-(--color-primary)" aria-label="Bulan sebelumnya">
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-(--color-primary)" aria-label="Bulan berikutnya">
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 mb-1.5 text-center">
            {dayNames.map(day => (
              <div key={day} className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 gap-y-1.5 gap-x-0.5">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
              const isSelected = isSameDate(date, selectedDate);
              const dayEvents = getEventsForDate(date);

              return (
                <div key={i} className="flex flex-col items-center justify-center">
                  <button
                    onClick={() => setSelectedDate(date)}
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-full text-[12px] font-black transition-all duration-300 cursor-pointer ${isSelected
                        ? 'bg-(--color-primary) text-white shadow-md scale-105'
                        : 'text-slate-600 hover:bg-indigo-50 hover:text-(--color-primary)'
                      }`}
                  >
                    {i + 1}
                  </button>
                  {/* Subtle Event Dot Indicators */}
                  <div className="flex gap-0.5 mt-0.75 h-1.5 items-center justify-center">
                    {dayEvents.length > 0 && [...new Set(dayEvents.map(e => e.type))].map((type, idx) => (
                      <div key={idx} className={`w-1.25 h-1.25 rounded-full ${getDotColor(type)}`}></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-500">
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
        <div className="flex flex-col h-full rounded-3xl border border-(--border-color) bg-white/86 p-4 shadow-xs sm:p-5">
          <div className="mb-4 border-b border-(--border-color) pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-(--color-primary) font-heading">
              {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1 font-semibold">
              {selectedEvents.length > 0 ? `Ada ${selectedEvents.length} aktivitas di tanggal ini` : 'Belum ada jadwal terkonfirmasi'}
            </p>
          </div>

          <div className="space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event, idx) => (
                <div key={idx} className="group p-4 rounded-2xl border border-(--border-color) bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${getTypeStyle(event.type)}`}>
                        {event.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-black text-(--color-primary) group-hover:text-(--color-secondary) transition-colors leading-tight">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    {event.link ? (
                      <>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="self-start sm:self-auto px-4 py-2 bg-(--color-primary-light) text-(--color-primary) hover:bg-(--color-primary) hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
                          {['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitch'].includes(event.type) ? 'Buka Live' : 'Lihat Detail'} <ArrowRight className="w-3 h-3" />
                        </a>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-medium px-2 py-1 bg-slate-50 rounded-md border border-slate-100">Jadwal Internal</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-(--border-color) bg-slate-50/50">
                <CalendarIcon className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">Tidak ada jadwal untuk hari ini.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Pilih tanggal lain yang memiliki penanda titik, atau nantikan pengumuman acara selanjutnya.</p>
              </div>
            )}
          </div>

          {/* Upcoming Mini List if <= 1 event */}
          {upcomingEvents.length > 0 && selectedEvents.length <= 1 && (
            <div className="mt-6 pt-5 border-t border-(--border-color)">
              <h4 className="text-xs font-bold text-slate-400 tracking-widest mb-3">Upcoming</h4>
              <div className="space-y-2.5">
                {upcomingEvents.map((evt, idx) => {
                  const day = evt.date.split('-')[2];
                  const monthIdx = parseInt(evt.date.split('-')[1]) - 1;
                  return (
                    <div key={idx} onClick={() => setSelectedDate(new Date(evt.date))} className="flex items-center justify-between group cursor-pointer bg-white/45 hover:bg-white/75 p-3 rounded-xl border border-transparent hover:border-(--border-color) transition-all duration-300">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-(--color-primary)">
                          <span className="text-[10px] font-bold leading-none">{day}</span>
                          <span className="text-[8px] uppercase tracking-wider">{monthNames[monthIdx].substring(0, 3)}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-700 group-hover:text-(--color-primary) transition-colors line-clamp-1">{evt.title}</h5>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5 shrink-0" />{evt.time} - {evt.location}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-(--color-secondary) transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
