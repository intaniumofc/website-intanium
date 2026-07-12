'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  ArrowLeft,
  Gem,
  Play,
  RotateCcw,
  Bomb,
  Award,
  Edit3,
  Crown,
  Users,
  Target,
  Info,
  Medal,
  X
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import CanvasScratch from './CanvasScratch';
import LeaderboardCard from '../menangkap-kecoa/LeaderboardCard';
import { getGameLeaderboard } from '../../../services/public/gameService';

// Import shared stylesheet from menangkap-kecoa to unify visual style guidelines
import '../menangkap-kecoa/MenangkapKecoaPage.css';
import './GosokIntanPage.css';

// Import Intan images
import intan01 from '../../../assets/images/intan-01.webp';
import intan02 from '../../../assets/images/intan-02.webp';
import intan03 from '../../../assets/images/intan-03.webp';
import intan04 from '../../../assets/images/intan-04.webp';
import intanNur from '../../../assets/images/Nur_Intan.webp';

const INTAN_IMAGES = [intan01, intan02, intan03, intan04, intanNur];
const PLAYER_KEY = 'menangkap-kecoa-username';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#170C79]/10 bg-white/85 p-3 text-center shadow-sm">
      <Icon className="mx-auto mb-1 size-4 text-[#170C79]" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-black text-[#170C79] truncate">{value}</p>
    </div>
  );
}

function LeaderboardModal({ scores, loading, error, currentUsername, period, onPeriodChange, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0d0745]/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-600 shadow hover:bg-slate-200"
          aria-label="Tutup papan skor"
        >
          <X className="size-5" />
        </button>
        <LeaderboardCard
          scores={scores}
          loading={loading}
          error={error}
          currentUsername={currentUsername}
          period={period}
          onPeriodChange={onPeriodChange}
          gameMode="gosok-intan"
        />
      </div>
    </div>
  );
}

