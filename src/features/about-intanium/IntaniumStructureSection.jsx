'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import {
  ChevronDown,
  Crown,
  LayoutGrid,
  Palette,
  Shield,
  Sparkles,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

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

const getDivisionPreview = (branch, max = 3) => {
  if (!branch.divisions) return { preview: [], extra: 0 };
  const names = branch.divisions.map((division) => division.name);
  return { preview: names.slice(0, max), extra: Math.max(0, names.length - max) };
};

// === Filter tabs ===
const FILTER_TABS = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'external', label: 'Hubungan Eksternal', icon: Users },
  { id: 'creative', label: 'Media Kreatif', icon: Palette },
  { id: 'internal', label: 'Operasional Internal', icon: Shield }
];

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

const dropdownVariants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { type: 'spring', stiffness: 260, damping: 26 },
      opacity: { duration: 0.25 }
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.22, ease: 'easeInOut' },
      opacity: { duration: 0.15 }
    }
  }
};

const detailContainerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.04, staggerDirection: -1 } }
};

const divisionItemVariants = {
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }
};

const branchCardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: PREMIUM_EASE } },
  exit: { opacity: 0, y: 14, scale: 0.97, transition: { duration: 0.25, ease: 'easeInOut' } }
};

// === Konstanta objek inline ===
const LEADER_HOVER = { y: -4, scale: 1.01 };
const LEADER_SPRING = { type: 'spring', stiffness: 320, damping: 24 };
const CARD_HOVER = { y: -6, scale: 1.01 };
const CARD_SPRING = { type: 'spring', stiffness: 320, damping: 24 };
const CARD_TAP = { scale: 0.985 };
const CHEVRON_TRANSITION = { duration: 0.28, ease: PREMIUM_EASE };
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

// === Background dekoratif subtle ===
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
      <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-(--color-primary)/10 blur-[5rem]" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-(--color-secondary)/15 blur-[5rem]" />
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

// === Filter tabs ===
function FilterTabs({ active, onChange }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2">
      {FILTER_TABS.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${isActive
              ? 'border-(--color-primary)/40 bg-(--color-primary) text-white shadow-[0_12px_30px_-14px_rgba(124,58,237,0.7)]'
              : 'border-white/70 bg-white/60 text-(--text-secondary) hover:border-(--color-primary)/30 hover:text-(--color-primary)'}`}
          >
            <TabIcon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        );
      })}
    </motion.div>
  );
}

// === Branch stats row ===
function BranchStats({ branch }) {
  const total = getTotalMembers(branch);
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-(--text-secondary)">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-light)/60 px-2.5 py-1 text-(--color-primary)">
        {branch.divisions?.length || 0} Divisi
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1">
        <CountUp end={total} duration={1} className="font-bold" /> Anggota
      </span>
    </div>
  );
}

// === Division preview chips ===
function DivisionPreviewChips({ branch }) {
  const { preview, extra } = getDivisionPreview(branch);
  return (
    <div className="flex flex-wrap gap-1.5">
      {preview.map((name) => (
        <span
          key={name}
          className="rounded-full border border-white/70 bg-white/60 px-2.5 py-1 text-xs font-semibold text-(--text-secondary)"
        >
          {name}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-full border border-(--color-primary)/20 bg-(--color-primary-light)/70 px-2.5 py-1 text-xs font-bold text-(--color-primary)">
          +{extra}
        </span>
      )}
    </div>
  );
}

function LeaderCard() {
  return (
    <motion.div
      variants={scaleIn}
      whileHover={LEADER_HOVER}
      transition={LEADER_SPRING}
      className="relative mx-auto max-w-2xl overflow-hidden rounded-4xl border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_-40px_rgba(28,15,132,0.45)] backdrop-blur-xl sm:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(to_right,transparent,var(--color-secondary),transparent)]" />
      <div className="absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-(--color-secondary)/15 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-(--color-primary-light) text-(--color-primary) shadow-md">
          <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.8),transparent_60%)] opacity-70" />
          <Crown className="relative h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <span className="inline-flex rounded-full border border-(--color-primary)/15 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-(--color-primary) shadow-sm">
            {LEADER_INFO.badge}
          </span>
          <div>
            <h3 className="text-2xl font-black leading-tight text-(--color-primary)">{LEADER_INFO.name}</h3>
          </div>
          <p className="text-sm leading-relaxed text-(--text-secondary)">{LEADER_INFO.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function BranchDetails({ branch }) {
  return (
    <motion.div
      id={`branch-details-${branch.id}`}
      variants={dropdownVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="overflow-hidden"
    >
      <motion.div variants={detailContainerVariants} className="mt-4 space-y-3 border-t border-white/60 pt-4">
        {branch.divisions?.map((division) => (
          <motion.div
            key={division.name}
            variants={divisionItemVariants}
            className="rounded-2xl border border-white/70 bg-white/70 p-3.5 text-left"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-black text-(--color-primary)">{division.name}</span>
              <span className="shrink-0 text-[11px] font-semibold text-(--text-secondary)">{division.members?.length || 0} anggota</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {division.members?.map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white px-2.5 py-1 text-xs font-semibold text-(--text-secondary) shadow-xs hover:border-(--color-primary)/20 transition-all"
                >
                  <span>{member.name}</span>
                </div>
              ))}
              {(!division.members || division.members.length === 0) && (
                <span className="text-xs text-(--text-secondary) italic">Belum ada anggota</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function BranchCard({ branch, isActive, onToggle }) {
  const visual = BRANCH_VISUALS[branch.id];
  const BranchIcon = visual.icon;
  const chevronAnimate = { rotate: isActive ? 180 : 0 };

  return (
    <motion.article
      layout
      variants={branchCardVariants}
      exit="exit"
      whileHover={CARD_HOVER}
      transition={CARD_SPRING}
      className={`relative self-start rounded-4xl border bg-white/65 p-5 backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300 ${isActive
        ? 'border-(--color-primary)/35 bg-white/75 shadow-[0_24px_70px_-34px_rgba(124,58,237,0.5)]'
        : 'border-white/70 shadow-[0_18px_50px_-34px_rgba(28,15,132,0.35)]'
        }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`branch-details-${branch.id}`}
        className="w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)/40 focus-visible:ring-offset-2"
      >
        <motion.div layout="position" whileTap={CARD_TAP} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 text-left">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 ${visual.iconBox} ${isActive ? 'scale-105' : ''}`}>
                <BranchIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-black ${visual.accent}`}>{visual.eyebrow}</p>
                <h3 className="mt-1 truncate text-xl font-black leading-tight text-(--color-primary)">{branch.coordinator}</h3>
              </div>
            </div>
            <motion.span
              animate={chevronAnimate}
              transition={CHEVRON_TRANSITION}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--color-primary)"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </div>

          <p className="text-sm leading-relaxed text-(--text-secondary) text-left">{branch.description}</p>

          <BranchStats branch={branch} />
          <DivisionPreviewChips branch={branch} />

          <span className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors duration-300 ${isActive ? 'text-(--color-primary)' : 'text-(--text-secondary)'}`}>
            {isActive ? 'Tutup Detail' : 'Lihat Anggota'}
          </span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isActive && <BranchDetails key={branch.id} branch={branch} />}
      </AnimatePresence>
    </motion.article>
  );
}

