'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Lock, Info } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

const TYPE_LABELS = {
  member: 'Member',
  admin: 'Admin',
  volunteer: 'Volunteer'
};

/**
 * Shell pembungkus form Join Us.
 * Menangani 3 state yang identik di ketiga form (loading / closed / submitted)
 * plus tombol kembali ke halaman pemilihan peran.
 */
export default function FormShell({
  type,
  isLoading,
  isClosed,
  isSubmitted,
  onReset,
  title,
  description,
  children
}) {
  return (
    <div className="relative py-4 w-full font-sans">
      {/* Back Link */}
      <Link
        href={ROUTES.JOIN_US}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[var(--color-primary)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali pilih peran
      </Link>

      <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Memuat formulir...</span>
          </div>
        ) : isSubmitted ? (
          /* Post-Submission Simple Confirmation View */
          <div className="py-12 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              Pendaftaran Berhasil Dikirim!
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-8">
              Terima kasih telah mendaftar. Data pendaftaran Anda telah berhasil kami terima dan akan segera ditinjau oleh panitia IRIS. Mohon pastikan akun Line / sosial media Anda aktif.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onReset}
                className="px-6 py-2.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 font-semibold text-xs transition-all cursor-pointer"
              >
                Kirim Pendaftaran Lain
              </button>
              <Link
                href={ROUTES.JOIN_US}
                className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold text-xs transition-all"
              >
                Kembali ke Pilihan Peran
              </Link>
            </div>
          </div>
        ) : isClosed ? (
          /* Form Closed Locked State */
          <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Pendaftaran Sedang Ditutup</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Formulir pendaftaran untuk opsi <strong className="text-slate-900">{TYPE_LABELS[type] || type}</strong> saat ini sedang dikunci oleh panitia admin. Silakan pantau pengumuman resmi di sosial media IRIS untuk pembukaan batch berikutnya.
            </p>
            <Link
              href={ROUTES.JOIN_US}
              className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold text-xs transition-all"
            >
              Kembali ke Pilihan Peran
            </Link>
          </div>
        ) : (
          /* Active Form Area */
          <div>
            <div className="mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-1">
                <Info className="h-4 w-4" />
                <span>Formulir Pendaftaran Resmi</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
