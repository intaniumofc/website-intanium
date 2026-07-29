'use client';

import React from 'react';

/**
 * Premium Floating Card component aligned with IRIS Design System.
 * Background #FFFFFF, Border rgba(0,0,0,.05), Shadow 0 8px 32px rgba(15,23,42,.04), Hover translateY(-4px).
 */
export default function Card({
  children,
  className = '',
  hoverEffect = true,
  padding = 'normal', // none | compact | normal | loose
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    compact: 'p-4',
    normal: 'p-6',
    loose: 'p-8',
  };

  const cardClasses = `bg-[var(--color-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] rounded-2xl ${
    hoverEffect ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-pink-tint-25)] transition-all duration-250 ease-out' : ''
  }`;

  return (
    <div
      className={`${cardClasses} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
