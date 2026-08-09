'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Plus, Info, ShieldCheck, CheckCircle } from 'lucide-react';
import { madingService } from '../../services/public/madingService';
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

      // Map database notes
      const mappedDbNotes = dbNotes.map((note) => {
        const noteId = note.id;

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
          loves: note.likes || 0,
          rotate: (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 7) - 3,
          isAdmin: note.isAdmin
        };
      });

      // Set notes list
      setNotes(mappedDbNotes);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed loading notes:', err);
      // Fail-safe
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Mading IRIS | Ruang Dukungan Komunitas';
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
  const handleLoveNote = async (noteId) => {
    // Check if user has liked already
    const userLiked = JSON.parse((typeof window !== 'undefined' ? (...args) => localStorage.getItem(...args) : () => null)('mading_user_liked_ids') || '[]');
    if (userLiked.includes(noteId)) {
      return; // prevent duplicate likes
    }

    // Call service to increment likes in DB
    const res = await madingService.likeNote(noteId);
    
    // Update local state even if DB request fails to give immediate feedback
    setNotes(prevNotes => 
      prevNotes.map(n => 
        n.id === noteId ? { ...n, loves: (n.loves || 0) + 1 } : n
      )
    );
    
    // If selected note is open, update it too
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(prev => ({ ...prev, loves: (prev.loves || 0) + 1 }));
    }

    if (res && res.success) {
      // Mark as liked by current user only if DB request succeeded
      userLiked.push(noteId);
      (typeof window !== 'undefined' ? (...args) => localStorage.setItem(...args) : () => {})('mading_user_liked_ids', JSON.stringify(userLiked));
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-heading)] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 font-semibold text-xs border border-white/10"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO HERO SECTION */}
      <section className="text-center relative max-w-4xl mx-auto pb-6 pt-0 select-none">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--color-primary)]">
            Mading IRIS
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Ruang hangat untuk meninggalkan ucapan manis, kata apresiasi, dukungan, dan cerita kecil dari komunitas IRIS untuk Nur Intan. Bagikan energi positifmu di sini!
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
              className="px-6 py-2.5 bg-iris-gradient text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 focus-visible:outline-none"
            >
              <Plus className="h-4 w-4" />
              <span>Tulis Pesan Baru</span>
            </button>
            <button
              onClick={scrollToMading}
              className="px-6 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-pink)] font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--color-pink-tint-8)] transition-all cursor-pointer focus-visible:outline-none"
            >
              Lihat Papan Mading
            </button>
          </div>
        </div>
      </section>

      {/* GUIDELINES CARD (Jaga Kenyamanan Ruang) AT THE TOP */}
      <section className="max-w-6xl mx-auto">
        <div className="sidebar-panel-card space-y-4 text-left border border-pink-200/80 bg-gradient-to-br from-pink-50/60 via-white to-purple-50/60 shadow-sm rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-pink-100/80 pb-3">
            <h3 className="font-extrabold text-base text-[var(--color-primary)] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--color-primary)] shrink-0" /> Jaga Kenyamanan Ruang
            </h3>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200/60">
              Panduan Mading
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)]">
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/90 border border-slate-100 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs mt-0.5">1</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800 block mb-0.5">Gunakan Kata Sopan</strong>
                Tuliskan kata-kata pendukung yang baik, sopan, dan membangun untuk Nur Intan.
              </p>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/90 border border-slate-100 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs mt-0.5">2</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800 block mb-0.5">Positif & Sehat</strong>
                Tidak menyisipkan ujaran kebencian, SARA, spam, atau promosi iklan tak berizin.
              </p>
            </div>
            <div className="flex gap-3 items-start p-3 rounded-xl bg-white/90 border border-slate-100 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs mt-0.5">3</span>
              <p className="leading-relaxed">
                <strong className="text-slate-800 block mb-0.5">Sebarkan Semangat</strong>
                Bagikan candaan bersahabat, apresiasi tulus, dan ungkapan terima kasihmu.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/90 rounded-xl flex gap-2.5 items-center border border-slate-200/70">
            <Info className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Setiap pesan yang dikirimkan terpasang otomatis. Admin berhak menghapus pesan yang dinilai melanggar aturan.
            </p>
          </div>
        </div>
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
              <div className="bg-[var(--color-peach)] min-h-[500px] flex items-center justify-center rounded-lg">
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

      {/* BOTTOM WIDGETS SECTION: 2 Columns on desktop */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto pt-6">

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
            className="w-full py-2.5 bg-iris-gradient text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
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
              Pesan terpopuler hari ini pilihan komunitas IRIS.
            </p>
          </div>
        )}
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

