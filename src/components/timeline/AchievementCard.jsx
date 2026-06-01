import React from 'react';
import Card from '../common/Card';
import { formatDate } from '../../lib/formatDate';
import { Trophy, BookOpen, ShoppingBag, Rocket, PartyPopper } from 'lucide-react';

export default function AchievementCard({ achievement, className = '' }) {
  const { title, description, date, category, icon } = achievement;

  const categoryBadgeColors = {
    Milestone: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
    Event: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    Release: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    Award: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };

  const iconMap = {
    '🥳': PartyPopper,
    '📖': BookOpen,
    '🛍️': ShoppingBag,
    '🚀': Rocket,
    '🏆': Trophy,
  };

  const IconComponent = iconMap[icon] || Trophy;

  return (
    <Card
      hoverEffect={true}
      className={`border border-[var(--border-color)] transition-all duration-300 relative flex items-start gap-4 p-5 ${className}`}
    >
      {/* Icon Badge circle */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)]/30 flex items-center justify-center flex-shrink-0 border border-purple-500/20 shadow-sm text-[var(--color-primary)]">
        <IconComponent className="h-6 w-6" />
      </div>

      <div className="flex-grow space-y-1">
        {/* Header metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-md ${categoryBadgeColors[category] || 'bg-gray-500/10 text-gray-400'}`}>
            {category}
          </span>
          <span className="font-semibold text-[var(--text-muted)]">
            {formatDate(date)}
          </span>
        </div>

        <h4 className="text-base font-bold text-[var(--text-primary)]">
          {title}
        </h4>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
