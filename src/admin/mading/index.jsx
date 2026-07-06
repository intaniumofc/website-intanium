'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { madingService } from '../../features/mading/madingService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import {
  Check,
  X,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Heart,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';

export default function AdminMading() {
  const notify = useAdminToast();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved'
  const [actionLoading, setActionLoading] = useState(null); // track loading of currently clicked note ID
  const [sort, setSort] = useState({ key: 'date', order: 'desc' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const fetchNotes = () => {
    setIsLoading(true);
    madingService.getNotes(false) // Fetch ALL notes (approved & unapproved)
      .then((data) => {
        const savedLoves = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_loves') || '{}');
        const mapped = data.map((note) => {
          const noteId = note.id;
          let loves = savedLoves[noteId];
          if (loves === undefined) {
            loves = (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 28) + 5;
            savedLoves[noteId] = loves;
          }
          const dateObj = new Date(note.createdAt);
          const formattedDate = isNaN(dateObj.getTime())
            ? 'Baru'
            : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

          return {
            ...note,
            color: note.themeColor || 'yellow',
            date: formattedDate,
            loves: loves
          };
        });
        (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_loves', JSON.stringify(savedLoves));
        setNotes(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await madingService.approveNote(id);
      if (res.success) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? { ...note, isApproved: true } : note))
        );
        notify.success('Pesan disetujui', 'Pesan mading sekarang tampil di halaman publik.');
      } else {
        notify.error('Gagal menyetujui pesan', res.error || 'Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyetujui pesan', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnapprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await madingService.unapproveNote(id);
      if (res.success) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? { ...note, isApproved: false } : note))
        );
        notify.success('Approval dibatalkan', 'Pesan mading kembali ke status pending.');
      } else {
        notify.error('Gagal membatalkan approval', res.error || 'Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal membatalkan approval', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    setActionLoading(id);
    try {
      await madingService.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      notify.success('Pesan dihapus', 'Pesan mading berhasil dihapus.');
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus pesan', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle sort key and order
  const handleSort = (key) => {
    setSort((prev) => {
      const isSameKey = prev.key === key;
      const order = isSameKey ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc';
      return { key, order };
    });
  };

  // Render header sort indicators
  const renderSortIndicator = (key) => {
    if (sort.key !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline-block text-slate-400" />;
    }
    return sort.order === 'asc' ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5 inline-block text-[var(--color-primary)]" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5 inline-block text-[var(--color-primary)]" />
    );
  };

  // Filter & Sort notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => {
      // 1. Status Filter
      if (statusFilter === 'pending' && note.isApproved) return false;
      if (statusFilter === 'approved' && !note.isApproved) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          note.name.toLowerCase().includes(q) ||
          note.message.toLowerCase().includes(q)
        );
      }

      return true;
    });

    // 3. Sorting logic
    result.sort((a, b) => {
      let valA = a[sort.key];
      let valB = b[sort.key];

      // Handle raw date fallback comparison using createdAt
      if (sort.key === 'date') {
        valA = new Date(a.createdAt).getTime() || 0;
        valB = new Date(b.createdAt).getTime() || 0;
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (sort.order === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    return result;
  }, [notes, statusFilter, searchQuery, sort.key, sort.order]);

  // Count summaries
  const counts = useMemo(() => {
    return {
      total: notes.length,
      pending: notes.filter((n) => !n.isApproved).length,
      approved: notes.filter((n) => n.isApproved).length,
    };
  }, [notes]);

  const colorsMap = {
    pink: 'bg-[#ffe5ec] text-pink-700 border-pink-200',
    lavender: 'bg-[#f3e8ff] text-purple-700 border-purple-200',
    yellow: 'bg-[#fef9c3] text-yellow-700 border-yellow-200',
    blue: 'bg-[#e0f2fe] text-blue-700 border-sky-200',
    peach: 'bg-[#ffedd5] text-orange-700 border-orange-200',
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page Header */}
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
          Moderasi Pesan Mading
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Review dan setujui pesan pendukung dari penggemar sebelum dipublikasikan di halaman utama Mading.
        </p>
      </div>

      {/* Metrics & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Metric Cards */}
        <div className="md:col-span-3 flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 min-w-[120px] p-4 rounded-xl border transition-colors text-left relative overflow-hidden bg-white border-[var(--border-color)] shadow-sm cursor-pointer ${statusFilter === 'all'
              ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]'
              : 'hover:border-slate-300'
              }`}
          >
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Semua Catatan</span>
            <span className="text-2xl font-black text-[var(--color-primary)] mt-1 block">{counts.total}</span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex-1 min-w-[120px] p-4 rounded-xl border transition-colors text-left relative overflow-hidden bg-white border-[var(--border-color)] cursor-pointer ${statusFilter === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/10'
              : 'hover:border-slate-300'
              }`}
          >
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Menunggu Approval</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{counts.pending}</span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`flex-1 min-w-[120px] p-4 rounded-xl border transition-colors text-left relative overflow-hidden bg-white border-[var(--border-color)] cursor-pointer ${statusFilter === 'approved'
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'hover:border-slate-300'
              }`}
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Telah Disetujui</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{counts.approved}</span>
          </button>
        </div>

        {/* Action Controls Search & Sort */}
        <div className="md:col-span-1 flex flex-col sm:flex-row md:flex-col gap-2 w-full">
          {/* Search bar */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input autoComplete="off" /* autocomplete="off" */ name="searchQuery" type="text" placeholder="Cari pesan…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[var(--border-color)] text-[var(--text-primary)] text-xs placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
          </div>

          {/* Styled Select Dropdown for Sorting */}
          <div className="flex items-center gap-2 shrink-0 bg-white border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]">
            <span className="text-[var(--text-secondary)]">Sort:</span>
            <select
              value={`${sort.key}-${sort.order}`}
              onChange={(e) => {
                const [key, order] = e.target.value.split('-');
                setSort({ key, order });
              }}
              className="bg-transparent text-[var(--text-primary)] font-bold border-none outline-none focus:ring-0 cursor-pointer text-xs w-full"
            >
              <option value="date-desc" className="bg-white text-[var(--text-primary)]">Tanggal (Terbaru)</option>
              <option value="date-asc" className="bg-white text-[var(--text-primary)]">Tanggal (Terlama)</option>
              <option value="name-asc" className="bg-white text-[var(--text-primary)]">Nama (A-Z)</option>
              <option value="name-desc" className="bg-white text-[var(--text-primary)]">Nama (Z-A)</option>
              <option value="message-asc" className="bg-white text-[var(--text-primary)]">Pesan (A-Z)</option>
              <option value="message-desc" className="bg-white text-[var(--text-primary)]">Pesan (Z-A)</option>
              <option value="loves-desc" className="bg-white text-[var(--text-primary)]">Suka (Terbanyak)</option>
              <option value="loves-asc" className="bg-white text-[var(--text-primary)]">Suka (Tersedikit)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Sortable Table */}
      {isLoading ? (
        <Loading message="Mengunduh data mading…" />
      ) : filteredNotes.length === 0 ? (
        <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white p-8 text-center rounded-2xl">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">Tidak ada pesan ditemukan.</p>
        </Card>
      ) : (
        <div className="w-full bg-white border border-[var(--border-color)] rounded-xl shadow-md">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th
                    onClick={() => handleSort('name')}
                    className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle cursor-pointer select-none hover:text-[var(--color-primary-hover)] transition-colors w-[150px]"
                  >
                    Pengirim {renderSortIndicator('name')}
                  </th>
                  <th
                    onClick={() => handleSort('message')}
                    className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle cursor-pointer select-none hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    Pesan {renderSortIndicator('message')}
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle cursor-pointer select-none hover:text-[var(--color-primary-hover)] transition-colors w-[120px]"
                  >
                    Tanggal {renderSortIndicator('date')}
                  </th>
                  <th
                    onClick={() => handleSort('loves')}
                    className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle cursor-pointer select-none hover:text-[var(--color-primary-hover)] transition-colors w-[90px] text-right"
                  >
                    Suka {renderSortIndicator('loves')}
                  </th>
                  <th
                    onClick={() => handleSort('isApproved')}
                    className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle cursor-pointer select-none hover:text-[var(--color-primary-hover)] transition-colors w-[120px]"
                  >
                    Status {renderSortIndicator('isApproved')}
                  </th>
                  <th className="sticky top-0 z-10 bg-[#f3f2fb] shadow-[inset_0_-1px_0_var(--border-color)] h-12 px-4 text-[var(--color-primary)] font-black text-xs uppercase tracking-wider align-middle text-right w-[140px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => {
                  const isNoteApproved = note.isApproved;
                  const isBusy = actionLoading === note.id;
                  const noteColorStyle = colorsMap[note.color] || colorsMap.yellow;

                  return (
                    <tr
                      key={note.id}
                      className={`border-b border-[var(--border-color)]/60 hover:bg-[var(--color-primary-light)]/40 transition-colors ${isBusy ? 'opacity-50 pointer-events-none' : ''
                        }`}
                    >
                      {/* Author Name */}
                      <td className="p-4 align-middle font-extrabold text-[var(--text-primary)] truncate max-w-[150px]">
                        {note.name}
                      </td>

                      {/* Message content with color dot indicator */}
                      <td className="p-4 align-middle">
                        <div className="flex items-start gap-2 max-w-[450px]">
                          <span
                            className={`inline-block shrink-0 mt-1 h-3 w-3 rounded-full border border-black/10 ${noteColorStyle.split(' ')[0]}`}
                            title={`Warna: ${note.color}`}
                          />
                          <p className="text-[var(--text-secondary)] font-medium text-xs leading-relaxed break-words whitespace-pre-wrap">
                            {note.message}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 align-middle text-[var(--text-secondary)] text-xs font-semibold">
                        {note.date}
                      </td>

                      {/* Likes Count */}
                      <td className="p-4 align-middle text-[var(--text-secondary)] text-xs text-right font-bold">
                        <div className="flex items-center justify-end gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                          <span>{note.loves}</span>
                        </div>
                      </td>

                      {/* Approval Status Badge using native tailwind style classes */}
                      <td className="p-4 align-middle">
                        {isNoteApproved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3 animate-pulse" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Icon-Only Action Column */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isNoteApproved ? (
                            <button
                              onClick={() => handleUnapprove(note.id)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Batalkan Persetujuan"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(note.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Setujui Pesan"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pesan"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]/60 max-h-[600px] overflow-y-auto bg-[#fdfdfd]">
            {filteredNotes.map((note) => {
              const isNoteApproved = note.isApproved;
              const isBusy = actionLoading === note.id;
              const noteColorStyle = colorsMap[note.color] || colorsMap.yellow;

              return (
                <div 
                  key={note.id} 
                  className={`p-4 flex flex-col gap-3 transition-colors hover:bg-[var(--color-primary-light)]/40 ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-extrabold text-[var(--text-primary)] text-sm truncate flex-1">
                      {note.name}
                    </div>
                    <div className="text-[var(--text-secondary)] text-xs font-semibold shrink-0">
                      {note.date}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-white border border-[var(--border-color)] rounded-xl shadow-xs">
                    <span
                      className={`inline-block shrink-0 mt-1 h-3 w-3 rounded-full border border-black/10 ${noteColorStyle.split(' ')[0]}`}
                      title={`Warna: ${note.color}`}
                    />
                    <p className="text-[var(--text-secondary)] font-medium text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {note.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      {isNoteApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3 animate-pulse" /> Pending
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs font-bold">
                        <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                        <span>{note.loves}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {isNoteApproved ? (
                        <button
                          onClick={() => handleUnapprove(note.id)}
                          className="p-2 text-amber-600 hover:text-amber-700 bg-amber-50 rounded-lg transition-colors cursor-pointer border border-amber-100"
                          title="Batalkan Persetujuan"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(note.id)}
                          className="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-100"
                          title="Setujui Pesan"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 text-red-600 hover:text-red-700 bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100"
                        title="Hapus Pesan"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer guideline banner */}
      <div className="bg-white border border-[var(--border-color)] rounded-xl p-4 flex gap-3 items-start shadow-sm">
        <Info className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider">Petunjuk Moderasi</h5>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Klik judul kolom pada tabel atau gunakan menu dropdown urutkan untuk memfilter urutan pesan mading.
            Gunakan tombol ikon aksi: <strong className="text-emerald-600">Centang</strong> untuk menyetujui, <strong className="text-amber-600">Silang</strong> untuk membatalkan persetujuan, dan <strong className="text-red-600">Tempat Sampah</strong> untuk menghapus catatan secara permanen.
          </p>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Pesan Mading"
        message="Apakah Anda yakin ingin menghapus pesan mading ini secara permanen dari server?"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
