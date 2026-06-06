import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import {
  Sparkles,
  Users,
  Heart,
  Lock,
  ShieldCheck,
  ArrowRight,
  Edit3,
  Info,
  Compass,
  MessageSquare,
  X
} from 'lucide-react';
import { ROUTES } from '../../lib/constants';
import { madingService } from './madingService';
import './MadingPreviewSection.css';

// Inline Banner component mapping user-provided specs
const bannerVariants = cva(
  "relative w-full",
  {
    variants: {
      variant: {
        default: "bg-background border border-border",
        muted: "dark bg-muted",
        border: "border-b border-border",
      },
      size: {
        sm: "px-4 py-2",
        default: "px-4 py-3",
        lg: "px-4 py-3 md:py-2",
      },
      rounded: {
        none: "",
        default: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "none",
    }
  }
);

const Banner = React.forwardRef(
  ({ className, variant, size, rounded, icon, action, onClose, isClosable, layout = "row", children, ...props }, ref) => {
    const innerContent = (
      <div className={cn(
        "flex gap-2",
        layout === "center" && "justify-center",
        layout === "complex" && "md:items-center"
      )}>
        {layout === "complex" ? (
          <div className="flex grow gap-3 md:items-center">
            {icon && (
              <div className="flex shrink-0 items-center gap-3 max-md:mt-0.5">
                {icon}
              </div>
            )}
            <div className={cn(
              "flex grow",
              layout === "complex" && "flex-col justify-between gap-3 md:flex-row md:items-center"
            )}>
              {children}
            </div>
          </div>
        ) : (
          <>
            {icon && (
              <div className="flex shrink-0 items-center gap-3">
                {icon}
              </div>
            )}
            <div className="flex grow items-center justify-between gap-3">
              {children}
            </div>
          </>
        )}
        {(action || isClosable) && (
          <div className="flex items-center gap-3">
            {action}
            {isClosable && (
              <Button
                variant="ghost"
                className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                onClick={onClose}
                aria-label="Close banner"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {innerContent}
      </div>
    );
  }
);
Banner.displayName = "Banner";




// Animation Variants matching easing and durations
const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const headingItemVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const ctaCardVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const boardVariant = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const noteVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.95, rotate: 0 },
  visible: (rotateVal) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: rotateVal,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const sparkleTwinkle = {
  animate: {
    opacity: [0.3, 1, 0.3],
    scale: [0.85, 1.15, 0.85],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatAnimation = {
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function MadingPreviewSection() {
  const [allNotes, setAllNotes] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    madingService.getNotes(true) // Fetch approved notes only
      .then((data) => {
        const mapped = data.map((note, idx) => {
          const noteId = note.id;
          
          const savedLoves = JSON.parse(localStorage.getItem('mading_loves') || '{}');
          let loves = savedLoves[noteId];
          if (loves === undefined) {
            loves = (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 28) + 5;
          }

          const dateObj = new Date(note.createdAt);
          const formattedDate = isNaN(dateObj.getTime())
            ? 'Baru'
            : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

          return {
            id: noteId,
            author: note.name || 'Anonim',
            message: note.message,
            theme: note.themeColor || 'yellow',
            loves: loves,
            date: formattedDate,
            rotate: (Math.abs(noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 7) - 3,
            pin: ['pink', 'blue', 'yellow'][idx % 3],
            tape: idx % 4 === 2 ? 'washi' : null
          };
        });
        setAllNotes(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setAllNotes([]);
        setIsLoading(false);
      });
  }, []);

  // Timer to roll/shift the notes by 1 index every 5 seconds if there are more than 12 notes
  useEffect(() => {
    if (allNotes.length <= 12) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % allNotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allNotes.length]);

  // Compute the 12 displayed notes with wrapping around using modulo
  const displayedNotes = useMemo(() => {
    if (allNotes.length <= 12) return allNotes;

    const sliced = [];
    for (let i = 0; i < 12; i++) {
      const idx = (startIndex + i) % allNotes.length;
      sliced.push(allNotes[idx]);
    }
    return sliced;
  }, [allNotes, startIndex]);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionVariant}
      className="mading-preview-section py-16 px-4 md:px-8 max-w-[1440px] mx-auto relative overflow-hidden"
    >

      {/* Main Header Container: Title and CTA Link */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 mb-8 select-none">

        {/* Left Side: Title and Paragraph */}
        <motion.div variants={staggerContainer} className="space-y-1 text-left">
          <motion.h3
            variants={headingItemVariant}
            className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight flex items-center gap-2"
          >
            Mading Intanium <MessageSquare className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
          </motion.h3>

          <motion.p
            variants={headingItemVariant}
            className="text-xs text-[var(--text-secondary)]"
          >
            Ruang bebas untuk berbagi pesan, apresiasi, ide, atau dukungan untuk Nur Intan. Setiap kata di sini adalah bagian dari kebersamaan kita.
          </motion.p>
        </motion.div>

        {/* Right Side: Link CTA */}
        <motion.div variants={ctaCardVariant}>
          <Link
            to={ROUTES.MADING}
            className="text-xs font-bold text-[var(--color-primary-hover)] hover:underline flex items-center gap-1 cursor-pointer pb-0.5 transition-all group"
          >
            Buka Mading <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Main Corkboard */}
      <motion.div
        variants={boardVariant}
        className="corkboard-outer shadow-2xl relative overflow-hidden"
      >
        <div className="corkboard-bevel-frame">
          <div className="corkboard-surface p-6 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 justify-center items-stretch relative">

            {/* Banner Tape di atas tengah */}
            <div className="corkboard-banner">
              <span className="banner-washi left"></span>
              <div className="banner-paper">
                <span>Mading Intanium</span>
              </div>
              <span className="banner-washi right"></span>
            </div>

            {/* Butterfly Badge di atas kanan */}
            <div className="butterfly-pin-badge">
              <div className="butterfly-pin-circle">🦋</div>
            </div>

            {/* Sticky Notes Grid */}
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700" />
              </div>
            ) : allNotes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm font-semibold text-slate-700 font-sans">
                Belum ada pesan pendukung yang disetujui untuk ditampilkan.
              </div>
            ) : (
              displayedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  custom={note.rotate}
                  variants={noteVariant}
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    rotate: note.rotate * 0.15, // Flatten slightly but natural
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)"
                  }}
                  className={`sticky-note-item pastel-${note.theme} ${note.tape ? 'has-tape' : ''}`}
                >
                  {/* Render Pin or Washi tape */}
                  {note.tape ? (
                    <div className={`note-washi-tape ${note.tape}`}></div>
                  ) : (
                    <div className={`note-push-pin ${note.pin}`}></div>
                  )}

                  {/* Content */}
                  <div className="note-content flex flex-col justify-between h-full pt-4 pb-2 px-1">
                    <p className="note-text text-sm font-semibold text-slate-800 leading-relaxed text-left flex-grow">
                      {note.message}
                    </p>

                    {/* Footer metadata */}
                    <div className="note-footer flex justify-between items-center mt-4 pt-1.5 border-t border-black/5 text-[10px] text-slate-600 font-bold select-none">
                      <div className="flex flex-col truncate max-w-[65%] text-left">
                        <span className="note-author truncate">
                          - {note.author}
                        </span>
                        <span className="text-slate-500 font-semibold text-[8px] mt-0.5">
                          {note.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-slate-500 font-bold">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                        <span>{note.loves}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer Info Banner */}
      <div className="mt-6">
        <Banner
          variant="default"
          size="default"
          rounded="default"
          icon={<Info className="h-5.5 w-5.5 text-indigo-700 flex-shrink-0" />}
          className="bg-white border border-[var(--border-color)]"
        >
          <p className="text-xs text-[var(--text-secondary)] text-left leading-relaxed">
            Ini hanya preview. Untuk membaca semua pesan dan menambahkan pesanmu sendiri, kunjungi halaman <Link to={ROUTES.MADING} className="font-extrabold text-indigo-700 hover:underline">Mading Intanium ↗</Link>.
          </p>
        </Banner>
      </div>
    </motion.section>
  );
}
