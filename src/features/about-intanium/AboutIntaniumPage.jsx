import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/constants';
import logoNobg from '../../assets/logos/logo-nobg.png';
import IntaniumStructureSection from './IntaniumStructureSection';
import AboutSection3 from './AboutSection';
import { PhotoGallery } from './PhotoGallery';
import {
  Sparkles,
  Users,
  Heart,
  Music,
  Star,
  Crown,
  ArrowRight,
  Gem
} from 'lucide-react';

const ButterflySVG = ({ className }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Geometric Left Wing */}
    <path d="M60 50 L15 30 L5 60 L30 85 L60 100 Z" fill="currentColor" fillOpacity="0.02" />
    <path d="M60 50 L25 15 L50 10 L60 35 Z" fill="currentColor" fillOpacity="0.02" />
    <path d="M60 50 L35 40 L30 65 L45 80 L60 90 Z" />
    {/* Geometric Right Wing */}
    <path d="M60 50 L105 30 L115 60 L90 85 L60 100 Z" fill="currentColor" fillOpacity="0.02" />
    <path d="M60 50 L95 15 L70 10 L60 35 Z" fill="currentColor" fillOpacity="0.02" />
    <path d="M60 50 L85 40 L90 65 L75 80 L60 90 Z" />
    {/* Antennae */}
    <path d="M57 32 C55 18 45 12 40 15" />
    <path d="M63 32 C65 18 75 12 80 15" />
    {/* Center body / diamond */}
    <path d="M60 25 L65 48 L60 95 L55 48 Z" fill="currentColor" fillOpacity="0.05" />
  </svg>
);

// Static Data Constants
const LOGO_PHILOSOPHY = [
  {
    id: 'logo-1',
    icon: Sparkles,
    title: 'Cahaya',
    desc: 'Dari makna ‘Nur’, cahaya menjadi simbol harapan, kehangatan, dan pancaran diri yang terus tumbuh.'
  },
  {
    id: 'logo-2',
    icon: Gem,
    title: 'Permata',
    desc: 'Terinspirasi dari ‘Intan’, permata melambangkan keindahan, keteguhan, dan kilau yang lahir dari proses.'
  },
  {
    id: 'logo-3',
    icon: ButterflySVG,
    title: 'Kupu-Kupu',
    desc: 'Kupu-kupu merepresentasikan gerak, transformasi, dan kelembutan — seperti tarian yang ringan namun penuh makna.'
  }
];

const MISI = [
  {
    id: 'misi-1',
    title: 'Mendukung perjalanan Nur Intan di JKT48',
    desc: 'Memberikan dukungan positif dan konsisten kepada Nur Intan dalam meraih mimpi serta mengembangkan potensinya di JKT48.'
  },
  {
    id: 'misi-2',
    title: 'Membangun wadah komunitas yang nyaman',
    desc: 'Menciptakan ruang organisasi yang aman, ramah, dan menyenangkan bagi seluruh fans Nur Intan untuk saling berinteraksi, berkolaborasi, dan berkembang bersama.'
  },
  {
    id: 'misi-3',
    title: 'Menghadirkan berbagai proyek untuk Nur Intan',
    desc: 'Merancang dan melaksanakan proyek-proyek kreatif sebagai bentuk apresiasi, dukungan, dan cinta dari fans untuk Nur Intan selama perjalanannya di JKT48.'
  }
];

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: PREMIUM_EASE
    }
  }
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: PREMIUM_EASE
    }
  }
};

const visiMisiContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const visiCardVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1.1,
      ease: PREMIUM_EASE
    }
  }
};

const misiCardVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 1.1,
      ease: PREMIUM_EASE
    }
  }
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.5,
      ease: PREMIUM_EASE
    }
  }
};

// === Variants khusus section Filosofi Logo (constellation) ===
const philosophyCardReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.96, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: PREMIUM_EASE }
  }
};

const logoMedallionReveal = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.05, ease: PREMIUM_EASE }
  }
};

const connectorReveal = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 1.4, ease: PREMIUM_EASE, delay: 0.55 }
  }
};

// === Konstanta objek inline (dipisah agar JSX tidak memakai kurawal ganda) ===
const FLOAT_ANIMATE = { y: [0, -6, 0], rotate: [0, 1, -1, 0] };
const FLOAT_TRANSITION = { repeat: Infinity, duration: 7, ease: 'easeInOut' };
const OUTER_ORBIT_STYLE = { transform: 'rotateX(60deg) rotateY(12deg)' };
const INNER_ORBIT_STYLE = { transform: 'rotateX(55deg) rotateY(-20deg)' };

