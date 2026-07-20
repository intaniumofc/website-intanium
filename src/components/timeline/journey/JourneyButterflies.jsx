'use client';

import React, { useRef, useEffect, useState } from 'react';

const PARTICLE_COUNT = 50;
const BUTTERFLY_COUNT = 6;

/* Cosmic journey palette — matches the indigo/pink/sky theme of the
   "Jejak Cahaya Intan" section (see journey.css node/blob accents). */
const PARTICLE_COLORS = ['#eee9ff', '#f9a8d4', '#7dd3fc'];
const BUTTERFLY_COLORS = ['#ec4899', '#a78bfa', '#38bdf8'];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * useCanvasActive
 *
 * Pauses the animation loop when the canvas is offscreen, the tab is hidden,
 * or the window loses focus. Self-contained so the journey has no dependency
 * on the (now removed) museum feature.
 */
function useCanvasActive(ref) {
  const [isActive, setIsActive] = useState(true);
  const intersectRef = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      setIsActive(intersectRef.current && !document.hidden && document.hasFocus());
    };

    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    window.addEventListener('blur', update);

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersectRef.current = entry.isIntersecting;
        update();
      },
      { threshold: 0.02 }
    );
    observer.observe(el);
    update();

    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
      window.removeEventListener('blur', update);
      observer.disconnect();
    };
  }, [ref]);

  return isActive;
}

/**
 * JourneyButterflies
 *
 * Ambient Canvas 2D backdrop for the "Jejak Cahaya Intan" section:
 * - Floating dust / sparkles
 * - Butterflies wandering across the scene
 *
 * Recoloured from the original museum atmosphere to fit the journey's
 * cosmic indigo/pink/sky palette. Sits behind the travelling world layer.
 */
export default function JourneyButterflies({ reducedMotion = false }) {
  const canvasRef = useRef(null);
  const isActive = useCanvasActive(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.5, 1.6),
      vy: rand(-0.2, -0.05),
      vx: rand(-0.1, 0.1),
      alpha: rand(0.2, 0.6),
      color: PARTICLE_COLORS[Math.floor(rand(0, PARTICLE_COLORS.length))],
    }));

    const butterflies = Array.from({ length: BUTTERFLY_COUNT }).map(() => ({
      x: rand(0, w),
      y: rand(0, h),
      angle: rand(0, Math.PI * 2),
      speed: rand(0.3, 0.8),
      wingPhase: rand(0, 10),
      size: rand(8, 14),
      color: BUTTERFLY_COLORS[Math.floor(rand(0, BUTTERFLY_COLORS.length))],
    }));

    const drawButterfly = (b) => {
      const wing = Math.sin(b.wingPhase) * 0.5 + 0.5; // 0 to 1
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;

      // Left wing
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.5, 0, b.size * wing, b.size * 0.7, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Right wing
      ctx.beginPath();
      ctx.ellipse(b.size * 0.5, 0, b.size * wing, b.size * 0.7, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      if (isActive) {
        // Floating dust
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -5) p.y = h + 5;
          if (p.x < -5) p.x = w + 5;
          if (p.x > w + 5) p.x = -5;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });

        // Butterflies
        butterflies.forEach((b) => {
          b.angle += rand(-0.05, 0.05); // wandering
          b.x += Math.cos(b.angle) * b.speed;
          b.y += Math.sin(b.angle) * b.speed;
          b.wingPhase += 0.2;

          if (b.x < -20) b.x = w + 20;
          if (b.x > w + 20) b.x = -20;
          if (b.y < -20) b.y = h + 20;
          if (b.y > h + 20) b.y = -20;

          drawButterfly(b);
        });
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="journey-butterflies" aria-hidden="true" />;
}
