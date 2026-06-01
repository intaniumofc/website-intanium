import React, { useState, useEffect } from 'react';
import { madingService } from '../../features/mading/madingService';
import Card from '../../components/common/Card';
import MadingBoard from '../../components/mading/MadingBoard';
import Loading from '../../components/common/Loading';

export default function AdminMading() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = () => {
    setIsLoading(true);
    madingService.getNotes()
      .then((data) => {
        setNotes(data);
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

  const handleDeleteNote = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pesan mading ini dari papan mading?')) {
      try {
        await madingService.deleteNote(id);
        setNotes((prev) => prev.filter((note) => note.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold text-white">📌 Panel Moderasi Papan Mading</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Review seluruh pesan yang masuk. Hapus pesan yang tidak pantas, melanggar aturan SARA, atau mengganggu kondusivitas komunitas.</p>
      </div>

      {isLoading ? (
        <Loading message="Mengunduh data mading..." />
      ) : (
        <MadingBoard notes={notes} onDeleteNote={handleDeleteNote} />
      )}
    </div>
  );
}
