'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Edit,
  GripVertical,
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
import { useMediaUpload } from '../../../hooks/useMediaUpload';
import { comicPageService } from '../../../services/public/comicPageService';

const EMPTY_FORM = {
  id: '',
  pageNumber: '',
  imageUrl: '',
  caption: '',
  chapterNumber: 1,
  chapterTitle: '',
};

const inputClass =
  'w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors';

export default function AdminComicPages() {
  const notify = useAdminToast();
  const { uploadFile, isUploading } = useMediaUpload();
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
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setItems(await comicPageService.getPages());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedList = [...items];
    const [draggedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, draggedItem);

    const reorderedWithPageNums = updatedList.map((item, idx) => ({
      ...item,
      pageNumber: idx + 1,
    }));

    setItems(reorderedWithPageNums);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const result = await comicPageService.reorderPages(reorderedWithPageNums);
    if (result.success) {
      notify.success('Urutan Diperbarui', 'Nomor halaman komik berhasil disesuaikan.');
    } else {
      notify.error('Gagal menyimpan urutan', result.error);
      await fetchData();
    }
  };

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          String(item.pageNumber).includes(q) ||
          (item.caption || '').toLowerCase().includes(q) ||
          (item.chapterTitle || '').toLowerCase().includes(q) ||
          String(item.chapterNumber || '').includes(q)
        );
      }),
    [items, searchQuery]
  );

  const existingChapters = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const chNum = Number(item.chapterNumber) || 1;
      if (!map.has(chNum)) {
        map.set(chNum, item.chapterTitle || `Chapter ${chNum}`);
      }
    });
    return Array.from(map.entries())
      .map(([num, title]) => ({ chapterNumber: num, chapterTitle: title }))
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [items]);

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    const nextChapter = existingChapters.length > 0 ? existingChapters[0] : { chapterNumber: 1, chapterTitle: 'Awal' };
    const nextHighestPage = items.length > 0 ? Math.max(...items.map((i) => Number(i.pageNumber) || 0)) + 1 : 1;
    setFormData({
      ...EMPTY_FORM,
      pageNumber: nextHighestPage,
      chapterNumber: nextChapter.chapterNumber,
      chapterTitle: nextChapter.chapterTitle,
    });
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

  const handleChapterSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'NEW') {
      const highestNum = existingChapters.length > 0
        ? Math.max(...existingChapters.map((c) => c.chapterNumber)) + 1
        : 1;
      setFormData((c) => ({
        ...c,
        chapterNumber: highestNum,
        chapterTitle: '',
      }));
    } else {
      const chNum = parseInt(val, 10);
      const found = existingChapters.find((c) => c.chapterNumber === chNum);
      if (found) {
        setFormData((c) => ({
          ...c,
          chapterNumber: found.chapterNumber,
          chapterTitle: found.chapterTitle,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetPageNum = Number(formData.pageNumber);

    if (!targetPageNum) {
      notify.warning('Nomor halaman wajib diisi', '');
      return;
    }

    const isDuplicate = items.some(
      (item) => Number(item.pageNumber) === targetPageNum && item.id !== editingId
    );

    if (isDuplicate) {
      notify.warning(
        'Nomor Halaman Sudah Terdaftar',
        `Halaman ${targetPageNum} sudah digunakan. Pilih nomor lain atau ubah urutan via Drag & Drop.`
      );
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

      // Sync chapter title to all pages in this chapter
      if (formData.chapterNumber) {
        await comicPageService.syncChapterTitle(formData.chapterNumber, formData.chapterTitle);
      }

      setIsModalOpen(false);
      await fetchData();
      notify.success(
        modalMode === 'add' ? 'Halaman ditambahkan' : 'Halaman diperbarui',
        `Halaman ${formData.pageNumber} berhasil disimpan (Chapter ${formData.chapterNumber}).`
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
            <BookOpen className="h-5.5 w-5.5 text-[var(--color-primary)]" /> Komik Milestone
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
            {filteredItems.map((item, index) => {
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`group relative rounded-xl border bg-[var(--bg-primary)] overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-40 scale-95 border-pink-400 border-dashed'
                      : isOver
                      ? 'border-pink-500 ring-2 ring-pink-400 scale-[1.02]'
                      : 'border-[var(--border-color)] hover:border-pink-300'
                  }`}
                >
                  {/* Drag Handle Overlay */}
                  <div className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/60 text-white opacity-60 group-hover:opacity-100 backdrop-blur-sm transition-opacity">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>

                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={`Halaman ${item.pageNumber}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable="false"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        <ImageIcon className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Hal. {item.pageNumber}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border border-pink-200 bg-pink-50 text-pink-700">
                        Ch. {item.chapterNumber || 1}
                      </span>
                    </div>
                    {item.chapterTitle && (
                      <span className="text-[10px] text-[var(--text-muted)] truncate">
                        {item.chapterTitle}
                      </span>
                    )}
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 rounded-lg hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] cursor-pointer"
                        title="Edit Halaman"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, id: item.id })}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                        title="Hapus Halaman"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              Pilih Chapter Komik *
            </label>
            <select
              value={
                existingChapters.some((c) => c.chapterNumber === formData.chapterNumber)
                  ? formData.chapterNumber
                  : 'NEW'
              }
              onChange={handleChapterSelectChange}
              className={inputClass}
            >
              {existingChapters.map((ch) => (
                <option key={ch.chapterNumber} value={ch.chapterNumber}>
                  Chapter {ch.chapterNumber}{ch.chapterTitle ? `: ${ch.chapterTitle}` : ''}
                </option>
              ))}
              <option value="NEW">+ Tambah Chapter Baru...</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                Nomor Chapter *
              </label>
              <input
                type="number"
                min="1"
                value={formData.chapterNumber}
                onChange={(e) => updateField('chapterNumber', parseInt(e.target.value, 10) || 1)}
                className={inputClass}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Judul Chapter (Auto-Sync ke semua halaman di Chapter {formData.chapterNumber})
            </label>
            <input
              type="text"
              value={formData.chapterTitle}
              onChange={(e) => updateField('chapterTitle', e.target.value)}
              className={inputClass}
              placeholder="misal: Awal / Saatnya Beraksi"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              *Mengubah judul di sini akan otomatis memperbarui judul seluruh halaman dalam Chapter {formData.chapterNumber}.
            </p>
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
