'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { galleryService } from '../../../services/public/galleryService';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { Plus, Edit, Trash2, Search, ImageIcon, Upload, Loader } from 'lucide-react';
import { useSupabaseUpload } from '../../../hooks/useSupabaseUpload';
import { FileUploadCard } from '../../../components/ui/FileUploadCard';

export default function AdminGallery() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'gallery' | 'showcase'

  // Upload and hook states
  const { uploadFile, isUploading: isFileUploading, progress: uploadProgress } = useSupabaseUpload();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    display_type: 'gallery'
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

  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      if (file.type === 'image/webp') {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Konversi ke WebP gagal.'));
                return;
              }
              const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const webpFile = new File([blob], `${originalName}.webp`, { type: 'image/webp' });
              resolve(webpFile);
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      display_type: 'gallery'
    });
    setSelectedFile(null);
    setFilePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || '',
      url: item.url || '',
      display_type: item.display_type || 'gallery'
    });
    setSelectedFile(null);
    setFilePreview(item.url || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await galleryService.deleteGalleryPhoto(id);
    if (res.success) {
      setItems(items.filter(item => item.id !== id));
      notify.success('Foto dihapus', 'Foto galeri berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus foto', res.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.warning('Berkas tidak valid', 'Hanya diperbolehkan mengunggah berkas gambar.');
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      notify.warning('Data belum lengkap', 'Judul foto harus diisi.');
      return;
    }

    if (!selectedFile && !formData.url.trim()) {
      notify.warning('Gambar belum dipilih', 'Pilih berkas gambar untuk diunggah atau masukkan URL gambar.');
      return;
    }

    setIsSubmitting(true);
    let finalUrl = formData.url.trim();

    try {
      if (selectedFile) {
        setIsConverting(true);
        const webpFile = await convertToWebP(selectedFile);
        setIsConverting(false);

        // Upload using useSupabaseUpload
        finalUrl = await uploadFile(webpFile, 'assets', 'gallery');
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        url: finalUrl,
        display_type: formData.display_type
      };

      let result;
      if (modalMode === 'add') {
        result = await galleryService.createGalleryPhoto(payload);
      } else {
        result = await galleryService.updateGalleryPhoto(editingId, payload);
      }

      if (result.success) {
        setIsModalOpen(false);
        fetchData();
        notify.success(
          modalMode === 'add' ? 'Foto ditambahkan' : 'Foto diperbarui',
          'Perubahan foto galeri berhasil disimpan.'
        );
      } else {
        notify.error('Gagal menyimpan foto', result.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal mengunggah berkas', err.message);
    } finally {
      setIsSubmitting(false);
      setIsConverting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = false;
    if (filterType === 'all') {
      matchesFilter = true;
    } else if (filterType === 'gallery') {
      matchesFilter = item.display_type === 'gallery' || item.display_type === 'both' || !item.display_type;
    } else if (filterType === 'showcase') {
      matchesFilter = item.display_type === 'showcase' || item.display_type === 'both';
    } else if (filterType === 'both') {
      matchesFilter = item.display_type === 'both';
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <ImageIcon className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Album Galeri Foto
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Unggah poster visual kegiatan, fanart terverifikasi, atau tangkapan layar keseruan live stream.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Unggah Foto Baru
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input autoComplete="off" /* autocomplete="off" */ name="searchQuery" type="text" placeholder="Cari foto galeri…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Tipe Tampilan:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm"
          >
            <option value="all">Semua Foto ({items.length})</option>
            <option value="gallery">Galeri Utama ({items.filter(i => (i.display_type || 'gallery') === 'gallery' || i.display_type === 'both').length})</option>
            <option value="showcase">Highlight Showcase ({items.filter(i => i.display_type === 'showcase' || i.display_type === 'both').length})</option>
            <option value="both">Keduanya ({items.filter(i => i.display_type === 'both').length})</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat album galeri…" /></div>
        ) : (
          <div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-4">Foto</th>
                    <th className="px-6 py-4">Judul Foto</th>
                    <th className="px-6 py-4">Tipe Tampilan</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img width={64} height={64} alt={item.title || 'Gallery Cover'} src={(item.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100')?.src || (item.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100')} className="w-16 h-16 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm" />
                      </td>
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm max-w-[200px] lg:max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          item.display_type === 'showcase'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.display_type === 'both'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {item.display_type === 'showcase'
                            ? 'Showcase'
                            : item.display_type === 'both'
                            ? 'Keduanya'
                            : 'Gallery'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--text-secondary)] max-w-[200px] lg:max-w-sm truncate">
                        {item.description || <span className="text-[var(--text-muted)] italic">Tidak ada keterangan</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors"
                            title="Ubah Foto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
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
                      <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                        Belum ada foto galeri yang sesuai dengan pencarian Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {filteredItems.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex gap-3 items-start min-w-0">
                    <img width={64} height={64} alt={item.title || 'Gallery Cover'} src={(item.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100')?.src || (item.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100')} className="w-16 h-16 object-cover rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[var(--text-primary)] text-sm line-clamp-2 break-words">{item.title}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          item.display_type === 'showcase'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : item.display_type === 'both'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {item.display_type === 'showcase' ? 'Showcase' : item.display_type === 'both' ? 'Keduanya' : 'Gallery'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-[var(--text-secondary)] line-clamp-3 break-words min-w-0">
                    {item.description || <span className="text-[var(--text-muted)] italic">Tidak ada keterangan</span>}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)] mt-1">
                    <button 
                      onClick={() => handleOpenEditModal(item)} 
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" /> Ubah
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                  Belum ada foto galeri yang sesuai dengan pencarian Anda.
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
        title={modalMode === 'add' ? 'Unggah Foto Galeri Baru' : 'Ubah Detail Foto Galeri'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Foto</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="title" placeholder="Masukkan judul atau caption singkat foto…" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
          </div>

          {/* Display Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tipe Tampilan</label>
            <select
              name="display_type"
              value={formData.display_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors font-semibold text-xs text-[var(--text-primary)]"
            >
              <option value="gallery">Halaman Galeri Utama (Public Gallery Page)</option>
              <option value="showcase">Highlight Showcase (Homepage & Tentang IRIS)</option>
              <option value="both">Keduanya (Galeri Utama & Highlight Showcase)</option>
            </select>
          </div>

          {/* File Upload Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Unggah Berkas Gambar</label>
            <FileUploadCard
              files={selectedFile ? [{
                id: 'gallery-upload',
                file: selectedFile,
                progress: isConverting ? 15 : uploadProgress,
                status: (isConverting || isFileUploading) ? 'uploading' : 'completed'
              }] : []}
              onFilesChange={(newFiles) => {
                if (newFiles && newFiles.length > 0) {
                  const file = newFiles[0];
                  if (!file.type.startsWith('image/')) {
                    notify.warning('Berkas tidak valid', 'Hanya diperbolehkan mengunggah berkas gambar.');
                    return;
                  }
                  setSelectedFile(file);
                  setFilePreview(URL.createObjectURL(file));
                }
              }}
              onFileRemove={() => {
                setSelectedFile(null);
                setFilePreview('');
              }}
              accept="image/*"
              multiple={false}
              className="max-w-full"
            />
          </div>

          {/* Image Preview */}
          {filePreview && !isConverting && !isFileUploading && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)] mt-2">
              <img width={400} height={300} src={(filePreview)?.src || (filePreview)} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}

          {/* Fallback URL Input (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Atau Gunakan Direct URL (Opsional)</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="url" placeholder="https://images.unsplash.com/photo-..." value={formData.url} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" disabled={isSubmitting || isFileUploading || isConverting} />
            <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika Anda sudah memilih berkas foto di atas.</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi Tambahan</label>
            <textarea name="description" rows="3" placeholder="Keterangan pendukung untuk foto ini…" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors resize-none" />
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
              disabled={isSubmitting || isFileUploading || isConverting}
              className="cursor-pointer"
            >
              {isSubmitting || isFileUploading || isConverting ? 'Memproses…' : 'Simpan Foto'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Foto Galeri"
        message="Apakah Anda yakin ingin menghapus foto galeri ini secara permanen?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}

