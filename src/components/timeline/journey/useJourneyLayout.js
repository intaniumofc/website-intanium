'use client';

import { useMemo } from 'react';

/**
 * Responsive geometry presets for the journey world.
 * The "world" is a large virtual px canvas the camera pans across.
 * All three tiers describe the SAME journey — only spacing / amplitude
 * change so the path stays readable on smaller screens.
 */
export const JOURNEY_TIERS = {
  desktop: { segW: 780, amp: 150, midY: 460, height: 920, padX: 560, cardW: 320, camScale: 1.05, camZoom: 0.16, camRot: 0.8, charSize: 116 },
  tablet: { segW: 620, amp: 120, midY: 400, height: 800, padX: 420, cardW: 290, camScale: 1.0, camZoom: 0.14, camRot: 0.6, charSize: 100 },
  mobile: { segW: 460, amp: 70, midY: 360, height: 720, padX: 300, cardW: 250, camScale: 0.92, camZoom: 0.1, camRot: 0.4, charSize: 84 },
};

/**
 * Convert a set of points into a smooth cubic-bezier path string using a
 * Catmull-Rom spline. The resulting curve passes exactly through every
 * point (so nodes always sit on the path) and never produces sharp turns.
 */
function catmullRomPath(points, tension = 1) {
  if (points.length < 2) return '';
  const d = [`M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];
  const k = tension / 6;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;

    d.push(
      `C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
    );
  }
  return d.join(' ');
}

/**
 * Builds the full journey geometry from the achievement list and a
 * responsive tier. Pure + memoized — no DOM access, no per-frame work.
 *
 * Returns:
 *  - width / height : world canvas size in px
 *  - pathD          : the smooth SVG path string
 *  - nodes[]        : { x, y, side, achievement } — side alternates above/below
 */
export function useJourneyLayout(achievements, tierKey = 'desktop') {
  const tier = JOURNEY_TIERS[tierKey] || JOURNEY_TIERS.desktop;

  return useMemo(() => {
    const items = achievements.filter((a) => a.showInTimeline !== false);
    const N = items.length;

    if (N === 0) {
      return { width: 0, height: tier.height, pathD: '', nodes: [], N: 0, tier };
    }

    const { segW, amp, midY, padX } = tier;

    // Node anchor points — alternate above / below the centre line so the
    // path gently undulates like an airplane travel map.
    const nodes = items.map((achievement, i) => {
      const dir = i % 2 === 0 ? -1 : 1; // even = above, odd = below
      // Ease the amplitude a touch on the very first / last so ends feel calm.
      const edgeEase = i === 0 || i === N - 1 ? 0.72 : 1;
      return {
        x: padX + i * segW,
        y: midY + dir * amp * edgeEase,
        side: dir === -1 ? 'above' : 'below',
        achievement,
        index: i,
      };
    });

    const width = padX * 2 + (N - 1) * segW;

    // Lead-in / lead-out control points so the character eases onto and off
    // the path instead of popping at the exact first / last node.
    const first = nodes[0];
    const last = nodes[N - 1];
    const pathPoints = [
      { x: first.x - padX * 0.72, y: midY + amp * 0.35 },
      ...nodes.map((n) => ({ x: n.x, y: n.y })),
      { x: last.x + padX * 0.72, y: midY - amp * 0.35 },
    ];

    const pathD = catmullRomPath(pathPoints);

    return { width, height: tier.height, pathD, nodes, N, tier };
  }, [achievements, tier]);
}
