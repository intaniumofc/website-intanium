'use client';

import { forwardRef, memo } from 'react';

const JourneyPath = forwardRef(function JourneyPath(
  { d, width, height, highlightRef, stroke = 8, startPt, endPt },
  ref
) {
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
        <linearGradient id="journey-path-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-pink)" />
          <stop offset="50%" stopColor="var(--color-purple)" />
          <stop offset="100%" stopColor="var(--color-blue)" />
        </linearGradient>
        <filter id="journey-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background roadmap */}
      <path
        d={d}
        stroke="rgba(109, 92, 255, 0.18)"
        strokeWidth={baseW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Progress path */}
      <path
        ref={ref}
        d={d}
        stroke="url(#journey-path-gradient)"
        strokeWidth={progW}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 8px rgba(109,92,255,0.55))' }}
      />

      {/* Travelling highlight */}
      <path
        ref={highlightRef}
        d={d}
        stroke="#fffdf0"
        strokeWidth={hlW}
        strokeLinecap="round"
        filter="url(#journey-path-glow)"
        style={{ opacity: 0.9 }}
      />

      {/* Start Circle Cap */}
      {startPt && (
        <g className="journey-path-cap journey-path-cap-start">
          <circle
            cx={startPt.x}
            cy={startPt.y}
            r={stroke * 1.8}
            fill="rgba(236, 72, 153, 0.25)"
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth="2"
          />
          <circle
            cx={startPt.x}
            cy={startPt.y}
            r={stroke * 1.1}
            fill="url(#journey-path-gradient)"
            stroke="#ffffff"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.8))' }}
          />
          <circle
            cx={startPt.x}
            cy={startPt.y}
            r={stroke * 0.4}
            fill="#ffffff"
          />
        </g>
      )}

      {/* End Circle Cap */}
      {endPt && (
        <g className="journey-path-cap journey-path-cap-end">
          <circle
            cx={endPt.x}
            cy={endPt.y}
            r={stroke * 1.8}
            fill="rgba(168, 85, 247, 0.25)"
            stroke="rgba(168, 85, 247, 0.6)"
            strokeWidth="2"
          />
          <circle
            cx={endPt.x}
            cy={endPt.y}
            r={stroke * 1.1}
            fill="url(#journey-path-gradient)"
            stroke="#ffffff"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))' }}
          />
          <circle
            cx={endPt.x}
            cy={endPt.y}
            r={stroke * 0.4}
            fill="#ffffff"
          />
        </g>
      )}
    </svg>
  );
});

export default memo(JourneyPath);
