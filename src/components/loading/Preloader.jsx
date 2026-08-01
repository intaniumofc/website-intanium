'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useLoading } from './LoadingContext';
import { useSafeReducedMotion } from '../../hooks/useSafeReducedMotion';
import './preloader.css';

const LOADING_STAGES = [
  { threshold: 0, text: 'Initializing Experience...' },
  { threshold: 25, text: 'Loading Visual Assets...' },
  { threshold: 60, text: 'Preparing Interactive Journey...' },
  { threshold: 95, text: 'Ready.' },
];

function getStageText(progress) {
  let text = LOADING_STAGES[0].text;
  for (const stage of LOADING_STAGES) {
    if (progress >= stage.threshold) text = stage.text;
  }
  return text;
}

export default function Preloader() {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressTextRef = useRef(null);
  const apertureRef = useRef(null);
  const glowRef = useRef(null);
  const stageTextRef = useRef(null);
  
  const { progress, isComplete } = useLoading();
  const reduceMotion = useSafeReducedMotion();
  const [isHidden, setIsHidden] = useState(false);
  const prevStageTextRef = useRef(getStageText(0));

  // Lock scroll and manage html class
  useEffect(() => {
    if (!isComplete) {
      document.documentElement.classList.remove('preloader-done');
    } else {
      document.documentElement.classList.add('preloader-done');
    }
  }, [isComplete]);

  // Animate progress bar width smoothly
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
      });
    }
    if (progressTextRef.current) {
      progressTextRef.current.textContent = `${Math.round(progress)}%`;
    }
  }, [progress]);

  // Animate stage text change
  useEffect(() => {
    const newStageText = getStageText(progress);
    if (newStageText === prevStageTextRef.current) return;
    prevStageTextRef.current = newStageText;

    if (!stageTextRef.current) return;
    
    const el = stageTextRef.current;
    const tl = gsap.timeline();
    tl.to(el, {
      opacity: 0,
      y: -8,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (el) el.textContent = newStageText;
      }
    })
    .set(el, { y: 8 })
    .to(el, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
    });
    
    return () => tl.kill();
  }, [progress]);

  // Exit animation when loading is complete
  useEffect(() => {
    if (!isComplete || !containerRef.current) return;

    const container = containerRef.current;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.to(container, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => setIsHidden(true),
        });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => setIsHidden(true),
      });

      // Shrink logo
      if (logoRef.current) {
        tl.to(logoRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.25,
          ease: 'power3.inOut',
        }, 0);
      }

      // Fade out UI elements
      const uiElements = [
        progressBarRef.current?.parentElement, // the progress bar track
        progressTextRef.current,
        stageTextRef.current,
      ].filter(Boolean);

      if (uiElements.length > 0) {
        tl.to(uiElements, {
          opacity: 0,
          y: -15,
          duration: 0.2,
          ease: 'power2.in',
          stagger: 0.02,
        }, 0);
      }

      // Aperture expand (the "iris open" effect)
      if (apertureRef.current) {
        tl.to(apertureRef.current, {
          scale: 50,
          duration: 0.4,
          ease: 'expo.out',
        }, 0.1);
      }

      // Final fade out of entire container
      tl.to(container, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      }, 0.25);

    }, container);

    return () => ctx.revert();
  }, [isComplete, reduceMotion]);

  // Once exit animation is done or if already completed, unmount entirely
  if (isHidden || isComplete) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
      aria-hidden={isComplete}
    >
      {/* Ambient glow */}
      <div 
        ref={glowRef}
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(255,95,178,0.2), transparent 70%)' }}
      />

      {/* Aperture circle for iris-open reveal */}
      <div 
        ref={apertureRef}
        className="absolute w-0 h-0 rounded-full bg-white"
        style={{ zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h1 
          ref={logoRef}
          className="font-playfair text-6xl md:text-8xl font-black text-[#E83C91] tracking-tight"
          style={{ textShadow: '0 4px 20px rgba(232,60,145,0.15)' }}
        >
          IRIS
        </h1>

        {/* Dynamic Stage Text */}
        <div className="h-5 overflow-hidden flex items-center">
          <p 
            ref={stageTextRef}
            className="text-[var(--color-body)] text-xs md:text-sm uppercase tracking-[0.3em] font-semibold"
          >
            {getStageText(0)}
          </p>
        </div>

        {/* Progress Section */}
        <div className="w-48 md:w-64 flex flex-col items-center gap-3">
          <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div 
              ref={progressBarRef}
              className="h-full bg-[var(--color-pink)] rounded-full"
              style={{ width: '0%' }}
            />
          </div>
          <span 
            ref={progressTextRef}
            className="text-[var(--color-text-secondary)] text-[10px] tabular-nums tracking-widest font-bold"
          >
            0%
          </span>
        </div>
      </div>
    </div>
  );
}
