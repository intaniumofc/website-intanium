'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XOctagon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const alertToastVariants = cva(
  'relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-xl flex items-start p-4 gap-3 backdrop-blur-md',
  {
    variants: {
      variant: {
        success: '',
        warning: '',
        info: '',
        error: '',
      },
      styleVariant: {
        default: 'bg-white/95',
        filled: 'border-transparent',
      },
    },
    compoundVariants: [
      {
        variant: 'success',
        styleVariant: 'default',
        className: 'text-emerald-950 border-emerald-200',
      },
      {
        variant: 'warning',
        styleVariant: 'default',
        className: 'text-amber-950 border-amber-200',
      },
      {
        variant: 'info',
        styleVariant: 'default',
        className: 'text-slate-950 border-blue-200',
      },
      {
        variant: 'error',
        styleVariant: 'default',
        className: 'text-red-950 border-red-200',
      },
      {
        variant: 'success',
        styleVariant: 'filled',
        className: 'bg-[var(--color-success)] text-white',
      },
      {
        variant: 'warning',
        styleVariant: 'filled',
        className: 'bg-[var(--color-warning)] text-white',
      },
      {
        variant: 'info',
        styleVariant: 'filled',
        className: 'bg-[var(--color-primary)] text-white',
      },
      {
        variant: 'error',
        styleVariant: 'filled',
        className: 'bg-[var(--color-danger)] text-white',
      },
    ],
    defaultVariants: {
      variant: 'info',
      styleVariant: 'default',
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

const iconColorClasses = {
  default: {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-[var(--color-primary)]',
    error: 'text-red-500',
  },
  filled: {
    success: 'text-white',
    warning: 'text-white',
    info: 'text-white',
    error: 'text-white',
  },
};

const toastAccentClasses = {
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  info: 'bg-[var(--color-primary)]',
  error: 'bg-[var(--color-danger)]',
};

const AlertToast = React.forwardRef(
  (
    {
      className,
      variant = 'info',
      styleVariant = 'default',
      title,
      description,
      onClose,
      ...props
    },
    ref
  ) => {
    const normalizedVariant = variant || 'info';
    const normalizedStyleVariant = styleVariant || 'default';
    const Icon = iconMap[normalizedVariant] || Info;

    return (
      <motion.div
        ref={ref}
        role="alert"
        layout
        initial={{ opacity: 0, x: 48, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 48, scale: 0.96 }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 28,
        }}
        className={cn(
          alertToastVariants({
            variant: normalizedVariant,
            styleVariant: normalizedStyleVariant,
          }),
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            toastAccentClasses[normalizedVariant]
          )}
        />

        <div className="flex-shrink-0 pt-0.5">
          <Icon
            className={cn(
              'h-5 w-5',
              iconColorClasses[normalizedStyleVariant][normalizedVariant]
            )}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-5">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed opacity-85">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className={cn(
            'flex-shrink-0 rounded-full p-1 opacity-70 transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
            normalizedStyleVariant === 'default'
              ? 'text-slate-500 hover:bg-slate-100 focus:ring-[var(--color-primary)]'
              : 'text-white hover:bg-black/15 focus:ring-white'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }
);

AlertToast.displayName = 'AlertToast';

export { AlertToast };
