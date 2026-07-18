'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Travel window: the character eases onto the path at 3% and off it at 97%
// so the two ends of the journey breathe instead of popping.
const TRAVEL_START = 0.03;
const TRAVEL_SPAN = 0.94;
const MAX_TILT = 6; // brief: character may lean at most ±6°, never rotate/flip.

/**
 * useJourneyAnimation — owns the entire scroll-driven cinematic timeline for
 * the journey map. Encapsulates:
 *   • the camera (world translates/zooms under a fixed focus point)
 *   • the character riding the path via MotionPathPlugin (no flip, ±8° tilt)
 *   • the animated dashed path draw + travelling highlight
 *   • the staged per-destination reveal sequence
 *   • idle character life (4px float + gentle breathing) and camera sway
 *
 * Rendering lives in JourneyMap; this hook is pure motion + cleanup.
 */
export function useJourneyAnimation({
  refs,
  nodes,
  N,
  tier,
  pathD,
  tierKey,
  imagesReady,
  reducedMotion,
  onActiveChange,
}) {
  const {
    sectionRef,
    stageRef,
    worldRef,
    pathRef,
    highlightRef,
    charRootRef,
    charFaceRef,
    charBobRef,
    particlesRef,
  } = refs;

  useGSAP(
    () => {
      if (N === 0 || !imagesReady || reducedMotion) return undefined;

      const pathEl = pathRef.current;
      const highlightEl = highlightRef.current;
      const worldEl = worldRef.current;
      const stageEl = stageRef.current;
      const charRoot = charRootRef.current;
      const charFace = charFaceRef.current;
      const charBob = charBobRef.current;
      if (!pathEl || !worldEl || !stageEl || !charRoot) return undefined;

      const pathLength = pathEl.getTotalLength();

      // --- Precompute each node's fractional position along the path ---
      // Sample once, then snap every node to its nearest sample so reveals
      // fire exactly when the character passes that point.
      const SAMPLES = 400;
      const sampled = [];
      for (let i = 0; i <= SAMPLES; i++) {
        sampled.push(pathEl.getPointAtLength((i / SAMPLES) * pathLength));
      }
      const nodeProgress = nodes.map((n) => {
        let best = 0;
        let bestDist = Infinity;
        for (let i = 0; i <= SAMPLES; i++) {
          const dx = sampled[i].x - n.x;
          const dy = sampled[i].y - n.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            best = i / SAMPLES;
          }
        }
        return best;
      });

      // --- Path draw + travelling highlight setup ---
      gsap.set(pathEl, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      const HL = 70; // highlight dash length
      gsap.set(highlightEl, { strokeDasharray: `${HL} ${pathLength}`, strokeDashoffset: 0 });

      // --- Idle character life (independent of scroll) --------------------
      // Small 4px float + gentle breathing scale + micro-sway. She always
      // faces the viewer; only these tiny motions keep her feeling alive.
      const bob = gsap.to(charBob, {
        y: -4,
        duration: 1.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      const breathe = gsap.to(charBob, {
        scale: 1.03,
        duration: 2.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: '50% 100%',
      });

      const charSize = tier.charSize ?? 112;
      const charH = charSize * 1.5; // matches JourneyCharacter height ratio

      const cam = { scale: tier.camScale ?? 1.05 };
      let lastActive = -1;

      // Character rides at ~42% of the viewport height (brief: 40–45%), so the
      // road ahead is always visible below her — cinematic, not centred.
      const focusX = () => stageEl.clientWidth / 2;
      const focusY = () => stageEl.clientHeight * 0.42;

      // Camera + face-tilt for a given path progress (0..1). MotionPath owns
      // the character's POSITION; this only reads the path to steer the world
      // and apply the tiny facing lean.
      const place = (progress, immediate) => {
        const len = progress * pathLength;
        const pt = pathEl.getPointAtLength(len);

        // Camera locks to the character's exact position so she stays fixed in
        // the viewport frame while the world glides beneath her.
        const camX = pt.x;
        const camY = pt.y;

        // Facing lean: sample tangent slightly ahead/behind, map slope to a
        // clamped ±8° tilt. No horizontal flip — she stays front-facing.
        const ahead = pathEl.getPointAtLength(Math.min(pathLength, len + 2));
        const behind = pathEl.getPointAtLength(Math.max(0, len - 2));
        const dx = ahead.x - behind.x;
        const dy = ahead.y - behind.y;
        const dir = dx < 0 ? -1 : 1;
        const tilt = gsap.utils.clamp(
          -MAX_TILT,
          MAX_TILT,
          (dy / (Math.abs(dx) + 0.001)) * 4 * dir
        );
        const faceSetter = immediate ? gsap.set : gsap.to;
        faceSetter(charFace, {
          rotationZ: tilt,
          duration: immediate ? 0 : 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Zoom: push in near a destination, pull out while travelling.
        let nearest = Infinity;
        for (let i = 0; i < nodeProgress.length; i++) {
          nearest = Math.min(nearest, Math.abs(progress - nodeProgress[i]));
        }
        const proximity = gsap.utils.clamp(0, 1, 1 - nearest / 0.06);
        const baseScale = tier.camScale ?? 1.05;
        cam.scale = baseScale + proximity * (tier.camZoom ?? 0.16);

        // Place the character at the same point (bottom-centre on the path,
        // matching the old alignOrigin [0.5, 1]).
        gsap.set(charRoot, {
          x: pt.x - charSize / 2,
          y: pt.y - charH,
        });

        // Translate the world so the character sits at the focus point (with a
        // gentle lead toward the upcoming curve).
        gsap.set(worldEl, {
          x: focusX() - camX * cam.scale,
          y: focusY() - camY * cam.scale,
          scale: cam.scale,
        });
      };

      // --- Master scrubbed timeline --------------------------------------
      const proxy = { p: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: stageRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // Reveal the character; her POSITION is set every frame in place() from
      // the shared getPointAtLength (see below), so no MotionPath tween here.
      // She never rotates with the curve — only the clamped ±6° face-tilt.
      gsap.set(charRoot, { autoAlpha: 1 });

      // Camera + character + path-draw + active detection, all driven by the
      // same proxy and the same path measurement, so they stay in lockstep.
      tl.to(
        proxy,
        {
          p: 1,
          ease: 'none',
          duration: 1,
          onUpdate: () => {
            const prog = TRAVEL_START + proxy.p * TRAVEL_SPAN;
            place(prog, false);

            gsap.set(pathEl, { strokeDashoffset: pathLength * (1 - prog) });
            gsap.set(highlightEl, { strokeDashoffset: -(prog * pathLength) + HL });

            let active = 0;
            for (let i = 0; i < nodeProgress.length; i++) {
              if (prog >= nodeProgress[i] - 0.005) active = i;
            }
            if (active !== lastActive) {
              if (active > lastActive) {
                const n = nodes[active];
                particlesRef.current?.burst(n.x, n.y);
              }
              lastActive = active;
              onActiveChange?.(active);
            }
          },
        },
        0
      );

      // Slow cinematic camera sway (tiny rotation, never static).
      const camSway = gsap.to(stageEl, {
        rotation: tier.camRot ?? 0.8,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // --- Staged per-destination reveal, keyed to arrival progress -------
      // Order per brief: node glow → ring expand → sparkle (fired above) →
      // photo scale → card fade → title slide → description fade → badge pop.
      nodes.forEach((n, i) => {
        const at = gsap.utils.clamp(
          0,
          1,
          (nodeProgress[i] - TRAVEL_START) / TRAVEL_SPAN - 0.02
        );
        // node glows + gold ring expands
        tl.fromTo(
          `.jnode-${i}`,
          { scale: 0.2, autoAlpha: 0, xPercent: -50, yPercent: -50 },
          { scale: 1, autoAlpha: 1, xPercent: -50, yPercent: -50, ease: 'back.out(1.7)', duration: 0.04 },
          at
        );
        // connector stem draws from the node toward the card
        const stemEl = stageEl.querySelector(`.jstem-${i}`);
        if (stemEl) {
          const stemLen = stemEl.getTotalLength();
          tl.fromTo(
            stemEl,
            { strokeDasharray: stemLen, strokeDashoffset: stemLen, autoAlpha: 0 },
            { strokeDashoffset: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.04 },
            at + 0.006
          );
        }
        // card container fades + rises up into place (Node -> Card read)
        tl.fromTo(
          `.jcard-${i}`,
          { autoAlpha: 0, y: 26, scale: 0.9, xPercent: -50, yPercent: -50 },
          { autoAlpha: 1, y: 0, scale: 1, xPercent: -50, yPercent: -50, ease: 'back.out(1.3)', duration: 0.05 },
          at + 0.01
        );
        // printed photo scales down into frame
        tl.fromTo(
          `.jcard-${i} .journey-card-photo img`,
          { scale: 1.18 },
          { scale: 1, ease: 'power2.out', duration: 0.06 },
          at + 0.014
        );
        // title slides in
        tl.fromTo(
          `.jcard-${i} .journey-card-title`,
          { x: -14, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.04 },
          at + 0.024
        );
        // description fades in
        tl.fromTo(
          `.jcard-${i} .journey-card-desc`,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: 'none', duration: 0.04 },
          at + 0.032
        );
        // category badge pops
        tl.fromTo(
          `.jcard-${i} .journey-card-badge`,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, ease: 'back.out(2)', duration: 0.035 },
          at + 0.038
        );
        // polaroid fades in first — before node, stem, and card
        tl.fromTo(
          `.jpolaroid-${i}`,
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 1, scale: 1, ease: 'power2.out', duration: 0.04 },
          at - 0.005
        );
      });

      // Initial placement so nothing pops on first paint.
      place(TRAVEL_START, true);

      return () => {
        bob.kill();
        breathe.kill();
        camSway.kill();
      };
    },
    { scope: sectionRef, dependencies: [N, imagesReady, reducedMotion, pathD, tierKey] }
  );
}
