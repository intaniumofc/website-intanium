import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_DURATION } from './gameData';
import {
  calculatePoint,
  createCockroach,
  createFlyingCockroach,
  getFlyingPosition,
  getRotation,
  getSpawnInterval,
  pickCockroachType,
  shouldSpawnFlyingRoach,
} from './gameUtils';

const initialState = {
  status: 'idle',
  score: 0,
  timeLeft: GAME_DURATION,
  combo: 0,
  maxCombo: 0,
  caughtCount: 0,
  caughtGolden: false,
  cockroaches: [],
  gameMessage: null,
};

export function useGameLoop(areaRef) {
  const [state, setState] = useState(initialState);
  const timersRef = useRef({ tick: null, spawn: null, cleanup: null, animation: null });
  const startedAtRef = useRef(0);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    runningRef.current = false;
    clearInterval(timersRef.current.tick);
    clearTimeout(timersRef.current.spawn);
    clearInterval(timersRef.current.cleanup);
    cancelAnimationFrame(timersRef.current.animation);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    runningRef.current = true;
    startedAtRef.current = Date.now();
    setState({ ...initialState, status: 'playing' });

    timersRef.current.tick = setInterval(() => {
      setState((current) => {
        if (current.status !== 'playing') return current;
        if (current.timeLeft <= 1) {
          clearTimers();
          return { ...current, status: 'ended', timeLeft: 0 };
        }
        return { ...current, timeLeft: current.timeLeft - 1 };
      });
    }, 1000);

    timersRef.current.cleanup = setInterval(() => {
      const now = Date.now();
      setState((current) => {
        if (current.status !== 'playing') return current;
        const active = current.cockroaches.filter(
          (cockroach) => cockroach.canFly || now - cockroach.createdAt < cockroach.lifetimeMs,
        );
        return active.length === current.cockroaches.length
          ? current
          : { ...current, cockroaches: active, combo: 0 };
      });
    }, 150);

    const animateFlying = (now) => {
      if (!runningRef.current) return;

      setState((current) => {
        if (current.status !== 'playing') return current;

        let escaped = false;
        let changed = false;
        const cockroaches = current.cockroaches.flatMap((cockroach) => {
          if (!cockroach.canFly) return [cockroach];

          if (cockroach.state === 'crawl') {
            const progress = Math.min(1, (now - cockroach.createdAt) / cockroach.crawlDuration);
            const position = getFlyingPosition({
              startX: cockroach.startX,
              startY: cockroach.startY,
              targetX: cockroach.targetX,
              targetY: cockroach.targetY,
              progress,
              amplitude: 8,
              frequency: 2,
            });
            changed = true;
            if (progress >= 1) {
              return [{
                ...cockroach,
                ...position,
                state: 'panic',
                panicStartedAt: now,
              }];
            }
            return [{
              ...cockroach,
              ...position,
              rotation: getRotation(cockroach.x, cockroach.y, position.x, position.y),
            }];
          }

          if (cockroach.state === 'panic') {
            if (now - cockroach.panicStartedAt < cockroach.panicDuration) return [cockroach];
            changed = true;
            return [{
              ...cockroach,
              state: 'fly',
              startX: cockroach.x,
              startY: cockroach.y,
              targetX: cockroach.flyTargetX,
              targetY: cockroach.flyTargetY,
              flyStartedAt: now,
            }];
          }

          if (cockroach.state === 'fly') {
            const progress = Math.min(1, (now - cockroach.flyStartedAt) / cockroach.flyDuration);
            if (progress >= 1) {
              escaped = true;
              changed = true;
              return [];
            }

            const position = getFlyingPosition({
              startX: cockroach.startX,
              startY: cockroach.startY,
              targetX: cockroach.targetX,
              targetY: cockroach.targetY,
              progress,
              amplitude: cockroach.amplitude,
              frequency: cockroach.frequency,
            });
            const nextPosition = getFlyingPosition({
              startX: cockroach.startX,
              startY: cockroach.startY,
              targetX: cockroach.targetX,
              targetY: cockroach.targetY,
              progress: Math.min(1, progress + 0.015),
              amplitude: cockroach.amplitude,
              frequency: cockroach.frequency,
            });
            changed = true;
            return [{
              ...cockroach,
              ...position,
              rotation: getRotation(position.x, position.y, nextPosition.x, nextPosition.y),
            }];
          }

          return [];
        });

        if (!changed) return current;
        return {
          ...current,
          combo: escaped ? 0 : current.combo,
          cockroaches,
          gameMessage: escaped
            ? {
                id: crypto.randomUUID(),
                text: ['Kecoanya kabur!', 'Combo putus!', 'Terlalu gesit!'][Math.floor(Math.random() * 3)],
                tone: 'danger',
              }
            : current.gameMessage,
        };
      });

      timersRef.current.animation = requestAnimationFrame(animateFlying);
    };

    timersRef.current.animation = requestAnimationFrame(animateFlying);

    const spawnNext = () => {
      const interval = getSpawnInterval((Date.now() - startedAtRef.current) / 1000);
      timersRef.current.spawn = setTimeout(() => {
        if (!runningRef.current) return;
        const area = areaRef.current;
        const gameWidth = area?.clientWidth ?? 320;
        const gameHeight = area?.clientHeight ?? 480;
        setState((current) => {
          const activeFlyingCount = current.cockroaches.filter(
            (cockroach) => cockroach.canFly && ['crawl', 'panic', 'fly'].includes(cockroach.state),
          ).length;
          const shouldFly = shouldSpawnFlyingRoach(
            current.timeLeft,
            current.combo,
            activeFlyingCount,
          );
          const cockroach = shouldFly
            ? createFlyingCockroach({ gameWidth, gameHeight })
            : createCockroach({ gameWidth, gameHeight, type: pickCockroachType() });
          return { ...current, cockroaches: [...current.cockroaches, cockroach] };
        });
        spawnNext();
      }, interval);
    };

    spawnNext();
  }, [areaRef, clearTimers]);

  const catchCockroach = useCallback((cockroach) => {
    setState((current) => {
      if (
        current.status !== 'playing'
        || !current.cockroaches.some((item) => item.id === cockroach.id)
      ) return current;

      const combo = current.combo + 1;
      const earnedPoint = cockroach.type === 'flying'
        ? cockroach.basePoint
        : calculatePoint(cockroach.basePoint, current.combo);
      return {
        ...current,
        score: current.score + earnedPoint,
        combo,
        maxCombo: Math.max(current.maxCombo, combo),
        caughtCount: current.caughtCount + 1,
        caughtGolden: current.caughtGolden || cockroach.type === 'golden',
        cockroaches: current.cockroaches.filter((item) => item.id !== cockroach.id),
      };
    });
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  return { state, start, catchCockroach };
}
