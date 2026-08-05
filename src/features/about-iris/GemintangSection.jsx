'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

// 4-Point Journey Star Sparkle SVG
const StarSparkleSVG = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
  </svg>
);

export default function GemintangSection() {
  const floatingStars = [
    { top: '12%', left: '8%', size: 22, delay: 0, duration: 4 },
    { top: '22%', right: '10%', size: 18, delay: 0.6, duration: 3.5 },
    { bottom: '15%', left: '12%', size: 20, delay: 1.2, duration: 4.5 },
    { bottom: '20%', right: '14%', size: 24, delay: 0.3, duration: 3.8 },
    { top: '48%', left: '5%', size: 14, delay: 0.9, duration: 3.2 },
    { top: '55%', right: '6%', size: 16, delay: 1.5, duration: 4.1 },
  ];

  return (
    <section
      id="gemintang"
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-0 mb-10 py-14 sm:py-18 px-6 overflow-hidden bg-gradient-to-br from-[var(--color-iris-pink-dark)] via-[#B83E9C] to-[var(--color-iris-purple-dark)] text-white text-center select-none"
    >
      {/* 1. BACKGROUND SLIDE-IN REVEAL PANEL (Left to Right Shutter Wipe) */}
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-iris-pink-dark)] via-[#B83E9C] to-[var(--color-iris-purple-dark)] z-0"
      />

      {/* Ambient Glowing Blobs inside background */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-pink-300/30 blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-400/30 blur-3xl pointer-events-none z-0" />

      {/* Main Content Stage */}
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* 2. BOUNCE-IN STAR PARTICLES (Journey 4-Point Stars) */}
        {floatingStars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-200/90 pointer-events-none filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
            style={{ top: star.top, left: star.left, right: star.right, bottom: star.bottom }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{
              scale: 1,
              opacity: 1,
            }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 14,
              delay: 0.55 + i * 0.08
            }}
          >
            {/* Continuous Gentle Floating Loop after entrance */}
            <motion.div
              animate={{
                y: [0, -14, 0],
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
          </motion.div>
        ))}

        {/* 3. BOUNCE-IN TEXT CONTENT */}
        <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center gap-4">
          {/* Tag Pill */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.7 }}
            className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md"
          >
            <Quote className="w-3.5 h-3.5 text-[var(--color-primary)] fill-[var(--color-primary)] opacity-90" />
            <span>Tagline Official IRIS</span>
          </motion.div>

          {/* Main Title #GEMINTANG */}
          <div className="space-y-1 my-1">
            <motion.h2
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: 'spring', stiffness: 320, damping: 15, delay: 0.82 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest leading-none select-none"
            >
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
            </motion.h2>

            <motion.p
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.94 }}
              className="text-base sm:text-xl font-bold tracking-wider text-pink-100/90 font-heading"
            >
              (Gemilang Intan)
            </motion.p>
          </div>

          {/* Decorative Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: 1.04 }}
            className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full my-1 shadow-sm"
          />

          {/* Tagline Description */}
          <motion.p
            initial={{ scale: 0.8, opacity: 0, y: 25 }}
            whileInView={{ scale: 1, opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 1.12 }}
            className="text-sm sm:text-base md:text-lg font-medium leading-relaxed sm:leading-loose text-white/95 max-w-2xl text-center font-sans tracking-wide drop-shadow-xs"
          >
            Gemintang merupakan wujud harapan, doa, dan bentuk seruan bersama bagi seluruh penggemar Intan untuk menyatukan suara dan terus menjaga serta menyebarkan kilau cahaya Intan, agar dapat semakin terang dan bersinar sampai ke hati semua orang.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
