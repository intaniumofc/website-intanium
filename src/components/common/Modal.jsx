'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal overlay component with solid container and clean design.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm | md | lg | xl | 2xl | 3xl
  className = '',
}) {
  // Lock body scroll when modal is active
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
    '2xl': 'max-w-5xl',
    '3xl': 'max-w-6xl',
  };

  return (
    <div className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Centering Wrapper */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 text-left cursor-pointer"
        onClick={(e) => {
          // Close modal if user clicks on the wrapper (outside the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Modal Container */}
        <div
          className={`relative w-full max-h-[90vh] flex flex-col cursor-default rounded-3xl shadow-2xl border border-[var(--border-color)] bg-white animate-modal-scale-in ${sizeClasses[size]} ${className}`}
        >
          {/* Header */}
          <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-white rounded-t-3xl z-10">
            <h3 className="text-lg font-extrabold text-[var(--color-primary)]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100/80 cursor-pointer"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain px-6 py-6 rounded-b-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
