'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Plus, Info, ShieldCheck, CheckCircle } from 'lucide-react';
import { madingService } from './madingService';
import MadingBoard from '../../components/mading/MadingBoard';
import MessageModal from '../../components/mading/MessageModal';
import MessageFormModal from '../../components/mading/MessageFormModal';
import Loading from '../../components/common/Loading';
import './MadingPage.css';

export default function MadingPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Terbaru');

  // Load and sync notes from database & localStorage
  const loadNotes = async () => {
    setIsLoading(true);
    try {
      // Load Supabase notes
      const dbNotes = await madingService.getNotes();

      const savedLoves = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_loves') || '{}');

      // Map database notes
      const mappedDbNotes = dbNotes.map((note) => {
        const noteId = note.id;

        let loves = savedLoves[noteId];
        if (loves === undefined) {
          // Seed initial loves count based on char code sum
          loves = (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 28) + 5;
          savedLoves[noteId] = loves;
        }

        const dateObj = new Date(note.createdAt);
        const formattedDate = isNaN(dateObj.getTime())
          ? 'Baru'
          : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        return {
          id: noteId,
          name: note.name || 'Anonim',
          message: note.message,
          color: note.themeColor || 'yellow',
          date: formattedDate,
          loves: loves,
          rotate: (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 7) - 3,
          isAdmin: note.isAdmin
        };
      });

      // Set notes list
      setNotes(mappedDbNotes);
      (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_loves', JSON.stringify(savedLoves));
    } catch (err) {
      console.error('Failed loading notes:', err);
      // Fail-safe
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Mading Intanium | Ruang Dukungan Komunitas';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes();
  }, []);

  // Submit new note
  const handleNoteSubmit = async (formData) => {
    try {
      const dbPayload = {
        name: formData.name.trim() || 'Anonim',
        message: formData.message.trim(),
        themeColor: formData.color || 'yellow'
      };

      let newNoteFormatted;

      try {
        // Attempt posting to Supabase database
        const createdNote = await madingService.postNote(dbPayload);
        const noteId = createdNote.id;

        // Initialize likes locally
        const savedLoves = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_loves') || '{}');
        savedLoves[noteId] = 0;
        (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_loves', JSON.stringify(savedLoves));

        const dateObj = new Date(createdNote.createdAt);
        newNoteFormatted = {
          id: noteId,
          name: createdNote.name,
          message: createdNote.message,
          color: createdNote.themeColor,
          date: isNaN(dateObj.getTime()) ? 'Baru' : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          loves: 0,
          rotate: (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 7) - 3,
          isAdmin: createdNote.isAdmin
        };
      } catch (dbErr) {
        console.warn('Database post failed, falling back to local simulation:', dbErr);
        // Offline / not configured fallback
        // eslint-disable-next-line react-hooks/purity
        const localId = `local-${Date.now()}`;

        const savedLoves = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_loves') || '{}');
        savedLoves[localId] = 0;
        (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_loves', JSON.stringify(savedLoves));

        newNoteFormatted = {
          id: localId,
          name: formData.name.trim() || 'Anonim',
          message: formData.message.trim(),
          color: formData.color,
          date: 'Baru',
          loves: 0,
          rotate: (Math.abs(localId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 7) - 3,
          isAdmin: false
        };
      }

      setNotes(prev => [newNoteFormatted, ...prev]);

      // Launch success Toast notification
      showToast('Catatan dukungan berhasil ditempel di papan mading! 📌');
    } catch (err) {
      console.error(err);
      showToast('Gagal menempelkan pesan pendukung.', 'error');
    }
  };

  // Love / Like incrementation handler
  const handleLoveNote = (noteId) => {
    // Check if user has liked already
    const userLiked = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_user_liked_ids') || '[]');
    if (userLiked.includes(noteId)) {
      return; // prevent duplicate likes
    }

    // Save likes count
    const savedLoves = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_loves') || '{}');
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const nextLoves = (note.loves || 0) + 1;
    savedLoves[noteId] = nextLoves;
    (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_loves', JSON.stringify(savedLoves));

    // Mark as liked by current user
    userLiked.push(noteId);
    (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_user_liked_ids', JSON.stringify(userLiked));

    // Update state
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, loves: nextLoves } : n));

    // If modal detail is currently opened, update the modal note
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(prev => ({ ...prev, loves: nextLoves }));
    }
  };


  // Helper for scrolling into target elements
  const scrollToMading = () => {
    const el = document.getElementById('papan-mading-cork');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toast notifier
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pin of the day selection (highest liked note)
  const pinOfTheDay = useMemo(() => {
    if (notes.length === 0) return null;
    return notes.reduce((max, note) => (note.loves > max.loves ? note : max), notes[0]);
  }, [notes]);

  // Filtering & Sorting notes logic
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        n => n.name.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      );
    }

    // 2. Sorting select dropdown
    if (sortBy === 'Terbaru') {
      // Newly created notes first. Since we prepend new notes to state, we don't need sorting, but mock notes have dates.
      // We can sort by id (local notes first), then mock notes in original order
      result.sort((a, b) => {
        if (a.id.startsWith('local-') && !b.id.startsWith('local-')) return -1;
        if (!a.id.startsWith('local-') && b.id.startsWith('local-')) return 1;
        return 0; // maintain relative layout
      });
    } else if (sortBy === 'Terpopuler') {
      result.sort((a, b) => (b.loves || 0) - (a.loves || 0));
    } else if (sortBy === 'Acak') {
      // Deterministic pseudo-random sorting based on note ID hash to avoid jittery state updates on every render
      result.sort((a, b) => {
        const hashA = a.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const hashB = b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return (hashA % 13) - (hashB % 13);
      });
    }

    return result;
  }, [notes, searchQuery, sortBy]);

  return (
    <div className="mading-page-container space-y-12">
      {/* SUCCESS TOAST ALERTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#170C79] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-semibold text-xs border border-indigo-400/20"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO HERO SECTION */}
      <section className="text-center relative max-w-4xl mx-auto pb-8 pt-0 select-none">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--color-primary)]">
            Mading Intanium
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Ruang hangat untuk meninggalkan ucapan manis, kata apresiasi, dukungan, dan cerita kecil dari komunitas Intanium untuk Nur Intan. Bagikan energi positifmu di sini!
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-2 text-xs font-bold text-[var(--text-secondary)]/80">
            <div className="flex items-center gap-1">
              <span className="text-emerald-500 text-sm"></span>
              <span>100% Positive Space</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500 text-sm"></span>
              <span>Dari Fans untuk Intan</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2.5 bg-[#170C79] hover:bg-indigo-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#170C79] focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tulis Pesan Baru</span>
            </button>
            <button
              onClick={scrollToMading}
              className="px-6 py-2.5 bg-white border border-[var(--border-color)] text-[#170C79] font-extrabold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#170C79] focus-visible:ring-offset-2"
            >
              Lihat Papan Mading
            </button>
          </div>
        </div>

        {/* Home-aligned Horizontal Divider Line */}
        <div className="mading-divider-line" />
      </section>

      {/* FILTER & TOOLBAR CONTROLS */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-[var(--border-color)]/30 pb-4">

          {/* Search bar */}
          <div className="search-input-wrapper">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Cari pesan, nama, atau kata dukungan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
              aria-label="Cari pesan atau kata dukungan"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="mading-sort-select" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide cursor-pointer">Sort:</label>
            <select
              id="mading-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select-field"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terpopuler">Terpopuler</option>
              <option value="Acak">Acak</option>
            </select>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION: Corkboard (Full Width) */}
      <section id="papan-mading-cork" className="max-w-6xl mx-auto space-y-4">
        <div className="corkboard-outer shadow-2xl relative overflow-hidden">
          <div className="corkboard-bevel-frame">
            {isLoading ? (
              <div className="bg-[#cb9b6c] min-h-[500px] flex items-center justify-center rounded-lg">
                <Loading message="Menyiapkan mading komunitas..." />
              </div>
            ) : (
              <MadingBoard
                notes={processedNotes}
                onNoteClick={(note) => setSelectedNote(note)}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-secondary)]/80 text-center leading-relaxed italic">
          * Klik pada salah satu sticky note untuk melihat pesan penuh dan memberikan like.
        </p>
      </section>

      {/* BOTTOM WIDGETS SECTION: 3 Columns on desktop, 1 Column on mobile */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-6">

        {/* CTA Card widget */}
        <div className="sidebar-panel-card space-y-4 text-left">
          <h3 className="font-extrabold text-sm text-[var(--color-primary)] flex items-center gap-1.5">
            Bagikan Dukunganmu
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Tuliskan pesan penyemangat hangat, puisi singkat, apresiasi kreatif, atau ucapan selamat untuk Nur Intan sekarang juga!
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full py-2.5 bg-[#170C79] hover:bg-indigo-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#170C79] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Pesan Sekarang</span>
          </button>
        </div>

        {/* Featured: Pin of the Day */}
        {pinOfTheDay && (
          <div className="sidebar-panel-card pin-of-day-card space-y-4 text-left relative overflow-hidden">
            <h3 className="font-extrabold text-xs text-indigo-900/60 flex items-center gap-1.5">
              📌 Pin Of The Day
            </h3>

            {/* Render small inline mockup note layout for visual beauty */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedNote(pinOfTheDay);
                }
              }}
              onClick={() => setSelectedNote(pinOfTheDay)}
              className={`sticky-note-item pastel-${pinOfTheDay.color} p-4 rounded shadow border border-black/5 cursor-pointer transform hover:scale-[1.02] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2`}
            >
              <p className="note-text text-xs font-bold text-slate-800 leading-relaxed line-clamp-4 mt-2">
                {pinOfTheDay.message}
              </p>
              <div className="flex items-center justify-between mt-3 pt-1.5 border-t border-black/5 text-[9px] text-slate-500">
                <span className="font-bold text-slate-700 truncate max-w-[100px]">
                  - {pinOfTheDay.name}
                </span>
                <div className="flex items-center gap-0.5 font-bold">
                  <Heart className="h-2.5 w-2.5 text-red-500 fill-red-500" />
                  <span>{pinOfTheDay.loves}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
              Pesan terpopuler hari ini pilihan komunitas Intanium.
            </p>
          </div>
        )}

        {/* Rules / Guidelines Card */}
        <div className="sidebar-panel-card space-y-4 text-left">
          <h3 className="font-extrabold text-sm text-[var(--color-primary)] flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-[var(--color-primary)]" /> Jaga Kenyamanan Ruang
          </h3>

          <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
            <li className="flex gap-2">
              <span className="text-indigo-900 text-sm font-black">1.</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800">Gunakan Kata Sopan:</strong> Tuliskan kata-kata pendukung yang baik, sopan, dan membangun untuk Nur Intan.
              </p>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-900 text-sm font-black">2.</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800">Positif & Sehat:</strong> Tidak diperkenankan menyisipkan ujaran kebencian, sara, spam, atau promosi iklan tak berizin.
              </p>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-900 text-sm font-black">3.</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800">Sebarkan Semangat:</strong> Bagikan candaan bersahabat, apresiasi tulus, dan ungkapan terima kasihmu.
              </p>
            </li>
          </ul>

          <div className="p-3 bg-[var(--bg-primary)] rounded-lg flex gap-2 items-start border border-[var(--border-color)]">
            <Info className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Setiap pesan yang dikirimkan terpasang otomatis. Admin berhak menghapus pesan yang dinilai melanggar aturan.
            </p>
          </div>
        </div>
      </section>

      {/* POPUP MODAL COMPONENT WINDOWS */}
      <AnimatePresence>
        {/* Detail Note Modal */}
        {selectedNote && (
          <MessageModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onLove={handleLoveNote}
          />
        )}

        {/* Submission Form Modal */}
        {isFormOpen && (
          <MessageFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleNoteSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

