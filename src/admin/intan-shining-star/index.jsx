import { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { useAdminToast } from '../../components/common/useAdminToast';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import {
  ACHIEVEMENT_CATEGORIES,
  achievementService,
} from '../../features/intan-shining-star/achievementService';

const EMPTY_FORM = {
  id: '',
  sortDate: '',
  title: '',
  category: 'Milestone',
  description: '',
  image: '',
  isMajor: false,
  showInAchievement: true,
  showInTimeline: true,
};

const inputClass =
  'w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors';

function ToggleField({ checked, label, description, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 cursor-pointer">
      <input name="featured_checkbox" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]" />
      <span>
        <strong className="block text-xs text-[var(--text-primary)]">{label}</strong>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-[var(--text-muted)]">{description}</span>
      </span>
    </label>
  );
}

export default function AdminIntanShiningStar() {
  const notify = useAdminToast();
  const { uploadFile, isUploading, progress } = useSupabaseUpload();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchData = async () => {
    setIsLoading(true);
    setItems(await achievementService.getAdminAchievements());
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;
    achievementService.getAdminAchievements().then((data) => {
      if (active) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const filteredItems = useMemo(() => items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'achievement' && item.showInAchievement) ||
      (filter === 'timeline' && item.showInTimeline);
    return matchesSearch && matchesFilter;
  }), [filter, items, searchQuery]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setSelectedFile(null);
    setPreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({ ...EMPTY_FORM, ...item });
    setSelectedFile(null);
    setPreview(item.image || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.warning('Berkas tidak valid', 'Pilih berkas gambar untuk achievement.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.sortDate || !formData.description.trim()) {
      notify.warning('Data belum lengkap', 'Judul, tanggal, dan deskripsi wajib diisi.');
      return;
    }
    if (!formData.showInAchievement && !formData.showInTimeline) {
      notify.warning('Lokasi tampil belum dipilih', 'Pilih minimal Achievement atau Timeline.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile, 'assets', 'intan-shining-star');
      }

      const payload = { ...formData, image: imageUrl };
      const result = modalMode === 'add'
        ? await achievementService.createAchievement(payload)
        : await achievementService.updateAchievement(editingId, payload);

      if (!result.success) {
        notify.error('Gagal menyimpan achievement', result.error);
        return;
      }

      setIsModalOpen(false);
      await fetchData();
      notify.success(
        modalMode === 'add' ? 'Achievement ditambahkan' : 'Achievement diperbarui',
        'Data #IntanShiningStar berhasil disimpan.',
      );
    } catch (error) {
      notify.error('Gagal memproses gambar', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAction = async () => {
    const result = await achievementService.deleteAchievement(confirmDelete.id);
    setConfirmDelete({ isOpen: false, id: null });
    if (result.success) {
      await fetchData();
      notify.success('Achievement dihapus', 'Data berhasil dihapus dari achievement dan timeline.');
    } else {
      notify.error('Gagal menghapus achievement', result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
            <Sparkles className="h-5.5 w-5.5 text-[var(--color-primary)]" /> #IntanShiningStar
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Kelola kumpulan achievement dan timeline perjalanan Intan dari satu tempat.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          ['Total Data', items.length],
          ['Tampil Achievement', items.filter((item) => item.showInAchievement).length],
          ['Tampil Timeline', items.filter((item) => item.showInTimeline).length],
        ].map(([label, value]) => (
          <Card key={label} hoverEffect={false} className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-extrabold text-[var(--color-primary)]">{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 shadow-sm md:w-80">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input autoComplete="off" /* autocomplete="off" */ name="searchQuery" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari achievement…" className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none focus:ring-0 outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ['all', 'Semua'],
            ['achievement', 'Achievement'],
            ['timeline', 'Timeline'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                  : 'border-[var(--border-color)] bg-white text-[var(--text-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card hoverEffect={false} padding="none" className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat achievement…" /></div>
        ) : (
          <div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 text-xs uppercase text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-5 py-4">Achievement</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4">Tampil</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex min-w-72 items-center gap-3">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
                            {item.image ? (
                              <img width={80} height={56} src={item.image} alt="Achievement Thumbnail" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="m-auto h-full w-5 text-[var(--text-muted)]" />
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-[var(--text-primary)] max-w-[200px] lg:max-w-xs truncate">{item.title}</p>
                            <p className="mt-1 text-[10px] font-bold text-[var(--color-primary)]">{item.date} - {item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-[var(--text-secondary)]">{item.sortDate}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.showInAchievement && <span className="rounded-full bg-pink-50 px-2 py-1 text-[9px] font-black text-pink-700">Achievement</span>}
                          {item.showInTimeline && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-700">Timeline</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.isMajor && <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">Major</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditModal(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label={`Edit ${item.title}`}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: item.id })} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Hapus ${item.title}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">Belum ada data yang sesuai.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex gap-3 items-start min-w-0">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
                      {item.image ? (
                        <img width={80} height={56} src={item.image} alt="Achievement Thumbnail" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="m-auto h-full w-5 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-[var(--text-primary)] text-sm line-clamp-2 break-words min-w-0">{item.title}</p>
                      <p className="mt-1 text-[10px] font-bold text-[var(--color-primary)] truncate">{item.date} - {item.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {item.showInAchievement && <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] font-black text-pink-700">Achievement</span>}
                    {item.showInTimeline && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-black text-indigo-700">Timeline</span>}
                    {item.isMajor && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700">Major</span>}
                  </div>
                  
                  <div className="flex justify-between items-center mt-1 border-t border-[var(--border-color)] pt-3">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">Urutan: {item.sortDate}</span>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEditModal(item)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 flex items-center gap-1.5">
                        <Edit className="h-3.5 w-3.5" /> Ubah
                      </button>
                      <button type="button" onClick={() => setConfirmDelete({ isOpen: true, id: item.id })} className="rounded-lg p-1.5 text-red-500 bg-red-50 border border-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">Belum ada data yang sesuai.</div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Achievement / Timeline' : 'Edit Achievement / Timeline'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-sm text-[var(--text-primary)]">
          <div className="grid gap-4 md:grid-cols-2">
            {modalMode === 'add' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">ID / Slug (Opsional)</span>
                <input autoComplete="off" /* autocomplete="off" */ name="id" value={formData.id} onChange={(event) => updateField('id', event.target.value)} placeholder="first-theater-show" className={inputClass} />
              </label>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Kategori</span>
              <select value={formData.category} onChange={(event) => updateField('category', event.target.value)} className={inputClass}>
                {ACHIEVEMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Judul</span>
            <input autoComplete="off" /* autocomplete="off" */ name="title" value={formData.title} onChange={(event) => updateField('title', event.target.value)} className={inputClass} required />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Tanggal</span>
            <input autoComplete="off" /* autocomplete="off" */ name="sortDate" type="date" value={formData.sortDate} onChange={(event) => updateField('sortDate', event.target.value)} className={inputClass} required />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Deskripsi</span>
            <textarea rows="4" value={formData.description} onChange={(event) => updateField('description', event.target.value)} className={`${inputClass} resize-none`} required />
          </label>

          <div className="grid gap-4 md:grid-cols-[1fr_.8fr]">
            <div className="space-y-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">URL Gambar (Opsional)</span>
                <input autoComplete="off" /* autocomplete="off" */ name="image || ''" value={formData.image || ''} onChange={(event) => updateField('image', event.target.value)} className={inputClass} />
              </label>
              <div className="relative flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-5 text-center hover:border-[var(--color-primary)]">
                <input name="image_file" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" disabled={isSubmitting || isUploading} />
                {isUploading ? <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" /> : <Upload className="h-7 w-7 text-[var(--color-primary)]" />}
                <strong className="mt-2 text-xs">{selectedFile?.name || 'Pilih gambar achievement'}</strong>
                <span className="mt-1 text-[10px] text-[var(--text-muted)]">Otomatis resize dan dikonversi menjadi WebP.</span>
              </div>
              {isUploading && (
                <div className="h-1.5 overflow-hidden rounded-full bg-indigo-100">
                  <div className="h-full bg-[var(--color-primary)] transition-colors" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
              {preview || formData.image ? (
                <img width={400} height={208} src={preview || formData.image} alt="Preview achievement" className="h-full min-h-52 w-full object-cover" />
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center text-[var(--text-muted)]">
                  <ImageIcon className="h-7 w-7" /><span className="mt-2 text-xs">Preview gambar</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ToggleField checked={formData.showInAchievement} onChange={(value) => updateField('showInAchievement', value)} label="Tampil di Kumpulan Achievement" description="Menampilkan card di section kumpulan pencapaian." />
            <ToggleField checked={formData.showInTimeline} onChange={(value) => updateField('showInTimeline', value)} label="Tampil di Timeline" description="Menampilkan item pada perjalanan dari bawah ke atas." />
            <ToggleField checked={formData.isMajor} onChange={(value) => updateField('isMajor', value)} label="Major Milestone" description="Memberikan node timeline yang lebih menonjol." />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border-color)] pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting || isUploading}>Batal</Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || isUploading} isLoading={isSubmitting || isUploading}>
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Achievement"
        message="Data akan dihapus dari kumpulan achievement dan timeline. Lanjutkan?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
