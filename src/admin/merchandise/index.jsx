import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { merchandiseService } from '../../features/merchandise/merchandiseService';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, Check, X, Search } from 'lucide-react';
import { MERCH_CATEGORIES } from '../../lib/constants';

export default function AdminMerchandise() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Clothing',
    description: '',
    image_url: '',
    is_available: true,
    sizes: ['M', 'L', 'XL']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await merchandiseService.getProducts();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: 'Clothing',
      description: '',
      image_url: '',
      is_available: true,
      sizes: ['M', 'L', 'XL']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category || 'Clothing',
      description: item.description || '',
      image_url: item.image_url || '',
      is_available: item.is_available ?? true,
      sizes: item.sizes || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus merchandise ini?')) {
      const res = await merchandiseService.deleteProduct(id);
      if (res.success) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('Gagal menghapus: ' + res.error);
      }
    }
  };

  const handleSizeCheckboxChange = (size) => {
    setFormData(prev => {
      const currentSizes = [...prev.sizes];
      if (currentSizes.includes(size)) {
        return { ...prev, sizes: currentSizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...currentSizes, size] };
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Nama dan Harga produk harus diisi!');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      image_url: formData.image_url.trim() || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80',
      image_urls: [formData.image_url.trim() || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80']
    };

    let result;
    if (modalMode === 'add') {
      result = await merchandiseService.createProduct(payload);
    } else {
      result = await merchandiseService.updateProduct(editingId, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert('Gagal menyimpan data: ' + result.error);
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">🛍️ Toko Merchandise</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Tambah, perbarui, atau kelola katalog produk merchandise official Intan.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Cari produk..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', ...Object.values(MERCH_CATEGORIES).filter(c => c !== 'All')].map((cat) => (
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
          <div className="p-12"><Loading message="Memuat katalog merchandise..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4">Gambar</th>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100'} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)] text-sm">{item.name}</div>
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Ukuran: {item.sizes.join(', ')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                        {item.category || 'Clothing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--text-primary)]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_available ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="h-3 w-3" /> Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <X className="h-3 w-3" /> Habis
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(item)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                          title="Ubah Produk"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Belum ada merchandise yang sesuai dengan pencarian Anda.
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
        title={modalMode === 'add' ? 'Tambah Merchandise Baru' : 'Ubah Detail Merchandise'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Nama Produk</label>
            <input 
              type="text" 
              name="name"
              placeholder="Masukkan nama produk..."
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              required
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Harga (Rupiah)</label>
              <input 
                type="number" 
                name="price"
                placeholder="Misal: 150000"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Kategori</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              >
                {Object.values(MERCH_CATEGORIES).filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Produk</label>
            <input 
              type="text" 
              name="image_url"
              placeholder="Masukkan URL foto produk dari internet..."
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
            />
            <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika ingin menggunakan gambar placeholder bawaan.</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi Produk</label>
            <textarea 
              name="description"
              rows="3"
              placeholder="Detail deskripsi bahan, spesifikasi..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none"
            />
          </div>

          {/* Sizes Options */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Ukuran Tersedia</label>
            <div className="flex flex-wrap gap-4 mt-1">
              {['S', 'M', 'L', 'XL', 'XXL', 'All Size'].map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input 
                    type="checkbox" 
                    checked={formData.sizes.includes(size)}
                    onChange={() => handleSizeCheckboxChange(size)}
                    className="w-4.5 h-4.5 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              name="is_available"
              id="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
              className="w-4.5 h-4.5 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="is_available" className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer select-none">
              Produk Tersedia (Stok Aktif)
            </label>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

