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
function JourneyCharacter({ rootRef, faceRef, bobRef, size = 96 }) {
  return (
    <div
      ref={rootRef}
      className="journey-character"
      style={{ width: size, height: size }}
    >
      <div ref={faceRef} className="journey-character-face">
        <div ref={bobRef} className="journey-character-bob">
          {/* Warm glowing aura halo */}
          <span className="journey-character-glow" aria-hidden="true" />
          
          {/* 3D Flapping Butterfly Wrapper */}
          <div className="journey-butterfly-wrapper">
            <img
              src="/kupu-kupu.png"
              alt="Kupu-Kupu Penjelajah IRIS"
              className="journey-butterfly-img"
              draggable="false"
            />
          </div>
        </div>
      </div>
      {/* Ground shadow beneath the butterfly */}
      <span className="journey-character-shadow" aria-hidden="true" />
    </div>
  );
}

export default memo(JourneyCharacter);
