'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg space-y-6"
      >
        {/* Large 404 Display */}
        <div className="relative select-none">
          <span className="text-[10rem] sm:text-[14rem] font-black leading-none text-[#FF5FB2]/[0.08] tracking-tight">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <Search className="h-10 w-10 text-[#FF5FB2]/50 mx-auto" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222]">
                Halaman Tidak Ditemukan
              </h1>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#60697A] leading-relaxed max-w-md mx-auto">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Silakan kembali ke halaman utama.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E7EAF2] bg-white text-[#222222] text-sm font-semibold hover:bg-[#F5F7FB] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
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
