'use client';

import { useEffect, useRef } from 'react';
import { Activity, Heart, Link, Music, Rainbow } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const acronym = [
  {
    letter: 'I',
    word: "Intan's",
    icon: Heart,
    text: "Diambil dari nama Intan yang merupakan sumber suara, inspirasi utama, dan poros pemersatu. Dialah magnet yang menyatukan ribuan hati penggemar dalam harmoni perjuangan yang sama di panggung JKT48.",
  },
  {
    letter: 'R',
    word: 'Resonance',
    icon: Activity,
    text: "Getaran semangat, kerja keras, dan ketulusan Intan terus memancar dan beresonansi dari satu penggemar ke penggemar lainnya, meninggalkan gema mendalam yang tidak akan pudar.",
  },
  {
    letter: 'I',
    word: 'in',
    icon: Link,
    text: "Sebagai perekat yang menyatukan setiap individu dan inisiatif kecil. Menghubungkan setiap bentuk dukungan menjadi satu gerakan berskala besar yang terorganisir.",
  },
  {
    letter: 'S',
    word: 'Symphony',
    icon: Music,
    text: "Fanbase ini menaungi penggemar dengan latar belakang, karakter, dan cara mendukung yang beragam. Perbedaan tersebut bersinergi membentuk komposisi harmoni yang indah bagi Intan.",
  },
];

export default function IrisPhilosophySection() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Fade in the myth section
      gsap.fromTo(
        '.myth-section',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.myth-section',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stagger fade-in the columns
      gsap.fromTo(
        '.acronym-column',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.acronym-container',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full space-y-16 py-8 relative overflow-visible">
      {/* Decorative background lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(23,12,121,0.02)_0%,transparent_70%)] rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* ================= SECTION 1: MYTH & METAPHOR (Goddess Iris) ================= */}
      <div className="myth-section grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left border-b border-[var(--border-color)] pb-12">
        <div className="md:col-span-5 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Rainbow className="w-3.5 h-3.5" />
            <span>Mitologi & Koneksi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-primary)] tracking-tight">
            Filosofi Nama IRIS
          </h2>
        </div>
        <div className="md:col-span-7 pt-1 sm:pt-4">
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-[1.85] font-medium">
            Nama <strong className="text-[var(--color-primary)] font-black">IRIS</strong> berasal dari bahasa Yunani Kuno yang merujuk pada <strong className="text-[var(--color-primary)] font-black">Dewi Pelangi</strong>, sang penghubung utama antara langit dan bumi. Pelangi melambangkan koneksi, komunikasi, dan ikatan erat — nilai mulia yang sangat selaras dengan prinsip dasar komunitas fanbase yang menyatukan hati penggemar dengan sang idola.
          </p>
        </div>
      </div>

      {/* ================= SECTION 2: ACRONYM SPLIT (Intan's Resonance in Symphony) ================= */}
      <div>
        {/* 4 Typographic Columns */}
        <div className="acronym-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {acronym.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="acronym-column space-y-4 flex flex-col justify-start text-left relative group border-t border-[var(--border-color)] pt-6"
              >
                {/* Visual top border indicator */}
                <div className="absolute top-0 left-0 w-8 h-0.5 bg-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Big Letter + Icon */}
                <div className="flex justify-between items-end">
                  <span className="text-5xl sm:text-6xl font-black text-[var(--color-primary)] font-mono leading-none tracking-tighter">
                    {item.letter}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Subtitle Word */}
                <h4 className="text-lg font-black text-[var(--color-primary)] tracking-tight">
                  {item.word}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed text-justify">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
