import { useEffect } from 'react';
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
    desc: 'Layaknya seperti nama depan dari Intan, yaitu "Nur" yang memiliki arti "Cahaya". Dan mempunyai harapan akan berkilau seperti permata yang indah nantinya.'
  },
  {
    id: 'logo-2',
    icon: Gem,
    title: 'Permata',
    desc: 'Mengutip dari nama belakang Nur Intan, yaitu "Intan". Dan juga jikoshoukainya, yaitu "Intan permata yang berkilau, temukan cahayaku dihatimu!"'
  },
  {
    id: 'logo-3',
    icon: ButterflySVG,
    title: 'Kupu-Kupu',
    desc: 'Kupu-kupu sering diartikan sebagai seorang penari yang sangat lincah, seperti Intan yang sangat pandai dalam menari.'
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

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: PREMIUM_EASE
    }
  }
};

const logoCardLeftReveal = {
  hidden: { opacity: 0, x: -42, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: PREMIUM_EASE
    }
  }
};

const logoCardRightReveal = {
  hidden: { opacity: 0, x: 42, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: PREMIUM_EASE
    }
  }
};

const logoCardBottomReveal = {
  hidden: { opacity: 0, x: '-50%', y: 38, scale: 0.96, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    x: '-50%',
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      ease: PREMIUM_EASE
    }
  }
};

