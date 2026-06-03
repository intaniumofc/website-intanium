import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { recapService } from '../../features/recaps/recapService';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, Calendar, FileText, Search, PlusCircle, Trash } from 'lucide-react';

export default function AdminRecaps() {
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
    publish_date: '',
    summary: '',
    thumbnail_url: ''
  });

  const [formPages, setFormPages] = useState([]); // Array of { image_url: '', caption: '' }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await recapService.getRecaps();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      title: '',
      publish_date: new Date().toISOString().split('T')[0],
      summary: '',
      thumbnail_url: ''
    });
    setFormPages([{ image_url: '', caption: '' }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      publish_date: item.publishDate || '',
      summary: item.summary || '',
      thumbnail_url: item.thumbnailUrl || ''
    });
    setFormPages(item.pages ? item.pages.map(p => ({ image_url: p.imageUrl, caption: p.caption || '' })) : []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus recap ini beserta halamannya?')) {
      const res = await recapService.deleteRecap(id);
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

  const handleAddPageRow = () => {
    setFormPages(prev => [...prev, { image_url: '', caption: '' }]);
  };

  const handleRemovePageRow = (index) => {
    setFormPages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePageRowChange = (index, field, value) => {
    setFormPages(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul recap zine harus diisi!');
      return;
    }

    setIsSubmitting(true);
    
    // Filter out pages that don't have an image URL
    const validPages = formPages
      .filter(p => p.image_url.trim())
      .map((p, index) => ({
        image_url: p.image_url.trim(),
        caption: p.caption.trim(),
        page_number: index + 1
      }));

    // Default thumbnail if empty
    const payload = {
      ...formData,
      thumbnail_url: formData.thumbnail_url.trim() || (validPages[0] ? validPages[0].image_url : 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600')
    };

    let result;
    if (modalMode === 'add') {
      result = await recapService.createRecap(payload, validPages);
    } else {
      result = await recapService.updateRecap(editingId, payload, validPages);
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
    (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">📖 Arsip Recap & Zine</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Unggah majalah komik digital Zine baru atau log komik recap mingguan.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Unggah Zine baru
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Cari edisi Zine..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat arsip zine..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4">Sampul</th>
                  <th className="px-6 py-4">Judul Edisi</th>
                  <th className="px-6 py-4">Tanggal Rilis</th>
                  <th className="px-6 py-4">Halaman</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100'} 
                        alt={item.title} 
                        className="w-12 h-16 object-cover rounded-lg border border-[var(--border-color)] shadow-sm bg-[var(--bg-primary)]" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)] text-sm">{item.title}</div>
                      {item.summary && (
                        <div className="text-xs text-[var(--text-muted)] mt-0.5 max-w-sm truncate">{item.summary}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {item.publishDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2.5 py-1 rounded-full border border-[var(--color-primary)]/10">
                        <FileText className="h-3.5 w-3.5" /> {item.pages?.length || 0} Halaman
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(item)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                          title="Ubah Zine"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                          title="Hapus Zine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Belum ada zine yang sesuai dengan pencarian Anda.
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
        title={modalMode === 'add' ? 'Unggah Zine Digital Baru' : 'Ubah Detail Edisi Zine'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Edisi</label>
              <input 
                type="text" 
                name="title"
                placeholder="Misal: Recap Commish Volume 5"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
                required
              />
            </div>

            {/* Publish Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tanggal Terbit</label>
              <input 
                type="date" 
                name="publish_date"
                value={formData.publish_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thumbnail URL */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Sampul (Thumbnail)</label>
              <input 
                type="text" 
                name="thumbnail_url"
                placeholder="URL foto sampul zine..."
                value={formData.thumbnail_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika ingin otomatis menggunakan gambar Halaman 1.</p>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi / Ringkasan</label>
              <textarea 
                name="summary"
                rows="2"
                placeholder="Tulis ringkasan konten Zine edisi ini..."
                value={formData.summary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none"
              />
            </div>
          </div>

          {/* Zine Pages List */}
          <div className="border-t border-[var(--border-color)] pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Daftar Gambar Halaman Zine</h4>
              <button 
                type="button" 
                onClick={handleAddPageRow}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-bold hover:underline py-1"
              >
                <PlusCircle className="h-4 w-4" /> Tambah Halaman
              </button>
            </div>

            {/* Dynamic Pages Rows */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {formPages.map((page, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50/50 border border-[var(--border-color)] rounded-xl">
                  {/* Page Indicator */}
                  <span className="w-8 h-8 rounded-full bg-white border border-[var(--border-color)] text-xs font-bold flex items-center justify-center flex-shrink-0 text-[var(--text-secondary)]">
                    {index + 1}
                  </span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="URL Gambar Halaman..." 
                      value={page.image_url}
                      onChange={(e) => handlePageRowChange(index, 'image_url', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[var(--border-color)] rounded-lg outline-none text-xs focus:border-[var(--color-primary)] transition-all"
                      required={index === 0} // Page 1 is mandatory
                    />
                    <input 
                      type="text" 
                      placeholder="Keterangan Halaman (opsional)..." 
                      value={page.caption}
                      onChange={(e) => handlePageRowChange(index, 'caption', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[var(--border-color)] rounded-lg outline-none text-xs focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>

                  {/* Remove row */}
                  {formPages.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemovePageRow(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Hapus Halaman"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {formPages.length === 0 && (
                <p className="text-center text-xs text-[var(--text-muted)] py-4">Belum ada halaman. Klik 'Tambah Halaman' di atas.</p>
              )}
            </div>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Zine'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

