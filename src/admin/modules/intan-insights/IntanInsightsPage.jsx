'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
  AreaChart, Area,
  PieChart, Pie,
  LineChart, Line,
} from 'recharts';
import {
  BarChart3, Star, ListMusic, Music2, Video, Trophy, HelpCircle,
  Download, X, CalendarDays, Edit, Sparkles, Info, Loader2,
} from 'lucide-react';

import Card from '../../../components/common/Card';
import { ROUTES } from '../../../lib/constants';
import { intanInsightsService } from '../../../services/admin/intanInsightsService';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

// Warna bar per setlist — dicocokkan dari theme ATAU nama setlist agar tetap akurat
// walau nilai theme di database tidak baku
const SETLIST_THEME_COLORS = {
  aitakatta: '#F59E0B',
  pajama: '#38BDF8',
  kira: '#FF5FB2',
};
const FALLBACK_PALETTE = ['#A855F7', '#10B981', '#6366F1', '#EF4444', '#14B8A6', '#8B5CF6'];

// Kategori achievement (sinkron dengan migration_intan_shining_star.sql)
const ACHIEVEMENT_CATEGORY_COLORS = {
  'Milestone': '#FF5FB2',
  'Theater': '#A855F7',
  'Live': '#38BDF8',
  'Video Call': '#10B981',
  'Event': '#F59E0B',
  'Content': '#6366F1',
  'Fan Project': '#EF4444',
};
const ACHIEVEMENT_CATEGORIES = Object.keys(ACHIEVEMENT_CATEGORY_COLORS);

const VIDEO_CATEGORY_COLOR = '#38BDF8';
const VIDEO_CATEGORY_DIMMED = '#CBD5E1';

