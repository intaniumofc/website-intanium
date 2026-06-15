import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bug,
  Clock3,
  Crown,
  Gamepad2,
  Medal,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { getGameLeaderboard, submitGameScore } from './gameService';
import { getBadges, getComboText, getPerformanceTitle } from './gameData';
import { calculatePoint, shareScore } from './gameUtils';
import { useGameLoop } from './useGameLoop';
import LeaderboardCard from './LeaderboardCard';
import cockroachImage from './kecoa.webp';
import flyingCockroachImage from './kecoa-biasa-terbang.webp';
import goldenFlyingCockroachImage from './kecoa-emas-terbang.webp';
import './MenangkapKecoaPage.css';

const PLAYER_KEY = 'menangkap-kecoa-username';
const HIGH_SCORE_KEY = 'menangkap-kecoa-high-score';

function Roach({ cockroach, onCatch }) {
  const isFlightCapable = cockroach.canFly;
  const activeImage = cockroach.state === 'fly'
    ? cockroach.flyingVariant === 'golden'
      ? goldenFlyingCockroachImage
      : flyingCockroachImage
    : cockroachImage;
  return (
    <button
      type="button"
      className={`roach-target roach-target--${cockroach.type} roach-state--${cockroach.state} ${isFlightCapable ? 'roach-target--flight-capable' : ''} absolute grid place-items-center`}
      style={{
        left: cockroach.x,
        top: cockroach.y,
        '--move-x': `${cockroach.moveX}px`,
        '--move-y': `${cockroach.moveY}px`,
        '--roach-angle': `${cockroach.rotation}deg`,
        '--roach-scale': cockroach.scale,
        '--crawl-duration': `${cockroach.lifetimeMs}ms`,
        '--scuttle-duration': `${cockroach.scuttleDurationMs}ms`,
      }}
      onPointerDown={(event) => onCatch(cockroach, event)}
      aria-label={`Tangkap ${cockroach.label}`}
    >
      {cockroach.state === 'fly' && <span className="wing-blur wing-left" />}
      {cockroach.state === 'fly' && <span className="wing-blur wing-right" />}
      <div
        className="roach-visual"
        style={isFlightCapable ? { '--flight-angle': `${cockroach.rotation}deg` } : undefined}
      >
        <img
          className={`roach-image ${cockroach.state === 'fly' ? 'roach-image--flying' : ''}`}
          src={activeImage}
          alt=""
          draggable="false"
        />
      </div>
      {cockroach.state === 'panic' && (
        <span className="roach-panic-warning">Waduh, dia mau terbang!</span>
      )}
    </button>
  );
}

