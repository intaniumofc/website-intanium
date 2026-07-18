'use client';

import { useMemo } from 'react';

/**
 * Responsive geometry presets for the journey world — a VERTICAL SERPENTINE
 * roadmap. The route snakes down the canvas: a long horizontal run, then a
 * large-radius PERFECT half-circle U-turn, then the opposite run — always
 * progressing downward. Milestones land at the start of each run (immediately
 * after a bend). Everything is generated procedurally from the achievements
 * array, so adding milestones just extends the roadmap downward — unlimited.
 *
 *   r        : U-turn radius (180–280px per brief). The bend is a TRUE
 *              semicircle, so the vertical drop between runs is exactly 2r.
 *   runW     : length of each horizontal segment (the "wide" roadmap feel)
 *   cardW    : destination card width
 *   cardH    : destination card height (used for bottom padding)
 *   gap      : node -> card horizontal offset (card sits toward viewport centre)
 *   padTop   : breathing room above the first milestone
 */
// ───────────────────────────────────────────────────────────────────────────
// GLOBAL TIMELINE SCALE — the single knob that resizes the whole map.
// Every linear dimension below (card, character, node, path stroke, bend
// radius, spacing) is multiplied by this before geometry is built, so the map
// scales as one piece and nothing ever desyncs from the road. Camera fields
// (camScale/camZoom/camRot) are unitless ratios and are intentionally NOT
// scaled — they control framing, not size.
//   1.00 = raw baseline · 0.88 ≈ the "zoomed to ~88%" feel · lower = smaller.
// Tune this one number to make the entire timeline bigger or smaller.
export const TIMELINE_SCALE = 0.88;

// Raw, unscaled per-tier presets. Values are authored at 1.0 and scaled by
// TIMELINE_SCALE (and any responsive overrides) in buildTier below.
const JOURNEY_TIERS_BASE = {
  desktop: { r: 260, runW: 720, cardW: 300, cardH: 300, gap: 30, padTop: 210, camScale: 0.62, camZoom: 0.05, camRot: 0.4, charSize: 126, nodeSize: 22, nodeMajor: 30, stroke: 8 },
  tablet: { r: 215, runW: 520, cardW: 270, cardH: 280, gap: 26, padTop: 180, camScale: 0.62, camZoom: 0.04, camRot: 0.35, charSize: 108, nodeSize: 20, nodeMajor: 27, stroke: 7 },
  mobile: { r: 180, runW: 280, cardW: 230, cardH: 250, gap: 20, padTop: 150, camScale: 0.68, camZoom: 0.03, camRot: 0.3, charSize: 92, nodeSize: 18, nodeMajor: 24, stroke: 6 },
};

// Fields that represent a physical size in world px and must be scaled. Camera
// ratios are deliberately excluded so framing stays constant as size changes.
const SCALED_FIELDS = ['r', 'runW', 'cardW', 'cardH', 'gap', 'padTop', 'charSize', 'nodeSize', 'nodeMajor', 'stroke'];

function buildTier(key, scale = TIMELINE_SCALE) {
  const base = JOURNEY_TIERS_BASE[key] || JOURNEY_TIERS_BASE.desktop;
  const out = { ...base };
  for (const f of SCALED_FIELDS) out[f] = base[f] * scale;
  return out;
}

export const JOURNEY_TIERS = {
  desktop: buildTier('desktop'),
  tablet: buildTier('tablet'),
  mobile: buildTier('mobile'),
};

// Cubic-Bézier "magic" constant for a circular arc: 4/3 * tan(π/8). Two
// quarter-arc cubics with this handle length reproduce a semicircle so closely
// the error is invisible at any zoom — this is what makes the bends read as
// perfect Formula-1 corners rather than pipe elbows.
const KAPPA = 0.5522847498307936;

/**
 * Builds a boustrophedon ("ox-turning", snake-like) path from the node rows.
 * Each row is a straight horizontal run; consecutive runs are joined by a TRUE
 * 180° semicircle built from two quarter-arc cubic Béziers. Tangents are
 * horizontal where a run meets the arc and vertical at the arc's apex, so the
 * whole route is C1-continuous: there is NO visible angle anywhere, only large
 * flowing half-circle bends.
 */
