import React from 'react';
import Button from './Button';
import { FolderOpen } from 'lucide-react';

/**
 * Reusable clean empty state display for empty searches, lists, or filters.
 * Replaces default emojis with clean vector Lucide icons.
 */
export default function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Data yang Anda cari tidak ditemukan. Coba ubah pencarian atau filter Anda.',
  icon: Icon = FolderOpen,
  actionText,
  onActionClick,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 glass-panel rounded-xl max-w-md mx-auto ${className}`}>
      <div className="mb-4 text-[var(--color-primary)]">
        {typeof Icon === 'function' || typeof Icon === 'object' ? (
          <Icon className="h-12 w-12 text-[var(--color-primary)] opacity-85" />
        ) : (
          <span className="text-4xl">{Icon}</span>
        )}
      </div>
      <h3 className="text-base font-bold mb-2 text-[#170C79]">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button variant="secondary" size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
