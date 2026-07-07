'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Crown, Medal, Trophy } from 'lucide-react';
import { cn } from '../../../lib/utils';

const PODIUM_STYLES = {
  1: {
    order: 'order-2',
    height: 'h-32',
    color: 'from-amber-300 to-amber-500',
    ring: 'ring-amber-300',
    icon: Crown,
  },
  2: {
    order: 'order-1',
    height: 'h-24',
    color: 'from-slate-200 to-slate-400',
    ring: 'ring-slate-300',
    icon: Medal,
  },
  3: {
    order: 'order-3',
    height: 'h-20',
    color: 'from-orange-300 to-orange-500',
    ring: 'ring-orange-300',
    icon: Medal,
  },
};

function InitialAvatar({ name, className }) {
  return (
    <div className={cn('grid place-items-center rounded-full bg-[#170C79] font-black text-white', className)}>
      {(name || '?').slice(0, 1).toUpperCase()}
    </div>
  );
}

function LeaderboardPodium({ rankings }) {
  if (rankings.length === 0) return null;

  return (
    <div className="mb-7 grid grid-cols-3 items-end gap-2 pt-5 sm:gap-4">
      {rankings.map((item, index) => {
        const rank = index + 1;
        const style = PODIUM_STYLES[rank];
        const Icon = style.icon;

        return (
          <div key={item.id} className={cn('flex min-w-0 flex-col items-center', style.order)}>
            <div className="relative">
              {rank === 1 && <Crown className="absolute -top-7 left-1/2 size-6 -translate-x-1/2 text-amber-500" fill="currentColor" />}
              <InitialAvatar name={item.username} className={cn('size-12 ring-4 sm:size-14', style.ring)} />
              <span className="absolute -bottom-2 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-white text-[11px] font-black text-[#170C79] shadow">
                {rank}
              </span>
            </div>
            <p className="mt-4 max-w-full truncate text-xs font-extrabold text-slate-800 sm:text-sm">{item.username}</p>
            <p className="text-[11px] font-bold text-[#170C79]">{item.score.toLocaleString('id-ID')}</p>
            <div className={cn('mt-2 flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b pt-3 text-white shadow-inner', style.height, style.color)}>
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardRankings({ rankings, currentUserId, pageSize = 10, gameMode }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rankings.length / pageSize));
  const visibleRankings = rankings.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#170C79]/10">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] gap-2 bg-[#170C79]/[0.045] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          <span>Rank</span>
          <span>Pemain</span>
          <span>Score</span>
        </div>
        {visibleRankings.map((item, index) => {
          const rank = page * pageSize + index + 4;
          return (
            <div
              key={item.id}
              className={cn(
                'grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 border-t border-[#170C79]/10 px-4 py-3',
                item.id === currentUserId && 'bg-amber-50',
              )}
            >
              <span className="text-center text-sm font-black text-slate-400">#{rank}</span>
              <div className="flex min-w-0 items-center gap-3">
                <InitialAvatar name={item.username} className="size-9 shrink-0 text-xs" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{item.username}</p>
                  <p className="truncate text-[11px] text-slate-400">
                    {gameMode === 'gosok-intan'
                      ? `${item.caught_count} diamond, combo ${item.max_combo}x`
                      : `${item.caught_count} kecoa, combo ${item.max_combo}x`}
                  </p>
                </div>
              </div>
              <p className="font-black text-[#170C79]">{item.score.toLocaleString('id-ID')}</p>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Halaman {page + 1} dari {pageCount}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-[#170C79]/10 p-2 disabled:opacity-30">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" disabled={page + 1 === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#170C79]/10 p-2 disabled:opacity-30">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LeaderboardCard({
  scores,
  loading,
  error,
  currentUsername,
  period = 'weekly',
  onPeriodChange,
  className,
  gameMode = 'classic',
}) {
  const dateRange = useMemo(() => {
    if (scores.length === 0) return '';
    const dates = scores.map((item) => new Date(item.created_at)).sort((a, b) => a - b);
    const format = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `${format(dates[0])} - ${format(dates.at(-1))}`;
  }, [scores]);

  const podium = scores.slice(0, 3);
  const rankings = scores.slice(3);
  const currentUser = scores.find((item) => item.username === currentUsername);

  return (
    <div className={cn('rounded-2xl border border-[#170C79]/10 bg-white p-5 shadow-sm sm:p-6', className)}>
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h3 className="text-xl font-black text-[#170C79]">Leaderboard</h3>
          </div>
          <p className="text-xs text-slate-400 text-slate-500 font-medium">
            {period === 'weekly' ? 'Minggu Ini' : 'Semua Waktu'}
            {dateRange ? ` (${dateRange})` : ''}
          </p>
        </div>
        <select
          aria-label="Pilih periode leaderboard"
          value={period}
          onChange={(event) => onPeriodChange?.(event.target.value)}
          className="rounded-md border border-[#170C79]/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none"
        >
          <option value="weekly">Mingguan (Weekly)</option>
          <option value="all-time">All Time</option>
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Memuat leaderboard...</p>
      ) : error ? (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">Leaderboard belum tersedia. Jalankan migration game terlebih dahulu.</p>
      ) : scores.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">Belum ada skor. Jadilah yang pertama!</p>
      ) : (
        <>
          <LeaderboardPodium rankings={podium} />
          {rankings.length > 0 && <LeaderboardRankings rankings={rankings} currentUserId={currentUser?.id} gameMode={gameMode} />}
        </>
      )}
    </div>
  );
}

