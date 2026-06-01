import React from 'react';

/**
 * Premium Page Header banner featuring neon glassmorphic backdrops and sleek animated glows.
 */
export default function PageHeader({
  title,
  subtitle,
  centered = true,
  action,
  className = '',
}) {
  return (
    <div className={`relative overflow-hidden py-12 px-6 sm:px-12 glass-panel rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-secondary)]/50 to-[var(--color-primary-light)] mb-8 ${className}`}>
      {/* Decorative Blur Background Bubbles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-10 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-[var(--color-secondary)] opacity-10 rounded-full blur-[60px] -z-10" />

      <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${centered ? 'text-center md:text-left' : ''}`}>
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] text-neon-glow mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0 animate-fade-in">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
