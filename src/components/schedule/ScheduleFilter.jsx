'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function ScheduleFilter({
  activePlatform,
  onPlatformChange,
  className = '',
}) {
  const platforms = ['All', 'Show Theater', 'Video Call', 'Birthday', 'Other Events'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`w-full lg:w-auto backdrop-blur-xl bg-white/65 border border-[var(--border-color)] p-2.5 rounded-2xl shadow-[0_4px_24px_rgba(23,12,121,0.06)] flex items-center gap-3 relative z-10 ${className}`}
    >
      {/* Category select dropdown */}
      <div className="flex items-center gap-3 px-3.5 py-2 bg-white/60 border border-indigo-100/30 rounded-xl w-full lg:w-auto transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-sm group">
        <label 
          htmlFor="schedule-category-select"
          className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] cursor-pointer select-none whitespace-nowrap"
        >
          Kategori
        </label>
        <div className="relative flex items-center flex-1">
          <select
            id="schedule-category-select"
            value={activePlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            aria-label="Filter berdasarkan kategori kegiatan"
            className="w-full bg-transparent border-none py-0.5 pl-1.5 pr-7 text-sm font-black text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-white rounded-lg cursor-pointer appearance-none relative z-10"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform} className="font-bold bg-white text-slate-800">
                {platform === 'All' ? 'Semua Kategori' : platform}
              </option>
            ))}
          </select>
          {/* Custom animated dropdown caret */}
          <div className="pointer-events-none absolute right-0 flex items-center text-[var(--color-primary)] transition-transform duration-300 group-hover:translate-y-0.5">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
