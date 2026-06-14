import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  type = 'danger', // 'danger' | 'warning' | 'info'
}) {
  const handleCancel = onCancel || onClose;
  // Prevent scrolling behind the active modal
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

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconClass: 'text-red-500 bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50',
          confirmBtnClass: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClass: 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50',
          confirmBtnClass: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400',
        };
      case 'info':
      default:
        return {
          icon: HelpCircle,
          iconClass: 'text-indigo-500 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50',
          confirmBtnClass: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white focus:ring-indigo-400',
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="relative z-10 w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 text-left"
          >
            <div className="flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${theme.iconClass}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>

              {/* Texts */}
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-50 w-full">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all outline-none cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 text-xs font-bold rounded-xl transition-all outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${theme.confirmBtnClass}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
