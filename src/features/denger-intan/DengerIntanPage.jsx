import { useState, useEffect, useRef, useCallback, useId, useMemo, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playlistService } from './playlistService';
import {
  Share2,
  ArrowLeft,
  ArrowRight,
  Headphones,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  VolumeX,
  Volume1,
  Volume2
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import { ContainerScroll } from '../../components/ui/container-scroll-animation';
import { Button } from '../../components/ui/button';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};




const staggerSection = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05
    }
  }
};

// ============================================================================
// Most Played Song — Helpers & Components
// ============================================================================

const spotifySearch = function (s) { return 'https://open.spotify.com/search/' + encodeURIComponent(s.title + ' ' + s.artist); };
const MOOD_META = { 'chill / calm': { label: 'Chill', color: '#4F46E5' }, nostalgic: { label: 'Nostalgic', color: '#7C3AED' }, 'hype / energetic': { label: 'Hype', color: '#EA580C' }, 'focus / work': { label: 'Focus', color: '#059669' } };
const getMood = function (m) { return MOOD_META[(m || '').trim().toLowerCase()] || { label: 'Vibe', color: '#4F46E5' }; };

const paperTex = { background: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 50%)' };
const vp1 = { once: true, amount: 0.15, margin: '-40px' };
const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } } };
const headerV = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const storyV = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const rowV = { hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

/* ------------------------------------------------------------- useRafLoop */

function useRafLoop(cb) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last;
      last = now;
      cbRef.current(now, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

/* -------------------------------------------------- useTransitionSound */

function useTransitionSound() {
  const ctxRef = useRef(null);
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => { });
      }
      ctxRef.current = null;
    };
  }, []);
  return useCallback((bassEnergy = 0.5) => {
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ||
          window.webkitAudioContext;
        if (!Ctor) return;
        ctxRef.current = new Ctor();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = 440 + bassEnergy * 440;
      const endFreq = startFreq * (2 / 3);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      /* Web Audio unavailable */
    }
  }, []);
}

/* --------------------------------------------------- useAudioAnalyser */

const FFT_SIZE = 256;

function useAudioAnalyser(audioRef) {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(new Uint8Array(FFT_SIZE / 2));
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || connectedRef.current) return;
    try {
      const Ctor =
        window.AudioContext ||
        window.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      connectedRef.current = true;
      if (ctx.state === 'suspended') ctx.resume().catch(() => { });
    } catch (e) {
      /* unavailable or already connected */
    }
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener('play', connect, { once: true });
    return () => audio.removeEventListener('play', connect);
  }, [audioRef, connect]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => { });
      }
      ctxRef.current = null;
    };
  }, []);

  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return null;
    if (ctxRef.current && ctxRef.current.state === 'suspended')
      ctxRef.current.resume().catch(() => { });
    analyser.getByteFrequencyData(dataRef.current);
    return dataRef.current;
  }, []);

  const getBandEnergy = useCallback((startBin, endBin) => {
    if (!analyserRef.current) return 0;
    const data = dataRef.current;
    const count = endBin - startBin;
    if (count <= 0) return 0;
    let sum = 0;
    for (let i = startBin; i < endBin && i < data.length; i++)
      sum += data[i];
    return sum / count / 255;
  }, []);

  return { getFrequencyData, getBandEnergy };
}

/* ------------------------------------------------------ useAudioPlayer */

function shuffleOrder(pinFirst, count) {
  const rest = Array.from({ length: count }, (_, i) => i).filter(
    (x) => x !== pinFirst
  );
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [pinFirst, ...rest];
}

function playerReducer(state, action) {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_TRACK':
      return {
        ...state,
        currentIndex: action.index,
        direction: action.direction,
      };
    case 'TOGGLE_SHUFFLE': {
      const shuffled = !state.shuffled;
      const order = shuffled
        ? shuffleOrder(state.currentIndex, action.trackCount)
        : Array.from({ length: action.trackCount }, (_, i) => i);
      return { ...state, shuffled, order };
    }
    case 'CYCLE_LOOP': {
      const next =
        state.loopMode === 'off'
          ? 'all'
          : state.loopMode === 'all'
            ? 'one'
            : 'off';
      return { ...state, loopMode: next };
    }
    default:
      return state;
  }
}

