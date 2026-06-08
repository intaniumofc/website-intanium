import React, { useState, useEffect } from 'react';
import { scheduleService } from './scheduleService';
import PageHeader from '../../components/layout/PageHeader';
import ScheduleFilter from '../../components/schedule/ScheduleFilter';
import ScheduleCard from '../../components/schedule/ScheduleCard';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePlatform, setActivePlatform] = useState('All');

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

      {/* Interactive Filters Panel */}
      <ScheduleFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activePlatform={activePlatform}
        onPlatformChange={setActivePlatform}
      />

      {/* Calendar List layout */}
      {isLoading ? (
        <Loading message="Memuat schedule..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="Tidak Ada Jadwal Aktivitas"
          description="Saat ini belum ada jadwal yang terdaftar untuk filter ini. Coba ganti filter status atau kategori lainnya."
          icon={Calendar}
        />
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <ScheduleCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
