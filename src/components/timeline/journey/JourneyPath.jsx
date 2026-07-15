'use client';

import { forwardRef, memo } from 'react';

/**
 * The journey "road". Renders three stacked strokes on one shared path:
 *  1. a faint static base track
 *  2. the main dashed path (drawn in via strokeDashoffset)  -> `ref`
 *  3. a short glowing highlight that travels along the path -> `highlightRef`
 *
 * Rendering only. All animation is driven by the parent's timeline.
 */
const JourneyPath = forwardRef(function JourneyPath(
  { d, width, height, highlightRef, stroke = 8 },
  ref
) {
  // Three layered strokes keep their relative weights (base > progress >
  // highlight) as the global scale changes the overall thickness.
  const baseW = stroke + 1;
  const progW = stroke - 1;
  const hlW = stroke - 2;
  return (
    <svg
      className="journey-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Bright golden gradient for the traveled progress path */}
        {/* Deep blue to pink gradient for the traveled progress path */}
        <linearGradient id="journey-path-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#170C79" />
          <stop offset="50%" stopColor="#6d5cff" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="journey-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
 
      {/* Background roadmap — soft muted lavender-purple, the full route at rest */}
      <path
        d={d}
        stroke="rgba(109, 92, 255, 0.18)"
        strokeWidth={baseW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
 
      {/* Progress path — deep blue to pink gradient, revealed via strokeDashoffset */}
      <path
        ref={ref}
        d={d}
        stroke="url(#journey-path-gradient)"
        strokeWidth={progW}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 8px rgba(109,92,255,0.55))' }}
      />
 
      {/* Travelling highlight — a short bright glint that glides along */}
      <path
        ref={highlightRef}
        d={d}
        stroke="#fffdf0"
        strokeWidth={hlW}
        strokeLinecap="round"
        filter="url(#journey-path-glow)"
        style={{ opacity: 0.9 }}
      />
    </svg>
  );
});

export default memo(JourneyPath);
