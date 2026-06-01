import React from 'react';
import Card from '../common/Card';

export default function ScheduleFilter({
  activeFilter,
  onFilterChange,
  activePlatform,
  onPlatformChange,
  className = '',
}) {
  const statusFilters = [
    { id: 'all', name: 'Semua Aktivitas' },
    { id: 'live', name: '● Live Sekarang' },
    { id: 'upcoming', name: 'Akan Datang' },
    { id: 'completed', name: 'Selesai' },
  ];

  const platforms = ['All', 'YouTube', 'Twitch', 'TikTok', 'Discord'];

  return (
    <Card hoverEffect={false} padding="compact" className={`border border-[var(--border-color)] space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status filtering buttons */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {filter.name}
              </button>
            );
          })}
        </div>

        {/* Platform select dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Platform:
          </span>
          <div className="relative">
            <select
              value={activePlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none cursor-pointer pr-8 appearance-none"
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === 'All' ? 'Semua Platform' : platform}
                </option>
              ))}
            </select>
            {/* Custom dropdown caret */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
              ▼
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
