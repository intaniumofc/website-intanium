'use client';

import { useState, useEffect } from 'react';
import { useCustomSearchParams } from '../../hooks/useCustomSearchParams';


import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import { aboutIntanService } from '../../features/about-intan/aboutIntanService';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeVideoMetadata,
  getYouTubeWatchUrl,
} from '../../lib/youtube';
import {
  User, BarChart3, ListMusic, Video, HelpCircle,
  Plus, Edit, Trash2
} from 'lucide-react';

const TABS = [
  { id: 'stats', label: 'Statistik', icon: BarChart3 },
  { id: 'setlists', label: 'Setlist & Unit Songs', icon: ListMusic },
  { id: 'videos', label: 'Video Highlights', icon: Video },
  { id: 'trivia', label: 'Trivia & Fakta', icon: HelpCircle },
];

// ==========================================
// REUSABLE ADMIN TABLE
// ==========================================
function AdminTable({ columns, data, onEdit, onDelete, emptyMessage }) {
  return (
    <Card hoverEffect={false} className="border border-(--border-color) bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
      <div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-(--text-secondary)">
            <thead className="text-xs uppercase bg-(--bg-primary)/80 text-(--text-secondary) font-bold border-b border-(--border-color)">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className={`px-6 py-4 ${col.className || ''}`}>{col.header}</th>
                ))}
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color)">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className={`px-6 py-4 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-(--text-muted) text-sm">
                    {emptyMessage || 'Tidak ada data'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-(--border-color)">
          {data.map(item => (
            <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col gap-3">
                {columns.map(col => (
                  <div key={col.key} className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) shrink-0 pt-0.5">{col.header}</span>
                    <div className={`text-sm text-right break-words min-w-0 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item) : item[col.key]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-(--border-color)/50 mt-1">
                <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100" title="Edit">
                  <Edit className="h-3.5 w-3.5" /> Ubah
                </button>
                <button onClick={() => onDelete(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-100" title="Hapus">
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="px-6 py-12 text-center text-(--text-muted) text-sm">
              {emptyMessage || 'Tidak ada data'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// STATS TAB
// ==========================================
function StatsTab() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ label: '', value: '', icon: '', description: '', sort_order: 0 });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchData = async () => { setIsLoading(true); setItems(await aboutIntanService.getStats()); setIsLoading(false); };
  useEffect(() => {
    let isCurrent = true;
    aboutIntanService.getStats().then(data => {
      if (isCurrent) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, []);

  const handleAdd = () => { setModalMode('add'); setEditingId(null); setFormData({ label: '', value: '', icon: '', description: '', sort_order: items.length + 1 }); setIsModalOpen(true); };
  const handleEdit = (item) => { setModalMode('edit'); setEditingId(item.id); setFormData({ label: item.label, value: item.value, icon: item.icon || '', description: item.description || '', sort_order: item.sort_order || 0 }); setIsModalOpen(true); };
  
  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await aboutIntanService.deleteStat(id);
    if (res.success) {
      fetchData();
      notify.success('Statistik dihapus', 'Data statistik berhasil dihapus.');
    } else notify.error('Gagal menghapus statistik', res.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label.trim() || !formData.value.trim()) { notify.warning('Data belum lengkap', 'Label dan nilai harus diisi.'); return; }
    setIsSubmitting(true);
    const result = modalMode === 'add'
      ? await aboutIntanService.createStat(formData)
      : await aboutIntanService.updateStat(editingId, formData);
    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Statistik ditambahkan' : 'Statistik diperbarui',
        'Perubahan statistik berhasil disimpan.'
      );
    } else notify.error('Gagal menyimpan statistik', result.error);
  };

  if (isLoading) return <div className="p-12"><Loading message="Memuat statistik…" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-(--text-secondary)">Kelola angka-angka statistik yang tampil di halaman profil Intan.</p>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Tambah Statistik
        </Button>
      </div>

      <AdminTable
        columns={[
          { key: 'label', header: 'Label', render: (item) => <span className="font-bold text-(--text-primary)">{item.label}</span> },
          { key: 'value', header: 'Nilai', render: (item) => <span className="font-bold text-(--color-primary)">{item.value}</span> },
          { key: 'icon', header: 'Ikon' },
          { key: 'description', header: 'Deskripsi', cellClassName: 'max-w-xs truncate text-xs' },
        ]}
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Belum ada data statistik."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Statistik Baru' : 'Edit Statistik'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Label</label>
            <input autoComplete="off" /* autocomplete="off" */ name="label" type="text" value={formData.label} onChange={e => setFormData(p => ({ ...p, label: e.target.value }))} placeholder="Contoh: Total Show Teater" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Nilai</label>
              <input autoComplete="off" /* autocomplete="off" */ name="value" type="text" value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))} placeholder="Contoh: 128+ Show" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Ikon</label>
              <input autoComplete="off" /* autocomplete="off" */ name="icon" type="text" value={formData.icon} onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))} placeholder="Theater, Radio, ListMusic, Mic2" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Deskripsi</label>
            <input autoComplete="off" /* autocomplete="off" */ name="description" type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Penjelasan singkat…" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-(--border-color)">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">{isSubmitting ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Statistik"
        message="Apakah Anda yakin ingin menghapus data statistik ini?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </>
  );
}

// ==========================================
// SETLISTS TAB
// ==========================================
function SetlistsTab() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', period: '', shows: '', theme: '', image_url: '', status: 'Aktif', note: '', sort_order: 0, unitSongsText: '' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchData = async () => { setIsLoading(true); setItems(await aboutIntanService.getSetlists()); setIsLoading(false); };
  useEffect(() => {
    let isCurrent = true;
    aboutIntanService.getSetlists().then(data => {
      if (isCurrent) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, []);

  const handleAdd = () => {
    setModalMode('add'); setEditingId(null);
    setFormData({ name: '', period: '', shows: '', theme: '', image_url: '', status: 'Aktif', note: '', sort_order: items.length + 1, unitSongsText: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (item) => {
    setModalMode('edit'); setEditingId(item.id);
    const songs = (item.unitSongs || []).map(s => s.song_name).join('\n');
    setFormData({ name: item.name, period: item.period, shows: item.shows || '', theme: item.theme || '', image_url: item.image_url || '', status: item.status || 'Aktif', note: item.note || '', sort_order: item.sort_order || 0, unitSongsText: songs });
    setIsModalOpen(true);
  };
  
  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await aboutIntanService.deleteSetlist(id);
    if (res.success) {
      fetchData();
      notify.success('Setlist dihapus', 'Setlist dan unit songs berhasil dihapus.');
    } else notify.error('Gagal menghapus setlist', res.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.period.trim()) { notify.warning('Data belum lengkap', 'Nama dan periode harus diisi.'); return; }
    setIsSubmitting(true);
    const unitSongs = formData.unitSongsText.split('\n').map(s => s.trim()).filter(s => s);
    const payload = { ...formData, unitSongs };
    delete payload.unitSongsText;
    const result = modalMode === 'add'
      ? await aboutIntanService.createSetlist(payload)
      : await aboutIntanService.updateSetlist(editingId, payload);
    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Setlist ditambahkan' : 'Setlist diperbarui',
        'Perubahan setlist berhasil disimpan.'
      );
    } else notify.error('Gagal menyimpan setlist', result.error);
  };

  if (isLoading) return <div className="p-12"><Loading message="Memuat setlist…" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-(--text-secondary)">Kelola setlist teater dan daftar unit songs Intan.</p>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Tambah Setlist
        </Button>
      </div>

      <AdminTable
        columns={[
          { key: 'name', header: 'Nama Setlist', render: (item) => <span className="font-bold text-(--text-primary)">{item.name}</span> },
          { key: 'period', header: 'Periode' },
          { key: 'shows', header: 'Total Show' },
          { key: 'theme', header: 'Tema', render: (item) => <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-(--color-primary-light) text-(--color-primary)">{item.theme}</span> },
          { key: 'unitSongs', header: 'Unit Songs', render: (item) => <span className="text-xs text-(--text-muted)">{(item.unitSongs || []).length} lagu</span> },
        ]}
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Belum ada setlist."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Setlist Baru' : 'Edit Setlist'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Nama Setlist</label>
              <input autoComplete="off" /* autocomplete="off" */ name="name" type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Contoh: Aitakatta" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Periode</label>
              <input autoComplete="off" /* autocomplete="off" */ name="period" type="text" value={formData.period} onChange={e => setFormData(p => ({ ...p, period: e.target.value }))} placeholder="Contoh: Desember 2024 - Sekarang" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Total Show</label>
              <input autoComplete="off" /* autocomplete="off" */ name="shows" type="text" value={formData.shows} onChange={e => setFormData(p => ({ ...p, shows: e.target.value }))} placeholder="45+ Shows" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Tema CSS</label>
              <input autoComplete="off" /* autocomplete="off" */ name="theme" type="text" value={formData.theme} onChange={e => setFormData(p => ({ ...p, theme: e.target.value }))} placeholder="aitakatta, pajama, kirakira" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Status</label>
              <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)">
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">URL Gambar Poster</label>
            <input autoComplete="off" /* autocomplete="off" */ name="image_url" type="text" value={formData.image_url} onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))} placeholder="/setlistaitakatta.webp" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Unit Songs (satu lagu per baris)</label>
            <textarea rows="5" value={formData.unitSongsText} onChange={e => setFormData(p => ({ ...p, unitSongsText: e.target.value }))} placeholder={"Nageki no Figure (Boneka yang Menyedihkan)\nGlass no I Love You\n..."} className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary) font-mono text-xs" />
            <p className="text-[10px] text-(--text-muted)">Tulis satu judul lagu unit per baris. Urutan sesuai baris.</p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-(--border-color)">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">{isSubmitting ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Setlist"
        message="Apakah Anda yakin ingin menghapus setlist ini? Unit songs di dalamnya juga akan ikut terhapus secara permanen."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </>
  );
}

// ==========================================
// VIDEOS TAB
// ==========================================
function VideosTab() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', youtube_url: '', category: 'Profile', duration: '', sort_order: 0 });
  const [isReadingMetadata, setIsReadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const parsedYouTubeId = extractYouTubeVideoId(formData.youtube_url);

  const fetchData = async () => { setIsLoading(true); setItems(await aboutIntanService.getVideos()); setIsLoading(false); };
  useEffect(() => {
    let isCurrent = true;
    aboutIntanService.getVideos().then(data => {
      if (isCurrent) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!parsedYouTubeId || !isModalOpen) return;

    let isCurrent = true;
    const timeout = window.setTimeout(async () => {
      setIsReadingMetadata(true);
      setMetadataError('');
      try {
        const metadata = await getYouTubeVideoMetadata(parsedYouTubeId);
        if (isCurrent) {
          setFormData(previous => ({ ...previous, title: metadata.title, duration: metadata.duration }));
        }
      } catch (error) {
        if (isCurrent) setMetadataError(error.message);
      } finally {
        if (isCurrent) setIsReadingMetadata(false);
      }
    }, 400);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [parsedYouTubeId, isModalOpen]);

  const handleAdd = () => { setModalMode('add'); setEditingId(null); setMetadataError(''); setFormData({ title: '', youtube_url: '', category: 'Profile', duration: '', sort_order: items.length + 1 }); setIsModalOpen(true); };
  const handleEdit = (item) => { setModalMode('edit'); setEditingId(item.id); setFormData({ title: item.title, youtube_url: getYouTubeWatchUrl(item.youtube_id), category: item.category, duration: item.duration || '', sort_order: item.sort_order || 0 }); setIsModalOpen(true); };
  const handleYouTubeUrlChange = (event) => {
    setIsReadingMetadata(false);
    setMetadataError('');
    setFormData(previous => ({ ...previous, youtube_url: event.target.value, title: '', duration: '' }));
  };
  
  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await aboutIntanService.deleteVideo(id);
    if (res.success) {
      fetchData();
      notify.success('Video dihapus', 'Video highlight berhasil dihapus.');
    } else notify.error('Gagal menghapus video', res.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.youtube_url.trim()) { notify.warning('Link belum diisi', 'Link YouTube harus diisi.'); return; }
    if (!parsedYouTubeId) { notify.warning('Link YouTube tidak valid', 'Gunakan link video, Shorts, live, embed, atau youtu.be.'); return; }
    if (!formData.title.trim() || !formData.duration.trim()) { notify.warning('Metadata belum siap', 'Tunggu hingga judul dan durasi video selesai dibaca.'); return; }
    const payload = { ...formData, youtube_id: parsedYouTubeId };
    delete payload.youtube_url;
    setIsSubmitting(true);
    const result = modalMode === 'add'
      ? await aboutIntanService.createVideo(payload)
      : await aboutIntanService.updateVideo(editingId, payload);
    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Video ditambahkan' : 'Video diperbarui',
        'Perubahan video highlight berhasil disimpan.'
      );
    } else notify.error('Gagal menyimpan video', result.error);
  };

  if (isLoading) return <div className="p-12"><Loading message="Memuat video…" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-(--text-secondary)">Kelola video YouTube yang ditampilkan di galeri highlights Intan.</p>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Tambah Video
        </Button>
      </div>

      <AdminTable
        columns={[
          { key: 'thumbnail', header: 'Preview', render: (item) => (
            <img width={96} height={56} src={(getYouTubeThumbnailUrl(item.youtube_id))?.src || (getYouTubeThumbnailUrl(item.youtube_id))} alt={item.title || 'YouTube Thumbnail'} className="w-24 h-14 object-cover rounded-lg border border-(--border-color)" />
          )},
          { key: 'title', header: 'Judul Video', render: (item) => <span className="font-bold text-(--text-primary) line-clamp-1">{item.title}</span> },
          { key: 'category', header: 'Kategori', render: (item) => <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-(--color-primary-light) text-(--color-primary)">{item.category}</span> },
          { key: 'youtube_id', header: 'Link YouTube', render: (item) => <a href={getYouTubeWatchUrl(item.youtube_id)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">Buka video</a> },
          { key: 'duration', header: 'Durasi' },
        ]}
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Belum ada video."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Video Baru' : 'Edit Video'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Link YouTube</label>
            <input autoComplete="off" /* autocomplete="off" */ name="youtube_url" type="url" value={formData.youtube_url} onChange={handleYouTubeUrlChange} placeholder="https://www.youtube.com/watch?v=SojGpGHMYEA" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl focus:focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:ring-2 focus:ring-[#170C79]/15 focus:border-(--color-primary)" required />
            <p className={`text-[10px] ${formData.youtube_url && !parsedYouTubeId ? 'text-red-500' : 'text-(--text-muted)'}`}>
              {isReadingMetadata ? 'Membaca judul dan durasi dari YouTube…' : parsedYouTubeId ? `Video ID terdeteksi: ${parsedYouTubeId}` : 'Mendukung link video, Shorts, live, embed, dan youtu.be.'}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Kategori</label>
            <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)">
              {['Profile', 'Vlog', 'Jahat-Jahatan', 'Last Content', 'Temen Main', 'Secret Cam'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {metadataError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{metadataError}</p>}
          {parsedYouTubeId && (
            <div className="rounded-xl overflow-hidden border border-(--border-color) bg-white">
              <img width={320} height={160} src={(getYouTubeThumbnailUrl(parsedYouTubeId))?.src || (getYouTubeThumbnailUrl(parsedYouTubeId))} alt="Preview" className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="font-bold text-(--text-primary)">{formData.title || 'Menunggu judul video…'}</p>
                <p className="mt-1 text-xs text-(--text-muted)">Durasi: {formData.duration || 'Membaca…'}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-(--border-color)">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || isReadingMetadata || !formData.title || !formData.duration} className="cursor-pointer">{isSubmitting ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Video Highlight"
        message="Apakah Anda yakin ingin menghapus video highlight ini?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </>
  );
}

// ==========================================
// TRIVIA TAB
// ==========================================
function TriviaTab() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ question: '', answer: '', sort_order: 0 });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchData = async () => { setIsLoading(true); setItems(await aboutIntanService.getTrivia()); setIsLoading(false); };
  useEffect(() => {
    let isCurrent = true;
    aboutIntanService.getTrivia().then(data => {
      if (isCurrent) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { isCurrent = false; };
  }, []);

  const handleAdd = () => { setModalMode('add'); setEditingId(null); setFormData({ question: '', answer: '', sort_order: items.length + 1 }); setIsModalOpen(true); };
  const handleEdit = (item) => { setModalMode('edit'); setEditingId(item.id); setFormData({ question: item.question, answer: item.answer, sort_order: item.sort_order || 0 }); setIsModalOpen(true); };
  
  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await aboutIntanService.deleteTrivia(id);
    if (res.success) {
      fetchData();
      notify.success('Trivia dihapus', 'Trivia dan fakta berhasil dihapus.');
    } else notify.error('Gagal menghapus trivia', res.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) { notify.warning('Data belum lengkap', 'Pertanyaan dan jawaban harus diisi.'); return; }
    setIsSubmitting(true);
    const result = modalMode === 'add'
      ? await aboutIntanService.createTrivia(formData)
      : await aboutIntanService.updateTrivia(editingId, formData);
    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Trivia ditambahkan' : 'Trivia diperbarui',
        'Perubahan trivia berhasil disimpan.'
      );
    } else notify.error('Gagal menyimpan trivia', result.error);
  };

  if (isLoading) return <div className="p-12"><Loading message="Memuat trivia…" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-(--text-secondary)">Kelola fakta menarik dan FAQ yang ditampilkan di accordion trivia.</p>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Tambah Fakta
        </Button>
      </div>

      <AdminTable
        columns={[
          { key: 'sort_order', header: '#', render: (item) => <span className="text-xs text-(--text-muted) font-mono">{item.sort_order}</span> },
          { key: 'question', header: 'Pertanyaan', render: (item) => <div className="font-bold text-(--text-primary) text-left md:text-right line-clamp-2 break-words max-w-[200px] lg:max-w-xs">{item.question}</div> },
          { key: 'answer', header: 'Jawaban', render: (item) => <div className="text-xs text-left md:text-right line-clamp-3 break-words max-w-[200px] lg:max-w-sm">{item.answer}</div> },
        ]}
        data={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Belum ada trivia."
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Fakta Baru' : 'Edit Fakta'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Pertanyaan</label>
            <input autoComplete="off" /* autocomplete="off" */ name="question" type="text" value={formData.question} onChange={e => setFormData(p => ({ ...p, question: e.target.value }))} placeholder="Siapa member tertua di JKT48 Gen 13?" className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-(--text-secondary)">Jawaban</label>
            <textarea rows="4" value={formData.answer} onChange={e => setFormData(p => ({ ...p, answer: e.target.value }))} placeholder="Tulis jawaban lengkap..." className="w-full px-3 py-2 bg-(--bg-primary) border border-(--border-color) rounded-xl outline-none focus:border-(--color-primary)" required />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-(--border-color)">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">{isSubmitting ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Trivia & Fakta"
        message="Apakah Anda yakin ingin menghapus fakta menarik ini?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </>
  );
}

// ==========================================
// MAIN ADMIN PAGE
// ==========================================
export default function AdminAboutIntan() {
  const [searchParams, setSearchParams] = useCustomSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-(--border-color)">
        <h1 className="text-xl sm:text-2xl font-extrabold text-(--text-primary) flex items-center gap-2">
          <User className="h-5.5 w-5.5 text-(--color-primary) shrink-0" /> Kelola Profil Intan
        </h1>
        <p className="text-xs text-(--text-secondary) mt-1">
          Kelola data dinamis yang tampil di halaman publik <strong>/about-intan</strong>: statistik, setlist, video, dan trivia.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 border-b border-(--border-color) pb-3">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                isActive
                  ? 'bg-(--color-primary) border-(--color-primary) text-white shadow-sm'
                  : 'bg-white border-(--border-color) text-(--text-secondary) hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'setlists' && <SetlistsTab />}
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'trivia' && <TriviaTab />}
      </div>
    </div>
  );
}
