'use client';

import { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { gsap } from 'gsap';

const PARTICLES_PER_BURST = 9;
const POOL_SIZE = 36;

// Deterministic per-particle kind (no Math.random so nothing depends on
// render timing). Mostly sparkles, some soft glow orbs, an occasional heart.
function kindFor(i, burst) {
  if (i === 0 && burst % 2 === 0) return 'heart';
  if (i % 3 === 1) return 'glow';
  return 'sparkle';
}

/**
 * Emits a short-lived particle burst at a destination when the character
 * arrives. Uses a small reusable pool of absolutely-positioned nodes animated
 * with GSAP and recycled — no React state, very lightweight. Three flavours:
 *   • sparkle : tiny gold twinkle
 *   • glow    : soft blurred orb that drifts up
 *   • heart   : occasional small heart (tribute warmth)
 *
 * Parent calls: particlesRef.current.burst(x, y)
 */
const JourneyParticles = forwardRef(function JourneyParticles(_, ref) {
  const layerRef = useRef(null);
  const poolRef = useRef([]);
  const cursorRef = useRef(0);
  const burstRef = useRef(0);

  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const layer = layerRef.current;
      if (!layer) return;
      const burst = (burstRef.current += 1);

      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const slot = cursorRef.current % POOL_SIZE;
        let dot = poolRef.current[slot];
        if (!dot) {
          dot = document.createElement('span');
          layer.appendChild(dot);
          poolRef.current[slot] = dot;
        }
        cursorRef.current += 1;

        const kind = kindFor(i, burst);
        dot.className = `journey-particle journey-${kind}`;

        const angle = (i / PARTICLES_PER_BURST) * Math.PI * 2;
        const dist = 32 + (i % 3) * 16;
        // Hearts & glow orbs drift upward a touch; sparkles fan out evenly.
        const rise = kind === 'sparkle' ? 0 : 22 + (i % 2) * 10;
        const endScale = kind === 'glow' ? 1 + (i % 3) * 0.3 : 0.6 + (i % 3) * 0.3;

        gsap.killTweensOf(dot);
        gsap.set(dot, { x, y, scale: 0, opacity: 1, xPercent: -50, yPercent: -50, rotation: 0 });
        gsap
          .timeline()
          .to(dot, {
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist - rise,
            scale: endScale,
            rotation: kind === 'heart' ? gsap.utils.clamp(-18, 18, (i - 4) * 6) : 0,
            duration: kind === 'glow' ? 0.7 : 0.5,
            ease: 'power2.out',
          })
          .to(dot, { opacity: 0, scale: kind === 'glow' ? endScale * 1.4 : 0, duration: 0.5, ease: 'power1.in' }, '-=0.22');
      }
    },
  }));

  return <div ref={layerRef} className="journey-particles" aria-hidden="true" />;
});

export default memo(JourneyParticles);
