'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { newsService } from '../../../services/public/newsService';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { Plus, Edit, Trash2, Calendar, Search, Newspaper, Upload, Loader, X } from 'lucide-react';
import { useMediaUpload } from '../../../hooks/useMediaUpload';
import { FileUploadCard } from '../../../components/ui/FileUploadCard';

export default function AdminNews() {
  const notify = useAdminToast();
  const { uploadFile, isUploading, progress: uploadProgress } = useMediaUpload();
  const [selectedFile, setSelectedFile] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    category: 'Announcement',
    summary: '',
    content: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await newsService.getNews();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Announcement',
      summary: '',
      content: '',
      image_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setSelectedFile(null);
    setFormData({
      title: item.title,
      date: item.date || '',
      category: item.category || 'Announcement',
      summary: item.summary || '',
      content: item.content || '',
      image_url: item.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await newsService.deleteNews(id);
    if (res.success) {
      setItems(items.filter(item => item.id !== id));
      notify.success('Berita dihapus', 'Berita atau pengumuman berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus berita', res.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      notify.info('Mengunggah…', 'Sedang memproses dan mengunggah gambar banner ke Cloudflare R2…');
      const publicUrl = await uploadFile(file, 'assets', 'news');
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      notify.success('Berhasil', 'Gambar banner berhasil diunggah.');
    } catch (err) {
      notify.error('Gagal mengunggah', err.message || 'Terjadi kesalahan.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      notify.warning('Data belum lengkap', 'Judul dan tanggal pengumuman harus diisi.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'
    };

    let result;
    if (modalMode === 'add') {
      result = await newsService.createNews(payload);
    } else {
      result = await newsService.updateNews(editingId, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Berita dibuat' : 'Berita diperbarui',
        'Perubahan berita berhasil disimpan.'
      );
    } else {
      notify.error('Gagal menyimpan berita', result.error);
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Newspaper className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Berita & Pengumuman
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Buat pengumuman resmi terbaru, kabar event komunitas, atau berita penting lainnya.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Tulis Artikel Baru
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input autoComplete="off" name="searchQuery" type="text" placeholder="Cari pengumuman…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Announcement', 'Schedule', 'Event', 'Merch', 'Project', 'Media', 'Important'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                selectedCategory === cat
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-white border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat berita…" /></div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-4">Judul Artikel</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Tanggal Rilis</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                          <Newspaper className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                          <span className="truncate max-w-[200px] lg:max-w-sm">{item.title}</span>
                        </div>
                        {item.summary && (
                          <div className="text-xs text-[var(--text-muted)] mt-1 max-w-[200px] lg:max-w-sm truncate">{item.summary}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                          {item.category || 'Announcement'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {item.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Berita"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Berita"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                        Belum ada berita yang sesuai dengan pencarian Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {filteredItems.map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="font-bold text-[var(--text-primary)] text-sm flex items-start gap-2 min-w-0">
                      <Newspaper className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight line-clamp-2 break-words min-w-0">{item.title}</span>
                    </div>
                    {item.summary && (
                      <div className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 pl-6 break-words min-w-0">{item.summary}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pl-6">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                        {item.category || 'Announcement'}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)]">
                        <Calendar className="h-3 w-3 text-[var(--text-muted)]" /> {item.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100"
                        title="Ubah Berita"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-100"
                        title="Hapus Berita"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                  Belum ada berita yang sesuai dengan pencarian Anda.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ================= ADD/EDIT FORM MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tulis Artikel Berita Baru' : 'Ubah Detail Artikel Berita'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Artikel / Pengumuman</label>
            <input autoComplete="off" type="text" name="title" placeholder="Masukkan judul artikel yang menarik…" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tanggal Rilis</label>
              <input autoComplete="off" type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Kategori Artikel</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors"
              >
                {['Announcement', 'Schedule', 'Event', 'Merch', 'Project', 'Media', 'Important'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Gambar Banner</label>
            
            {formData.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-gray-50 aspect-[21/9] flex items-center justify-center group">
                <img 
                  src={formData.image_url} 
                  alt="Preview Banner" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Ganti Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadImage} 
                      className="hidden" 
                      disabled={isUploading} 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image_url: '' }));
                      setSelectedFile(null);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <FileUploadCard
                files={selectedFile ? [{
                  id: 'news-banner-upload',
                  file: selectedFile,
                  progress: uploadProgress,
                  status: isUploading ? 'uploading' : 'completed'
                }] : []}
                onFilesChange={async (newFiles) => {
                  if (newFiles && newFiles.length > 0) {
                    const file = newFiles[0];
                    setSelectedFile(file);
                    try {
                      notify.info('Mengunggah…', 'Sedang memproses dan mengunggah gambar banner ke Cloudflare R2…');
                      const publicUrl = await uploadFile(file, 'assets', 'news');
                      setFormData(prev => ({ ...prev, image_url: publicUrl }));
                      notify.success('Berhasil', 'Gambar banner berhasil diunggah.');
                    } catch (err) {
                      notify.error('Gagal mengunggah', err.message || 'Terjadi kesalahan.');
                    }
                  }
                }}
                onFileRemove={() => {
                  setSelectedFile(null);
                  setFormData(prev => ({ ...prev, image_url: '' }));
                }}
                accept="image/*"
                multiple={false}
                className="max-w-full"
              />
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Ringkasan Singkat (Summary)</label>
            <textarea name="summary" rows="2" placeholder="Detail ringkasan 1-2 kalimat untuk preview feed depan…" value={formData.summary} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors resize-none" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Konten Lengkap Berita</label>
            <textarea name="content" rows="6" placeholder="Tulis artikel lengkap di sini… (Mendukung paragraf baru)" value={formData.content} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors font-sans" required />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan Berita'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Berita / Pengumuman"
        message="Apakah Anda yakin ingin menghapus berita atau pengumuman ini secara permanen?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
