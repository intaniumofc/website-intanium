'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

const SECTIONS = [
  { id: 'profile', label: 'Profil' },
  { id: 'stats-section', label: 'Karir' },
  { id: 'highlights-section', label: 'Highlights' },
  { id: 'setlist-section', label: 'Panggung' },
  { id: 'trivia-section', label: 'Trivia' },
  { id: 'schedule-section', label: 'Jadwal' },
];

export default function StickyNavSection() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  // Show nav after scrolling past hero (~100vh)
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest > window.innerHeight * 0.85);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Track which section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -60,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      aria-label="Navigasi section halaman"
    >
      <div className="mx-auto max-w-3xl px-4 pt-3 pointer-events-auto">
        <div className="relative flex items-center justify-center gap-1 rounded-2xl border border-(--border-color) bg-white/80 px-2 py-1.5 shadow-(--box-shadow-md) backdrop-blur-xl">
          {SECTIONS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                className={`relative rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) ${
                  isActive
                    ? 'text-white'
                    : 'text-(--text-secondary) hover:text-(--color-primary) hover:bg-(--color-primary-light)'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-(--color-primary) shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
