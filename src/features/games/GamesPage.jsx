import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../lib/constants';
import { getGameLeaderboard, getGameSettings } from './menangkap-kecoa/gameService';
import {
  Gamepad2,
  Lock,
  Bug,
  Sparkles,
  Trophy,
  ArrowRight,
  HelpCircle,
  Zap,
  Play,
  Users,
  Target,
  Award,
  ChevronRight,
  RefreshCw,
  Check,
  Star,
  Gamepad,
  X,
  Flame,
  Heart,
  Music,
  Info
} from 'lucide-react';

import cockroachBg from './menangkap-kecoa/background-gamearena.webp';
import cockroachImage from './menangkap-kecoa/kecoa.png';
import tebakKataBg from '../../assets/images/intan-01.jpg';
import intanRunBg from '../../assets/images/intan-03.jpg';

const ICON_MAP = {
  Bug,
  HelpCircle,
  Zap,
  Gamepad2,
  Gamepad,
  Play,
  Users,
  Target,
  Award,
  Star,
  Flame,
  Heart,
  Music,
  Info
};

const BG_MAP = {
  cockroachBg,
  tebakKataBg,
  intanRunBg
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
    },
    purple: {
      border: 'border-purple-500/25',
      bg: 'bg-[#170624]',
      heroBg: 'from-[#120420] to-[#250a3e]',
      particles: 'bg-purple-400',
      iconText: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      button: 'bg-purple-500 hover:bg-purple-400 text-white',
      textAccent: 'text-purple-400'
    },
    emerald: {
      border: 'border-emerald-500/25',
      bg: 'bg-[#021f15]',
      heroBg: 'from-[#01140d] to-[#042d1e]',
      particles: 'bg-emerald-400',
      iconText: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      textAccent: 'text-emerald-400'
    },
    rose: {
      border: 'border-rose-500/25',
      bg: 'bg-[#20040e]',
      heroBg: 'from-[#1a020a] to-[#360416]',
      particles: 'bg-rose-400',
      iconText: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      button: 'bg-rose-500 hover:bg-rose-400 text-white',
      textAccent: 'text-rose-400'
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

// Word Guessing Clues
const WORDLE_LEVELS = [
  {
    clue: "Nama panggilan lengkap member JKT48 yang didukung Intanium",
    word: "NURINTAN",
  },
  {
    clue: "Nama resmi basis penggemar (fans club) Kak Intan",
    word: "INTANIUM",
  },
  {
    clue: "Hashtag perjalanan milestone sejarah Kak Intan di JKT48",
    word: "INTANSHININGSTAR",
  },
  {
    clue: "Slogan/program siaran suara komunitas Intanium",
    word: "DENGERINTAN",
  },
  {
    clue: "Tempat teater/pertunjukan rutin JKT48 di Jakarta",
    word: "THEATER",
  }
];

export default function GamesPage() {
  const [leaderboard, setLeaderboard] = useState([
    { username: 'Bima_Nium', score: 1442, title: 'Intanium Brave' },
    { username: 'Luthfi_G', score: 1210, title: 'Kecoa Hunter' },
    { username: 'Zaki_88', score: 980, title: 'Berani Juga' }
  ]);
  const [highScore, setHighScore] = useState(1442);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Tebak Kata Game State
  const [showTebakKataModal, setShowTebakKataModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [letterPool, setLetterPool] = useState([]);
  const [gameFeedback, setGameFeedback] = useState({ type: '', text: '' });
  const [gameScore, setGameScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Game Settings State (dynamic config from Supabase)
  const [settings, setSettings] = useState({
    featuredGameId: 'menangkap-kecoa',
    challengeCount: 100,
    challengeReward: 'Hall of Fame',
    challengeActive: true,
    games: {
      'menangkap-kecoa': { active: true, badge: 'Populer', difficulty: 'Mudah', playTime: '60 Detik' },
      'tebak-kata': { active: false, badge: 'Segera Hadir', difficulty: 'Sedang', playTime: '3 Menit' },
      'intan-run': { active: false, badge: 'Segera Hadir', difficulty: 'Sulit', playTime: 'Tanpa Batas' }
    },
    stats: {
      totalPlayers: 1254,
      totalGamesPlayed: 8420,
      avgScore: 582
    }
  });

  useEffect(() => {
    document.title = 'Arena Game Intanium | Official Community Space';

    // Fetch live scores
    getGameLeaderboard(5, 'weekly')
      .then((data) => {
        if (data && data.length > 0) {
          const sorted = data.slice(0, 3).map((item) => ({
            username: item.username,
            score: item.score,
            title: item.title || 'Kecoa Hunter'
          }));
          setLeaderboard(sorted);
          setHighScore(sorted[0].score);
        }
      })
      .catch((err) => console.error('Error loading leaderboard:', err))
      .finally(() => setLoadingLeaderboard(false));

    // Fetch settings
    getGameSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => console.error('Error loading game settings:', err));
  }, []);

  // Initialize Tebak Kata Level
  const initTebakKata = (levelIndex) => {
    if (levelIndex >= WORDLE_LEVELS.length) {
      setQuizFinished(true);
      return;
    }
    const current = WORDLE_LEVELS[levelIndex];
    setPlacedLetters(Array(current.word.length).fill(null));
    setGameFeedback({ type: '', text: '' });

    // Scramble letters and add random extra letters
    const letters = current.word.split('');
    const extraPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    while (letters.length < current.word.length + 3) {
      const rand = extraPool[Math.floor(Math.random() * extraPool.length)];
      if (!letters.includes(rand)) {
        letters.push(rand);
      }
    }

    // Shuffle
    const shuffled = letters
      .map((char, index) => ({ char, sort: Math.random(), originalIndex: index }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ({ char: item.char, id: crypto.randomUUID(), used: false }));

    setLetterPool(shuffled);
  };

  const handleOpenTebakKata = () => {
    setCurrentLevel(0);
    setGameScore(0);
    setQuizFinished(false);
    initTebakKata(0);
    setShowTebakKataModal(true);
  };

  const handleSelectLetter = (poolItem) => {
    if (poolItem.used) return;

    // Find first empty index in placedLetters
    const emptyIndex = placedLetters.indexOf(null);
    if (emptyIndex === -1) return; // Full

    const newPlaced = [...placedLetters];
    newPlaced[emptyIndex] = { char: poolItem.char, poolId: poolItem.id };
    setPlacedLetters(newPlaced);

    setLetterPool(letterPool.map(item => item.id === poolItem.id ? { ...item, used: true } : item));
    setGameFeedback({ type: '', text: '' });
  };

  const handleRemoveLetter = (placedIndex) => {
    const item = placedLetters[placedIndex];
    if (!item) return;

    const newPlaced = [...placedLetters];
    newPlaced[placedIndex] = null;
    setPlacedLetters(newPlaced);

    setLetterPool(letterPool.map(poolItem => poolItem.id === item.poolId ? { ...poolItem, used: false } : poolItem));
    setGameFeedback({ type: '', text: '' });
  };

  const handleCheckAnswer = () => {
    const current = WORDLE_LEVELS[currentLevel];
    const answer = placedLetters.map(item => item?.char ?? '').join('');

    if (answer.length < current.word.length) {
      setGameFeedback({ type: 'error', text: 'Lengkapi semua huruf terlebih dahulu!' });
      return;
    }

    if (answer === current.word) {
      setGameFeedback({ type: 'success', text: 'Hebat! Jawabanmu benar! 🎉' });
      setGameScore(prev => prev + 100);

      setTimeout(() => {
        const next = currentLevel + 1;
        setCurrentLevel(next);
        initTebakKata(next);
      }, 1600);
    } else {
      setGameFeedback({ type: 'error', text: 'Jawaban kurang tepat. Coba susun ulang!' });
    }
  };

  const handleResetLevel = () => {
    initTebakKata(currentLevel);
  };

  const featuredGameId = settings.featuredGameId || 'menangkap-kecoa';
  const featuredGame = settings.games[featuredGameId] || {
    title: 'Menangkap Kecoa',
    description: 'Uji kecepatan tanganmu menangkap kecoa sebelum mereka kabur.',
    badge: 'Populer',
    theme: 'amber',
    link: '/games/menangkap-kecoa',
    active: true,
    emoji: '🐜',
    icon: 'Bug',
    difficulty: 'Mudah',
    playTime: '60 Detik'
  };
  const heroTheme = getThemeStyles(featuredGame.theme || 'amber');

  const gamesList = Object.keys(settings.games).map((id) => ({
    id,
    ...settings.games[id],
  }));

  return (
    <div className="relative min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <h1 className="sr-only">Arena Game Intanium - Ruang Komunitas Resmi</h1>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/5 to-[#170C79]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/5 to-indigo-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">

        {/* ================= 1. FEATURED GAME HERO SECTION ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: PREMIUM_EASE }}
          className={`relative bg-gradient-to-br ${heroTheme.heroBg} rounded-[2.5rem] border ${heroTheme.border} shadow-2xl overflow-hidden min-h-[460px] flex flex-col justify-between`}
        >
          {/* Neon Grid Backplate */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          <FloatingParticles count={20} color={heroTheme.particles} containerHeight={460} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-10 lg:p-12 relative z-10 items-center">

            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-widest animate-pulse ${featuredGame.theme === 'amber' ? 'text-[#fff18a]' : heroTheme.textAccent}`}>
                {featuredGame.badge || 'GAME UNGGULAN'}
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                {featuredGame.title}
              </h2>

              <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed max-w-xl">
                {featuredGame.description}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-5 max-w-lg">
                {featuredGameId === 'menangkap-kecoa' ? (
                  <div>
                    <p className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Rekor Hari Ini</p>
                    <p className="text-lg sm:text-xl font-extrabold text-amber-400 mt-0.5">
                      {loadingLeaderboard ? '...' : highScore.toLocaleString('id-ID')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Kesulitan</p>
                    <p className={`text-lg sm:text-xl font-extrabold mt-0.5 ${heroTheme.textAccent}`}>
                      {featuredGame.difficulty || 'Sedang'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Pemain Minggu Ini</p>
                  <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    <NumberCounter value={settings.stats.totalPlayers} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Durasi Main</p>
                  <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                    {featuredGame.playTime || '-'}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                {!featuredGame.active ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-3 bg-white/10 text-white/50 border border-white/15 transition-all duration-300 font-extrabold text-base px-8 py-4 rounded-2xl cursor-not-allowed"
                  >
                    <Lock className="size-4.5" /> Segera Hadir
                  </button>
                ) : featuredGame.link?.startsWith('modal:') ? (
                  <button
                    onClick={() => {
                      if (featuredGame.link === 'modal:tebak-kata') {
                        handleOpenTebakKata();
                      }
                    }}
                    className={`inline-flex items-center gap-3 ${heroTheme.button} transition-all duration-300 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg hover:scale-105 cursor-pointer`}
                  >
                    <Play className="size-4.5 fill-current" /> Main Sekarang <ChevronRight className="size-5" />
                  </button>
                ) : (
                  <Link
                    to={featuredGame.link || '#'}
                    className={`inline-flex items-center gap-3 ${heroTheme.button} transition-all duration-300 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg hover:scale-105`}
                  >
                    <Play className="size-4.5 fill-current" /> Main Sekarang <ChevronRight className="size-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Visual Column (Interactive floating roach or dynamic emoji/orb) */}
            <div className="lg:col-span-5 h-[260px] lg:h-[320px] relative flex items-center justify-center pointer-events-none">

              {/* Glowing Background Radial */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)] animate-pulse" />

              {featuredGameId === 'menangkap-kecoa' ? (
                <>
                  {/* Giant Roach Floating Image */}
                  <motion.div
                    animate={{
                      y: [0, -12, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-48 sm:w-56 relative z-10 filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.5)]"
                  >
                    <img src={cockroachImage} alt="Kecoa Raksasa" className="w-full h-auto object-contain" />
                  </motion.div>

                  {/* Floating Score Numbers */}
                  <motion.div
                    initial={{ y: 50, x: -30, opacity: 0 }}
                    animate={{ y: -120, x: -70, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: 0.2 }}
                    className="absolute font-black text-amber-400 text-2xl tracking-tight z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  >
                    +100
                  </motion.div>
                  <motion.div
                    initial={{ y: 80, x: 50, opacity: 0 }}
                    animate={{ y: -80, x: 80, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 1.2 }}
                    className="absolute font-black text-purple-400 text-lg tracking-tight z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  >
                    +50
                  </motion.div>
                  <motion.div
                    initial={{ y: 110, x: -10, opacity: 0 }}
                    animate={{ y: -60, x: 20, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 2.0 }}
                    className="absolute font-black text-white text-base tracking-tight z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  >
                    +20
                  </motion.div>
                </>
              ) : (
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 4, -4, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-[7.5rem] filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)] relative z-10"
                >
                  {featuredGame.emoji || '🎮'}
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>

        {/* ================= 2. LIVE COMMUNITY STATISTICS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={Trophy}
            title="Rekor Hari Ini"
            value={loadingLeaderboard ? '1.442' : highScore}
            color="text-amber-500 bg-amber-500/5"
          />
          <StatCard
            icon={Users}
            title="Total Pemain"
            value={settings.stats.totalPlayers}
            color="text-indigo-500 bg-indigo-500/5"
          />
          <StatCard
            icon={Gamepad}
            title="Game Dimainkan"
            value={settings.stats.totalGamesPlayed}
            color="text-cyan-500 bg-cyan-500/5"
          />
          <StatCard
            icon={Target}
            title="Rata-rata Skor"
            value={settings.stats.avgScore}
            color="text-purple-500 bg-purple-500/5"
          />
        </div>

        {/* ================= 3. GAME COLLECTION SECTION (ASYMMETRICAL) ================= */}
        <div className="space-y-6 text-left">
          <div>
            <h2 className="text-3xl font-black text-[#170C79] tracking-tight flex items-center gap-2">
              Arena Game Intanium
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih permainan favoritmu dan tantang anggota komunitas lainnya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Dynamic Game Cards */}
            {gamesList.map((game) => {
              const gameTheme = getThemeStyles(game.theme || 'amber');
              const IconComponent = ICON_MAP[game.icon] || Gamepad;
              const isPresetBg = ['cockroachBg', 'tebakKataBg', 'intanRunBg'].includes(game.bgImage);
              const bgUrl = isPresetBg ? BG_MAP[game.bgImage] : (game.bgImage || '');

              return (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ duration: 0.3, ease: PREMIUM_EASE }}
                  className={`group relative flex flex-col justify-between rounded-[2rem] border ${gameTheme.border} ${gameTheme.bg} text-white shadow-xl overflow-hidden h-[430px] ${game.layoutSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
                    }`}
                >
                  {/* Background Image & Overlay */}
                  {bgUrl ? (
                    <img
                      src={bgUrl}
                      alt={game.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-550 group-hover:scale-105 ${!game.active ? 'filter grayscale opacity-20 blur-[2px]' : 'opacity-40 group-hover:opacity-50'
                        }`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />
                  <FloatingParticles count={game.layoutSpan === 2 ? 15 : 8} color={gameTheme.particles} containerHeight={430} />

                  {/* Card Header */}
                  <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md ${gameTheme.iconText}`}>
                      <IconComponent className="size-6 animate-pulse" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide border backdrop-blur-md ${game.active
                      ? `${gameTheme.badge}`
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}>
                      {game.active ? <Sparkles className="size-3" /> : <Lock className="size-3" />}
                      {game.badge || (game.active ? 'Aktif' : 'Segera Hadir')}
                    </span>
                  </div>

                  {/* Bottom Content & Meta Info (Slides up slightly on hover) */}
                  <div className="relative z-10 p-6 sm:p-8 space-y-6 transition-transform duration-500 ease-in-out group-hover:-translate-y-16">
                    <div className="space-y-2 text-left">
                      <h3 className="text-3xl font-black text-white tracking-tight leading-tight">{game.title}</h3>

                      <div className={`flex flex-wrap items-center gap-3 text-[10px] font-bold ${gameTheme.iconText} uppercase tracking-widest w-max`}>
                        <span>Kesulitan: {game.difficulty || 'Sedang'}</span>
                        <span>&bull;</span>
                        <span>Durasi: {game.playTime || '5 Menit'}</span>
                      </div>

                      <p className="text-sm text-purple-200/80 leading-relaxed max-w-xl pt-2">
                        {game.description}
                      </p>
                    </div>

                    {/* Special stats details row for core cockroach game to retain identity */}
                    {game.id === 'menangkap-kecoa' && (
                      <div className="flex gap-6 border-t border-white/10 pt-4 text-left max-w-sm">
                        <div>
                          <span className="text-[10px] font-bold text-white/55 uppercase tracking-wider block">Rekor Terbaik</span>
                          <span className={`text-base font-black ${gameTheme.iconText}`}>{loadingLeaderboard ? '...' : highScore}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white/55 uppercase tracking-wider block">Pemain Aktif</span>
                          <span className="text-base font-black text-white">{settings.stats.totalPlayers}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="absolute -bottom-20 left-0 right-0 p-6 sm:p-8 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100 z-20">
                    {game.active ? (
                      game.link?.startsWith('modal:') ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (game.link === 'modal:tebak-kata') handleOpenTebakKata();
                          }}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm ${gameTheme.button} transition-all duration-305 cursor-pointer`}
                        >
                          <Play className="size-3.5 fill-current" /> Main Sekarang <ArrowRight className="size-4 animate-bounce-horizontal" />
                        </button>
                      ) : (
                        <Link
                          to={game.link || '#'}
                          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm ${gameTheme.button} transition-all duration-305`}
                        >
                          <Play className="size-3.5 fill-current" /> Main Sekarang <ArrowRight className="size-4" />
                        </Link>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-black text-sm bg-slate-900/60 text-slate-500 border border-slate-800/40 backdrop-blur-sm cursor-not-allowed"
                      >
                        <Lock className="size-3.5" /> Segera Hadir
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* ================= 4. LEADERBOARD PREVIEW ================= */}
            <div className="group relative md:col-span-2 flex flex-col justify-between rounded-[2rem] border border-[#170C79]/10 bg-white/85 backdrop-blur-md p-6 sm:p-8 shadow-xl">
              <div className="space-y-4 text-left w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#170C79] flex items-center gap-2">
                    🏆 Klasemen Mingguan
                  </h3>
                  <span className="text-[10px] font-bold bg-[#170C79]/5 border border-[#170C79]/10 text-[#170C79] rounded-full px-3 py-1">
                    Klasemen Live
                  </span>
                </div>

                <div className="divide-y divide-[#170C79]/5">
                  {leaderboard.map((item, index) => {
                    const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                    const rankColor = index === 0 ? 'bg-amber-100 border-amber-300 text-amber-800' : index === 1 ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-orange-50 border-orange-200 text-orange-800';
                    return (
                      <div key={index} className="flex items-center justify-between py-3.5 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black flex h-8 w-8 items-center justify-center rounded-xl border ${rankColor}`}>
                            {rankMedal}
                          </span>
                          <div>
                            <p className="text-sm font-black text-[#170C79]">{item.username}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#170C79]">{item.score.toLocaleString('id-ID')}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#170C79]/5 mt-4">
                <Link
                  to={ROUTES.GAME_MENANGKAP_KECOA}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-extrabold text-sm border border-[#170C79]/10 text-[#170C79] hover:bg-[#170C79] hover:text-white transition-all duration-300"
                >
                  Lihat Papan Skor Utama <ArrowRight className="size-4 animate-bounce-horizontal" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= TEBAK KATA MINI GAME MODAL ================= */}
      <AnimatePresence>
        {showTebakKataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTebakKataModal(false)}
              className="absolute inset-0 bg-[#070425]/80 backdrop-blur-sm"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/25 rounded-3xl overflow-hidden shadow-2xl z-10 text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950">
                <div className="flex items-center gap-2">
                  <HelpCircle className="size-5 text-cyan-400" />
                  <span className="font-extrabold text-sm tracking-tight">Mini Game: Tebak Kata Intanium</span>
                </div>
                <button
                  onClick={() => setShowTebakKataModal(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 shrink-0"
                  aria-label="Tutup kuis tebak kata"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Game Area */}
              <div className="p-6 space-y-6">
                {!quizFinished ? (
                  <>
                    {/* Level & Clue */}
                    <div className="space-y-2 text-center">
                      <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                        <span>Level {currentLevel + 1} / {WORDLE_LEVELS.length}</span>
                        <span>Skor: {gameScore} Pts</span>
                      </div>

                      <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
                        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest text-left">Petunjuk Clue:</p>
                        <p className="text-sm font-semibold text-slate-200 text-left mt-1.5 leading-relaxed">
                          "{WORDLE_LEVELS[currentLevel].clue}"
                        </p>
                      </div>
                    </div>

                    {/* Word Slots */}
                    <div className="flex flex-wrap justify-center gap-2 py-4">
                      {placedLetters.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleRemoveLetter(index)}
                          aria-label={slot ? `Hapus huruf ${slot.char} dari posisi ${index + 1}` : `Slot huruf kosong pada posisi ${index + 1}`}
                          className={`w-11 h-11 rounded-xl border font-black text-lg flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${slot
                            ? 'border-cyan-400 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/50 cursor-pointer'
                            : 'border-white/10 bg-slate-950/40 text-transparent cursor-default'
                            }`}
                        >
                          {slot?.char ?? ''}
                        </button>
                      ))}
                    </div>

                    {/* Letter Pool */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        Pilihan Huruf Acak:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {letterPool.map((item) => (
                          <button
                            key={item.id}
                            disabled={item.used}
                            onClick={() => handleSelectLetter(item)}
                            aria-label={`Pilih huruf ${item.char}`}
                            className={`w-11 h-11 rounded-lg border font-black text-sm flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${item.used
                              ? 'bg-slate-800 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
                              : 'bg-slate-850 border-white/15 text-white hover:bg-slate-700 hover:border-cyan-500/50 hover:scale-105 active:scale-95 cursor-pointer'
                              }`}
                          >
                            {item.char}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons inside quiz */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handleResetLevel}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-bold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                      >
                        <RefreshCw className="size-4" /> Reset Ulang
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 bg-cyan-500 text-black hover:bg-cyan-400 font-black text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        <Check className="size-4" /> Periksa Jawaban
                      </button>
                    </div>

                    {/* Answer Feedback Banner */}
                    <AnimatePresence>
                      {gameFeedback.text && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`p-3 rounded-xl text-center text-xs font-bold ${gameFeedback.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                        >
                          {gameFeedback.text}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  // Level Completed State
                  <div className="py-6 text-center space-y-6">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-bounce">
                      <Award className="size-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">Quiz Selesai! 🎉</h3>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Luar biasa! Kamu berhasil menjawab semua kuis tebak kata komunitas Intanium dengan skor sempurna.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl max-w-xs mx-auto text-center border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skor Akhir Kamu</p>
                      <p className="text-3xl font-black text-cyan-400 mt-1">{gameScore} Pts</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenTebakKata()}
                      className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold px-6 py-3 rounded-xl text-sm transition-colors"
                    >
                      <RefreshCw className="size-4" /> Main Lagi
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Compact Stats Card Helper
function StatCard({ icon: Icon, title, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#170C79]/8 shadow-md hover:shadow-lg transition-all"
    >
      <div className={`p-3 rounded-xl shrink-0 ${color}`}>
        <Icon className="size-5" />
      </div>
      <div className="text-left leading-tight">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-lg sm:text-xl font-black text-[#170C79] mt-0.5">
          <NumberCounter value={value} />
        </p>
      </div>
    </motion.div>
  );
}
