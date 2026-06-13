import { COCKROACH_TYPES, FLYING_COCKROACH, getComboMultiplier } from './gameData';

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickCockroachType() {
  const total = COCKROACH_TYPES.reduce((sum, item) => sum + item.spawnWeight, 0);
  let roll = Math.random() * total;

  for (const item of COCKROACH_TYPES) {
    roll -= item.spawnWeight;
    if (roll <= 0) return item;
  }

  return COCKROACH_TYPES[0];
}

export function getSpawnInterval(elapsedSeconds) {
  if (elapsedSeconds >= 45) return 450;
  if (elapsedSeconds >= 30) return 650;
  if (elapsedSeconds >= 15) return 850;
  return 1050;
}

export function createCockroach({ gameWidth, gameHeight, type }) {
  const padding = 86;
  const side = randomBetween(0, 3);
  const horizontalStart = randomBetween(20, Math.max(20, gameWidth - padding));
  const verticalStart = randomBetween(20, Math.max(20, gameHeight - padding));
  const horizontalEnd = randomBetween(20, Math.max(20, gameWidth - padding));
  const verticalEnd = randomBetween(20, Math.max(20, gameHeight - padding));
  let x;
  let y;
  let endX;
  let endY;

  if (side === 0) {
    x = -padding;
    y = verticalStart;
    endX = gameWidth + padding;
    endY = verticalEnd;
  } else if (side === 1) {
    x = gameWidth + padding;
    y = verticalStart;
    endX = -padding;
    endY = verticalEnd;
  } else if (side === 2) {
    x = horizontalStart;
    y = -padding;
    endX = horizontalEnd;
    endY = gameHeight + padding;
  } else {
    x = horizontalStart;
    y = gameHeight + padding;
    endX = horizontalEnd;
    endY = -padding;
  }

  const moveX = endX - x;
  const moveY = endY - y;
  // The source image's head points toward the upper-left corner.
  const rotation = Math.atan2(moveY, moveX) * (180 / Math.PI) + 135;

  return {
    id: crypto.randomUUID(),
    type: type.id,
    label: type.label,
    basePoint: type.basePoint,
    state: 'crawl',
    canFly: false,
    x,
    y,
    moveX,
    moveY,
    rotation,
    scale: randomBetween(88, 112) / 100,
    scuttleDurationMs: randomBetween(90, 150),
    createdAt: Date.now(),
    lifetimeMs: type.lifetimeMs,
  };
}

export function shouldSpawnFlyingRoach(timeLeft, combo, activeFlyingCount) {
  if (activeFlyingCount >= 1 || timeLeft > 45) return false;

  const baseChance = 0.08;
  const lateGameBonus = timeLeft < 20 ? 0.12 : 0;
  const comboBonus = combo >= 10 ? 0.06 : 0;
  return Math.random() < baseChance + lateGameBonus + comboBonus;
}

function getEdgeTarget(gameWidth, gameHeight, padding = 70) {
  const side = randomBetween(0, 3);
  if (side === 0) return { x: -padding, y: randomBetween(20, gameHeight - 20) };
  if (side === 1) return { x: gameWidth + padding, y: randomBetween(20, gameHeight - 20) };
  if (side === 2) return { x: randomBetween(20, gameWidth - 20), y: -padding };
  return { x: randomBetween(20, gameWidth - 20), y: gameHeight + padding };
}

export function createFlyingCockroach({ gameWidth, gameHeight }) {
  const margin = 80;
  const startX = randomBetween(margin, Math.max(margin, gameWidth - margin));
  const startY = randomBetween(margin, Math.max(margin, gameHeight - margin));
  const crawlTargetX = randomBetween(margin, Math.max(margin, gameWidth - margin));
  const crawlTargetY = randomBetween(margin, Math.max(margin, gameHeight - margin));
  const flyTarget = getEdgeTarget(gameWidth, gameHeight);

  return {
    id: crypto.randomUUID(),
    type: FLYING_COCKROACH.id,
    flyingVariant: 'normal',
    label: FLYING_COCKROACH.label,
    basePoint: FLYING_COCKROACH.basePoint,
    state: 'crawl',
    canFly: true,
    x: startX,
    y: startY,
    startX,
    startY,
    targetX: crawlTargetX,
    targetY: crawlTargetY,
    flyTargetX: flyTarget.x,
    flyTargetY: flyTarget.y,
    speed: 1,
    rotation: getRotation(startX, startY, crawlTargetX, crawlTargetY),
    scale: randomBetween(92, 106) / 100,
    createdAt: performance.now(),
    crawlDuration: randomBetween(1200, 1700),
    panicStartedAt: null,
    panicDuration: randomBetween(450, 600),
    flyStartedAt: null,
    flyDuration: randomBetween(2200, 2900),
    amplitude: randomBetween(24, 38),
    frequency: randomBetween(3, 5),
  };
}

export function getFlyingPosition({
  startX,
  startY,
  targetX,
  targetY,
  progress,
  amplitude = 28,
  frequency = 3,
}) {
  const x = startX + (targetX - startX) * progress;
  const baseY = startY + (targetY - startY) * progress;
  const wave = Math.sin(progress * Math.PI * frequency) * amplitude;
  return { x, y: baseY + wave };
}

export function getRotation(prevX, prevY, nextX, nextY) {
  const angle = Math.atan2(nextY - prevY, nextX - prevX);
  // The flying source image's head points upward.
  return angle * (180 / Math.PI) + 90;
}

export function calculatePoint(basePoint, combo) {
  return Math.round(basePoint * getComboMultiplier(combo));
}

export function shareScore({ score, caughtCount, maxCombo, resultUrl }) {
  const text = [
    `Aku berhasil menangkap ${caughtCount} kecoa dengan skor ${score.toLocaleString('id-ID')} di game Menangkap Kecoa!`,
    `Max combo: ${maxCombo}x`,
    '',
    'Berani coba kalahin skor aku?',
  ].join('\n');

  const shareUrl = new URL('https://x.com/intent/tweet');
  shareUrl.searchParams.set('text', text);
  if (resultUrl) shareUrl.searchParams.set('url', resultUrl);
  shareUrl.searchParams.set('hashtags', 'Intanium,MenangkapKecoa,JKT48');
  window.open(shareUrl.toString(), '_blank', 'width=550,height=600,noopener,noreferrer');
}
