'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ROUTES } from '../lib/constants';
import { formatCurrency, logAdminActivity } from '../lib/helpers';
import { createClient } from '../utils/supabase/client';
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
  const supabase = createClient();
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

  // Log & Session States
  const [currentUserRole, setCurrentUserRole] = useState('staff');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserUsername, setCurrentUserUsername] = useState('');
  const [activities, setActivities] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isAll: false });

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

      // 6. Fetch session & user profile
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userEmail = session.user.email || '';
        setCurrentUserEmail(userEmail);
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

      // 7. Fetch admin activity logs (limit 10)
      const { data: logsData } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setActivities(logsData || []);

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
      const note = pendingMading.find(n => n.id === id);
      const author = note ? note.name : 'Anonim';

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
        await logAdminActivity(`Menyetujui komentar mading dari: ${author}`);
        
        // Fetch logs again to update UI
        const { data: logsData } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        setActivities(logsData || []);
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
        // Remove from local queue
        setPendingMading(prev => prev.filter(item => item.id !== id));
        // Update metrics
        setStatsData(prev => ({
          ...prev,
          pendingMadingCount: Math.max(0, prev.pendingMadingCount - 1),
          madingNotes: Math.max(0, prev.madingNotes - 1)
        }));
        notify.success('Pesan dihapus', 'Pesan mading berhasil dihapus.');
        await logAdminActivity(`Menghapus komentar mading dari: ${author}`);

        // Fetch logs again to update UI
        const { data: logsData } = await supabase
          .from('admin_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        setActivities(logsData || []);
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

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'baru saja';
    } else if (diffMin < 60) {
      return `${diffMin} menit yang lalu`;
    } else if (diffHour < 24) {
      return `${diffHour} jam yang lalu`;
    } else if (diffDay === 1) {
      return 'kemarin';
    } else if (diffDay < 7) {
      return `${diffDay} hari yang lalu`;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  };

  const handleDeleteActivity = (id) => {
    setConfirmDelete({ isOpen: true, id, isAll: false });
  };

  const handleClearAllActivities = () => {
    setConfirmDelete({ isOpen: true, id: null, isAll: true });
  };

  const handleConfirmDeleteActivity = async () => {
    const { id, isAll } = confirmDelete;
    setConfirmDelete({ isOpen: false, id: null, isAll: false });

    if (currentUserEmail.toLowerCase() !== 'it_support@intanium.admin') {
      notify.error('Akses Ditolak', 'Hanya IT Support yang dapat mengelola log aktivitas.');
      return;
    }

    try {
      if (isAll) {
        const { error } = await supabase
          .from('admin_activity_logs')
          .delete()
          .neq('id', 0);
        if (error) throw error;

        notify.success('Log Dibersihkan', 'Seluruh log aktivitas admin telah berhasil dihapus.');
        await logAdminActivity('Membersihkan seluruh log aktivitas admin');
      } else {
        const { error } = await supabase
          .from('admin_activity_logs')
          .delete()
          .eq('id', id);
        if (error) throw error;

        notify.success('Aktivitas Dihapus', 'Entri log aktivitas telah dihapus.');
      }

      // Reload activities
      const { data: logsData } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setActivities(logsData || []);
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus log', err.message);
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
        <Loading message="Memuat informasi dashboard…" />
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
          className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-8 text-slate-800 shadow-xs flex flex-col justify-between min-h-[160px] text-left border-l-4 border-l-[#170C79] group"
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(23,12,121,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,12,121,0.01)_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] pointer-events-none" />
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[#170C79]/5 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 z-10 text-left">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#170C79]/5 border border-[#170C79]/10 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] text-[#170C79]">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                Sistem Aktif
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.12em] border ${
                currentUserRole === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                currentUserRole === 'coordinator' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-slate-50 text-slate-700 border-slate-100'
              }`}>
                {currentUserRole === 'super_admin' ? 'IT Support' : currentUserRole === 'coordinator' ? 'Koordinator' : 'Staff Admin'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-slate-800">
              Selamat Datang, {currentUserUsername || 'Admin'}!
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Email: {currentUserEmail} • Kelola data penjualan, moderasi pesan mading penggemar, dan update jadwal kegiatan Intanium dari satu panel kendali terpadu.
            </p>
          </div>
        </motion.div>

        {/* Warning & Alerts Card (colspan-1) */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl border p-6 flex items-center gap-5 text-left relative overflow-hidden transition-colors duration-200 ${statsData.pendingMadingCount > 0
            ? 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-xs'
            : 'bg-emerald-50/30 border-emerald-200 text-emerald-900 shadow-xs'
            }`}
        >
          {statsData.pendingMadingCount > 0 ? (
            <>
              <div className="size-13 rounded-2xl bg-amber-100/80 border border-amber-200/50 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
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
              <div className="size-13 rounded-2xl bg-emerald-100 border border-emerald-200/40 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
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
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-colors duration-200 hover:scale-[1.01] hover:border-[#170C79]/30 hover:shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Pendapatan Toko</span>
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/40 text-[#170C79] transition-transform group-hover:scale-105">
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
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-colors duration-200 hover:scale-[1.01] hover:border-[#170C79]/30 hover:shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Katalog Merch</span>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100/40 text-blue-600 transition-transform group-hover:scale-105">
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
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-colors duration-200 hover:scale-[1.01] hover:border-[#170C79]/30 hover:shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Jadwal Kegiatan</span>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100/40 text-emerald-600 transition-transform group-hover:scale-105">
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
          <Card hoverEffect={false} className="border border-slate-200/80 bg-white rounded-2xl p-5 text-left transition-colors duration-200 hover:scale-[1.01] hover:border-[#170C79]/30 hover:shadow-xs relative overflow-hidden">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.08em]">Order Pending</span>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100/40 text-amber-500 transition-transform group-hover:scale-105">
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
          className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5 text-left"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-[#170C79] flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#170C79]" />
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
                      className={`border border-l-[5px] rounded-xl p-4 flex items-center justify-between gap-4 transition-colors duration-200 ${noteStyle} ${isBusy ? 'opacity-50 pointer-events-none' : ''
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
                          type="button"
                          onClick={() => handleQuickApprove(note.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-black flex items-center gap-1 shadow-xs transition-colors duration-200 cursor-pointer active:scale-95"
                          title="Setujui komentar mading"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Setujui
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
          </div>

          <div className="border-t border-slate-100 pt-3 text-right">
            <Link href={ROUTES.ADMIN_MADING} className="inline-flex items-center gap-1 text-xs font-black text-[#170C79] hover:underline">
              Kelola Mading Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Orders List (colspan-1) */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5 text-left"
        >
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-[#170C79] flex items-center gap-2">
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
                      <span className="text-xs font-black text-[#170C79] block tabular-nums">
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
            <Link href={ROUTES.ADMIN_ORDERS} className="inline-flex items-center gap-1 text-xs font-black text-[#170C79] hover:underline">
              Semua Pesanan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>

      {/* ================= ADMIN ACTIVITY LOGS PANEL ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-5 text-left"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h4 className="text-sm font-black text-[#170C79] flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-[#170C79]" />
            Aktivitas Log Admin Terbaru
          </h4>
          {currentUserEmail.toLowerCase() === 'it_support@intanium.admin' && activities.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllActivities}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 py-1.5 px-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bersihkan Log
            </button>
          )}
        </div>

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
              const isITSupport = log.admin_username.toLowerCase() === 'it_support@intanium.admin';
              return (
                <div
                  key={log.id}
                  className="flex justify-between items-center py-2.5 border-b border-slate-100/50 last:border-0 hover:bg-slate-50/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isITSupport ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.admin_username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-800 truncate">{log.admin_username}</span>
                        <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded ${
                          isITSupport ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isITSupport ? 'IT Support' : 'Admin'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 mt-1 break-words">{log.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {formatRelativeTime(log.created_at)}
                    </span>
                    {currentUserEmail.toLowerCase() === 'it_support@intanium.admin' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(log.id)}
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
      </motion.div>

      {/* ================= QUICK ACTION MENU SHORTS ================= */}
      <motion.div
        variants={itemVariants}
        className="space-y-4 text-left border-t border-slate-200/50 pt-6"
      >
        <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
          Akses Pintar Menu
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Link href={ROUTES.ADMIN_MERCHANDISE} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[#170C79] hover:border-[#170C79]/40 hover:shadow-xs transition-colors duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Tambah Produk</span>
            </Card>
          </Link>

          <Link href={ROUTES.ADMIN_RECAPS} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[#170C79] hover:border-[#170C79]/40 hover:shadow-xs transition-colors duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Unggah Zine</span>
            </Card>
          </Link>

          <Link href={ROUTES.ADMIN_SCHEDULE} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[#170C79] hover:border-[#170C79]/40 hover:shadow-xs transition-colors duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Buat Jadwal</span>
            </Card>
          </Link>

          <Link href={ROUTES.ADMIN_NEWS} className="group">
            <Card hoverEffect={false} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-center font-bold text-slate-700 hover:text-[#170C79] hover:border-[#170C79]/40 hover:shadow-xs transition-colors duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer">
              <Newspaper className="w-4 h-4 text-rose-500" />
              <span>Tulis Berita</span>
            </Card>
          </Link>

        </div>
      </motion.div>

      {/* ================= CONFIRM DIALOG FOR LOG DELETION ================= */}
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

    </motion.div>
  );
}


