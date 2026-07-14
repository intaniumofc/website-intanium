'use client';

import { memo, useMemo } from 'react';

/**
 * Soft cinematic backdrop: yellow gradient + subtle paper grain + a few
 * large soft blobs + tiny twinkling stars. Purely presentational and very
 * lightweight — no per-frame JS, all motion is CSS. Sits behind the camera
 * so it never competes with the journey itself.
 */
function JourneyBackground({ reducedMotion = false }) {
  // Deterministic star field (no Math.random so SSR/CSR match).
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const golden = (i * 137.508) % 100;
        const top = ((i * 53.7) % 100);
        return {
          left: `${golden.toFixed(2)}%`,
          top: `${top.toFixed(2)}%`,
          size: 1.5 + ((i * 7) % 3),
          delay: `${((i * 0.37) % 4).toFixed(2)}s`,
          dur: `${(2.6 + ((i * 0.19) % 2.2)).toFixed(2)}s`,
        };
      }),
    []
  );

  return (
    <div className="journey-bg" aria-hidden="true">
      {/* Warm yellow gradient base */}
      <div className="journey-bg-gradient" />

      {/* Very soft blobs */}
      <div className="journey-blob journey-blob-1" />
      <div className="journey-blob journey-blob-2" />
      <div className="journey-blob journey-blob-3" />

      {/* Minimal paper / noise texture */}
      <div className="journey-bg-paper" />

      {/* Tiny twinkling stars + floating sparkles */}
      {!reducedMotion && (
        <div className="journey-stars">
          {stars.map((s, i) => (
            <span
              key={i}
              className={`journey-star ${i % 5 === 0 ? 'is-sparkle' : ''}`}
              style={{
                left: s.left,
                top: s.top,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: s.delay,
                animationDuration: s.dur,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(JourneyBackground);
