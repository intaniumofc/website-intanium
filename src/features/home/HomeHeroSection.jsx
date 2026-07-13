'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROUTES } from '../../lib/constants';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HomeHeroSection() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const titleRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const noiseRef = useRef(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [entranceFinished, setEntranceFinished] = useState(false);

  // Lazy load video for better LCP
  useEffect(() => {
    const startLoading = () => setTimeout(() => setLoadVideo(true), 300);
    if (document.readyState === 'complete') {
      startLoading();
    } else {
      window.addEventListener('load', startLoading, { once: true });
    }
  }, []);

  useEffect(() => {
    if (loadVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [loadVideo]);

  // ── 1. ENTRANCE ANIMATION ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ctx = gsap.context(() => {
      // Set initial states
      gsap.set([titleLine1Ref.current, titleLine2Ref.current], {
        y: '115%',
        rotate: 4,
      });
      gsap.set([subtitleRef.current, ctaRef.current], {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(8px)',
        y: 25,
      });
      gsap.set(scrollIndicatorRef.current, { opacity: 0 });

      // Entrance animation timeline
      const entranceTl = gsap.timeline({
        delay: 0.3,
        onComplete: () => setEntranceFinished(true)
      });
      entranceTl
        // Line 1 Roll up
        .to(titleLine1Ref.current, { y: '0%', rotate: 0, duration: 1.1, ease: 'power4.out' })
        // Line 2 Roll up (staggered)
        .to(titleLine2Ref.current, { y: '0%', rotate: 0, duration: 1.1, ease: 'power4.out' }, '-=0.95')
        // Subtitle blur & fade & scale in
        .to(subtitleRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.75')
        // CTA fade & scale in
        .to(ctaRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')
        // Scroll indicator fade in
        .to(scrollIndicatorRef.current, { opacity: 1, duration: 0.6 }, '-=0.3');
    }, container);

    return () => ctx.revert();
  }, []);

  // ── 2. SCROLL TRIGGER TIMELINE (Only after entrance completes) ──
  useEffect(() => {
    if (!entranceFinished) return;

    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=700',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Elements movements
      tl.to(scrollIndicatorRef.current, { opacity: 0, y: -20, duration: 0.3 }, 0);
      tl.to(videoRef.current, { scale: 1.08, ease: 'none', duration: 3 }, 0);
      tl.to(noiseRef.current, { opacity: 0.07, duration: 2 }, 0);

      // Individual fading/sliding
      tl.to(titleRef.current, { y: -100, opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0.8);
      tl.to(subtitleRef.current, { y: -80, opacity: 0, duration: 1, ease: 'power2.inOut' }, 0.9);
      tl.to(ctaRef.current, { y: -60, opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 1.0);
    }, container);

    return () => ctx.revert();
  }, [entranceFinished]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#05021A]"
      aria-label="Hero Section"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        {loadVideo && <source src="/intan-02.mp4" type="video/mp4" />}
      </video>

      {/* Visual noise/grain overlay */}
      <div
        ref={noiseRef}
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Vignettes for premium editorial depth & typography legibility */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#05021A] via-black/60 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-[2]" />
      <div className="absolute inset-0 bg-[#170C79]/15 pointer-events-none z-[2]" />

      {/* Hero content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Brand Title (Asymmetric / Oversized Brutalist look with Masking) */}
        <div ref={titleRef} className="select-none">
          <h1 className="font-black leading-none tracking-tight font-playfair flex flex-col items-center">
            {/* Mask Wrapper for IRIS */}
            <span className="inline-block overflow-hidden relative py-2">
              <span
                ref={titleLine1Ref}
                className="block text-[clamp(4.2rem,14vw,10rem)] text-white drop-shadow-[0_4px_32px_rgba(255,255,255,0.15)] will-change-transform"
                style={{ transformOrigin: 'left bottom' }}
              >
                IRIS
              </span>
            </span>
            {/* Mask Wrapper for #GEMINTANG*/}
            <span className="inline-block overflow-hidden relative py-2 -mt-2 sm:-mt-4">
              <span
                ref={titleLine2Ref}
                className="block text-[clamp(2.2rem,6vw,4.5rem)] text-transparent will-change-transform"
                style={{ WebkitTextStroke: '1.5px #FFE285', transformOrigin: 'left bottom' }}
              >
                #GEMINTANG
              </span>
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <p
          ref={subtitleRef}
          className="mt-6 max-w-lg text-xs sm:text-sm md:text-base text-white/70 leading-relaxed font-light select-none"
        >
          Ruang interaksi resmi dan pusat informasi bagi seluruh penikmat karya Intan.
          Bersama kita bersinar lebih terang.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="mt-8 flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => {
              const target = document.getElementById('kenalan-intan');
              if (target) {
                if (window.lenis) {
                  // Use Lenis scroll for beautiful inertial ease (desktop)
                  window.lenis.scrollTo('#kenalan-intan', {
                    offset: -80,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ultra smooth ease-out-expo
                  });
                } else {
                  // Custom requestAnimationFrame smooth scroll fallback for mobile
                  const headerOffset = 80;
                  const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                  const startPosition = window.scrollY;
                  const distance = targetPosition - startPosition - headerOffset;

                  let startTime = null;
                  const duration = 1200; // 1.2s smooth deceleration
                  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

                  const step = (currentTime) => {
                    if (startTime === null) startTime = currentTime;
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    window.scrollTo(0, startPosition + distance * easeOutQuart(progress));

                    if (elapsed < duration) {
                      requestAnimationFrame(step);
                    }
                  };

                  requestAnimationFrame(step);
                }
              }
            }}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#FFE285] text-[#170C79] font-extrabold text-xs uppercase tracking-[0.15em] shadow-[0_0_30px_rgba(255,226,133,0.3)] hover:shadow-[0_0_50px_rgba(255,226,133,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE285] cursor-pointer"
          >
            Kenali Intan
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-1" />
          </button>
          <Link
            href={ROUTES.ABOUT_IRIS}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2"
          >
            Tentang Kami
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 select-none pointer-events-none"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-semibold">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
      </div>
    </div>
  );
}
