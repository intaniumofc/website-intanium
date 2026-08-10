'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import logoNobg from '../../assets/logos/logo-nobg.webp';
import IrisStructureSection from './IrisStructureSection';
import GemintangSection from './GemintangSection';
import AboutSection3 from './AboutSection';
import { PhotoGallery } from './PhotoGallery';
import IrisPhilosophySection from './IrisPhilosophySection';
import {
  Sparkles,
  Gem,
  ChevronDown,
  Flower2,
  Star,
  Rainbow,
  Heart,
  Compass,
  Activity
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

// Static Data Constants - Makna Logo IRIS Official
const LOGO_PHILOSOPHY = [
  {
    id: 'kupu_bunga',
    title: 'Irisan Kupu-Kupu & Bunga',
    desc: 'Kupu-kupu yang saling beririsan dengan bunga iris merepresentasikan pertemuan dua figur yang berbeda, menciptakan sinergi melalui pertumbuhan, dan hubungan yang saling memengaruhi.'
  },
  {
    id: 'bunga_pelangi',
    title: 'Bunga Iris & Dewi Pelangi',
    desc: 'Bunga iris membawa dua makna: sebagai bunga merepresentasikan keindahan dan pertumbuhan; sementara dalam mitologi, Iris adalah dewi pelangi dan pembawa pesan, sebuah simbol penghubung utama.'
  },
  {
    id: 'outline_pelangi',
    title: 'Outline Terbuka Spektrum Pelangi',
    desc: 'Outline terbuka dengan warna-warna spektrum pelangi merepresentasikan keberagaman dan inklusivitas. Bentuknya yang tidak tertutup menggambarkan sebuah ruang yang selalu terbuka bagi siapa pun.'
  },
  {
    id: 'bintang',
    title: 'Bintang Resonansi Dua Arah',
    desc: 'Bintang di tengah menjadi pusat sekaligus titik resonansi dua arah: energi dan inspirasi dari Intan JKT48 memengaruhi orang-orang di dalam ruang ini, begitupun sebaliknya.'
  }
];

const MISI = [
  {
    id: 'misi-1',
    title: 'Membangun Lingkungan Fanbase yang Harmonis',
    desc: 'Membangun lingkungan fanbase yang harmonis, terbuka, dan saling menghargai, sehingga setiap intan oshi merasa nyaman untuk menjadi bagian dari IRIS.'
  },
  {
    id: 'misi-2',
    title: 'Menyalurkan Dukungan Lewat Karya Kreatif',
    desc: 'Menyatukan setiap bentuk dukungan menjadi berbagai kegiatan project dan karya kreatif yang dapat menjadi bentuk dukungan nyata, bagi perjalanan Intan di JKT48.'
  },
  {
    id: 'misi-3',
    title: 'Menjadi Jembatan Penghubung Antara Intan dan Penggemar',
    desc: 'Menjadi jembatan yang mempererat hubungan antara Intan dan para penggemarnya melalui komunikasi, interaksi dan kegiatan yang berdampak bagi setiap perjalanan Intan.'
  },
  {
    id: 'misi-4',
    title: 'Mendorong Ruang Apresiasi Terhadap Karya Intan',
    desc: 'Mendorong terciptanya ruang apresiasi terhadap setiap karya dan usaha yang telah ditunjukan oleh Intan.'
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

// Soft IRIS Brand Color Palette Logo Viewer
function LogoPngViewer({ fallbackImage, className = 'w-72 h-72 sm:w-80 sm:h-80' }) {
  return (
    <div className={`relative ${className} rounded-full border-2 border-white p-1 flex items-center justify-center shadow-[0_16px_50px_-10px_rgba(255,95,178,0.35)] overflow-hidden group select-none bg-white/40 backdrop-blur-md`}>
      {/* Soft IRIS Primary Glow Aura */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,95,178,0.25)_0%,rgba(168,85,247,0.15)_50%,transparent_75%)] opacity-80 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none" />

      {/* Inner background container */}
      <div className="absolute inset-1.5 rounded-full bg-[radial-gradient(circle_at_50%_40%,#FFF0F7_0%,#FFD6EB_40%,#FF6BB9_80%,#D83584_100%)] z-0" />

      {/* Soft pulsing rings */}
      <div className="absolute inset-4 rounded-full border border-white/60 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] z-10 pointer-events-none" />
      <div className="absolute inset-9 rounded-full border border-white/40 animate-[pulse_5s_cubic-bezier(0.4,0,0.6,1)_infinite] z-10 pointer-events-none" />

      {/* Elegant orbit ring */}
      <div
        className="absolute inset-3 rounded-full border border-white/50 border-t-pink-200 animate-[spin_20s_linear_infinite] z-10 pointer-events-none"
        style={OUTER_ORBIT_STYLE}
      />

      {/* Radiant aura */}
      <div className="absolute w-3/4 h-3/4 bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,214,237,0.5)_50%,transparent_100%)] rounded-full blur-lg pointer-events-none z-10" />

      {/* Floating crystalline butterfly medallion */}
      <motion.div
        animate={FLOAT_ANIMATE}
        transition={FLOAT_TRANSITION}
        className="w-1/2 h-1/2 flex items-center justify-center z-20 pointer-events-none"
      >
        <Image
          src={fallbackImage}
          alt="IRIS Official Logo"
          width={200}
          height={200}
          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] drop-shadow-[0_0_24px_rgba(255,95,178,0.5)]"
        />
      </motion.div>
    </div>
  );
}

