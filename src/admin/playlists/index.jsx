import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import { playlistService } from '../../features/denger-intan/playlistService';
import Loading from '../../components/common/Loading';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Headphones,
  Music,
  Clock,
  ListMusic,
  ExternalLink,
  Upload,
  Loader
} from 'lucide-react';

export default function AdminPlaylists() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPlaylistDelete, setConfirmPlaylistDelete] = useState({ isOpen: false, id: null });
  const [confirmSongDelete, setConfirmSongDelete] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    badgeText: 'Archive Playlist',
    duration: '',
    tracksCount: '',
    spotifyUrl: '',
    spotifyEmbedUrl: '',
    imageUrl: '',
    curatorNote: '',
    description: ''
  });

  const [activeTab, setActiveTab] = useState('playlists');

  // Most Played Songs states
  const [songs, setSongs] = useState([]);
  const [isSongsLoading, setIsSongsLoading] = useState(true);
  const [songsSearchQuery, setSongsSearchQuery] = useState('');
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [songModalMode, setSongModalMode] = useState('add'); // 'add' | 'edit'
  const [editingSongId, setEditingSongId] = useState(null);
  const [isSongSubmitting, setIsSongSubmitting] = useState(false);

  const [songFormData, setSongFormData] = useState({
    title: '',
    artist: '',
    playCount: 'Sering diputar',
    mood: '',
    note: '',
    audioUrl: '',
    coverUrl: ''
  });

  // Upload hook and file states
  const { uploadFile, isUploading: isFileUploading, progress: uploadProgress } = useSupabaseUpload();
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [isAudioConverting, setIsAudioConverting] = useState(false);
  const [isImageConverting, setIsImageConverting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchSongs();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await playlistService.getPlaylists();
    setItems(data);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({
      title: '',
      category: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      badgeText: 'Archive Playlist',
      duration: '2h 00m',
      tracksCount: '30 Tracks',
      spotifyUrl: '',
      spotifyEmbedUrl: '',
      imageUrl: '',
      curatorNote: '',
      description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category || '',
      badgeText: item.badgeText || 'Archive Playlist',
      duration: item.duration || '',
      tracksCount: item.tracksCount || '',
      spotifyUrl: item.spotifyUrl || '',
      spotifyEmbedUrl: item.spotifyEmbedUrl || '',
      imageUrl: item.imageUrl || '',
      curatorNote: item.curatorNote || '',
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmPlaylistDelete({ isOpen: true, id });
  };

  const confirmPlaylistDeleteAction = async () => {
    const id = confirmPlaylistDelete.id;
    setConfirmPlaylistDelete({ isOpen: false, id: null });
    const res = await playlistService.deletePlaylist(id);
    if (res.success) {
      setItems(items.filter(item => item.id !== id));
      notify.success('Playlist dihapus', 'Playlist #DengerINTAN berhasil dihapus.');
    } else {
      notify.error('Gagal menghapus playlist', res.error);
    }
  };

  const fetchSongs = async () => {
    setIsSongsLoading(true);
    const data = await playlistService.getMostPlayedSongs();
    setSongs(data);
    setIsSongsLoading(false);
  };

  const handleOpenAddSongModal = () => {
    setSongModalMode('add');
    setEditingSongId(null);
    setSongFormData({
      title: '',
      artist: '',
      playCount: 'Sering diputar',
      mood: '',
      note: '',
      audioUrl: '',
      coverUrl: ''
    });
    setSelectedAudioFile(null);
    setSelectedCoverFile(null);
    setIsSongModalOpen(true);
  };

  const handleOpenEditSongModal = (song) => {
    setSongModalMode('edit');
    setEditingSongId(song.id);
    setSongFormData({
      title: song.title,
      artist: song.artist,
      playCount: song.playCount || 'Sering diputar',
      mood: song.mood || '',
      note: song.note || '',
      audioUrl: song.audioUrl || '',
      coverUrl: song.coverUrl || ''
    });
    setSelectedAudioFile(null);
    setSelectedCoverFile(null);
    setIsSongModalOpen(true);
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      notify.warning('Berkas tidak valid', 'Hanya diperbolehkan mengunggah berkas audio MP3.');
      return;
    }
    setSelectedAudioFile(file);
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.warning('Berkas tidak valid', 'Hanya diperbolehkan mengunggah berkas gambar.');
      return;
    }
    setSelectedCoverFile(file);
  };

  const handleSongInputChange = (e) => {
    const { name, value } = e.target;
    setSongFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    if (!songFormData.title.trim() || !songFormData.artist.trim() || !songFormData.note.trim()) {
      notify.warning('Data lagu belum lengkap', 'Judul, artis, dan catatan kurator harus diisi.');
      return;
    }

    if (!selectedAudioFile && !songFormData.audioUrl.trim()) {
      notify.warning('File audio belum ditentukan', 'Pilih berkas audio untuk diunggah atau masukkan URL direct MP3.');
      return;
    }

    setIsSongSubmitting(true);
    let finalAudioUrl = songFormData.audioUrl.trim();
    let finalCoverUrl = songFormData.coverUrl.trim();

    try {
      // 1. Upload Cover Image (will convert to WebP inside useSupabaseUpload hook)
      if (selectedCoverFile) {
        setIsImageConverting(true);
        finalCoverUrl = await uploadFile(selectedCoverFile, 'assets', 'covers');
        setIsImageConverting(false);
      }

      // 2. Upload Audio File (will convert/compress to 96kbps mono MP3 inside useSupabaseUpload hook)
      if (selectedAudioFile) {
        setIsAudioConverting(true);
        finalAudioUrl = await uploadFile(selectedAudioFile, 'assets', 'songs');
        setIsAudioConverting(false);
      }

      const payload = {
        ...songFormData,
        audioUrl: finalAudioUrl,
        coverUrl: finalCoverUrl
      };

      let result;
      if (songModalMode === 'add') {
        result = await playlistService.createMostPlayedSong(payload);
      } else {
        result = await playlistService.updateMostPlayedSong(editingSongId, payload);
      }

      if (result.success) {
        setIsSongModalOpen(false);
        fetchSongs();
        notify.success(
          songModalMode === 'add' ? 'Lagu ditambahkan' : 'Lagu diperbarui',
          'Perubahan most played song berhasil disimpan.'
        );
      } else {
        notify.error('Gagal menyimpan lagu', result.error);
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyimpan lagu', err.message || 'Terjadi kesalahan saat mengunggah berkas.');
    } finally {
      setIsSongSubmitting(false);
      setIsAudioConverting(false);
      setIsImageConverting(false);
    }
  };

  const handleSongDelete = (id) => {
    setConfirmSongDelete({ isOpen: true, id });
  };

  const confirmSongDeleteAction = async () => {
    const id = confirmSongDelete.id;
    setConfirmSongDelete({ isOpen: false, id: null });
    const res = await playlistService.deleteMostPlayedSong(id);
    if (res.success) {
      setSongs(songs.filter(song => song.id !== id));
      notify.success('Lagu dihapus', 'Lagu berhasil dihapus dari most played songs.');
    } else {
      notify.error('Gagal menghapus lagu', res.error);
    }
  };

  const extractSpotifyPlaylistId = (url) => {
    if (!url) return '';
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-fill embed URL and generate ID if spotifyUrl is pasted/typed
    if (name === 'spotifyUrl') {
      const playlistId = extractSpotifyPlaylistId(value);
      if (playlistId) {
        setFormData(prev => ({
          ...prev,
          spotifyUrl: value,
          spotifyEmbedUrl: `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.spotifyUrl.trim()) {
      notify.warning('Data playlist belum lengkap', 'Judul dan tautan Spotify harus diisi.');
      return;
    }

    const playlistId = extractSpotifyPlaylistId(formData.spotifyUrl);
    if (!playlistId) {
      notify.warning('Tautan Spotify tidak valid', 'Format tautan harus menyertakan /playlist/{id}.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      id: modalMode === 'add' ? playlistId : editingId,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
      spotifyEmbedUrl: formData.spotifyEmbedUrl.trim() || `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`
    };

    let result;
    if (modalMode === 'add') {
      result = await playlistService.createPlaylist(payload);
    } else {
      result = await playlistService.updatePlaylist(editingId, payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      fetchData();
      notify.success(
        modalMode === 'add' ? 'Playlist ditambahkan' : 'Playlist diperbarui',
        'Perubahan playlist berhasil disimpan.'
      );
    } else {
      notify.error('Gagal menyimpan playlist', result.error);
    }
  };

  // Filter items based on search and badge
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.curatorNote && item.curatorNote.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBadge = selectedBadge === 'All' || item.badgeText === selectedBadge;
    return matchesSearch && matchesBadge;
  });

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(songsSearchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(songsSearchQuery.toLowerCase()) ||
      (song.note && song.note.toLowerCase().includes(songsSearchQuery.toLowerCase())) ||
      (song.mood && song.mood.toLowerCase().includes(songsSearchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Headphones className="h-6 w-6 text-[var(--color-primary)]" />
            <span>{activeTab === 'playlists' ? 'Kelola Playlist #DengerINTAN' : 'Kelola Most Played Songs'}</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {activeTab === 'playlists'
              ? 'Tambah, sunting, atau hapus rekomendasi playlist musik bulanan yang dikurasi oleh Intan.'
              : 'Tambah, sunting, atau hapus daftar lagu terpopuler yang paling sering dinyanyikan/diputar oleh Intan.'}
          </p>
        </div>
        {activeTab === 'playlists' ? (
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4" /> Tambah Playlist Baru
          </Button>
        ) : (
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer" onClick={handleOpenAddSongModal}>
            <Plus className="h-4 w-4" /> Tambah Lagu Baru
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 cursor-pointer ${
            activeTab === 'playlists'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Kelola Playlist #DengerINTAN
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 cursor-pointer ${
            activeTab === 'songs'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Kelola Most Played Songs
        </button>
      </div>

      {activeTab === 'playlists' ? (
        <>
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input autoComplete="off" /* autocomplete="off" */ name="searchQuery" type="text" placeholder="Cari playlist…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
            </div>

            {/* Badge Filter */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Ongoing Playlist', 'Archive Playlist'].map((badge) => (
                <button
                  key={badge}
                  onClick={() => setSelectedBadge(badge)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${selectedBadge === badge
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'bg-white border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-gray-50'
                    }`}
                >
                  {badge === 'All' ? 'Semua Tipe' : badge}
                </button>
              ))}
            </div>
          </div>

          {/* Main Table Card */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
            {isLoading ? (
              <div className="p-12"><Loading message="Memuat playlist…" /></div>
            ) : (
              <div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                    <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                      <tr>
                        <th className="px-6 py-4">Info Playlist</th>
                        <th className="px-6 py-4">Bulan / Kategori</th>
                        <th className="px-6 py-4">Status / Badge</th>
                        <th className="px-6 py-4">Meta Data</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl ? (
                                <img width={40} height={40} alt="Playlist Cover" src={item.imageUrl} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-slate-100 flex-shrink-0" />
                              ) : (
                                <span className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 shadow-inner">
                                  <Music className="h-5 w-5" />
                                </span>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[var(--text-primary)] text-sm max-w-[200px] lg:max-w-xs truncate">{item.title}</span>
                                {item.curatorNote && (
                                  <span className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-xs">{item.curatorNote}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${item.badgeText === 'Ongoing Playlist'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                              {item.badgeText || 'Archive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            <div className="flex flex-col gap-1 text-[var(--text-muted)]">
                              <span className="flex items-center gap-1"><Music className="h-3.5 w-3.5" /> {item.tracksCount || '0 Tracks'}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.duration || '0m'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={item.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-lg transition-colors"
                                title="Buka di Spotify"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors"
                                title="Ubah Playlist"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                                title="Hapus Playlist"
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
                            Belum ada playlist yang sesuai dengan pencarian Anda.
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
                        {item.imageUrl ? (
                          <img width={40} height={40} alt="Playlist Cover" src={item.imageUrl} className="w-10 h-10 object-cover rounded-lg shadow-sm border border-slate-100 shrink-0" />
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-inner">
                            <Music className="h-5 w-5" />
                          </span>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-[var(--text-primary)] text-sm line-clamp-2 break-words">{item.title}</span>
                          <div className="flex items-center flex-wrap gap-1 mt-0.5">
                            <span className="text-xs font-semibold text-[var(--color-primary)]">{item.category}</span>
                            <span className="text-[10px] text-gray-400">•</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${item.badgeText === 'Ongoing Playlist' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                              {item.badgeText || 'Archive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.curatorNote && (
                        <div className="text-xs text-[var(--text-muted)] italic line-clamp-2 break-words min-w-0 border-l-2 border-slate-200 pl-2">
                          "{item.curatorNote}"
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex gap-3 text-[10px] text-[var(--text-muted)] font-semibold">
                          <span className="flex items-center gap-1"><Music className="h-3 w-3" /> {item.tracksCount || '0'} Tracks</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration || '0m'}</span>
                        </div>
                        <a
                          href={item.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-green-600"
                        >
                          Spotify <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-1">
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
                      Belum ada playlist yang sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          {/* Filters & Search for Songs */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input autoComplete="off" /* autocomplete="off" */ name="songsSearchQuery" type="text" placeholder="Cari lagu…" value={songsSearchQuery} onChange={(e) => setSongsSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]" />
            </div>
          </div>

          {/* Songs Table Card */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
            {isSongsLoading ? (
              <div className="p-12"><Loading message="Memuat daftar lagu…" /></div>
            ) : (
              <div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                    <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                      <tr>
                        <th className="px-6 py-4">Judul Lagu / Artis</th>
                        <th className="px-6 py-4">Mood</th>
                        <th className="px-6 py-4">Catatan Kurator</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {filteredSongs.map(song => (
                        <tr key={song.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 shadow-inner">
                                <Music className="h-5 w-5" />
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[var(--text-primary)] text-sm max-w-[200px] lg:max-w-xs truncate">{song.title}</span>
                                <span className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{song.artist}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
                            {song.mood || '-'}
                          </td>
                          <td className="px-6 py-4 text-xs max-w-xs line-clamp-2 break-words italic">
                            "{song.note}"
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditSongModal(song)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors"
                                title="Ubah Lagu"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleSongDelete(song.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                                title="Hapus Lagu"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSongs.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                            Belum ada lagu terpopuler yang sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
                  {filteredSongs.map(song => (
                    <div key={song.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex gap-3 items-start min-w-0">
                        <span className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-inner">
                          <Music className="h-5 w-5" />
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-[var(--text-primary)] text-sm line-clamp-2 break-words">{song.title}</span>
                          <div className="flex items-center flex-wrap gap-1 mt-0.5">
                            <span className="text-xs text-[var(--text-muted)]">{song.artist}</span>
                            {song.mood && (
                              <>
                                <span className="text-[10px] text-gray-400">•</span>
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-50 text-purple-700">{song.mood}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {song.note && (
                        <div className="text-xs text-[var(--text-muted)] italic line-clamp-3 break-words min-w-0 border-l-2 border-slate-200 pl-2">
                          "{song.note}"
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)] mt-1">
                        <button 
                          onClick={() => handleOpenEditSongModal(song)} 
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5"
                        >
                          <Edit className="h-3.5 w-3.5" /> Ubah
                        </button>
                        <button 
                          onClick={() => handleSongDelete(song.id)} 
                          className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredSongs.length === 0 && (
                    <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Belum ada lagu terpopuler yang sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </>
      )}


      {/* ================= ADD/EDIT FORM MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Tambah Playlist Denger Intan Baru' : 'Ubah Detail Playlist'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Playlist</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="title" placeholder="Masukkan judul playlist bulanan…" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            </div>

            {/* Category / Month */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Kategori (Bulan & Tahun)</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="category" placeholder="Contoh: Juni 2026" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status / Badge */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tipe / Status Badge</label>
              <select
                name="badgeText"
                value={formData.badgeText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--color-primary)] transition-colors"
              >
                <option value="Ongoing Playlist">Ongoing Playlist</option>
                <option value="Archive Playlist">Archive Playlist</option>
              </select>
            </div>

            {/* Tracks Count */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Jumlah Track Lagu</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="tracksCount" placeholder="Contoh: 30 Tracks" value={formData.tracksCount} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" />
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Durasi Total</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="duration" placeholder="Contoh: 2h 15m" value={formData.duration} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" />
            </div>
          </div>

          {/* Spotify URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Tautan Spotify (Spotify URL)</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="spotifyUrl" placeholder="Masukkan link share playlist Spotify…" value={formData.spotifyUrl} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            <p className="text-[10px] text-[var(--text-muted)]">
              Paste link Spotify. Contoh: <code>https://open.spotify.com/playlist/2aMGqrDZrqERqgMPIQe0ui</code>
            </p>
          </div>

          {/* Spotify Embed URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Spotify Embed URL</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="spotifyEmbedUrl" placeholder="URL embed Spotify (terisi otomatis dari link Spotify)…" value={formData.spotifyEmbedUrl} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors text-xs text-[var(--text-muted)] bg-slate-50" readOnly />
          </div>

          {/* Cover Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Sampul (Cover Image)</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="imageUrl" placeholder="Masukkan link gambar sampul…" value={formData.imageUrl} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" />
            <p className="text-[10px] text-[var(--text-muted)]">Kosongkan untuk menggunakan gambar default.</p>
          </div>

          {/* Curator Note */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Pesan Kurator (Curator Note)</label>
            <textarea name="curatorNote" rows="2" placeholder="Tulis pesan sapaan dari Intan untuk pendengar playlist ini…" value={formData.curatorNote} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors resize-none" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Deskripsi Playlist</label>
            <textarea name="description" rows="2" placeholder="Deskripsi singkat playlist…" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors resize-none" />
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
              {isSubmitting ? 'Menyimpan…' : 'Simpan Playlist'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= ADD/EDIT SONG FORM MODAL ================= */}
      <Modal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        title={songModalMode === 'add' ? 'Tambah Most Played Song Baru' : 'Ubah Detail Lagu'}
        size="lg"
      >
        <form onSubmit={handleSongSubmit} className="space-y-4 text-sm text-[var(--text-primary)]">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Judul Lagu</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="title" placeholder="Masukkan judul lagu…" value={songFormData.title} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            </div>

            {/* Artist */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Nama Artis / Band</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="artist" placeholder="Masukkan nama penyanyi/band…" value={songFormData.artist} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Mood */}
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Mood / Genre Vibes</label>
            <input autoComplete="off" /* autocomplete="off" */ type="text" name="mood" placeholder="Contoh: Chill / Calm, Nostalgic, Hype / Energetic" value={songFormData.mood} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio File Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Unggah Berkas Audio (MP3)</label>
              <div className="relative border-2 border-dashed border-[var(--border-color)] rounded-2xl p-4 bg-[var(--bg-primary)] hover:border-[var(--color-primary)] transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
                <input name="file_input" type="file" accept="audio/mp3,audio/*" onChange={handleAudioFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting} />
                <Upload className="h-6 w-6 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-1" />
                <span className="font-extrabold text-xs text-[var(--text-secondary)]">
                  {selectedAudioFile ? selectedAudioFile.name : 'Pilih Berkas MP3'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] mt-0.5">
                  Otomatis dikompresi menjadi ukuran optimal
                </span>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Unggah Gambar Sampul</label>
              <div className="relative border-2 border-dashed border-[var(--border-color)] rounded-2xl p-4 bg-[var(--bg-primary)] hover:border-[var(--color-primary)] transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
                <input name="file_input" type="file" accept="image/*" onChange={handleCoverFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting} />
                <Upload className="h-6 w-6 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-1" />
                <span className="font-extrabold text-xs text-[var(--text-secondary)]">
                  {selectedCoverFile ? selectedCoverFile.name : 'Pilih Berkas Gambar'}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] mt-0.5">
                  Otomatis dikonversi ke format WebP (.webp)
                </span>
              </div>
            </div>
          </div>

          {/* Progress / Status Indicators for Song Uploads */}
          {(isAudioConverting || isImageConverting || isFileUploading) && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Loader className="h-4 w-4 animate-spin text-blue-600" />
                <span>
                  {isAudioConverting
                    ? 'Mengodekan & mengompres berkas audio (LameJS)…'
                    : isImageConverting
                    ? 'Mengonversi gambar sampul ke WebP…'
                    : `Mengunggah berkas ke Supabase Storage (${uploadProgress}%)...`}
                </span>
              </div>
              {isFileUploading && (
                <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-[width] duration-300" style={{ width: `${uploadProgress}%` }} />
                 </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio URL (Fallback / Manual) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL File Audio (Direct MP3 URL - Alternatif)</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="audioUrl" placeholder="Masukkan link direct file audio (.mp3)…" value={songFormData.audioUrl} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors text-xs text-[var(--text-muted)] bg-slate-50" disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting} />
              <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika mengunggah file MP3 di atas.</p>
            </div>

            {/* Cover Image URL (Fallback / Manual) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">URL Gambar Sampul (Cover Image URL - Alternatif)</label>
              <input autoComplete="off" /* autocomplete="off" */ type="text" name="coverUrl" placeholder="Masukkan link gambar cover…" value={songFormData.coverUrl} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors text-xs text-[var(--text-muted)] bg-slate-50" disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting} />
              <p className="text-[10px] text-[var(--text-muted)]">Kosongkan jika mengunggah gambar sampul di atas.</p>
            </div>
          </div>

          {/* Curator Note / Catatan */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase tracking-wider text-[var(--text-secondary)]">Catatan Kurator / Alasan Intan Menyukai Lagu Ini</label>
            <textarea name="note" rows="3" placeholder="Tulis alasan atau cerita mengapa lagu ini sering diputar…" value={songFormData.note} onChange={handleSongInputChange} className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[var(--color-primary)] transition-colors resize-none" required />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-color)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSongModalOpen(false)}
              disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting}
              className="cursor-pointer"
            >
              {isSongSubmitting || isFileUploading || isAudioConverting || isImageConverting ? 'Memproses…' : 'Simpan Lagu'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* ================= CONFIRM DELETE DIALOGS ================= */}
      <ConfirmDialog
        isOpen={confirmPlaylistDelete.isOpen}
        title="Hapus Playlist?"
        message="Playlist #DengerINTAN ini akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={confirmPlaylistDeleteAction}
        onCancel={() => setConfirmPlaylistDelete({ isOpen: false, id: null })}
      />
      <ConfirmDialog
        isOpen={confirmSongDelete.isOpen}
        title="Hapus Lagu?"
        message="Lagu ini akan dihapus dari daftar most played songs. Tindakan ini tidak bisa dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={confirmSongDeleteAction}
        onCancel={() => setConfirmSongDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
