import React from 'react';
import StickyNote from './StickyNote';
import EmptyState from '../common/EmptyState';
import { Pin } from 'lucide-react';

export default function MadingBoard({
  notes = [],
  onDeleteNote, // passed only for admin views
  isLoading = false,
  className = '',
}) {
  if (notes.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="Papan Mading Kosong"
        description="Belum ada pesan tertempel di papan mading. Jadilah yang pertama menempelkan pesan dukungan Anda!"
        icon={Pin}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 rounded-2xl bg-amber-950/5 dark:bg-black/20 border border-[var(--border-color)] relative ${className}`}>
      {/* Visual background patterns like corkboard grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none rounded-2xl" />

      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onDelete={onDeleteNote ? () => onDeleteNote(note.id) : null}
          className="relative z-10"
        />
      ))}
    </div>
  );
}
