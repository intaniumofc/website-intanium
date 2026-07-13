'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Crown,
  Palette,
  Shield,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

// Satu avatar bulat. Pakai foto kalau ada avatar_url, fallback ke inisial nama.
// Hover/Klik akan mengekspansi avatar ke kanan memanjang (pill layout) untuk menampilkan nama lengkap.
function MemberAvatar({ member, size = 32, isCoordinator = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const initial = member.name ? member.name.charAt(0).toUpperCase() : '?';
  const sizeStyle = { width: size, height: size };

  return (
    <motion.div
      layout
      variants={avatarReveal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
      className={`flex items-center rounded-full cursor-pointer overflow-hidden shrink-0 shadow-xs border transition-colors duration-300 ${isCoordinator
          ? 'border-(--color-secondary)/20 bg-gradient-to-tr from-purple-50 to-indigo-50/50'
          : 'border-slate-200/50 bg-white/90 hover:bg-slate-50'
        }`}
      style={{ padding: 2 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Avatar Circle */}
      <motion.div
        layout
        style={sizeStyle}
        className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 ${isCoordinator
            ? 'bg-gradient-to-tr from-(--color-primary) to-purple-600 text-white'
            : 'bg-slate-100 text-slate-700'
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
          <span className={`text-[10px] font-black ${isCoordinator ? 'text-white' : 'text-(--color-primary)'}`}>
            {initial}
          </span>
        )}
      </motion.div>

      {/* Slide-out Name Label */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            layout
            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
            animate={{ width: 'auto', opacity: 1, marginLeft: 8, marginRight: 12 }}
            exit={{ width: 0, opacity: 0, marginLeft: 0, marginRight: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-[10px] font-bold text-slate-700 whitespace-nowrap overflow-hidden select-none"
          >
            {member.name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Label nama divisi + baris avatar anggotanya. Dipakai untuk Operational &
// Media Creative Coordinator supaya anggota tetap jelas kelompok divisinya,
// tanpa perlu bikin cabang/card terpisah per divisi.
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
      <p className="text-left text-[10px] font-bold uppercase tracking-wider text-(--text-secondary) select-none">
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

function BranchCard({ branch, highlight = false }) {
  const visual = BRANCH_VISUALS[branch.id] || BRANCH_VISUALS.general;
  const BranchIcon = visual.icon;

  // General Coordinator: ambil member pertama yang ditemukan di divisi manapun
  // (biasanya cuma ada satu divisi/satu orang untuk branch ini).
  const soloMember = highlight
    ? branch.divisions?.flatMap((d) => d.members || [])[0]
    : null;

  // Temukan Koordinator di branch non-highlight
  const coordinatorMember = !highlight
    ? (branch.divisions?.flatMap((d) => d.members || []) || []).find((m) =>
      (m.role_badge || '').toLowerCase().includes('coordinator') ||
      (m.role_badge || '').toLowerCase().includes('koordinator')
    )
    : null;

  // Filter divisi agar tidak menampilkan "Koordinator" sebagai divisi biasa
  const divisionsToShow = branch.divisions?.filter((d) =>
    d.name.toLowerCase() !== 'koordinator' &&
    d.name.toLowerCase() !== 'general coordinator'
  ) || [];

  return (
    <motion.article
      variants={branchCardVariants}
      className={`relative w-full rounded-[32px] border px-6 py-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(28,15,132,0.03)] ${
        highlight
          ? 'mx-auto max-w-2xl border-(--color-primary)/10 bg-white/60 shadow-[0_24px_60px_-30px_rgba(28,15,132,0.3)] backdrop-blur-xl text-center'
          : 'border-slate-200/40 bg-white/40 backdrop-blur-md text-left hover:bg-white/60'
      }`}
    >
      <div className={`flex flex-col gap-4 w-full ${highlight ? 'items-center' : 'items-start'}`}>
        <div className={`w-full flex flex-col space-y-2 ${highlight ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-2.5 select-none">
            <div className={`flex ${highlight ? 'h-11 w-11' : 'h-9 w-9'} shrink-0 items-center justify-center rounded-xl border ${visual.iconBox}`}>
              <BranchIcon className={highlight ? 'h-5.5 w-5.5' : 'h-4.5 w-4.5'} />
            </div>
            <h3 className={`${highlight ? 'text-2xl sm:text-3xl' : 'text-xl'} font-black leading-tight text-(--color-primary)`}>
              {branch.name}
            </h3>
          </div>
          <p className={`text-xs leading-relaxed text-[var(--text-secondary)] max-w-2xl ${highlight ? 'mx-auto' : ''}`}>{branch.description}</p>

          {/* Coordinator Pill */}
          {!highlight && coordinatorMember && (
            <div className="flex items-center gap-2 bg-purple-50/50 border border-purple-100/40 px-3 py-1 rounded-2xl w-fit select-none mt-1 shadow-2xs">
              <MemberAvatar member={coordinatorMember} size={26} isCoordinator />
              <div className="flex flex-col text-left">
                <span className="text-[7.5px] font-black uppercase tracking-widest text-(--color-secondary)">Koor</span>
                <span className="text-[10px] font-bold text-slate-700 leading-none mt-0.5">{coordinatorMember.name}</span>
              </div>
            </div>
          )}
        </div>

        {highlight ? (
          <div className="py-4">
            {soloMember ? (
              <div className="flex flex-col items-center space-y-2">
                <MemberAvatar member={soloMember} size={64} isCoordinator />
                <span className="text-[9px] font-black uppercase tracking-widest text-(--color-secondary)">
                  {soloMember.name}
                </span>
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

// Garis penghubung dari General Coordinator turun ke grid Operational &
// Media Creative Coordinator di bawahnya dengan kurva Bezier ganda (organic curves).
function Connector() {
  return (
    <div className="w-full select-none pointer-events-none">
      {/* Mobile Connector (Straight vertical line) */}
      <div className="relative mx-auto block h-12 w-full md:hidden">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(167,139,250,0.55),rgba(124,58,237,0.12))]" />
        <div className="connector-dot absolute left-1/2 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-(--color-secondary) shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
      </div>

      {/* Tablet Connector (Curved SVG centered) */}
      <div className="relative mx-auto hidden md:block lg:hidden h-16 w-full max-w-4xl">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradTab" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.75)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.25)" />
            </linearGradient>
          </defs>
          <path className="connector-path" d="M 50 0 C 50 32, 25 32, 25 64" fill="none" stroke="url(#lineGradTab)" strokeWidth="1.5" strokeLinecap="round" />
          <path className="connector-path" d="M 50 0 C 50 32, 75 32, 75 64" fill="none" stroke="url(#lineGradTab)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="connector-dot absolute left-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-(--color-secondary) shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
        <div className="connector-dot absolute right-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-(--color-secondary) shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
      </div>

      {/* Desktop Connector (Asymmetric Curved SVG aligned to General Coordinator on the right) */}
      <div className="relative mx-auto hidden lg:block h-16 w-full max-w-6xl">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradDesk" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.75)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.25)" />
            </linearGradient>
          </defs>
          <path className="connector-path" d="M 70.83 0 C 70.83 32, 25 32, 25 64" fill="none" stroke="url(#lineGradDesk)" strokeWidth="1.5" strokeLinecap="round" />
          <path className="connector-path" d="M 70.83 0 C 70.83 32, 75 32, 75 64" fill="none" stroke="url(#lineGradDesk)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="connector-dot absolute left-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-(--color-secondary) shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
        <div className="connector-dot absolute right-1/4 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-(--color-secondary) shadow-[0_0_12px_rgba(167,139,250,0.9)]" />
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
        .to('.general-card-wrapper', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .to('.connector-path', { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, '-=0.2')
        .to('.connector-dot', { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)' }, '-=0.2')
        .to('.lower-branch-card', { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, '-=0.2');

    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  // Pisahkan General Coordinator (puncak piramida) dari koordinator lainnya
  // (Operational & Media Creative), yang dirender berdampingan di bawahnya.
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
        className="relative z-10 max-w-6xl mx-auto flex flex-col gap-10 w-full"
      >
        {isLoading ? (
          <div className="py-24 text-center text-sm font-bold text-slate-400 animate-pulse">
            [ Memuat Struktur Organisasi... ]
          </div>
        ) : (
          <div className="w-full space-y-10">
            {/* ROW 1: Title (left) & General Coordinator Card (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Left Side: Title */}
              <div className="structure-title lg:col-span-5 space-y-3 text-left">
                <span className="text-[9px] uppercase tracking-widest text-(--color-secondary) font-bold bg-purple-100/60 px-3 py-1 rounded-full w-fit">
                  Struktur Organisasi
                </span>
                
                <h2 className="text-4xl font-black tracking-tight text-(--color-primary) sm:text-5xl leading-tight">
                  Struktur <br className="hidden lg:block"/>
                  Pengurus <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--color-primary) to-purple-600">IRIS</span>
                </h2>
              </div>

              {/* Right Side: General Coordinator Card */}
              <div className="general-card-wrapper lg:col-span-7 w-full">
                {generalBranch && (
                  <BranchCard branch={generalBranch} highlight />
                )}
              </div>
            </div>

            {/* CONNECTOR LINE */}
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