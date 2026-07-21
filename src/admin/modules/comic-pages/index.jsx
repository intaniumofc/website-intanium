'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Edit,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Loading from '../../../components/common/Loading';
import Modal from '../../../components/common/Modal';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { useSupabaseUpload } from '../../../hooks/useSupabaseUpload';
import { comicPageService } from '../../../services/public/comicPageService';

const EMPTY_FORM = {
  id: '',
  pageNumber: '',
  imageUrl: '',
  caption: '',
};

const inputClass =
  'w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors';

export default function AdminComicPages() {
  const notify = useAdminToast();
  const { uploadFile, isUploading } = useSupabaseUpload();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    setItems(await comicPageService.getPages());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          String(item.pageNumber).includes(q) ||
          (item.caption || '').toLowerCase().includes(q)
        );
      }),
    [items, searchQuery]
  );

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
    setPreview(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.warning('Berkas tidak valid', 'Pilih berkas gambar.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateField = (name, value) =>
    setFormData((c) => ({ ...c, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pageNumber) {
      notify.warning('Nomor halaman wajib diisi', '');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.imageUrl;
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile, 'assets', 'intan-shining-star/comic');
      }

      const payload = { ...formData, imageUrl };
      const result =
        modalMode === 'add'
          ? await comicPageService.createPage(payload)
          : await comicPageService.updatePage(editingId, payload);

      if (!result.success) {
        notify.error('Gagal menyimpan', result.error);
        return;
      }

      setIsModalOpen(false);
      await fetchData();
      notify.success(
        modalMode === 'add' ? 'Halaman ditambahkan' : 'Halaman diperbarui',
        `Halaman ${formData.pageNumber} berhasil disimpan.`
      );
    } catch (err) {
      notify.error('Gagal memproses gambar', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAction = async () => {
    const result = await comicPageService.deletePage(confirmDelete.id);
    setConfirmDelete({ isOpen: false, id: null });
    if (result.success) {
      await fetchData();
      notify.success('Halaman dihapus', 'Berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus', result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
            <BookOpen className="h-5.5 w-5.5 text-[var(--color-primary)]" /> Komik #IntanShiningStar
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Kelola halaman komik flipbook. Resolusi 750×1000px (3:4).
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <Plus className="mr-1.5 h-4 w-4" /> Tambah Halaman
        </Button>
      </div>

      <Card hoverEffect={false} className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Total Halaman</p>
        <p className="mt-1 text-sm font-extrabold text-[var(--color-primary)]">{items.length}</p>
      </Card>

      <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 shadow-sm md:w-80">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <input
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari halaman…"
          className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none outline-none"
        />
      </div>

      <Card hoverEffect={false} padding="none" className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat halaman komik…" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--text-muted)]">
            Belum ada halaman komik.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden"
              >
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={`Halaman ${item.pageNumber}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Hal. {item.pageNumber}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded-lg hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ isOpen: true, id: item.id })}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Halaman Komik' : 'Edit Halaman Komik'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Nomor Halaman *
            </label>
            <input
              type="number"
              min="1"
              value={formData.pageNumber}
              onChange={(e) => updateField('pageNumber', parseInt(e.target.value, 10) || '')}
              className={inputClass}
              placeholder="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Caption (opsional)
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => updateField('caption', e.target.value)}
              className={inputClass}
              placeholder="Deskripsi singkat halaman"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Gambar (750×1000px, 3:4)
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
            <label className="mt-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-4 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
              <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">
                {isUploading ? 'Mengunggah…' : 'Klik atau seret gambar ke sini'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {preview && (
              <div className="mt-3 aspect-[3/4] max-w-[180px] rounded-xl overflow-hidden border border-[var(--border-color)]">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting || isUploading}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        type="danger"
        title="Hapus Halaman"
        message="Apakah kamu yakin ingin menghapus halaman komik ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
