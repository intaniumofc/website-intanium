'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Crown,
  Palette,
  Shield,
  Sparkles,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { AvatarSmartGroup } from '../../components/ui/AvatarSmartGroup';
import intanProfile from '../../assets/images/Nur_Intan.webp';

const LEADER_INFO = {
  name: 'Nur Intan',
  role: 'Pusat Arahan',
  badge: 'Ketua Umum',
  description: 'Menjadi pusat representasi, arahan, dan semangat utama bagi perjalanan Intanium.'
};

const BRANCH_VISUALS = {
  external: {
    icon: Users,
    eyebrow: 'Hubungan Eksternal',
    accent: 'text-(--color-secondary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-white/70'
  },
  creative: {
    icon: Palette,
    eyebrow: 'Media Kreatif',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-secondary)/10 text-(--color-secondary) border-white/70'
  },
  internal: {
    icon: Shield,
    eyebrow: 'Operasional Internal',
    accent: 'text-(--color-primary)',
    iconBox: 'bg-(--color-primary-light) text-(--color-primary) border-white/70'
  }
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

// === Helpers ===
const getTotalMembers = (branch) =>
  branch.divisions ? branch.divisions.reduce((sum, division) => sum + (division.members?.length || 0), 0) : 0;

// Arrange members for centered avatar layout (coordinator in the exact middle)
const arrangeCentered = (users) => {
  if (!users || users.length === 0) return [];
  const coordIndex = users.findIndex(u => u.isCoordinator);
  if (coordIndex === -1) {
    return users;
  }
  const coord = users[coordIndex];
  const rest = users.filter((_, idx) => idx !== coordIndex);
  
  const centerIdx = Math.floor(users.length / 2);
  const result = [...rest];
  result.splice(centerIdx, 0, coord);
  return result;
};

// === Variants ===
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.16, delayChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: PREMIUM_EASE } }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: PREMIUM_EASE } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.75, ease: PREMIUM_EASE } }
};

const connectorReveal = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: PREMIUM_EASE, delay: 0.25 } }
};

const branchCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: PREMIUM_EASE } }
};

const LEADER_HOVER = { y: -4, scale: 1.01 };
const LEADER_SPRING = { type: 'spring', stiffness: 320, damping: 24 };
const SECTION_VIEWPORT = { once: true, amount: 0.18, margin: '-80px' };
const COUNT_VIEWPORT = { once: true, amount: 0.6 };
const DOTS_STYLE = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1.6px)',
  backgroundSize: '26px 26px'
};

// === Animated count-up ===
function useCountUp(end, inView, duration = 1.4) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    let frame;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [end, inView, duration]);
  return value;
}

