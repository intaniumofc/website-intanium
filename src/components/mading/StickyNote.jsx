import React from 'react';
import Card from '../common/Card';
import { MADING_COLOR_THEMES } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';

export default function StickyNote({ note, className = '', onDelete }) {
  const { name, message, themeColor, createdAt, isAdmin } = note;

  // Retrieve styling attributes based on notes styling map
  const activeColorTheme =
    MADING_COLOR_THEMES.find((theme) => theme.id === themeColor) || MADING_COLOR_THEMES[0];

  return (
    <Card
      hoverEffect={true}
      padding="compact"
      className={`border border-solid transform hover:rotate-1 hover:scale-102 transition-all duration-300 relative flex flex-col justify-between min-h-[160px] shadow-md ${
        activeColorTheme.bgClass
      } ${
        isAdmin ? 'border-purple-500 border-2 shadow-[var(--neon-glow-primary)]' : ''
      } ${className}`}
    >
      {/* Admin Badge */}
      {isAdmin && (
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] uppercase tracking-widest font-extrabold rounded-full bg-purple-600 text-white shadow-sm">
          ADMIN
        </span>
      )}

      {/* Message Body */}
      <div className="flex-grow pr-4">
        <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
          {message}
        </p>
      </div>

      {/* Note metadata */}
      <div className="mt-4 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] opacity-75">
        <span className="font-bold truncate max-w-[120px]">{name || 'Anonim'}</span>
        <span>{createdAt ? formatDate(createdAt, { day: 'numeric', month: 'short' }) : 'Baru'}</span>
      </div>

      {/* Delete trigger for admin moderation */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute bottom-2 right-2 text-red-500 hover:text-red-700 hover:bg-black/5 p-1 rounded transition-all cursor-pointer text-xs"
          title="Hapus Mading (Admin)"
        >
          ✕
        </button>
      )}
    </Card>
  );
}