function useAudioPlayer(tracks) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const [state, dispatch] = useReducer(playerReducer, {
    currentIndex: 0,
    order: Array.from({ length: tracks.length }, (_, i) => i),
    shuffled: false,
    loopMode: 'off',
    isPlaying: false,
    direction: null,
  });

  const { getFrequencyData, getBandEnergy } = useAudioAnalyser(audioRef);
  const playTransitionSound = useTransitionSound();

  const loadTrack = useCallback((index, autoplay, direction) => {
    const audio = audioRef.current;
    if (!audio) return;
    const bassEnergy = getBandEnergy(0, 4);
    playTransitionSound(bassEnergy);
    dispatch({ type: 'SET_TRACK', index, direction });
    audio.src = tracks[index].src;
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
    audio.load();
    if (autoplay) audio.play().catch(() => { });
  }, [tracks, playTransitionSound, getBandEnergy, volume, isMuted]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => { });
    else audio.pause();
  }, []);

  const next = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const pos = state.order.indexOf(state.currentIndex);
    const np = pos + 1;
    if (np >= state.order.length) {
      if (state.loopMode === 'all')
        loadTrack(state.order[0], !audio.paused, 'next');
      else {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    loadTrack(state.order[np], !audio.paused, 'next');
  }, [state.order, state.currentIndex, state.loopMode, loadTrack]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const pos = state.order.indexOf(state.currentIndex);
    const pp = pos - 1;
    if (pp < 0) {
      if (state.loopMode === 'all')
        loadTrack(state.order[state.order.length - 1], !audio.paused, 'prev');
      else audio.currentTime = 0;
      return;
    }
    loadTrack(state.order[pp], !audio.paused, 'prev');
  }, [state.order, state.currentIndex, state.loopMode, loadTrack]);

  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE', trackCount: tracks.length });
  }, [tracks.length]);

  const cycleLoop = useCallback(() => {
    dispatch({ type: 'CYCLE_LOOP' });
  }, []);

  const adjustVolume = useCallback((val) => {
    const audio = audioRef.current;
    if (!audio) return;
    const cleanVal = Math.max(0, Math.min(1, val));
    setVolume(cleanVal);
    audio.volume = cleanVal;
    if (cleanVal > 0) {
      setIsMuted(false);
      audio.muted = false;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audio.muted = nextMute;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => dispatch({ type: 'PLAY' });
    const onPause = () => dispatch({ type: 'PAUSE' });
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setDuration(audio.duration);
    };
    const onEnded = () => {
      if (state.loopMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => { });
      } else next();
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.loopMode, next]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[0].src;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.load();
  }, [tracks]);

  return {
    audioRef,
    state,
    currentTime,
    duration,
    currentTrack: tracks[state.currentIndex],
    toggle,
    next,
    prev,
    seek,
    toggleShuffle,
    cycleLoop,
    getFrequencyData,
    loadTrack,
    volume,
    isMuted,
    adjustVolume,
    toggleMute,
  };
}

/* ------------------------------------------------ useKeyboardShortcuts */

function useKeyboardShortcuts(actions) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          actions.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) actions.next();
          else actions.seekForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) actions.prev();
          else actions.seekBackward();
          break;
        case 's':
        case 'S':
          actions.toggleShuffle();
          break;
        case 'l':
        case 'L':
          actions.cycleLoop();
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [actions]);
}

/* --------------------------------------------------------- ScalesMixer */

const COLS = 10;
const ROWS = 10;
const BAND_RANGES = [
  [0, 1], [1, 3], [3, 6], [6, 10], [10, 16],
  [16, 24], [24, 36], [36, 52], [52, 74], [74, 100],
];
const sineOut = (x) => Math.sin((x * Math.PI) / 2);
const sineIn = (x) => 1 - Math.cos((x * Math.PI) / 2);
const sineInOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const PART_A_DUR = 1.5;
const PART_A_TO = 11;
const PART_A_STEP = 3 / (COLS - 1);
const PART_B_DUR = 1;
const SCALE_FROM = 0.133;
const SCALE_TO = 0.8;

function partAColumnY(time, col) {
  const local = time - col * PART_A_STEP;
  const period = PART_A_DUR * 2;
  const cyc = ((local % period) + period) % period;
  if (cyc < PART_A_DUR) return PART_A_TO * sineInOut(cyc / PART_A_DUR);
  return PART_A_TO * sineInOut(1 - (cyc - PART_A_DUR) / PART_A_DUR);
}
function partBCircle(time, col, row) {
  const frac = row / ROWS;
  const yFrom = lerp(77, -77, frac);
  const yTo = lerp(col, -col, frac);
  const local = time - col / COLS;
  const period = PART_B_DUR * 2;
  const cyc = ((local % period) + period) % period;
  let e;
  if (cyc < PART_B_DUR) e = sineOut(cyc / PART_B_DUR);
  else e = sineIn(1 - (cyc - PART_B_DUR) / PART_B_DUR);
  return [lerp(yFrom, yTo, e), lerp(SCALE_FROM, SCALE_TO, e)];
}

