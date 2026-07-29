'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md space-y-6"
      >
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#222222]">
            Terjadi Kesalahan
          </h1>
          <p className="text-sm text-[#60697A] leading-relaxed">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E7EAF2] bg-white text-[#222222] text-sm font-semibold hover:bg-[#F5F7FB] transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF5FB2] via-[#C96EFF] to-[#72C4FF] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(255,95,178,0.35)] hover:scale-[1.02] transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Halaman Utama
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
