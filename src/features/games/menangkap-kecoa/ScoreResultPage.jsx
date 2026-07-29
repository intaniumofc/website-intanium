'use client';

import { useEffect, useState } from 'react';
import { Bug, Gamepad2, Send, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ROUTES } from '../../../lib/constants';
import { getGameScore } from '../../../services/public/gameService';
import { shareScore } from './gameUtils';

export default function ScoreResultPage() {
  const { scoreId } = useParams();
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGameScore(scoreId)
      .then(setScore)
      .catch(() => setScore(null))
      .finally(() => setLoading(false));
  }, [scoreId]);

  return (
    <div className="mx-auto grid min-h-[65vh] max-w-xl place-items-center py-8">
      <div className="w-full rounded-[2rem] border border-[rgba(0,0,0,0.05)] bg-white p-6 text-center shadow-[0_8px_32px_rgba(15,23,42,0.04)] sm:p-9">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat hasil permainan...</p>
        ) : !score ? (
          <>
            <Bug className="mx-auto size-12 text-slate-300" />
            <h1 className="mt-4 text-2xl font-black text-[var(--color-heading)]">Skor tidak ditemukan</h1>
            <p className="mt-2 text-sm text-slate-500">Hasil ini mungkin sudah tidak tersedia.</p>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              <Sparkles className="size-3.5" /> {score.title}
            </span>
            <h1 className="mt-4 text-3xl font-black text-[var(--color-heading)]">{score.username} berhasil menangkap kecoa!</h1>
            <p className="mt-2 text-sm text-slate-500">Bisakah kamu mengalahkan skor ini?</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <ResultStat icon={Target} label="Score" value={score.score.toLocaleString('id-ID')} />
              <ResultStat icon={Bug} label="Kecoa" value={score.caught_count} />
              <ResultStat icon={Sparkles} label="Combo" value={`${score.max_combo}x`} />
            </div>
            <button type="button" onClick={() => shareScore({ score: score.score, caughtCount: score.caught_count, maxCombo: score.max_combo, resultUrl: window.location.href })} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-bold text-[var(--color-pink)] hover:bg-[var(--color-pink-tint-8)] transition">
              <Send className="size-4" /> Share ulang ke X
            </button>
          </>
        )}
        <Link href={ROUTES.GAME_MENANGKAP_KECOA} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-iris-gradient px-5 py-3 font-bold text-white shadow-[var(--shadow-pink-glow)] hover:scale-[1.02] transition">
          <Gamepad2 className="size-4" /> Main Sekarang
        </Link>
      </div>
    </div>
  );
}

function ResultStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[var(--color-pink)]/[0.06] p-3">
      <Icon className="mx-auto size-4 text-[var(--color-pink)]" />
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-[var(--color-heading)]">{value}</p>
    </div>
  );
}

