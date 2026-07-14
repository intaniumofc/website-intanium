'use client';

import { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { gsap } from 'gsap';

const SPARKLES_PER_BURST = 8;

/**
 * Emits a short-lived sparkle burst at a destination when the character
 * arrives. Uses a small reusable pool of absolutely-positioned dots that
 * are animated with GSAP and reset — no React state, very lightweight.
 *
 * Parent calls: particlesRef.current.burst(x, y)
 */
const JourneyParticles = forwardRef(function JourneyParticles(_, ref) {
  const layerRef = useRef(null);
  const poolRef = useRef([]);
  const cursorRef = useRef(0);

  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const layer = layerRef.current;
      if (!layer) return;

      for (let i = 0; i < SPARKLES_PER_BURST; i++) {
        // Round-robin over a bounded pool so we never spawn unbounded nodes.
        let dot = poolRef.current[cursorRef.current % 32];
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'journey-sparkle';
          layer.appendChild(dot);
          poolRef.current[cursorRef.current % 32] = dot;
        }
        cursorRef.current += 1;

        const angle = (i / SPARKLES_PER_BURST) * Math.PI * 2;
        const dist = 34 + (i % 3) * 14;
        gsap.set(dot, { x, y, scale: 0, opacity: 1, xPercent: -50, yPercent: -50 });
        gsap
          .timeline()
          .to(dot, {
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            scale: 0.6 + (i % 3) * 0.25,
            duration: 0.5,
            ease: 'power2.out',
          })
          .to(dot, { opacity: 0, scale: 0, duration: 0.45, ease: 'power1.in' }, '-=0.2');
      }
    },
  }));

  return <div ref={layerRef} className="journey-particles" aria-hidden="true" />;
});

export default memo(JourneyParticles);