const CARD_HOVER = { y: -6, scale: 1.015 };
const CARD_SPRING = { type: 'spring', stiffness: 350, damping: 22 };

const FILOSOFI_VIEWPORT = { once: true, amount: 0.2, margin: '-80px' };
const FILOSOFI_SECTION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.16, delayChildren: 0.08 }
  }
};
const SOFT_VIEWPORT = { once: true, amount: 0.15 };
const VISIMISI_VIEWPORT = { once: true, margin: '-100px' };
const VISI_CLIP = { clipPath: 'polygon(0 0, 50vw 0, calc(50vw - 80px) 100%, 0 100%)' };
const MISI_CLIP = { clipPath: 'polygon(50vw 0, 100% 0, 100% 100%, calc(50vw - 80px) 100%)' };

function LogoPngViewer({ fallbackImage, className = 'w-72 h-72 sm:w-80 sm:h-80' }) {
  return (
    <div className={`relative ${className} rounded-full bg-[radial-gradient(circle_at_30%_25%,#737985_0%,#4B5563_45%,#272B33_100%)] border border-white/10 p-1 flex items-center justify-center shadow-[0_18px_60px_-25px_rgba(55,65,81,0.7)] overflow-hidden group select-none`}>
      {/* Soft pulsing rings — pearl/lavender, very low opacity */}
      <div className="absolute inset-4 rounded-full border border-white/10 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0 pointer-events-none" />
      <div className="absolute inset-9 rounded-full border border-white/[0.06] animate-[pulse_5s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0 pointer-events-none" />

      {/* Thin lavender orbit (menggantikan cyan ring yang kuat) */}
      <div
        className="absolute inset-3 rounded-full border border-purple-200/15 border-t-purple-200/40 animate-[spin_16s_linear_infinite] z-10 pointer-events-none"
        style={OUTER_ORBIT_STYLE}
      />
      {/* Thin indigo orbit, reverse */}
      <div
        className="absolute inset-7 rounded-full border border-indigo-200/10 border-b-indigo-200/30 animate-[spin_11s_linear_infinite_reverse] z-10 pointer-events-none"
        style={INNER_ORBIT_STYLE}
      />

      {/* Pearl backplate glow (soft, not neon) */}
      <div className="absolute w-2/3 h-2/3 bg-[radial-gradient(circle,rgba(214,206,255,0.35)_0%,rgba(196,181,253,0.12)_55%,transparent_75%)] rounded-full blur-2xl pointer-events-none z-0" />

      {/* Floating crystalline butterfly medallion */}
      <motion.div
        animate={FLOAT_ANIMATE}
        transition={FLOAT_TRANSITION}
        className="w-1/2 h-1/2 flex items-center justify-center z-20 pointer-events-none"
      >
        <img
          src={fallbackImage}
          alt="Intanium Official Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_0_14px_rgba(221,214,254,0.55)]"
        />
      </motion.div>
    </div>
  );
}

// Premium glass philosophy card (interaktif: hover/tap menyalakan konektor ke logo)
function PhilosophyCard({ item, index, variants, className = '', activeId, onActivate, onDeactivate }) {
  const Icon = item.icon;
  const num = String(index + 1).padStart(2, '0');
  const isActive = activeId === item.id;

  const activate = () => onActivate && onActivate(item.id);
  const deactivate = () => onDeactivate && onDeactivate();
  const toggle = () => (isActive ? deactivate() : activate());

  return (
    <motion.div
      variants={variants}
      whileHover={CARD_HOVER}
      transition={CARD_SPRING}
      onHoverStart={activate}
      onHoverEnd={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      onClick={toggle}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className={`group relative cursor-pointer rounded-3xl border bg-white/55 backdrop-blur-xl p-5 outline-none transition-all duration-500 ${isActive
        ? 'border-(--color-primary)/55 shadow-[0_26px_64px_-26px_rgba(124,58,237,0.55)] ring-1 ring-(--color-primary)/25'
        : 'border-white/70 shadow-[0_18px_50px_-28px_rgba(28,15,132,0.45)] hover:border-white/90'} ${className}`}
    >
      {/* Ambient glow saat aktif/hover */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_30%_0%,rgba(196,181,253,0.22),transparent_70%)] transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

      <div className="flex gap-4 items-start">
        {/* Crystalline glass icon tile */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-(--color-primary)/35 font-mono tracking-widest">{num}</span>
          <span className={`relative w-10 h-10 rounded-2xl border border-white/80 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_6px_16px_-8px_rgba(124,58,237,0.5)] transition-all duration-500 overflow-hidden ${isActive
            ? 'scale-110 text-white bg-[linear-gradient(140deg,var(--color-primary),#7C3AED)]'
            : 'text-(--color-primary) bg-[linear-gradient(140deg,rgba(255,255,255,0.85),rgba(221,214,254,0.55))] group-hover:scale-110'}`}>
            <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.8),transparent_60%)] opacity-70" />
            <Icon className="relative size-4.5" />
          </span>
        </div>

        {/* Title + description */}
        <div className="space-y-1 text-left">
          <h3 className="font-extrabold text-sm text-(--color-primary) leading-tight">{item.title}</h3>
          <p className="text-xs text-(--text-secondary) leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Mapping connector → philosophy id (untuk highlight interaktif)
