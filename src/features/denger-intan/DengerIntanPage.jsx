'use client';

import { useState, useEffect, useRef, useCallback, useId, useMemo, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playlistService } from '../../services/public/playlistService';
import './DengerIntanPage.css';
import {
  Share2,
  ArrowLeft,
  ArrowRight,
  Headphones,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  Heart,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Loading from '../../components/common/Loading';
import { ContainerScroll } from '../../components/ui/container-scroll-animation';

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

const paperTex = { background: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 50%)' };
const vp1 = { once: true, amount: 0.15, margin: '-40px' };
const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } } };

const FALLBACK_MOST_PLAYED = [
  {
    id: "track-1",
    title: "Helaf El Amar",
    artist: "George Wassouf",
    mood: "Classic",
    note: "Lagu George Wassouf terpopuler pilihan Intan.",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    playCount: "6:40",
    spotifyUrl: "https://open.spotify.com/track/5L2ELXkO17Iu9J8hwMktVJ",
    embedUrl: "https://open.spotify.com/embed/track/5L2ELXkO17Iu9J8hwMktVJ?utm_source=generator",
  },
  {
    id: "track-2",
    title: "Levitating",
    artist: "Dua Lipa",
    mood: "Energetic",
    note: "Lagu upbeat Dua Lipa penambah semangat.",
    coverUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    playCount: "3:23",
    spotifyUrl: "https://open.spotify.com/track/2Z8WuEywRWYTKe1NybPQEW",
    embedUrl: "https://open.spotify.com/embed/track/2Z8WuEywRWYTKe1NybPQEW?utm_source=generator",
  },
  {
    id: "track-3",
    title: "Heat Waves",
    artist: "Glass Animals",
    mood: "Chill",
    note: "Alunan lo-fi Glass Animals yang cozy.",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    playCount: "3:58",
    spotifyUrl: "https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx",
    embedUrl: "https://open.spotify.com/embed/track/02MWAaffLxlfxAUY7c5dvx?utm_source=generator",
  },
  {
    id: "track-4",
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    mood: "Pop Rock",
    note: "Nyanyian emosional Olivia Rodrigo favorit Intan.",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    playCount: "2:58",
    spotifyUrl: "https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG",
    embedUrl: "https://open.spotify.com/embed/track/4ZtFanR9U6ndgddUvNcjcG?utm_source=generator",
  }
];
// Reusable Lazy Loading Spotify Iframe component to maximize layout load speed
function LazySpotifyIframe({ src, title, height = "352" }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px 0px" } // trigger loading before user scrolls to view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ minHeight: `${height}px` }}
      className="w-full rounded-xl bg-black/30 flex items-center justify-center relative overflow-hidden"
    >
      {shouldLoad ? (
        <iframe
          style={{ borderRadius: '12px' }}
          src={src}
          width="100%"
          height={height}
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={title}
        ></iframe>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs gap-3 select-none">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold tracking-wide text-slate-400">Memuat Spotify Player...</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- useRafLoop */

function useRafLoop(cb) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
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
    } catch {
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
    } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              src={(l.track.cover)?.src || (l.track.cover)}
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
        className={`ctrl ctrl-toggle ${shuffled ? 'is-active' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
        onClick={onShuffle}
        aria-label="Shuffle"
        aria-pressed={shuffled}
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
      <button
        className="ctrl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={onPrev}
        aria-label="Sebelumnya"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 5L8 12l11 7zM5 5h2v14H5z" />
        </svg>
      </button>
      <button
        className="ctrl ctrl-play focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={onToggle}
        aria-label={isPlaying ? 'Jeda' : 'Putar'}
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
      <button
        className="ctrl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={onNext}
        aria-label="Berikutnya"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M5 5l11 7L5 19zM17 5h2v14h-2z" />
        </svg>
      </button>
      <button
        className={`ctrl ctrl-toggle ctrl-loop ${
          loopMode !== 'off' ? 'is-active' : ''
        } ${loopMode === 'one' ? 'mode-one' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
        onClick={onLoop}
        aria-label="Loop"
        aria-pressed={loopMode !== 'off'}
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
  const {
    audioRef,
    state: playerState,
    currentTime,
    duration,
    currentTrack,
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
  } = useAudioPlayer(tracks);

  const [isFavorite, setIsFavorite] = useState(false);

  const seekForward = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.min(a.duration || 0, a.currentTime + 5);
  }, [audioRef]);
  const seekBackward = useCallback(() => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, a.currentTime - 5);
  }, [audioRef]);

  const shortcuts = useMemo(
    () => ({
      toggle,
      next,
      prev,
      seekForward,
      seekBackward,
      toggleShuffle,
      cycleLoop,
    }),
    [
      toggle,
      next,
      prev,
      seekForward,
      seekBackward,
      toggleShuffle,
      cycleLoop,
    ]
  );
  useKeyboardShortcuts(shortcuts);

  // Formatting helper for duration
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;


  return (
    <div className="relative overflow-hidden w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-sky-500/[0.02] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden border border-slate-200/40 bg-white/30 dark:bg-black/20 p-8 sm:p-10 md:p-14 rounded-[32px] shadow-[0_40px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-transparent pointer-events-none" />

          <audio
            ref={audioRef}
            preload="metadata"
            crossOrigin={crossOrigin}
          />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
            {/* Left Column: Intro text and highlights */}
            <div className="space-y-8 text-left">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="w-fit border-indigo-400/35 bg-indigo-500/5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-indigo-500 select-none px-3.5 py-1 rounded-full"
                >
                  🎧 MOST PLAYED
                </Badge>
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--color-primary)] leading-tight">
                    Lagu Terpopuler Pilihan Intan
                  </h2>
                  <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                    Dengarkan kurasi lagu-lagu yang paling sering diputar dan menemani aktivitas keseharian Nur Intan JKT48. Biarkan alunannya mengalir selaras dengan duniamu.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={toggle}
                  className="h-12 rounded-full px-8 text-sm font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-all duration-300"
                >
                  {playerState.isPlaying ? 'Jeda Musik' : 'Mulai Mendengarkan'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('playlist-koleksi');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-12 rounded-full px-8 text-sm font-extrabold border-slate-200 text-slate-700 bg-white/40 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-all duration-300"
                >
                  Jelajahi Playlist Bulanan
                </Button>
              </div>


            </div>

            {/* Right Column: Immersive Player App widget */}
            <div className="space-y-6">
              {/* Glassmorphic Player Card */}
              <div className="rounded-3xl border border-slate-200/40 bg-white/60 dark:bg-slate-900/60 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.15)] backdrop-blur-2xl text-left relative overflow-hidden">
                
                {/* Equalizer Visualizer overlay at the player top */}
                <div className="absolute top-0 right-0 left-0 h-1.5 opacity-35">
                  <div className="w-full h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-500 animate-pulse" />
                </div>

                <div className="flex items-start gap-4">
                  {/* Album Cover art art block */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200/40 bg-gradient-to-br from-indigo-500/10 via-slate-100 to-transparent flex-shrink-0 shadow-sm">
                    <img 
                      src={currentTrack.cover?.src || currentTrack.cover} 
                      alt={currentTrack.title} 
                      className={`w-full h-full object-cover select-none transition-transform duration-700 ${playerState.isPlaying ? 'animate-none scale-105' : 'scale-100'}`} 
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)]" />
                    {playerState.isPlaying && (
                      <div className="absolute bottom-1 right-1 flex items-end gap-0.5 h-3.5 w-4 overflow-hidden bg-black/40 rounded px-0.5 py-0.5">
                        <div className="w-0.5 h-full bg-sky-400 rounded-full animate-bar1" />
                        <div className="w-0.5 h-full bg-sky-400 rounded-full animate-bar2" />
                        <div className="w-0.5 h-full bg-sky-400 rounded-full animate-bar3" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3.5 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-indigo-500 select-none">
                          Now playing
                        </p>
                        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-800 dark:text-white truncate">
                          {currentTrack.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {currentTrack.artist} {currentTrack.mood && `· ${currentTrack.mood}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsFavorite(!isFavorite);
                          // Show custom notification
                        }}
                        className={`rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-rose-500 transition-colors h-9 w-9 shrink-0 ${isFavorite ? 'text-rose-500 border-rose-200 bg-rose-50/40' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                      </Button>
                    </div>

                    {currentTrack.spotifyUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full border-slate-200 bg-white/70 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                        asChild
                      >
                        <a
                          href={currentTrack.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Spotify
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar info slider */}
                <div className="space-y-2 pt-5 select-none">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-400">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                    }}
                    className="h-1.5 w-full rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer relative"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-[width] duration-100"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Controls options */}
                <div className="flex items-center justify-between pt-5">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleShuffle}
                      className={`h-9 w-9 rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-indigo-600 transition-colors ${playerState.shuffled ? 'text-indigo-600 border-indigo-200 bg-indigo-50/40' : ''}`}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prev}
                      className="h-9 w-9 rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-indigo-600 transition-colors"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button 
                    onClick={toggle}
                    className="h-11 w-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                  >
                    {playerState.isPlaying ? <Pause className="h-4.5 w-4.5 fill-white" /> : <Play className="h-4.5 w-4.5 fill-white" />}
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={next}
                      className="h-9 w-9 rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-indigo-600 transition-colors"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cycleLoop}
                      className={`h-9 w-9 rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-indigo-600 transition-colors relative ${playerState.loopMode !== 'off' ? 'text-indigo-600 border-indigo-200 bg-indigo-50/40' : ''}`}
                    >
                      <Repeat className="h-4 w-4" />
                      {playerState.loopMode === 'one' && (
                        <span className="absolute -top-0.5 -right-0.5 text-[7px] font-black bg-indigo-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">1</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className={`h-9 w-9 rounded-full border border-slate-200/50 bg-white/60 text-slate-500 backdrop-blur hover:text-indigo-600 transition-colors ${isMuted ? 'text-rose-600 border-rose-200 bg-rose-50/40' : ''}`}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Optional Spotify track embed overlay below controls */}
                {currentTrack.embedUrl && (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/40 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur">
                    <LazySpotifyIframe
                      src={currentTrack.embedUrl}
                      title={`${currentTrack.title} - Spotify`}
                      height="152"
                    />
                  </div>
                )}
              </div>

              {/* Playlist queue buttons scrollable deck */}
              <div className="relative">
                <div className="max-h-[22rem] space-y-2.5 overflow-y-auto pr-1 hide-scrollbar relative z-10">
                  {tracks.map((track, index) => {
                    const isActive = index === playerState.currentIndex;
                    const isPlaying = isActive && playerState.isPlaying;

                    return (
                      <button
                        key={track.id || index}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            toggle();
                          } else {
                            loadTrack(index, true, index > playerState.currentIndex ? 'next' : 'prev');
                          }
                        }}
                        className={`group flex w-full items-center gap-4 rounded-2xl border border-slate-200/40 bg-white/60 dark:bg-black/10 p-4 text-left backdrop-blur-xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                          isActive
                            ? "border-indigo-400 bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 shadow-[0_15px_35px_rgba(15,23,42,0.1)] active-music-card"
                            : "hover:-translate-y-0.5 hover:border-slate-350 hover:bg-white/80"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs font-black transition-colors relative overflow-hidden select-none ${
                            isActive
                              ? "bg-indigo-600 text-white border-indigo-500"
                              : "bg-white/80 text-slate-700"
                          }`}
                        >
                          <img 
                            src={track.cover?.src || track.cover} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover opacity-15"
                          />
                          <span className="relative z-10">{track.title.charAt(0)}</span>
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-sm font-black truncate ${isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-800'}`}>
                                {track.title}
                              </p>
                              {track.mood && (
                                <Badge className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 hover:bg-slate-100 scale-90 border border-slate-200/30">
                                  {track.mood}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {track.artist}
                            </p>
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-2">
                            {isActive && (
                              <div className="flex items-end gap-0.5 h-3.5 w-4 overflow-hidden mb-0.5">
                                <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar1' : 'h-1.5'}`} />
                                <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar2' : 'h-3'}`} />
                                <div className={`w-0.5 h-full bg-indigo-500 rounded-full ${isPlaying ? 'animate-bar3' : 'h-2'}`} />
                              </div>
                            )}
                            <span className="text-[11px] font-bold tracking-wide text-slate-400">
                              {track.playCount || '3:00'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Gradient Masks */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/90 via-white/20 to-transparent z-20 opacity-40" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/90 via-white/20 to-transparent z-20 opacity-40" />
              </div>
            </div>
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
    const rawList = mostPlayedSongs && mostPlayedSongs.length > 0 ? mostPlayedSongs : FALLBACK_MOST_PLAYED;
    return rawList.map((song) => {
      return {
        title: song.title,
        artist: song.artist,
        cover: song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        src: song.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        mood: song.mood,
        playCount: song.playCount,
        note: song.note,
        id: song.id,
        spotifyUrl: song.spotifyUrl,
        embedUrl: song.embedUrl
      };
    });
  }, [mostPlayedSongs]);

  const playerCardRef = useRef(null);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [playerMousePosition, setPlayerMousePosition] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef(null);

  // Set page title for SEO best practices
  useEffect(() => {
    document.title = '#DengerINTAN Playlist | IRIS';
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
    <div className="space-y-16 max-w-7xl mx-auto pb-6 relative">

      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center select-none pt-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[var(--color-primary)] leading-none tracking-tight relative mb-8">
              #DengerINTAN
            </h1>
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

                <div className="flex gap-2.5">
                  <button
                    onClick={sharePlaylist}
                    className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    title="Bagikan Tautan Playlist"
                    aria-label="Bagikan Tautan Playlist"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                  <a
                    href={activePlaylist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    title="Buka di Spotify"
                    aria-label="Buka di Spotify"
                  >
                    <ExternalLink className="w-4.5 h-4.5" />
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
                    <LazySpotifyIframe
                      src={activePlaylist.spotifyEmbedUrl}
                      title={activePlaylist.title}
                    />
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

            {/* Inline CSS styling removed in favor of external DengerIntanPage.css */}
          </div>
        </div>
      </ContainerScroll>

      {/* Archives of Past Monthly Playlists / Koleksi Playlist */}
      <motion.section
        className="relative mt-16 select-none relative z-10 border-t border-[var(--border-color)]/40 pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSection}
        id="playlist-koleksi"
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

          <div className="flex gap-3">
            <button
              onClick={() => scrollContainer('left')}
              className="w-11 h-11 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              title="Scroll Kiri"
              aria-label="Scroll Kiri"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="w-11 h-11 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              title="Scroll Rian"
              aria-label="Scroll Kanan"
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
                <div className="flex justify-between items-start mb-3.5">
                  <div className="min-w-0 pr-2">
                    <span className="bg-[var(--color-secondary)]/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-sm uppercase tracking-wider select-none">
                      {play.category}
                    </span>
                    <h3 className="text-sm font-black text-[var(--color-primary)] truncate leading-tight mt-1">
                      {play.title}
                    </h3>
                  </div>
                  {isActivePlaylist ? (
                    <span className="bg-[var(--color-primary)] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1.5 uppercase shrink-0 tracking-wider shadow-[0_0_8px_rgba(23,12,121,0.25)] animate-pulse">
                      <Headphones className="w-3 h-3 animate-bounce" />
                      Sedang Diputar
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 select-none">
                      Putar
                    </span>
                  )}
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-white/5 bg-black/10">
                  <LazySpotifyIframe
                    src={play.spotifyEmbedUrl}
                    title={play.title}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ======================================================================== */}
      {/* Most Played Songs by Nur Intan */}
      <motion.section className="relative py-20 select-none z-10 border-t border-[var(--border-color)]/40 pt-16" id="most-played-song" style={paperTex}>
        <motion.div viewport={vp1} initial="hidden" whileInView="visible" variants={containerV} className="w-full">
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