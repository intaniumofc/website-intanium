'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import {
  Gamepad2,
  Search,
  Trash2,
  Trophy,
  Calendar,
  RefreshCw,
  Sparkles,
  Bug,
  Trash,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Save,
  CheckCircle,
  Eye,
  Lock,
  Plus,
  ChevronDown,
  HelpCircle,
  Zap,
  Star,
  Gamepad,
  Flame,
  Heart,
  Music,
  Info
} from 'lucide-react';
import {
  getAdminGameScores,
  adminDeleteGameScore,
  adminResetLeaderboard,
  adminPruneGameScores,
  getStartOfWeekUTC,
  getGameSettings,
  updateGameSettings
} from '../../features/games/menangkap-kecoa/gameService';

export default function AdminGames() {
  const notify = useAdminToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'settings'

  // Scores Data State
  const [scores, setScores] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState('all-time'); // 'weekly' | 'all-time'
  const [sortBy, setSortBy] = useState('score_desc'); // 'score_desc' | 'score_asc' | 'newest' | 'oldest'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  // Dialog Confirm State
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, username: '' });
  const [confirmBulk, setConfirmBulk] = useState({ isOpen: false, type: '', title: '', message: '' });

  // Game Settings State
  const [gameSettings, setGameSettings] = useState({
    featuredGameId: 'menangkap-kecoa',
    challengeCount: 100,
    challengeReward: 'Hall of Fame',
    challengeActive: true,
    games: {
      'menangkap-kecoa': {
        active: true,
        title: 'Menangkap Kecoa',
        description: 'Uji kecepatan tanganmu menangkap kecoa-kecoa terbang sebelum mereka lolos dan raih skor tertinggi!',
        badge: 'Populer',
        difficulty: 'Mudah',
        playTime: '60 Detik',
        theme: 'amber',
        emoji: '🐜',
        icon: 'Bug',
        link: '/games/menangkap-kecoa',
        bgImage: 'cockroachBg',
        layoutSpan: 2
      },
      'gosok-intan': {
        active: true,
        title: 'Gosok Intan',
        description: 'Gosok dan Temukan foto Intan sebanyak-banyaknya di balik titik hitam. Hindari bom peledak!',
        badge: 'Baru',
        difficulty: 'Sedang',
        theme: 'cyan',
        emoji: '💎',
        icon: 'Sparkles',
        link: '/games/gosok-intan',
        bgImage: 'tebakKataBg',
      }
    },
    stats: {
      totalPlayers: 1254,
      totalGamesPlayed: 8420,
      avgScore: 582
    }
  });
  const [expandedGameId, setExpandedGameId] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Handlers for dynamic game items
  const handleAddNewGame = () => {
    const newGameId = `game-${Date.now()}`;
    setGameSettings(prev => ({
      ...prev,
      games: {
        ...prev.games,
        [newGameId]: {
          active: false,
          title: 'Game Baru',
          description: 'Deskripsi singkat mengenai game baru ini.',
          badge: 'Baru',
          difficulty: 'Mudah',
          playTime: '5 Menit',
          theme: 'emerald',
          emoji: '🎮',
          icon: 'Gamepad',
          link: '#',
          bgImage: '',
          layoutSpan: 1
        }
      }
    }));
    setExpandedGameId(newGameId);
    notify.info('Game Baru Dibuat', 'Lengkapi konfigurasi game baru Anda.');
  };

  const handleDeleteGame = (gameId) => {
    if (gameId === 'menangkap-kecoa') {
      notify.error('Tidak Bisa Dihapus', 'Game Menangkap Kecoa adalah game utama sistem.');
      return;
    }
    setGameSettings(prev => {
      const updated = { ...prev.games };
      delete updated[gameId];
      return {
        ...prev,
        games: updated
      };
    });
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
    }
    notify.success('Game Terhapus', 'Game berhasil dihapus dari daftar lokal. Ingat untuk menyimpan perubahan.');
  };

  // Fetch all scores
  const fetchScores = async () => {
    setIsLoadingScores(true);
    try {
      const data = await getAdminGameScores({ search: searchQuery, period, sortBy });
      setScores(data);
      setCurrentPage(0);
    } catch (err) {
      console.error('Gagal mengambil data skor game:', err);
      notify.error('Gagal Memuat', err.message || 'Terjadi kesalahan saat memuat skor.');
    } finally {
      setIsLoadingScores(false);
    }
  };

  // Fetch settings configuration
  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const data = await getGameSettings();
      setGameSettings(data);
    } catch (err) {
      console.error('Gagal mengambil pengaturan game:', err);
      notify.error('Gagal Memuat Pengaturan', err.message || 'Terjadi kesalahan saat memuat konfigurasi.');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [searchQuery, period, sortBy]);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Calculations for stats card
  const stats = useMemo(() => {
    if (scores.length === 0) {
      return { totalCount: 0, highestScore: 0, avgScore: 0, weeklyCount: 0 };
    }

    const startOfWeek = new Date(getStartOfWeekUTC());
    let highest = 0;
    let sum = 0;
    let wCount = 0;

    scores.forEach(item => {
      if (item.score > highest) highest = item.score;
      sum += item.score;

      const createdAt = new Date(item.created_at);
      if (createdAt >= startOfWeek) {
        wCount++;
      }
    });

    return {
      totalCount: scores.length,
      highestScore: highest,
      avgScore: Math.round(sum / scores.length),
      weeklyCount: wCount
    };
  }, [scores]);

  // Paginated data
  const paginatedScores = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return scores.slice(startIndex, startIndex + pageSize);
  }, [scores, currentPage]);

  const pageCount = Math.max(1, Math.ceil(scores.length / pageSize));

  // Single Delete handlers
  const handleOpenDelete = (item) => {
    setConfirmDelete({ isOpen: true, id: item.id, username: item.username });
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await adminDeleteGameScore(confirmDelete.id);
      setScores(prev => prev.filter(item => item.id !== confirmDelete.id));
      notify.success('Skor Dihapus', `Skor milik ${confirmDelete.username} berhasil dihapus.`);
    } catch (err) {
      notify.error('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus skor.');
    } finally {
      setActionLoading(false);
      setConfirmDelete({ isOpen: false, id: null, username: '' });
    }
  };

  // Bulk operation handlers
  const handleOpenBulkAction = (type) => {
    let title = '';
    let message = '';

    if (type === 'reset-weekly') {
      title = 'Reset Leaderboard Mingguan';
      message = 'Apakah Anda yakin ingin menghapus semua data skor pada minggu berjalan ini? Langkah ini tidak dapat dibatalkan.';
    } else if (type === 'prune') {
      title = 'Bersihkan Skor Lama (>30 hari)';
      message = 'Apakah Anda yakin ingin memangkas dan menghapus data skor yang usang (lebih dari 30 hari yang lalu)?';
    } else if (type === 'reset-all') {
      title = 'Reset Semua Skor (All-Time)';
      message = 'PERINGATAN: Tindakan ini akan menghapus SELURUH data skor dari database secara permanen. Apakah Anda yakin?';
    }

    setConfirmBulk({ isOpen: true, type, title, message });
  };

  const handleConfirmBulk = async () => {
    setActionLoading(true);
    try {
      if (confirmBulk.type === 'reset-weekly') {
        await adminResetLeaderboard('weekly');
        notify.success('Leaderboard Mingguan Direset', 'Skor minggu berjalan berhasil dihapus.');
      } else if (confirmBulk.type === 'prune') {
        await adminPruneGameScores();
        notify.success('Pembersihan Berhasil', 'Skor lama yang lebih dari 30 hari telah dipangkas.');
      } else if (confirmBulk.type === 'reset-all') {
        await adminResetLeaderboard('all-time');
        notify.success('Database Direset', 'Semua riwayat skor game berhasil dihapus total.');
      }
      fetchScores();
    } catch (err) {
      notify.error('Tindakan Gagal', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setActionLoading(false);
      setConfirmBulk({ isOpen: false, type: '', title: '', message: '' });
    }
  };

  // Save Settings handlers
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await updateGameSettings(gameSettings);
      if (res.success) {
        notify.success('Pengaturan Disimpan', 'Konfigurasi portal game berhasil diperbarui di server.');
      } else {
        notify.error('Gagal Menyimpan', res.error || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (err) {
      notify.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateGameField = (gameId, field, value) => {
    setGameSettings(prev => ({
      ...prev,
      games: {
        ...prev.games,
        [gameId]: {
          ...prev.games[gameId],
          [field]: value
        }
      }
    }));
  };

  const updateStatsField = (field, value) => {
    const intVal = parseInt(value);
    setGameSettings(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: isNaN(intVal) ? 0 : intVal
      }
    }));
  };

  return (
    <div className="space-y-6 text-sm text-[var(--text-primary)]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Gamepad2 className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Kelola Game & Portal Arena
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Konfigurasi game, spanduk kuis, rekor leaderboard, dan pemantauan skor pemain.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('scores')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'scores'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]/30'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
        >
          <Trophy className="h-4 w-4" />
          Riwayat Skor & Klasemen
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'settings'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]/30'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
        >
          <Settings className="h-4 w-4" />
          Pengaturan Portal Game
        </button>
      </div>

      {activeTab === 'scores' ? (
        // ================= SCORE & LEADERBOARD MANAGEMENT TAB =================
        <div className="space-y-6 animate-fade-in">
          {/* Quick Actions Row */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              onClick={() => handleOpenBulkAction('prune')}
            >
              <Trash className="h-3.5 w-3.5 text-amber-500" />
              <span>Pangkas Skor &gt;30 Hari</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              onClick={() => handleOpenBulkAction('reset-weekly')}
            >
              <RefreshCw className="h-3.5 w-3.5 text-orange-500" />
              <span>Reset Mingguan</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              onClick={() => handleOpenBulkAction('reset-all')}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-white" />
              <span>Reset Semua Skor</span>
            </Button>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md" className="border border-[var(--border-color)] bg-white flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Total Skor</p>
                <p className="text-xl font-extrabold mt-0.5">{stats.totalCount}</p>
              </div>
            </Card>

            <Card padding="md" className="border border-[var(--border-color)] bg-white flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Skor Tertinggi</p>
                <p className="text-xl font-extrabold mt-0.5">{stats.highestScore.toLocaleString('id-ID')}</p>
              </div>
            </Card>

            <Card padding="md" className="border border-[var(--border-color)] bg-white flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Rata-rata Skor</p>
                <p className="text-xl font-extrabold mt-0.5">{stats.avgScore.toLocaleString('id-ID')}</p>
              </div>
            </Card>

            <Card padding="md" className="border border-[var(--border-color)] bg-white flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Skor Minggu Ini</p>
                <p className="text-xl font-extrabold mt-0.5">{stats.weeklyCount}</p>
              </div>
            </Card>
          </div>

          {/* Filters & Control bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl w-full md:w-80 shadow-sm">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input autoComplete="off" /* autocomplete="off" */ name="searchQuery" type="text" placeholder="Cari nama pemain…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Periode:</span>
                <select aria-label="Pilih filter periode"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-xl border border-[var(--border-color)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] shadow-xs cursor-pointer"
                >
                  <option value="all-time">Semua Waktu (All Time)</option>
                  <option value="weekly">Minggu Ini (Weekly)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Urutkan:</span>
                <select aria-label="Pilih urutan data"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-[var(--border-color)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] shadow-xs cursor-pointer"
                >
                  <option value="score_desc">Skor Tertinggi</option>
                  <option value="score_asc">Skor Terendah</option>
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Table Card */}
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
            {isLoadingScores ? (
              <div className="p-12"><Loading message="Memuat riwayat skor game…" /></div>
            ) : (
              <div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                    <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                      <tr>
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Pemain</th>
                        <th className="px-6 py-4">Skor</th>
                        <th className="px-6 py-4">Tangkap</th>
                        <th className="px-6 py-4">Maks Combo</th>
                        <th className="px-6 py-4">Gelar</th>
                        <th className="px-6 py-4">Tanggal Rilis</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {paginatedScores.map((item, index) => {
                        const absoluteRank = currentPage * pageSize + index + 1;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-400">
                              #{absoluteRank}
                            </td>
                            <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                              {item.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-black text-[var(--color-primary)] text-sm">
                              {item.score.toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                              <span className="flex items-center gap-1">
                                <Bug className="h-3.5 w-3.5 text-slate-400" /> {item.caught_count} kecoa
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5 text-slate-400" /> {item.max_combo}x
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-amber-600">
                              {item.title || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                              {new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenDelete(item)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Skor"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {scores.length === 0 && (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                            Belum ada data skor yang terekam atau sesuai dengan pencarian Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
                  {paginatedScores.map((item, index) => {
                    const absoluteRank = currentPage * pageSize + index + 1;
                    return (
                      <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center min-w-0">
                            <span className="text-sm font-black text-slate-400 flex-shrink-0">#{absoluteRank}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[var(--text-primary)] text-sm truncate">{item.username}</div>
                              {item.title && (
                                <div className="text-xs font-semibold text-amber-600 truncate mt-0.5">{item.title}</div>
                              )}
                            </div>
                          </div>
                          <span className="font-black text-[var(--color-primary)] text-sm shrink-0 whitespace-nowrap ml-2">
                            {item.score.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex gap-3 text-[10px] font-semibold text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1"><Bug className="h-3 w-3" /> {item.caught_count} kecoa</span>
                            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {item.max_combo}x combo</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold">Hapus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {scores.length === 0 && (
                    <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Belum ada data skor yang terekam atau sesuai dengan pencarian Anda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Pagination Controls */}
          {pageCount > 1 && !isLoadingScores && (
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Menampilkan halaman {currentPage + 1} dari {pageCount} ({scores.length} total skor)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((c) => c - 1)}
                  className="rounded-lg border border-[var(--border-color)] bg-white p-2 disabled:opacity-30 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage + 1 === pageCount}
                  onClick={() => setCurrentPage((c) => c + 1)}
                  className="rounded-lg border border-[var(--border-color)] bg-white p-2 disabled:opacity-30 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ================= GAME PORTAL CONFIGURATION TAB =================
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in text-left">
          {isLoadingSettings ? (
            <div className="p-12"><Loading message="Memuat pengaturan portal…" /></div>
          ) : (
            <>
              {/* Row 1: Featured Game & Challenge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Featured Game Hero Config */}
                <Card className="border border-[var(--border-color)] bg-white space-y-4">
                  <h3 className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" /> Game Unggulan Utama (Hero)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Pilih game yang akan dipajang secara menonjol di bagian atas halaman Game Hub.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="select-featured-game">
                      Pilih Game Unggulan
                    </label>
                    <select id="select-featured-game"
                      value={gameSettings.featuredGameId}
                      onChange={(e) => setGameSettings(prev => ({ ...prev, featuredGameId: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-white p-3 text-sm font-semibold outline-none focus:border-[var(--color-primary)] cursor-pointer"
                    >
                      {Object.keys(gameSettings.games).map((gameId) => {
                        const g = gameSettings.games[gameId];
                        return (
                          <option key={gameId} value={gameId}>
                            {g.title || gameId} {g.active ? '(Aktif)' : '(Terkunci)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </Card>

                {/* 2. Weekly Challenge Banner Settings */}
                <Card className="border border-[var(--border-color)] bg-white space-y-4">
                  <h3 className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-500" /> Spanduk Tantangan Mingguan
                  </h3>

                  <div className="flex items-center gap-3 pb-2 border-b border-[var(--border-color)]">
                    <input name="file_input" type="checkbox" id="challenge-active" checked={gameSettings.challengeActive} onChange={(e) => setGameSettings(prev => ({ ...prev, challengeActive: e.target.checked }))} className="h-4.5 w-4.5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer" />
                    <label htmlFor="challenge-active" className="text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                      Aktifkan Spanduk Tantangan Komunitas
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="challenge-count">
                        Target Tangkapan Kecoa
                      </label>
                      <input autoComplete="off" /* autocomplete="off" */ name="challengeCount" type="number" id="challenge-count" disabled={!gameSettings.challengeActive} value={gameSettings.challengeCount} onChange={(e) => setGameSettings(prev => ({ ...prev, challengeCount: Math.max(0, parseInt(e.target.value) || 0) }))} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] disabled:opacity-40" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="challenge-reward">
                        Gelar Hadiah Challenge
                      </label>
                      <input autoComplete="off" /* autocomplete="off" */ name="challengeReward" type="text" id="challenge-reward" disabled={!gameSettings.challengeActive} value={gameSettings.challengeReward} onChange={(e) => setGameSettings(prev => ({ ...prev, challengeReward: e.target.value }))} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] disabled:opacity-40" />
                    </div>
                  </div>
                </Card>

              </div>

              {/* Row 2: Live Statistics Overrides */}
              <Card className="border border-[var(--border-color)] bg-white space-y-4">
                <h3 className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" /> Overrides Statistik Live Komunitas
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Override secara manual data jumlah pemain atau total permainan yang ditayangkan pada antarmuka frontend jika diperlukan.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="stat-players">
                      Total Pemain
                    </label>
                    <input autoComplete="off" /* autocomplete="off" */ name="totalPlayers" type="number" id="stat-players" value={gameSettings.stats.totalPlayers} onChange={(e) => updateStatsField('totalPlayers', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="stat-played">
                      Total Game Dimainkan
                    </label>
                    <input autoComplete="off" /* autocomplete="off" */ name="totalGamesPlayed" type="number" id="stat-played" value={gameSettings.stats.totalGamesPlayed} onChange={(e) => updateStatsField('totalGamesPlayed', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block" htmlFor="stat-avg">
                      Rata-rata Skor
                    </label>
                    <input autoComplete="off" /* autocomplete="off" */ name="avgScore" type="number" id="stat-avg" value={gameSettings.stats.avgScore} onChange={(e) => updateStatsField('avgScore', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>
              </Card>

              {/* Row 3: Game List Catalog Configuration */}
              {/* Row 3: Game List Catalog Configuration */}
              <Card className="border border-[var(--border-color)] bg-white space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
                  <h3 className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-cyan-500" /> Pengaturan Katalog Game Arena
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs font-bold border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/20 cursor-pointer"
                    onClick={handleAddNewGame}
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Game Baru
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.keys(gameSettings.games).map((gameId) => {
                    const game = gameSettings.games[gameId];
                    const isExpanded = expandedGameId === gameId;

                    const title = game.title ?? '';
                    const description = game.description ?? '';
                    const link = game.link ?? '';
                    const difficulty = game.difficulty ?? '';
                    const playTime = game.playTime ?? '';
                    const badge = game.badge ?? '';
                    const icon = game.icon ?? 'Gamepad';
                    const emoji = game.emoji ?? '🎮';
                    const theme = game.theme ?? 'amber';
                    const layoutSpan = game.layoutSpan ?? 1;
                    const bgImage = game.bgImage ?? '';

                    return (
                      <div
                        key={gameId}
                        className={`border rounded-2xl overflow-hidden transition-colors duration-300 ease-in-out ${isExpanded
                            ? 'border-[var(--color-primary)]/40 shadow-lg shadow-[var(--color-primary)]/8 bg-white'
                            : 'border-[var(--border-color)] shadow-sm bg-slate-50/40 hover:shadow-md hover:border-slate-300 hover:bg-white'
                          }`}
                      >
                        {/* Accordion Header */}
                        <div
                          className={`flex justify-between items-center p-4 cursor-pointer select-none transition-colors duration-200 ${isExpanded
                              ? 'bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent'
                              : 'bg-transparent hover:bg-slate-50/60'
                            }`}
                          onClick={() => setExpandedGameId(isExpanded ? null : gameId)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-bold transition-transform duration-200 ${isExpanded ? 'scale-110' : 'scale-100'}`}>{emoji}</span>
                            <div>
                              <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                                {title || 'Game Tanpa Judul'}
                                {badge && (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full px-2 py-0.5">
                                    {badge}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">ID: {gameId} &bull; Tautan: {link || '#'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {game.active ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 transition-colors duration-200">
                                <Eye className="h-3 w-3" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 transition-colors duration-200">
                                <Lock className="h-3 w-3" /> Terkunci
                              </span>
                            )}

                            {gameId !== 'menangkap-kecoa' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGame(gameId)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors duration-200 cursor-pointer"
                                title="Hapus Game"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setExpandedGameId(isExpanded ? null : gameId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8 border border-transparent hover:border-[var(--color-primary)]/20 transition-colors duration-200 cursor-pointer"
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        <div
                          className={`transition-colors duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                          <div className="p-4 border-t border-[var(--color-primary)]/15 bg-gradient-to-b from-[var(--color-primary)]/3 to-white space-y-4 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-title-${gameId}`}>Nama / Judul Game</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="title" type="text" id={`edit-title-${gameId}`} value={title} onChange={(e) => updateGameField(gameId, 'title', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="Contoh: Menangkap Kecoa" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-link-${gameId}`}>Tautan Play / Rute (atau `modal:tebak-kata` / `#`)</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="link" type="text" id={`edit-link-${gameId}`} value={link} onChange={(e) => updateGameField(gameId, 'link', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="Contoh: /games/menangkap-kecoa" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500" htmlFor={`edit-desc-${gameId}`}>Deskripsi Game</label>
                              <textarea name="textarea_field" id={`edit-desc-${gameId}`} value={description} onChange={(e) => updateGameField(gameId, 'description', e.target.value)} rows={2} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-medium" placeholder="Tulis deskripsi singkat yang menarik mengenai game ini…" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-badge-${gameId}`}>Lencana (Badge)</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="badge" type="text" id={`edit-badge-${gameId}`} value={badge} onChange={(e) => updateGameField(gameId, 'badge', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="Contoh: Populer" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-diff-${gameId}`}>Tingkat Kesulitan</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="difficulty" type="text" id={`edit-diff-${gameId}`} value={difficulty} onChange={(e) => updateGameField(gameId, 'difficulty', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="Contoh: Mudah" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-playTime-${gameId}`}>Durasi Bermain</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="playTime" type="text" id={`edit-playTime-${gameId}`} value={playTime} onChange={(e) => updateGameField(gameId, 'playTime', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="Contoh: 60 Detik" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-span-${gameId}`}>Ukuran Lebar Layout</label>
                                <select id={`edit-span-${gameId}`}
                                  value={layoutSpan}
                                  onChange={(e) => updateGameField(gameId, 'layoutSpan', parseInt(e.target.value) || 1)}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold"
                                >
                                  <option value={1}>Sedang (1 Kolom)</option>
                                  <option value={2}>Lebar (2 Kolom)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-theme-${gameId}`}>Tema Warna Visual</label>
                                <select id={`edit-theme-${gameId}`}
                                  value={theme}
                                  onChange={(e) => updateGameField(gameId, 'theme', e.target.value)}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold"
                                >
                                  <option value="amber">Amber / Emas (Meriah)</option>
                                  <option value="cyan">Cyan / Biru (Sleek)</option>
                                  <option value="purple">Purple / Ungu (Premium)</option>
                                  <option value="emerald">Emerald / Hijau (Fresh)</option>
                                  <option value="rose">Rose / Merah (Energetik)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-icon-${gameId}`}>Ikon Lucide</label>
                                <select id={`edit-icon-${gameId}`}
                                  value={icon}
                                  onChange={(e) => updateGameField(gameId, 'icon', e.target.value)}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold"
                                >
                                  <option value="Bug">Bug (Serangga)</option>
                                  <option value="HelpCircle">HelpCircle (Tanya)</option>
                                  <option value="Zap">Zap (Petir)</option>
                                  <option value="Gamepad">Gamepad (Konsol)</option>
                                  <option value="Star">Star (Bintang)</option>
                                  <option value="Flame">Flame (Api)</option>
                                  <option value="Heart">Heart (Hati)</option>
                                  <option value="Music">Music (Musik)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-emoji-${gameId}`}>Emoji Ikon</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="emoji" type="text" id={`edit-emoji-${gameId}`} value={emoji} onChange={(e) => updateGameField(gameId, 'emoji', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold text-center" placeholder="Contoh: 🐜" />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-bgPreset-${gameId}`}>Background Preset / URL</label>
                                <select id={`edit-bgPreset-${gameId}`}
                                  value={['cockroachBg', 'tebakKataBg', 'intanRunBg'].includes(bgImage) ? bgImage : 'custom'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateGameField(gameId, 'bgImage', val === 'custom' ? '' : val);
                                  }}
                                  className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold"
                                >
                                  <option value="cockroachBg">Kecoa Arena (Default)</option>
                                  <option value="tebakKataBg">Tebak Kata (Default)</option>
                                  <option value="intanRunBg">Intan Run (Default)</option>
                                  <option value="custom">URL Gambar Kustom</option>
                                </select>
                              </div>
                            </div>

                            {!['cockroachBg', 'tebakKataBg', 'intanRunBg'].includes(bgImage) && (
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500" htmlFor={`edit-bgUrl-${gameId}`}>URL Gambar Latar Belakang Kustom</label>
                                <input autoComplete="off" /* autocomplete="off" */ name="bgImage" type="text" id={`edit-bgUrl-${gameId}`} value={bgImage} onChange={(e) => updateGameField(gameId, 'bgImage', e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-white p-2.5 text-xs outline-none focus:border-[var(--color-primary)] font-semibold" placeholder="https://example.com/gambar-game.jpg" />
                              </div>
                            )}

                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                              <input name="file_input" type="checkbox" id={`edit-active-${gameId}`} checked={game.active} onChange={(e) => updateGameField(gameId, 'active', e.target.checked)} className="h-4.5 w-4.5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer" />
                              <label htmlFor={`edit-active-${gameId}`} className="text-xs font-extrabold text-slate-700 cursor-pointer flex items-center gap-1.5">
                                Aktifkan Game (Bisa diakses & dimainkan oleh user)
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-extrabold cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{actionLoading ? 'Menyimpan…' : 'Simpan Pengaturan'}</span>
                </Button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Confirm Single Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Skor Pemain"
        message={`Apakah Anda yakin ingin menghapus data skor milik pemain "${confirmDelete.username}"? Data ini akan hilang selamanya.`}
        confirmText="Hapus Skor"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, username: '' })}
        isLoading={actionLoading}
        type="danger"
      />

      {/* Confirm Bulk Operations */}
      <ConfirmDialog
        isOpen={confirmBulk.isOpen}
        title={confirmBulk.title}
        message={confirmBulk.message}
        confirmText="Lakukan Reset"
        cancelText="Batal"
        onConfirm={handleConfirmBulk}
        onCancel={() => setConfirmBulk({ isOpen: false, type: '', title: '', message: '' })}
        isLoading={actionLoading}
        type="danger"
      />

    </div>
  );
}
