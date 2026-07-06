'use client';

import React from 'react';
import AchievementCard from './AchievementCard';

export default function Timeline({ achievements = [], className = '' }) {
  if (achievements.length === 0) return null;

  return (
    <div className={`relative max-w-2xl mx-auto py-8 ${className}`}>
      {/* Central line bar */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border-color)] pointer-events-none" />

      <div className="space-y-8 relative">
        {achievements.map((item, idx) => (
          <div key={item.id || idx} className="relative pl-12 sm:pl-16">
            {/* Dot Node Indicator */}
            <div className="absolute left-4 top-5 w-4.5 h-4.5 rounded-full bg-[var(--bg-primary)] border-4 border-[var(--color-primary)] flex-shrink-0 z-10 shadow-[0_0_10px_rgba(139,92,246,0.5)] transform -translate-x-1/2" />

            <AchievementCard achievement={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
