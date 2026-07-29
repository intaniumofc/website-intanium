'use client';

import { useMemo } from 'react';

export const TIMELINE_SCALE = 0.88;

const JOURNEY_TIERS_BASE = {
  desktop: { r: 260, runW: 720, cardW: 300, cardH: 300, gap: 30, padTop: 210, camScale: 0.62, camZoom: 0.05, camRot: 0.4, charSize: 126, nodeSize: 22, nodeMajor: 30, stroke: 8 },
  tablet: { r: 215, runW: 520, cardW: 270, cardH: 280, gap: 26, padTop: 180, camScale: 0.62, camZoom: 0.04, camRot: 0.35, charSize: 108, nodeSize: 20, nodeMajor: 27, stroke: 7 },
  mobile: { r: 180, runW: 280, cardW: 230, cardH: 250, gap: 20, padTop: 150, camScale: 0.68, camZoom: 0.03, camRot: 0.3, charSize: 92, nodeSize: 18, nodeMajor: 24, stroke: 6 },
};

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

const KAPPA = 0.5522847498307936;

function serpentinePath(nodes, xL, xR, r, padTop) {
  const N = nodes.length;
  const f = (v) => v.toFixed(2);
  const centerX = (xL + xR) / 2;
  const startY = Math.max(40, padTop - 130);

  // Lead-in from horizontal center to first milestone node
  const d = [`M ${f(centerX)},${f(startY)}`];
  d.push(`C ${f(centerX)},${f(nodes[0].y - r * 0.7)} ${f(xL)},${f(nodes[0].y - r * 0.7)} ${f(nodes[0].x)},${f(nodes[0].y)}`);

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
    } else {
      // Lead-out from last milestone node to horizontal center
      const lastX = endX;
      const endY = y + 160;
      d.push(
        `C ${f(lastX)},${f(y + 70)} ` +
        `${f(centerX)},${f(y + 70)} ${f(centerX)},${f(endY)}`
      );
    }
  }
  return d.join(' ');
}

export function useJourneyLayout(achievements, tierKey = 'desktop') {
  const tier = JOURNEY_TIERS[tierKey] || JOURNEY_TIERS.desktop;

  return useMemo(() => {
    const items = achievements.filter((a) => a.showInTimeline !== false);
    const N = items.length;

    if (N === 0) {
      return { width: 0, height: 0, pathD: '', nodes: [], N: 0, tier };
    }

    const { r, runW, cardW, cardH, gap, padTop } = tier;

    const rowH = 2 * r;
    const margin = r + 44;
    const xL = margin;
    const xR = margin + runW;
    const width = xR + margin;

    const cardCentreOffset = gap + cardW / 2;
    const cardDrop = cardH / 2 + 28;

    const nodes = items.map((achievement, i) => {
      const onLeft = i % 2 === 0;
      const x = onLeft ? xL : xR;
      const y = padTop + i * rowH;
      const cardX = onLeft ? x + cardCentreOffset : x - cardCentreOffset;
      return {
        x,
        y,
        side: onLeft ? 'left' : 'right',
        cardSide: onLeft ? 'right' : 'left',
        cardX,
        cardY: y + cardDrop,
        achievement,
        index: i,
      };
    });

    const height = padTop + (N - 1) * rowH + cardDrop + cardH / 2 + 180;
    const pathD = serpentinePath(nodes, xL, xR, r, padTop);

    const centerX = (xL + xR) / 2;
    const startY = Math.max(40, padTop - 130);
    const lastNodeY = nodes[N - 1]?.y || padTop;
    const endY = lastNodeY + 160;

    const startPt = { x: centerX, y: startY };
    const endPt = { x: centerX, y: endY };

    return { width, height, pathD, nodes, N, tier, startPt, endPt };
  }, [achievements, tier]);
}