const CONNECTOR_PATHS = [
  { id: 'logo-1', d: 'M315 115 Q405 200 455 260', cx: 455, cy: 260 },
  { id: 'logo-2', d: 'M685 115 Q595 200 545 260', cx: 545, cy: 260 },
  {
    id: 'logo-3',
    d: 'M500 520 Q500 395 500 335',
    cx: 500,
    cy: 335,
    gradient: 'connectorGradVertical',
    activeGradient: 'connectorGradVerticalActive'
  }
];
const CIRCLE_TRANSITION_STYLE = { transition: 'fill 0.3s ease, fill-opacity 0.3s ease' };

// Desktop-only SVG overlay: garis connector yang menyala saat kartu aktif
function OrbitConnectors({ activeId }) {
  return (
    <svg
      viewBox="0 0 1000 620"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      fill="none"
    >
      <defs>
        <linearGradient id="connectorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="connectorGradActive" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#7C3AED" stopOpacity="1" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="connectorGradVertical" gradientUnits="userSpaceOnUse" x1="500" y1="520" x2="500" y2="335">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="connectorGradVerticalActive" gradientUnits="userSpaceOnUse" x1="500" y1="520" x2="500" y2="335">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#7C3AED" stopOpacity="1" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {CONNECTOR_PATHS.map((path) => {
        const isActive = activeId === path.id;
        const gradient = path.gradient || 'connectorGrad';
        const activeGradient = path.activeGradient || 'connectorGradActive';
        const pathStyle = {
          strokeWidth: isActive ? 2.6 : 1.5,
          filter: isActive ? 'drop-shadow(0 0 6px rgba(124,58,237,0.6))' : 'none',
          transition: 'stroke-width 0.35s ease, filter 0.35s ease'
        };
        return (
          <motion.path
            key={path.id}
            variants={connectorReveal}
            d={path.d}
            stroke={`url(#${isActive ? activeGradient : gradient})`}
            strokeLinecap="round"
            style={pathStyle}
          />
        );
      })}

      {CONNECTOR_PATHS.map((path) => {
        const isActive = activeId === path.id;
        return (
          <motion.circle
            key={`dot-${path.id}`}
            variants={connectorReveal}
            cx={path.cx}
            cy={path.cy}
            r={isActive ? 4 : 2.5}
            fill={isActive ? '#7C3AED' : '#C4B5FD'}
            fillOpacity={isActive ? 1 : 0.6}
            style={CIRCLE_TRANSITION_STYLE}
          />
        );
      })}
    </svg>
  );
}

