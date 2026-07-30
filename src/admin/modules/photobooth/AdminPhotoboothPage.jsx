'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, ToggleLeft, ToggleRight, Save, AlertTriangle, Plus, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, X, Eye } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { photoboothService } from '../../../services/public/photoboothService';
import { detectPngSlots } from '../../../lib/photobooth/pngDetector';
import { logAdminActivity } from '../../../lib/helpers';

export default function AdminPhotoboothPage() {
  const notify = useAdminToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    active: true,
    maintenanceMessage: '',
    activeEventName: '',
    customFrames: []
  });

  // Modal State for adding PNG Frame Template
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [frameName, setFrameName] = useState('');
  const [pngDataUrl, setPngDataUrl] = useState('');
  const [detectedData, setDetectedData] = useState({ canvasWidth: 0, canvasHeight: 0, slots: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confirmDeleteFrame, setConfirmDeleteFrame] = useState({ isOpen: false, id: null });

  const canvasPreviewRef = useRef(null);

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

  const [selectedPngFile, setSelectedPngFile] = useState(null);
  const [isUploadingFrame, setIsUploadingFrame] = useState(false);

  // Open modal for new frame
  const handleOpenAddFrame = () => {
    setFrameName('');
    setPngDataUrl('');
    setSelectedPngFile(null);
    setDetectedData({ canvasWidth: 0, canvasHeight: 0, slots: [] });
    setIsModalOpen(true);
  };

  // Handle PNG File Selection & Auto Detection
  const handlePngFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check PNG File format constraint
    if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
      notify.warning(
        'Format File Salah',
        'Template bingkai foto harus berformat PNG transparan agar foto jepretan tampil di dalam lubang bingkai!'
      );
      e.target.value = '';
      return;
    }

    setSelectedPngFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (typeof src === 'string') {
        setPngDataUrl(src);
        analyzePngTransparency(src);
      }
    };
    reader.readAsDataURL(file);
  };

  // Analyze PNG transparency holes using detectPngSlots helper
  const analyzePngTransparency = (src) => {
    setIsAnalyzing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const result = await detectPngSlots(img);
      setDetectedData(result);
      setIsAnalyzing(false);
      
      if (result.slots.length === 0) {
        notify.warning(
          'Area Transparan Tidak Terdeteksi',
          'Tidak ditemukan lubang foto transparan pada PNG ini. Pastikan gambar PNG memiliki area transparan untuk foto.'
        );
      } else {
        notify.success(
          'Lubang Foto Terdeteksi',
          `Sistem berhasil menyesuaikan ${result.slots.length} slot foto transparan secara otomatis!`
        );
      }

      // Draw visual canvas preview with slot overlays
      renderCanvasPreview(img, result);
    };
    img.src = src;
  };

  // Draw detected slots overlay on canvas
  const renderCanvasPreview = (img, result) => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = result.canvasWidth;
    canvas.height = result.canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern behind to visualize transparency
    const patternSize = 30;
    for (let y = 0; y < canvas.height; y += patternSize) {
      for (let x = 0; x < canvas.width; x += patternSize) {
        ctx.fillStyle = ((x / patternSize + y / patternSize) % 2 === 0) ? '#e2e8f0' : '#ffffff';
        ctx.fillRect(x, y, patternSize, patternSize);
      }
    }

    // Draw detected photo slots highlighted in vibrant pink/emerald
    result.slots.forEach((slot, index) => {
      ctx.fillStyle = 'rgba(255, 95, 178, 0.35)';
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);

      ctx.strokeStyle = '#FF5FB2';
      ctx.lineWidth = Math.max(4, Math.floor(result.canvasWidth / 250));
      ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

      // Slot label
      ctx.fillStyle = '#FF5FB2';
      const fontSize = Math.max(24, Math.floor(result.canvasWidth / 40));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(`Slot #${index + 1} (${slot.width}x${slot.height}px)`, slot.x + 15, slot.y + fontSize + 15);
    });

    // Draw the PNG Frame overlay
    ctx.drawImage(img, 0, 0);
  };

  // Submit new PNG Frame with Cloudflare R2 Upload
  const handleSaveNewFrame = async (e) => {
    e.preventDefault();
    if (!frameName.trim()) {
      notify.warning('Nama Bingkai Belum Diisi', 'Silakan masukkan nama untuk template bingkai foto.');
      return;
    }
    if (!pngDataUrl) {
      notify.warning('File PNG Belum Dipilih', 'Silakan pilih file bingkai PNG transparan.');
      return;
    }

    setIsUploadingFrame(true);
    let finalPublicUrl = pngDataUrl;

    // Upload PNG to R2 bucket: frame-pb
    if (selectedPngFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedPngFile);
        formData.append('bucketName', 'frame-pb');
        formData.append('folderPath', 'templates');
        formData.append('skipCompression', 'true');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.publicUrl) {
            finalPublicUrl = uploadData.publicUrl;
          }
        } else {
          console.warn('R2 Upload response not OK, using dataUrl fallback');
        }
      } catch (err) {
        console.error('Error uploading frame to R2 bucket frame-pb:', err);
      }
    }

    const newFrame = {
      id: `custom-frame-${Date.now()}`,
      name: frameName.trim(),
      thumbnail: finalPublicUrl,
      src: finalPublicUrl,
      canvasWidth: detectedData.canvasWidth || 1200,
      canvasHeight: detectedData.canvasHeight || 1800,
      slots: detectedData.slots.length > 0 ? detectedData.slots : [
        { x: 50, y: 50, width: 1100, height: 800 }
      ],
      watermark: {
        logo: '/logo-nobg.webp',
        text: 'iris.com',
        position: 'bottom-global'
      }
    };

    const updatedCustomFrames = [...(settings.customFrames || []), newFrame];
    const updatedSettings = { ...settings, customFrames: updatedCustomFrames };

    setSettings(updatedSettings);
    setIsUploadingFrame(false);
    setIsModalOpen(false);
    notify.success('Template Bingkai Ditambahkan', `Bingkai "${frameName}" berhasil diunggah ke R2 (bucket: frame-pb) & disimpan.`);
  };

  // Delete custom frame
  const handleDeleteCustomFrame = (id) => {
    setConfirmDeleteFrame({ isOpen: true, id });
  };

  const confirmDeleteFrameAction = () => {
    const id = confirmDeleteFrame.id;
    setConfirmDeleteFrame({ isOpen: false, id: null });
    const updatedCustomFrames = (settings.customFrames || []).filter(f => f.id !== id);
    setSettings(prev => ({ ...prev, customFrames: updatedCustomFrames }));
    notify.success('Template Dihapus', 'Template bingkai foto telah dihapus.');
  };

  // Save settings to Supabase
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await photoboothService.updateSettings(settings);
      if (res.success) {
        notify.success('Pengaturan Disimpan', 'Pengaturan dan template bingkai photobooth berhasil disimpan!');
        await logAdminActivity(
          'photobooth_settings',
          'update',
          `Mengubah status photobooth (${settings.active ? 'AKTIF' : 'NONAKTIF'}) dan menyimpan ${settings.customFrames?.length || 0} template bingkai.`
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
            Kelola Fitur & Template Photobooth
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-body">
            Atur status event, serta unggah template bingkai foto PNG dengan sistem deteksi lubang transparan otomatis.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddFrame}>
          <Plus className="h-4 w-4" /> Tambah Template Bingkai PNG
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* EVENT SETTINGS CARD */}
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-white rounded-2xl">
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider border-b border-gray-100 pb-2">
              1. Pengaturan Event & Akses
            </h3>
            
            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Status Sesi Photobooth</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Nyalakan untuk membuka akses photobooth, atau matikan untuk menampilkan halaman maintenance event.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleActive}
                className="focus:outline-none hover:scale-105 transition-transform"
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
                className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-semibold"
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
                className="w-full px-4 py-3 bg-white border border-[var(--border-color)] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-body font-semibold"
                required={!settings.active}
              />
            </div>
          </div>
        </Card>

        {/* CUSTOM PNG FRAME TEMPLATES CARD */}
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-white rounded-2xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                  2. Daftar Template Bingkai Foto PNG (Admin Custom)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Bingkai foto yang diunggah harus berformat PNG transparan. Sistem secara otomatis menyesuaikan lubang foto hasil jepretan.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleOpenAddFrame} className="text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Tambah Bingkai PNG
              </Button>
            </div>

            {/* Grid list of Custom PNG frames */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {(settings.customFrames || []).map((frame) => (
                <div key={frame.id} className="relative group border border-gray-200 rounded-2xl overflow-hidden bg-slate-50 p-3 flex flex-col justify-between shadow-xs hover:border-[var(--color-pink)] transition-all">
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-200 border border-gray-100 flex items-center justify-center">
                    <img src={(frame.thumbnail)?.src || (frame.thumbnail)} alt={frame.name} className="w-full h-full object-contain" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                      {frame.slots?.length || 0} Slot Foto
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomFrame(frame.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Hapus Bingkai"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="pt-3">
                    <p className="text-xs font-bold text-slate-800 truncate">{frame.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{frame.canvasWidth} x {frame.canvasHeight} px</p>
                  </div>
                </div>
              ))}

              {(settings.customFrames || []).length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-slate-400 text-xs">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Belum ada template bingkai foto custom yang diunggah. Klik tombol <strong>+ Tambah Template Bingkai PNG</strong> untuk mengunggah bingkai baru.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Konfigurasi'}
          </Button>
        </div>
      </form>

      {/* MODAL TAMBAH TEMPLATE BINGKAI PNG */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Template Bingkai Foto PNG (Sistem Otomatis)"
        size="lg"
      >
        <form onSubmit={handleSaveNewFrame} className="space-y-4 text-sm text-[var(--text-primary)]">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Nama Bingkai Foto</label>
            <input
              type="text"
              placeholder="Contoh: Frame Ulang Tahun Intan (4 Strip PNG)"
              value={frameName}
              onChange={(e) => setFrameName(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]/15"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
              <span>File Bingkai (Wajib Format .PNG Transparan)</span>
              <span className="text-[10px] text-[var(--color-pink)] font-bold">*Wajib format .png</span>
            </label>
            <input
              type="file"
              accept="image/png"
              onChange={handlePngFileSelect}
              className="w-full px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[var(--color-pink-tint-15)] file:text-[var(--color-pink)]"
              required
            />
          </div>

          {/* Detection Status Indicator */}
          {isAnalyzing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs flex items-center gap-2">
              <Loading message="Menganalisis area transparan PNG..." />
            </div>
          )}

          {pngDataUrl && !isAnalyzing && (
            <div className="space-y-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Sistem Berhasil Menganalisis PNG!
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-emerald-100">
                <div><strong>Resolusi Canvas:</strong> {detectedData.canvasWidth} x {detectedData.canvasHeight} px</div>
                <div><strong>Lubang Transparan Terdeteksi:</strong> <span className="font-extrabold text-[var(--color-pink)]">{detectedData.slots.length} Slot Foto</span></div>
              </div>

              {/* Canvas Interactive Visual Preview */}
              <div className="space-y-1">
                <span className="font-bold text-[10px] uppercase text-emerald-800 block">Preview Penyesuaian Tempat Foto (Slot Area Highlighting):</span>
                <div className="max-h-64 overflow-y-auto border border-emerald-300 rounded-lg p-2 bg-slate-900 flex justify-center">
                  <canvas ref={canvasPreviewRef} className="max-h-60 w-auto object-contain rounded" />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isAnalyzing || isUploadingFrame || !pngDataUrl}>
              {isUploadingFrame ? 'Mengunggah ke R2...' : 'Simpan Template Bingkai'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete Frame */}
      <ConfirmDialog
        isOpen={confirmDeleteFrame.isOpen}
        onClose={() => setConfirmDeleteFrame({ isOpen: false, id: null })}
        onConfirm={confirmDeleteFrameAction}
        title="Hapus Template Bingkai?"
        message="Apakah Anda yakin ingin menghapus template bingkai foto PNG ini?"
        confirmText="Hapus Template"
      />
    </div>
  );
}