const logoShowcaseReveal = {
  hidden: { opacity: 0, x: '-50%', y: '-50%', scale: 0.9, rotate: -3 },
  visible: {
    opacity: 1,
    x: '-50%',
    y: '-50%',
    scale: 1,
    rotate: 0,
    transition: {
      duration: 1,
      ease: PREMIUM_EASE
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
function LogoPngViewer({ fallbackImage, className = 'w-72 h-72 sm:w-80 sm:h-80' }) {
  return (
    <div className={`relative ${className} rounded-full bg-linear-to-br from-[#07032D] via-[#0E074A] to-[#1C0F84] border border-white/10 p-1 flex items-center justify-center shadow-lg overflow-hidden group select-none`}>
      {/* Soft pulsing border rings inside the container */}
      <div className="absolute inset-4 rounded-full border border-white/10 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0 pointer-events-none" />
      <div className="absolute inset-8 rounded-full border border-white/5 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0 pointer-events-none" />

      {/* Symmetrical glowing orbits (Holographic style) */}
      {/* Outer Cyan Ring */}
      <div className="absolute inset-2 rounded-full border border-cyan-400/20 border-t-cyan-400/40 animate-[spin_12s_linear_infinite] z-10 pointer-events-none" style={{ transform: 'rotateX(60deg) rotateY(15deg)' }} />
      {/* Inner Purple Ring */}
      <div className="absolute inset-6 rounded-full border border-purple-400/10 border-b-purple-400/30 animate-[spin_8s_linear_infinite_reverse] z-10 pointer-events-none" style={{ transform: 'rotateX(55deg) rotateY(-20deg)' }} />

      {/* Glowing backplate blur */}
      <div className="absolute w-2/3 h-2/3 bg-linear-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Floating Logo Image */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, 1.5, -1.5, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut"
        }}
        className="w-1/2 h-1/2 flex items-center justify-center z-20 pointer-events-none"
      >
        <img
          src={fallbackImage}
          alt="Intanium Official Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
        />
      </motion.div>
    </div>
  );
}

export default function AboutIntaniumPage() {
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
          viewport={{ once: true, amount: 0.22, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.16,
                delayChildren: 0.08
              }
            }
          }}
          className="space-y-8 relative"
        >
          {/* Section Title */}
          <motion.div variants={sectionReveal} className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-(--color-primary)">
              Filosofi Logo Intanium
            </h2>
            <p className="text-sm text-(--text-secondary) leading-relaxed">
              Di balik setiap elemen logo Intanium, tersimpan cerita tentang impian, dedikasi,
              dan kebersamaan komunitas yang tumbuh bersama untuk mendukung perjalanan Nur Intan.
            </p>
          </motion.div>

          {/* --- DESKTOP: Overlapping Symmetrical Layout --- */}
          <div className="relative min-h-130 w-full max-w-5xl mx-auto hidden lg:block overflow-visible">
            {/* Centered Logo Showcase in Background */}
            <motion.div variants={logoShowcaseReveal} className="absolute left-1/2 top-[48%] w-97.5 h-97.5 flex flex-col items-center justify-center z-0">
              <LogoPngViewer
                fallbackImage={logoNobg}
                className="w-85 h-85"
              />
            </motion.div>

            {/* Card 1: Cahaya (Top Left Overlapping, Horizontal/Elongated) */}
            <motion.div
              variants={logoCardLeftReveal}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="absolute left-0 top-[8%] max-w-107.5 glass-panel logo-philosophy-card rounded-2xl p-5 border border-white/60 bg-white/45 backdrop-blur-md shadow-lg hover:bg-white/80 z-10 cursor-default group"
            >
              <div className="flex gap-4 items-start">
                {/* Left Column: Number + Icon */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-(--color-primary)/40 font-mono">1</span>
                  <span className="w-9 h-9 rounded-xl bg-(--color-primary-light) flex items-center justify-center text-(--color-primary) group-hover:scale-110 group-hover:bg-(--color-primary) group-hover:text-white transition-all duration-300">
                    <Sparkles className="size-4.5" />
                  </span>
                </div>
                {/* Right Column: Title + Description */}
                <div className="space-y-1 text-left">
                  <h3 className="font-extrabold text-sm text-(--color-primary) leading-tight">Cahaya</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">
                    Layaknya seperti nama depan dari Intan, yaitu "Nur" yang memiliki arti "Cahaya". Dan mempunyai harapan akan berkilau seperti permata yang indah nantinya.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Permata (Top Right Overlapping, Horizontal/Elongated) */}
            <motion.div
              variants={logoCardRightReveal}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="absolute right-0 top-[8%] max-w-107.5 glass-panel logo-philosophy-card rounded-2xl p-5 border border-white/60 bg-white/45 backdrop-blur-md shadow-lg hover:bg-white/80 z-10 cursor-default group"
            >
              <div className="flex gap-4 items-start">
                {/* Left Column: Number + Icon */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-(--color-primary)/40 font-mono">2</span>
                  <span className="w-9 h-9 rounded-xl bg-(--color-primary-light) flex items-center justify-center text-(--color-primary) group-hover:scale-110 group-hover:bg-(--color-primary) group-hover:text-white transition-all duration-300">
                    <Gem className="size-4.5" />
                  </span>
                </div>
                {/* Right Column: Title + Description */}
                <div className="space-y-1 text-left">
                  <h3 className="font-extrabold text-sm text-(--color-primary) leading-tight">Permata</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">
                    Mengutip dari nama belakang Nur Intan, yaitu "Intan". Dan juga jikoshoukainya, yaitu "Intan permata yang berkilau, temukan cahayaku dihatimu!"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Kupu-Kupu (Bottom Center Overlapping, Horizontal/Elongated) */}
            <motion.div
              variants={logoCardBottomReveal}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="absolute left-1/2 bottom-[10%] max-w-130 w-full glass-panel logo-philosophy-card rounded-2xl p-5 border border-white/60 bg-white/45 backdrop-blur-md shadow-lg hover:bg-white/80 z-10 cursor-default group"
            >
              <div className="flex gap-4 items-start">
                {/* Left Column: Number + Icon */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-(--color-primary)/40 font-mono">3</span>
                  <span className="w-9 h-9 rounded-xl bg-(--color-primary-light) flex items-center justify-center text-(--color-primary) group-hover:scale-110 group-hover:bg-(--color-primary) group-hover:text-white transition-all duration-300">
                    <ButterflySVG className="size-4.5" />
                  </span>
                </div>
                {/* Right Column: Title + Description */}
                <div className="space-y-1 text-left">
                  <h3 className="font-extrabold text-base text-(--color-primary) leading-tight">Kupu-Kupu</h3>
                  <p className="text-xs text-(--text-secondary) leading-relaxed">
                    Kupu-kupu sering diartikan sebagai seorang penari yang sangat lincah, seperti Intan yang sangat pandai dalam menari.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- MOBILE/TABLET: Clean Stacked Layout --- */}
          <div className="lg:hidden flex flex-col items-center space-y-6">
            <motion.div variants={scaleIn} className="relative w-72 h-72 flex flex-col items-center justify-center">
              <LogoPngViewer
                fallbackImage={logoNobg}
                className="w-64 h-64"
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {LOGO_PHILOSOPHY.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    whileHover={{ y: -4, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="glass-panel logo-philosophy-card rounded-2xl p-5 border border-white/60 bg-white/45 backdrop-blur-md shadow-md hover:bg-white/80 flex flex-col justify-between group cursor-default"
                  >
                    <div className="space-y-4">
                      {/* Left Column: Number + Icon */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-(--color-primary)/40 font-mono">0{index + 1}</span>
                        <span className="w-8 h-8 rounded-lg bg-(--color-primary-light) flex items-center justify-center text-(--color-primary)">
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      {/* Right Column: Title + Description */}
                      <div className="space-y-1 text-left">
                        <h3 className="font-extrabold text-sm text-(--color-primary)">{item.title}</h3>
                        <p className="text-xs text-(--text-secondary) leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* ================= VISI & MISI ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionReveal}
          className="space-y-12 relative"
        >

          {/* Desktop Version: Full-Bleed Diagonal Layout */}
          <motion.div
            variants={visiMisiContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="hidden lg:block w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[550px] overflow-hidden bg-[#090530]"
          >
            {/* Background Panels with Shutter slide-in */}
            {/* VISI Panel (Left Side) */}
            <motion.div
              variants={visiCardVariants}
              style={{ clipPath: 'polygon(0 0, 50vw 0, calc(50vw - 80px) 100%, 0 100%)' }}
              className="absolute inset-0 bg-[#170C79] z-10"
            />

            {/* MISI Panel (Right Side) */}
            <motion.div
              variants={misiCardVariants}
              style={{ clipPath: 'polygon(50vw 0, 100% 0, 100% 100%, calc(50vw - 80px) 100%)' }}
              className="absolute inset-0 bg-white z-10"
            />

            {/* Content Layer: Centered inside max-w-6xl for perfect layout safety */}
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
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionReveal}
        >
          <PhotoGallery />
        </motion.section>

      </div>
    </div>
  );
}
