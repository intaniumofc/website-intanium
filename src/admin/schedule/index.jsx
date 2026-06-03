import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { scheduleService } from '../../features/schedule/scheduleService';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, Calendar, Link as LinkIcon, Search, ExternalLink } from 'lucide-react';

export default function AdminSchedule() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    platform: 'YouTube',
    link: '',
    duration: '2 Jam',
    thumbnail: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await scheduleService.getEvents();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    // Format current local datetime to match datetime-local input YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const defaultDateTime = now.toISOString().slice(0, 16);

    setFormData({
      title: '',
      description: '',
      time: defaultDateTime,
      platform: 'YouTube',
      link: '',
      duration: '2 Jam',
      thumbnail: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    
    // Format timestamp from Supabase into datetime-local format
    let localTime = '';
    if (item.time) {
      const date = new Date(item.time);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      localTime = date.toISOString().slice(0, 16);
    }

    setFormData({
      title: item.title,
      description: item.description || '',
      time: localTime,
      platform: item.platform || 'YouTube',
      link: item.link || '',
      duration: item.duration || '2 Jam',
      thumbnail: item.thumbnail || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jadwal stream ini?')) {
      const res = await scheduleService.deleteEvent(id);
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
    if (!formData.title.trim() || !formData.time) {
      alert('Judul stream dan Waktu harus diisi!');
      return;
    }

    setIsSubmitting(true);
    
    // Convert local datetime to ISO string with timezone
    const isoTime = new Date(formData.time).toISOString();

    const payload = {
      ...formData,
      time: isoTime,
      thumbnail: formData.thumbnail.trim() || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600'
    };

    let result;
    if (modalMode === 'add') {
      result = await scheduleService.createEvent(payload);
    } else {
      result = await scheduleService.updateEvent(editingId, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert('Gagal menyimpan data: ' + result.error);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'All' || item.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">📅 Jadwal Streaming</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Kelola agenda live streaming mingguan Intan, atur platform, waktu, dan link siaran.
          </p>
        </div>
        <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Buat Jadwal Baru
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Cari acara streaming..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>

        {/* Platform selection filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', 'YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitter / X'].map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedPlatform === plat
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-white border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-gray-50'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat kalender jadwal..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Judul Acara / Topik</th>
                  <th className="px-6 py-4">Waktu Streaming</th>
                  <th className="px-6 py-4">Tautan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100'} 
                        alt={item.title} 
                        className="w-16 h-10 object-cover rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)] text-sm">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                          item.platform === 'YouTube' ? 'bg-red-50 text-red-600 border border-red-200' :
                          item.platform === 'IDN Live' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                          'bg-purple-50 text-purple-600 border border-purple-200'
                        }`}>
                          {item.platform}
                        </span>
                        {item.duration && (
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold">🕒 {item.duration}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {new Date(item.time).toLocaleString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.link ? (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
                        >
                          <LinkIcon className="h-3.5 w-3.5" /> Buka Siaran <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">Tidak ada link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(item)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                          title="Ubah Jadwal"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                          title="Hapus Jadwal"
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
                      Belum ada jadwal streaming yang terdaftar.
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
        title={modalMode === 'add' ? 'Buat Jadwal Siaran Baru' : 'Ubah Detail Jadwal Siaran'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Siaran / Topik Game</label>
            <input 
              type="text" 
              name="title"
              placeholder="Misal: Collab Minecraft Server Intanium!"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              required
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Waktu Siaran</label>
              <input 
                type="datetime-local" 
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Estimasi Durasi</label>
              <input 
                type="text" 
                name="duration"
                placeholder="Misal: 2 Jam, 1.5 Jam"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          {/* Platform & Stream Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Platform</label>
              <select 
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              >
                {['YouTube', 'IDN Live', 'Showroom', 'TikTok', 'Twitter / X'].map(plat => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Link Siaran Langsung (URL)</label>
              <input 
                type="text" 
                name="link"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Mini (Thumbnail)</label>
            <input 
              type="text" 
              name="thumbnail"
              placeholder="Masukkan URL banner/thumbnail stream..."
              value={formData.thumbnail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-all"
            />
            <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika ingin menggunakan gambar background streaming default.</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi / Detail Acara</label>
            <textarea 
              name="description"
              rows="3"
              placeholder="Tulis list game, judul setlist lagu, bintang tamu kolaborasi..."
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

