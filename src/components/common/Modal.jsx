import React, { useEffect } from 'react';
import Card from './Card';
import Button from './Button';

/**
 * Reusable modal overlay component using glassmorphic backdrops.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm | md | lg | xl
  className = '',
}) {
  // Prevent scrolling under the active modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <Card
        hoverEffect={false}
        padding="none"
        className={`relative z-10 w-full rounded-2xl shadow-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden animate-fade-in ${sizeClasses[size]} ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--color-primary-hover)] transition-colors p-1.5 rounded-lg hover:bg-[var(--border-color)]"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </Card>
    </div>
  );
}
