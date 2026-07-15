'use client';

import React, { useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';

import { useJourneyLayout } from './useJourneyLayout';
import { usePreloadImages } from './usePreloadImages';
import { useJourneyEnvironment } from './useJourneyEnvironment';
import { useJourneyAnimation } from './useJourneyAnimation';
import JourneyBackground from './JourneyBackground';
import JourneyPath from './JourneyPath';
import JourneyNode from './JourneyNode';
import JourneyCard from './JourneyCard';
import JourneyCharacter from './JourneyCharacter';
import JourneyParticles from './JourneyParticles';
import JourneyPolaroid from './JourneyPolaroid';
import JourneyWheel from './JourneyWheel';
import './journey.css';

/**
 * JourneyMap — cinematic travel-map experience.
 * The section is pinned; scrolling advances a single scrubbed master
 * timeline (see useJourneyAnimation). A "world" layer (path + nodes + cards +
 * character) is translated/zoomed so the CAMERA follows the character while
 * the world glides beneath it. This component is pure composition; all motion
 * lives in the hook.
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
      // Match the eased travel window used in the timeline (3%..97%).
      const scrollProgress = 0.03 + progress * 0.94;
      window.scrollTo({ top: top + range * scrollProgress, behavior: 'smooth' });
    },
    [N]
  );

  useJourneyAnimation({
    refs: {
      sectionRef,
      stageRef,
      worldRef,
      pathRef,
      highlightRef,
      charRootRef,
      charFaceRef,
      charBobRef,
      particlesRef,
    },
    nodes,
    N,
    tier,
    pathD,
    tierKey,
    imagesReady,
    reducedMotion,
    onActiveChange: setActiveIndex,
  });

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
      const offsetX = Math.max(0, (stage.clientWidth - width * scale) / 2);
      world.style.transformOrigin = '0 0';
      world.style.transform = `translateX(${offsetX}px) scale(${scale})`;
      stage.style.height = `${height * scale + 48}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [reducedMotion, N, width, height]);

  if (N === 0) return null;

  const nodeState = (i) =>
    i === activeIndex ? 'active' : i < activeIndex ? 'lit' : 'inactive';

  return (
    <>
      <section
        ref={sectionRef}
        className={`journey-section ${reducedMotion ? 'is-static' : ''}`}
        style={{ height: reducedMotion ? 'auto' : `${scrollVh}vh` }}
        aria-label="Perjalanan karir Nur Intan"
      >
        <div ref={stageRef} className="journey-stage">
          <JourneyBackground reducedMotion={reducedMotion} />

          {/* Header overlay — inside stage so it sits on the starry background */}
          <div className="journey-header">
            <h2 className="journey-heading">Jejak Cahaya Intan</h2>
            <p className="journey-sub">
              Ikuti perjalanan karir Nur Intan JKT48. Gulir perlahan dan saksikan
              setiap destinasi terungkap.
            </p>
          </div>

          {/* Month wheel — left-side navigator */}
          {!reducedMotion && (
            <JourneyWheel
              nodes={nodes}
              activeIndex={activeIndex}
              onSelect={jumpToIndex}
            />
          )}

          {/* The moving world */}
          <div ref={worldRef} className="journey-world" style={{ width, height }}>
            <JourneyPath
              ref={pathRef}
              highlightRef={highlightRef}
              d={pathD}
              width={width}
              height={height}
              stroke={tier.stroke}
            />

            {/* Connector stems: node -> card (diagonal, drawn via SVG line) */}
            <svg className="journey-stems" width={width} height={height} aria-hidden="true">
              {nodes.map((n, i) => (
                <line
                  key={`stem-${i}`}
                  className={`jstem-${i} journey-stem`}
                  x1={n.x}
                  y1={n.y}
                  x2={n.cardX}
                  y2={n.cardY - tier.cardH / 2}
                />
              ))}
            </svg>

            {/* Cards — slot owns position, inner mover owns hover/magnetic */}
            {nodes.map((n, i) => (
              <div
                key={`card-${i}`}
                className={`jcard-${i} journey-card-slot anchor-${n.cardSide}`}
                style={{ left: n.cardX, top: n.cardY }}
              >
                <JourneyCard
                  achievement={n.achievement}
                  cardW={tier.cardW}
                  onSelect={() => jumpToIndex(i)}
                  interactive={!reducedMotion}
                />
              </div>
            ))}

            {/* Nodes — slot owns position, the hook reveals the slot */}
            {nodes.map((n, i) => (
              <div
                key={`node-${i}`}
                className={`jnode-${i} journey-node-slot`}
                style={{
                  left: n.x,
                  top: n.y,
                  '--jnode-size': `${tier.nodeSize}px`,
                  '--jnode-major': `${tier.nodeMajor}px`,
                }}
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

            {/* Polaroid placeholders at outer edges of each milestone */}
            {nodes.map((n, i) => {
              const polaroidSide = n.side === 'left' ? 'left' : 'right';
              const polaroidX = polaroidSide === 'left'
                ? -140
                : width - 60;
              return (
                <div
                  key={`polaroid-${i}`}
                  className={`jpolaroid-${i} journey-polaroid-slot`}
                  style={{
                    left: polaroidX,
                    top: n.y,
                  }}
                >
                  <JourneyPolaroid
                    x={0}
                    y={0}
                    side={polaroidSide}
                    rotation={polaroidSide === 'left' ? -6 : 6}
                    imgSrc={n.achievement.polaroidImage?.src || n.achievement.polaroidImage || null}
                  />
                </div>
              );
            })}

            {/* Sparkle bursts */}
            <JourneyParticles ref={particlesRef} />
          </div>
        </div>
      </section>
    </>
  );
}