function Connector() {
  return (
    <motion.div variants={connectorReveal} className="relative mx-auto hidden h-16 max-w-4xl origin-top lg:block">
      <div className="absolute left-1/2 top-0 h-9 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(167,139,250,0.55),rgba(124,58,237,0.12))]" />
      <div className="absolute left-1/2 top-9 h-2 w-2 -translate-x-1/2 rounded-full bg-(--color-secondary)/60 shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
      <div className="absolute bottom-0 left-[16.6%] right-[16.6%] h-px bg-[linear-gradient(to_right,transparent,rgba(124,58,237,0.4),transparent)]" />
      <div className="absolute bottom-0 left-[16.6%] h-5 w-px bg-(--color-primary)/20" />
      <div className="absolute bottom-0 left-1/2 h-5 w-px -translate-x-1/2 bg-(--color-primary)/20" />
      <div className="absolute bottom-0 right-[16.6%] h-5 w-px bg-(--color-primary)/20" />
      <div className="absolute bottom-0 left-[16.6%] h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--color-primary)/40" />
      <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--color-primary)/40" />
      <div className="absolute bottom-0 right-[16.6%] h-1.5 w-1.5 translate-x-1/2 translate-y-1/2 rounded-full bg-(--color-primary)/40" />
    </motion.div>
  );
}

export default function IntaniumStructureSection() {
  const [branchesData, setBranchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState(null);
  const [filter, setFilter] = useState('all');

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

  const handleToggle = (branchId) => {
    setActiveBranch((current) => (current === branchId ? null : branchId));
  };

  const handleFilter = (id) => {
    setFilter(id);
    setActiveBranch(id === 'all' ? null : id);
  };

  const visibleBranches =
    filter === 'all'
      ? branchesData
      : branchesData.filter((branch) => branch.id === filter);

  const isFiltered = filter !== 'all';

  const totalDivisions = branchesData.reduce((sum, b) => sum + b.divisions.length, 0);
  const totalMembers = branchesData.reduce((sum, b) => sum + getTotalMembers(b), 0);

  return (
    <motion.section
      id="struktur-kepengurusan"
      initial="hidden"
      whileInView="visible"
      viewport={SECTION_VIEWPORT}
      variants={sectionReveal}
      className="relative overflow-hidden rounded-4xl border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.85),rgba(196,181,253,0.18)_55%,rgba(255,255,255,0.7))] px-4 py-10 shadow-[0_40px_120px_-60px_rgba(28,15,132,0.5)] sm:px-8 lg:px-10"
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
            {!isFiltered && <Connector />}

            <FilterTabs active={filter} onChange={handleFilter} />

            <motion.div
              layout
              variants={staggerContainer}
              className={`grid items-start gap-5 ${isFiltered
                ? 'mx-auto max-w-2xl grid-cols-1'
                : 'sm:grid-cols-2 lg:grid-cols-3'}`}
            >
              <AnimatePresence mode="popLayout">
                {visibleBranches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    isActive={activeBranch === branch.id}
                    onToggle={() => handleToggle(branch.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.section>
  );
}