// Background dekoratif subtle: blurred orb, sparkles, crystalline petals
function DecorativeSparkles() {
  const sparkles = [
    { top: '12%', left: '18%', size: 10, delay: 0 },
    { top: '22%', left: '78%', size: 8, delay: 0.8 },
    { top: '68%', left: '12%', size: 9, delay: 1.4 },
    { top: '78%', left: '82%', size: 7, delay: 0.4 },
    { top: '40%', left: '50%', size: 6, delay: 1.1 },
    { top: '58%', left: '64%', size: 8, delay: 1.8 }
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blurred lavender/indigo orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.18),rgba(129,140,248,0.08)_55%,transparent_75%)] blur-[5rem]" />

      {/* Crystalline petals (opacity sangat rendah) */}
      <ButterflySVG className="absolute -top-6 right-[14%] w-24 h-24 text-purple-300/10 rotate-12" />
      <ButterflySVG className="absolute bottom-2 left-[8%] w-20 h-20 text-indigo-300/10 -rotate-12" />

      {/* Tiny twinkling sparkles */}
      {sparkles.map((s, i) => {
        const spanStyle = { top: s.top, left: s.left };
        const spanAnimate = { opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.1, 0.8] };
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

export default function AboutIntaniumPage() {
  const [activeId, setActiveId] = useState(null);
  const handleDeactivatePhil = () => setActiveId(null);

  // Set document title on mount for SEO best practices
  useEffect(() => {
    document.title = 'Tentang Intanium | Official Community Space';
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-24 sm:space-y-32 max-w-6xl mx-auto pt-0 pb-8 px-1 overflow-visible">
        {/* Subtle Floating Decorative Orb in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-112.5 h-112.5 bg-linear-to-tr from-(--color-primary)/5 to-(--color-secondary)/5 rounded-full blur-[6.25rem] pointer-events-none -z-10" />

        {/* ================= HERO SECTION ================= */}
        <AboutSection3 />

        {/* ================= FILOSOFI LOGO ================= */}
        <motion.section
          id="filosofi-logo"
          initial="hidden"
          whileInView="visible"
          viewport={FILOSOFI_VIEWPORT}
          variants={FILOSOFI_SECTION_VARIANTS}
          className="relative space-y-7"
        >
          {/* Section Title */}
          <motion.div variants={sectionReveal} className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-(--color-primary)">
              Filosofi Logo Intanium
            </h2>
            <p className="text-sm text-(--text-secondary) leading-relaxed">
              Setiap garis, kilau, dan gerak dalam logo Intanium menyimpan makna tentang cahaya, keteguhan, dan transformasi diri.
            </p>
          </motion.div>

          {/* --- DESKTOP: Constellation / Orbit Map --- */}
          <div className="relative hidden lg:block w-full max-w-6xl mx-auto min-h-[640px] overflow-visible">
            <DecorativeSparkles />
            <OrbitConnectors activeId={activeId} />

            {/* Center medallion wrapper: posisi di div biasa */}
            <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
              <motion.div
                variants={logoMedallionReveal}
                className="relative flex items-center justify-center"
              >
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-300/15" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-indigo-300/15" />

                <LogoPngViewer
                  fallbackImage={logoNobg}
                  className="w-52 h-52 xl:w-56 xl:h-56"
                />
              </motion.div>
            </div>

            {/* Card 1: Cahaya */}
            <div className="absolute left-[10%] top-[3%] w-[320px] z-20">
              <PhilosophyCard
                item={LOGO_PHILOSOPHY[0]}
                index={0}
                variants={philosophyCardReveal}
                className="w-full"
                activeId={activeId}
                onActivate={setActiveId}
                onDeactivate={handleDeactivatePhil}
              />
            </div>

            {/* Card 2: Permata */}
            <div className="absolute right-[10%] top-[3%] w-[320px] z-20">
              <PhilosophyCard
                item={LOGO_PHILOSOPHY[1]}
                index={1}
                variants={philosophyCardReveal}
                className="w-full"
                activeId={activeId}
                onActivate={setActiveId}
                onDeactivate={handleDeactivatePhil}
              />
            </div>

            {/* Card 3: Kupu-Kupu */}
            <div className="absolute left-1/2 bottom-[4%] w-[420px] -translate-x-1/2 z-20">
              <PhilosophyCard
                item={LOGO_PHILOSOPHY[2]}
                index={2}
                variants={philosophyCardReveal}
                className="w-full"
                activeId={activeId}
                onActivate={setActiveId}
                onDeactivate={handleDeactivatePhil}
              />
            </div>
          </div>

          {/* --- MOBILE / TABLET: Clean stacked layout --- */}
          <div className="lg:hidden flex flex-col items-center">
            <motion.div variants={scaleIn} className="relative flex items-center justify-center">
              <LogoPngViewer fallbackImage={logoNobg} className="w-60 h-60 sm:w-64 sm:h-64" />
            </motion.div>

            {/* Connector vertikal kecil yang glowing */}
            <motion.div
              variants={sectionReveal}
              className="my-5 h-10 w-px bg-[linear-gradient(to_bottom,transparent,rgba(167,139,250,0.6),transparent)]"
            />

            <motion.div
              className="grid grid-cols-1 gap-4 w-full px-4 max-w-md"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={SOFT_VIEWPORT}
            >
              {LOGO_PHILOSOPHY.map((item, index) => (
                <PhilosophyCard
                  key={item.id}
                  item={item}
                  index={index}
                  variants={philosophyCardReveal}
                  className="relative w-full"
                  activeId={activeId}
                  onActivate={setActiveId}
                  onDeactivate={handleDeactivatePhil}
                />
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ================= VISI & MISI ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={VISIMISI_VIEWPORT}
          variants={sectionReveal}
          className="space-y-12 relative"
        >
          {/* Desktop Version: Full-Bleed Diagonal Layout */}
          <motion.div
            variants={visiMisiContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VISIMISI_VIEWPORT}
            className="hidden lg:block w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[550px] overflow-hidden bg-[#090530]"
          >
            {/* Background Panels with Shutter slide-in */}
            {/* VISI Panel (Left Side) */}
            <motion.div
              variants={visiCardVariants}
              style={VISI_CLIP}
              className="absolute inset-0 bg-[#170C79] z-10"
            />
            {/* MISI Panel (Right Side) */}
            <motion.div
              variants={misiCardVariants}
              style={MISI_CLIP}
              className="absolute inset-0 bg-white z-10"
            />
            {/* Content Layer */}
            <div className="relative z-20 max-w-6xl mx-auto h-full grid grid-cols-12 items-stretch px-6">
              {/* VISI Content */}
              <motion.div
                variants={textRevealVariants}
                className="col-span-4 col-start-1 flex flex-col justify-start items-center text-center text-white space-y-6 pt-16"
              >
                <div className="flex flex-col items-center">
                  <h3 className="text-4xl font-black tracking-widest text-white">VISI</h3>
                  <div className="w-16 h-1 bg-cyan-400 rounded-full mt-2" />
                </div>
                <p className="text-base sm:text-lg font-medium leading-relaxed italic text-white/90 max-w-sm">
                  “Menjadi komunitas fans Nur Intan yang solid, suportif, dan harmonis, dengan menjunjung tinggi kebersamaan, kerja sama, serta rasa kekeluargaan antar anggota.”
                </p>
              </motion.div>

              {/* MISI Content */}
              <motion.div
                variants={textRevealVariants}
                className="col-span-5 col-start-8 flex flex-col justify-start items-start text-(--color-primary) space-y-6 pt-16"
              >
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-4xl font-black tracking-widest text-(--color-primary)">MISI</h3>
                  <div className="w-16 h-1 bg-(--color-primary) rounded-full mt-2" />
                </div>
                <ul className="space-y-6 text-sm text-(--text-secondary) w-full max-w-md">
                  {MISI.map((item, index) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-lg bg-(--color-primary) text-white flex items-center justify-center shrink-0 text-xs font-black shadow-md mt-1">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-(--color-primary) leading-snug">{item.title}</h4>
                        <p className="text-sm text-(--text-secondary) font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile/Tablet Version: Full-Bleed Stacked Layout (No Cards) */}
          <div className="block lg:hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] space-y-0">
            {/* VISI Section */}
            <div className="bg-[#170C79] text-white py-16 px-6">
              <div className="max-w-xl mx-auto text-center space-y-4">
                <h3 className="text-3xl font-black tracking-widest text-white">VISI</h3>
                <p className="text-base sm:text-lg font-medium leading-relaxed italic text-white/90">
                  “Menjadi komunitas fans Nur Intan yang solid, suportif, dan harmonis, dengan menjunjung tinggi kebersamaan, kerja sama, serta rasa kekeluargaan antar anggota.”
                </p>
              </div>
            </div>

            {/* MISI Section */}
            <div className="bg-white text-(--color-primary) py-16 px-6 border-b border-(--border-color)">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-3xl font-black tracking-widest text-(--color-primary)">MISI</h3>
                </div>
                <ul className="space-y-5 max-w-xl mx-auto text-sm sm:text-base text-(--text-secondary)">
                  {MISI.map((item, index) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-lg bg-(--color-primary) text-white flex items-center justify-center shrink-0 text-xs font-black shadow-md mt-1">
                        0{index + 1}
                      </span>
                      <div className="space-y-1 text-left">
                        <h4 className="font-extrabold text-base text-(--color-primary) leading-snug">{item.title}</h4>
                        <p className="text-sm text-(--text-secondary) font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        <IntaniumStructureSection />

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={SOFT_VIEWPORT}
          variants={sectionReveal}
        >
          <PhotoGallery />
        </motion.section>
      </div>
    </div>
  );
}
