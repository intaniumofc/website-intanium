'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import MapFilters from './MapFilters';
import PerformanceModal from './PerformanceModal';
import { MapPin, Mic, Star, Compass, Calendar, Building, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Dynamic import Leaflet Map component with ssr: false
const PerformanceMap = dynamic(() => import('./PerformanceMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] sm:h-[620px] rounded-3xl bg-slate-100 border border-pink-500/20 flex flex-col items-center justify-center gap-3 animate-pulse shadow-xl">
      <div className="w-12 h-12 rounded-full bg-pink-100 text-[#D83584] flex items-center justify-center animate-bounce">
        <Compass className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-600">
        Memuat Peta Indonesia Interaktif...
      </p>
    </div>
  ),
});

export default function PerformanceMapSection({ initialLocations = [] }) {
  const [activeType, setActiveType] = useState('all');
  const [activeYear, setActiveYear] = useState('all');
  const [activeCity, setActiveCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map'

  // Extract available unique years from dataset
  const availableYears = useMemo(() => {
    const years = new Set();
    initialLocations.forEach((loc) => {
      if (loc.event_date) {
        const yr = new Date(loc.event_date).getFullYear().toString();
        if (yr && !isNaN(yr)) years.add(yr);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [initialLocations]);

  // Extract available unique cities from dataset
  const availableCities = useMemo(() => {
    const cities = new Set();
    initialLocations.forEach((loc) => {
      if (loc.city) cities.add(loc.city);
    });
    return Array.from(cities).sort();
  }, [initialLocations]);

  // Overall Statistics
  const onairCount = useMemo(
    () => initialLocations.filter((loc) => loc.type === 'onair').length,
    [initialLocations]
  );
  const offairCount = useMemo(
    () => initialLocations.filter((loc) => loc.type === 'offair').length,
    [initialLocations]
  );

  // Filter dataset based on active user filters
  const filteredLocations = useMemo(() => {
    return initialLocations.filter((loc) => {
      // 1. Type Filter
      if (activeType !== 'all' && loc.type !== activeType) return false;

      // 2. Year Filter
      if (activeYear !== 'all') {
        const locYear = new Date(loc.event_date).getFullYear().toString();
        if (locYear !== activeYear) return false;
      }

      // 3. City Filter
      if (activeCity !== 'all' && loc.city !== activeCity) return false;

      // 4. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = loc.title?.toLowerCase().includes(query);
        const venueMatch = loc.venue_name?.toLowerCase().includes(query);
        const cityMatch = loc.city?.toLowerCase().includes(query);
        const provinceMatch = loc.province?.toLowerCase().includes(query);
        return titleMatch || venueMatch || cityMatch || provinceMatch;
      }

      return true;
    });
  }, [initialLocations, activeType, activeYear, activeCity, searchQuery]);

  const handleSelectLocation = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="relative w-full py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] leading-tight">
            Peta Jejak Penampilan <br />
            <span className="bg-gradient-to-r from-[#FF5FB2] via-[#A855F7] to-[#72C4FF] bg-clip-text text-transparent">
              Nur Intan JKT48
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed">
            Eksplorasi seluruh titik panggung pertunjukan theater (<strong className="text-[#2E7BC4] font-black">On-Air</strong>) serta kemunculan event dan konser outdoor (<strong className="text-[#D83584] font-black">Off-Air</strong>) Nur Intan di berbagai kota seluruh Indonesia.
          </p>

          {/* Counter Cards */}
          <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {initialLocations.length}
              </div>
              <div className="text-[11px] font-extrabold text-slate-600">Total Event</div>
            </div>

            <div className="bg-[#F0F7FF] p-3.5 rounded-2xl border border-[#BDE0FE] shadow-md text-center">
              <div className="text-xl sm:text-2xl font-black text-[#2E7BC4]">
                {onairCount}
              </div>
              <div className="text-[11px] font-extrabold text-[#2E7BC4] flex items-center justify-center gap-1">
                <Mic className="w-3 h-3" /> On-Air Show
              </div>
            </div>

            <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 shadow-md text-center">
              <div className="text-xl sm:text-2xl font-black text-[#D83584]">
                {offairCount}
              </div>
              <div className="text-[11px] font-extrabold text-[#D83584] flex items-center justify-center gap-1">
                <Star className="w-3 h-3" /> Off-Air Stage
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls & View Mode Switcher in Single Unified Bar */}
        <MapFilters
          activeType={activeType}
          onTypeChange={setActiveType}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          availableYears={availableYears}
          activeCity={activeCity}
          onCityChange={setActiveCity}
          availableCities={availableCities}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredCount={filteredLocations.length}
          totalCount={initialLocations.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Main Map View Area */}
        <div className="relative">
          {filteredLocations.length === 0 ? (
            <div className="w-full h-[450px] rounded-3xl bg-white border border-pink-200 flex flex-col items-center justify-center gap-3 text-center p-6 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-pink-100 text-[#D83584] flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Tidak ada titik penampilan ditemukan
              </h3>
              <p className="text-xs text-slate-600 max-w-md font-medium">
                Coba ubah kata kunci pencarian atau reset filter untuk melihat kembali lokasi penampilan Nur Intan.
              </p>
              <button
                onClick={() => {
                  setActiveType('all');
                  setActiveYear('all');
                  setActiveCity('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white font-extrabold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition-opacity"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : viewMode === 'split' ? (
            /* Split View Layout: Left Map, Right Interactive Cards Panel */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[640px]">
              {/* Map Column */}
              <div className="lg:col-span-8 h-[450px] sm:h-[550px] lg:h-full rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <PerformanceMap
                  locations={filteredLocations}
                  totalLocations={filteredLocations.length}
                  onairCount={filteredLocations.filter((l) => l.type === 'onair').length}
                  offairCount={filteredLocations.filter((l) => l.type === 'offair').length}
                  selectedLocation={selectedLocation}
                  selectedLocationId={selectedLocation?.id}
                  onSelectLocation={handleSelectLocation}
                />
              </div>

              {/* Location Cards Side Panel */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xl flex flex-col h-[480px] lg:h-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D83584]" /> Daftar Event ({filteredLocations.length})
                  </h3>
                  <span className="text-[11px] font-extrabold text-[#D83584]">
                    Klik lokasi untuk melacak
                  </span>
                </div>

                {/* Location Cards List */}
                <div className="mt-3 space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                  {filteredLocations.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    const isOnair = loc.type === 'onair';

                    return (
                      <div
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center group ${
                          isSelected
                            ? 'bg-pink-50 border-2 border-[#D83584] shadow-md ring-2 ring-[#FF5FB2]/20'
                            : 'bg-slate-50 border-slate-200 hover:border-pink-300 hover:bg-pink-50/50'
                        }`}
                      >
                        {/* Thumbnail preview */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200">
                          {loc.photo_url ? (
                            <Image
                              src={loc.photo_url}
                              alt={loc.title}
                              fill
                              sizes="60px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#FF5FB2] to-[#A855F7] flex items-center justify-center">
                              {isOnair ? <Mic className="w-5 h-5 text-white" /> : <Star className="w-5 h-5 text-white" />}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isOnair
                                  ? 'bg-blue-100 text-[#2E7BC4] border border-blue-300'
                                  : 'bg-pink-100 text-[#D83584] border border-pink-300'
                              }`}
                            >
                              {isOnair ? 'On-Air' : 'Off-Air'}
                            </span>
                            <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" /> {formatDateShort(loc.event_date)}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-[#D83584] transition-colors">
                            {loc.title}
                          </h4>

                          <div className="text-[11px] text-slate-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-[#2E7BC4] shrink-0" />
                            <span>{loc.venue_name || loc.city}</span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D83584] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Map Only Layout */
            <div className="w-full h-[520px] sm:h-[620px]">
              <PerformanceMap
                locations={filteredLocations}
                totalLocations={filteredLocations.length}
                onairCount={filteredLocations.filter((l) => l.type === 'onair').length}
                offairCount={filteredLocations.filter((l) => l.type === 'offair').length}
                selectedLocation={selectedLocation}
                selectedLocationId={selectedLocation?.id}
                onSelectLocation={handleSelectLocation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Performance Modal Popup */}
      <PerformanceModal
        location={selectedLocation}
        onClose={handleCloseModal}
      />
    </section>
  );
}
