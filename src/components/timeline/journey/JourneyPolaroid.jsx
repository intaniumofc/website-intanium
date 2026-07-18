'use client';

import { memo } from 'react';

function JourneyPolaroid({ x, y, side, rotation = 0, imgSrc = null }) {
  const translateX = side === 'left' ? -1 : 1;
  return (
    <div
      className={`journey-polaroid anchor-${side}`}
      style={{
        left: x,
        top: y,
        transform: `translate(${translateX * 100}%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <div className="journey-polaroid-inner">
        <div className="journey-polaroid-frame">
          {imgSrc ? (
            <img src={imgSrc} alt="" loading="lazy" draggable="false" />
          ) : (
            <div className="journey-polaroid-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="journey-polaroid-label" />
      </div>
    </div>
  );
}

export default memo(JourneyPolaroid);
