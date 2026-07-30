'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Crown,
  Palette,
  Shield,
  Sparkles,
  Heart
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import nurIntanImage from '../../assets/images/Nur_Intan.webp';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mapping visual per branch. General Coordinator pakai Crown karena posisinya
// paling atas di struktur piramida.
const BRANCH_VISUALS = {
  general: {
    icon: Crown,
    eyebrow: 'Manajemen Utama',
    accent: 'text-(--color-secondary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-white/70'
  },
  operational: {
    icon: Shield,
    eyebrow: 'Operasional & Teknis',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-white/70'
  },
  media_creative: {
    icon: Palette,
    eyebrow: 'Media & Kreatif',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-secondary)/10 text-(--color-secondary) border-white/70'
  }
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

// === Variants ===
const branchCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: PREMIUM_EASE,
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};
const DOTS_STYLE = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1.6px)',
  backgroundSize: '26px 26px'
};

function DecorativeStructureBackground() {
  const sparkles = [
    { top: '14%', left: '10%', size: 11, delay: 0 },
    { top: '20%', left: '88%', size: 8, delay: 0.7 },
    { top: '70%', left: '6%', size: 9, delay: 1.3 },
    { top: '78%', left: '92%', size: 7, delay: 0.4 },
    { top: '46%', left: '50%', size: 6, delay: 1.0 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div style={DOTS_STYLE} className="absolute inset-0 opacity-20" />
      <div className="absolute left-1/2 top-10 h-px w-1/2 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgba(167,139,250,0.2),transparent)]" />
      
      {/* SVG Grain/Noise Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Dynamic Animated Liquid Blobs */}
      <motion.div
        animate={{
          x: [0, 45, -25, 0],
          y: [0, -35, 45, 0],
          scale: [1, 1.12, 0.92, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-200/15 to-indigo-200/15 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -35, 35, 0],
          y: [0, 45, -35, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-fuchsia-200/10 to-violet-200/10 blur-[120px]"
      />

      {sparkles.map((s, i) => {
        const spanStyle = { top: s.top, left: s.left };
        const spanAnimate = { opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.1, 0.8] };
        const spanTransition = { duration: 3 + i, repeat: Infinity, delay: s.delay, ease: 'easeInOut' };
        const iconStyle = { width: s.size, height: s.size };
        return (
          <motion.span
            key={i}
            className="absolute text-purple-300/30"
            style={spanStyle}
            animate={spanAnimate}
            transition={spanTransition}
          >
            <Sparkles style={iconStyle} />
          </motion.span>
        );
      })}
    </div>
  );
}



const avatarReveal = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 18
    }
  }
};

// Member Avatar Pill component - name is ALWAYS directly visible without hover
function MemberAvatar({ member, size = 30, isCoordinator = false }) {
  const initial = member.name ? member.name.charAt(0).toUpperCase() : '?';
  const sizeStyle = { width: size, height: size };

  return (
    <motion.div
      variants={avatarReveal}
      className={`inline-flex items-center rounded-full shrink-0 shadow-2xs border transition-all duration-300 pr-3.5 pl-1 py-1 gap-2 ${
        isCoordinator
          ? 'border-purple-300/60 bg-gradient-to-r from-purple-50 via-pink-50/50 to-indigo-50/60 shadow-xs'
          : 'border-slate-200/80 bg-white/90 hover:bg-slate-50'
      }`}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Avatar Circle */}
      <div
        style={sizeStyle}
        className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
          isCoordinator
            ? 'bg-gradient-to-tr from-[var(--color-primary)] to-purple-600 text-white shadow-xs'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}
      >
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span className={`text-[10px] font-black ${isCoordinator ? 'text-white' : 'text-[var(--color-primary)]'}`}>
            {initial}
          </span>
        )}
      </div>

      {/* Member Name Always Visible */}
      <span className="text-xs font-bold text-slate-700 leading-none whitespace-nowrap select-none">
        {member.name}
      </span>
    </motion.div>
  );
}

// Label nama divisi + baris avatar anggotanya (dengan nama langsung terlihat).
function DivisionMemberGroup({ division }) {
  const members = division.members || [];
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            staggerChildren: 0.08 
          } 
        }
      }}
      className="space-y-2"
    >
      <p className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] select-none">
        {division.name}
      </p>
      {members.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 justify-start">
          {members.map((member) => (
            <MemberAvatar key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <p className="text-left text-[10px] italic text-slate-400">Belum ada anggota</p>
      )}
    </motion.div>
  );
}

