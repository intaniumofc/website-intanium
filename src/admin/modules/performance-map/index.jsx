'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { useMediaUpload } from '../../../hooks/useMediaUpload';
import {
  getPerformanceLocations,
  createPerformanceLocation,
  updatePerformanceLocation,
  deletePerformanceLocation,
} from '../../../lib/performance-locations';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Search,
  Globe,
  Compass,
  Mic,
  Star,
  Sparkles,
  Loader2,
  Upload,
  ImageIcon,
  X,
  Calendar,
  Filter,
} from 'lucide-react';

export default function AdminPerformanceMap() {
  const notify = useAdminToast();
  const { uploadFile, isUploading: isFileUploading, progress: uploadProgress } = useMediaUpload();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  // File Upload State for Modal
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'onair',
    venue_name: '',
    city: '',
    province: '',
    latitude: '',
    longitude: '',
    event_date: '',
    description: '',
    photo_url: '',
    source_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getPerformanceLocations();
      setItems(data);
    } catch (err) {
      notify.error('Gagal mengambil data titik lokasi penampilan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Derive unique years and cities for dropdown filters
  const uniqueYears = useMemo(() => {
    const years = new Set();
    items.forEach((item) => {
      if (item.event_date) {
        const year = item.event_date.split('-')[0];
        if (year) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [items]);

  const uniqueCities = useMemo(() => {
    const cities = new Set();
    items.forEach((item) => {
      if (item.city) cities.add(item.city);
    });
    return Array.from(cities).sort();
  }, [items]);

  // Reverse Geocoding helper using OpenStreetMap Nominatim API
  const reverseGeocode = useCallback(async (lat, lng, forceUpdate = false) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lngNum}&zoom=14`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      if (!response.ok) throw new Error('Geocoding request failed');
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const detectedCity = addr.city || addr.town || addr.city_district || addr.county || addr.municipality || '';
        const detectedProvince = addr.state || addr.region || '';
        const detectedVenue =
          addr.amenity ||
          addr.building ||
          addr.shop ||
          addr.leisure ||
          addr.suburb ||
          (data.display_name ? data.display_name.split(',')[0] : '');

        setFormData((prev) => ({
          ...prev,
          city: forceUpdate || !prev.city ? detectedCity || prev.city : prev.city,
          province: forceUpdate || !prev.province ? detectedProvince || prev.province : prev.province,
          venue_name: forceUpdate || !prev.venue_name ? detectedVenue || prev.venue_name : prev.venue_name,
        }));

        notify.success(`Lokasi terdeteksi: ${detectedCity || detectedVenue}`);
      }
    } catch (err) {
      console.warn('Reverse geocoding fallback:', err);
    } finally {
      setIsGeocoding(false);
    }
  }, [notify]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setFormData({
      title: '',
      type: 'onair',
      venue_name: '',
      city: '',
      province: '',
      latitude: '-6.2255',
      longitude: '106.8024',
      event_date: new Date().toISOString().split('T')[0],
      description: '',
      photo_url: '',
      source_url: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setSelectedImageFile(null);
    setImagePreviewUrl(item.photo_url || '');
    setFormData({
      title: item.title || '',
      type: item.type || 'onair',
      venue_name: item.venue_name || '',
      city: item.city || '',
      province: item.province || '',
      latitude: item.latitude ? String(item.latitude) : '',
      longitude: item.longitude ? String(item.longitude) : '',
      event_date: item.event_date || '',
      description: item.description || item.summary || '',
      photo_url: item.photo_url || '',
      source_url: item.source_url || '',
    });
    setIsModalOpen(true);
  };

  const handleCoordinateBlur = () => {
    if (formData.latitude && formData.longitude) {
      reverseGeocode(formData.latitude, formData.longitude, false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        notify.error('File harus berupa gambar (JPG, PNG, WebP).');
        return;
      }
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setFormData((prev) => ({ ...prev, photo_url: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue_name || !formData.city || !formData.latitude || !formData.longitude || !formData.event_date) {
      notify.error('Mohon isi semua field wajib (Judul, Venue, Kota, Koordinat, dan Tanggal Event).');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = formData.photo_url;

      if (selectedImageFile) {
        notify.info('Mengunggah foto event...');
        finalPhotoUrl = await uploadFile(selectedImageFile, 'assets', 'peta-penampilan');
      }

      const payload = {
        title: formData.title,
        type: formData.type,
        venue_name: formData.venue_name,
        city: formData.city,
        province: formData.province || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        event_date: formData.event_date,
        summary: formData.description || formData.title,
        description: formData.description || null,
        photo_url: finalPhotoUrl || null,
        source_url: formData.source_url || null,
      };

      if (modalMode === 'add') {
        await createPerformanceLocation(payload);
        notify.success('Berhasil menambah titik penampilan baru.');
      } else {
        await updatePerformanceLocation(editingId, payload);
        notify.success('Berhasil memperbarui data titik penampilan.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      notify.error(err.message || 'Gagal menyimpan data lokasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deletePerformanceLocation(confirmDelete.id);
      notify.success('Berhasil menghapus titik penampilan.');
      setConfirmDelete({ isOpen: false, id: null });
      fetchData();
    } catch (err) {
      notify.error('Gagal menghapus data lokasi.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'All' || item.type === selectedType.toLowerCase();
    const itemYear = item.event_date ? item.event_date.split('-')[0] : '';
    const matchesYear = selectedYear === 'All' || itemYear === selectedYear;
    const matchesCity = selectedCity === 'All' || item.city === selectedCity;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.venue_name?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query);

    return matchesType && matchesYear && matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar with High Contrast Text */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#FF5FB2]" /> Kelola Peta Penampilan
          </h1>
          <p className="text-xs text-slate-600 font-bold mt-1">
            Tambah, edit, dan atur titik lokasi pertunjukan On-Air dan Off-Air Nur Intan di seluruh Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/peta-penampilan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-xs transition-colors"
          >
            <Globe className="w-4 h-4 text-[#2E7BC4]" /> Lihat Peta Publik
          </a>
          <Button onClick={handleOpenAddModal} className="bg-[#FF5FB2] hover:bg-[#D83584] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Lokasi Baru
          </Button>
        </div>
      </div>

      {/* Unified Filter Bar with Dropdowns and Full-Width Search */}
      <Card className="p-4 bg-white border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Dropdown Filters Container */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Tipe Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800">
              <Filter className="w-3.5 h-3.5 text-[#FF5FB2] shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="All">Semua Tipe</option>
                <option value="Onair">On-Air (Theater)</option>
                <option value="Offair">Off-Air (Outdoor)</option>
              </select>
            </div>

            {/* Tahun Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#2E7BC4] shrink-0" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="All">Semua Tahun</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Kota Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="All">Semua Kota</option>
                {uniqueCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expanded Full-Width Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul event, nama venue, atau kota..."
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Table Data List */}
      {isLoading ? (
        <Loading />
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center text-slate-600 font-bold bg-white border border-slate-200">Belum ada data titik penampilan.</Card>
      ) : (
        <Card className="overflow-hidden border border-slate-200 shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase bg-slate-50/90 text-[#3B5998] font-extrabold tracking-wider border-b border-slate-200 select-none">
                <tr>
                  <th className="p-4 font-black">Tipe & Judul Event</th>
                  <th className="p-4 font-black">Venue & Kota</th>
                  <th className="p-4 font-black">Koordinat</th>
                  <th className="p-4 font-black">Tanggal</th>
                  <th className="p-4 text-right font-black">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-pink-50/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : item.type === 'onair' ? (
                          <span className="p-2.5 rounded-xl bg-blue-100 text-[#2E7BC4] border border-blue-200 shrink-0 font-bold">
                            <Mic className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-2.5 rounded-xl bg-pink-100 text-[#D83584] border border-pink-200 shrink-0 font-bold">
                            <Star className="w-4 h-4" />
                          </span>
                        )}
                        <div>
                          <div className="font-black text-slate-900 text-sm line-clamp-1">{item.title}</div>
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                              item.type === 'onair'
                                ? 'bg-blue-50 text-[#2E7BC4] border border-blue-200'
                                : 'bg-pink-50 text-[#D83584] border border-pink-200'
                            }`}
                          >
                            {item.type === 'onair' ? 'On-Air (Theater)' : 'Off-Air (Outdoor)'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{item.venue_name}</div>
                      <div className="text-slate-600 font-bold text-[11px] mt-0.5">
                        📍 {item.city}{item.province ? `, ${item.province}` : ''}
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-[11px] text-slate-700">
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </td>

                    <td className="p-4 font-extrabold text-slate-900">
                      {item.event_date}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-xl bg-blue-50 text-[#2E7BC4] hover:bg-blue-100 border border-blue-200 font-bold transition-colors"
                          title="Edit Lokasi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ isOpen: true, id: item.id })}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold transition-colors"
                          title="Hapus Lokasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Form Add/Edit (Wide 2xl Size & Smooth Scroll Container) */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'Tambah Lokasi Penampilan Baru' : 'Edit Data Penampilan'}
          size="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5 text-slate-900">
            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Judul Event / Pertunjukan *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: JKT48 Meet & Greet Makassar"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Tipe Penampilan *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white cursor-pointer transition-all"
                >
                  <option value="onair">On-Air (Theater / TV)</option>
                  <option value="offair">Off-Air (Outdoor / Event)</option>
                </select>
              </div>
            </div>

            {/* Clean Upload Foto / Banner Box */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                Upload Foto / Banner Event
              </label>

              {imagePreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 group max-h-56 bg-slate-900 flex items-center justify-center">
                  <img src={imagePreviewUrl} alt="Preview" className="max-h-56 w-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:bg-slate-100 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#FF5FB2]" /> Ganti Gambar
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:bg-rose-700 flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 hover:border-[#FF5FB2] rounded-2xl cursor-pointer bg-slate-50 hover:bg-pink-50/30 transition-all p-5 text-center">
                  <ImageIcon className="w-9 h-9 text-slate-400 mb-2" />
                  <span className="text-xs font-extrabold text-slate-800">
                    Klik untuk memilih foto / tarik gambar ke sini
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                </label>
              )}

              {/* Optional External URL Fallback */}
              <div className="mt-2.5">
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => {
                    setFormData({ ...formData, photo_url: e.target.value });
                    if (e.target.value) setImagePreviewUrl(e.target.value);
                  }}
                  placeholder="Atau tempel URL gambar eksternal langsung (https://...)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                />
              </div>
            </div>

            {/* Latitude & Longitude with Auto-Geocode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-900">Titik Koordinat *</label>
                <button
                  type="button"
                  onClick={() => reverseGeocode(formData.latitude, formData.longitude, true)}
                  disabled={isGeocoding || !formData.latitude || !formData.longitude}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D83584] hover:underline disabled:opacity-50"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mendeteksi Nama Lokasi...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5FB2]" /> Deteksi Nama Lokasi Otomatis
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    onBlur={handleCoordinateBlur}
                    placeholder="Latitude (Misal: -5.1601)"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    onBlur={handleCoordinateBlur}
                    placeholder="Longitude (Misal: 119.4046)"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Venue, City & Province */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Nama Venue / Tempat *</label>
                <input
                  type="text"
                  required
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  placeholder="Misal: Trans Studio Mall Makassar"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Kota *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Misal: Makassar"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Provinsi</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="Misal: Sulawesi Selatan"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Tanggal Event *</label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
              />
            </div>

            {/* Event Description */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">Deskripsi Event</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Penampilan rutin setlist, song unit, atau cerita momen spesial..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
              />
            </div>

            {/* URL Sumber Resmi */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-1.5">URL Sumber Resmi (Opsional)</label>
              <input
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://jkt48.com..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#FF5FB2] focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <Button
                type="submit"
                disabled={isSubmitting || isFileUploading}
                className="bg-[#FF5FB2] hover:bg-[#D83584] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2"
              >
                {(isSubmitting || isFileUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFileUploading
                  ? `Mengunggah Foto (${uploadProgress}%)...`
                  : isSubmitting
                  ? 'Menyimpan...'
                  : 'Simpan Lokasi'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus Titik Penampilan?"
        description="Apakah Anda yakin ingin menghapus titik lokasi ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
