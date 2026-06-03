import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ROUTES } from '../lib/constants';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  BookOpen, 
  Calendar, 
  Pin, 
  Newspaper, 
  Zap, 
  ShieldAlert, 
  ArrowUpRight, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: 'Total Merchandise', value: '...', icon: ShoppingBag, change: 'Total Produk', color: 'text-blue-500 bg-blue-50' },
    { label: 'Zine Terbit', value: '...', icon: BookOpen, change: 'Total Recap', color: 'text-purple-500 bg-purple-50' },
    { label: 'Jadwal Aktif', value: '...', icon: Calendar, change: 'Semua Event', color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Pesan Mading', value: '...', icon: Pin, change: 'Total Catatan', color: 'text-amber-500 bg-amber-50' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [merch, recaps, events, mading] = await Promise.all([
          supabase.from('merchandise').select('id', { count: 'exact' }),
          supabase.from('recaps').select('id', { count: 'exact' }),
          supabase.from('events').select('id', { count: 'exact' }),
          supabase.from('mading_notes').select('id', { count: 'exact' }),
        ]);

        setStats([
          { label: 'Total Merchandise', value: `${merch.count || 0} Produk`, icon: ShoppingBag, change: 'Koleksi merchandise aktif', color: 'text-blue-600 bg-blue-50' },
          { label: 'Zine Terbit', value: `${recaps.count || 0} Edisi`, icon: BookOpen, change: 'Recap mingguan & Zine digital', color: 'text-purple-600 bg-purple-50' },
          { label: 'Jadwal Aktif', value: `${events.count || 0} Jadwal`, icon: Calendar, change: 'Live streaming terdaftar', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pesan Mading', value: `${mading.count || 0} Catatan`, icon: Pin, change: 'Aspirasi & pesan komunitas', color: 'text-amber-600 bg-amber-50' },
        ]);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load stats:', err);
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Tambah Merchandise', link: ROUTES.ADMIN_MERCHANDISE, icon: ShoppingBag, color: 'hover:border-blue-500/50 hover:bg-blue-50/30 text-blue-600' },
    { label: 'Unggah Zine Baru', link: ROUTES.ADMIN_RECAPS, icon: BookOpen, color: 'hover:border-purple-500/50 hover:bg-purple-50/30 text-purple-600' },
    { label: 'Update Jadwal Stream', link: ROUTES.ADMIN_SCHEDULE, icon: Calendar, color: 'hover:border-emerald-500/50 hover:bg-emerald-50/30 text-emerald-600' },
    { label: 'Tulis Pengumuman', link: ROUTES.ADMIN_NEWS, icon: Newspaper, color: 'hover:border-amber-500/50 hover:bg-amber-50/30 text-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and profile greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Halo, Super Admin! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Selamat datang kembali di panel administrasi portal Website Intanium. Berikut rangkuman data Anda hari ini.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label} padding="normal" className="border border-[var(--border-color)] bg-white rounded-2xl relative overflow-hidden group hover:border-[var(--color-primary)] transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                  {stat.label}
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1 tracking-tight">
                  {stat.value}
                </h3>
                <span className="text-[11px] font-medium text-[var(--text-secondary)] block mt-2 flex items-center gap-1">
                  {stat.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2.5 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Akses Pintar
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link key={action.label} to={action.link} className="block w-full">
                  <Card padding="compact" className={`border border-[var(--border-color)] bg-white hover:shadow-sm rounded-xl transition-all flex items-center justify-between group ${action.color}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-transparent transition-all">
                        <ActionIcon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{action.label}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Stream Feed logs */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2.5 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[var(--color-primary)]" /> Log Moderasi & Pengajuan Terbaru
          </h3>
          
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white rounded-2xl p-5 shadow-sm">
            <div className="relative border-l border-gray-100 dark:border-gray-200 ml-3.5 pl-6 space-y-6 text-sm">
              
              {/* Log Item 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white shadow-sm">
                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                </span>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[var(--text-primary)]">Pembayaran INV-983482 Berhasil Dikonfirmasi</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PAID_VERIFIED</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Oleh Budi Santoso — Nominal Rp 325,000 (Anniversary Hoodie XL). Bukti transfer divalidasi sistem.
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Baru Saja
                  </span>
                </div>
              </div>

              {/* Log Item 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-sm">
                  <MessageSquare className="h-2.5 w-2.5 text-white" />
                </span>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[var(--text-primary)]">WibuGamer99 menempelkan mading</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">AUTO_APPROVED</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    "Stream Minecraft kemarin petjah abis kakk! Ditunggu collab bareng member lainnya kakk..."
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 10 menit yang lalu
                  </span>
                </div>
              </div>

              {/* Log Item 3 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center border-4 border-white shadow-sm">
                  <AlertTriangle className="h-2.5 w-2.5 text-white" />
                </span>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-[var(--text-primary)]">RezaArt23 mengajukan fanart</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">PENDING_REVIEW</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    "Intan in Cyberpunk Neon World" — Menunggu verifikasi visual gambar untuk dipajang di galeri.
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 2 jam yang lalu
                  </span>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

