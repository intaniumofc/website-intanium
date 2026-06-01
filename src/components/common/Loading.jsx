import React from 'react';

/**
 * Reusable full-screen or card loading placeholder with custom neon spinners.
 */
export default function Loading({
  fullPage = false,
  message = 'Memuat...',
  className = '',
}) {
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-primary-light)] rounded-full" />
        {/* Inner animated spinning arc */}
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[var(--color-primary)] border-r-[var(--color-secondary)] rounded-full animate-spin border-neon-glow" />
      </div>
      {message && (
        <span className="mt-4 text-sm font-medium tracking-wide text-[var(--color-primary-hover)] animate-pulse">
          {message}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
        {spinner}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {spinner}
    </div>
  );
}