// Kartu Khusus Nur Intan (Oshi & Inspirasi Utama) di posisi paling atas piramida
function OshiPatronCard() {
  return (
    <motion.article
      variants={branchCardVariants}
      className="oshi-card-wrapper relative mx-auto max-w-xl w-full rounded-[32px] border border-amber-300/70 bg-gradient-to-br from-amber-50/90 via-white to-purple-50/90 p-6 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.35)] backdrop-blur-xl text-center overflow-hidden select-none"
    >
      <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-purple-300/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Crown Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/15 border border-amber-400/40 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span>Oshi & Inspirasi Utama</span>
          <Crown className="w-3.5 h-3.5 text-amber-600" />
        </div>

        {/* Nur Intan Photo */}
        <div className="relative mt-1">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-400 to-purple-600 shadow-md">
            <img
              src={nurIntanImage?.src || nurIntanImage}
              alt="Nur Intan"
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>
        </div>

        {/* Name & Subtitle */}
        <div className="space-y-0.5">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-primary)]">
            Nur Intan
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Sosok Utama & Inspirasi Perjalanan Fanbase IRIS
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function BranchCard({ branch, highlight = false }) {
  const visual = BRANCH_VISUALS[branch.id] || BRANCH_VISUALS.general;
  const BranchIcon = visual.icon;

  // General Coordinator: ambil member pertama yang ditemukan di divisi manapun
  const soloMember = highlight
    ? branch.divisions?.flatMap((d) => d.members || [])[0]
    : null;

  // Temukan Koordinator di branch non-highlight (termasuk Bogel & Cipani)
  const coordinatorMember = !highlight
    ? (branch.divisions?.flatMap((d) =>
        (d.members || []).map((m) => ({ ...m, _divName: d.name }))
      ) || []).find((m) => {
        const badge = (m.role_badge || '').toLowerCase();
        const divName = (m._divName || '').toLowerCase();
        const nameLower = (m.name || '').toLowerCase();
        return (
          badge.includes('coordinator') ||
          badge.includes('koordinator') ||
          divName.includes('coordinator') ||
          divName.includes('koordinator') ||
          nameLower === 'bogel' ||
          nameLower === 'cipani'
        );
      })
    : null;

  // Filter divisi agar tidak menampilkan "Koordinator" / "Coordinator" / divisi milik koordinator sebagai divisi biasa di bawah
  const divisionsToShow = branch.divisions?.filter((d) => {
    const nameLower = d.name.toLowerCase();
    const isCoordinatorDiv = nameLower.includes('koordinator') || nameLower.includes('coordinator');
    const hasCoordinatorMember = coordinatorMember && d.members?.some((m) => m.id === coordinatorMember.id || m.name === coordinatorMember.name);
    return !isCoordinatorDiv && !hasCoordinatorMember;
  }) || [];

  return (
    <motion.article
      variants={branchCardVariants}
      className={`relative w-full rounded-[32px] border px-6 py-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(28,15,132,0.03)] ${
        highlight
          ? 'mx-auto max-w-2xl border-[var(--color-primary)]/10 bg-white/70 shadow-[0_24px_60px_-30px_rgba(28,15,132,0.3)] backdrop-blur-xl text-center'
          : 'border-slate-200/40 bg-white/40 backdrop-blur-md text-left hover:bg-white/60'
      }`}
    >
      <div className={`flex flex-col gap-4 w-full ${highlight ? 'items-center' : 'items-start'}`}>
        <div className={`w-full flex flex-col space-y-2 ${highlight ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-2.5 select-none">
            <div className={`flex ${highlight ? 'h-11 w-11' : 'h-9 w-9'} shrink-0 items-center justify-center rounded-xl border ${visual.iconBox}`}>
              <BranchIcon className={highlight ? 'h-5.5 w-5.5' : 'h-4.5 w-4.5'} />
            </div>
            <h3 className={`${highlight ? 'text-2xl sm:text-3xl' : 'text-xl'} font-black leading-tight text-[var(--color-primary)]`}>
              {branch.name}
            </h3>
          </div>

          {/* Coordinator Member Pill */}
          {!highlight && coordinatorMember && (
            <div className="pt-1 select-none">
              <MemberAvatar member={coordinatorMember} size={30} isCoordinator />
            </div>
          )}
        </div>

        {highlight ? (
          <div className="py-2">
            {soloMember ? (
              <div className="flex flex-col items-center space-y-2">
                <MemberAvatar member={soloMember} size={42} isCoordinator />
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">[ Belum ada anggota ]</span>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="w-full h-px bg-slate-200/40 my-1" />
            <div className="w-full flex flex-col gap-4 py-1">
              {divisionsToShow.length > 0 ? (
                divisionsToShow.map((division) => (
                  <DivisionMemberGroup key={division.id} division={division} />
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Belum ada divisi</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Straight vertical connector line from Oshi Card down to General Coordinator
function TopVerticalConnector() {
  return (
    <div className="relative mx-auto block h-10 w-full select-none pointer-events-none">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(245,158,11,0.6),rgba(167,139,250,0.5))]" />
      <div className="connector-dot absolute left-1/2 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
    </div>
  );
}

// Garis penghubung dari General Coordinator turun ke grid Operational & Media Creative Coordinator
function Connector() {
  return (
    <div className="w-full select-none pointer-events-none">
      {/* Mobile Connector (Straight vertical line) */}
      <div className="relative mx-auto block h-12 w-full md:hidden">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(167,139,250,0.55),rgba(124,58,237,0.12))]" />
        <div className="connector-dot absolute left-1/2 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--color-secondary)] shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
      </div>

      {/* Tablet / Desktop Connector (Curved SVG centered) */}
      <div className="relative mx-auto hidden md:block h-16 w-full max-w-4xl">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradDesk" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.75)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.25)" />
            </linearGradient>
          </defs>
          <path className="connector-path" d="M 50 0 C 50 32, 25 32, 25 64" fill="none" stroke="url(#lineGradDesk)" strokeWidth="1.5" strokeLinecap="round" />
          <path className="connector-path" d="M 50 0 C 50 32, 75 32, 75 64" fill="none" stroke="url(#lineGradDesk)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="connector-dot absolute left-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--color-secondary)] shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
        <div className="connector-dot absolute right-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--color-secondary)] shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
      </div>
    </div>
  );
}


export default function IrisStructureSection() {
  const containerRef = useRef(null);
  const [branchesData, setBranchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStructure = async () => {
      try {
        const { data: branches } = await supabase.from('org_branches').select('*').order('id');
        const { data: divisions } = await supabase.from('org_divisions').select('*').order('id');
        const { data: members } = await supabase.from('org_members').select('*');

        if (branches && divisions && members) {
          const formatted = branches.map(b => {
            const bDivs = divisions
              .filter(d => d.branch_id === b.id)
              .map(d => {
                const dMems = members.filter(m => m.division_id === d.id);
                return {
                  ...d,
                  members: dMems
                };
              });
            return {
              ...b,
              divisions: bDivs
            };
          });
          setBranchesData(formatted);
        }
      } catch (err) {
        console.error('Failed to load structure:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let ctx = gsap.context(() => {
      // Set initial states
      gsap.set('.connector-path', { strokeDasharray: 200, strokeDashoffset: 200 });
      gsap.set('.connector-dot', { scale: 0, opacity: 0 });
      gsap.set('.structure-title', { opacity: 0, y: 30 });
      gsap.set('.oshi-card-wrapper', { opacity: 0, y: 30, scale: 0.98 });
      gsap.set('.general-card-wrapper', { opacity: 0, y: 30, scale: 0.98 });
      gsap.set('.lower-branch-card', { opacity: 0, y: 40 });

      // Create GSAP ScrollTrigger timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }
      });

      tl.to('.structure-title', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .to('.oshi-card-wrapper', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .to('.general-card-wrapper', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to('.connector-path', { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, '-=0.2')
        .to('.connector-dot', { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)' }, '-=0.2')
        .to('.lower-branch-card', { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, '-=0.2');

    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  // Pisahkan General Coordinator (puncak piramida) dari koordinator lainnya
  const generalBranch = branchesData.find((b) => b.id === 'general');
  const otherBranches = branchesData.filter((b) => b.id !== 'general');

  return (
    <section
      ref={containerRef}
      id="struktur-kepengurusan"
      className="relative overflow-hidden py-16 sm:py-24 w-full px-4 sm:px-6 lg:px-8 bg-slate-50/20"
    >
      <DecorativeStructureBackground />

      {/* Main Grid Wrapper */}
      <div 
        className="relative z-10 max-w-6xl mx-auto flex flex-col gap-8 w-full"
      >
        {isLoading ? (
          <div className="py-24 text-center text-sm font-bold text-slate-400 animate-pulse">
            [ Memuat Struktur Organisasi... ]
          </div>
        ) : (
          <div className="w-full space-y-10">
            {/* ROW 1: Title (left) & Right Stack (Nur Intan + General Coordinator) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Left Side: Title & Badge */}
              <div className="structure-title lg:col-span-5 space-y-4 text-left">
                <span className="text-[9px] uppercase tracking-widest text-[var(--color-secondary)] font-bold bg-purple-100/60 px-3.5 py-1 rounded-full w-fit border border-purple-200/50 block">
                  Struktur Organisasi
                </span>
                
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--color-primary)] leading-tight">
                  Struktur Pengurus <br />
                  <span className="text-5xl sm:text-6xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-purple-600 to-indigo-600 inline-block mt-1">
                    IRIS
                  </span>
                </h2>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm font-medium">
                  Struktur kepengurusan resmi komunitas fanbase Nur Intan JKT48 (IRIS) dalam menjalankan berbagai program, kegiatan operasional, dan karya kreatif.
                </p>
              </div>

              {/* Right Side: Stacked Nur Intan Card + Connector + General Coordinator */}
              <div className="lg:col-span-7 flex flex-col items-center gap-4 w-full">
                {/* Oshi & Inspirasi Utama Card */}
                <div className="oshi-card-wrapper w-full">
                  <OshiPatronCard />
                </div>

                {/* Top Connector */}
                <TopVerticalConnector />

                {/* General Coordinator Card */}
                <div className="general-card-wrapper w-full">
                  {generalBranch && (
                    <BranchCard branch={generalBranch} highlight />
                  )}
                </div>
              </div>
            </div>

            {/* CONNECTOR LINE TO LOWER BRANCHES */}
            <Connector />

            {/* ROW 2: Operational & Media Creative Branches Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {otherBranches.map((branch) => (
                <div key={branch.id} className="lower-branch-card w-full">
                  <BranchCard branch={branch} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}