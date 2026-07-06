'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SplitTextReveal({
  text,
  className = '',
  wordClassName = 'text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight',
  duration = 0.8,
  delay = 0,
  stagger = 0.05,
  start = 'top 85%',
  once = true,
  style = {},
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll('.split-word-inner');

    let ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { y: '105%', rotate: 2 },
        {
          y: '0%',
          rotate: 0,
          duration: duration,
          delay: delay,
          stagger: stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: start,
            toggleActions: once ? 'play none none none' : 'play reverse play reverse',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, duration, delay, stagger, start, once]);

  if (!text) return null;

  // Split text by space to get words
  const wordsArray = text.split(' ');

  return (
    <div
      ref={containerRef}
      className={`inline-flex flex-wrap items-center justify-center gap-x-[0.25em] gap-y-2 overflow-hidden py-1 ${className}`}
    >
      {wordsArray.map((word, idx) => (
        <span
          key={idx}
          className="inline-block overflow-hidden relative"
          style={{ verticalAlign: 'bottom' }}
        >
          <span
            className={`inline-block split-word-inner will-change-transform ${wordClassName}`}
            style={{ transformOrigin: 'left bottom', ...style }}
            {...props}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}
