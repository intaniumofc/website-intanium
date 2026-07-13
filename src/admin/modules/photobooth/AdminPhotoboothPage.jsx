'use client';

import React, { useState, useEffect } from 'react';
import { Camera, ToggleLeft, ToggleRight, Save, AlertTriangle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { photoboothService } from '../../../services/public/photoboothService';
import { logAdminActivity } from '../../../lib/helpers';

export default function AdminPhotoboothPage() {
  const notify = useAdminToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    active: true,
    maintenanceMessage: '',
    activeEventName: ''
  });

  useEffect(() => {
    document.title = 'Kelola Photobooth | Admin IRIS';
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await photoboothService.getSettings();
      setSettings(data);
    } catch (err) {
      notify.error('Gagal Memuat', 'Gagal memuat pengaturan photobooth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = () => {
    setSettings(prev => ({ ...prev, active: !prev.active }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await photoboothService.updateSettings(settings);
      if (res.success) {
        notify.success('Pengaturan Disimpan', 'Pengaturan photobooth berhasil disimpan!');
        // Log admin activity
        await logAdminActivity(
          'photobooth_settings',
          'update',
          `Mengubah status photobooth menjadi ${settings.active ? 'AKTIF' : 'NONAKTIF'} untuk event: ${settings.activeEventName}`
        );
      } else {
        notify.error('Gagal Menyimpan', res.error);
      }
    } catch (err) {
      notify.error('Gagal Menyimpan', 'Terjadi kesalahan sistem saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading message="Memuat konfigurasi photobooth..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-[var(--text-primary)]">
            <Camera className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" />
            Kelola Fitur Photobooth
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-body">
            Aktifkan atau nonaktifkan fitur studio foto online untuk event spesial tertentu.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-white rounded-2xl">
          <div className="space-y-6">
            
            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Status Sesi Photobooth</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Nyalakan untuk membuka akses photobooth, atau matikan untuk menampilkan halaman maintenance event.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                className="focus:outline-hidden hover:scale-105 transition-transform"
              >
                {settings.active ? (
                  <ToggleRight className="h-12 w-12 text-emerald-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="h-12 w-12 text-slate-300 cursor-pointer" />
                )}
              </button>
            </div>

            {/* Event Name */}
            <div className="space-y-2 text-left">
              <label htmlFor="activeEventName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nama Event / Sesi Aktif
              </label>
              <input
                type="text"
                id="activeEventName"
                name="activeEventName"
                value={settings.activeEventName}
                onChange={handleChange}
                placeholder="Contoh: Event Ulang Tahun Intan ke-21"
                className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[var(--color-primary)] transition-colors font-semibold"
                required={settings.active}
              />
            </div>

            {/* Maintenance Message */}
            <div className="space-y-2 text-left">
              <label htmlFor="maintenanceMessage" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pesan Saat Photobooth Nonaktif
              </label>
              <textarea
                id="maintenanceMessage"
                name="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={handleChange}
                rows={3}
                placeholder="Pesan yang akan tampil di halaman ketika status dinonaktifkan..."
                className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[var(--color-primary)] transition-colors font-body font-semibold"
                required={!settings.active}
              />
            </div>

          </div>
        </Card>

        {/* Warning card when disabled */}
        {!settings.active && (
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs leading-relaxed text-left">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-bold block mb-0.5 text-amber-900">Photobooth Sedang Tidak Aktif</span>
              Pengguna yang mengunjungi halaman utama `/photobooth` akan diarahkan ke halaman informasi event/maintenance dan tidak dapat mengakses kamera maupun panel upload.
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="glow"
            disabled={isSaving}
            className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-xs"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
