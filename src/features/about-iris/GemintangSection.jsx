'use client';

import { motion } from 'framer-motion';

// 4-Point Journey Star Sparkle SVG
const StarSparkleSVG = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
  </svg>
);

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: PREMIUM_EASE
    }
  }
};

export default function GemintangSection() {
  const floatingStars = [
    { top: '12%', left: '8%', size: 20, delay: 0, duration: 4 },
    { top: '22%', right: '10%', size: 16, delay: 0.6, duration: 3.5 },
    { bottom: '15%', left: '12%', size: 18, delay: 1.2, duration: 4.5 },
    { bottom: '20%', right: '14%', size: 22, delay: 0.3, duration: 3.8 },
    { top: '48%', left: '5%', size: 12, delay: 0.9, duration: 3.2 },
    { top: '55%', right: '6%', size: 14, delay: 1.5, duration: 4.1 },
  ];

  return (
    <section id="gemintang" className="relative w-full py-6 my-4 select-none">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUpVariant}
        className="relative mx-auto max-w-5xl w-full rounded-[36px] overflow-hidden p-8 sm:p-12 md:p-14 border border-white/35 bg-gradient-to-br from-[var(--color-iris-pink-dark)] via-[#B83E9C] to-[var(--color-iris-purple-dark)] shadow-[0_25px_60px_-15px_rgba(236,72,153,0.5)] backdrop-blur-2xl text-white text-center"
      >
        {/* Ambient Glowing Blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-400/30 blur-3xl pointer-events-none" />

        {/* Floating Star Ornaments (Journey 4-Point Stars) */}
        {floatingStars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-200/90 pointer-events-none filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom }}
            animate={{
              y: [0, -14, 0],
              opacity: [0.35, 1, 0.35],
              scale: [0.85, 1.2, 0.85],
              rotate: [0, 45, 0]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut'
            }}
          >
            <StarSparkleSVG style={{ width: star.size, height: star.size }} />
          </motion.div>
        ))}

        {/* Content Container */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-4">
          {/* Tag Pill styled identical to 'Mitologi & Nilai' in IrisPhilosophySection */}
          <div className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md">
            <StarSparkleSVG className="w-3.5 h-3.5 text-amber-500" />
            <span>Tagline Official IRIS</span>
          </div>

          {/* Main Title #GEMINTANG with Stroke/Transparent Style */}
          <div className="space-y-1 my-1">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest leading-none select-none">
              <span
                style={{
                  WebkitTextStroke: '2.5px #ffffff',
                  color: 'transparent',
                  filter: 'drop-shadow(0 6px 18px rgba(255, 255, 255, 0.35))'
                }}
                className="inline-block transition-transform duration-300 hover:scale-105"
              >
                #GEMINTANG
              </span>
            </h2>
            <p className="text-base sm:text-xl font-bold tracking-wider text-pink-100/90 font-heading">
              (Gemilang Intan)
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full my-1 shadow-sm" />

          {/* Tagline Description */}
          <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed sm:leading-loose text-white/95 max-w-2xl text-center font-sans tracking-wide drop-shadow-xs">
            Gemintang merupakan wujud harapan, doa, dan bentuk seruan bersama bagi seluruh penggemar Intan untuk menyatukan suara dan terus menjaga serta menyebarkan kilau cahaya Intan, agar dapat semakin terang dan bersinar sampai ke hati semua orang.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
