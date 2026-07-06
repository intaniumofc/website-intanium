'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Sparkles, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const FALLBACK_HASHTAGS_ROW_1 = [
  { text: '#INTANIUM', count: '14.2K Tweets', explanation: 'Tagar resmi untuk fanclub Intan.' },
  { text: '#BerkilauIntan', count: '8.5K Tweets', explanation: 'Tagar untuk momen spesial yang berkilau.' },
  { text: '#IntanJKT48', count: '10.1K Tweets', explanation: 'Tagar umum untuk member JKT48 Nur Intan.' },
  { text: '#PermataIntan', count: '4.3K Tweets', explanation: 'Sebutan sayang untuk fans Intan.' },
  { text: '#MatchaVibes', count: '6.8K Tweets', explanation: 'Karena Intan suka matcha!' },
  { text: '#ShowTheaterIntan', count: '7.2K Tweets', explanation: 'Digunakan saat Intan perform di Theater JKT48.' }
];

const FALLBACK_HASHTAGS_ROW_2 = [
  { text: '#CahayaIntanium', count: '5.1K Tweets', explanation: 'Cahaya penyemangat dari fans.' },
  { text: '#IntanUntukDunia', count: '3.9K Tweets', explanation: 'Harapan agar Intan bersinar di kancah global.' },
  { text: '#WajibMatcha', count: '2.4K Tweets', explanation: 'Setiap momen harus ada matcha.' },
  { text: '#ChibiIntan', count: '4.8K Tweets', explanation: 'Sisi imut dari Intan.' },
  { text: '#IntanLevelUp', count: '9.2K Tweets', explanation: 'Dukungan untuk perkembangan Intan.' },
  { text: '#LoveIntan', count: '11.5K Tweets', explanation: 'Cinta tanpa batas untuk Intan.' }
];

export default function HomeHashtagsSection() {
  const [copiedText, setCopiedText] = useState(null);
  const [hashtagsR1, setHashtagsR1] = useState(FALLBACK_HASHTAGS_ROW_1);
  const [hashtagsR2, setHashtagsR2] = useState(FALLBACK_HASHTAGS_ROW_2);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const r1 = data.filter(h => h.row_number === 1);
        const r2 = data.filter(h => h.row_number === 2);
        
        if (r1.length > 0) setHashtagsR1(r1);
        if (r2.length > 0) setHashtagsR2(r2);
      }
    } catch (err) {
      console.error('Error fetching hashtags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHashtag = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleShareOnX = (e, text) => {
    e.stopPropagation();
    const message = `Ayo dukung Nur Intan dengan meramaikan tagar resmi! ${text} 🌟✨ @jkt48`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // We duplicate arrays to make infinite scroll smooth
  const doubleRow1 = [...hashtagsR1, ...hashtagsR1, ...hashtagsR1, ...hashtagsR1];
  const doubleRow2 = [...hashtagsR2, ...hashtagsR2, ...hashtagsR2, ...hashtagsR2];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-4 space-y-6 overflow-hidden">

      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 select-none px-4 sm:px-6">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight">
            #Tagar Populer INTANIUM
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Ayo ramaikan tagar resmi media sosial di bawah ini untuk mendukung setiap panggung dan karya Intan! (Klik tagar untuk info)
          </p>
        </div>
      </div>

      {/* Marquees */}
      <div className="space-y-4 py-2 relative">
        {/* Soft edge gradients for premium marquee fade-out */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />

        {/* Row 1 - Scroll Left */}
        <div className="flex w-full overflow-hidden select-none">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
            className="flex gap-4 shrink-0 pr-4"
          >
            {doubleRow1.map((hash, idx) => (
              <div
                key={`r1-${idx}`}
                onClick={() => setSelectedHashtag(hash)}
                className="bg-white border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[200px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold shrink-0">
                  ✨
                </div>
                <div className="flex-grow min-w-0">
                  <span className="font-extrabold text-sm text-slate-800 block truncate">{hash.text}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{hash.count}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={(e) => handleCopyHashtag(e, hash.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Salin Tagar"
                  >
                    {copiedText === hash.text ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleShareOnX(e, hash.text)}
                    className="p-1.5 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Posting di X"
                  >
                    <TwitterIcon />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Scroll Right */}
        <div className="flex w-full overflow-hidden select-none">
          <motion.div
            animate={{ x: [-1000, 0] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 28,
                ease: "linear",
              },
            }}
            className="flex gap-4 shrink-0 pr-4"
          >
            {doubleRow2.map((hash, idx) => (
              <div
                key={`r2-${idx}`}
                onClick={() => setSelectedHashtag(hash)}
                className="bg-white border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[200px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold shrink-0">
                  🍵
                </div>
                <div className="flex-grow min-w-0">
                  <span className="font-extrabold text-sm text-slate-800 block truncate">{hash.text}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{hash.count}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={(e) => handleCopyHashtag(e, hash.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Salin Tagar"
                  >
                    {copiedText === hash.text ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleShareOnX(e, hash.text)}
                    className="p-1.5 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Posting di X"
                  >
                    <TwitterIcon />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Interactive copy status toast message overlay */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-none">
        <motion.div
          animate={copiedText ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-slate-900 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl"
          style={{ display: copiedText ? 'flex' : 'none' }}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          Tagar {copiedText} berhasil disalin ke clipboard!
        </motion.div>
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {selectedHashtag && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedHashtag(null)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 overflow-hidden"
            >
              <button
                onClick={() => setSelectedHashtag(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] text-2xl shadow-inner">
                  #
                </div>
                
                <div>
                  <h4 className="text-xl font-extrabold text-slate-800 mb-1">
                    {selectedHashtag.text}
                  </h4>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                    {selectedHashtag.count}
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 w-full border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {selectedHashtag.explanation || "Belum ada penjelasan untuk tagar ini."}
                  </p>
                </div>
                
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={(e) => handleCopyHashtag(e, selectedHashtag.text)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    {copiedText === selectedHashtag.text ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" /> Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Salin Tagar
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleShareOnX(e, selectedHashtag.text)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-[#1DA1F2]/20"
                  >
                    <TwitterIcon className="text-white fill-white" /> Posting
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}

const TwitterIcon = ({ className = "text-slate-800 fill-current" }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
