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
  VolumeX,
  Calendar,
  ChevronLeft,
  ChevronRight
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

  const loadTrack = useCallback((index, autoplay, direction) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    dispatch({ type: 'SET_TRACK', index, direction });
    
    // Properly stop existing playback before setting new source
    audio.pause();
    audio.src = tracks[index].src;
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
    audio.load();
    if (autoplay) {
      audio.play().catch((err) => {
        console.error("Autoplay prevented or playback failed:", err);
      });
    }
  }, [tracks, volume, isMuted]);

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

export function MusicPlayer({ tracks }) {
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
    loadTrack,
  } = useAudioPlayer(tracks);

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
      toggle, next, prev, seekForward, seekBackward, toggleShuffle, cycleLoop,
    }),
    [toggle, next, prev, seekForward, seekBackward, toggleShuffle, cycleLoop]
  );
  useKeyboardShortcuts(shortcuts);

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-[1500px] mx-auto flex flex-col xl:flex-row items-center xl:items-stretch gap-8 lg:gap-10 px-4 sm:px-6 py-6 sm:py-10">
      {/* Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* LEFT COLUMN: Text & Actions */}
      <div className="w-full xl:w-[320px] 2xl:w-[400px] flex flex-col items-center xl:items-start text-center xl:text-left shrink-0 xl:py-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-black text-[var(--text-primary)] leading-[1.15] tracking-tight mb-4">
          Rekomendasi Lagu Pilihan Untuk <span className="text-[var(--color-primary)]">Intan</span>
        </h2>
        
        <p className="text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] font-medium mb-8 max-w-md xl:max-w-full">
          Dengarkan kurasi lagu-lagu yang kami rekomendasikan untuk Nur Intan JKT48. Biarkan alunannya menjadi penemani harimu.
        </p>
        
        <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center gap-3 w-full sm:w-auto xl:w-full">
          <Button 
            className="w-full sm:w-auto xl:w-full 2xl:w-auto px-6 py-5 sm:py-6 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(23,12,121,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
            onClick={() => {
              if(!playerState.isPlaying) toggle();
            }}
          >
            <Play className="w-4 h-4 fill-current" /> Mulai Mendengarkan
          </Button>
          
          <Button 
            variant="outline"
            className="w-full sm:w-auto xl:w-full 2xl:w-auto px-6 py-5 sm:py-6 rounded-full border-slate-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shrink-0"
            onClick={() => {
              const el = document.getElementById('playlist-koleksi');
              if (el) {
                const yOffset = -80;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
              }
            }}
          >
            <Calendar className="w-4 h-4" /> Jelajahi Playlist Bulanan
          </Button>
        </div>
      </div>

      {/* RIGHT COLUMN: The Dark Player */}
      <div className="flex-1 w-full bg-[#1c1825] rounded-[2rem] lg:rounded-[3rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/10 flex flex-col lg:flex-row items-center lg:items-stretch p-5 sm:p-6 lg:p-8 xl:p-6 2xl:p-10 gap-5 lg:gap-6 xl:gap-6 2xl:gap-8 min-h-[380px]">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[70px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[250px] h-[250px] bg-blue-500/20 rounded-full blur-[70px]" />
        </div>

        {/* 1. Player Left: Disc */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-48 lg:h-48 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 shrink-0 self-center lg:self-center">
          <div className={`w-full h-full rounded-full border-[5px] sm:border-[6px] border-[#100c17] shadow-[0_0_30px_rgba(0,0,0,0.6)] overflow-hidden relative spin-disc ${playerState.isPlaying ? 'is-playing' : ''}`}>
             <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.9)_41%,transparent_42%,transparent_45%,rgba(0,0,0,0.9)_46%,transparent_47%,transparent_50%,rgba(0,0,0,0.9)_51%,transparent_52%)] pointer-events-none opacity-40 mix-blend-overlay z-10" />
             <img src={currentTrack.cover?.src || currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover z-0" />
             <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-[#1c1825] rounded-full border border-purple-500/30 flex items-center justify-center z-20">
               <img src={currentTrack.cover?.src || currentTrack.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] rounded-full" />
               <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/90 rounded-full shadow-inner z-30" />
             </div>
          </div>
          {/* Audio Reactive Glow */}
          <div className={`absolute inset-[-10%] rounded-full bg-purple-500/20 blur-2xl transition-transform duration-500 -z-10 ${playerState.isPlaying ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`} />
        </div>

        {/* 2. Player Middle: Info, Wave, Controls */}
        <div className="flex-1 flex flex-col justify-center min-w-0 w-full z-10 py-2 xl:py-4">
          <div className="mb-4 xl:mb-6 text-center lg:text-left">
            <p className="text-purple-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-1.5">Now Playing</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate mb-1">{currentTrack.title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 truncate">{currentTrack.artist}{currentTrack.mood ? ` • ${currentTrack.mood}` : ''}</p>
          </div>

          {/* Audio Waveform (CSS animated bars) */}
          <div className="w-full h-8 sm:h-10 xl:h-12 mb-4 xl:mb-6 relative flex items-center justify-center lg:justify-start gap-1 opacity-70 overflow-hidden px-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 sm:w-2 sm:flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full animate-wave"
                style={{ 
                  height: playerState.isPlaying ? `${Math.random() * 80 + 20}%` : '20%', 
                  animationDelay: `${i * 0.05}s`,
                  animationPlayState: playerState.isPlaying ? 'running' : 'paused'
                }} 
              />
            ))}
          </div>

          {/* Controls & Progress */}
          <div className="w-full">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 xl:mb-5">
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 w-8 text-right">{fmt(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative group overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                }}
              >
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full group-hover:from-purple-400 group-hover:to-indigo-300 transition-colors" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 w-8 text-left">{fmt(duration)}</span>
            </div>

            <div className="flex items-center justify-center lg:justify-between px-2 gap-4 lg:gap-0">
               <button onClick={toggleShuffle} className={`p-2 transition-all hover:scale-110 active:scale-95 hidden sm:block ${playerState.shuffled ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}>
                  <Shuffle size={16} strokeWidth={2.5} />
               </button>
               <button onClick={prev} className="p-2 text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95">
                  <SkipBack size={20} fill="currentColor" />
               </button>
               <button onClick={toggle} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-[0_5px_20px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95 shrink-0">
                  {playerState.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
               </button>
               <button onClick={next} className="p-2 text-slate-300 hover:text-white transition-all hover:scale-110 active:scale-95">
                  <SkipForward size={20} fill="currentColor" />
               </button>
               <button onClick={cycleLoop} className={`p-2 relative transition-all hover:scale-110 active:scale-95 hidden sm:block ${playerState.loopMode !== 'off' ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}>
                  <Repeat size={16} strokeWidth={2.5} />
                  {playerState.loopMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center border border-[#1c1825]">1</span>}
               </button>
            </div>
          </div>
        </div>

        {/* 3. Player Right: Playlist List */}
        <div className="w-full lg:w-[240px] xl:w-[250px] 2xl:w-[280px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6 xl:pl-4 2xl:pl-6 flex flex-col z-10 self-stretch">
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold text-xs xl:text-sm tracking-wide">Playlist Untuk Intan</h4>
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer" onClick={() => document.querySelector('.player-playlist-scroll')?.scrollBy({top: -100, behavior:'smooth'})}>
                  <ChevronLeft size={14} />
                </button>
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer" onClick={() => document.querySelector('.player-playlist-scroll')?.scrollBy({top: 100, behavior:'smooth'})}>
                  <ChevronRight size={14} />
                </button>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar player-playlist-scroll space-y-2 h-[200px] lg:h-[260px] xl:h-[300px]">
              {tracks.map((track, index) => {
                 const isActive = index === playerState.currentIndex;
                 return (
                    <button
                       key={track.id || index}
                       onClick={() => {
                          if(isActive) toggle();
                          else loadTrack(index, true, index > playerState.currentIndex ? 'next' : 'prev');
                       }}
                       className={`w-full flex items-center gap-2 xl:gap-3 p-2 rounded-xl transition-all duration-300 text-left group cursor-pointer ${isActive ? 'bg-white/10 shadow-sm border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                       <span className={`text-[9px] xl:text-[10px] font-bold w-4 text-center shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                          {isActive && playerState.isPlaying ? (
                             <div className="flex items-end justify-center gap-[2px] h-3">
                               <div className="w-[2px] bg-purple-400 rounded-full animate-bar1 h-full" />
                               <div className="w-[2px] bg-purple-400 rounded-full animate-bar2 h-[60%]" />
                               <div className="w-[2px] bg-purple-400 rounded-full animate-bar3 h-[80%]" />
                             </div>
                          ) : (
                             index + 1
                          )}
                       </span>
                       <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-md overflow-hidden relative shrink-0">
                          <img src={track.cover?.src || track.cover} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`text-[10px] xl:text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{track.title}</p>
                          <p className="text-[9px] xl:text-[10px] text-slate-500 truncate mt-0.5">{track.artist}</p>
                       </div>
                       <div className={`text-[9px] xl:text-[10px] font-bold shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                          {track.playCount || '3:00'}
                       </div>
                    </button>
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
    document.title = '#dengerINTAN Playlist | IRIS';
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
              #dengerINTAN
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
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F6FA 100%)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)'
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
              Koleksi Playlist #dengerINTAN
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