// === CountUp helper ===
function CountUp({ end, duration, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, COUNT_VIEWPORT);
  const value = useCountUp(end, inView, duration);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

// === Decorative background ===
function DecorativeStructureBackground() {
  const sparkles = [
    { top: '14%', left: '10%', size: 11, delay: 0 },
    { top: '20%', left: '88%', size: 8, delay: 0.7 },
    { top: '70%', left: '6%', size: 9, delay: 1.3 },
    { top: '78%', left: '92%', size: 7, delay: 0.4 },
    { top: '46%', left: '50%', size: 6, delay: 1.0 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={DOTS_STYLE} className="absolute inset-0 opacity-30" />
      <div className="absolute left-1/2 top-10 h-px w-1/2 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,rgba(167,139,250,0.25),transparent)]" />
      {sparkles.map((s, i) => {
        const spanStyle = { top: s.top, left: s.left };
        const spanAnimate = { opacity: [0.15, 0.6, 0.15], scale: [0.8, 1.1, 0.8] };
        const spanTransition = { duration: 3 + i, repeat: Infinity, delay: s.delay, ease: 'easeInOut' };
        const iconStyle = { width: s.size, height: s.size };
        return (
          <motion.span
            key={i}
            className="absolute text-purple-300/40"
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

// === Aggregate stat bar ===
function StatBar({ coordinatorCount, divisionCount, memberCount }) {
  const stats = [
    { label: 'Koordinator', value: coordinatorCount },
    { label: 'Divisi', value: divisionCount },
    { label: 'Anggota Aktif', value: memberCount }
  ];
  return (
    <motion.div variants={fadeUp} className="mx-auto grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-white/70 bg-white/65 px-3 py-4 text-center shadow-[0_18px_50px_-34px_rgba(28,15,132,0.4)] backdrop-blur-xl"
        >
          <CountUp end={stat.value} className="block text-3xl font-black text-(--color-primary) sm:text-4xl" />
          <span className="mt-1 block text-[11px] font-bold uppercase tracking-widest text-(--text-secondary)">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

function LeaderCard() {
  return (
    <motion.div
      variants={scaleIn}
      className="relative mx-auto max-w-2xl text-center flex flex-col items-center gap-3 pt-4 pb-2"
    >
      <div className="relative group cursor-pointer">
        {/* Subtle spinning glow ring behind avatar */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-amber-500 rounded-full blur-md opacity-25 group-hover:opacity-50 transition-opacity duration-300 -m-1.5" />
        
        <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-lg relative z-10 bg-slate-100 flex items-center justify-center select-none">
          <img
            src={intanProfile.src || intanProfile}
            alt={LEADER_INFO.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 shadow-xs select-none">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          {LEADER_INFO.badge}
        </span>
        <h3 className="text-xl font-black text-(--color-primary) mt-1">{LEADER_INFO.name}</h3>
        <p className="text-xs leading-relaxed text-(--text-secondary) max-w-md mx-auto">{LEADER_INFO.description}</p>
      </div>
    </motion.div>
  );
}

function BranchCard({ branch }) {
  const visual = BRANCH_VISUALS[branch.id];
  const BranchIcon = visual.icon;

  // Gather all members from all divisions in this branch into one single list
  const branchMembers = [];
  branch.divisions?.forEach((division) => {
    division.members?.forEach((member) => {
      branchMembers.push({
        name: member.name,
        role: member.role_badge || division.name,
        image: member.avatar_url,
        isCoordinator: member.role_badge?.toLowerCase().includes('koordinator')
      });
    });
  });

  const arrangedMembers = arrangeCentered(branchMembers);

  return (
    <motion.article
      variants={branchCardVariants}
      className="relative w-full pt-8 first:pt-4 text-center"
    >
      <div className="flex flex-col gap-4 items-center w-full">
        {/* Top Side: Branch Info (centered text-center) */}
        <div className="w-full flex flex-col items-center space-y-2">
          <div className="flex flex-col items-center gap-2 select-none">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${visual.iconBox}`}>
              <BranchIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-wider ${visual.accent}`}>{visual.eyebrow}</p>
              <h3 className="text-lg font-black leading-tight text-(--color-primary) mt-0.5">{branch.name}</h3>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-(--text-secondary) max-w-2xl mx-auto">{branch.description}</p>
        </div>

        {/* Bottom Side: Avatar Group (centered) */}
        <div className="w-full flex justify-center py-2">
          {arrangedMembers.length > 0 ? (
            <AvatarSmartGroup
              users={arrangedMembers}
              variant="centered"
              size={42}
              sizeStep={10}
              overlap={-12}
              ringColor="ring-white"
            />
          ) : (
            <span className="text-xs text-slate-400 italic">Belum ada anggota</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function Connector() {
  return (
    <motion.div variants={connectorReveal} className="relative mx-auto hidden h-12 max-w-4xl origin-top lg:block">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(167,139,250,0.55),rgba(124,58,237,0.12))]" />
      <div className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 rounded-full bg-(--color-secondary)/60 shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
    </motion.div>
  );
}

export default function IntaniumStructureSection() {
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

  const totalDivisions = branchesData.reduce((sum, b) => sum + b.divisions.length, 0);
  const totalMembers = branchesData.reduce((sum, b) => sum + getTotalMembers(b), 0);

  return (
    <motion.section
      id="struktur-kepengurusan"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionReveal}
      className="relative overflow-hidden py-12 w-full px-4 sm:px-6 lg:px-8"
    >
      <DecorativeStructureBackground />

      <motion.div variants={staggerContainer} className="relative z-10 space-y-8 lg:space-y-10">
        <motion.div variants={fadeUp} className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-3xl font-black tracking-tight text-(--color-primary) sm:text-5xl">
            Struktur Kepengurusan Intanium
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-(--text-secondary) sm:text-base">
            Di balik setiap aktivitas Intanium, ada tim yang saling menjaga, menghubungkan, dan memastikan setiap gerak komunitas berjalan rapi, hangat, dan penuh dukungan.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="py-12 text-center text-sm font-bold text-slate-500">
            Memuat struktur kepengurusan…
          </div>
        ) : (
          <>
            <StatBar
              coordinatorCount={branchesData.length}
              divisionCount={totalDivisions}
              memberCount={totalMembers}
            />

            <LeaderCard />
            <Connector />

            {/* Clean Stacked Branch Layout (Minimalist cardless & borders removed) */}
            <motion.div
              layout
              variants={staggerContainer}
              className="flex flex-col gap-4 divide-y divide-slate-200/40 max-w-4xl mx-auto w-full pt-4"
            >
              {branchesData.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.section>
  );
}
