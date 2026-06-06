import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';

const noteVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95, rotate: 0 },
  visible: (rotateVal) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rotateVal,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18
    }
  })
};

const rotations = [-3, 2, -1.5, 3, -2, 1.5, -1, 2.5];
const pins = ['pink', 'blue', 'yellow'];

export default function StickyNote({ note, index = 0, onClick, onDelete, className = '' }) {
  const { name, message, date, loves, color } = note;

  // Determine rotation
  const rotateVal = note.rotate !== undefined ? note.rotate : rotations[index % rotations.length];

  // Determine pin or tape decoration
  // 1 in 4 notes will have washi tape, others will have push pins
  const hasTape = index % 4 === 2;
  const tapeType = index % 8 === 2 ? 'washi' : 'washi-bottom';
  const pinColor = pins[index % pins.length];

  return (
    <motion.div
      custom={rotateVal}
      variants={noteVariant}
      whileHover={{
        y: -6,
        scale: 1.03,
        rotate: rotateVal * 0.15, // Flatten rotation slightly on hover for readability
        boxShadow: "0 15px 20px -5px rgba(0, 0, 0, 0.25), 0 6px 8px -5px rgba(0, 0, 0, 0.2)",
        zIndex: 30,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      onClick={() => onClick && onClick(note)}
      className={`sticky-note-item pastel-${color || 'yellow'} ${hasTape ? 'has-tape' : ''} cursor-pointer relative p-4 flex flex-col justify-between rounded shadow transition-shadow select-none h-full min-h-[170px] ${className}`}
    >
      {/* Decorative Washi Tape or Push Pin */}
      {hasTape ? (
        <div className={`note-washi-tape ${tapeType}`} />
      ) : (
        <div className={`note-push-pin ${pinColor}`} />
      )}

      {/* Content Area */}
      <div className="flex flex-col flex-grow text-left mt-2">
        {/* Message */}
        <p className="note-text text-sm font-bold text-slate-800 leading-relaxed break-words whitespace-pre-wrap flex-grow">
          {message}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="note-footer flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-[10px]">
        <div className="flex flex-col truncate max-w-[65%]">
          <span className="note-author font-extrabold text-slate-700 truncate">
            - {name || 'Anonim'}
          </span>
          <span className="text-slate-500 font-semibold text-[8px] mt-0.5">
            {date || 'Baru'}
          </span>
        </div>

        {/* Action info: Loves */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5 text-slate-600 bg-black/5 hover:bg-black/10 px-1.5 py-0.5 rounded-full transition-colors font-bold text-[9px]">
            <Heart className="h-2.5 w-2.5 text-red-500 fill-red-500" />
            <span>{loves || 0}</span>
          </div>
        </div>
      </div>

      {/* Admin Delete Action Overlay */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition-colors z-20 cursor-pointer"
          title="Hapus Pesan (Admin)"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}