function ScalesMixer({ isPlaying, getFrequencyData }) {
  const maskId = useId().replace(/:/g, '_');
  const colRefs = useRef([]);
  const circleRefs = useRef(Array.from({ length: COLS }, () => []));
  const tRef = useRef(50);

  useRafLoop((_, dt) => {
    if (isPlaying) tRef.current += dt / 1000;
    const time = tRef.current;
    const freqData = getFrequencyData ? getFrequencyData() : null;
    for (let c = 0; c < COLS; c++) {
      let energy = 1.0;
      if (freqData) {
        const [binStart, binEnd] = BAND_RANGES[c];
        let sum = 0;
        for (let b = binStart; b < binEnd; b++) sum += freqData[b] ?? 0;
        energy = Math.sqrt(sum / (binEnd - binStart) / 255);
      }
      const bobGain = freqData ? 0.4 + energy : 1;
      const scaleGain = freqData ? 0.5 + energy : 1;
      const colEl = colRefs.current[c];
      if (colEl) {
        const ay = partAColumnY(time, c) * bobGain;
        colEl.style.transform = `translate(${c * 10}px, ${ay}px)`;
      }
      for (let r = 0; r < ROWS; r++) {
        const circle = circleRefs.current[c][r];
        if (!circle) continue;
        const [ty, s] = partBCircle(time, c, r);
        circle.style.transform = `translateY(${ty}px) scale(${s * scaleGain})`;
      }
    }
  });

  return (
    <svg className="scales" viewBox="0 0 98 108" aria-hidden="true">
      <mask id={maskId}>
        <rect width="10" height="10" fill="#fff" />
      </mask>
      {Array.from({ length: COLS }, (_, c) => (
        <g
          key={c}
          ref={(el) => {
            colRefs.current[c] = el;
          }}
          style={{ transform: `translate(${c * 10}px, 0px)` }}
        >
          {Array.from({ length: ROWS }, (_, r) => (
            <g
              key={r}
              mask={`url(#${maskId})`}
              transform={`translate(0 ${r * 10})`}
            >
              <circle
                ref={(el) => {
                  circleRefs.current[c][r] = el;
                }}
                cx="5"
                cy="5"
                r="5"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------- Disc + layers */

const SPIN_MAX = 0.4375;
const BURST_DURATION = 620;

function Disc({
  layers,
  isPlaying,
  isZoomed,
  trackKey,
  direction,
  onZoomToggle,
}) {
  const spinRef = useRef(null);
  const rotRef = useRef(0);
  const velRef = useRef(0);
  const burstRef = useRef({ from: 0, start: 0, active: false, pending: false });
  const lastKey = useRef(trackKey);

  useEffect(() => {
    if (trackKey !== lastKey.current) {
      lastKey.current = trackKey;
      if (direction) {
        burstRef.current.from = direction === 'prev' ? 360 : -360;
        burstRef.current.pending = true;
      }
    }
  }, [trackKey, direction]);

  useRafLoop((now) => {
    const el = spinRef.current;
    if (!el) return;
    if (isPlaying) velRef.current += (SPIN_MAX - velRef.current) * 0.2;
    else {
      velRef.current *= 0.96;
      if (velRef.current < 0.001) velRef.current = 0;
    }
    if (isZoomed) {
      const target = Math.round(rotRef.current / 360) * 360;
      const nx = rotRef.current + (target - rotRef.current) * 0.08;
      rotRef.current = Math.abs(target - nx) < 0.1 ? target : nx;
    } else {
      rotRef.current += velRef.current;
    }
    const burst = burstRef.current;
    if (burst.pending) {
      burst.start = now;
      burst.pending = false;
      burst.active = true;
    }
    let b = 0;
    if (burst.active) {
      const t = (now - burst.start) / BURST_DURATION;
      if (t >= 1) burst.active = false;
      else b = burst.from * (1 - (1 - Math.pow(1 - t, 3)));
    }
    el.style.transform = `scale(1.01) rotate(${rotRef.current + b}deg)`;
  });

  return (
    <div
      className={`mask ${isZoomed ? 'is-zoomed' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onZoomToggle();
      }}
    >
      <div className="spin" ref={spinRef}>
        {layers.map((l, i) => {
          const isNewest = i === layers.length - 1;
          const cls = isNewest
            ? l.dir
              ? 'cover cover-enter'
              : 'cover'
            : 'cover cover-exit';
          return (
            <img
              key={l.id}
              src={l.track.cover}
              alt={`${l.track.title} — ${l.track.artist}`}
              className={cls}
              draggable={false}
            />
          );
        })}
      </div>
      <div className="hole">
        <div className="hole-inner" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ TrackInfo */

function TrackInfo({ layers }) {
  return (
    <div className="track-info">
      {layers.map((l, i) => {
        const isNewest = i === layers.length - 1;
        const dx = l.dir === 'next' ? 14 : l.dir === 'prev' ? -14 : 0;
        const exitDx = -dx;
        const state = isNewest ? (l.dir ? 'ti-enter' : '') : 'ti-exit';
        const style = {
          '--dx': `${isNewest ? dx : exitDx}px`,
        };
        return (
          <div
            key={l.id}
            className={`ti-layer ${isNewest ? '' : 'ti-abs'}`}
          >
            <p className={`artist ${state}`} style={style}>
              {l.track.artist}
            </p>
            <h2 className={`track ${state}`} style={style}>
              {l.track.title}
            </h2>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- ProgressBar */

function fmt(s) {
  if (!isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(
    2,
    '0'
  )}`;
}

function ProgressBar({ currentTime, duration, onSeek }) {
  const pct = duration ? (currentTime / duration) * 100 : 0;
  return (
    <>
      <div
        className="bar"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(
            Math.max(
              0,
              Math.min(1, (e.clientX - rect.left) / rect.width)
            )
          );
        }}
      >
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {duration > 0 && isFinite(duration) && duration !== Infinity && (
        <div className="time">
          <span className="current">{fmt(currentTime)}</span>
          <span className="sep">/</span>
          <span className="total">{fmt(duration)}</span>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------- Controls */

function Controls({
  isPlaying,
  shuffled,
  loopMode,
  onToggle,
  onNext,
  onPrev,
  onShuffle,
  onLoop,
}) {
  return (
    <div className="controls">
      <button
        className={`ctrl ctrl-toggle ${shuffled ? 'is-active' : ''}`}
        onClick={onShuffle}
        aria-label="Shuffle"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3h5v5" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
          <path d="M16 21h5v-5" />
          <path d="M21 21l-7-7" />
          <path d="M3 3l7 7" />
        </svg>
      </button>
      <button className="ctrl" onClick={onPrev} aria-label="Previous">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 5L8 12l11 7zM5 5h2v14H5z" />
        </svg>
      </button>
      <button
        className="ctrl ctrl-play"
        onClick={onToggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 5h3v14H6zM15 5h3v14h-3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M7 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button className="ctrl" onClick={onNext} aria-label="Next">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M5 5l11 7L5 19zM17 5h2v14h-2z" />
        </svg>
      </button>
      <button
        className={`ctrl ctrl-toggle ctrl-loop ${loopMode !== 'off' ? 'is-active' : ''
          } ${loopMode === 'one' ? 'mode-one' : ''}`}
        onClick={onLoop}
        aria-label="Loop"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12V8a2 2 0 0 1 2-2h12" />
          <path d="M16 3l4 3l-4 3" />
          <path d="M20 12v4a2 2 0 0 1-2 2H6" />
          <path d="M8 21l-4-3l4-3" />
        </svg>
        <span className="loop-one">1</span>
      </button>
    </div>
  );
}

/* ----------------------------------------------------- MusicPlayer root */

export function MusicPlayer({ tracks, crossOrigin = 'anonymous' }) {
  const player = useAudioPlayer(tracks);
  const [isZoomed, setIsZoomed] = useState(false);

  const [layers, setLayers] = useState(() => [
    { id: 0, track: tracks[0], dir: null },
  ]);
  const lastIndex = useRef(0);
  const idRef = useRef(1);

  useEffect(() => {
    if (player.state.currentIndex === lastIndex.current) return;
    lastIndex.current = player.state.currentIndex;
    const id = idRef.current++;
    setLayers((prev) => [
      ...prev,
      { id, track: player.currentTrack, dir: player.state.direction },
    ]);
    const t = setTimeout(() => {
      setLayers((prev) => prev.filter((l) => l.id === id));
    }, 760);
    return () => clearTimeout(t);
  }, [
    player.state.currentIndex,
    player.currentTrack,
    player.state.direction,
  ]);

  const seekForward = useCallback(() => {
    const a = player.audioRef.current;
    if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 5);
  }, [player.audioRef]);
  const seekBackward = useCallback(() => {
    const a = player.audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime - 5);
  }, [player.audioRef]);

  const shortcuts = useMemo(
    () => ({
      toggle: player.toggle,
      next: player.next,
      prev: player.prev,
      seekForward,
      seekBackward,
      toggleShuffle: player.toggleShuffle,
      cycleLoop: player.cycleLoop,
    }),
    [
      player.toggle,
      player.next,
      player.prev,
      seekForward,
      seekBackward,
      player.toggleShuffle,
      player.cycleLoop,
    ]
  );
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Left Column: Music Player Widget */}
      <div className="w-full lg:w-[45%] flex flex-col justify-start">
        <div
          className={`card ${player.state.isPlaying ? 'is-playing' : ''} ${isZoomed ? 'is-zoomed' : ''
            } !mr-0 !ml-0 w-full relative`}
          onClick={(e) => {
            if (!e.target.closest('.mask'))
              setIsZoomed(false);
          }}
        >
          {/* Absolute positioned Now Playing badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-[9px] uppercase font-extrabold tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full select-none border border-sky-500/20">
            <span className={`w-1.5 h-1.5 rounded-full bg-sky-400 ${player.state.isPlaying ? 'animate-pulse' : ''}`} />
            <span>Now Playing</span>
          </div>

          <audio
            ref={player.audioRef}
            preload="metadata"
            crossOrigin={crossOrigin}
          />
          <Disc
            layers={layers}
            isPlaying={player.state.isPlaying}
            isZoomed={isZoomed}
            trackKey={player.state.currentIndex}
            direction={player.state.direction}
            onZoomToggle={() => setIsZoomed((z) => !z)}
          />
          <div className="info">
            <ScalesMixer
              isPlaying={player.state.isPlaying}
              getFrequencyData={player.getFrequencyData}
            />
            <TrackInfo layers={layers} />
            <ProgressBar
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.seek}
            />
            <Controls
              isPlaying={player.state.isPlaying}
              shuffled={player.state.shuffled}
              loopMode={player.state.loopMode}
              onToggle={player.toggle}
              onNext={player.next}
              onPrev={player.prev}
              onShuffle={player.toggleShuffle}
              onLoop={player.cycleLoop}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Songs Queue List */}
      <div className="w-full lg:w-[55%] flex flex-col">
        <div className="p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[var(--color-primary)]" />
            Daftar Lagu Terpopuler
          </h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 hide-scrollbar">
            {tracks.map((track, index) => {
              const isCurrent = player.state.currentIndex === index;
              const isPlaying = isCurrent && player.state.isPlaying;
              return (
                <div
                  key={track.id || index}
                  onClick={() => {
                    if (isCurrent) {
                      player.toggle();
                    } else {
                      player.loadTrack(index, true, index > player.state.currentIndex ? 'next' : 'prev');
                    }
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer group/row ${isCurrent
                    ? 'active-music-card border-indigo-400/40 ring-1 ring-indigo-400/20'
                    : 'bg-transparent border-slate-200/40 hover:bg-white/30 hover:border-slate-350'
                    }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Cover Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-200/60 shadow-sm">
                      <img src={track.cover} alt={track.title} className="w-full h-full object-cover animate-none" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'}`}>
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white" />
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 ml-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-bold text-sm truncate block ${isCurrent ? 'text-[var(--color-primary)] font-extrabold' : 'text-slate-800'}`}>
                          {track.title}
                        </span>
                        {track.mood && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200/50">
                            {track.mood}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate block mt-0.5">{track.artist}</span>
                      {track.note && (
                        <span className="text-[10px] text-slate-400 italic truncate block mt-1">
                          "{track.note}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Bouncing equalizer */}
                  <div className="flex items-center gap-3 ml-2 shrink-0">
                    {isCurrent && (
                      <div className="flex items-end gap-0.5 h-3.5 w-4 overflow-hidden mb-0.5">
                        <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar1' : 'h-1.5'}`} />
                        <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar2' : 'h-3'}`} />
                        <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar3' : 'h-2'}`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function DengerIntanPage() {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mostPlayedSongs, setMostPlayedSongs] = useState([]);

  const tracksForPlayer = useMemo(() => {
    return mostPlayedSongs.map((song) => {
      return {
        title: song.title,
        artist: song.artist,
        cover: song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        src: song.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        mood: song.mood,
        playCount: song.playCount,
        note: song.note,
        id: song.id
      };
    });
  }, [mostPlayedSongs]);

  const playerCardRef = useRef(null);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [playerMousePosition, setPlayerMousePosition] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef(null);

  // Set page title for SEO best practices
  useEffect(() => {
    document.title = '#DengerINTAN Playlist | Intanium';
  }, []);

  // Fetch playlists and most played songs on mount
  useEffect(() => {
    playlistService.getPlaylists()
      .then((data) => {
        setPlaylists(data);
        if (data.length > 0) {
          // Check query param for active playlist
          const params = new URLSearchParams(window.location.search);
          const playlistId = params.get('playlist');
          const found = data.find(p => p.id === playlistId);
          setActivePlaylist(found || data[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

    playlistService.getMostPlayedSongs()
      .then((data) => {
        if (data && data.length > 0) {
          setMostPlayedSongs(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching most played songs:', err);
      });
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    // Auto hide after 2.5s
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  const handlePlaylistChange = (playlist) => {
    setActivePlaylist(playlist);
    // Update URL query param to maintain navigation state
    const newUrl = `${window.location.origin}${window.location.pathname}?playlist=${playlist.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const sharePlaylist = () => {
    if (!activePlaylist) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?playlist=${activePlaylist.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast("Tautan playlist berhasil disalin ke clipboard!");
      })
      .catch(() => {
        showToast("Gagal menyalin tautan.");
      });
  };

  const handlePlayerMouseMove = (e) => {
    if (!playerCardRef.current) return;
    const rect = playerCardRef.current.getBoundingClientRect();
    setPlayerMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const scrollContainer = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // Card width + gap (300 + 40)
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading || !activePlaylist) {
    return <Loading message="Mengunduh daftar putar musik..." />;
  }
  return (
    <div className="space-y-16 max-w-7xl mx-auto py-6 relative">

      {/* Centered Premium Editorial Hero Section with 3D Scroll Perspective */}
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center select-none pt-1">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[var(--color-primary)] leading-none tracking-tight relative mb-8">
              #DengerINTAN
            </h2>
          </div>
        }
      >
        <div className="w-full relative">
          {/* Decorative Outer Blob */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 opacity-30 blur-2xl rounded-full z-0 pointer-events-none"></div>

          <div
            ref={playerCardRef}
            className="w-full rounded-[32px] overflow-hidden relative cursor-default group z-10"
            style={{
              background: 'radial-gradient(25% 40% at 50% 30%, rgba(23, 12, 121, 0.22), rgba(7, 10, 36, 0.98))',
              boxShadow: `0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 
                          0px 0px 25px 5px rgba(23, 12, 121, 0.06), 
                          0px 0px 40px 20px rgba(23, 12, 121, 0.03), 
                          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                          0 10px 30px -5px rgba(0, 0, 0, 0.3)`
            }}
            onMouseEnter={() => setIsPlayerHovered(true)}
            onMouseLeave={() => setIsPlayerHovered(false)}
            onMouseMove={handlePlayerMouseMove}
          >
            {/* Cursor-tracking radial spotlight */}
            <div
              className="absolute w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(circle at ${playerMousePosition.x}% ${playerMousePosition.y}%, rgba(8, 145, 178, 0.15) 0%, transparent 60%)`,
                filter: 'blur(25px)',
              }}
            />

            {/* Secondary blur */}
            <div
              className="absolute w-full h-full pointer-events-none transition-opacity duration-700"
              style={{
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(23, 12, 121, 0.10) 0%, transparent 100%)',
                opacity: isPlayerHovered ? 0.8 : 0,
                filter: 'blur(30px)',
                transform: 'translateY(20%)'
              }}
            />

            <div className="p-6 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-xl mr-3 flex items-center justify-center overflow-hidden bg-black/90 relative"
                    style={{
                      boxShadow: isPlayerHovered ? '0 0 15px rgba(30, 215, 96, 0.25)' : 'none',
                      transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 transition-transform duration-700"
                      style={{
                        fill: '#1ED760',
                        transform: isPlayerHovered ? 'scale(1.08)' : 'scale(1)',
                        filter: isPlayerHovered ? 'drop-shadow(0 0 3px rgba(30, 215, 96, 0.5))' : 'none'
                      }}>
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </div>
                  <div className="text-white text-left font-medium text-base transition-all duration-300">
                    <span className="bg-clip-text bg-gradient-to-r from-white to-green-300 font-extrabold">
                      {activePlaylist.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase text-green-400 font-semibold tracking-wider select-none">
                        On Going Playlist
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={sharePlaylist}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Bagikan Tautan Playlist"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={activePlaylist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Buka di Spotify"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Spotify Playlist Embed Iframe with Smooth Transition */}
              <div
                className="w-full rounded-2xl overflow-hidden shadow-md border border-white/5 bg-black/40 p-1.5 transition-all duration-500"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePlaylist.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <iframe
                      data-testid="embed-iframe"
                      style={{ borderRadius: '12px' }}
                      src={activePlaylist.spotifyEmbedUrl}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Pulsing border overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[32px] transition-opacity duration-700 opacity-0 group-hover:opacity-100"
              style={{
                border: '1px solid rgba(23, 12, 121, 0.2)',
                animation: 'pulse-border 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />

            <style>{`
              @keyframes pulse-border {
                0%, 100% {
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.7;
                  transform: scale(1.002);
                }
              }
              @keyframes waveform {
                0% {
                  transform: scaleY(0.25);
                }
                100% {
                  transform: scaleY(1.15);
                }
              }
              /* Custom MusicPlayer Styling */
              .card {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 2.5rem;
                border-radius: 2.5rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: linear-gradient(135deg, #09062b 0%, #170c79 50%, #220f4f 100%);
                box-shadow: 0 30px 70px -15px rgba(23, 12, 121, 0.35);
                backdrop-filter: blur(20px);
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
              }
              @media (min-width: 768px) and (max-width: 1023px) {
                .card {
                  flex-direction: row;
                  padding: 3rem;
                }
              }
              .card::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.15) 0%, transparent 60%);
                pointer-events: none;
                z-index: 0;
              }
              .card::after {
                content: '';
                position: absolute;
                inset: 0;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                opacity: 0.08;
                pointer-events: none;
                z-index: 1;
              }
              .card.is-zoomed {
                transform: scale(1.02);
                border-color: rgba(139, 92, 246, 0.3);
                box-shadow: 0 35px 80px -10px rgba(139, 92, 246, 0.3);
              }
              .mask {
                width: 200px;
                height: 200px;
                border-radius: 50%;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                box-shadow: 0 15px 35px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.2);
                flex-shrink: 0;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 10;
                background: #000;
              }
              @media (min-width: 640px) {
                .mask {
                  width: 240px;
                  height: 240px;
                }
              }
              .mask.is-zoomed {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 25px 45px rgba(0,0,0,0.7), inset 0 0 0 1.5px rgba(255,255,255,0.3);
              }
              .spin {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                position: relative;
                transition: transform 0.1s linear;
                background: radial-gradient(circle, #333 1px, #0f0f0f 4px, #1c1c1c 8px, #0f0f0f 16px, #262626 18px, #0a0a0a 28px, #1a1a1a 30px, #0a0a0a 40px, #262626 42px, #0a0a0a 52px, #1c1c1c 54px, #050505 100%);
              }
              .cover {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                clip-path: circle(35% at 50% 50%);
                pointer-events: none;
                transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .cover-enter {
                opacity: 0;
                transform: scale(0.85) rotate(-30deg);
              }
              .cover-exit {
                opacity: 0;
                transform: scale(1.15) rotate(30deg);
              }
              .hole {
                position: absolute;
                inset: 0;
                margin: auto;
                width: 16px;
                height: 16px;
                background: #09062b;
                border-radius: 50%;
                border: 3px solid rgba(255,255,255,0.25);
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20;
                pointer-events: none;
              }
              .hole-inner {
                width: 4px;
                height: 4px;
                background: #fff;
                border-radius: 50%;
              }
              .info {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                flex-grow: 1;
                width: 100%;
                text-align: left;
                z-index: 10;
              }
              .scales {
                width: 100%;
                height: 60px;
                opacity: 0.15;
                transition: opacity 0.5s ease;
              }
              .is-playing .scales {
                opacity: 0.55;
              }
              .scales circle {
                fill: #818cf8;
                stroke: rgba(255, 255, 255, 0.05);
                transition: fill 0.3s ease;
              }
              .track-info {
                position: relative;
                overflow: hidden;
                height: 64px;
              }
              .ti-layer {
                display: flex;
                flex-direction: column;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .ti-abs {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
              }
              .ti-layer .artist {
                font-size: 0.65rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: rgba(255, 255, 255, 0.45);
                margin: 0;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .ti-layer .track {
                font-size: 1.5rem;
                font-weight: 900;
                color: #fff;
                line-height: 1.25;
                margin-top: 4px;
                margin-bottom: 0;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .ti-enter {
                opacity: 0;
                transform: translateY(var(--dx, 20px));
              }
              .ti-enter.artist, .ti-enter.track {
                opacity: 1;
                transform: translateY(0);
              }
              .ti-exit {
                opacity: 0;
                transform: translateY(calc(-1 * var(--dx, 20px)));
              }
              .bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 99px;
                cursor: pointer;
                position: relative;
                transition: height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .bar:hover {
                height: 6px;
              }
              .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #38bdf8, #818cf8);
                border-radius: 99px;
                position: absolute;
                top: 0;
                left: 0;
              }
              .time {
                display: flex;
                justify-content: flex-end;
                gap: 0.3rem;
                font-family: var(--font-mono);
                font-size: 10px;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 6px;
              }
              .time .current {
                color: rgba(255, 255, 255, 0.65);
              }
              .controls {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 320px;
                margin: 0 auto;
              }
              .ctrl {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 0.6rem;
                border-radius: 50%;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
              }
              .ctrl:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.08);
                transform: scale(1.08);
              }
              .ctrl:active {
                transform: scale(0.95);
              }
              .ctrl-play {
                width: 48px;
                height: 48px;
                background: #fff;
                color: #09062b;
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
              }
              .ctrl-play:hover {
                background: #f1f5f9;
                color: #09062b;
                transform: scale(1.12);
                box-shadow: 0 10px 25px rgba(255,255,255,0.25);
              }
              .ctrl-toggle.is-active {
                color: #38bdf8;
                background: rgba(56, 189, 248, 0.08);
              }
              .ctrl-loop {
                position: relative;
              }
              .loop-one {
                position: absolute;
                top: 1px;
                right: 1px;
                font-size: 8px;
                font-weight: 950;
                background: #38bdf8;
                color: #000;
                border-radius: 50%;
                width: 11px;
                height: 11px;
                display: none;
                align-items: center;
                justify-content: center;
              }
              .mode-one .loop-one {
                display: flex;
              }
              /* Bouncing EQ equalizer animation for playlist items */
              @keyframes bar1 {
                0%, 100% { height: 3px; }
                50% { height: 14px; }
              }
              @keyframes bar2 {
                0%, 100% { height: 14px; }
                50% { height: 6px; }
              }
              @keyframes bar3 {
                0%, 100% { height: 6px; }
                50% { height: 12px; }
              }
              .animate-bar1 { animation: bar1 0.8s ease-in-out infinite; }
              .animate-bar2 { animation: bar2 0.8s ease-in-out infinite; }
              .animate-bar3 { animation: bar3 0.8s ease-in-out infinite; }

              /* Musical glow animation for active card */
              @keyframes musicalGlow {
                0%, 100% {
                  box-shadow: 0 0 15px rgba(99, 102, 241, 0.25), 0 0 5px rgba(139, 92, 246, 0.15);
                  border-color: rgba(129, 140, 248, 0.45);
                }
                50% {
                  box-shadow: 0 0 25px rgba(99, 102, 241, 0.5), 0 0 12px rgba(139, 92, 246, 0.35);
                  border-color: rgba(139, 92, 246, 0.85);
                }
              }
              .active-music-card {
                animation: musicalGlow 2s infinite ease-in-out;
                background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.15) 100%) !important;
              }
            `}</style>
          </div>
        </div>
      </ContainerScroll>


      {/* ======================================================================== */}
      {/* Most Played Songs by Nur Intan */}
      <motion.section className="relative py-20 select-none z-10 border-t border-[var(--border-color)]/40 pt-16" id="most-played-song" style={paperTex}>
        <motion.div viewport={vp1} initial="hidden" whileInView="visible" variants={containerV} className="w-full">
          {/* Section Header aligned with Koleksi Playlist */}
          <motion.div variants={fadeUp} className="mb-6 flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] mb-1">
                Most Played Songs by Nur Intan
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Koleksi lagu pilihan yang paling sering didengarkan oleh Nur Intan saat ini.
              </p>
            </div>
          </motion.div>

          {tracksForPlayer && tracksForPlayer.length > 0 ? (
            <MusicPlayer tracks={tracksForPlayer} crossOrigin="anonymous" />
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-black/40 rounded-[32px] border border-white/5 text-white/50 text-sm font-semibold relative overflow-hidden min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400 mb-4" />
              <span>Memuat pemutar musik...</span>
            </div>
          )}
        </motion.div>
      </motion.section>
      {/* Archives of Past Monthly Playlists / Koleksi Playlist */}
      <motion.section
        className="relative mt-16 select-none relative z-10 border-t border-[var(--border-color)]/40 pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSection}
      >
        <motion.div variants={fadeUp} className="mb-6 flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] mb-1">
              Koleksi Playlist #DengerINTAN
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Arsip playlist yang pernah dikurasi Intan dari waktu ke waktu.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scrollContainer('left')}
              className="w-10 h-10 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              title="Scroll Kiri"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="w-10 h-10 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              title="Scroll Rujukan"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Scrollable Horizontal Container */}
        <motion.div
          ref={scrollContainerRef}
          variants={staggerContainer}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 scroll-smooth snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
        >
          {playlists.map((play) => {
            const isActivePlaylist = play.id === activePlaylist.id;
            return (
              <motion.div
                key={play.id}
                onClick={() => handlePlaylistChange(play)}
                variants={fadeUp}
                whileHover={!isActivePlaylist ? { y: -6, scale: 1.015 } : {}}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`snap-start shrink-0 w-[290px] sm:w-[320px] glass-panel p-4 rounded-[28px] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${isActivePlaylist ? 'border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]/10 scale-[0.98]' : 'border-[var(--border-color)]/60 bg-white/40 shadow-sm hover:shadow-md hover:scale-[1.01] cursor-pointer'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 pr-2">
                    <span className="bg-[var(--color-secondary)]/90 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-1 shadow-sm uppercase tracking-wider">
                      {play.category}
                    </span>
                    <h3 className="text-xs font-extrabold text-[var(--color-primary)] truncate leading-tight mt-0.5">
                      {play.title}
                    </h3>
                  </div>
                  {isActivePlaylist ? (
                    <span className="bg-[var(--color-primary)] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 uppercase shrink-0 tracking-wider shadow-[0_0_8px_rgba(23,12,121,0.25)] animate-pulse">
                      <Headphones className="w-2.5 h-2.5 animate-bounce" />
                      Sedang Diputar
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200 select-none">
                      Putar
                    </span>
                  )}
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-white/5 bg-black/10">
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: '12px' }}
                    src={play.spotifyEmbedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Toast Notification Message Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-slate-900 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}