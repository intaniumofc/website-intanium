'use client';

import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertToast } from './AlertToast';
import { AdminToastContext } from './adminToastContext';

function normalizeToast(toast) {
  if (typeof toast === 'string') {
    return {
      title: 'Info',
      description: toast,
      variant: 'info',
      styleVariant: 'default',
    };
  }

  return {
    title: toast.title || 'Info',
    description: toast.description || '',
    variant: toast.variant || 'info',
    styleVariant: toast.styleVariant || 'default',
    duration: toast.duration,
  };
}

function classifyAlert(message) {
  const text = String(message || '');
  const lowerText = text.toLowerCase();

  if (lowerText.startsWith('gagal') || lowerText.includes('error')) {
    return {
      variant: 'error',
      title: 'Aksi gagal',
      description: text,
    };
  }

  if (
    lowerText.includes('harus') ||
    lowerText.includes('pilih') ||
    lowerText.includes('tidak valid') ||
    lowerText.includes('hanya diperbolehkan')
  ) {
    return {
      variant: 'warning',
      title: 'Periksa data',
      description: text,
    };
  }

  return {
    variant: 'info',
    title: 'Info',
    description: text,
  };
}

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const timersRef = React.useRef(new Map());

  const removeToast = React.useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    (input) => {
      const nextToast = normalizeToast(input);
      const id =
        window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const duration = nextToast.duration ?? 3600;

      setToasts((current) => [{ ...nextToast, id }, ...current].slice(0, 4));

      if (duration > 0) {
        const timer = window.setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    const originalAlert = window.alert;
    window.alert = (message) => {
      toast(classifyAlert(message));
    };

    return () => {
      window.alert = originalAlert;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [toast]);

  const value = React.useMemo(
    () => ({
      toast,
      success: (title, description, options = {}) =>
        toast({ title, description, variant: 'success', ...options }),
      warning: (title, description, options = {}) =>
        toast({ title, description, variant: 'warning', ...options }),
      info: (title, description, options = {}) =>
        toast({ title, description, variant: 'info', ...options }),
      error: (title, description, options = {}) =>
        toast({ title, description, variant: 'error', ...options }),
    }),
    [toast]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-24 z-[120] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <AlertToast
              key={item.id}
              {...item}
              onClose={() => removeToast(item.id)}
              className="pointer-events-auto"
            />
          ))}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  );
}
