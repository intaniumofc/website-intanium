import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { galleryService } from '../../features/gallery/galleryService';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, Search, ImageIcon } from 'lucide-react';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await galleryService.getGalleryPhotos();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      url: item.url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus foto galeri ini?')) {
      const res = await galleryService.deleteGalleryPhoto(id);
      if (res.success) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('Gagal menghapus: ' + res.error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Judul dan URL foto galeri harus diisi!');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      url: formData.url.trim()
    };

    let result;
    if (modalMode === 'add') {
      result = await galleryService.createGalleryPhoto(payload);
    } else {
      result = await galleryService.updateGalleryPhoto(editingId, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert('Gagal menyimpan data: ' + result.error);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">🖼️ Album Galeri Foto</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Unggah poster visual kegiatan, fanart terverifikasi, atau tangkapan layar keseruan live stream.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Unggah Foto Baru
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Cari foto galeri..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat album galeri..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Judul Foto</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={item.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'} 
                        alt={item.title} 
                        className="w-16 h-16 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm" 
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-secondary)] max-w-sm truncate">
                      {item.description || <span className="text-[var(--text-muted)] italic">Tidak ada keterangan</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(item)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                          title="Ubah Foto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                          title="Hapus Foto"
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
                      Belum ada foto galeri yang sesuai dengan pencarian Anda.
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
        title={modalMode === 'add' ? 'Unggah Foto Galeri Baru' : 'Ubah Detail Foto Galeri'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Foto</label>
            <input 
              type="text" 
              name="title"
              placeholder="Masukkan judul atau caption singkat foto..."
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              required
            />
          </div>

          {/* URL Gambar */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar (Direct Link)</label>
            <input 
              type="text" 
              name="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              required
            />
            <p className="text-[10px] text-[var(--text-muted)]">Pastikan link mengarah langsung ke berkas gambar (JPG, PNG, atau GIF).</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi Tambahan</label>
            <textarea 
              name="description"
              rows="3"
              placeholder="Keterangan pendukung untuk foto ini..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none"
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Foto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

