import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Sparkles, RefreshCw, MailOpen, Mail } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const PESAN_LIST = [
  "Semangat untuk hari ini! Kamu sudah berusaha dengan sangat baik. Ingat, kamu adalah permata yang selalu berkilau di mataku! ✨",
  "Jangan lupa minum air putih ya hari ini! Kalau lelah, istirahat sejenak sambil minum es matcha latte kesukaan kita~ 🍵",
  "Hari ini mungkin terasa berat, tapi ingat kalau awan mendung pasti akan berganti menjadi langit biru cerah. Aku selalu mendukungmu! 💙",
  "Ayo semangat belajarnya/kerjanya! Nanti malam kita ketemu lagi di live stream ya, aku tunggu ceritamu! 🎶",
  "Sudah sarapan belum? Jangan sampai telat makan ya, kesehatanmu itu nomor satu bagi komunitas INTANIUM! 🍳",
  "Kalau hari ini kamu merasa lelah, coba dengerin lagu lofi kesukaan kita sebentar. Tarik napas dalam-dalam, tenangkan pikiranmu. You're doing great! 🌸"
];

export default function HomePesanSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleOpenLetter = () => {
    if (!isOpen) {
      setIsOpen(true);
      setCurrentIdx(Math.floor(Math.random() * PESAN_LIST.length));
    }
  };

  const handleNextMessage = (e) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * PESAN_LIST.length);
      } while (nextIdx === currentIdx && PESAN_LIST.length > 1);
      
      setCurrentIdx(nextIdx);
      setIsRotating(false);
    }, 300);
  };

  const handleCopyMessage = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(PESAN_LIST[currentIdx]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-4 space-y-6">
      
      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 select-none">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight flex items-center gap-2">
            Pesan dari Intan <Heart className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)] animate-pulse" />
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Dapatkan surat semangat harian langsung yang ditulis spesial oleh Intan.
          </p>
        </div>
      </div>

      {/* Interactive Letter Box Card */}
      <div className="flex justify-center items-center py-6 select-none">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* Envelope Closed State */
              <motion.div
                key="closed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.4 }}
                onClick={handleOpenLetter}
                className="cursor-pointer"
              >
                <Card 
                  hoverEffect={true}
                  className="bg-gradient-to-br from-[#345B8B] to-[#4A7ABF] border-2 border-white/20 p-8 sm:p-12 text-center text-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-6 min-h-[300px] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Glowing letter icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  >
                    <Mail className="w-10 h-10 stroke-[1.5]" />
                  </motion.div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-full bg-white/20 text-white border border-white/10 select-none">
                      <Sparkles className="h-3 w-3 text-[#FFE285] fill-[#FFE285]" /> Surat Baru Menunggumu
                    </span>
                    <h4 className="font-extrabold text-lg sm:text-xl">
                      Ada surat penyemangat dari Intan!
                    </h4>
                    <p className="text-xs text-white/80 max-w-sm mx-auto leading-relaxed">
                      Ketuk kartu ini untuk membuka surat amplop digital dan temukan pesan penyemangat harimu.
                    </p>
                  </div>

                  <div className="bg-white text-[var(--color-primary)] font-black text-[10px] tracking-wider px-6 py-3 rounded-full flex items-center gap-2 shadow-md group-hover:scale-105 active:scale-95 transition-all select-none">
                    BUKA SURAT SEKARANG
                    <MailOpen className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </motion.div>
            ) : (
              /* Envelope Opened Letter Sheet State */
              <motion.div
                key="opened"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
              >
                <Card 
                  padding="none"
                  className="bg-[#FFFDF6] border-2 border-[#EADFC9] rounded-[2rem] shadow-xl overflow-hidden min-h-[320px] flex flex-col justify-between relative"
                >
                  {/* Grid Lines Pattern for letter notebook aesthetic */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" 
                    style={{
                      backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px)',
                      backgroundSize: '100% 28px',
                      backgroundPosition: '0 8px'
                    }} 
                  />

                  {/* Red margin line on the left of notebook */}
                  <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-red-200 pointer-events-none" />

                  {/* Header info */}
                  <div className="relative z-10 p-6 pb-2 border-b border-[#EADFC9]/60 flex justify-between items-center bg-[#FFFDF6]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-extrabold text-xs">
                        💌
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-extrabold tracking-widest text-[var(--color-primary)] block">Pesan Semangat</span>
                        <span className="font-serif italic text-xs text-slate-500">Dari: Nur Intan</span>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-full">
                      Hari Ini ✨
                    </span>
                  </div>

                  {/* Message body with custom handwriting style */}
                  <div className="relative z-10 p-8 sm:p-10 flex-grow flex items-center justify-center">
                    <motion.p
                      animate={{ opacity: isRotating ? 0 : 1, y: isRotating ? 10 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-base sm:text-lg md:text-xl font-serif text-slate-800 text-center leading-relaxed font-semibold italic max-w-md"
                    >
                      "{PESAN_LIST[currentIdx]}"
                    </motion.p>
                  </div>

                  {/* Footer actions */}
                  <div className="relative z-10 p-5 bg-[#FBF8F0] border-t border-[#EADFC9]/60 flex flex-wrap gap-3 items-center justify-between">
                    <button
                      onClick={handleCopyMessage}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 active:scale-95 transition-all text-xs font-bold cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <span className="text-[var(--color-primary)]">Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Surat</span>
                        </>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={handleNextMessage}
                        disabled={isRotating}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm active:scale-95 disabled:opacity-50 transition-all text-xs font-black cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                        <span>Buka Surat Lain</span>
                      </button>

                      <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-sm"
                      >
                        <span>Tutup</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
