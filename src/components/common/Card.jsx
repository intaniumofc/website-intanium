'use client';

import React from 'react';

/**
 * Reusable Card component implementing our premium glassmorphic system.
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

  return (
    <div
      className={`glass-panel rounded-xl ${
        hoverEffect ? 'glass-panel-hover' : ''
      } ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
