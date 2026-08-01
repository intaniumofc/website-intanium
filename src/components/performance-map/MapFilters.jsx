'use client';

import React from 'react';
import { Search, Calendar, MapPin, X, Filter, LayoutGrid, Map as MapIcon, SlidersHorizontal } from 'lucide-react';

export default function MapFilters({
  activeType,
  onTypeChange,
  activeYear,
  onYearChange,
  availableYears = [],
  activeCity = 'all',
  onCityChange,
  availableCities = [],
  searchQuery,
  onSearchChange,
  filteredCount,
  totalCount,
  viewMode,
  onViewModeChange,
}) {
  const hasActiveFilters =
    activeType !== 'all' || activeYear !== 'all' || activeCity !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-3.5 sm:p-4 space-y-3 transition-all">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Category Type Select Dropdown */}
          <div className="relative min-w-[140px] sm:min-w-[160px]">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#D83584] pointer-events-none" />
            <select
              value={activeType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white cursor-pointer appearance-none outline-none transition-all"
            >
              <option value="all">Semua Kategori ({totalCount})</option>
              <option value="onair">On-Air (Theater)</option>
              <option value="offair">Off-Air (Outdoor)</option>
            </select>
          </div>

          {/* City Dropdown Select */}
          {onCityChange && availableCities.length > 0 && (
            <div className="relative min-w-[130px] sm:min-w-[150px]">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2E7BC4] pointer-events-none" />
              <select
                value={activeCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white cursor-pointer appearance-none outline-none transition-all"
              >
                <option value="all">Semua Kota</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Select Dropdown */}
          <div className="relative min-w-[120px] sm:min-w-[140px]">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7C3ACD] pointer-events-none" />
            <select
              value={activeYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full pl-8 pr-7 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white cursor-pointer appearance-none outline-none transition-all"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expanded Search Box (Takes all remaining space!) */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari lokasi, venue, atau nama event pertunjukan..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View Mode Switcher Button Group */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-300 shrink-0 self-center">
            <button
              type="button"
              onClick={() => onViewModeChange('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-[#D83584] shadow-md border border-pink-200'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Split Panel
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#D83584] shadow-md border border-pink-200'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Peta Full
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Summary Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D83584]" />
            Menampilkan <strong className="text-[#D83584] font-extrabold">{filteredCount}</strong> dari {totalCount} titik penampilan
          </span>
          <button
            type="button"
            onClick={() => {
              onTypeChange('all');
              onYearChange('all');
              if (onCityChange) onCityChange('all');
              onSearchChange('');
            }}
            className="text-[#D83584] hover:text-[#B0236A] hover:underline font-extrabold transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}