function HitEffect({ effect }) {
  return (
    <div
      className={`roach-hit-effect ${effect.golden ? 'roach-hit-effect--golden' : ''}`}
      style={{ left: effect.x, top: effect.y }}
      aria-hidden="true"
    >
      <span className="roach-hit-points">+{effect.points}</span>
      <span className="roach-hit-bonk">{effect.message || 'BONK!'}</span>
      <span className="roach-poof roach-poof--1" />
      <span className="roach-poof roach-poof--2" />
      <span className="roach-poof roach-poof--3" />
      <span className="roach-poof roach-poof--4" />
      <span className="roach-poof roach-poof--5" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#170C79]/10 bg-white/85 p-3 text-center shadow-sm">
      <Icon className="mx-auto mb-1 size-4 text-[#170C79]" />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-black text-[#170C79]">{value}</p>
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
        />
      </div>
    </div>
  );
}

export default function MenangkapKecoaPage() {
  const areaRef = useRef(null);
  const submittedRef = useRef(false);
  const { state, start, catchCockroach } = useGameLoop(areaRef);
  const [username, setUsername] = useState(() => localStorage.getItem(PLAYER_KEY) || '');
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem(HIGH_SCORE_KEY) || 0));
  const [scores, setScores] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [leaderboardState, setLeaderboardState] = useState({ open: false, loading: false, error: false });
  const [resultUrl, setResultUrl] = useState('');
  const [hitEffects, setHitEffects] = useState([]);
  const [nameError, setNameError] = useState('');

  const loadLeaderboard = useCallback(async (selectedPeriod) => {
    setLeaderboardState((current) => ({ ...current, loading: true, error: false }));
    try {
      setScores(await getGameLeaderboard(20, selectedPeriod));
    } catch (error) {
      console.error('Gagal memuat leaderboard game', error);
      setLeaderboardState((current) => ({ ...current, error: true }));
    } finally {
      setLeaderboardState((current) => ({ ...current, loading: false }));
    }
  }, []);

  const openLeaderboard = () => {
    setLeaderboardState((current) => ({ ...current, open: true }));
    loadLeaderboard(period);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    loadLeaderboard(newPeriod);
  };


  const handleStart = () => {
    const cleanName = username.trim().slice(0, 24);
    if (cleanName.length < 2) {
      setNameError('Nama pemain wajib diisi minimal 2 karakter.');
      return;
    }
    setNameError('');
    localStorage.setItem(PLAYER_KEY, cleanName);
    setUsername(cleanName);
    setHighScore(Number(localStorage.getItem(HIGH_SCORE_KEY) || 0));
    setResultUrl('');
    setHitEffects([]);
    start();
  };

  const handleCatch = (cockroach, event) => {
    const area = areaRef.current;
    if (!area || state.status !== 'playing') return;

    event.preventDefault();
    const bounds = area.getBoundingClientRect();
    const effect = {
      id: crypto.randomUUID(),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      points: calculatePoint(cockroach.basePoint, state.combo),
      golden: cockroach.type === 'golden',
      message: cockroach.type === 'flying'
        ? ['Anti panik!', 'Kecoa terbang ketangkap!', 'Nice catch!'][Math.floor(Math.random() * 3)]
        : null,
    };
    if (cockroach.type === 'flying') effect.points = cockroach.basePoint;

    catchCockroach(cockroach);
    setHitEffects((current) => [...current, effect]);
    window.setTimeout(() => {
      setHitEffects((current) => current.filter((item) => item.id !== effect.id));
    }, 720);

    area.animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: 'translate3d(-2px, 1px, 0)' },
        { transform: 'translate3d(2px, -1px, 0)' },
        { transform: 'translate3d(-1px, 1px, 0)' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 150, easing: 'ease-out' },
    );
  };

  useEffect(() => {
    if (state.status === 'playing') {
      submittedRef.current = false;
      return;
    }
    if (state.status !== 'ended' || submittedRef.current) return;

    submittedRef.current = true;
    if (state.score > highScore) {
      localStorage.setItem(HIGH_SCORE_KEY, String(state.score));
    }

    submitGameScore({
      username,
      score: state.score,
      caughtCount: state.caughtCount,
      maxCombo: state.maxCombo,
      title: getPerformanceTitle(state.score),
    })
      .then((data) => {
        if (data?.id) setResultUrl(`${window.location.origin}/games/menangkap-kecoa/result/${data.id}`);
      })
      .catch((error) => console.error('Gagal menyimpan skor game', error));
  }, [state, username, highScore]);

  const badges = getBadges(state);
  const isNewHighScore = state.status === 'ended' && state.score > highScore;
  const displayedHighScore = Math.max(highScore, state.status === 'ended' ? state.score : 0);

  return (
    <div className="game-page-shell mx-auto pb-10">
      <header className="game-console-header">
        <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#170C79]/65">
          <Gamepad2 className="size-3.5" /> Intanium Mini Game
        </span>
        <h1 className="mt-2 text-3xl font-black text-[#170C79] sm:text-4xl">Menangkap Kecoa</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
          Uji keberanianmu. Tangkap sebanyak mungkin dalam 60 detik dan rebut posisi teratas Intanium.
        </p>
      </header>

      <div className="game-console-shell">
      <div className="game-console-layout">
        <section className="game-arena-column">
          {state.status === 'idle' ? (
            <div className="game-start-arena game-main-arena relative grid min-h-[520px] place-items-center overflow-hidden rounded-[1.5rem] px-5 py-10 text-center text-white">
              <div className="game-start-panel relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/15 px-5 py-8 sm:px-8">
                <div className="game-start-hero mx-auto grid size-28 place-items-center">
                  <img src={cockroachImage} alt="Kecoa" className="game-start-hero-roach w-24" />
                </div>
                <h2 className="mt-6 text-3xl font-black">Berani seperti Intan?</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Buktikan keberanianmu dalam 60 detik. Tangkap kecoa, jaga combo, dan raih posisi teratas di Intanium.
                </p>
                <p className="mt-3 text-[10px] font-bold -[0.18em] text-white/45">
                &bull; 60 detik &bull; Skor tertinggi menang
                </p>
                <label className="mt-7 block text-left text-xs font-bold uppercase tracking-wider text-white/70" htmlFor="game-username">
                  Nama pemain
                </label>
                <input
                  id="game-username"
                  value={username}
                  maxLength={24}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (event.target.value.trim().length >= 2) setNameError('');
                  }}
                  onKeyDown={(event) => event.key === 'Enter' && handleStart()}
                  onBlur={(event) => {
                    if (event.target.value.trim().length > 0 && event.target.value.trim().length < 2) {
                      setNameError('Nama pemain wajib diisi minimal 2 karakter.');
                    }
                  }}
                  placeholder="Nama kamu"
                  className={`mt-2 w-full rounded-xl border bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:bg-white/15 ${nameError ? 'border-red-300/80' : 'border-white/20 focus:border-white/60'}`}
                />
                {nameError && <p className="mt-2 text-left text-xs font-semibold text-red-200">{nameError}</p>}
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={username.trim().length < 2}
                  className="game-start-button mt-4 w-full rounded-xl bg-white px-5 py-3 font-extrabold text-[#170C79] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mulai Menangkap
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-3 gap-2 sm:gap-3">
                <StatCard icon={Clock3} label="Timer" value={`${state.timeLeft}s`} />
                <StatCard icon={Target} label="Score" value={state.score.toLocaleString('id-ID')} />
                <StatCard icon={Sparkles} label="Combo" value={`${state.combo}x`} />
              </div>
              <p className="mb-2 h-5 text-center text-xs font-extrabold text-amber-600">{getComboText(state.combo)}</p>
              <div ref={areaRef} className={`roach-game-area game-main-arena relative h-[58vh] min-h-[430px] max-h-[570px] overflow-hidden rounded-[1.5rem] border border-amber-900/10 shadow-inner ${state.status === 'ended' ? 'roach-game-area--ended' : ''}`}>
                {state.cockroaches.map((cockroach) => (
                  <Roach key={cockroach.id} cockroach={cockroach} onCatch={handleCatch} />
                ))}
                {hitEffects.map((effect) => <HitEffect key={effect.id} effect={effect} />)}
                {state.gameMessage && (
                  <div key={state.gameMessage.id} className={`game-message game-message--${state.gameMessage.tone}`}>
                    {state.gameMessage.text}
                  </div>
                )}
                {state.status === 'ended' && (
                  <div className="game-over-overlay absolute inset-0 z-10 grid place-items-center p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Game Over</p>
                      <p className="mt-2 text-sm font-extrabold text-amber-600">{getPerformanceTitle(state.score)}</p>
                      <h2 className="mt-1 text-4xl font-black text-[#170C79]">{state.score.toLocaleString('id-ID')}</h2>
                      <p className={`mt-2 text-xs font-bold ${isNewHighScore ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {isNewHighScore
                          ? 'High Score Baru!'
                          : `Belum melewati high score kamu: ${highScore.toLocaleString('id-ID')}`}
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <StatCard icon={Bug} label="Tertangkap" value={state.caughtCount} />
                        <StatCard icon={Sparkles} label="Max combo" value={`${state.maxCombo}x`} />
                      </div>
                      {badges.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {badges.map((badge) => <span key={badge} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{badge}</span>)}
                        </div>
                      )}
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <button type="button" onClick={handleStart} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#170C79] px-4 py-3 text-sm font-bold text-white">
                          <RotateCcw className="size-4" /> Main Lagi
                        </button>
                        <button type="button" onClick={() => shareScore({ ...state, resultUrl })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#170C79]/15 px-4 py-3 text-sm font-bold text-[#170C79]">
                          <Send className="size-4" /> Share Skor ke X
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="game-console-sidebar">
          <div className="game-console-side-section">
            <div className="flex items-center gap-4">
              <div className="grid size-11 shrink-0 place-items-center text-amber-500">
                <Trophy className="size-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">High score kamu</p>
                <p className="text-3xl font-black text-[#170C79]">{displayedHighScore.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button type="button" onClick={openLeaderboard} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#170C79] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#291da9]">
              <Medal className="size-4" /> Lihat Leaderboard
            </button>
          </div>

          <div className="game-console-side-section">
            <div className="flex items-center gap-3">
              <Crown className="size-6 shrink-0 text-[#170C79]" />
              <h2 className="font-black text-[#170C79]">Cara Bermain</h2>
            </div>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>1.</strong> Klik kecoa sebelum kabur.</li>
              <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>2.</strong> Jaga combo untuk pengali skor.</li>
              <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>3.</strong> Kejar kecoa emas untuk bonus 100 poin.</li>
              <li className="rounded-xl bg-[#170C79]/[0.045] px-3 py-2"><strong>4.</strong> Tangkap kecoa yang panik sebelum terbang kabur.</li>
            </ol>
          </div>
        </aside>
      </div>

      <p className="game-console-footer">
        Mini-game fanmade untuk hiburan komunitas Intanium.
      </p>
      </div>

      {leaderboardState.open && (
        <LeaderboardModal
          scores={scores}
          loading={leaderboardState.loading}
          error={leaderboardState.error}
          currentUsername={username}
          period={period}
          onPeriodChange={handlePeriodChange}
          onClose={() => setLeaderboardState((current) => ({ ...current, open: false }))}
        />
      )}
    </div>
  );
}
