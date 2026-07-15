'use client';

import { memo } from 'react';

/**
 * The travelling character (Intan cutout). Three nested layers keep the
 * animations independent and non-conflicting:
 *   rootRef  -> positioned along the path by MotionPath (world space)
 *   faceRef  -> horizontal flip + slight tilt to face travel direction
 *   bobRef   -> continuous idle bounce / float (never robotic)
 *
 * A soft ground shadow + warm glow sell the "floating on the map" feel.
 */
function JourneyCharacter({ rootRef, faceRef, bobRef, size = 116 }) {
  return (
    <div
      ref={rootRef}
      className="journey-character"
      style={{ width: size, height: size * 1.5 }}
    >
      <div ref={faceRef} className="journey-character-face">
        <div ref={bobRef} className="journey-character-bob">
          {/* Warm glow halo */}
          <span className="journey-character-glow" aria-hidden="true" />
          <img
            src="/intan-cutout.webp"
            alt="Nur Intan JKT48"
            className="journey-character-img"
            draggable="false"
            onError={(e) => {
              e.currentTarget.src = '/intan-cutout.png';
            }}
          />
        </div>
      </div>
      {/* Ground shadow stays flat on the map, under the feet */}
      <span className="journey-character-shadow" aria-hidden="true" />
    </div>
  );
}

export default memo(JourneyCharacter);
