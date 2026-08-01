'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/constants';
import { supabase } from '../../lib/supabaseClient';
import { getGameSettings } from '../../services/public/gameService';
import { LeaderboardRankings } from './LeaderboardRankings';
import {
  Gamepad2,
  Lock,
  Sparkles,
  Trophy,
  ArrowRight,
  Play,
  Users,
  Target,
  ChevronRight,
  Gamepad,
  ExternalLink
} from 'lucide-react';

import cockroachImage from './menangkap-kecoa/kecoa.webp';
import tebakKataBg from '../../assets/images/intan-01.webp';
import intan02 from '../../assets/images/intan-02.webp';

const ICON_MAP = {
  Gamepad2,
  Gamepad,
  Play,
  Users,
  Target,
  Trophy,
  Sparkles
};

const resolveGameBgImage = (game) => {
  if (!game) return null;
  const rawBg = game.bgImage || game.bg_image || game.imageUrl || game.image_url || game.coverUrl || game.cover_url;
  if (!rawBg) return null;
  if (typeof rawBg === 'object' && rawBg.src) return rawBg.src;
  if (typeof rawBg === 'string') {
    if (rawBg === 'cockroachBg') return cockroachImage?.src || cockroachImage;
    if (rawBg === 'tebakKataBg') return tebakKataBg?.src || tebakKataBg;
    if (rawBg === 'intanRunBg') return intan02?.src || intan02;
    return rawBg;
  }
  return null;
};

const getThemeStyles = (themeName) => {
  const themes = {
    amber: {
      border: 'border-pink-500/30',
      bg: 'bg-white',
      heroBg: 'from-[#1A0B2E] via-[#2A1145] to-[#120722]',
      particles: 'bg-[#FF5FB2]',
      iconText: 'text-[#FF5FB2]',
      badge: 'bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white border-none shadow-md',
      button: 'bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white font-extrabold shadow-[0_4px_16px_rgba(255,95,178,0.35)] hover:scale-[1.03] active:scale-95',
      textAccent: 'text-[#FF5FB2]'
    },
    cyan: {
      border: 'border-purple-500/30',
      bg: 'bg-white',
      heroBg: 'from-[#1A0B2E] via-[#240E3C] to-[#10061E]',
      particles: 'bg-[#A855F7]',
      iconText: 'text-[#FF5FB2]',
      badge: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      button: 'bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white font-extrabold shadow-[0_4px_16px_rgba(255,95,178,0.35)] hover:scale-[1.03] active:scale-95',
      textAccent: 'text-[#FF5FB2]'
    }
  };
  return themes[themeName] || themes.amber;
};

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

// Interactive Number Ticker Component
function NumberCounter({ value, duration = 1 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 25);
    let step = Math.ceil(end / (totalMiliseconds / incrementTime));

    let timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString('id-ID')}</span>;
}

