'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { joinService } from '@/services/public/joinService';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

const ROLE_CARDS = [
  {
    type: 'member',
    icon: Users,
    title: 'Join Member',
    description:
      'Keanggotaan resmi IRIS untuk berpartisipasi aktif dalam kegiatan harian, gathering, dan dukungan bersama.',
    openLabel: 'Open Registration'
  },
  {
    type: 'admin',
    icon: ShieldCheck,
    title: 'Join Admin',
    description:
      'Perekrutan tim pengurus internal (Data Archiver, Sosmed, Video Editor, Desain Grafis, E-Sport, & Merch).',
    openLabel: 'Open Recruitment'
  },
  {
    type: 'volunteer',
    icon: HeartHandshake,
    title: 'Join Volunteer',
    description:
      'Bergabung sebagai relawan pelaksana untuk event kebersamaan, perayaan ulang tahun, dan santunan sosial.',
    openLabel: 'Open Volunteer'
  }
];

export default function JoinSelectorPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    joinService.getJoinSettings().then((res) => {
      if (active) setSettings(res);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <MainLayout>
      <div className="relative py-4 w-full font-sans">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-primary)] mb-3">
            Bergabung Bersama Komunitas IRIS
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4"
          >
            Pilih Peranmu & Dukung{' '}
            <span className="text-[var(--color-primary)]">Nur Intan!</span>
          </motion.h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Kami membuka pintu bagi seluruh fans dan pendukung untuk menjadi anggota resmi, staf admin pengurus, maupun relawan kegiatan kebersamaan IRIS.
          </p>
        </div>

        {/* 3 Role Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const isCardClosed = settings?.[card.type]?.status === 'closed';
            return (
              <button
                key={card.type}
                type="button"
                onClick={() => router.push(`/join/${card.type}`)}
                className="relative rounded-[28px] p-6 cursor-pointer text-left transition-colors border bg-white border-slate-200 hover:border-[var(--color-primary)] hover:shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isCardClosed
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isCardClosed ? <Lock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    <span>{isCardClosed ? 'Tutup' : card.openLabel}</span>
                  </span>

                  <span className="text-xs font-bold flex items-center gap-1 text-[var(--color-primary)]">
                    Pilih <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