export default function GosokIntanPage() {
  const [username, setUsername] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'ended'
  const [sessionId, setSessionId] = useState(null);
  const [ticketsLeft, setTicketsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [gameResult, setGameResult] = useState(''); // 'won' | 'lost'
  const [loading, setLoading] = useState(false);
  const [cells, setCells] = useState([]);
  const [revealingIndex, setRevealingIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  // Full Leaderboard states
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [leaderboardScores, setLeaderboardScores] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // Check LocalStorage and initial tickets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(PLAYER_KEY) || '';
      setUsername(savedUser);
      setNameInput(savedUser);
      if (savedUser) {
        checkTicketsToday(savedUser);
      }
    }
    loadLeaderboard();
  }, []);

  const checkTicketsToday = async (user) => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Simple pre-check by username
      const { count } = await supabase
        .from('scratch_sessions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .ilike('username', user);

      setTicketsLeft(Math.max(0, 5 - (count || 0)));
    } catch (err) {
      console.error('Error pre-checking tickets:', err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('id, username, score, created_at')
        .eq('mode', 'gosok-intan')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5);

      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const handleStartGame = async () => {
    const cleanName = nameInput.trim().slice(0, 24);
    if (cleanName.length < 2) {
      setErrorMsg('Nama wajib diisi minimal 2 karakter.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/games/scratch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Gagal memulai game.');
        setLoading(false);
        return;
      }

      // Save user to localstorage
      localStorage.setItem(PLAYER_KEY, cleanName);
      setUsername(cleanName);
      setIsEditingName(false);
      setSessionId(data.sessionId);
      setTicketsLeft(data.ticketsLeft);
      setScore(0);
      setGameResult('');
      
      // Initialize cells: grid 4x4
      const initialCells = Array(16).fill(null).map((_, index) => ({
        index,
        revealed: false,
        content: null, // 'diamond' | 'bomb'
        image: null,
      }));
      setCells(initialCells);
      setGameState('playing');
    } catch (error) {
      console.error('Error starting scratch game:', error);
      setErrorMsg('Kesalahan jaringan. Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleScratchCell = async (index) => {
    if (gameState !== 'playing' || cells[index].revealed || revealingIndex !== null) return;

    setRevealingIndex(index);
    try {
      const response = await fetch('/api/games/scratch/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, cellIndex: index }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error revealing cell:', data.error);
        setRevealingIndex(null);
        return;
      }

      // If it's a diamond, choose a random expression photo of Intan
      let cellImg = null;
      if (data.result === 'diamond') {
        cellImg = INTAN_IMAGES[Math.floor(Math.random() * INTAN_IMAGES.length)];
      }

      // Update local cells
      setCells(prev => prev.map(c => 
        c.index === index 
          ? { ...c, revealed: true, content: data.result, image: cellImg } 
          : c
      ));

      setScore(data.score);

      // Handle Game End outcomes
      if (data.status === 'won' || data.status === 'lost') {
        setGameResult(data.status);
        setTimeout(() => {
          setGameState('ended');
          loadLeaderboard();
          checkTicketsToday(username);
        }, 1200);
      }
    } catch (err) {
      console.error('Error contacting reveal API:', err);
    } finally {
      setRevealingIndex(null);
    }
  };

  const getPerformanceBadge = (finalScore) => {
    if (finalScore >= 100) return { title: 'Intanium Gem Master', emoji: '🏆', color: 'text-amber-400 border-amber-500/35 bg-amber-500/10' };
    if (finalScore >= 60) return { title: 'Intan Admirer', emoji: '💎', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    if (finalScore >= 20) return { title: 'Lucky Beginner', emoji: '⭐️', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
    return { title: 'Intanium Novice', emoji: '🎮', color: 'text-slate-400 border-white/10 bg-white/5' };
  };

  const loadLeaderboardData = async (selectedPeriod) => {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    try {
      const data = await getGameLeaderboard(20, selectedPeriod, 'gosok-intan');
      setLeaderboardScores(data);
    } catch (err) {
      console.error('Gagal memuat leaderboard game', err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const openLeaderboard = () => {
    setLeaderboardModalOpen(true);
    loadLeaderboardData(leaderboardPeriod);
  };

  const handlePeriodChange = (newPeriod) => {
    setLeaderboardPeriod(newPeriod);
    loadLeaderboardData(newPeriod);
  };

  const showWelcome = username && !isEditingName;

  return (
    <div className="game-page-shell mx-auto pb-10 relative">
      {/* Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Navigation back */}
      <div className="mb-6 text-left">
        <Link href="/games" className="inline-flex items-center gap-2 text-sm text-[#170C79] hover:text-[#2518a4] font-extrabold transition-colors">
          <ArrowLeft className="size-4" /> Kembali ke Arena Game
        </Link>
      </div>

      {/* unified console header */}
      <header className="game-console-header">
        <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#170C79]/65">
          <Gamepad2 className="size-3.5" /> Intanium Mini Game
        </span>
        <h1 className="mt-2 text-3xl font-black text-[#170C79] sm:text-4xl">Gosok Intan</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          Cari foto Kak Intan sebanyak-banyaknya di balik titik koin perak. Hindari bom peledak agar skor Anda aman!
        </p>
      </header>

        {/* unified console terminal shell layout */}
        <div className="game-console-shell">
          <div className="game-console-layout">
            
            {/* Left Main Arena Column */}
            <section className="game-arena-column">
              
              {gameState === 'start' && (
                <div className="scratch-start-arena relative grid min-h-[520px] place-items-center overflow-hidden rounded-[1.5rem] px-5 py-10 text-center text-white">
                  <AnimatePresence mode="wait">
                    {showWelcome ? (
                      /* Welcome Quick Lobby */
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="game-start-panel relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/15 px-5 py-8 sm:px-8"
                      >
                        <div className="inline-flex p-4 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl mb-4 text-cyan-400">
                          <Gem className="size-10 animate-pulse" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
                          Selamat Datang Kembali
                        </h3>
                        <div className="flex items-center justify-center gap-2 mt-2 mb-3">
                          <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                            {username}
                          </h2>
                          <button 
                            onClick={() => {
                              setIsEditingName(true);
                              setNameInput(username);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-cyan-400 transition-all cursor-pointer"
                            title="Edit nama"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
                          Sisa kuota tiket bermain harian Anda siap diaktifkan. Gosok foil logam perak dan temukan Kak Intan.
                        </p>
                        <div className="my-5 p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Sisa Tiket:</span>
                          <span className={`text-base font-black ${ticketsLeft > 1 ? 'text-cyan-400' : 'text-rose-400'}`}>{ticketsLeft} / 5</span>
                        </div>
                        <button
                          disabled={loading || ticketsLeft <= 0}
                          onClick={handleStartGame}
                          className="game-start-button mt-2 w-full rounded-xl bg-white px-5 py-3.5 font-extrabold text-[#170C79] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {loading ? 'Memuat Sesi...' : ticketsLeft <= 0 ? 'Tiket Bermain Habis' : 'Mulai Menggosok'}
                        </button>
                      </motion.div>
                    ) : (
                      /* Name Input Form */
                      <motion.div
                        key="name-form"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="game-start-panel relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/15 px-5 py-8 sm:px-8"
                      >
                        <div className="inline-flex p-4 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl mb-4 text-cyan-400">
                          <Gamepad2 className="size-10 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black">Identitas Pemain</h2>
                        <p className="text-xs text-white/70 mt-2 max-w-xs mx-auto">
                          Masukkan nama Anda terlebih dahulu untuk memulai mencatat rekor di papan peringkat Arena.
                        </p>
                        <div className="space-y-2 text-left my-5">
                          <label className="block text-[10px] font-extrabold uppercase text-white/55 tracking-wider">
                            Nama Pemain
                          </label>
                          <input
                            type="text"
                            placeholder="Masukkan nama/panggilan..."
                            value={nameInput}
                            onChange={(e) => {
                              setNameInput(e.target.value);
                              if (e.target.value.trim().length >= 2) setErrorMsg('');
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                            maxLength={24}
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:bg-white/15 focus:border-white/60"
                          />
                          {errorMsg && (
                            <p className="text-red-300 text-xs font-semibold text-left">{errorMsg}</p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          {username && (
                            <button
                              onClick={() => {
                                setIsEditingName(false);
                                setNameInput(username);
                              }}
                              className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-extrabold text-sm transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={loading || nameInput.trim().length < 2}
                            onClick={handleStartGame}
                            className="game-start-button flex-grow rounded-xl bg-white px-5 py-3 font-extrabold text-[#170C79] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Konfirmasi
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="space-y-4">
                  {/* Playing HUD */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <StatCard icon={Users} label="Pemain" value={username} />
                    <StatCard icon={Target} label="Score" value={`${score} Pts`} />
                    <StatCard icon={Gamepad2} label="Sisa Tiket" value={`${ticketsLeft} Sesi`} />
                  </div>

                  {/* Game Arena Box */}
                  <div className="scratch-play-area relative h-[58vh] min-h-[430px] max-h-[570px] rounded-[1.5rem] p-6 sm:p-8 flex items-center justify-center shadow-inner">
                    <motion.div 
                      animate={gameResult === 'lost' ? {
                        x: [0, -12, 12, -12, 12, -6, 6, 0],
                        y: [0, 6, -6, 6, -6, 3, -3, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md w-full aspect-square justify-center items-center relative z-10"
                    >
                      {cells.map((cell) => (
                        <div key={cell.index} className="scratch-cell-wrapper aspect-square relative rounded-full overflow-hidden bg-slate-950 border border-white/5 shadow-inner flex items-center justify-center">
                          {/* Render reveal content */}
                          {cell.revealed && (
                            <motion.div 
                              initial={{ scale: 0.3, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                              className="w-full h-full flex items-center justify-center relative animate-fade-in"
                            >
                              {cell.content === 'diamond' && (
                                <>
                                  {cell.image && (
                                    <img 
                                      src={cell.image.src || cell.image} 
                                      alt="Intan" 
                                      className="w-full h-full object-cover"
                                      draggable="false"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-cyan-950/20 border border-cyan-400 rounded-full" />
                                  <div className="absolute top-1 right-1 text-cyan-300">
                                    <Sparkles className="size-4 animate-bounce" />
                                  </div>
                                  <div className="absolute bottom-1 left-1 text-yellow-300">
                                    <Gem className="size-3.5" />
                                  </div>
                                </>
                              )}
                              {cell.content === 'bomb' && (
                                <div className="w-full h-full bg-red-950/60 border border-red-500 flex flex-col items-center justify-center rounded-full text-red-500">
                                  <Bomb className="size-7 animate-ping absolute" />
                                  <Bomb className="size-6 z-10" />
                                  <span className="text-[8px] font-black uppercase mt-1 text-red-400">BOOM!</span>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* Masking Canvas Layer */}
                          <div className="absolute inset-0 z-20">
                            <CanvasScratch
                              width={96}
                              height={96}
                              isRevealed={cell.revealed}
                              disabled={gameResult !== ''}
                              onScratchComplete={() => handleScratchCell(cell.index)}
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                  
                  <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                    <Info className="size-3.5 text-[#170C79]" />
                    Gosok foil logam perak dengan kursor atau jari Anda hingga gambar Kak Intan terkuak.
                  </p>
                </div>
              )}

              {gameState === 'ended' && (
                <div className="scratch-start-arena relative grid min-h-[520px] place-items-center overflow-hidden rounded-[1.5rem] px-5 py-10 text-center text-white">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="game-start-panel relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/15 px-5 py-8 sm:px-8"
                  >
                    {gameResult === 'won' ? (
                      <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-4 animate-bounce">
                        <Award className="size-12" />
                      </div>
                    ) : (
                      <div className="inline-flex p-4 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 mb-4 animate-pulse">
                        <Bomb className="size-12" />
                      </div>
                    )}

                    <h3 className="text-3xl font-black">
                      {gameResult === 'won' ? 'MISI SELESAI! 🎉' : 'AKSES TERPUTUS! 💥'}
                    </h3>
                    
                    <p className="text-xs text-white/70 mt-2 leading-relaxed">
                      {gameResult === 'won' 
                        ? 'Luar biasa! Anda berhasil mengamankan semua foto Kak Intan tanpa mengenai jebakan bom!' 
                        : 'Sensor mendeteksi ledakan bom peledak di dalam salah satu grid.'}
                    </p>

                    {/* Score summary panel */}
                    <div className="my-5 p-5 bg-black/40 rounded-2xl border border-white/5 max-w-xs mx-auto">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Skor Akhir</p>
                      <p className="text-4xl font-black text-cyan-400 mt-1">{score} Pts</p>

                      <div className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-bold border rounded-lg py-1.5 px-3 bg-white/5 border-white/10 ${getPerformanceBadge(score).color}`}>
                        <span>Gelar:</span>
                        <span>
                          {getPerformanceBadge(score).emoji} {getPerformanceBadge(score).title}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid gap-2 sm:grid-cols-2 mt-6">
                      <button
                        onClick={() => setGameState('start')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white cursor-pointer hover:bg-white/5 transition"
                      >
                        Kembali ke Lobby
                      </button>
                      <button
                        disabled={ticketsLeft <= 0}
                        onClick={handleStartGame}
                        className="game-start-button inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#170C79] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw className="size-4" /> {ticketsLeft <= 0 ? 'Tiket Habis' : 'Main Lagi'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </section>

            {/* Right Side Sidebar Column */}
            <aside className="game-console-sidebar">
              {/* High Score / Stats */}
              <div className="game-console-side-section text-left">
                <div className="flex items-center gap-4">
                  <div className="grid size-11 shrink-0 place-items-center text-amber-500">
                    <Trophy className="size-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Poin Tertinggi</p>
                    <p className="text-3xl font-black text-[#170C79]">
                      {leaderboard.length > 0 ? leaderboard[0].score.toLocaleString('id-ID') : '0'}
                    </p>
                  </div>
                </div>
                {/* Lihat Leaderboard full modal button */}
                <button 
                  type="button" 
                  onClick={openLeaderboard} 
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#170C79] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#291da9] cursor-pointer"
                >
                  <Medal className="size-4" /> Lihat Leaderboard
                </button>
              </div>

              {/* Cara Bermain */}
              <div className="game-console-side-section text-left">
                <div className="flex items-center gap-3">
                  <Crown className="size-6 shrink-0 text-[#170C79]" />
                  <h2 className="font-black text-[#170C79]">Cara Bermain</h2>
                </div>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 font-medium">
                  <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>1.</strong> Gosok foil logam perak koin pada bulatan.</li>
                  <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>2.</strong> Setiap foto Kak Intan menambah +10 poin.</li>
                  <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>3.</strong> Hati-hati! Jika mengenai bom, game berakhir seketika.</li>
                  <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>4.</strong> Gosok semua 12 foto Kak Intan untuk kemenangan mutlak!</li>
                </ol>
              </div>

              {/* Small Top Score Leaderboard Preview inside sidebar */}
              {leaderboard.length > 0 && (
                <div className="game-console-side-section text-left border-t border-[#170C79]/10">
                  <h2 className="font-black text-[#170C79] flex items-center gap-1.5">
                    <Trophy className="size-5" /> Top Skor
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    {leaderboard.map((item, idx) => (
                      <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-[#170C79]/5">
                        <span className="font-bold text-slate-300">{idx + 1}. {item.username}</span>
                        <span className="font-black text-cyan-500">{item.score} Pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <p className="game-console-footer">
            Mini-game fanmade untuk hiburan komunitas Intanium.
          </p>
        </div>

      {/* Full Leaderboard Modal Overlay */}
      {leaderboardModalOpen && (
        <LeaderboardModal
          scores={leaderboardScores}
          loading={leaderboardLoading}
          error={leaderboardError}
          currentUsername={username}
          period={leaderboardPeriod}
          onPeriodChange={handlePeriodChange}
          onClose={() => setLeaderboardModalOpen(false)}
        />
      )}
    </div>
  );
}
