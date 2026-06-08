import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { newsService } from '../../features/news/newsService';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import { Plus, Edit, Trash2, Calendar, Search, Newspaper } from 'lucide-react';

export default function AdminNews() {
  const notify = useAdminToast();
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
          <input 
            type="text" 
            placeholder="Cari pengumuman..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Announcement', 'Event', 'Community', 'Release'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
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
          <div className="p-12"><Loading message="Memuat berita..." /></div>
        ) : (
          <div className="overflow-x-auto">
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
                        <span>{item.title}</span>
                      </div>
                      {item.summary && (
                        <div className="text-xs text-[var(--text-muted)] mt-1 max-w-lg truncate">{item.summary}</div>
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
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                          title="Ubah Berita"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
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
            <input 
              type="text" 
              name="title"
              placeholder="Masukkan judul artikel yang menarik..."
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tanggal Rilis</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
                required
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Kategori Artikel</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              >
                {['Announcement', 'Event', 'Community', 'Release'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Banner URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Banner Utama</label>
            <input 
              type="text" 
              name="image_url"
              placeholder="Masukkan URL foto banner dari internet..."
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
            />
            <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika ingin menggunakan banner default.</p>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Ringkasan Singkat (Summary)</label>
            <textarea 
              name="summary"
              rows="2"
              placeholder="Detail ringkasan 1-2 kalimat untuk preview feed depan..."
              value={formData.summary}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Konten Lengkap Berita</label>
            <textarea 
              name="content"
              rows="6"
              placeholder="Tulis artikel lengkap di sini... (Mendukung paragraf baru)"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all font-sans"
              required
            />
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Berita'}
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