// Particle generator for custom card visuals
function FloatingParticles({ count = 12, color = 'bg-[var(--color-pink)]', containerHeight = 350 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => {
        const size = (i % 4) + 3;
        const left = (i * 17) % 100;
        const top = (i * 23) % 100;
        const delay = (i * 0.3) % 3;
        const duration = 2 + (i % 3);

        return (
          <div
            key={i}
            className={`absolute rounded-full opacity-60 animate-pulse ${color}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function GamesPage() {
  const [activeTheme, setActiveTheme] = useState('default'); // 'default' | 'amber' | 'cyan'
  const [leaderboardTab, setLeaderboardTab] = useState('weekly'); // 'weekly' | 'all-time'
  const [leaderboardGame, setLeaderboardGame] = useState('classic'); // 'classic' | 'gosok-intan'

  const [leaderboard, setLeaderboard] = useState([
    { username: 'Bima_Nium', score: 1442, title: 'IRIS Brave' },
    { username: 'Luthfi_G', score: 1210, title: 'Kecoa Hunter' },
    { username: 'Zaki_88', score: 980, title: 'Berani Juga' }
  ]);
  const [highScore, setHighScore] = useState(1442);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const rankingsData = useMemo(() => {
    return leaderboard.map((item, index) => ({
      userId: item.id || item.username || `${index}`,
      userName: item.username,
      rank: index + 1,
      value: item.score,
      byline: item.title || 'IRIS Player',
      displayed: true
    }));
  }, [leaderboard]);

  // Game Settings State (dynamic config from Supabase)
  const [settings, setSettings] = useState({
    featuredGameId: 'menangkap-kecoa',
    challengeCount: 100,
    challengeReward: 'Hall of Fame',
    challengeActive: true,
    games: {
      'menangkap-kecoa': {
        active: true,
        title: 'Menangkap Kecoa',
        description: 'Uji kecepatan tanganmu menangkap kecoa-kecoa terbang sebelum mereka lolos dan raih skor tertinggi!',
        badge: 'Populer',
        difficulty: 'Mudah',
        playTime: '60 Detik',
        theme: 'amber',
        emoji: '🐜',
        icon: 'Bug',
        link: '/games/menangkap-kecoa',
        bgImage: 'cockroachBg',
        layoutSpan: 2
      },
      'gosok-intan': {
        active: true,
        title: 'Gosok Intan',
        description: 'Gosok dan Temukan foto Intan sebanyak-banyaknya di balik titik hitam. Hindari bom peledak!',
        badge: 'Baru',
        difficulty: 'Sedang',
        theme: 'cyan',
        emoji: '💎',
        icon: 'Sparkles',
        link: '/games/gosok-intan',
        bgImage: 'tebakKataBg',
        layoutSpan: 1
      }
    },
    stats: {
      totalPlayers: 1254,
      totalGamesPlayed: 8420,
      avgScore: 582
    }
  });

  const getStartOfWeekUTC = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - (day === 0 ? 6 : day - 1);
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0)).toISOString();
  };

  const fetchLeaderboard = async (gameMode, period) => {
    setLoadingLeaderboard(true);
    try {
      let query = supabase
        .from('game_scores')
        .select('id, username, score, title, created_at')
        .eq('mode', gameMode);

      if (period === 'weekly') {
        const startOfWeek = getStartOfWeekUTC();
        query = query.gte('created_at', startOfWeek);
      }

      const { data, error } = await query
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5);

      if (!error && data) {
        setLeaderboard(data);
        if (gameMode === 'classic' && data.length > 0) {
          setHighScore(data[0].score);
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    document.title = 'Arena Game IRIS | Official Community Space';

    // Fetch initial leaderboard and settings
    fetchLeaderboard(leaderboardGame, leaderboardTab);

    getGameSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => console.error('Error loading game settings:', err));
  }, [leaderboardGame, leaderboardTab]);

  // High performance direct DOM manipulation for 3D Tilt Parallax & Glare
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateY = ((x - xc) / xc) * 8; // Rot Y max 8 degrees
    const rotateX = ((yc - y) / yc) * 8; // Rot X max 8 degrees

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    card.style.transition = 'transform 0.08s ease-out';

    const glare = card.querySelector('.card-glare');
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

    const glare = card.querySelector('.card-glare');
    if (glare) {
      glare.style.background = 'transparent';
    }
    setActiveTheme('default');
  };

  // Active Games computed dynamically from DB
  const activeGames = useMemo(() => {
    const gamesObj = settings?.games || {};
    return Object.entries(gamesObj)
      .filter(([_, g]) => g && g.active)
      .map(([id, g]) => ({ id, ...g }));
  }, [settings]);

  // Featured Game selection (matches settings.featuredGameId or first active game)
  const featuredGame = useMemo(() => {
    const featId = settings?.featuredGameId;
    if (featId && settings?.games?.[featId]?.active) {
      return { id: featId, ...settings.games[featId] };
    }
    return activeGames[0] || null;
  }, [settings, activeGames]);

  // Secondary Active Games (other active games excluding the featured one)
  const secondaryGames = useMemo(() => {
    if (!featuredGame) return activeGames;
    return activeGames.filter((g) => g.id !== featuredGame.id);
  }, [activeGames, featuredGame]);

  const heroTheme = getThemeStyles(featuredGame?.theme || 'amber');

  return (
    <div className="relative min-h-[90vh] pb-12 pt-0 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <h1 className="sr-only">Arena Game IRIS - Ruang Komunitas Resmi</h1>

      {/* Ambient Morphing Background Glow Orbs */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-1000 ${activeTheme === 'amber' ? 'bg-pink-500/15' :
        activeTheme === 'cyan' ? 'bg-purple-500/15' : 'bg-pink-500/10'
        }`} />

      <div className={`absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none -z-10 transition-all duration-1000 ${activeTheme === 'amber' ? 'bg-purple-500/10' :
        activeTheme === 'cyan' ? 'bg-pink-500/12' : 'bg-purple-500/10'
        }`} />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">

        {/* Header Title */}
        <div className="text-left space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-[#FF5FB2] via-[#C96EFF] to-[#72C4FF] bg-clip-text text-transparent tracking-tight">
            Arena Game IRIS
          </h2>
          <p className="text-sm text-slate-600 max-w-lg font-medium">
            Uji ketangkasan dan keberuntunganmu di sini. Raih rekor tertinggi dan tunjukkan dukunganmu sebagai Top Fans!
          </p>
        </div>

        {/* ================= BENTO GRID CONTAINER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* BENTO CARD 1: DYNAMIC FEATURED GAME (Width 2) */}
          {featuredGame ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: PREMIUM_EASE }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={() => setActiveTheme('amber')}
              className={`lg:col-span-2 relative bg-gradient-to-br ${heroTheme.heroBg} rounded-[2.5rem] border ${heroTheme.border} shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between group pointer-events-auto`}
            >
              {/* Reflective Glare Overlay */}
              <div className="card-glare absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-[2.5rem]" />

              {/* Dynamic Background Image from Game Data */}
              {resolveGameBgImage(featuredGame) && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                  <img
                    src={resolveGameBgImage(featuredGame)}
                    alt={featuredGame.title}
                    className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 ease-out filter blur-[1px] group-hover:blur-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B2E] via-[#1A0B2E]/85 to-[#120722]/70" />
                </div>
              )}

              {/* Neon Grid Backplate */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
              <FloatingParticles count={15} color={heroTheme.particles} containerHeight={460} />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 sm:p-10 relative z-10 items-center h-full">
                {/* Info Column */}
                <div className="md:col-span-7 space-y-6 text-left flex flex-col justify-center h-full">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm w-max">
                    {featuredGame.badge || 'GAME UNGGULAN'}
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                    {featuredGame.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-pink-100/80 leading-relaxed max-w-md">
                    {featuredGame.description}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 border-y border-white/15 py-4 max-w-md">
                    <div>
                      <p className="text-[9px] font-bold text-pink-200/70 uppercase tracking-wider">Rekor Terbaik</p>
                      <p className="text-base font-extrabold text-amber-300 mt-0.5">
                        {loadingLeaderboard ? '...' : highScore.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-pink-200/70 uppercase tracking-wider">Kesulitan</p>
                      <p className="text-base font-extrabold mt-0.5 text-pink-300">
                        {featuredGame.difficulty || 'Mudah'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-pink-200/70 uppercase tracking-wider">Durasi</p>
                      <p className="text-base font-extrabold text-white mt-0.5">
                        {featuredGame.playTime || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={featuredGame.link || '#'}
                      className={`inline-flex items-center gap-3 ${heroTheme.button} transition-all duration-300 font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg`}
                    >
                      <Play className="size-4 fill-current" /> Main Sekarang <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>

                {/* Graphic Column */}
                <div className="md:col-span-5 h-[220px] md:h-[280px] relative flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)] animate-pulse" />
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-40 md:w-48 relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] flex items-center justify-center"
                  >
                    {featuredGame.id === 'menangkap-kecoa' || featuredGame.icon === 'Bug' ? (
                      <img src={(cockroachImage)?.src || (cockroachImage)} alt="Kecoa Game Visual" className="w-full h-auto object-contain" />
                    ) : (
                      <span className="text-7xl sm:text-8xl select-none">{featuredGame.emoji || '🎮'}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* BENTO CARD 2: DYNAMIC SECONDARY GAME(S) (Width 1 each) */}
          {secondaryGames.map((secGame) => {
            const secTheme = getThemeStyles(secGame.theme || 'cyan');
            const isExternalLink = secGame.link && (secGame.link.startsWith('http://') || secGame.link.startsWith('https://'));

            return (
              <motion.div
                key={secGame.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: PREMIUM_EASE }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={() => setActiveTheme('cyan')}
                className={`lg:col-span-1 relative bg-gradient-to-br ${secTheme.heroBg} rounded-[2.5rem] border ${secTheme.border} shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between group p-8 text-white pointer-events-auto`}
              >
                {/* Reflective Glare Overlay */}
                <div className="card-glare absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-[2.5rem]" />

                {/* Dynamic Background Image from Game Data */}
                {resolveGameBgImage(secGame) && (
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
                    <img
                      src={resolveGameBgImage(secGame)}
                      alt={secGame.title}
                      className="w-full h-full object-cover object-center opacity-30 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 ease-out filter blur-[1px] group-hover:blur-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10061E] via-[#10061E]/80 to-[#10061E]/40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#10061E] via-transparent to-transparent z-0" />
                <FloatingParticles count={8} color={secTheme.particles} containerHeight={460} />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-[var(--color-pink)] text-xl">
                      {secGame.emoji || <Sparkles className="size-6 animate-pulse" />}
                    </div>
                    {secGame.badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide border backdrop-blur-md bg-purple-500/20 text-purple-200 border-purple-400/30">
                        {secGame.badge}
                      </span>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="text-left space-y-2 flex-grow flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
                      {secGame.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--color-pink)] uppercase tracking-widest py-1">
                      <span>Kesulitan: {secGame.difficulty || 'Sedang'}</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {secGame.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isExternalLink ? (
                      <a
                        href={secGame.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm ${secTheme.button} transition-all duration-305`}
                      >
                        <Play className="size-4 fill-current" /> Main Sekarang <ExternalLink className="size-4" />
                      </a>
                    ) : (
                      <Link
                        href={secGame.link || '#'}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm ${secTheme.button} transition-all duration-305`}
                      >
                        <Play className="size-4 fill-current" /> Main Sekarang <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* BENTO CARD 3: LEADERBOARD PREVIEW (Width 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: PREMIUM_EASE }}
            className="lg:col-span-2 flex flex-col justify-between rounded-[2.5rem] border border-[rgba(0,0,0,0.05)] bg-white p-6 sm:p-8 shadow-[0_8px_32px_rgba(15,23,42,0.04)] text-[#222222] text-left"
          >
            <div className="space-y-6 w-full">
              {/* Leaderboard Header with Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-black text-[#222222] flex items-center gap-2">
                  🏆 Papan Skor Terbaik
                </h3>

                {/* Custom High-Tech Switch Tabs */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#F5F7FB] p-1 border border-[#E7EAF2] rounded-xl text-xs font-bold w-full sm:w-max max-w-full">
                  <div className="flex w-full sm:w-auto rounded-lg overflow-hidden border border-[#E7EAF2]">
                    {activeGames.map((g) => {
                      const modeKey = g.id === 'menangkap-kecoa' ? 'classic' : g.id;
                      const isSelected = leaderboardGame === modeKey;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setLeaderboardGame(modeKey)}
                          className={`flex-1 sm:flex-none px-3 py-1.5 whitespace-nowrap text-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF5FB2] text-white'
                              : 'text-[var(--color-body)] hover:bg-[#FF5FB2]/10'
                          }`}
                        >
                          {g.title.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex w-full sm:w-auto rounded-lg overflow-hidden border border-[#E7EAF2]">
                    <button
                      onClick={() => setLeaderboardTab('weekly')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 whitespace-nowrap text-center transition-colors cursor-pointer ${leaderboardTab === 'weekly' ? 'bg-[#FF5FB2] text-white' : 'text-[#60697A] hover:bg-[#FF5FB2]/10'}`}
                    >
                      Mingguan
                    </button>
                    <button
                      onClick={() => setLeaderboardTab('all-time')}
                      className={`flex-1 sm:flex-none px-3 py-1.5 whitespace-nowrap text-center transition-colors cursor-pointer ${leaderboardTab === 'all-time' ? 'bg-[#FF5FB2] text-white' : 'text-[#60697A] hover:bg-[#FF5FB2]/10'}`}
                    >
                      Abadi
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table rows */}
              <div className="w-full">
                {loadingLeaderboard ? (
                  <div className="py-12 text-center text-sm text-[#170C79]/50 animate-pulse">
                    Memuat data papan peringkat...
                  </div>
                ) : rankingsData.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Belum ada skor yang tercatat untuk periode ini. Jadilah yang pertama!
                  </div>
                ) : (
                  <LeaderboardRankings
                    rankings={rankingsData}
                    className="border-none bg-transparent shadow-none w-full"
                  />
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7EAF2] mt-4">
              <Link
                href={ROUTES.GAME_MENANGKAP_KECOA}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 border border-[#E7EAF2] text-[#FF5FB2] hover:bg-[#FFF0F7] transition-all duration-300 text-xs font-bold"
              >
                Lihat Klasemen Lengkap <ArrowRight className="size-4 animate-bounce-horizontal" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: PREMIUM_EASE }}
            className="lg:col-span-1 flex flex-col gap-3.5 justify-start"
          >
            <StatCard
              icon={Trophy}
              title="Rekor Teratas"
              value={loadingLeaderboard ? 1442 : highScore}
              color="text-amber-600 bg-amber-500/10 border-amber-500/15"
            />
            <StatCard
              icon={Users}
              title="Total Pemain"
              value={settings.stats.totalPlayers}
              color="text-indigo-600 bg-indigo-500/10 border-indigo-500/15"
            />
            <StatCard
              icon={Gamepad}
              title="Sesi Dimainkan"
              value={settings.stats.totalGamesPlayed}
              color="text-cyan-600 bg-cyan-500/10 border-cyan-500/15"
            />
            <StatCard
              icon={Target}
              title="Rata-rata Skor"
              value={settings.stats.avgScore}
              color="text-purple-600 bg-purple-500/10 border-purple-500/15"
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Upgraded Bento Stats Card Helper
function StatCard({ icon: Icon, title, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[rgba(0,0,0,0.05)] text-[#222222] hover:border-[#FF5FB2]/20 hover:shadow-md transition-all text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
    >
      <div className={`p-3.5 rounded-2xl shrink-0 border ${color}`}>
        <Icon className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-[#222222] mt-1">
          <NumberCounter value={value} />
        </p>
      </div>
    </motion.div>
  );
}
