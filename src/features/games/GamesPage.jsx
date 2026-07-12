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
  Gamepad
} from 'lucide-react';

import cockroachImage from './menangkap-kecoa/kecoa.webp';
import tebakKataBg from '../../assets/images/intan-01.webp';

const ICON_MAP = {
  Gamepad2,
  Gamepad,
  Play,
  Users,
  Target,
  Trophy,
  Sparkles
};

const getThemeStyles = (themeName) => {
  const themes = {
    amber: {
      border: 'border-amber-500/25',
      bg: 'bg-[#090530]',
      heroBg: 'from-[#0c073a] to-[#1a1168]',
      particles: 'bg-amber-400',
      iconText: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      button: 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#170C79] hover:from-amber-300 hover:to-amber-400',
      textAccent: 'text-amber-400'
    },
    cyan: {
      border: 'border-cyan-500/25',
      bg: 'bg-[#031d2b]',
      heroBg: 'from-[#02111d] to-[#06243a]',
      particles: 'bg-cyan-400',
      iconText: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      button: 'bg-cyan-500 hover:bg-cyan-400 text-black',
      textAccent: 'text-cyan-400'
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
function FloatingParticles({ count = 12, color = 'bg-[#FFB84D]', containerHeight = 350 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* eslint-disable react-hooks/purity */
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      size: Math.random() * 5 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      left: Math.random() * 100,
      xOffset: Math.random() * 30 - 15,
    }));
  }, [count]);
  /* eslint-enable react-hooks/purity */

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-30 ${color}`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
          }}
          animate={{
            y: -containerHeight,
            x: [0, p.xOffset, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function GamesPage() {
  const [activeTheme, setActiveTheme] = useState('default'); // 'default' | 'amber' | 'cyan'
  const [leaderboardTab, setLeaderboardTab] = useState('weekly'); // 'weekly' | 'all-time'
  const [leaderboardGame, setLeaderboardGame] = useState('classic'); // 'classic' | 'gosok-intan'

  const [leaderboard, setLeaderboard] = useState([
    { username: 'Bima_Nium', score: 1442, title: 'Intanium Brave' },
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
      byline: item.title || 'Intanium Player',
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
    document.title = 'Arena Game Intanium | Official Community Space';

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

  const featuredGame = settings.games['menangkap-kecoa'];
  const scratchGame = settings.games['gosok-intan'];
  const heroTheme = getThemeStyles(featuredGame.theme || 'amber');
  const scratchTheme = getThemeStyles(scratchGame.theme || 'cyan');

  return (
    <div className="relative min-h-[90vh] pb-12 pt-0 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <h1 className="sr-only">Arena Game Intanium - Ruang Komunitas Resmi</h1>

      {/* Ambient Morphing Background Glow Orbs */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-1000 ${activeTheme === 'amber' ? 'bg-amber-500/12' :
        activeTheme === 'cyan' ? 'bg-cyan-500/15' : 'bg-purple-500/8'
        }`} />

      <div className={`absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none -z-10 transition-all duration-1000 ${activeTheme === 'amber' ? 'bg-orange-500/8' :
        activeTheme === 'cyan' ? 'bg-teal-500/12' : 'bg-cyan-500/8'
        }`} />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">

        {/* Header Title */}
        <div className="text-left space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-[#170C79] to-[#3a1da8] bg-clip-text text-transparent tracking-tight">
            Arena Game Intanium
          </h2>
          <p className="text-sm text-slate-600 max-w-lg font-medium">
            Uji ketangkasan dan keberuntunganmu di sini. Raih rekor tertinggi dan tunjukkan dukunganmu sebagai Top Fans!
          </p>
        </div>

        {/* ================= BENTO GRID CONTAINER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* BENTO CARD 1: FEATURED GAME (Menangkap Kecoa - Width 2) */}
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

            {/* Neon Grid Backplate */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <FloatingParticles count={15} color={heroTheme.particles} containerHeight={460} />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 sm:p-10 relative z-10 items-center h-full">
              {/* Info Column */}
              <div className="md:col-span-7 space-y-6 text-left flex flex-col justify-center h-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-[10px] font-black uppercase tracking-widest text-[#fff18a] w-max">
                  {featuredGame.badge || 'GAME UNGGULAN'}
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                  {featuredGame.title}
                </h3>

                <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed max-w-md">
                  {featuredGame.description}
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-4 max-w-md">
                  <div>
                    <p className="text-[9px] font-bold text-purple-300/60 uppercase tracking-wider">Rekor Terbaik</p>
                    <p className="text-base font-extrabold text-amber-400 mt-0.5">
                      {loadingLeaderboard ? '...' : highScore.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-purple-300/60 uppercase tracking-wider">Kesulitan</p>
                    <p className={`text-base font-extrabold mt-0.5 ${heroTheme.textAccent}`}>
                      {featuredGame.difficulty || 'Mudah'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-purple-300/60 uppercase tracking-wider">Durasi</p>
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
                  className="w-40 md:w-48 relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                >
                  <img src={(cockroachImage)?.src || (cockroachImage)} alt="Kecoa Game Visual" className="w-full h-auto object-contain" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* BENTO CARD 2: SECOND GAME (Gosok Intan - Width 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: PREMIUM_EASE }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setActiveTheme('cyan')}
            className={`lg:col-span-1 relative bg-gradient-to-br ${scratchTheme.heroBg} rounded-[2.5rem] border ${scratchTheme.border} shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between group p-8 text-white pointer-events-auto`}
          >
            {/* Reflective Glare Overlay */}
            <div className="card-glare absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-[2.5rem]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />
            <FloatingParticles count={8} color={scratchTheme.particles} containerHeight={460} />

            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md ${scratchTheme.iconText}`}>
                  <Sparkles className="size-6 animate-pulse" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide border backdrop-blur-md bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  {scratchGame.badge}
                </span>
              </div>

              {/* Main Content */}
              <div className="text-left space-y-2 flex-grow flex flex-col justify-end">
                <h3 className="text-3xl font-black text-white tracking-tight leading-tight">
                  {scratchGame.title}
                </h3>

                <div className="flex items-center gap-3 text-[9px] font-bold text-cyan-400 uppercase tracking-widest py-1">
                  <span>Kesulitan: {scratchGame.difficulty}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {scratchGame.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={scratchGame.link}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm ${scratchTheme.button} transition-all duration-305`}
                >
                  <Play className="size-4 fill-current" /> Main Sekarang <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* BENTO CARD 3: LEADERBOARD PREVIEW (Width 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: PREMIUM_EASE }}
            className="lg:col-span-2 flex flex-col justify-between rounded-[2.5rem] border border-[#170C79]/10 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-xl text-[#170C79] text-left"
          >
            <div className="space-y-6 w-full">
              {/* Leaderboard Header with Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-black text-[#170C79] flex items-center gap-2">
                  🏆 Papan Skor Terbaik
                </h3>

                {/* Custom High-Tech Switch Tabs */}
                <div className="flex items-center gap-3 bg-[#170C79]/5 p-1 border border-[#170C79]/10 rounded-xl text-xs font-bold w-max">
                  <div className="flex rounded-lg overflow-hidden border border-[#170C79]/10">
                    <button
                      onClick={() => setLeaderboardGame('classic')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${leaderboardGame === 'classic' ? 'bg-[#170C79] text-white' : 'text-[#170C79]/70 hover:bg-[#170C79]/10'}`}
                    >
                      Kecoa
                    </button>
                    <button
                      onClick={() => setLeaderboardGame('gosok-intan')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${leaderboardGame === 'gosok-intan' ? 'bg-[#170C79] text-white' : 'text-[#170C79]/70 hover:bg-[#170C79]/10'}`}
                    >
                      Gosok Intan
                    </button>
                  </div>

                  <div className="flex rounded-lg overflow-hidden border border-[#170C79]/10">
                    <button
                      onClick={() => setLeaderboardTab('weekly')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${leaderboardTab === 'weekly' ? 'bg-[#170C79] text-white' : 'text-[#170C79]/70 hover:bg-[#170C79]/10'}`}
                    >
                      Mingguan
                    </button>
                    <button
                      onClick={() => setLeaderboardTab('all-time')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${leaderboardTab === 'all-time' ? 'bg-[#170C79] text-white' : 'text-[#170C79]/70 hover:bg-[#170C79]/10'}`}
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

            <div className="pt-4 border-t border-[#170C79]/10 mt-4">
              <Link
                href={ROUTES.GAME_MENANGKAP_KECOA}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 border border-[#170C79]/15 text-[#170C79] hover:bg-[#170C79] hover:text-white transition-all duration-300 text-xs font-bold"
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
      className="flex items-center gap-4 p-5 rounded-[1.8rem] bg-white/75 backdrop-blur-xl border border-[#170C79]/8 text-[#170C79] hover:border-[#170C79]/20 hover:shadow-lg transition-all text-left shadow-md"
    >
      <div className={`p-3.5 rounded-2xl shrink-0 border ${color}`}>
        <Icon className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-[#170C79] mt-1">
          <NumberCounter value={value} />
        </p>
      </div>
    </motion.div>
  );
}
