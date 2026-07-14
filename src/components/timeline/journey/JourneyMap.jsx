'use client';

import React, { useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';

import { useJourneyLayout } from './useJourneyLayout';
import { usePreloadImages } from './usePreloadImages';
import { useJourneyEnvironment } from './useJourneyEnvironment';
import JourneyBackground from './JourneyBackground';
import JourneyPath from './JourneyPath';
import JourneyNode from './JourneyNode';
import JourneyCard from './JourneyCard';
import JourneyCharacter from './JourneyCharacter';
import JourneyParticles from './JourneyParticles';
import './journey.css';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP);

/**
 * JourneyMap — cinematic travel-map experience.
 * The section is pinned; scrolling advances a single scrubbed master
 * timeline. A "world" layer (path + nodes + cards + character) is
 * translated/zoomed/rotated so the CAMERA follows the character while the
 * world glides beneath it. Node/card reveals and sparkle bursts are keyed
 * to the character's real position along the path.
 */
export default function JourneyMap({ achievements = [] }) {
  const { tierKey, reducedMotion } = useJourneyEnvironment();
  const layout = useJourneyLayout(achievements, tierKey);
  const { width, height, pathD, nodes, N, tier } = layout;

  const imageUrls = useMemo(
    () => nodes.map((n) => n.achievement.image?.src || n.achievement.image || null),
    [nodes]
  );
  const imagesReady = usePreloadImages(imageUrls);

  const [activeIndex, setActiveIndex] = useState(0);

  // Refs
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const pathRef = useRef(null);
  const highlightRef = useRef(null);
  const charRootRef = useRef(null);
  const charFaceRef = useRef(null);
  const charBobRef = useRef(null);
  const particlesRef = useRef(null);

  // Scroll length: more stops => longer scroll story.
  const scrollVh = Math.max(240, N * 115);

  const jumpToIndex = useCallback(
    (index) => {
      const section = sectionRef.current;
      if (!section || N === 0) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const range = section.offsetHeight - window.innerHeight;
      const progress = N > 1 ? index / (N - 1) : 0;
      // Match the eased travel window used in the timeline (5%..95%).
      const scrollProgress = 0.05 + progress * 0.9;
      window.scrollTo({ top: top + range * scrollProgress, behavior: 'smooth' });
    },
    [N]
  );

  useGSAP(
    () => {
      if (N === 0 || !imagesReady || reducedMotion) return;

      const pathEl = pathRef.current;
      const highlightEl = highlightRef.current;
      const worldEl = worldRef.current;
      const stageEl = stageRef.current;
      const charRoot = charRootRef.current;
      const charFace = charFaceRef.current;
      const charBob = charBobRef.current;
      if (!pathEl || !worldEl || !stageEl || !charRoot) return;

      const pathLength = pathEl.getTotalLength();

      // --- Precompute each node's fractional position along the path ---
      // Sample once, then snap every node to its nearest sample so reveals
      // fire exactly when the character passes that point.
      const SAMPLES = 400;
      const sampled = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const p = pathEl.getPointAtLength((i / SAMPLES) * pathLength);
        sampled.push(p);
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

      // --- Idle character motion (independent of scroll) ---
      const bob = gsap.to(charBob, {
        y: -10,
        duration: 1.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      const sway = gsap.to(charFace, {
        rotation: '+=2',
        duration: 2.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // --- Camera follow via quickSetters (no React re-render, no thrash) ---
      const setX = gsap.quickSetter(worldEl, 'x', 'px');
      const setY = gsap.quickSetter(worldEl, 'y', 'px');
      const setScale = gsap.quickSetter(worldEl, 'scale');
      const setStageRot = gsap.quickSetter(stageEl, 'rotation', 'deg');

      const cam = { scale: tier.camScale ?? 1.05, rot: 0 };
      let lastActive = -1;

      const focusX = () => stageEl.clientWidth / 2;
      const focusY = () => stageEl.clientHeight * 0.54;

      // Position the character + camera for a given path progress (0..1).
      const place = (progress, immediate) => {
        const len = progress * pathLength;
        const pt = pathEl.getPointAtLength(len);

        // Facing: sample tangent slightly ahead.
        const ahead = pathEl.getPointAtLength(Math.min(pathLength, len + 2));
        const behind = pathEl.getPointAtLength(Math.max(0, len - 2));
        const dx = ahead.x - behind.x;
        const dy = ahead.y - behind.y;
        const facing = dx < 0 ? -1 : 1;
        const tilt = gsap.utils.clamp(-9, 9, (dy / (Math.abs(dx) + 0.001)) * 6 * facing);

        // Place character at its world point.
        gsap.set(charRoot, { x: pt.x, y: pt.y });
        // Flip to face travel direction + slight downhill/uphill tilt.
        const faceSetter = immediate ? gsap.set : gsap.to;
        faceSetter(charFace, {
          scaleX: facing,
          rotationZ: tilt,
          duration: immediate ? 0 : 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        // Zoom: closer near a stop, wider while travelling.
        let nearest = Infinity;
        for (let i = 0; i < nodeProgress.length; i++) {
          nearest = Math.min(nearest, Math.abs(progress - nodeProgress[i]));
        }
        const proximity = gsap.utils.clamp(0, 1, 1 - nearest / 0.06);
        const baseScale = tier.camScale ?? 1.05;
        cam.scale = baseScale + proximity * (tier.camZoom ?? 0.16);

        // Translate the world so the character sits at the focus point,
        // accounting for current scale. Origin is top-left (0 0).
        setScale(cam.scale);
        setX(focusX() - pt.x * cam.scale);
        setY(focusY() - pt.y * cam.scale);
      };

      // --- Master scrubbed timeline ---
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

      // Travel window: ease onto the path (5%) and off it (95%) so the ends
      // breathe. Everything below is positioned on this same timeline.
      tl.to(proxy, {
        p: 1,
        ease: 'none',
        duration: 1,
        onUpdate: () => {
          const prog = 0.03 + proxy.p * 0.94;
          place(prog, false);

          // Path draw + highlight follow the character.
          gsap.set(pathEl, { strokeDashoffset: pathLength * (1 - prog) });
          gsap.set(highlightEl, { strokeDashoffset: -(prog * pathLength) + HL });

          // Active node = last one the character has passed.
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
            setActiveIndex(active);
          }
        },
      });

      // Slow cinematic camera sway (tiny rotation, never static).
      const camSway = gsap.to(stageEl, {
        rotation: tier.camRot ?? 0.8,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      // Per-node reveal tweens keyed to arrival progress on the SAME timeline.
      // xPercent/yPercent stay constant so GSAP-owned transforms keep the
      // slots centred on their world point while scale/opacity animate.
      nodes.forEach((n, i) => {
        const at = gsap.utils.clamp(0, 1, (nodeProgress[i] - 0.03) / 0.94 - 0.02);
        const stemOrigin = n.side === 'above' ? 'bottom center' : 'top center';

        tl.fromTo(
          `.jnode-${i}`,
          { scale: 0.2, autoAlpha: 0, xPercent: -50, yPercent: -50 },
          { scale: 1, autoAlpha: 1, xPercent: -50, yPercent: -50, ease: 'back.out(1.7)', duration: 0.04 },
          at
        );
        tl.fromTo(
          `.jstem-${i}`,
          { scaleY: 0, autoAlpha: 0, xPercent: -50, transformOrigin: stemOrigin },
          { scaleY: 1, autoAlpha: 1, xPercent: -50, transformOrigin: stemOrigin, ease: 'power2.out', duration: 0.04 },
          at + 0.005
        );
        tl.fromTo(
          `.jcard-${i}`,
          { autoAlpha: 0, y: 26, scale: 0.86, xPercent: -50, yPercent: -50 },
          { autoAlpha: 1, y: 0, scale: 1, xPercent: -50, yPercent: -50, ease: 'back.out(1.4)', duration: 0.06 },
          at + 0.008
        );
      });

      // Character centred horizontally with feet on the path point.
      gsap.set(charRoot, { xPercent: -50, yPercent: -100, autoAlpha: 1 });

      // Initial placement so nothing pops on first paint.
      place(0.03, true);

      return () => {
        bob.kill();
        sway.kill();
        camSway.kill();
      };
    },
    { scope: sectionRef, dependencies: [N, imagesReady, reducedMotion, pathD, tierKey] }
  );

  // Reduced-motion: scale the whole map to fit the viewport width and show
  // it in full (no scroll camera). Everything is revealed at rest via CSS.
  useLayoutEffect(() => {
    if (!reducedMotion || N === 0) return undefined;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!stage || !world) return undefined;

    const fit = () => {
      const avail = stage.clientWidth - 32;
      const scale = Math.min(1, avail / width);
      world.style.transform = `scale(${scale})`;
      world.style.transformOrigin = 'top center';
      stage.style.height = `${height * scale + 48}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [reducedMotion, N, width, height]);

  if (N === 0) return null;

  const nodeState = (i) =>
    i === activeIndex ? 'active' : i < activeIndex ? 'lit' : 'inactive';

  // Card sits offset from its node, on the same side the path bulges.
  const CARD_GAP = 150;
  const cardPos = (n) =>
    n.side === 'above'
      ? { x: n.x, y: n.y - CARD_GAP, anchor: 'above' }
      : { x: n.x, y: n.y + CARD_GAP, anchor: 'below' };

  return (
    <section
      ref={sectionRef}
      className={`journey-section ${reducedMotion ? 'is-static' : ''}`}
      style={{ height: reducedMotion ? 'auto' : `${scrollVh}vh` }}
      aria-label="Perjalanan karir Nur Intan"
    >
      <div ref={stageRef} className="journey-stage">
        <JourneyBackground reducedMotion={reducedMotion} />

        {/* Header overlay (fixed to the camera frame, not the world) */}
        <div className="journey-header">
          <span className="journey-eyebrow">Cinematic Journey</span>
          <h2 className="journey-heading">Jejak Cahaya Intan</h2>
          <p className="journey-sub">
            Ikuti perjalanan karir Nur Intan JKT48. Gulir perlahan dan saksikan
            setiap destinasi terungkap.
          </p>
        </div>

        {/* The moving world */}
        <div
          ref={worldRef}
          className="journey-world"
          style={{ width, height }}
        >
          <JourneyPath
            ref={pathRef}
            highlightRef={highlightRef}
            d={pathD}
            width={width}
            height={height}
          />

          {/* Connector stems (node -> card) */}
          {nodes.map((n, i) => {
            const c = cardPos(n);
            return (
              <span
                key={`stem-${i}`}
                className={`jstem-${i} journey-stem anchor-${c.anchor}`}
                style={{ left: n.x, top: c.anchor === 'above' ? c.y : n.y, height: CARD_GAP }}
              />
            );
          })}

          {/* Cards — slot owns position, inner mover owns hover/magnetic */}
          {nodes.map((n, i) => {
            const c = cardPos(n);
            return (
              <div
                key={`card-${i}`}
                className={`jcard-${i} journey-card-slot anchor-${c.anchor}`}
                style={{ left: c.x, top: c.y }}
              >
                <JourneyCard
                  achievement={n.achievement}
                  cardW={tier.cardW}
                  onSelect={() => jumpToIndex(i)}
                  interactive={!reducedMotion}
                />
              </div>
            );
          })}

          {/* Nodes — slot owns position, GSAP reveals the slot */}
          {nodes.map((n, i) => (
            <div
              key={`node-${i}`}
              className={`jnode-${i} journey-node-slot`}
              style={{ left: n.x, top: n.y }}
            >
              <JourneyNode
                achievement={n.achievement}
                state={nodeState(i)}
                onSelect={() => jumpToIndex(i)}
              />
            </div>
          ))}

          {/* Character rides inside the world so the camera can follow it */}
          {!reducedMotion && (
            <JourneyCharacter
              rootRef={charRootRef}
              faceRef={charFaceRef}
              bobRef={charBobRef}
              size={tier.charSize ?? 112}
            />
          )}

          {/* Sparkle bursts */}
          <JourneyParticles ref={particlesRef} />
        </div>
      </div>
    </section>
  );
}
