import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { ROUTES } from '../lib/constants';
import { formatCurrency } from '../lib/helpers';
import { supabase } from '../lib/supabaseClient';
import { madingService } from '../features/mading/madingService';
import { useAdminToast } from '../components/common/useAdminToast';
import {
  ShoppingBag,
  BookOpen,
  Calendar,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Zap,
  ArrowUpRight,
  Clock,
  Check,
  Trash2,
  TrendingUp,
  Newspaper,
  CheckCircle2
} from 'lucide-react';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

export default function DashboardPage() {
  const notify = useAdminToast();
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [statsData, setStatsData] = useState({
    revenue: 0,
    products: 0,
    schedules: 0,
    madingNotes: 0,
    pendingMadingCount: 0,
    pendingOrdersCount: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingMading, setPendingMading] = useState([]);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch merchandise count (excluding settings row)
      const { count: merchCount } = await supabase
        .from('merchandise')
        .select('id', { count: 'exact', head: true })
        .neq('id', 'payment_settings');

      // 2. Fetch events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true });

      // 3. Fetch mading notes count (total)
      const { count: madingCount } = await supabase
        .from('mading_notes')
        .select('id', { count: 'exact', head: true });

      // 4. Fetch orders for revenue & pending count & recent orders
      const { data: rawOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const mappedOrders = rawOrders ? rawOrders.map(order => ({
        id: order.id,
        invoice_number: order.invoice_number,
        shipping_name: order.order_data?.name || '-',
        total_amount: Number(order.order_data?.totalAmount || 0),
        status: order.order_data?.status || 'pending_review',
        created_at: order.created_at
      })) : [];

      // Calculate stats
      const paidStatuses = ['paid', 'processing', 'ready_for_pickup', 'shipped', 'completed'];
      const totalRevenue = mappedOrders
        .filter(order => paidStatuses.includes(order.status))
        .reduce((sum, order) => sum + order.total_amount, 0);

      const pendingOrdersCount = mappedOrders
        .filter(order => ['pending_review', 'waiting_payment'].includes(order.status))
        .length;

      // 5. Fetch pending mading notes for quick moderation
      const { data: rawMadingNotes } = await supabase
        .from('mading_notes')
        .select('*')
        .order('created_at', { ascending: false });

      const mappedMading = rawMadingNotes ? rawMadingNotes.map(note => ({
        id: note.id,
        name: note.name || 'Anonim',
        message: note.message,
        themeColor: note.theme_color,
        createdAt: note.created_at,
        isApproved: note.is_approved
      })) : [];

      const pendingMadingNotes = mappedMading.filter(note => !note.isApproved);

      setStatsData({
        revenue: totalRevenue,
        products: merchCount || 0,
        schedules: eventsCount || 0,
        madingNotes: madingCount || 0,
        pendingMadingCount: pendingMadingNotes.length,
        pendingOrdersCount: pendingOrdersCount
      });

      // Take last 3 orders
      setRecentOrders(mappedOrders.slice(0, 3));
      // Take last 3 pending notes
      setPendingMading(pendingMadingNotes.slice(0, 3));

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await madingService.approveNote(id);
      if (res.success) {
        // Remove from local queue
        setPendingMading(prev => prev.filter(item => item.id !== id));
        // Update metrics
        setStatsData(prev => ({
          ...prev,
          pendingMadingCount: Math.max(0, prev.pendingMadingCount - 1)
        }));
        notify.success('Pesan disetujui', 'Pesan mading disetujui dan kini tayang di halaman utama.');
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
      const res = await madingService.deleteNote(id);
      if (res.success) {
        // Remove from local queue
        setPendingMading(prev => prev.filter(item => item.id !== id));
        // Update metrics
        setStatsData(prev => ({
          ...prev,
          pendingMadingCount: Math.max(0, prev.pendingMadingCount - 1),
          madingNotes: Math.max(0, prev.madingNotes - 1)
        }));
        notify.success('Pesan dihapus', 'Pesan mading berhasil dihapus.');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: PREMIUM_EASE } }
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    const styles = {
      pending_review: 'bg-purple-50 text-purple-600 border-purple-200/40',
      waiting_payment: 'bg-amber-50 text-amber-600 border-amber-200/40',
      paid: 'bg-blue-50 text-blue-600 border-blue-200/40',
      completed: 'bg-emerald-50 text-emerald-600 border-emerald-200/40',
      cancelled: 'bg-rose-50 text-rose-500 border-rose-200/40'
    };
    const defaultStyle = 'bg-slate-50 text-slate-600 border-slate-200/40';
    return styles[status] || defaultStyle;
  };

  const madingColorsMap = {
    pink: 'bg-[#ffe5ec] border-pink-200 text-pink-700',
    lavender: 'bg-[#f3e8ff] border-purple-200 text-purple-700',
    yellow: 'bg-[#fef9c3] border-yellow-200 text-yellow-700',
    blue: 'bg-[#e0f2fe] border-sky-200 text-blue-700',
    peach: 'bg-[#ffedd5] border-orange-200 text-orange-700',
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loading message="Memuat informasi dashboard..." />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 select-none"
    >

      {/* ================= HEADER BENTO LAYOUT ROW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Welcome Card (colspan-2) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#170C79] via-[#1f129e] to-[#2d1ebd] p-8 text-white shadow-lg flex flex-col justify-between min-h-[160px] text-left group"
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] pointer-events-none" />
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/12 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.12em]">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Sistem Aktif
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat Datang, Super Admin!
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-indigo-100 font-semibold leading-relaxed">
              Kelola data penjualan, moderasi pesan mading penggemar, dan update jadwal kegiatan Intanium dari satu panel kendali terpadu.
            </p>
          </div>
        </motion.div>

        {/* Warning & Alerts Card (colspan-1) */}
        <motion.div
          variants={itemVariants}
          className={`rounded-[2rem] border p-6 flex items-center gap-5 text-left relative overflow-hidden transition-all duration-300 ${statsData.pendingMadingCount > 0
            ? 'bg-amber-50/75 border-amber-200/60 text-amber-900 shadow-[0_4px_20px_rgba(245,158,11,0.04)]'
            : 'bg-emerald-50/60 border-emerald-200/50 text-emerald-900'
            }`}
        >
          {statsData.pendingMadingCount > 0 ? (
            <>
              <div className="size-13 rounded-2xl bg-amber-100 border border-amber-200/50 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-600/80 uppercase tracking-[0.1em] block">Tindakan Diperlukan</span>
                <h4 className="text-sm font-black text-amber-800 tracking-tight">{statsData.pendingMadingCount} Mading Menunggu Approval</h4>
                <p className="text-[11px] text-amber-700 font-semibold leading-normal">Segera review kiriman mading penggemar di kolom moderasi cepat.</p>
              </div>
            </>
          ) : (
            <>
              <div className="size-13 rounded-2xl bg-emerald-100 border border-emerald-200/40 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-[0.1em] block">Moderasi Aman</span>
                <h4 className="text-sm font-black text-emerald-800 tracking-tight">Semua Mading Bersih</h4>
                <p className="text-[11px] text-emerald-700 font-semibold leading-normal">Tidak ada pesan pending baru yang perlu dimoderasi saat ini.</p>
              </div>
            </>
          )}
        </motion.div>

      </div>

      {/* ================= METRICS GRID PANELS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Metric 1: Revenue */}
        <motion.div variants={itemVariants} className="group">
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.015] hover:border-[var(--color-primary)]/30 hover:shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Pendapatan Toko</span>
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/40 text-[var(--color-primary)] group-hover:scale-105 transition-transform">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-3.5 tracking-tight tabular-nums">
              {formatCurrency(statsData.revenue)}
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 mt-2 block flex items-center gap-1">
              ● Transaksi Berhasil
            </span>
          </Card>
        </motion.div>

        {/* Metric 2: Merchandise */}
        <motion.div variants={itemVariants} className="group">
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.015] hover:border-[var(--color-primary)]/30 hover:shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Katalog Merch</span>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100/40 text-blue-600 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-3.5 tracking-tight">
              {statsData.products} Produk
            </h3>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block">
              Merchandise terbit & aktif
            </span>
          </Card>
        </motion.div>

        {/* Metric 3: Schedules */}
        <motion.div variants={itemVariants} className="group">
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.015] hover:border-[var(--color-primary)]/30 hover:shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Jadwal Kegiatan</span>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100/40 text-emerald-600 group-hover:scale-105 transition-transform">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-3.5 tracking-tight">
              {statsData.schedules} Acara
            </h3>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block">
              Linimasa bulan berjalan
            </span>
          </Card>
        </motion.div>

        {/* Metric 4: Pending Orders */}
        <motion.div variants={itemVariants} className="group">
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.015] hover:border-[var(--color-primary)]/30 hover:shadow-md relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Order Pending</span>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100/40 text-amber-500 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-3.5 tracking-tight">
              {statsData.pendingOrdersCount} Transaksi
            </h3>
            <span className="text-[10px] font-bold text-amber-600 mt-2 block">
              Butuh validasi / bayar
            </span>
          </Card>
        </motion.div>

      </div>

      {/* ================= BENTO GRID CORE CORE MODULES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Real-time Mading Moderation Queue (colspan-2) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between gap-5 text-left"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-[var(--color-primary)] flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-cyan-600" />
                Antrean Moderasi Mading Cepat
              </h4>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/30">
                Real-Time
              </span>
            </div>

            <div className="flex flex-col gap-3.5 min-h-[180px]">
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
                      className={`border border-l-[5px] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 ${noteStyle} ${isBusy ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-black tracking-wide block opacity-75">{note.name}</span>
                        <p className="text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap">
                          {note.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleQuickApprove(note.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-black flex items-center gap-1 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                          title="Setujui komentar mading"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleQuickDelete(note.id)}
                          className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/30 hover:border-rose-200 rounded-xl p-2 transition-all duration-200 cursor-pointer"
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
          </div>

          <div className="border-t border-slate-100 pt-3 text-right">
            <Link to={ROUTES.ADMIN_MADING} className="inline-flex items-center gap-1 text-xs font-black text-[var(--color-primary)] hover:underline">
              Kelola Mading Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Orders List (colspan-1) */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between gap-5 text-left"
        >
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-[var(--color-primary)] flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-blue-600" />
                Order Baru Terbaru
              </h4>
            </div>

            <div className="flex flex-col gap-3 min-h-[180px]">
              {recentOrders.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-dashed border-slate-200/60 rounded-2xl">
                  <p className="text-xs font-bold text-slate-600">Belum ada transaksi</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Semua data pesanan kosong.</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center py-2.5 border-b border-slate-100/70 last:border-0"
                  >
                    <div className="text-left min-w-0">
                      <span className="text-xs font-black text-slate-800 block truncate">{order.invoice_number}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">{order.shipping_name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[var(--color-primary)] block tabular-nums">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <span className={`inline-block text-[8px] font-black border uppercase px-1.5 py-0.5 rounded mt-1 ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-right">
            <Link to={ROUTES.ADMIN_ORDERS} className="inline-flex items-center gap-1 text-xs font-black text-[var(--color-primary)] hover:underline">
              Semua Pesanan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>

      {/* ================= QUICK ACTION MENU SHORTS ================= */}
      <motion.div
        variants={itemVariants}
        className="space-y-4 text-left border-t border-slate-200/50 pt-6"
      >
        <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
          Akses Pintar Menu
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Link to={ROUTES.ADMIN_MERCHANDISE} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-xs">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Tambah Produk</span>
            </Card>
          </Link>

          <Link to={ROUTES.ADMIN_RECAPS} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-xs">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Unggah Zine</span>
            </Card>
          </Link>

          <Link to={ROUTES.ADMIN_SCHEDULE} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Buat Jadwal</span>
            </Card>
          </Link>

          <Link to={ROUTES.ADMIN_NEWS} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-xs">
              <Newspaper className="w-4 h-4 text-rose-500" />
              <span>Tulis Berita</span>
            </Card>
          </Link>

        </div>
      </motion.div>

    </motion.div>
  );
}


