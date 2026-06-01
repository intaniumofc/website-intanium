import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ROUTES } from '../lib/constants';
import { Link } from 'react-router-dom';
import { ShoppingBag, BookOpen, Calendar, Pin, Newspaper, Zap, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Merchandise', value: '4 Produk', icon: ShoppingBag, change: 'Edisi Anniversary' },
    { label: 'Zine Terbit', value: '2 Edisi', icon: BookOpen, change: 'Edisi Summer' },
    { label: 'Jadwal Aktif', value: '3 Siaran', icon: Calendar, change: 'Minggu Ini' },
    { label: 'Pesan Mading', value: '24 Tertempel', icon: Pin, change: 'Butuh Moderasi' },
  ];

  const quickActions = [
    { label: 'Tambah Merchandise', link: ROUTES.ADMIN_MERCHANDISE, icon: ShoppingBag },
    { label: 'Unggah Zine Baru', link: ROUTES.ADMIN_RECAPS, icon: BookOpen },
    { label: 'Update Jadwal Stream', link: ROUTES.ADMIN_SCHEDULE, icon: Calendar },
    { label: 'Tulis Pengumuman', link: ROUTES.ADMIN_NEWS, icon: Newspaper },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and profile greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Halo, Super Admin!
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
            <Card key={stat.label} padding="normal" className="border border-[var(--border-color)] relative overflow-hidden group hover:border-[var(--color-primary)] transition-all">
              <IconComponent className="h-8 w-8 text-[var(--color-primary)] mb-3 opacity-90" />
              <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">
                {stat.label}
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1.5 leading-none">
                {stat.value}
              </h3>
              <span className="text-[10px] font-semibold text-purple-400 block mt-2">
                {stat.change}
              </span>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" /> Akses Pintar
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link key={action.label} to={action.link} className="block w-full">
                  <Card padding="compact" className="border border-[var(--border-color)] hover:border-purple-500/50 hover:bg-[var(--color-primary-light)] transition-all flex items-center gap-3">
                    <ActionIcon className="h-5 w-5 text-purple-300" />
                    <span className="text-xs font-bold text-purple-300">{action.label}</span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Stream Feed logs */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-400" /> Log Moderasi & Pengajuan Terbaru
          </h3>
          
          <Card hoverEffect={false} className="border border-[var(--border-color)] space-y-4">
            <div className="divide-y divide-[var(--border-color)] text-xs sm:text-sm">
              <div className="flex justify-between py-3 items-start gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white block">WibuGamer99 menempelkan mading</span>
                  <p className="text-xs text-[var(--text-secondary)]">"Stream Minecraft kemarin petjah abis kakk! Ditunggu collab..."</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AUTO_APPROVED</span>
              </div>

              <div className="flex justify-between py-3 items-start gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white block">RezaArt23 mengajukan fanart</span>
                  <p className="text-xs text-[var(--text-secondary)]">"Intan in Cyberpunk Neon World" - Awaiting photo proof verification</p>
                </div>
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">PENDING_REVIEW</span>
              </div>

              <div className="flex justify-between py-3 items-start gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Pembayaran Invoice INV-983482 Berhasil Dikonfirmasi</span>
                  <p className="text-xs text-[var(--text-secondary)]">Oleh Budi Santoso - Rp 325,000 (Anniversary Hoodie XL)</p>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">PAID_VERIFIED</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