function serpentinePath(nodes, xL, xR, r) {
  const N = nodes.length;
  const f = (v) => v.toFixed(2);
  const d = [`M ${f(nodes[0].x)},${f(nodes[0].y)}`];

  const WAVE_AMP = 10;
  const WAVE_SEGS = 40;

  for (let i = 0; i < N; i++) {
    const y = nodes[i].y;
    const startX = nodes[i].x;
    const endX = startX === xL ? xR : xL;

    const runLen = Math.abs(endX - startX);
    const dir = endX > startX ? 1 : -1;

    for (let s = 1; s <= WAVE_SEGS; s++) {
      const t = s / WAVE_SEGS;
      const px = startX + dir * runLen * t;
      const damp = Math.sin(t * Math.PI);
      const waveOffset = Math.sin(t * Math.PI * 2 + i * 1.7) * WAVE_AMP * damp;
      d.push(`L ${f(px)},${f(y + waveOffset)} `);
    }

    if (i < N - 1) {
      const bendDir = endX === xR ? 1 : -1;
      const apexX = endX + bendDir * r;
      const yMid = y + r;
      const yEnd = y + 2 * r;

      d.push(
        `C ${f(endX + bendDir * KAPPA * r)},${f(y)} ` +
          `${f(apexX)},${f(yMid - KAPPA * r)} ${f(apexX)},${f(yMid)}`
      );
      d.push(
        `C ${f(apexX)},${f(yMid + KAPPA * r)} ` +
          `${f(endX + bendDir * KAPPA * r)},${f(yEnd)} ${f(endX)},${f(yEnd)}`
      );
    }
  }
  return d.join(' ');
}

/**
 * Builds the full journey geometry from the achievement list and a responsive
 * tier. Pure + memoized — no DOM access, no per-frame work.
 *
 * Returns:
 *  - width / height : world canvas size in px
 *  - pathD          : the serpentine SVG path string
 *  - nodes[]        : { x, y, side, cardX, achievement } — side alternates
 *                     left / right; the card sits on the OUTER side of the bend.
 */
export function useJourneyLayout(achievements, tierKey = 'desktop') {
  const tier = JOURNEY_TIERS[tierKey] || JOURNEY_TIERS.desktop;

  return useMemo(() => {
    const items = achievements.filter((a) => a.showInTimeline !== false);
    const N = items.length;

    if (N === 0) {
      return { width: 0, height: 0, pathD: '', nodes: [], N: 0, tier };
    }

    const { r, runW, cardW, cardH, gap, padTop } = tier;

    // Vertical rhythm between milestones equals the semicircle drop (2r), which
    // keeps every bend a true half-circle and the whole map evenly paced.
    const rowH = 2 * r;

    // The bulges reach r beyond each rail, so the world needs that much margin
    // on both sides. Cards sit INSIDE (toward centre), so they need no extra.
    const margin = r + 44;
    const xL = margin;
    const xR = margin + runW;
    const width = xR + margin;

    // Card centre sits toward the viewport centre (inside the bend) and a touch
    // below the node, giving the Character -> Node -> Card vertical read while
    // never drifting to a screen edge or covering the road.
    const cardCentreOffset = gap + cardW / 2; // node -> card centre, horizontal
    const cardDrop = cardH / 2 + 28; // node -> card centre, vertical

    // Milestones alternate left / right, marching steadily downward. Node i sits
    // at the START of run i (immediately after the preceding bend).
    const nodes = items.map((achievement, i) => {
      const onLeft = i % 2 === 0;
      const x = onLeft ? xL : xR;
      const y = padTop + i * rowH;
      // Bend after a left-rail node bulges RIGHT -> card inside-right, and vice
      // versa. Card is always pulled toward the centre of the roadmap.
      const cardX = onLeft ? x + cardCentreOffset : x - cardCentreOffset;
      return {
        x,
        y,
        side: onLeft ? 'left' : 'right', // rail the node sits on
        cardSide: onLeft ? 'right' : 'left', // side the card sits on (inside)
        cardX,
        cardY: y + cardDrop,
        achievement,
        index: i,
      };
    });

    // Room below the last node for its card + the trailing bulge.
    const height = padTop + (N - 1) * rowH + cardDrop + cardH / 2 + 60;
    const pathD = serpentinePath(nodes, xL, xR, r);

    return { width, height, pathD, nodes, N, tier };
  }, [achievements, tier]);
}
