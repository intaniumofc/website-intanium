'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';

import { X, ChevronLeft, ChevronRight, Calendar, Sparkles, Tag } from 'lucide-react';
import { useJourneyLayout } from './useJourneyLayout';
import { usePreloadImages } from './usePreloadImages';
import { useJourneyEnvironment } from './useJourneyEnvironment';
import { useJourneyAnimation } from './useJourneyAnimation';
import JourneyBackground from './JourneyBackground';
import JourneyButterflies from './JourneyButterflies';
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
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);

  // Keyboard ESC listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMilestoneIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        {/* Header — lives in the SECTION (not the pinned stage), so it greets
            the reader at the top and scrolls away naturally instead of staying
            glued to the viewport for the whole pinned journey. */}
        <div className="journey-header">
          <h2 className="journey-heading">Jejak Cahaya Intan</h2>
          <p className="journey-sub">
            Ikuti perjalanan karir Nur Intan JKT48. Gulir perlahan dan saksikan
            setiap destinasi terungkap.
          </p>
        </div>

        <div ref={stageRef} className="journey-stage">
          <JourneyBackground reducedMotion={reducedMotion} />

          {/* Ambient butterflies + dust drifting across the whole scene */}
          <JourneyButterflies reducedMotion={reducedMotion} />

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
              startPt={layout.startPt}
              endPt={layout.endPt}
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
                  onSelect={() => {
                    jumpToIndex(i);
                    setSelectedMilestoneIndex(i);
                  }}
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
                  onSelect={() => {
                    jumpToIndex(i);
                    setSelectedMilestoneIndex(i);
                  }}
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

            {/* Symmetrical 150px polaroid offset relative to node X */}
            {nodes.map((n, i) => {
              const polaroidSide = n.side === 'left' ? 'left' : 'right';
              const polaroidX = polaroidSide === 'left' ? n.x - 150 : n.x + 150;
              return (
                <div
                  key={`polaroid-${i}`}
                  className={`jpolaroid-${i} journey-polaroid-slot anchor-${polaroidSide}`}
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

      {/* Milestone Detail Glassmorphic Modal (Styled matching Homepage News Modal) */}
      {selectedMilestoneIndex !== null && nodes[selectedMilestoneIndex]?.achievement && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedMilestoneIndex(null)}
        >
          <div
            className="relative z-[99999] flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating close button */}
            <button
              type="button"
              onClick={() => setSelectedMilestoneIndex(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 bg-black/60 hover:bg-black/85 text-white border border-white/20 rounded-full flex items-center justify-center z-50 cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="Tutup detail"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div
              className="custom-scrollbar flex h-full flex-col overflow-y-auto overscroll-contain min-w-0"
              data-lenis-prevent
            >
              {/* Photo Banner Header if image exists */}
              {(nodes[selectedMilestoneIndex].achievement.image?.src || nodes[selectedMilestoneIndex].achievement.image) && (
                <div className="relative h-48 sm:h-56 md:h-64 w-full flex-shrink-0 bg-black/10 overflow-hidden">
                  <img
                    src={nodes[selectedMilestoneIndex].achievement.image?.src || nodes[selectedMilestoneIndex].achievement.image}
                    alt={nodes[selectedMilestoneIndex].achievement.title}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Top Vignette for close button visibility */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent z-10" />

                  {/* Bottom Shadow Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                  {/* Category Badge & Meta Overlay */}
                  <div className="absolute bottom-4 left-5 sm:left-6 text-white z-20 space-y-1.5 max-w-[calc(100%-3rem)]">
                    <span className="inline-block px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border rounded-md shadow-sm bg-pink-100 text-pink-800 border-pink-300">
                      {nodes[selectedMilestoneIndex].achievement.category || 'Milestone'}
                    </span>
                    {nodes[selectedMilestoneIndex].achievement.date && (
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-white/90 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-white/80" />
                        <span>{nodes[selectedMilestoneIndex].achievement.date}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Body Content */}
              <div className="flex-grow bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-pink-tint-8)] px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9 min-w-0">
                <div className="mx-auto max-w-3xl space-y-5 w-full min-w-0">
                  {/* If no image banner, render Category & Date inline here */}
                  {!(nodes[selectedMilestoneIndex].achievement.image?.src || nodes[selectedMilestoneIndex].achievement.image) && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border rounded-md shadow-sm bg-pink-100 text-pink-800 border-pink-300">
                        {nodes[selectedMilestoneIndex].achievement.category || 'Milestone'}
                      </span>
                      {nodes[selectedMilestoneIndex].achievement.date && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[var(--color-pink)]" />
                          <span>{nodes[selectedMilestoneIndex].achievement.date}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-[var(--color-heading)] tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
                    {nodes[selectedMilestoneIndex].achievement.title}
                  </h1>

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pb-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-heading)]">#IntanShiningStar</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[var(--color-pink)]">
                      <span>Milestone #{selectedMilestoneIndex + 1}</span>
                    </div>
                  </div>

                  <div className="max-w-none space-y-4 text-sm leading-relaxed text-[var(--color-body)] md:text-base md:leading-8 whitespace-pre-line min-w-0">
                    <p>{nodes[selectedMilestoneIndex].achievement.description || nodes[selectedMilestoneIndex].achievement.details || 'Tidak ada deskripsi tambahan.'}</p>

                    {nodes[selectedMilestoneIndex].achievement.details &&
                     nodes[selectedMilestoneIndex].achievement.details !== nodes[selectedMilestoneIndex].achievement.description && (
                      <div className="p-4 rounded-xl bg-[var(--color-pink-tint-25)] border border-[var(--color-pink-tint-50)] text-xs sm:text-sm text-[var(--color-heading)] space-y-1 mt-4">
                        <span className="font-extrabold block text-[var(--color-pink)] uppercase tracking-wider text-[11px]">Catatan Tambahan:</span>
                        <p className="leading-relaxed whitespace-pre-line">{nodes[selectedMilestoneIndex].achievement.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Footer Bar */}
              <div className="sticky bottom-0 px-6 py-3.5 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-between gap-3 shrink-0 z-20">
                <button
                  type="button"
                  disabled={selectedMilestoneIndex <= 0}
                  onClick={() => {
                    const newIdx = selectedMilestoneIndex - 1;
                    jumpToIndex(newIdx);
                    setSelectedMilestoneIndex(newIdx);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-heading)] hover:bg-[var(--color-neutral-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelum
                </button>

                <span className="text-xs font-black text-[var(--color-text-secondary)]">
                  {selectedMilestoneIndex + 1} / {N}
                </span>

                <button
                  type="button"
                  disabled={selectedMilestoneIndex >= N - 1}
                  onClick={() => {
                    const newIdx = selectedMilestoneIndex + 1;
                    jumpToIndex(newIdx);
                    setSelectedMilestoneIndex(newIdx);
                  }}
                  className="px-4 py-2 text-xs font-extrabold text-white rounded-xl bg-[var(--color-pink)] hover:bg-[var(--color-iris-pink-dark)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Sesudah <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
