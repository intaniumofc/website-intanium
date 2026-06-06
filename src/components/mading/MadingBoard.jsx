import React from 'react';
import { motion } from 'framer-motion';
import StickyNote from './StickyNote';
import EmptyState from '../common/EmptyState';
import { Pin } from 'lucide-react';

const boardVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export default function MadingBoard({
  notes = [],
  onNoteClick,
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
    <motion.div
      variants={boardVariant}
      className={`corkboard-surface p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 rounded-xl relative ${className}`}
    >
      {notes.map((note, index) => (
        <StickyNote
          key={note.id}
          note={note}
          index={index}
          onClick={onNoteClick}
          onDelete={onDeleteNote ? () => onDeleteNote(note.id) : null}
          className="relative z-10"
        />
      ))}
    </motion.div>
  );
}

