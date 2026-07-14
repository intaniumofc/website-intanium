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
  { d, width, height, highlightRef },
  ref
) {
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
        <linearGradient id="journey-path-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="journey-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Faint dotted "planned route" — the road ahead */}
      <path
        d={d}
        stroke="rgba(180, 83, 9, 0.30)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="0.1 15"
      />

      {/* Traveled trail — solid glowing gradient, revealed via strokeDashoffset */}
      <path
        ref={ref}
        d={d}
        stroke="url(#journey-path-gradient)"
        strokeWidth={5}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 7px rgba(217,119,6,0.5))' }}
      />

      {/* Travelling highlight — a short bright dash that glides along */}
      <path
        ref={highlightRef}
        d={d}
        stroke="#fffbe6"
        strokeWidth={5}
        strokeLinecap="round"
        filter="url(#journey-path-glow)"
        style={{ opacity: 0.9 }}
      />
    </svg>
  );
});

export default memo(JourneyPath);
