'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-lg space-y-6"
      >
        {/* Large 404 Display */}
        <div className="relative select-none">
          <span className="text-[10rem] sm:text-[14rem] font-black leading-none text-[#170C79]/[0.06] tracking-tight">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <Search className="h-10 w-10 text-[#170C79]/40 mx-auto" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#170C79]">
                Halaman Tidak Ditemukan
              </h1>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Silakan kembali ke halaman utama.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-white text-[var(--text-primary)] text-sm font-semibold hover:bg-[#170C79]/5 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
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
