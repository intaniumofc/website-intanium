'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to external error monitoring service (e.g. Sentry) in production
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md space-y-6"
      >
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#170C79]">
            Terjadi Kesalahan
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Maaf, terjadi kesalahan saat memuat halaman ini.
            Silakan coba muat ulang atau kembali ke halaman utama.
          </p>
        </div>

        {error?.message && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 font-mono text-left break-words">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-[var(--text-primary)] text-sm font-semibold hover:bg-[#170C79]/5 transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#170C79] text-white text-sm font-semibold hover:bg-[#291da9] shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Halaman Utama
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
