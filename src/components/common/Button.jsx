'use client';

import React from 'react';

/**
 * Reusable and customizable premium Button component aligned to IRIS Design System.
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | danger | glow
  size = 'md', // sm | md | lg
  disabled = false,
  isLoading = false,
  className = '',
  icon,
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-pink)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:scale-[1.02] active:scale-95';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variantStyles = {
    // Primary CTA — 2-stop gradient per Section 5 (pink→peach, more readable on buttons)
    primary: 'bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white font-extrabold shadow-[0_4px_14px_rgba(255,95,178,0.35)] hover:brightness-105',
    // Secondary Button — White bg, pink border, pink text
    secondary: 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-pink)] hover:bg-[var(--color-pink-tint-8)] shadow-[var(--shadow-xs)]',
    // Neutral outline
    outline: 'border border-[var(--color-border)] text-[var(--color-heading)] hover:bg-[var(--color-bg-secondary)] bg-[var(--color-surface)]',
    // IRIS-toned danger
    danger: 'bg-[var(--color-error)] text-white hover:brightness-90 shadow-[0_4px_14px_rgba(239,68,68,0.3)]',
    // Solid pink accent with soft glow
    glow: 'bg-[var(--color-pink)] text-white shadow-[var(--shadow-pink-glow)] hover:bg-[var(--color-primary-hover)]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
