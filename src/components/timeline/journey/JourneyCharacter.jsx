'use client';

import { memo } from 'react';

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
              src="/kupu-kupu.webp"
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
