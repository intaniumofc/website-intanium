import React from 'react';

/**
 * Reusable and customizable premium Button component with micro-animations.
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
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform active:scale-95';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variantStyles = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md hover:shadow-[var(--neon-glow-primary)]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--color-secondary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] shadow-sm hover:shadow-[var(--neon-glow-secondary)]',
    outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--border-color)] bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-red-600/30',
    glow: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg border border-purple-400/25 hover:brightness-110 shadow-purple-500/20 hover:shadow-purple-500/40 text-neon-glow',
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
