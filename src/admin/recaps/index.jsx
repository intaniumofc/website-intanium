import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { recapService } from '../../features/recaps/recapService';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import { Plus, Edit, Trash2, Calendar, FileText, Search, PlusCircle, Trash, BookOpen, Upload, Loader } from 'lucide-react';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';

export default function AdminRecaps() {
  const notify = useAdminToast();
  const { uploadFile, isUploading, progress: uploadProgress } = useSupabaseUpload();
  const [items, setItems] = useState([]);

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      notify.info('Mengunggah...', 'Sedang mengunggah gambar sampul...');
      const publicUrl = await uploadFile(file, 'assets', 'recaps');
      setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
      notify.success('Berhasil', 'Gambar sampul telah diunggah.');
    } catch (err) {
      notify.error('Gagal mengunggah', err.message || 'Terjadi kesalahan.');
    }
  };

  const handleUploadPageImage = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      notify.info('Mengunggah...', `Sedang mengunggah halaman ${index + 1}...`);
      const publicUrl = await uploadFile(file, 'assets', 'recaps');
      handlePageRowChange(index, 'image_url', publicUrl);
      notify.success('Berhasil', `Gambar halaman ${index + 1} telah diunggah.`);
    } catch (err) {
      notify.error('Gagal mengunggah', err.message || 'Terjadi kesalahan.');
    }
  };

  const [activeTab, setActiveTab] = useState('zine'); // 'zine' | 'monthly'
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '',
    publish_date: '',
    summary: '',
    thumbnail_url: ''
  });

  const [formPages, setFormPages] = useState([]); // Array of { image_url: '', caption: '' }

  // Monthly Recaps States
  const [monthlyItems, setMonthlyItems] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [confirmDeleteMonthly, setConfirmDeleteMonthly] = useState({ isOpen: false, id: null });
  const [monthlyFormTab, setMonthlyFormTab] = useState('info'); // 'info' | 'activity' | 'moments'

  const [monthlyFormData, setMonthlyFormData] = useState({
    id: '',
    year: new Date().getFullYear(),
    month: 'Januari',
    theme: '',
    monthlyNote: '',
    theaterTotal: 0,
    theaterItems: [],
    youtubeDate: '',
    youtubeTitle: '',
    livePlatform: 'IDN Live',
    liveTotal: 0,
    liveDates: '',
    bubbleChat: 0,
    voiceNote: 0,
    photo: 0,
    videoCallTitle: '',
    videoCallDates: '',
    eventTitle: '',
    eventDate: ''
  });

  useEffect(() => {
    fetchData();
    fetchMonthlyData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await recapService.getRecaps();
    setItems(data);
    setIsLoading(false);
  };

  const fetchMonthlyData = async () => {
    setIsMonthlyLoading(true);
    const data = await recapService.getMonthlyRecaps();
    setMonthlyItems(data);
    setIsMonthlyLoading(false);
  };

  const handleOpenAddMonthlyModal = () => {
    setModalMode('add');
    setEditingId(null);
    setMonthlyFormTab('info');
    setMonthlyFormData({
      id: '',
      year: new Date().getFullYear(),
      month: 'Januari',
      theme: '',
      monthlyNote: '',
      theaterTotal: 0,
      theaterItems: [],
      youtubeDate: '',
      youtubeTitle: '',
      livePlatform: 'IDN Live',
      liveTotal: 0,
      liveDates: '',
      bubbleChat: 0,
      voiceNote: 0,
      photo: 0,
      videoCallTitle: '',
      videoCallDates: '',
      eventTitle: '',
      eventDate: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditMonthlyModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setMonthlyFormTab('info');
    setMonthlyFormData({
      id: item.id,
      year: item.year,
      month: item.month,
      theme: item.theme,
      monthlyNote: item.right_page?.monthlyNote || '',
      theaterTotal: item.left_page?.theater?.total || 0,
      theaterItems: item.left_page?.theater?.items || [],
      youtubeDate: item.left_page?.youtube?.date || '',
      youtubeTitle: item.left_page?.youtube?.title || '',
      livePlatform: item.left_page?.live?.platform || 'IDN Live',
      liveTotal: item.left_page?.live?.total || 0,
      liveDates: item.left_page?.live?.dates?.join(', ') || '',
      bubbleChat: item.right_page?.privateMessage?.bubbleChat || 0,
      voiceNote: item.right_page?.privateMessage?.voiceNote || 0,
      photo: item.right_page?.privateMessage?.photo || 0,
      videoCallTitle: item.right_page?.videoCall?.title || '',
      videoCallDates: item.right_page?.videoCall?.dates?.join(', ') || '',
      eventTitle: item.right_page?.event?.title || '',
      eventDate: item.right_page?.event?.date || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteMonthly = (id) => {
    setConfirmDeleteMonthly({ isOpen: true, id });
  };

  const confirmDeleteMonthlyAction = async () => {
    const id = confirmDeleteMonthly.id;
    setConfirmDeleteMonthly({ isOpen: false, id: null });
    const res = await recapService.deleteMonthlyRecap(id);
    if (res.success) {
      setMonthlyItems(monthlyItems.filter(item => item.id !== id));
      notify.success('Recap bulanan dihapus', 'Data recap bulanan berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus', res.error);
    }
  };

  const handleMonthlyInputChange = (e) => {
    const { name, value } = e.target;
    setMonthlyFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTheaterItem = () => {
    setMonthlyFormData(prev => ({
      ...prev,
      theaterItems: [...prev.theaterItems, { date: '', title: '' }]
    }));
  };

  const handleRemoveTheaterItem = (index) => {
    setMonthlyFormData(prev => ({
      ...prev,
      theaterItems: prev.theaterItems.filter((_, i) => i !== index)
    }));
  };

  const handleTheaterItemChange = (index, field, value) => {
    setMonthlyFormData(prev => {
      const updated = [...prev.theaterItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, theaterItems: updated };
    });
  };

  const handleSubmitMonthly = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const liveDatesArray = monthlyFormData.liveDates
      .split(',')
      .map(d => parseInt(d.trim(), 10))
      .filter(d => !isNaN(d));

    const videoCallDatesArray = monthlyFormData.videoCallDates
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const monthId = modalMode === 'add' 
      ? `${monthlyFormData.year}-${String(
          ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].indexOf(monthlyFormData.month) + 1
        ).padStart(2, '0')}`
      : editingId;

    const payload = {
      id: monthId,
      year: parseInt(monthlyFormData.year, 10),
      month: monthlyFormData.month,
      theme: monthlyFormData.theme,
      left_page: {
        theater: {
          total: parseInt(monthlyFormData.theaterTotal, 10) || monthlyFormData.theaterItems.length,
          items: monthlyFormData.theaterItems.filter(item => item.date.trim() && item.title.trim())
        },
        youtube: {
          date: monthlyFormData.youtubeDate,
          title: monthlyFormData.youtubeTitle
        },
        live: {
          platform: monthlyFormData.livePlatform,
          total: parseInt(monthlyFormData.liveTotal, 10) || liveDatesArray.length,
          dates: liveDatesArray
        }
      },
      right_page: {
        privateMessage: {
          bubbleChat: parseInt(monthlyFormData.bubbleChat, 10) || 0,
          voiceNote: parseInt(monthlyFormData.voiceNote, 10) || 0,
          photo: parseInt(monthlyFormData.photo, 10) || 0
        },
        videoCall: {
          title: monthlyFormData.videoCallTitle,
          dates: videoCallDatesArray
        },
        event: {
          title: monthlyFormData.eventTitle,
          date: monthlyFormData.eventDate
        },
        monthlyNote: monthlyFormData.monthlyNote
      }
    };

    let result;
    if (modalMode === 'add') {
      result = await recapService.createMonthlyRecap(payload);
    } else {
      result = await recapService.updateMonthlyRecap(editingId, payload);
    }

    setIsSubmitting(false);
    if (result.success) {
      setIsModalOpen(false);
      fetchMonthlyData();
      notify.success(
        modalMode === 'add' ? 'Buku recap dibuat' : 'Buku recap diperbarui',
        'Perubahan buku recap bulanan berhasil disimpan.'
      );
    } else {
      notify.error('Gagal menyimpan recap', result.error);
    }
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

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    const res = await recapService.deleteRecap(id);
    if (res.success) {
      setItems(items.filter(item => item.id !== id));
      notify.success('Zine dihapus', 'Data recap dan zine berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus zine', res.error);
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
      notify.warning('Data belum lengkap', 'Judul recap zine harus diisi.');
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
      notify.success(
        modalMode === 'add' ? 'Zine dibuat' : 'Zine diperbarui',
        'Perubahan recap dan zine berhasil disimpan.'
      );
    } else {
      notify.error('Gagal menyimpan zine', result.error);
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Arsip Recap & Zine
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {activeTab === 'zine' 
              ? 'Unggah majalah komik digital Zine baru atau log komik recap mingguan.' 
              : 'Kelola isi buku recap bulanan (Jadwal panggung, YouTube, stats bubble chat, dll) secara dinamis.'}
          </p>
        </div>
        {activeTab === 'zine' ? (
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4" /> Unggah Zine baru
          </Button>
        ) : (
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddMonthlyModal}>
            <Plus className="h-4 w-4" /> Tambah Buku Recap
          </Button>
        )}
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex gap-4 border-b border-[var(--border-color)] pb-1">
        <button 
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'zine' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          onClick={() => { setActiveTab('zine'); setSearchQuery(''); }}
        >
          Zine Digital
        </button>
        <button 
          className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'monthly' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          onClick={() => { setActiveTab('monthly'); setSearchQuery(''); }}
        >
          Buku Recap Bulanan
        </button>
      </div>

      {/* ZINE VIEW SECTION */}
      {activeTab === 'zine' && (
        <>
          {/* Filters & Search */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Cari edisi Zine..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs"
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
        </>
      )}

      {/* MONTHLY RECAP VIEW SECTION */}
      {activeTab === 'monthly' && (
        <>
          {/* Filters & Search */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Cari tema atau bulan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs"
              />
            </div>
          </div>

          {/* Monthly Table Card */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
            {isMonthlyLoading ? (
              <div className="p-12"><Loading message="Memuat buku rekap..." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                  <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-6 py-4">Bulan / Tahun</th>
                      <th className="px-6 py-4">Tema</th>
                      <th className="px-6 py-4">Theater</th>
                      <th className="px-6 py-4">Live Stream</th>
                      <th className="px-6 py-4">Bubble Chat</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {monthlyItems
                      .filter(item => 
                        item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.theme.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--text-primary)]">
                            {item.month} {item.year}
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs text-[var(--text-primary)]">
                            {item.theme}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            {item.left_page?.theater?.total || 0} Shows ({item.left_page?.theater?.items?.length || 0} Detail)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            {item.left_page?.live?.total || 0}x Live
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--color-primary)]">
                            {item.right_page?.privateMessage?.bubbleChat || 0} Chats
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenEditMonthlyModal(item)} 
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                                title="Ubah Buku Recap"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMonthly(item.id)} 
                                className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                                title="Hapus Buku Recap"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {monthlyItems.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                          Belum ada data rekap bulanan yang tersimpan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ================= ZINE FORM MODAL ================= */}
      <Modal
        isOpen={isModalOpen && activeTab === 'zine'}
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
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="thumbnail_url"
                  placeholder="URL foto sampul zine..."
                  value={formData.thumbnail_url}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all text-xs"
                />
                <label className="px-3 py-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/10 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Unggah</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadThumbnail}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
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
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none text-xs"
              />
            </div>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Loader className="h-4 w-4 animate-spin text-blue-600" />
                <span>Sedang mengunggah gambar ke Supabase Storage ({uploadProgress}%)...</span>
              </div>
              <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

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

                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="URL Gambar Halaman..." 
                        value={page.image_url}
                        onChange={(e) => handlePageRowChange(index, 'image_url', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-[var(--border-color)] rounded-lg outline-none text-xs focus:border-[var(--color-primary)] transition-all"
                        required={index === 0} // Page 1 is mandatory
                      />
                      <label className="px-2.5 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/10 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Unggah</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadPageImage(index, e)}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
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
              disabled={isSubmitting || isUploading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              disabled={isSubmitting || isUploading}
              className="cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Zine'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MONTHLY RECAP FORM MODAL ================= */}
      <Modal
        isOpen={isModalOpen && activeTab === 'monthly'}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Buku Recap Bulanan Baru' : 'Ubah Buku Recap Bulanan'}
        size="lg"
      >
        <form onSubmit={handleSubmitMonthly} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Sub-tabs inside monthly modal form */}
          <div className="flex border-b border-[var(--border-color)] mb-2">
            <button
              type="button"
              className={`pb-2 pr-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${monthlyFormTab === 'info' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
              onClick={() => setMonthlyFormTab('info')}
            >
              Info Umum & Catatan
            </button>
            <button
              type="button"
              className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${monthlyFormTab === 'activity' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
              onClick={() => setMonthlyFormTab('activity')}
            >
              Aktivitas (Theater, Live, YT)
            </button>
            <button
              type="button"
              className={`pb-2 pl-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${monthlyFormTab === 'moments' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
              onClick={() => setMonthlyFormTab('moments')}
            >
              Interaksi & Momen
            </button>
          </div>

          {/* TAB 1: General Info & Note */}
          {monthlyFormTab === 'info' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase text-[var(--text-secondary)]">Bulan</label>
                  <select
                    name="month"
                    value={monthlyFormData.month}
                    onChange={handleMonthlyInputChange}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all font-semibold text-xs text-[var(--text-primary)]"
                    disabled={modalMode === 'edit'}
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase text-[var(--text-secondary)]">Tahun</label>
                  <input
                    type="number"
                    name="year"
                    value={monthlyFormData.year}
                    onChange={handleMonthlyInputChange}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all text-xs"
                    required
                    disabled={modalMode === 'edit'}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase text-[var(--text-secondary)]">Tema / Slogan</label>
                  <input
                    type="text"
                    name="theme"
                    placeholder="Misal: A Bright New Chapter"
                    value={monthlyFormData.theme}
                    onChange={handleMonthlyInputChange}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase text-[var(--text-secondary)]">Catatan Bulanan (Journal/Note)</label>
                <textarea
                  name="monthlyNote"
                  rows="4"
                  placeholder="Tulis jurnal ringkasan catatan bulanan untuk Intan..."
                  value={monthlyFormData.monthlyNote}
                  onChange={handleMonthlyInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all resize-none text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Activity (Theater, YouTube, Live) */}
          {monthlyFormTab === 'activity' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[var(--border-color)] pb-4">
                {/* YouTube */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">YouTube Highlight</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Judul Video</label>
                    <input
                      type="text"
                      name="youtubeTitle"
                      placeholder="Judul video YouTube..."
                      value={monthlyFormData.youtubeTitle}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Tanggal Upload Video</label>
                    <input
                      type="text"
                      name="youtubeDate"
                      placeholder="Misal: 17 Jan 2026"
                      value={monthlyFormData.youtubeDate}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Live Activity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">Live Activity</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Platform</label>
                    <input
                      type="text"
                      name="livePlatform"
                      placeholder="Misal: IDN Live"
                      value={monthlyFormData.livePlatform}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--text-secondary)]">Total Live (x)</label>
                      <input
                        type="number"
                        name="liveTotal"
                        value={monthlyFormData.liveTotal}
                        onChange={handleMonthlyInputChange}
                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[var(--text-secondary)]">Tanggal (Koma)</label>
                      <input
                        type="text"
                        name="liveDates"
                        placeholder="Misal: 2, 4, 7, 9"
                        value={monthlyFormData.liveDates}
                        onChange={handleMonthlyInputChange}
                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theater Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">Theater Activity</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--text-secondary)]">Total Shows:</label>
                    <input
                      type="number"
                      name="theaterTotal"
                      value={monthlyFormData.theaterTotal}
                      onChange={handleMonthlyInputChange}
                      className="w-16 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTheaterItem}
                      className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" /> Tambah Show
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {monthlyFormData.theaterItems.map((show, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50/50 p-2 border border-[var(--border-color)] rounded-lg">
                      <input
                        type="text"
                        placeholder="Tanggal (misal: 4 Jan)..."
                        value={show.date}
                        onChange={(e) => handleTheaterItemChange(index, 'date', e.target.value)}
                        className="w-1/3 px-2 py-1 bg-white border border-[var(--border-color)] rounded text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Setlist (misal: Aturan Anti Cinta)..."
                        value={show.title}
                        onChange={(e) => handleTheaterItemChange(index, 'title', e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-[var(--border-color)] rounded text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTheaterItem(index)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {monthlyFormData.theaterItems.length === 0 && (
                    <p className="text-center text-xs text-[var(--text-muted)] py-4">Belum ada daftar pertunjukan theater yang dimasukkan.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactions (PM, Video Call, Special Event) */}
          {monthlyFormTab === 'moments' && (
            <div className="space-y-4 animate-fade-in text-left">
              {/* Private Message (PM) */}
              <div className="space-y-3 border-b border-[var(--border-color)] pb-4">
                <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">Private Message Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Bubble Chats</label>
                    <input
                      type="number"
                      name="bubbleChat"
                      value={monthlyFormData.bubbleChat}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Voice Notes</label>
                    <input
                      type="number"
                      name="voiceNote"
                      value={monthlyFormData.voiceNote}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Foto Dibagikan</label>
                    <input
                      type="number"
                      name="photo"
                      value={monthlyFormData.photo}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Video Call & Special Event */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">Video Call</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Nama Event Video Call</label>
                    <input
                      type="text"
                      name="videoCallTitle"
                      placeholder="Misal: Valentine Special Video Call"
                      value={monthlyFormData.videoCallTitle}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Tanggal (Pemisah Koma)</label>
                    <input
                      type="text"
                      name="videoCallDates"
                      placeholder="Misal: 14 Februari, 21 Februari"
                      value={monthlyFormData.videoCallDates}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[var(--color-primary)]">Special Event</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Nama Special Event</label>
                    <input
                      type="text"
                      name="eventTitle"
                      placeholder="Misal: JKT48 Spring Festival"
                      value={monthlyFormData.eventTitle}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[var(--text-secondary)]">Tanggal Event</label>
                    <input
                      type="text"
                      name="eventDate"
                      placeholder="Misal: 25 April 2026"
                      value={monthlyFormData.eventDate}
                      onChange={handleMonthlyInputChange}
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Recap'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= CONFIRM DELETE DIALOG ================= */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Edisi Zine?"
        message="Data edisi zine ini akan dihapus secara permanen beserta semua halamannya. Tindakan ini tidak bisa dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />

      {/* ================= CONFIRM DELETE MONTHLY DIALOG ================= */}
      <ConfirmDialog
        isOpen={confirmDeleteMonthly.isOpen}
        title="Hapus Buku Recap Bulanan?"
        message="Data rekap bulanan ini akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={confirmDeleteMonthlyAction}
        onCancel={() => setConfirmDeleteMonthly({ isOpen: false, id: null })}
      />
    </div>
  );
}

