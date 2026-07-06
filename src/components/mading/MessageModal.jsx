'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Calendar } from 'lucide-react';

export default function MessageModal({ note, onClose, onLove }) {
  const [loved, setLoved] = useState(false);

  if (!note) return null;

  const { name, message, date, loves, color } = note;

  const handleLove = () => {
    if (!loved) {
      setLoved(true);
      onLove(note.id);
    }
  };

  // Color theme styling mapping matching user-specified colors
  const colorThemes = {
    pink: 'bg-[#ffe5ec] border-[#ffccd5] text-[#121225]',
    lavender: 'bg-[#f3e8ff] border-[#e9d5ff] text-[#121225]',
    yellow: 'bg-[#fef9c3] border-[#fef08a] text-[#121225]',
    blue: 'bg-[#e0f2fe] border-[#bae6fd] text-[#121225]',
    peach: 'bg-[#ffedd5] border-[#fed7aa] text-[#121225]',
  };

  const activeTheme = colorThemes[color] || colorThemes.yellow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl z-10 ${activeTheme}`}
        style={{
          fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif"
        }}
      >
        {/* Push Pin decoration at top */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-md border border-white/20 z-20">
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white/60 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          title="Tutup"
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 text-slate-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6 pt-4">
          {/* Full Message Body */}
          <div className="pr-2">
            <p className="text-xl sm:text-2xl font-bold leading-relaxed whitespace-pre-wrap text-left break-words text-slate-800">
              {message}
            </p>
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/10 text-sm opacity-85">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span>- {name || 'Anonim'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>{date || 'Baru'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center pt-2 select-none">
            {/* Love Button */}
            <button
              onClick={handleLove}
              disabled={loved}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${
                loved
                  ? 'bg-red-500 border-red-500 text-white shadow-red-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${loved ? 'fill-white text-white' : 'text-slate-400'}`} />
              <span>{loved ? loves + 1 : loves} Likes</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
