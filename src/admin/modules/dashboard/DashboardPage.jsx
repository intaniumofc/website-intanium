'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LabelList,
  PieChart, Pie,
} from 'recharts';
import {
  LayoutDashboard, ShoppingBag, BookOpen, Calendar, MessageSquare,
  AlertTriangle, DollarSign, ArrowUpRight, Clock, Check, Trash2,
  Newspaper, Upload, Download, X, CalendarDays, ClipboardList,
  CheckCircle2, Layers, TrendingUp, PieChart as PieChartIcon, UserPlus,
} from 'lucide-react';

import Card from '../../../components/common/Card';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency, logAdminActivity } from '../../../lib/helpers';
import { createClient } from '../../../utils/supabase/client';
import { madingService } from '../../../services/public/madingService';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { auditService } from '../../../services/admin/auditService';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];
const TECH_SUPPORT_EMAIL = 'tech@iris.admin';

const PAID_STATUSES = ['paid', 'processing', 'ready_for_pickup', 'shipped', 'completed'];
const PENDING_STATUSES = ['pending_review', 'waiting_payment'];

// Label & warna status order (dibahasakan agar admin langsung paham)
const STATUS_META = {
  pending_review: { label: 'Menunggu Review', color: '#A855F7', badge: 'bg-purple-50 text-purple-600 border-purple-200/40' },
  waiting_payment: { label: 'Menunggu Bayar', color: '#F59E0B', badge: 'bg-amber-50 text-amber-600 border-amber-200/40' },
  paid: { label: 'Dibayar', color: '#38BDF8', badge: 'bg-sky-50 text-sky-600 border-sky-200/40' },
  processing: { label: 'Diproses', color: '#6366F1', badge: 'bg-indigo-50 text-indigo-600 border-indigo-200/40' },
  ready_for_pickup: { label: 'Siap Diambil', color: '#14B8A6', badge: 'bg-teal-50 text-teal-600 border-teal-200/40' },
  shipped: { label: 'Dikirim', color: '#0EA5E9', badge: 'bg-blue-50 text-blue-600 border-blue-200/40' },
  completed: { label: 'Selesai', color: '#10B981', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200/40' },
  cancelled: { label: 'Batal', color: '#EF4444', badge: 'bg-rose-50 text-rose-500 border-rose-200/40' },
};
const statusLabel = (status) => STATUS_META[status]?.label || status;
const statusBadge = (status) => STATUS_META[status]?.badge || 'bg-slate-50 text-slate-600 border-slate-200/40';

// Label & warna untuk aktivitas pendaftaran Join Us
const JOIN_TYPE_META = {
  member: { label: 'Member', badge: 'bg-pink-50 text-pink-600 border-pink-200/60' },
  admin: { label: 'Admin', badge: 'bg-indigo-50 text-indigo-600 border-indigo-200/60' },
  volunteer: { label: 'Volunteer', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200/60' },
};
const JOIN_STATUS_META = {
  pending: { label: 'Pending', badge: 'bg-amber-50 text-amber-600 border-amber-200/40' },
  approved: { label: 'Diterima', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200/40' },
  rejected: { label: 'Ditolak', badge: 'bg-rose-50 text-rose-500 border-rose-200/40' },
  contacted: { label: 'Dihubungi', badge: 'bg-sky-50 text-sky-600 border-sky-200/40' },
};

const INVENTORY_COLORS = ['#FF5FB2', '#A855F7', '#38BDF8', '#F59E0B', '#10B981', '#6366F1'];

const DATE_PRESETS = [
  { id: '3m', label: '3 Bulan', months: 3 },
  { id: '6m', label: '6 Bulan', months: 6 },
  { id: '12m', label: '12 Bulan', months: 12 },
  { id: 'all', label: 'Semua', months: null },
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const madingColorsMap = {
  pink: 'bg-[#ffe5ec] border-pink-200 text-pink-700',
  lavender: 'bg-[#f3e8ff] border-purple-200 text-purple-700',
  yellow: 'bg-[#fef9c3] border-yellow-200 text-yellow-700',
  blue: 'bg-[#e0f2fe] border-sky-200 text-blue-700',
  peach: 'bg-[#ffedd5] border-orange-200 text-orange-700',
};

// ==========================================
// HELPERS
// ==========================================
function monthKey(dateString) {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function monthLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

function monthLabelLong(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
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

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return 'kemarin';
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
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

function KpiCard({ label, value, unit, icon: Icon, isCurrency = false }) {
  const counted = useCountUp(isCurrency ? 0 : value);
  const shown = isCurrency ? formatCurrency(Number(value) || 0) : counted;
  return (
    <Card hoverEffect={false} className="rounded-2xl p-4 sm:p-5 text-left bg-gradient-to-br from-[#FF5FB2] to-[#FF8DC7] border border-[#FF5FB2]/40 shadow-sm shadow-pink-200/60 transition-transform duration-200 hover:-translate-y-0.5" padding="none">
      <div className="flex justify-between items-center w-full gap-2">
        <span className="text-[11px] font-black text-white uppercase tracking-[0.08em] leading-snug">{label}</span>
        <div className="p-2 rounded-xl bg-white/25 border border-white/40 text-white shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {/* Tinggi baris angka dikunci agar semua kartu KPI sama persis */}
      <div className="mt-3 h-8 sm:h-9 flex items-center gap-1.5 overflow-hidden">
        <h3 className={`font-black text-white tracking-tight tabular-nums drop-shadow-sm truncate ${isCurrency ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}`}>
          {shown}
        </h3>
        {unit && <span className="text-xs font-bold text-white/90 shrink-0">{unit}</span>}
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-left">
      <p className="text-[10px] font-black text-slate-700 mb-1">{labelFormatter ? labelFormatter(label) : label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-[10px] font-bold tabular-nums" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function DashboardPage() {
  const supabase = createClient();
  const notify = useAdminToast();
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Raw data (fetch sekali, agregasi client-side agar slicer instan)
  const [counts, setCounts] = useState({ products: 0, schedules: 0, news: 0, recaps: 0, gallery: 0, madingTotal: 0, madingPending: 0, joinPending: 0 });
  const [orders, setOrders] = useState([]);
  const [madingRows, setMadingRows] = useState([]);
  const [pendingMading, setPendingMading] = useState([]);
  const [joinSubs, setJoinSubs] = useState([]);

  // Filter global ala slicer Power BI
  const [datePreset, setDatePreset] = useState('all');
  const [activeStatus, setActiveStatus] = useState(null);

  // Log & session
  const [currentUserRole, setCurrentUserRole] = useState('staff');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserUsername, setCurrentUserUsername] = useState('');
  const [activities, setActivities] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isAll: false });

  // Restore
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [restorePayload, setRestorePayload] = useState(null);

  // IT Support = role super_admin (atau akun email khusus lama)
  const isITSupportUser = currentUserRole === 'super_admin' || currentUserEmail.toLowerCase() === TECH_SUPPORT_EMAIL;

  const loadDashboardData = async () => {
    try {
      const startedAt = performance.now();
      const [
        merchRes, eventsRes, newsRes, recapsRes, galleryRes,
        madingTotalRes, madingPendingRes,
        ordersRes, madingMonthlyRes, pendingNotesRes,
        joinSubsRes, joinPendingRes,
        sessionRes, logsData,
      ] = await Promise.all([
        supabase.from('merchandise').select('id', { count: 'exact', head: true }).neq('id', 'payment_settings').neq('id', 'game_settings'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('recaps').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('mading_notes').select('id', { count: 'exact', head: true }),
        supabase.from('mading_notes').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('orders').select('id, invoice_number, created_at, order_data').order('created_at', { ascending: false }),
        supabase.from('mading_notes').select('created_at, is_approved'),
        supabase.from('mading_notes').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
        supabase.from('join_submissions').select('id, type, full_name, nickname, position_or_division, status, created_at').order('created_at', { ascending: false }).limit(6),
        supabase.from('join_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.auth.getSession(),
        auditService.getLogs(10),
      ]);

      setCounts({
        products: merchRes.count || 0,
        schedules: eventsRes.count || 0,
        news: newsRes.count || 0,
        recaps: recapsRes.count || 0,
        gallery: galleryRes.count || 0,
        madingTotal: madingTotalRes.count || 0,
        madingPending: madingPendingRes.count || 0,
        joinPending: joinPendingRes.count || 0,
      });

      setOrders((ordersRes.data || []).map(order => ({
        id: order.id,
        invoice_number: order.invoice_number,
        shipping_name: order.order_data?.name || '-',
        total_amount: Number(order.order_data?.totalAmount || 0),
        status: order.order_data?.status || 'pending_review',
        created_at: order.created_at,
      })));

      setMadingRows(madingMonthlyRes.data || []);
      setJoinSubs(joinSubsRes.data || []);
      setPendingMading((pendingNotesRes.data || []).map(note => ({
        id: note.id,
        name: note.name || 'Anonim',
        message: note.message,
        themeColor: note.theme_color,
      })));

      const session = sessionRes.data?.session;
      if (session) {
        setCurrentUserEmail(session.user.email || '');
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('role, username')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setCurrentUserRole(profile.role);
          setCurrentUserUsername(profile.username);
        }
      }

      setActivities(logsData || []);

      // Tahan splash minimal sebentar agar transisi masuk terasa mulus (tanpa flicker)
      const remaining = Math.max(0, 700 - (performance.now() - startedAt));
      setTimeout(() => setIsLoading(false), remaining);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ SLICER PERIODE ============
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

  // Orders sesuai slicer periode (basis semua KPI & chart order)
  const ordersInRange = useMemo(
    () => orders.filter(o => !o.created_at || inDateRange(monthKey(o.created_at))),
    [orders, inDateRange]
  );

  // ============ DERIVED METRICS ============
  const kpis = useMemo(() => {
    const revenue = ordersInRange
      .filter(o => PAID_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + o.total_amount, 0);
    const pendingOrders = ordersInRange.filter(o => PENDING_STATUSES.includes(o.status)).length;
    const completedOrders = ordersInRange.filter(o => o.status === 'completed').length;
    const staleOrders = orders.filter(o => {
      if (!o.created_at || [...PAID_STATUSES, 'cancelled'].includes(o.status)) return false;
      return Date.now() - new Date(o.created_at).getTime() > 24 * 60 * 60 * 1000;
    }).length;
    return { revenue, pendingOrders, completedOrders, staleOrders };
  }, [orders, ordersInRange]);

  const revenueMonthly = useMemo(() => {
    const byMonth = new Map();
    ordersInRange.filter(o => PAID_STATUSES.includes(o.status) && o.created_at).forEach(o => {
      const key = monthKey(o.created_at);
      byMonth.set(key, (byMonth.get(key) || 0) + o.total_amount);
    });
    return [...byMonth.entries()]
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [ordersInRange]);

  const statusData = useMemo(() => {
    const byStatus = new Map();
    ordersInRange.forEach(o => byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1));
    return Object.keys(STATUS_META)
      .filter(status => byStatus.has(status))
      .map(status => ({ status, label: statusLabel(status), count: byStatus.get(status) }));
  }, [ordersInRange]);

  const madingMonthly = useMemo(() => {
    const byMonth = new Map();
    madingRows.filter(row => row.created_at).forEach(row => {
      const key = monthKey(row.created_at);
      if (!byMonth.has(key)) byMonth.set(key, { month: key, Disetujui: 0, Pending: 0 });
      const entry = byMonth.get(key);
      if (row.is_approved) entry.Disetujui += 1; else entry.Pending += 1;
    });
    return [...byMonth.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .filter(entry => inDateRange(entry.month));
  }, [madingRows, inDateRange]);

  const inventoryData = useMemo(() => ([
    { name: 'Produk Merch', count: counts.products },
    { name: 'Event', count: counts.schedules },
    { name: 'Berita', count: counts.news },
    { name: 'Recaps', count: counts.recaps },
    { name: 'Gallery', count: counts.gallery },
    { name: 'Mading', count: counts.madingTotal },
  ]), [counts]);

  // Order terbaru: terfilter slicer + klik donut status
  const recentOrders = useMemo(
    () => ordersInRange.filter(o => !activeStatus || o.status === activeStatus).slice(0, 5),
    [ordersInRange, activeStatus]
  );

  const hasActiveFilters = datePreset !== 'all' || activeStatus;
  const clearAllFilters = () => { setDatePreset('all'); setActiveStatus(null); };

  // ============ AKSI MODERASI MADING ============
  const refreshLogs = async () => {
    const logsData = await auditService.getLogs(10);
    setActivities(logsData || []);
  };

  const handleQuickApprove = async (id) => {
    setActionLoading(id);
    try {
      const note = pendingMading.find(n => n.id === id);
      const author = note ? note.name : 'Anonim';
      const res = await madingService.approveNote(id);
      if (res.success) {
        setPendingMading(prev => prev.filter(item => item.id !== id));
        setCounts(prev => ({ ...prev, madingPending: Math.max(0, prev.madingPending - 1) }));
        setMadingRows(prev => {
          const idx = prev.findIndex(r => !r.is_approved);
          return idx === -1 ? prev : prev.map((r, i) => i === idx ? { ...r, is_approved: true } : r);
        });
        notify.success('Pesan disetujui', 'Pesan mading disetujui dan kini tayang di halaman utama.');
        await logAdminActivity(`Menyetujui komentar mading dari: ${author}`);
        await refreshLogs();
      } else {
        notify.error('Gagal menyetujui pesan', res.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyetujui pesan', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickDelete = async (id) => {
    setActionLoading(id);
    try {
      const note = pendingMading.find(n => n.id === id);
      const author = note ? note.name : 'Anonim';
      const res = await madingService.deleteNote(id);
      if (res.success) {
        setPendingMading(prev => prev.filter(item => item.id !== id));
        setCounts(prev => ({
          ...prev,
          madingPending: Math.max(0, prev.madingPending - 1),
          madingTotal: Math.max(0, prev.madingTotal - 1),
        }));
        notify.success('Pesan dihapus', 'Pesan mading berhasil dihapus.');
        await logAdminActivity(`Menghapus komentar mading dari: ${author}`);
        await refreshLogs();
      } else {
        notify.error('Gagal menghapus pesan', res.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus pesan', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ============ AKSI LOG & RESTORE ============
  const handleConfirmDeleteActivity = async () => {
    const { id, isAll } = confirmDelete;
    setConfirmDelete({ isOpen: false, id: null, isAll: false });
    if (!isITSupportUser) {
      notify.error('Akses Ditolak', 'Hanya Admin Tech yang dapat mengelola log aktivitas.');
      return;
    }
    try {
      if (isAll) {
        await auditService.clearAllLogs();
        notify.success('Log Dibersihkan', 'Seluruh log aktivitas admin telah berhasil dihapus.');
      } else {
        await auditService.deleteLog(id);
        notify.success('Aktivitas Dihapus', 'Entri log aktivitas telah dihapus.');
      }
      await refreshLogs();
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus log', err.message);
    }
  };

  const handleRestoreFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.data || !json.tables) {
          notify.error('Format Tidak Valid', 'Berkas JSON cadangan tidak memiliki struktur yang tepat.');
          return;
        }
        setRestorePayload(json);
        setConfirmRestoreOpen(true);
      } catch (err) {
        notify.error('Gagal Membaca File', 'Gagal mem-parse JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!restorePayload) return;
    setConfirmRestoreOpen(false);
    setIsRestoring(true);
    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: restorePayload.data }),
      });
      const data = await res.json();
      if (data.success) {
        notify.success('Restore Berhasil', `Data berhasil dipulihkan. Total ${data.totalRestored} baris data ditulis ulang.`);
        await loadDashboardData();
      } else {
        notify.error('Restore Gagal', data.error || 'Terjadi kesalahan saat memulihkan data.');
      }
    } catch (err) {
      notify.error('Restore Gagal', err.message);
    } finally {
      setIsRestoring(false);
      setRestorePayload(null);
    }
  };

  // ============ ANIMASI ============
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.985, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: PREMIUM_EASE } },
  };

  const quickActions = [
    { name: 'Tambah Produk', href: ROUTES.ADMIN_MERCHANDISE, icon: ShoppingBag },
    { name: 'Buat Jadwal', href: ROUTES.ADMIN_SCHEDULE, icon: Calendar },
    { name: 'Tulis Berita', href: ROUTES.ADMIN_NEWS, icon: Newspaper },
    { name: 'Unggah Zine', href: ROUTES.ADMIN_RECAPS, icon: BookOpen },
  ];

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
              <LayoutDashboard className="h-7 w-7 text-[#FF5FB2]" />
            </motion.div>
          </div>
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: PREMIUM_EASE }}
              className="text-lg font-black text-slate-800 tracking-tight"
            >
              Dashboard IRIS
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-[11px] font-bold text-slate-400 mt-1"
            >
              Menyiapkan ringkasan…
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

        {/* ================= HEADER + QUICK ACTIONS + SLICER ================= */}
        <motion.div variants={itemVariants} className="pb-4 border-b border-(--border-color) flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="h-5.5 w-5.5 text-[#FF5FB2] shrink-0" /> Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-2 flex-wrap">
              Halo, <span className="font-black text-slate-700">{currentUserUsername || 'Admin'}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                currentUserRole === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                currentUserRole === 'coordinator' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {currentUserRole === 'super_admin' ? 'IT Support' : currentUserRole === 'coordinator' ? 'Koordinator' : 'Staff Admin'}
              </span>
              — ringkasan operasional & penjualan IRIS.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {quickActions.map(action => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-[#FF5FB2]/40 text-slate-600 hover:text-[#FF5FB2] rounded-lg text-[10px] font-black transition-colors"
                >
                  <action.icon className="h-3.5 w-3.5" /> {action.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Periode
              </span>
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border cursor-pointer ${
                    datePreset === preset.id
                      ? 'bg-[#FF5FB2] border-[#FF5FB2] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ================= BANNER ALERT TUNGGAL ================= */}
        {(kpis.staleOrders > 0 || counts.madingPending > 0 || counts.joinPending > 0) && (
          <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-amber-800 text-left">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            {kpis.staleOrders > 0 && (
              <span className="text-xs font-bold">
                <span className="font-black">{kpis.staleOrders}</span> pesanan menunggu lebih dari 24 jam.
                <Link href={ROUTES.ADMIN_ORDERS} className="ml-1.5 text-amber-600 hover:underline font-black">Tinjau &rarr;</Link>
              </span>
            )}
            {counts.madingPending > 0 && (
              <span className="text-xs font-bold">
                <span className="font-black">{counts.madingPending}</span> mading menunggu moderasi.
                <Link href={ROUTES.ADMIN_MADING} className="ml-1.5 text-amber-600 hover:underline font-black">Moderasi &rarr;</Link>
              </span>
            )}
            {counts.joinPending > 0 && (
              <span className="text-xs font-bold">
                <span className="font-black">{counts.joinPending}</span> pendaftaran join baru menunggu ditinjau.
                <Link href={ROUTES.ADMIN_JOIN_US} className="ml-1.5 text-amber-600 hover:underline font-black">Tinjau &rarr;</Link>
              </span>
            )}
          </motion.div>
        )}

        {/* Chip filter aktif */}
        {hasActiveFilters && (
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Filter Aktif:</span>
            {datePreset !== 'all' && (
              <button type="button" onClick={() => setDatePreset('all')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold transition-colors cursor-pointer">
                {DATE_PRESETS.find(p => p.id === datePreset)?.label} Terakhir <X className="h-3 w-3" />
              </button>
            )}
            {activeStatus && (
              <button type="button" onClick={() => setActiveStatus(null)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-white transition-opacity hover:opacity-80 cursor-pointer" style={{ backgroundColor: STATUS_META[activeStatus]?.color || '#64748B' }}>
                Status: {statusLabel(activeStatus)} <X className="h-3 w-3" />
              </button>
            )}
            <button type="button" onClick={clearAllFilters} className="text-[10px] font-black text-rose-500 hover:underline cursor-pointer ml-1">
              Bersihkan Semua
            </button>
          </motion.div>
        )}

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <motion.div variants={itemVariants}><KpiCard label="Pendapatan" value={kpis.revenue} unit="" icon={DollarSign} isCurrency /></motion.div>
          <motion.div variants={itemVariants}><KpiCard label="Order Pending" value={kpis.pendingOrders} unit="order" icon={ClipboardList} /></motion.div>
          <motion.div variants={itemVariants}><KpiCard label="Order Selesai" value={kpis.completedOrders} unit="order" icon={CheckCircle2} /></motion.div>
          <motion.div variants={itemVariants}><KpiCard label="Produk Merch" value={counts.products} unit="produk" icon={ShoppingBag} /></motion.div>
          <motion.div variants={itemVariants}><KpiCard label="Event Terjadwal" value={counts.schedules} unit="acara" icon={Calendar} /></motion.div>
          <motion.div variants={itemVariants}><KpiCard label="Mading Pending" value={counts.madingPending} unit="pesan" icon={MessageSquare} /></motion.div>
        </div>

        {/* ================= CHART ROW 1: PENDAPATAN + STATUS ORDER ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Tren Pendapatan per Bulan"
              subtitle="Akumulasi order berstatus dibayar sampai selesai, mengikuti slicer periode."
              icon={TrendingUp}
              onExport={() => exportCsv('iris-pendapatan-bulanan.csv', revenueMonthly.map(r => ({ bulan: r.month, pendapatan: r.revenue })))}
            >
              {revenueMonthly.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-xs font-bold text-slate-400">Belum ada transaksi berbayar pada periode ini.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueMonthly} margin={{ top: 10, right: 12, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5FB2" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#FF5FB2" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${Math.round(v / 1000)}rb` : v} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<CustomTooltip labelFormatter={monthLabelLong} valueFormatter={(v) => formatCurrency(v)} />} />
                    <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#FF5FB2" strokeWidth={2.5} fill="url(#revenueFill)" dot={{ r: 3, fill: '#FF5FB2' }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard
              title="Distribusi Status Order"
              subtitle="Klik slice atau legend untuk memfilter daftar Order Terbaru."
              icon={PieChartIcon}
              onExport={() => exportCsv('iris-status-order.csv', statusData.map(s => ({ status: s.label, jumlah: s.count })))}
            >
              {statusData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-xs font-bold text-slate-400">Belum ada order pada periode ini.</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={240} className="sm:max-w-[55%]">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                        onClick={(entry) => {
                          const status = entry?.payload?.status ?? entry?.status;
                          setActiveStatus(prev => prev === status ? null : status);
                        }}
                        className="cursor-pointer outline-none"
                      >
                        {statusData.map((item) => (
                          <Cell
                            key={item.status}
                            fill={STATUS_META[item.status]?.color || '#94A3B8'}
                            fillOpacity={activeStatus && activeStatus !== item.status ? 0.25 : 1}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    {statusData.map((item) => (
                      <button
                        key={item.status}
                        type="button"
                        onClick={() => setActiveStatus(prev => prev === item.status ? null : item.status)}
                        className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          activeStatus && activeStatus !== item.status ? 'opacity-40' : ''
                        } hover:bg-slate-50`}
                      >
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META[item.status]?.color || '#94A3B8' }} />
                          {item.label}
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

        {/* ================= CHART ROW 2: MADING + INVENTORI ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <ChartCard
              title="Kiriman Mading per Bulan"
              subtitle="Volume pesan penggemar: disetujui vs masih pending, mengikuti slicer periode."
              icon={MessageSquare}
              onExport={() => exportCsv('iris-mading-bulanan.csv', madingMonthly.map(m => ({ bulan: m.month, disetujui: m.Disetujui, pending: m.Pending })))}
            >
              {madingMonthly.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-xs font-bold text-slate-400">Belum ada kiriman mading pada periode ini.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={madingMonthly} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,95,178,0.05)' }} content={<CustomTooltip labelFormatter={monthLabelLong} />} />
                    <Bar dataKey="Disetujui" stackId="mading" fill="#10B981" radius={[0, 0, 0, 0]} barSize={28} />
                    <Bar dataKey="Pending" stackId="mading" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard
              title="Inventori Konten Website"
              subtitle="Jumlah entri konten per modul (tidak terpengaruh slicer periode)."
              icon={Layers}
              onExport={() => exportCsv('iris-inventori-konten.csv', inventoryData.map(i => ({ modul: i.name, jumlah: i.count })))}
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={inventoryData} layout="vertical" margin={{ top: 5, right: 40, left: 8, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fontWeight: 800, fill: '#334155' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,95,178,0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Jumlah" radius={[0, 6, 6, 0]} barSize={20}>
                    <LabelList dataKey="count" position="right" style={{ fontSize: 10, fontWeight: 900, fill: '#334155' }} />
                    {inventoryData.map((item, index) => (
                      <Cell key={item.name} fill={INVENTORY_COLORS[index % INVENTORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        </div>

        {/* ================= OPERASIONAL: MODERASI + ORDER TERBARU ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <ChartCard
              title="Antrean Moderasi Mading"
              subtitle="5 kiriman pending terbaru — setujui atau hapus langsung dari sini."
              icon={MessageSquare}
            >
              <div className="flex flex-col gap-3 min-h-[160px]">
                {pendingMading.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200/60 rounded-2xl">
                    <span className="size-11 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100/40 flex items-center justify-center mb-3">
                      <Check className="w-5.5 h-5.5" />
                    </span>
                    <p className="text-xs font-bold text-slate-600">Tidak ada antrean pending</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Semua pesan dukungan penggemar telah ter-moderasi.</p>
                  </div>
                ) : (
                  pendingMading.map((note) => {
                    const noteStyle = madingColorsMap[note.themeColor] || madingColorsMap.yellow;
                    const isBusy = actionLoading === note.id;
                    return (
                      <div
                        key={note.id}
                        className={`border border-l-[5px] rounded-xl p-4 flex items-center justify-between gap-4 transition-colors duration-200 ${noteStyle} ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <div className="space-y-1 min-w-0 flex-1 text-left">
                          <span className="text-[10px] font-black tracking-wide block opacity-75">{note.name}</span>
                          <p className="text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap">{note.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQuickApprove(note.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-black flex items-center gap-1 shadow-xs transition-colors duration-200 cursor-pointer active:scale-95"
                            title="Setujui komentar mading"
                          >
                            <Check className="h-3.5 w-3.5" /> Setujui
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickDelete(note.id)}
                            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/30 hover:border-rose-200 rounded-xl p-2 transition-colors duration-200 cursor-pointer"
                            title="Hapus komentar mading"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 text-right">
                <Link href={ROUTES.ADMIN_MADING} className="inline-flex items-center gap-1 text-xs font-black text-[#FF5FB2] hover:underline">
                  Kelola Mading Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ChartCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChartCard
              title="Order Terbaru"
              subtitle={activeStatus ? `Difilter: ${statusLabel(activeStatus)}` : '5 transaksi terakhir pada periode aktif.'}
              icon={ShoppingBag}
            >
              <div className="flex flex-col gap-1 min-h-[160px]">
                {recentOrders.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200/60 rounded-2xl">
                    <p className="text-xs font-bold text-slate-600">Belum ada transaksi</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{activeStatus ? 'Tidak ada order dengan status ini.' : 'Semua data pesanan kosong.'}</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2.5 border-b border-slate-100/70 last:border-0">
                      <div className="text-left min-w-0">
                        <span className="text-xs font-black text-slate-800 block truncate">{order.invoice_number}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">{order.shipping_name}</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-black text-[#FF5FB2] block tabular-nums">{formatCurrency(order.total_amount)}</span>
                        <span className={`inline-block text-[8px] font-black border uppercase px-1.5 py-0.5 rounded mt-1 ${statusBadge(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 text-right">
                <Link href={ROUTES.ADMIN_ORDERS} className="inline-flex items-center gap-1 text-xs font-black text-[#FF5FB2] hover:underline">
                  Semua Pesanan <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ChartCard>
          </motion.div>
        </div>

        {/* ================= LOG AKTIVITAS ADMIN + AKTIVITAS JOIN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <ChartCard
            title="Aktivitas Join Terbaru"
            subtitle={counts.joinPending > 0 ? `${counts.joinPending} pendaftaran masih pending.` : '6 pendaftar terakhir dari form Join Us.'}
            icon={UserPlus}
          >
            <div className="flex flex-col gap-1 min-h-[160px]">
              {joinSubs.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200/60 rounded-2xl">
                  <span className="size-11 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/40 flex items-center justify-center mb-3">
                    <UserPlus className="w-5.5 h-5.5" />
                  </span>
                  <p className="text-xs font-bold text-slate-600">Belum ada pendaftar</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pendaftaran dari form Join Us akan tampil di sini.</p>
                </div>
              ) : (
                joinSubs.map((sub) => {
                  const typeMeta = JOIN_TYPE_META[sub.type] || { label: sub.type, badge: 'bg-slate-50 text-slate-600 border-slate-200/40' };
                  const subStatusMeta = JOIN_STATUS_META[sub.status] || JOIN_STATUS_META.pending;
                  return (
                    <div key={sub.id} className="flex justify-between items-center py-2.5 border-b border-slate-100/70 last:border-0">
                      <div className="text-left min-w-0">
                        <span className="text-xs font-black text-slate-800 block truncate">{sub.full_name || sub.nickname || 'Tanpa Nama'}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">
                          {sub.position_or_division || 'Pendaftaran keanggotaan'} &middot; {formatRelativeTime(sub.created_at)}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-3 flex flex-col items-end gap-1">
                        <span className={`inline-block text-[8px] font-black border uppercase px-1.5 py-0.5 rounded ${typeMeta.badge}`}>
                          {typeMeta.label}
                        </span>
                        <span className={`inline-block text-[8px] font-black border uppercase px-1.5 py-0.5 rounded ${subStatusMeta.badge}`}>
                          {subStatusMeta.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4 text-right">
              <Link href={ROUTES.ADMIN_JOIN_US} className="inline-flex items-center gap-1 text-xs font-black text-[#FF5FB2] hover:underline">
                Kelola Join Us <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard title="Aktivitas Log Admin Terbaru" subtitle="10 tindakan admin terakhir yang tercatat." icon={Clock}>
            {isITSupportUser && activities.length > 0 && (
              <div className="flex justify-end mb-2 -mt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ isOpen: true, id: null, isAll: true })}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 py-1.5 px-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Bersihkan Log
                </button>
              </div>
            )}
            <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200/60 rounded-2xl">
                  <span className="size-11 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/40 flex items-center justify-center mb-3">
                    <Clock className="w-5.5 h-5.5" />
                  </span>
                  <p className="text-xs font-bold text-slate-600">Tidak ada log aktivitas</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Semua tindakan admin tersimpan dengan bersih.</p>
                </div>
              ) : (
                activities.map((log) => {
                  const isITSupportLog = log.admin_username.toLowerCase() === TECH_SUPPORT_EMAIL;
                  return (
                    <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-slate-100/50 last:border-0 hover:bg-slate-50/30 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isITSupportLog ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.admin_username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-800 truncate">{log.admin_username}</span>
                            <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded ${
                              isITSupportLog ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isITSupportLog ? 'Admin Tech' : log.admin_username}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mt-1 break-words">{log.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{formatRelativeTime(log.created_at)}</span>
                        {isITSupportUser && (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ isOpen: true, id: log.id, isAll: false })}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus log ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ChartCard>
        </motion.div>
        </div>

        {/* ================= ZONA OPS: BACKUP & RESTORE ================= */}
        <motion.div variants={itemVariants} className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.12em]">Zona Ops — Gunakan dengan hati-hati</span>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-amber-600" /> Backup & Restore Data
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-2 border-t border-slate-100 pt-2">
              Hanya Admin Tech yang dapat melakukan restore data untuk mencegah konflik dengan proses produksi yang sedang berjalan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="/api/admin/export"
              download="iris-backup.json"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              onClick={() => { logAdminActivity('Download backup data (JSON export)'); }}
            >
              <Download className="h-4 w-4 text-slate-500" /> Unduh Backup JSON
            </a>
            <label
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl transition-colors ${
                isITSupportUser
                  ? 'bg-[#FF5FB2] hover:bg-[#e64c9d] text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              <input
                type="file"
                accept=".json"
                className="hidden"
                disabled={!isITSupportUser || isRestoring}
                onChange={handleRestoreFileChange}
              />
              <Upload className="h-4 w-4" /> {isRestoring ? 'Memulihkan...' : 'Restore Data JSON'}
            </label>
          </div>
        </motion.div>

        {/* ================= CONFIRM DIALOGS ================= */}
        <ConfirmDialog
          isOpen={confirmDelete.isOpen}
          title={confirmDelete.isAll ? 'Bersihkan Semua Log' : 'Hapus Log Aktivitas'}
          message={confirmDelete.isAll
            ? 'Apakah Anda yakin ingin menghapus seluruh log aktivitas admin? Tindakan ini tidak dapat dibatalkan.'
            : 'Apakah Anda yakin ingin menghapus entri log aktivitas ini?'
          }
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={handleConfirmDeleteActivity}
          onCancel={() => setConfirmDelete({ isOpen: false, id: null, isAll: false })}
        />
        <ConfirmDialog
          isOpen={confirmRestoreOpen}
          title="Pulihkan/Restore Data dari Backup?"
          message="PERINGATAN: Tindakan ini akan menghapus seluruh data yang ada saat ini di tabel events, news, recaps, recap_pages, monthly_recaps, gallery, dan mading_notes, lalu menggantinya dengan data dari file JSON cadangan. Apakah Anda yakin ingin melanjutkan?"
          confirmText="Ya, Restore Sekarang"
          cancelText="Batal"
          type="danger"
          onConfirm={handleConfirmRestore}
          onCancel={() => {
            setConfirmRestoreOpen(false);
            setRestorePayload(null);
          }}
        />

      </motion.div>
      )}
    </AnimatePresence>
  );
}