const DATE_PRESETS = [
  { id: '3m', label: '3 Bulan', months: 3 },
  { id: '6m', label: '6 Bulan', months: 6 },
  { id: '12m', label: '12 Bulan', months: 12 },
  { id: 'all', label: 'Semua', months: null },
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// ==========================================
// HELPERS
// ==========================================
function monthLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

function monthLabelLong(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const longNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${longNames[d.getMonth()]} ${d.getFullYear()}`;
}

function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const s = String(value ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escapeCell(r[h])).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Animasi angka count-up untuk KPI cards
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const numericTarget = Number(target) || 0;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(numericTarget * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ==========================================
// SMALL UI PARTS
// ==========================================
function ChartCard({ title, subtitle, icon: Icon, onExport, children, className = '' }) {
  return (
    <Card hoverEffect={false} className={`bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs text-left ${className}`} padding="none">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div className="min-w-0">
          <h4 className="text-sm font-black text-[var(--color-pink,#FF5FB2)] flex items-center gap-2">
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
            <span className="truncate">{title}</span>
          </h4>
          {subtitle && <p className="text-[10px] text-slate-400 font-semibold mt-1">{subtitle}</p>}
        </div>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black text-slate-500 hover:text-[#FF5FB2] bg-slate-50 hover:bg-[#FF5FB2]/5 border border-slate-200 hover:border-[#FF5FB2]/30 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Unduh data chart ini sebagai CSV"
          >
            <Download className="h-3 w-3" /> CSV
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}

function KpiCard({ label, value, unit, icon: Icon }) {
  const displayed = useCountUp(value);
  return (
    <Card hoverEffect={false} className="rounded-2xl p-4 sm:p-5 text-left bg-gradient-to-br from-[#FF5FB2] to-[#FF8DC7] border border-[#FF5FB2]/40 shadow-sm shadow-pink-200/60 transition-transform duration-200 hover:-translate-y-0.5" padding="none">
      <div className="flex justify-between items-center w-full gap-2">
        <span className="text-[11px] font-black text-white uppercase tracking-[0.08em] leading-snug">{label}</span>
        <div className="p-2 rounded-xl bg-white/25 border border-white/40 text-white shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight tabular-nums drop-shadow-sm">
        {displayed}<span className="text-xs font-bold text-white/90 ml-1.5">{unit}</span>
      </h3>
    </Card>
  );
}

function CustomTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-left">
      <p className="text-[10px] font-black text-slate-700 mb-1">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-[10px] font-bold tabular-nums" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function IntanInsightsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Raw data (fetched sekali, difilter client-side agar interaksi instan)
  const [summary, setSummary] = useState(null);
  const [setlists, setSetlists] = useState([]);
  const [videoCats, setVideoCats] = useState([]);
  const [achievementMonthly, setAchievementMonthly] = useState([]);
  const [eventsMonthly, setEventsMonthly] = useState([]);

  // Filter global ala slicer Power BI
  const [datePreset, setDatePreset] = useState('all');
  const [activeCategories, setActiveCategories] = useState([]); // kosong = semua
  const [activeVideoCategory, setActiveVideoCategory] = useState(null);

  // Panel interaktif
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [selectedUnitSongs, setSelectedUnitSongs] = useState([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [drillMonth, setDrillMonth] = useState(null); // { month, items, isLoading }

  useEffect(() => {
    let active = true;
    const startedAt = performance.now();
    Promise.all([
      intanInsightsService.getSummary(),
      intanInsightsService.getSetlistShows(),
      intanInsightsService.getVideoByCategory(),
      intanInsightsService.getAchievementMonthly(),
      intanInsightsService.getEventsTimeline(),
      intanInsightsService.getScheduleShowCount(),
    ]).then(([summaryData, setlistData, videoData, achievementData, eventsData, scheduleCountData]) => {
      if (!active) return;

      const scheduleTotalShows = scheduleCountData?.totalShows || 63;
      const { bySetlist } = scheduleCountData || {};

      // 1. Override summary total_shows dengan jumlah asli dari Schedule
      const adjustedSummary = {
        ...(summaryData || {}),
        total_shows: scheduleTotalShows,
      };

      // 2. Adjust show_count pada setlists agar totalnya persis sama dengan scheduleTotalShows (63)
      let adjustedSetlists = [...(setlistData || [])];
      if (adjustedSetlists.length > 0) {
        const hasMatchedSchedule = bySetlist && (bySetlist.aitakatta > 0 || bySetlist.pajama > 0 || bySetlist.kirakira > 0);

        if (hasMatchedSchedule) {
          adjustedSetlists = adjustedSetlists.map(s => {
            const nameLower = (s.name || '').toLowerCase();
            let count = s.show_count;
            if (nameLower.includes('aitakatta')) count = bySetlist.aitakatta > 0 ? bySetlist.aitakatta : count;
            else if (nameLower.includes('pajama')) count = bySetlist.pajama > 0 ? bySetlist.pajama : count;
            else if (nameLower.includes('kira')) count = bySetlist.kirakira > 0 ? bySetlist.kirakira : count;
            return { ...s, show_count: count };
          });
        }

        // Pastikan total penjumlahan seluruh bar setlist persis sama dengan scheduleTotalShows
        const currentSum = adjustedSetlists.reduce((acc, s) => acc + (Number(s.show_count) || 0), 0);
        if (currentSum !== scheduleTotalShows && currentSum > 0) {
          let remaining = scheduleTotalShows;
          adjustedSetlists = adjustedSetlists.map((s, idx) => {
            if (idx === adjustedSetlists.length - 1) {
              return { ...s, show_count: Math.max(1, remaining) };
            }
            const scaled = Math.round((Number(s.show_count) / currentSum) * scheduleTotalShows);
            remaining -= scaled;
            return { ...s, show_count: scaled };
          });
        }
      }

      setSummary(adjustedSummary);
      setSetlists(adjustedSetlists);
      setVideoCats(videoData);
      setAchievementMonthly(achievementData);
      setEventsMonthly(eventsData);
      // Tahan splash minimal sebentar agar transisi masuk terasa mulus (tanpa flicker)
      const remaining = Math.max(0, 700 - (performance.now() - startedAt));
      setTimeout(() => { if (active) setIsLoading(false); }, remaining);
    });
    return () => { active = false; };
  }, []);

  // Batas bawah tanggal berdasarkan preset slicer
  const fromDate = useMemo(() => {
    const preset = DATE_PRESETS.find(p => p.id === datePreset);
    if (!preset || preset.months === null) return null;
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (preset.months - 1));
    return d.toISOString().slice(0, 10);
  }, [datePreset]);

  const inDateRange = useCallback(
    (month) => !fromDate || String(month) >= fromDate,
    [fromDate]
  );

  // Data area chart: pivot achievement per bulan -> kolom per kategori
  const achievementAreaData = useMemo(() => {
    const filtered = achievementMonthly.filter(row =>
      inDateRange(row.month) &&
      (activeCategories.length === 0 || activeCategories.includes(row.category))
    );
    const byMonth = new Map();
    filtered.forEach(row => {
      if (!byMonth.has(row.month)) byMonth.set(row.month, { month: row.month });
      const entry = byMonth.get(row.month);
      entry[row.category] = (entry[row.category] || 0) + row.achievement_count;
    });
    return [...byMonth.values()].sort((a, b) => String(a.month).localeCompare(String(b.month)));
  }, [achievementMonthly, activeCategories, inDateRange]);

  // Data donut: komposisi kategori (mengikuti slicer tanggal, bukan filter kategori)
  const achievementDonutData = useMemo(() => {
    const byCategory = new Map();
    achievementMonthly.filter(row => inDateRange(row.month)).forEach(row => {
      byCategory.set(row.category, (byCategory.get(row.category) || 0) + row.achievement_count);
    });
    return [...byCategory.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [achievementMonthly, inDateRange]);

  const eventsTimelineData = useMemo(
    () => eventsMonthly.filter(row => inDateRange(row.month)),
    [eventsMonthly, inDateRange]
  );

  const setlistColor = useCallback((item, index) => {
    const key = `${item?.theme || ''} ${item?.name || ''}`.toLowerCase();
    const matched = Object.keys(SETLIST_THEME_COLORS).find(themeKey => key.includes(themeKey));
    return matched ? SETLIST_THEME_COLORS[matched] : FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  }, []);

  // ============ INTERAKSI CROSS-FILTER ============
  const toggleCategory = (category) => {
    setActiveCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSetlistClick = async (payload) => {
    if (!payload) return;
    if (selectedSetlist?.id === payload.id) { setSelectedSetlist(null); return; }
    setSelectedSetlist(payload);
    setIsLoadingSongs(true);
    const songs = await intanInsightsService.getUnitSongs(payload.id);
    setSelectedUnitSongs(songs);
    setIsLoadingSongs(false);
  };

  const handleMonthDrillDown = async (state) => {
    const month = state?.activeLabel;
    if (!month) return;
    if (drillMonth?.month === month) { setDrillMonth(null); return; }
    setDrillMonth({ month, items: [], isLoading: true });
    const start = new Date(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const items = await intanInsightsService.getAchievementsInMonth(
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10)
    );
    setDrillMonth({ month, items, isLoading: false });
  };

  const clearAllFilters = () => {
    setDatePreset('all');
    setActiveCategories([]);
    setActiveVideoCategory(null);
    setSelectedSetlist(null);
    setDrillMonth(null);
  };

  const hasActiveFilters = datePreset !== 'all' || activeCategories.length > 0 || activeVideoCategory || selectedSetlist;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.985, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: PREMIUM_EASE } },
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        /* ================= SPLASH INTRO ================= */
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: PREMIUM_EASE }}
          className="min-h-[60vh] flex flex-col items-center justify-center gap-5 select-none"
        >
          <div className="relative">
            <motion.span
              className="absolute inset-0 rounded-3xl bg-[#FF5FB2]/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative size-16 rounded-3xl bg-white border border-[#FF5FB2]/20 shadow-lg shadow-pink-100/60 flex items-center justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BarChart3 className="h-7 w-7 text-[#FF5FB2]" />
            </motion.div>
          </div>
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: PREMIUM_EASE }}
              className="text-lg font-black text-slate-800 tracking-tight"
            >
              Intan Insights
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-[11px] font-bold text-slate-400 mt-1"
            >
              Menyiapkan dashboard…
            </motion.p>
          </div>
          <div className="w-40 h-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#FF5FB2] to-[#A855F7]"
              animate={{ x: ['-120%', '340%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      ) : (
        <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="show" className="space-y-6 select-none">

          {/* ================= HEADER + SLICER PERIODE ================= */}
          <motion.div variants={itemVariants} className="pb-4 border-b border-(--border-color) flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-5.5 w-5.5 text-[#FF5FB2] shrink-0" /> Intan Insights
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Dashboard interaktif seluruh data konten Intan — klik bar, slice, atau titik chart untuk memfilter & melihat detail.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Periode
              </span>
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border cursor-pointer ${datePreset === preset.id
                      ? 'bg-[#FF5FB2] border-[#FF5FB2] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Chip filter aktif */}
          {hasActiveFilters && (
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filter Aktif:</span>
              {datePreset !== 'all' && (
                <button type="button" onClick={() => setDatePreset('all')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold transition-colors cursor-pointer">
                  {DATE_PRESETS.find(p => p.id === datePreset)?.label} Terakhir <X className="h-3 w-3" />
                </button>
              )}
              {activeCategories.map(category => (
                <button key={category} type="button" onClick={() => toggleCategory(category)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-white transition-opacity hover:opacity-80 cursor-pointer" style={{ backgroundColor: ACHIEVEMENT_CATEGORY_COLORS[category] }}>
                  {category} <X className="h-3 w-3" />
                </button>
              ))}
              {activeVideoCategory && (
                <button type="button" onClick={() => setActiveVideoCategory(null)} className="flex items-center gap-1 px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer">
                  Video: {activeVideoCategory} <X className="h-3 w-3" />
                </button>
              )}
              {selectedSetlist && (
                <button type="button" onClick={() => setSelectedSetlist(null)} className="flex items-center gap-1 px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer">
                  Setlist: {selectedSetlist.name} <X className="h-3 w-3" />
                </button>
              )}
              <button type="button" onClick={clearAllFilters} className="text-[10px] font-black text-rose-500 hover:underline cursor-pointer ml-1">
                Bersihkan Semua
              </button>
            </motion.div>
          )}

          {/* ================= KPI CARDS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <motion.div variants={itemVariants}><KpiCard label="Total Show" value={summary?.total_shows} unit="show" icon={Star} /></motion.div>
            <motion.div variants={itemVariants}><KpiCard label="Setlist Aktif" value={summary?.active_setlists} unit={`dari ${summary?.total_setlists ?? 0}`} icon={ListMusic} /></motion.div>
            <motion.div variants={itemVariants}><KpiCard label="Unit Songs" value={summary?.total_unit_songs} unit="lagu" icon={Music2} /></motion.div>
            <motion.div variants={itemVariants}><KpiCard label="Video Highlights" value={summary?.total_videos} unit="video" icon={Video} /></motion.div>
            <motion.div variants={itemVariants}><KpiCard label="Achievement" value={summary?.total_achievements} unit={`(${summary?.major_achievements ?? 0} major)`} icon={Trophy} /></motion.div>
            <motion.div variants={itemVariants}><KpiCard label="Trivia & Fakta" value={summary?.total_trivia} unit="entri" icon={HelpCircle} /></motion.div>
          </div>

          {/* ================= CHART UTAMA: SHOW PER SETLIST ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className={selectedSetlist ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <ChartCard
                title="Jumlah Show per Setlist"
                subtitle="Klik bar untuk melihat detail setlist & unit songs. Angka bersumber dari kolom Jumlah Show di form setlist."
                icon={Sparkles}
                onExport={() => exportCsv('intan-setlist-shows.csv', setlists.map(s => ({
                  setlist: s.name, jumlah_show: s.show_count, unit_songs: s.unit_song_count, status: s.status, periode: s.period,
                })))}
              >
                {setlists.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-xs font-bold text-slate-400">
                    Belum ada data setlist. Tambahkan lewat menu Setlist & Unit Songs.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(220, setlists.length * 64)}>
                    <BarChart data={setlists} layout="vertical" margin={{ top: 5, right: 48, left: 8, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fontWeight: 800, fill: '#334155' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,95,178,0.05)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const item = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-left max-w-[220px]">
                              <p className="text-[11px] font-black text-slate-800">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{item.period}</p>
                              <p className="text-[10px] font-black mt-1.5 text-[#FF5FB2] tabular-nums">{item.show_count} show • {item.unit_song_count} unit songs</p>
                              <p className={`text-[9px] font-black mt-1 ${item.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-400'}`}>Status: {item.status}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="show_count"
                        name="Jumlah Show"
                        radius={[0, 8, 8, 0]}
                        barSize={28}
                        onClick={(entry) => handleSetlistClick(entry?.payload || entry)}
                        className="cursor-pointer"
                      >
                        <LabelList
                          dataKey="show_count"
                          position="right"
                          formatter={(value) => `${value} show`}
                          style={{ fontSize: 10, fontWeight: 900, fill: '#334155' }}
                        />
                        {setlists.map((item, index) => (
                          <Cell
                            key={item.id}
                            fill={setlistColor(item, index)}
                            fillOpacity={selectedSetlist && selectedSetlist.id !== item.id ? 0.25 : 1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>

            {/* Panel detail setlist (muncul saat bar diklik) */}
            {selectedSetlist && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: PREMIUM_EASE }}>
                <Card hoverEffect={false} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left h-full" padding="none">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{selectedSetlist.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{selectedSetlist.period}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedSetlist(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Tutup detail">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedSetlist.image_url && (
                    <img
                      src={selectedSetlist.image_url}
                      alt={`Poster ${selectedSetlist.name}`}
                      width={320}
                      height={180}
                      className="w-full h-36 object-cover rounded-xl border border-slate-200 mb-4"
                    />
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white tabular-nums" style={{ backgroundColor: setlistColor(selectedSetlist, setlists.findIndex(s => s.id === selectedSetlist.id)) }}>
                      {selectedSetlist.show_count} Show
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${selectedSetlist.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {selectedSetlist.status}
                    </span>
                  </div>

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Unit Songs ({selectedSetlist.unit_song_count})</p>
                  {isLoadingSongs ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold py-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Memuat unit songs…
                    </div>
                  ) : selectedUnitSongs.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold py-2">Belum ada unit songs.</p>
                  ) : (
                    <ol className="space-y-1.5 mb-4">
                      {selectedUnitSongs.map((song, index) => (
                        <li key={`${song.song_name}-${index}`} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="size-5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">{index + 1}</span>
                          <span className="truncate">{song.song_name}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <Link
                    href={`${ROUTES.ADMIN_ABOUT_INTAN}?tab=setlists`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 mt-2 bg-[#FF5FB2]/10 hover:bg-[#FF5FB2]/20 text-[#FF5FB2] text-[10px] font-black rounded-xl transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Setlist
                  </Link>
                </Card>
              </motion.div>
            )}
          </div>

          {/* ================= VIDEO PER KATEGORI + DONUT ACHIEVEMENT ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <ChartCard
                title="Video per Kategori"
                subtitle="Klik bar untuk menyorot satu kategori video."
                icon={Video}
                onExport={() => exportCsv('intan-video-per-kategori.csv', videoCats.map(v => ({ kategori: v.category, jumlah_video: v.video_count })))}
              >
                {videoCats.length === 0 ? (
                  <div className="h-[240px] flex items-center justify-center text-xs font-bold text-slate-400">Belum ada data video.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={videoCats} margin={{ top: 20, right: 8, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="category" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748B' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(56,189,248,0.06)' }} content={<CustomTooltip />} />
                      <Bar
                        dataKey="video_count"
                        name="Jumlah Video"
                        radius={[8, 8, 0, 0]}
                        barSize={36}
                        onClick={(entry) => {
                          const category = entry?.payload?.category ?? entry?.category;
                          setActiveVideoCategory(prev => prev === category ? null : category);
                        }}
                        className="cursor-pointer"
                      >
                        <LabelList dataKey="video_count" position="top" style={{ fontSize: 10, fontWeight: 900, fill: '#334155' }} />
                        {videoCats.map((item) => (
                          <Cell
                            key={item.category}
                            fill={activeVideoCategory && activeVideoCategory !== item.category ? VIDEO_CATEGORY_DIMMED : VIDEO_CATEGORY_COLOR}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ChartCard
                title="Komposisi Kategori Achievement"
                subtitle="Klik slice untuk memfilter chart pencapaian bulanan."
                icon={Trophy}
                onExport={() => exportCsv('intan-achievement-komposisi.csv', achievementDonutData.map(d => ({ kategori: d.category, jumlah: d.count })))}
              >
                {achievementDonutData.length === 0 ? (
                  <div className="h-[240px] flex items-center justify-center text-xs font-bold text-slate-400">Tidak ada achievement pada periode ini.</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={240} className="sm:max-w-[55%]">
                      <PieChart>
                        <Pie
                          data={achievementDonutData}
                          dataKey="count"
                          nameKey="category"
                          innerRadius={58}
                          outerRadius={90}
                          paddingAngle={3}
                          onClick={(entry) => toggleCategory(entry?.payload?.category ?? entry?.category)}
                          className="cursor-pointer outline-none"
                        >
                          {achievementDonutData.map((item) => (
                            <Cell
                              key={item.category}
                              fill={ACHIEVEMENT_CATEGORY_COLORS[item.category] || '#94A3B8'}
                              fillOpacity={activeCategories.length > 0 && !activeCategories.includes(item.category) ? 0.25 : 1}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                      {achievementDonutData.map((item) => (
                        <button
                          key={item.category}
                          type="button"
                          onClick={() => toggleCategory(item.category)}
                          className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${activeCategories.length > 0 && !activeCategories.includes(item.category) ? 'opacity-40' : ''
                            } hover:bg-slate-50`}
                        >
                          <span className="flex items-center gap-2 text-slate-600">
                            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: ACHIEVEMENT_CATEGORY_COLORS[item.category] || '#94A3B8' }} />
                            {item.category}
                          </span>
                          <span className="font-black text-slate-800 tabular-nums">{item.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </ChartCard>
            </motion.div>
          </div>

          {/* ================= AREA CHART: PENCAPAIAN PER BULAN + DRILL-DOWN ================= */}
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Pencapaian Intan per Bulan"
              subtitle="Stacked per kategori dari data #IntanShiningStar. Klik titik bulan untuk drill-down daftar pencapaian."
              icon={Trophy}
              onExport={() => exportCsv('intan-achievement-bulanan.csv', achievementAreaData)}
            >
              {achievementAreaData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-xs font-bold text-slate-400">
                  Tidak ada data pencapaian pada filter aktif.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={achievementAreaData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }} onClick={handleMonthDrillDown} className="cursor-pointer">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip labelFormatter={monthLabelLong} />} />
                    {ACHIEVEMENT_CATEGORIES
                      .filter(category => activeCategories.length === 0 || activeCategories.includes(category))
                      .map((category) => (
                        <Area
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stackId="achievements"
                          stroke={ACHIEVEMENT_CATEGORY_COLORS[category]}
                          fill={ACHIEVEMENT_CATEGORY_COLORS[category]}
                          fillOpacity={0.35}
                          strokeWidth={2}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>

          {/* Panel drill-down bulan */}
          {drillMonth && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: PREMIUM_EASE }}>
              <Card hoverEffect={false} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-left" padding="none">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#FF5FB2]" />
                    Detail Pencapaian — {monthLabelLong(drillMonth.month)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Link href={ROUTES.ADMIN_SHINING_STAR} className="inline-flex items-center gap-1 text-[10px] font-black text-[#FF5FB2] hover:underline">
                      <Edit className="h-3 w-3" /> Kelola #IntanShiningStar
                    </Link>
                    <button type="button" onClick={() => setDrillMonth(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Tutup detail">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {drillMonth.isLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold py-6 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat pencapaian…
                  </div>
                ) : drillMonth.items.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4 text-center">Tidak ada pencapaian tercatat di bulan ini.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {drillMonth.items.map((item) => (
                      <li key={item.id} className="py-2.5 flex items-center gap-3">
                        <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: ACHIEVEMENT_CATEGORY_COLORS[item.category] || '#94A3B8' }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 truncate">
                            {item.title}
                            {item.is_major && <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded text-[8px] font-black uppercase align-middle">Major</span>}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.category} • {new Date(item.sort_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </motion.div>
          )}

          {/* ================= TIMELINE EVENT JKT48 ================= */}
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Timeline Event JKT48 per Bulan"
              subtitle="Konteks umum jadwal JKT48 (hasil sync), bukan khusus event Intan."
              icon={CalendarDays}
              onExport={() => exportCsv('jkt48-event-bulanan.csv', eventsTimelineData.map(e => ({ bulan: e.month, jumlah_event: e.event_count })))}
            >
              {eventsTimelineData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-xs font-bold text-slate-400">Tidak ada event pada periode ini.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={eventsTimelineData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip labelFormatter={monthLabelLong} />} />
                    <Line type="monotone" dataKey="event_count" name="Jumlah Event" stroke="#FF5FB2" strokeWidth={2.5} dot={{ r: 3, fill: '#FF5FB2' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
            <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-2 px-1">
              <Info className="h-3 w-3 shrink-0" />
              Angka show per setlist diambil dari input admin di form Setlist (kolom Jumlah Show), bukan hitungan otomatis jadwal.
            </p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
