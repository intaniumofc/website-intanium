'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Reusable Card component implementing our premium glassmorphic system (public)
 * and flat clean panels (admin).
 */
export default function Card({
  children,
  className = '',
  hoverEffect = true,
  padding = 'normal', // none | compact | normal | loose
  ...props
}) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');

  const paddingStyles = {
    none: 'p-0',
    compact: 'p-4',
    normal: 'p-6',
    loose: 'p-8',
  };

  const cardClasses = isAdmin
    ? `bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl ${
        hoverEffect ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
      }`
    : `glass-panel rounded-xl ${
        hoverEffect ? 'glass-panel-hover' : ''
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
