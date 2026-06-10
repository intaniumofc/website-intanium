import React, { useState, useEffect } from 'react';
import { scheduleService } from './scheduleService';
import PageHeader from '../../components/layout/PageHeader';
import ScheduleFilter from '../../components/schedule/ScheduleFilter';
import ScheduleCard from '../../components/schedule/ScheduleCard';
import ScheduleCalendarView from '../../components/schedule/ScheduleCalendarView';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, CalendarDays, List } from 'lucide-react';

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePlatform, setActivePlatform] = useState('All');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    setIsLoading(true);
    scheduleService.getEvents(activeFilter, activePlatform)
      .then((data) => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [activeFilter, activePlatform]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Schedule & Kegiatan"
        subtitle="Pantau kalender jadwal teater, video call, birthday, dan event Nur Intan agar Anda tidak ketinggalan momen seru."
      />

      {/* View Toggle & Interactive Filters Panel */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <ScheduleFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activePlatform={activePlatform}
          onPlatformChange={setActivePlatform}
        />

        <div className="flex items-center bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-[var(--border-color)] shadow-sm w-full lg:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-slate-500 hover:text-[var(--color-primary)] hover:bg-white'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-slate-500 hover:text-[var(--color-primary)] hover:bg-white'}`}
          >
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* View layout */}
      {isLoading ? (
        <Loading message="Memuat schedule..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="Tidak Ada Jadwal Aktivitas"
          description="Saat ini belum ada jadwal yang terdaftar untuk filter ini. Coba ganti filter status atau kategori lainnya."
          icon={Calendar}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {events.map((event) => (
            <ScheduleCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <ScheduleCalendarView events={events} />
      )}
    </div>
  );
}
