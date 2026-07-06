import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { merchandiseService } from '../../features/merchandise/merchandiseService';
import Loading from '../../components/common/Loading';
import { useAdminToast } from '../../components/common/useAdminToast';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import { 
  Plus, Edit, Trash2, Check, X, Search, Image as ImageIcon, 
  Tag, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, LayoutGrid,
  Clock, ShoppingBag, CreditCard
} from 'lucide-react';
import { MERCH_CATEGORIES } from '../../lib/constants';
import { formatCurrency } from '../../lib/helpers';

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Harga: Rendah ke Tinggi', value: 'price_asc' },
  { label: 'Harga: Tinggi ke Rendah', value: 'price_desc' },
  { label: 'Nama: A-Z', value: 'name_asc' }
];

const initialForm = {
  name: '',
  price: '',
  category: 'Clothing',
  description: '',
  image_url: '',
  image_url_2: '',
  image_url_3: '',
  is_available: true,
  sizesInput: 'M, L, XL'
};

export default function AdminMerchandise() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState('inventory'); // 'inventory' | 'editor'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [sortValue, setSortValue] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Editor states
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Uploader hook
  const { uploadFile, isUploading, progress } = useSupabaseUpload();
  const [uploadingKey, setUploadingKey] = useState(null);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    qris_url: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  const fetchPaymentSettings = async () => {
    setIsSettingsLoading(true);
    try {
      const data = await merchandiseService.getPaymentSettings();
      if (data) {
        setPaymentSettings(data);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal mengambil info pembayaran', err.message);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace === 'payment') {
      fetchPaymentSettings();
    }
  }, [activeWorkspace]);

  const handlePaymentSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!paymentSettings.bank_name.trim() || !paymentSettings.account_number.trim() || !paymentSettings.account_holder.trim()) {
      notify.warning('Data belum lengkap', 'Nama bank, nomor rekening, dan nama penerima harus diisi.');
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await merchandiseService.updatePaymentSettings(paymentSettings);
      if (res.success) {
        notify.success('Pengaturan disimpan', 'Informasi pembayaran berhasil diperbarui.');
      } else {
        notify.error('Gagal menyimpan pengaturan', res.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyimpan pengaturan', err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleQrisUpload = async (file) => {
    if (!file) return;
    setUploadingKey('payment_qris');
    try {
      const publicUrl = await uploadFile(file, 'assets', 'payment');
      setPaymentSettings(prev => ({ ...prev, qris_url: publicUrl }));
      notify.success('QRIS berhasil diunggah', 'URL foto QRIS sudah dimasukkan.');
    } catch (err) {
      console.error('File upload failed:', err);
      notify.error('Gagal mengunggah QRIS', err.message);
    } finally {
      setUploadingKey(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await merchandiseService.getProducts();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleOpenAddWorkspace = () => {
    resetForm();
    setActiveWorkspace('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditWorkspace = (product) => {
    setEditingId(product.id);
    const urls = product.image_urls ?? [];
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || 'Clothing',
      description: product.description || '',
      image_url: product.image_url || urls[0] || '',
      image_url_2: urls[1] || '',
      image_url_3: urls[2] || '',
      is_available: product.is_available ?? true,
      sizesInput: product.sizes ? product.sizes.join(', ') : 'M, L, XL',
    });
    setActiveWorkspace('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestDelete = (product) => {
    setItemToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;
    try {
      const res = await merchandiseService.deleteProduct(itemToDelete.id);
      if (res.success) {
        setItems(items.filter(item => item.id !== itemToDelete.id));
        if (editingId === itemToDelete.id) resetForm();
        notify.success('Produk dihapus', 'Produk berhasil dihapus dari katalog.');
      } else {
        notify.error('Gagal menghapus produk', res.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus produk', err.message);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeQuickAdd = (size) => {
    setFormData(prev => {
      const current = prev.sizesInput 
        ? prev.sizesInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) 
        : [];
      if (!current.includes(size.toUpperCase())) {
        const next = [...current, size.toUpperCase()].join(', ');
        return { ...prev, sizesInput: next };
      }
      return prev;
    });
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      // Uploading to standard merchandise receipts bucket, or fallback assets folder
      const publicUrl = await uploadFile(file, 'assets', 'products');
      setFormData(prev => ({ ...prev, [key]: publicUrl }));
      notify.success('Foto berhasil diunggah', 'URL foto produk sudah dimasukkan ke form.');
    } catch (err) {
      console.error('File upload failed:', err);
      notify.error('Gagal mengunggah foto', err.message);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleQuickToggleActive = async (product) => {
    try {
      const nextAvailable = !product.is_available;
      const res = await merchandiseService.updateProduct(product.id, {
        is_available: nextAvailable
      });
      if (res.success) {
        setItems(current => current.map(item => item.id === product.id ? { ...item, is_available: nextAvailable } : item));
        notify.success(
          nextAvailable ? 'Produk diaktifkan' : 'Produk dinonaktifkan',
          `${product.name} sekarang ${nextAvailable ? 'tersedia' : 'habis/tidak tersedia'}.`
        );
      } else {
        notify.error('Gagal mengubah status produk', res.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal mengubah status produk', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      notify.warning('Data belum lengkap', 'Nama dan harga produk harus diisi.');
      return;
    }

    setIsSubmitting(true);
    
    // Parse sizes input
    const parsedSizes = formData.sizesInput
      ? formData.sizesInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    // Compile image URLs
    const compiledImageUrls = [
      formData.image_url.trim(),
      formData.image_url_2.trim(),
      formData.image_url_3.trim()
    ].filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      image_url: formData.image_url.trim() || compiledImageUrls[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      image_urls: compiledImageUrls.length > 0 ? compiledImageUrls : ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'],
      is_available: formData.is_available,
      sizes: parsedSizes
    };

    try {
      let result;
      if (editingId) {
        result = await merchandiseService.updateProduct(editingId, payload);
      } else {
        result = await merchandiseService.createProduct(payload);
      }

      if (result.success) {
        resetForm();
        setActiveWorkspace('inventory');
        fetchData();
        notify.success(
          editingId ? 'Produk diperbarui' : 'Produk ditambahkan',
          'Perubahan produk berhasil disimpan.'
        );
      } else {
        notify.error('Gagal menyimpan produk', result.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyimpan produk', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats computation
  const summary = useMemo(() => {
    const total = items.length;
    const active = items.filter(item => item.is_available).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [items]);

  // Filters & Search logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' ? item.is_available : !item.is_available);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, statusFilter]);

  // Sort logic
  const sortedItems = useMemo(() => {
    const next = [...filteredItems];
    if (sortValue === 'price_asc') {
      return next.sort((a, b) => a.price - b.price);
    }
    if (sortValue === 'price_desc') {
      return next.sort((a, b) => b.price - a.price);
    }
    if (sortValue === 'name_asc') {
      return next.sort((a, b) => a.name.localeCompare(b.name));
    }
    return next.sort((a, b) => b.id.localeCompare(a.id)); // default newest
  }, [filteredItems, sortValue]);

  // Pagination logic
  const INVENTORY_PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / INVENTORY_PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (visiblePage - 1) * INVENTORY_PAGE_SIZE;
    return sortedItems.slice(start, start + INVENTORY_PAGE_SIZE);
  }, [sortedItems, visiblePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter, sortValue]);

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]/60">
        <div className="min-w-0 w-full sm:w-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Admin Dashboard
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1 flex items-center gap-2">
            <ShoppingBag className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> 
            <span className="truncate">Katalog Merchandise</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 truncate sm:whitespace-normal">
            Kelola katalog merchandise, ketersediaan, dan order penjualan
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="flex items-center justify-center gap-1.5 shadow-sm cursor-pointer w-full sm:w-auto shrink-0" 
          onClick={handleOpenAddWorkspace}
        >
          <Plus className="h-4 w-4" /> Tambah Produk Baru
        </Button>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => {
              setActiveWorkspace('inventory');
            }}
            className={`border-b-2 px-1 pb-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeWorkspace === 'inventory'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            Database Inventory
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeWorkspace !== 'editor') resetForm();
              setActiveWorkspace('editor');
            }}
            className={`border-b-2 px-1 pb-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeWorkspace === 'editor'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {editingId ? 'Ubah Data Produk' : 'Input Produk Baru'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveWorkspace('payment');
            }}
            className={`border-b-2 px-1 pb-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeWorkspace === 'payment'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 shrink-0" /> Informasi Pembayaran
          </button>
        </nav>
      </div>

      {/* ─────────────────── WORKSPACE: INVENTORY ─────────────────── */}
      {activeWorkspace === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <Card hoverEffect={false} padding="compact" className="border border-[var(--border-color)] bg-white text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Produk</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">{summary.total}</span>
            </Card>
            <Card hoverEffect={false} padding="compact" className="border border-[var(--border-color)] bg-white text-center">
              <span className="text-[10px] font-bold text-emerald-500 block uppercase">Tersedia</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">{summary.active}</span>
            </Card>
            <Card hoverEffect={false} padding="compact" className="border border-[var(--border-color)] bg-white text-center">
              <span className="text-[10px] font-bold text-red-500 block uppercase">Habis</span>
              <span className="text-xl sm:text-2xl font-black text-red-600 mt-1 block">{summary.inactive}</span>
            </Card>
          </div>

          {/* Filtering and Search toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-[var(--border-color)]/60 rounded-2xl shadow-sm">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input autoComplete="off" /* autocomplete="off" */  name="searchQuery" type="text" placeholder="Cari nama atau deskripsi…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] font-semibold placeholder-slate-400" />
            </div>

            {/* Category Select Filters */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
            >
              <option value="All">Semua Kategori</option>
              {Object.values(MERCH_CATEGORIES).filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Availability status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
            >
              <option value="all">Semua Status</option>
              <option value="active">Tersedia</option>
              <option value="inactive">Habis Terjual</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="appearance-none bg-white border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Total search result info */}
            <div className="ml-auto text-[10px] font-bold text-slate-400">
              {filteredItems.length} produk ditemukan
            </div>
          </div>

          {/* DataTable Card */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-3xl shadow-sm" padding="none">
            {isLoading ? (
              <div className="p-12"><Loading message="Memuat database katalog…" /></div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                    <thead className="text-[10px] uppercase bg-[var(--bg-primary)]/60 text-slate-500 font-bold border-b border-[var(--border-color)]/60">
                      <tr>
                        <th className="px-6 py-4">Gambar & Nama</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Harga</th>
                        <th className="px-6 py-4">Varian Size</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/60 bg-white">
                      {paginatedItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img width={44} height={44} alt={item.name || 'Merchandise'} src={item.image_url || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100'} className="w-11 h-11 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]" />
                              <div className="min-w-0">
                                <div className="font-extrabold text-slate-800 text-xs truncate max-w-[200px]">{item.name}</div>
                                <div className="font-mono text-[9px] text-slate-400 mt-0.5">{item.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                              {item.category || 'Clothing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-black text-slate-800">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {item.sizes && item.sizes.length > 0 ? (
                                item.sizes.map(sz => (
                                  <span key={sz} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">{sz}</span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No Size</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleQuickToggleActive(item)}
                              className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                                item.is_available 
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                  : 'text-red-700 bg-red-50 border-red-200'
                              }`}
                            >
                              {item.is_available ? '✓ Tersedia' : '✕ Habis'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleOpenEditWorkspace(item)} 
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                                title="Ubah Produk"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => requestDelete(item)} 
                                className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedItems.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs font-bold italic">
                            Belum ada merchandise yang sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]/60 bg-white">
                  {paginatedItems.map(item => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                      <div className="flex gap-3">
                        <img width={64} height={64} alt={item.name || 'Merchandise'} src={item.image_url || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100'} className="w-16 h-16 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="font-extrabold text-slate-800 text-xs line-clamp-2">{item.name}</div>
                          <div className="font-mono text-[9px] text-slate-400 mt-1">{item.id}</div>
                          <div className="font-black text-slate-800 mt-1">{formatCurrency(item.price)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                            {item.category || 'Clothing'}
                          </span>
                          <button
                            onClick={() => handleQuickToggleActive(item)}
                            className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                              item.is_available 
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                : 'text-red-700 bg-red-50 border-red-200'
                            }`}
                          >
                            {item.is_available ? '✓ Tersedia' : '✕ Habis'}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => handleOpenEditWorkspace(item)} 
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-transparent rounded-lg transition-colors cursor-pointer"
                            title="Ubah Produk"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => requestDelete(item)} 
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 border border-transparent rounded-lg transition-colors cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 border-t border-[var(--border-color)]/30 pt-3">
                          {item.sizes.map(sz => (
                            <span key={sz} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{sz}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {paginatedItems.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs font-bold italic">
                      Belum ada merchandise yang sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Table Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <p>
                Menampilkan{' '}
                <span className="font-bold text-slate-700">{(visiblePage - 1) * INVENTORY_PAGE_SIZE + 1}–{Math.min(visiblePage * INVENTORY_PAGE_SIZE, filteredItems.length)}</span> dari{' '}
                <span className="font-bold text-slate-700">{filteredItems.length}</span> produk
              </p>
              <div className="flex items-center gap-1 select-none">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white p-1.5 transition hover:border-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={visiblePage === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2">
                  {visiblePage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white p-1.5 transition hover:border-slate-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={visiblePage >= totalPages}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────── WORKSPACE: EDITOR ─────────────────── */}
      {activeWorkspace === 'editor' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto animate-fade-in">
          {/* Main Grid: Form details on the left, photo upload preview on the right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Details */}
            <div className="md:col-span-7 space-y-6">
              {/* Product Basic Info */}
              <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white space-y-5 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Informasi Dasar Produk
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                    <input autoComplete="off" /* autocomplete="off" */  type="text" name="name" placeholder="Masukkan nama produk…" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Harga (Rupiah)</label>
                      <input autoComplete="off" /* autocomplete="off" */  type="number" name="price" placeholder="Misal: 150000" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                      <select 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] font-bold text-xs cursor-pointer transition-colors"
                      >
                        {Object.values(MERCH_CATEGORIES).filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sizing Section */}
              <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white space-y-4 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Varian & Ukuran Tersedia
                </h3>
                <p className="text-[10px] text-slate-500">
                  Tulis opsi ukuran yang dipisahkan oleh tanda koma (Contoh: S, M, L, XL).
                </p>

                <div className="space-y-4">
                  <input autoComplete="off" /* autocomplete="off" */  type="text" name="sizesInput" value={formData.sizesInput} onChange={handleInputChange} placeholder="S, M, L, XL" className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" />

                  {/* Size Quick Add chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['S', 'M', 'L', 'XL', 'XXL', 'All Size'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeQuickAdd(sz)}
                        className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide border border-slate-200 bg-slate-50 rounded-full hover:border-[var(--color-primary)] hover:bg-white text-slate-600 transition cursor-pointer"
                      >
                        + {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white space-y-4 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Deskripsi & Spesifikasi Produk
                </h3>
                <textarea name="description" rows="5" placeholder="Detail deskripsi bahan, spesifikasi ukuran…" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] font-semibold text-xs transition-colors resize-none" />
              </Card>
            </div>

            {/* Right Column: Photo Uploads & Status */}
            <div className="md:col-span-5 space-y-6">
              {/* Product Status (Availability Toggle) */}
              <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white rounded-3xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Status Ketersediaan
                </h3>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="is_available" id="is_available" checked={formData.is_available} onChange={handleInputChange} className="w-4.5 h-4.5 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer" />
                  <label htmlFor="is_available" className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer select-none">
                    Produk Aktif / Tersedia
                  </label>
                </div>
              </Card>

              {/* Multiple Images Upload & Preview Panels */}
              <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white rounded-3xl p-5 shadow-sm space-y-5">
                <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Galeri Foto Produk (Max 3)
                </h3>

                <div className="space-y-5">
                  {[
                    { label: 'Gambar Utama (Cover)', key: 'image_url' },
                    { label: 'Gambar Tambahan 1', key: 'image_url_2' },
                    { label: 'Gambar Tambahan 2', key: 'image_url_3' }
                  ].map((imgSlot, idx) => {
                    const hasVal = Boolean(formData[imgSlot.key]);
                    return (
                      <div key={imgSlot.key} className="space-y-2 border-b border-slate-100/80 pb-4 last:border-b-0 last:pb-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{imgSlot.label}</span>
                        
                        {hasVal ? (
                          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group shadow-sm">
                            <img width={400} height={300} alt="Product Gallery Slot" src={(formData[imgSlot.key])?.src || (formData[imgSlot.key])} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, [imgSlot.key]: '' }));
                                  setSelectedFiles(prev => {
                                    const copy = { ...prev };
                                    delete copy[imgSlot.key];
                                    return copy;
                                  });
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
                            files={selectedFiles[imgSlot.key] ? [{
                              id: imgSlot.key,
                              file: selectedFiles[imgSlot.key],
                              progress: uploadingKey === imgSlot.key ? progress : 0,
                              status: uploadingKey === imgSlot.key ? 'uploading' : 'completed'
                            }] : []}
                            onFilesChange={(newFiles) => {
                              if (newFiles && newFiles.length > 0) {
                                handleImageUpload(imgSlot.key, newFiles[0]);
                              }
                            }}
                            onFileRemove={() => {
                              setFormData(prev => ({ ...prev, [imgSlot.key]: '' }));
                              setSelectedFiles(prev => {
                                const copy = { ...prev };
                                delete copy[imgSlot.key];
                                return copy;
                              });
                            }}
                            accept="image/*"
                            multiple={false}
                            className="max-w-full"
                          />
                        )}

                        {/* Image URL text input */}
                        <input autoComplete="off" /* autocomplete="off" */  type="text" name={imgSlot.key} value={formData[imgSlot.key]} onChange={handleInputChange} placeholder="Paste URL foto dari internet…" className="w-full px-3.5 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] font-semibold text-[10px] transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Form Actions bottom bar */}
          <div className="flex justify-end gap-3 pt-5 border-t border-[var(--border-color)]/60">
            <Button 
              type="button" 
              variant="outline" 
              size="md" 
              onClick={() => {
                resetForm();
                setActiveWorkspace('inventory');
              }}
              disabled={isSubmitting}
              className="rounded-xl font-bold text-xs uppercase"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="md"
              disabled={isSubmitting || isUploading}
              isLoading={isSubmitting}
              className="rounded-xl font-bold text-xs uppercase cursor-pointer"
            >
              Simpan Produk
            </Button>
          </div>
        </form>
      )}

      {/* ─────────────────── WORKSPACE: PAYMENT CONFIGURATION ─────────────────── */}
      {activeWorkspace === 'payment' && (
        <form onSubmit={handlePaymentSettingsSubmit} className="space-y-6 max-w-3xl mx-auto animate-fade-in">
          {isSettingsLoading ? (
            <div className="p-12"><Loading message="Memuat info pembayaran…" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Form Details */}
              <div className="md:col-span-7 space-y-6">
                <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white space-y-5 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                    Detail Pengaturan Rekening & Bank
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Bank / Wallet</label>
                      <input autoComplete="off" /* autocomplete="off" */  name="bank_name" type="text" placeholder="Misal: BANK JAGO, OVO, DANA, BCA" value={paymentSettings.bank_name} onChange={(e) => setPaymentSettings(prev => ({ ...prev, bank_name: e.target.value }))} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Rekening / HP</label>
                      <input autoComplete="off" /* autocomplete="off" */  name="account_number" type="text" placeholder="Masukkan nomor rekening atau nomor HP e-wallet…" value={paymentSettings.account_number} onChange={(e) => setPaymentSettings(prev => ({ ...prev, account_number: e.target.value }))} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" required />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Penerima (Atas Nama)</label>
                      <input autoComplete="off" /* autocomplete="off" */  name="account_holder" type="text" placeholder="Masukkan nama lengkap pemilik rekening…" value={paymentSettings.account_holder} onChange={(e) => setPaymentSettings(prev => ({ ...prev, account_holder: e.target.value }))} className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] font-semibold text-xs transition-colors" required />
                    </div>
                  </div>
                </Card>
              </div>

              {/* QRIS Upload */}
              <div className="md:col-span-5 space-y-6">
                <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white rounded-3xl p-5 shadow-sm space-y-5">
                  <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-slate-100 pb-2">
                    Foto QRIS Pembayaran
                  </h3>
                  
                  <div className="space-y-4">
                    {paymentSettings.qris_url ? (
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group shadow-sm">
                        <img width={400} height={300} alt="Preview QRIS" src={(paymentSettings.qris_url)?.src || (paymentSettings.qris_url)} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentSettings(prev => ({ ...prev, qris_url: '' }));
                              setSelectedFiles(prev => {
                                const copy = { ...prev };
                                delete copy.payment_qris;
                                return copy;
                              });
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
                        files={selectedFiles.payment_qris ? [{
                          id: 'payment_qris',
                          file: selectedFiles.payment_qris,
                          progress: uploadingKey === 'payment_qris' ? progress : 0,
                          status: uploadingKey === 'payment_qris' ? 'uploading' : 'completed'
                        }] : []}
                        onFilesChange={(newFiles) => {
                          if (newFiles && newFiles.length > 0) {
                            handleQrisUpload(newFiles[0]);
                          }
                        }}
                        onFileRemove={() => {
                          setPaymentSettings(prev => ({ ...prev, qris_url: '' }));
                          setSelectedFiles(prev => {
                            const copy = { ...prev };
                            delete copy.payment_qris;
                            return copy;
                          });
                        }}
                        accept="image/*"
                        multiple={false}
                        className="max-w-full"
                      />
                    )}

                    {/* QRIS URL input */}
                    <input autoComplete="off" /* autocomplete="off" */  name="qris_url" type="text" placeholder="Paste URL foto QRIS dari internet…" value={paymentSettings.qris_url} onChange={(e) => setPaymentSettings(prev => ({ ...prev, qris_url: e.target.value }))} className="w-full px-3.5 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] font-semibold text-[10px] transition-colors" />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Form Actions bottom bar */}
          {!isSettingsLoading && (
            <div className="flex justify-end gap-3 pt-5 border-t border-[var(--border-color)]/60">
              <Button 
                type="button" 
                variant="outline" 
                size="md" 
                onClick={() => {
                  setActiveWorkspace('inventory');
                }}
                disabled={isSavingSettings}
                className="rounded-xl font-bold text-xs uppercase"
              >
                Kembali
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="md"
                disabled={isSavingSettings || isUploading}
                isLoading={isSavingSettings}
                className="rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Simpan Informasi Pembayaran
              </Button>
            </div>
          )}
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Produk Merchandise"
        size="md"
      >
        <div className="space-y-4 text-sm text-[var(--text-primary)]">
          <div className="flex gap-3 items-start p-3 bg-red-50 border border-red-200 rounded-2xl">
            <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-extrabold text-xs text-red-800 uppercase tracking-wide">Konfirmasi Penghapusan Permanen</h5>
              <p className="text-[11px] text-red-700 leading-normal mt-1">
                Apakah Anda benar-benar yakin ingin menghapus produk <strong className="font-bold">"{itemToDelete?.name}"</strong>? Aksi ini tidak dapat dibatalkan dan produk akan langsung terhapus dari database katalog toko.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button 
              type="button" 
              variant="danger" 
              size="sm" 
              onClick={handleDeleteConfirmed}
              className="cursor-pointer"
            >
              Ya, Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Simple inline ShieldAlert icon
function ShieldAlert({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
