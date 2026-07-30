'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { recapService } from '../../../services/public/recapService';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { Plus, Edit, Trash2, Calendar, Search, PlusCircle, Trash, BookOpen } from 'lucide-react';

export default function AdminRecaps() {
  const notify = useAdminToast();

  const [monthlyItems, setMonthlyItems] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    fetchMonthlyData();
  }, []);

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

  const filteredMonthlyItems = monthlyItems.filter(item => 
    item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Buku Recap Bulanan
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Kelola isi buku recap bulanan (Jadwal panggung, YouTube, stats bubble chat, dll) secara dinamis.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddMonthlyModal}>
          <Plus className="h-4 w-4" /> Tambah Buku Recap
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full sm:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            name="monthlySearch"
            autoComplete="off"
            placeholder="Cari tema atau bulan…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs"
          />
        </div>
      </div>

      {/* Monthly Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isMonthlyLoading ? (
          <div className="p-12"><Loading message="Memuat buku rekap…" /></div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                  {filteredMonthlyItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--text-primary)]">
                        {item.month} {item.year}
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-[var(--text-primary)] max-w-[200px] lg:max-w-sm truncate">
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
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Buku Recap"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMonthly(item.id)} 
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Buku Recap"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMonthlyItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                        Belum ada data rekap bulanan yang tersimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {filteredMonthlyItems.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--text-primary)] text-sm">
                        {item.month} {item.year}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2 break-words min-w-0">
                        {item.theme}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => handleOpenEditMonthlyModal(item)} 
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100"
                        title="Ubah Buku Recap"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMonthly(item.id)} 
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-100"
                        title="Hapus Buku Recap"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Theater</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{item.left_page?.theater?.total || 0} <span className="text-[10px] font-normal text-gray-500">Show</span></span>
                    </div>
                    <div className="flex flex-col text-center border-x border-gray-200">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Live</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{item.left_page?.live?.total || 0}x</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Chat</span>
                      <span className="text-xs font-bold text-[var(--color-primary)]">{item.right_page?.privateMessage?.bubbleChat || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMonthlyItems.length === 0 && (
                <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                  Belum ada data rekap bulanan yang tersimpan.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ================= MONTHLY RECAP FORM MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Buat Buku Recap Bulanan Baru' : 'Ubah Detail Buku Recap Bulanan'}
        size="lg"
      >
        <form onSubmit={handleSubmitMonthly} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Sub Tab inside Modal */}
          <div className="flex gap-2 border-b border-[var(--border-color)] pb-2 mb-2">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${monthlyFormTab === 'info' ? 'bg-[var(--color-pink-tint-8)] text-[var(--color-pink)]' : 'text-[var(--text-secondary)] hover:bg-gray-100'}`}
              onClick={() => setMonthlyFormTab('info')}
            >
              1. Info Dasar
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${monthlyFormTab === 'activity' ? 'bg-[var(--color-pink-tint-8)] text-[var(--color-pink)]' : 'text-[var(--text-secondary)] hover:bg-gray-100'}`}
              onClick={() => setMonthlyFormTab('activity')}
            >
              2. Aktivitas (Halaman Kiri)
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${monthlyFormTab === 'moments' ? 'bg-[var(--color-pink-tint-8)] text-[var(--color-pink)]' : 'text-[var(--text-secondary)] hover:bg-gray-100'}`}
              onClick={() => setMonthlyFormTab('moments')}
            >
              3. Momen & Stats (Halaman Kanan)
            </button>
          </div>

          {/* TAB 1: INFO DASAR */}
          {monthlyFormTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Bulan</label>
                  <select name="month" value={monthlyFormData.month} onChange={handleMonthlyInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]/15">
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tahun</label>
                  <input type="number" name="year" value={monthlyFormData.year} onChange={handleMonthlyInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]/15" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tema Utama Bulan Ini</label>
                <input type="text" name="theme" placeholder="Misal: Ramadhan, New Journey, Senshuuraku…" value={monthlyFormData.theme} onChange={handleMonthlyInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]/15" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Catatan / Jurnal Bulanan (Monthly Note)</label>
                <textarea name="monthlyNote" rows="4" placeholder="Pesan atau tulisan jurnal bulanan untuk halaman kanan..." value={monthlyFormData.monthlyNote} onChange={handleMonthlyInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pink)]/15 resize-none" />
              </div>
            </div>
          )}

          {/* TAB 2: AKTIVITAS (HALAMAN KIRI) */}
          {monthlyFormTab === 'activity' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Theater Section */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-[var(--text-primary)]">01. Theater Activity</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold">Total Show:</span>
                    <input type="number" name="theaterTotal" value={monthlyFormData.theaterTotal} onChange={handleMonthlyInputChange} className="w-16 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  {monthlyFormData.theaterItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="text" placeholder="Tgl (ex: 03 MEI)" value={item.date} onChange={(e) => handleTheaterItemChange(idx, 'date', e.target.value)} className="w-28 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                      <input type="text" placeholder="Judul Setlist (ex: Cara Meminum Ramune)" value={item.title} onChange={(e) => handleTheaterItemChange(idx, 'title', e.target.value)} className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                      <button type="button" onClick={() => handleRemoveTheaterItem(idx)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddTheaterItem} className="text-xs text-[var(--color-primary)] font-bold flex items-center gap-1 mt-1">
                    <PlusCircle className="h-3.5 w-3.5" /> Tambah Show Theater
                  </button>
                </div>
              </div>

              {/* YouTube Section */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">02. YouTube Highlight</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" name="youtubeDate" placeholder="Tgl (ex: 15 MEI)" value={monthlyFormData.youtubeDate} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                  <input type="text" name="youtubeTitle" placeholder="Judul Video YouTube" value={monthlyFormData.youtubeTitle} onChange={handleMonthlyInputChange} className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                </div>
              </div>

              {/* Live Activity Section */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">03. Live Stream Activity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" name="livePlatform" placeholder="Platform (ex: IDN Live)" value={monthlyFormData.livePlatform} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                  <input type="number" name="liveTotal" placeholder="Total Live" value={monthlyFormData.liveTotal} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                  <input type="text" name="liveDates" placeholder="Tgl pisah koma (ex: 2, 8, 14, 20)" value={monthlyFormData.liveDates} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOMENS & STATS (HALAMAN KANAN) */}
          {monthlyFormTab === 'moments' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Private Message Stats */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Private Message Stats (Bubble / Chat)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Bubble Chat</label>
                    <input type="number" name="bubbleChat" value={monthlyFormData.bubbleChat} onChange={handleMonthlyInputChange} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Voice Note</label>
                    <input type="number" name="voiceNote" value={monthlyFormData.voiceNote} onChange={handleMonthlyInputChange} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Foto / Media</label>
                    <input type="number" name="photo" value={monthlyFormData.photo} onChange={handleMonthlyInputChange} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" />
                  </div>
                </div>
              </div>

              {/* Video Call Section */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Video Call / Meet & Greet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" name="videoCallTitle" placeholder="Judul VC / MnG" value={monthlyFormData.videoCallTitle} onChange={handleMonthlyInputChange} className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                  <input type="text" name="videoCallDates" placeholder="Tgl pisah koma" value={monthlyFormData.videoCallDates} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                </div>
              </div>

              {/* Special Event Section */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Special Event / Milestone</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input type="text" name="eventTitle" placeholder="Judul Event (ex: Concert / Birthday)" value={monthlyFormData.eventTitle} onChange={handleMonthlyInputChange} className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                  <input type="text" name="eventDate" placeholder="Tgl (ex: 28 MEI)" value={monthlyFormData.eventDate} onChange={handleMonthlyInputChange} className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan…' : modalMode === 'add' ? 'Buat Buku Recap' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete Monthly */}
      <ConfirmDialog
        isOpen={confirmDeleteMonthly.isOpen}
        onClose={() => setConfirmDeleteMonthly({ isOpen: false, id: null })}
        onConfirm={confirmDeleteMonthlyAction}
        title="Hapus Buku Recap Bulanan?"
        message="Apakah Anda yakin ingin menghapus data buku recap bulanan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Recap"
      />
    </div>
  );
}