// Clean, Centered, Soft-Branded Philosophy Card
function PhilosophyCard({ item, index, variants, className = '', activeId, onActivate, onDeactivate }) {
  const isActive = activeId === item.id;

  const activate = () => onActivate && onActivate(item.id);
  const deactivate = () => onDeactivate && onDeactivate();
  const toggle = () => (isActive ? deactivate() : activate());
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={CARD_SPRING}
      onHoverStart={activate}
      onHoverEnd={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      onClick={toggle}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className={`group relative cursor-pointer rounded-3xl border bg-white/90 backdrop-blur-xl p-5 outline-none transition-all duration-300 flex flex-col items-center justify-center ${isActive
        ? 'border-pink-300 shadow-[0_16px_40px_-15px_rgba(255,95,178,0.25)] ring-2 ring-[var(--color-primary)]/30 bg-white'
        : 'border-slate-100 shadow-[0_10px_30px_-15px_rgba(255,95,178,0.12)] hover:border-pink-200 hover:shadow-[0_14px_35px_-12px_rgba(255,95,178,0.2)] hover:bg-white'} ${className}`}
    >
      {/* Soft IRIS Hover Glow */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,95,178,0.08),transparent_70%)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

      <div className="flex flex-col items-center text-center space-y-2.5 w-full">
        {/* Title */}
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-[var(--color-primary)] transition-colors text-center">
          {item.title}
        </h3>

        {/* Description Rata Kanan-Kiri (Justify) */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium text-justify w-full [text-align-last:center]">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}

const CONNECTOR_PATHS = [
  { id: 'kupu_bunga', d: 'M 330 110 Q 420 180 435 235' },
  { id: 'bunga_pelangi', d: 'M 670 110 Q 580 180 565 235' },
  { id: 'outline_pelangi', d: 'M 330 450 Q 420 380 435 325' },
  { id: 'bintang', d: 'M 670 450 Q 580 380 565 325' }
];

function OrbitConnectors({ activeId }) {
  return (
    <svg
      viewBox="0 0 1000 560"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
      fill="none"
    >
      {CONNECTOR_PATHS.map((path) => {
        const isActive = activeId === path.id;
        return (
          <g key={path.id}>
            {/* Connector Line Path */}
            <motion.path
              d={path.d}
              stroke="#FF5FB2"
              strokeOpacity={isActive ? 0.95 : 0.4}
              strokeWidth={isActive ? 3.5 : 1.75}
              strokeDasharray={isActive ? "none" : "5 5"}
              strokeLinecap="round"
              style={{
                filter: isActive ? 'drop-shadow(0 0 10px rgba(255,95,178,0.85))' : 'drop-shadow(0 0 3px rgba(255,95,178,0.2))',
                transition: 'stroke-width 0.3s ease, stroke-opacity 0.3s ease, filter 0.3s ease'
              }}
            />
          </g>
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

      {/* Twinkling sparkles */}
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

export default function AboutIrisPage() {
  const [activeId, setActiveId] = useState(null);
  const [openMisiIndex, setOpenMisiIndex] = useState(0);
  const handleDeactivatePhil = () => setActiveId(null);
  const handleToggleMisi = (index) => {
    setOpenMisiIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 space-y-24 sm:space-y-32 max-w-6xl mx-auto pt-0 pb-8 px-1 overflow-visible">
        {/* Subtle Floating Decorative Orb in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-112.5 h-112.5 bg-linear-to-tr from-(--color-primary)/5 to-(--color-secondary)/5 rounded-full blur-[6.25rem] pointer-events-none -z-10" />

        {/* ================= HERO SECTION ================= */}
        <AboutSection3 />

        {/* ================= FILOSOFI NAMA IRIS ================= */}
        <IrisPhilosophySection />

        {/* ================= TAGLINE #GEMINTANG ================= */}
        <GemintangSection />

        {/* ================= FILOSOFI LOGO ================= */}
        <motion.section
          id="filosofi-logo"
          initial="hidden"
          whileInView="visible"
          viewport={FILOSOFI_VIEWPORT}
          variants={FILOSOFI_SECTION_VARIANTS}
          className="relative space-y-10 py-6 overflow-visible"
        >
          <DecorativeSparkles />

          {/* Section Title */}
          <motion.div variants={sectionReveal} className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Filosofi Logo <span className="text-[var(--color-primary)]">IRIS</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
              Representasi sebuah ruang harmonis yang dibentuk oleh sinergi, pertumbuhan, dan inspirasi dua arah antara Intan JKT48 dan seluruh pendukungnya.
            </p>
          </motion.div>

          {/* --- DESKTOP: Constellation Map (Simetris 4-Card Grid) --- */}
          <div className="relative hidden lg:block w-full max-w-6xl mx-auto min-h-[580px] overflow-visible">
            <OrbitConnectors activeId={activeId} />

            {/* Center Logo Medallion */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
              <motion.div
                variants={logoMedallionReveal}
                className="relative flex items-center justify-center"
              >
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-200/30 animate-[pulse_6s_ease-in-out_infinite]" />

                <LogoPngViewer
                  fallbackImage={logoNobg}
                  className="w-48 h-48 xl:w-52 xl:h-52"
                />
              </motion.div>
            </div>

            {/* Node 1: Irisan Kupu-Kupu & Bunga (Top Left) */}
            <div className="absolute left-[0%] top-[2%] w-[330px] xl:w-[370px] z-20">
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

            {/* Node 2: Bunga Iris & Dewi Pelangi (Top Right) */}
            <div className="absolute right-[0%] top-[2%] w-[330px] xl:w-[370px] z-20">
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

            {/* Node 3: Outline Terbuka Spektrum Pelangi (Bottom Left) */}
            <div className="absolute left-[0%] bottom-[2%] w-[330px] xl:w-[370px] z-20">
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

            {/* Node 4: Bintang Resonansi Dua Arah (Bottom Right) */}
            <div className="absolute right-[0%] bottom-[2%] w-[330px] xl:w-[370px] z-20">
              <PhilosophyCard
                item={LOGO_PHILOSOPHY[3]}
                index={3}
                variants={philosophyCardReveal}
                className="w-full"
                activeId={activeId}
                onActivate={setActiveId}
                onDeactivate={handleDeactivatePhil}
              />
            </div>
          </div>

          {/* --- MOBILE / TABLET: Clean Flow Layout --- */}
          <div className="lg:hidden flex flex-col items-center space-y-6">
            <motion.div variants={logoMedallionReveal} className="relative flex items-center justify-center">
              <LogoPngViewer fallbackImage={logoNobg} className="w-52 h-52 sm:w-60 sm:h-60" />
            </motion.div>

            {/* Vertikal Connector Line Glowing */}
            <div className="my-2 h-10 w-0.5 bg-gradient-to-b from-pink-300 to-transparent" />

            <div className="grid grid-cols-1 gap-4 w-full px-2 max-w-md">
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
            </div>
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
            className="hidden lg:block w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[580px] py-12 overflow-hidden bg-[var(--color-bg-secondary)]"
          >
            {/* Background Panels with Shutter slide-in */}
            {/* VISI Panel (Left Side) */}
            <motion.div
              variants={visiCardVariants}
              style={VISI_CLIP}
              className="absolute inset-0 bg-gradient-to-br from-[var(--color-iris-pink-dark)] via-[#B83E9C] to-[var(--color-iris-purple-dark)] z-10"
            />
            {/* MISI Panel (Right Side) */}
            <motion.div
              variants={misiCardVariants}
              style={MISI_CLIP}
              className="absolute inset-0 bg-white z-10"
            />
            {/* Content Layer */}
            <div className="relative z-20 max-w-6xl mx-auto h-full grid grid-cols-12 items-center px-6">
              {/* VISI Content */}
              <motion.div
                variants={textRevealVariants}
                className="col-span-4 col-start-1 flex flex-col justify-start items-center text-center text-white space-y-6 pt-4"
              >
                <div className="flex flex-col items-center">
                  <h3 className="text-4xl font-black tracking-widest text-white drop-shadow-md">VISI</h3>
                  <div className="w-16 h-1 bg-white/90 rounded-full mt-2 shadow-sm" />
                </div>
                <p className="text-base sm:text-lg font-medium leading-relaxed italic text-white/95 max-w-sm drop-shadow-sm">
                  “Mewujudkan wadah yang harmonis dan terbuka bagi seluruh penggemar untuk menyatukan setiap bentuk dukungan menjadi gerakan bersama yang kreatif demi mengiringi perjalanan Intan, serta menjadi jembatan yang mempererat hubungan antara Intan dan para penggemarnya."
                </p>
              </motion.div>

              {/* MISI Content */}
              <motion.div
                variants={textRevealVariants}
                className="col-span-5 col-start-8 flex flex-col justify-start items-start text-[var(--color-primary)] space-y-6 pt-4"
              >
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-4xl font-black tracking-widest text-[var(--color-primary)]">MISI</h3>
                  <div className="w-16 h-1 bg-[var(--color-primary)] rounded-full mt-2" />
                </div>
                
                {/* Accordion Misi Desktop */}
                <div className="space-y-3 w-full max-w-md">
                  {MISI.map((item, index) => {
                    const isOpen = openMisiIndex === index;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? 'bg-gradient-to-r from-pink-50/90 to-purple-50/90 border-[var(--color-primary)]/50 shadow-md ring-1 ring-[var(--color-primary)]/20'
                            : 'bg-white/90 border-slate-200/90 hover:border-pink-300/70 hover:bg-slate-50/90'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleMisi(index)}
                          className="w-full flex items-center justify-between p-3.5 text-left focus:outline-none cursor-pointer group"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-3 pr-2">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                                isOpen
                                  ? 'bg-[var(--color-primary)] text-white shadow-md scale-105'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-[var(--color-primary)] group-hover:text-white'
                              }`}
                            >
                              0{index + 1}
                            </span>
                            <h4 className="font-extrabold text-sm text-[var(--color-primary)] leading-snug">
                              {item.title}
                            </h4>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 text-[var(--color-primary)] transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-[var(--color-primary)]'
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 pl-13 text-xs text-[var(--text-secondary)] font-medium leading-relaxed border-t border-pink-100/60">
                                {item.desc}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile/Tablet Version: Full-Bleed Stacked Layout */}
          <div className="block lg:hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] space-y-0">
            {/* VISI Section */}
            <div className="bg-gradient-to-br from-[var(--color-iris-pink-dark)] via-[#B83E9C] to-[var(--color-iris-purple-dark)] text-white py-16 px-6">
              <div className="max-w-xl mx-auto text-center space-y-4">
                <h3 className="text-3xl font-black tracking-widest text-white drop-shadow-md">VISI</h3>
                <div className="w-16 h-1 bg-white/90 rounded-full mx-auto shadow-sm" />
                <p className="text-base sm:text-lg font-medium leading-relaxed italic text-white/95 drop-shadow-sm">
                  “Mewujudkan wadah yang harmonis dan terbuka bagi seluruh penggemar untuk menyatukan setiap bentuk dukungan menjadi gerakan bersama yang kreatif demi mengiringi perjalanan Intan, serta menjadi jembatan yang mempererat hubungan antara Intan dan para penggemarnya.”
                </p>
              </div>
            </div>

            {/* MISI Section Accordion Mobile */}
            <div className="bg-white text-[var(--color-primary)] py-16 px-6 border-b border-[var(--border-color)]">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-3xl font-black tracking-widest text-[var(--color-primary)]">MISI</h3>
                  <div className="w-16 h-1 bg-[var(--color-primary)] rounded-full mt-2" />
                </div>
                
                <div className="space-y-3.5 max-w-xl mx-auto">
                  {MISI.map((item, index) => {
                    const isOpen = openMisiIndex === index;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isOpen
                            ? 'bg-gradient-to-r from-pink-50/90 to-purple-50/90 border-[var(--color-primary)]/50 shadow-md ring-1 ring-[var(--color-primary)]/20'
                            : 'bg-white border-slate-200 hover:border-pink-300/70 hover:bg-slate-50/80'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleMisi(index)}
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none cursor-pointer group"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center gap-3.5 pr-2">
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                                isOpen
                                  ? 'bg-[var(--color-primary)] text-white shadow-md scale-105'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-[var(--color-primary)] group-hover:text-white'
                              }`}
                            >
                              0{index + 1}
                            </span>
                            <h4 className="font-extrabold text-sm sm:text-base text-[var(--color-primary)] leading-snug">
                              {item.title}
                            </h4>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 shrink-0 text-[var(--color-primary)] transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-[var(--color-primary)]' : 'text-slate-400 group-hover:text-[var(--color-primary)]'
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 pl-14 text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed border-t border-pink-100/60">
                                {item.desc}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <IrisStructureSection />

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
