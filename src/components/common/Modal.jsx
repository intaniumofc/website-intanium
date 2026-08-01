'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal overlay component with solid container and clean design.
 * Includes ARIA attributes, focus trap, and Escape key handling.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm | md | lg | xl | 2xl | 3xl
  className = '',
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = React.useId();

  // Focus trap and Escape key handling
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    if (focusableElements.length === 0) return;

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }, [onClose]);

  // Lock body scroll, manage focus trap, and return focus on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // Focus the first focusable element in the modal after mount
      requestAnimationFrame(() => {
        const modal = modalRef.current;
        if (modal) {
          const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
          const firstFocusable = modal.querySelector(focusableSelectors);
          if (firstFocusable) firstFocusable.focus();
        }
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
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
    <div className="relative z-[100]">
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
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          onKeyDown={handleKeyDown}
          className={`relative w-full max-h-[90vh] flex flex-col cursor-default rounded-3xl shadow-2xl border border-[var(--border-color)] bg-white animate-modal-scale-in ${sizeClasses[size]} ${className}`}
        >
          {/* Header */}
          <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-white rounded-t-3xl z-10">
            <h3 id={titleId} className="text-lg font-extrabold text-[var(--color-primary)]">
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
