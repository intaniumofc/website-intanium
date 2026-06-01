import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, MessageSquare, Sparkles } from 'lucide-react';
import Card from '../../components/common/Card';

const HASHTAGS_ROW_1 = [
  { text: '#INTANIUM', count: '14.2K Tweets' },
  { text: '#BerkilauIntan', count: '8.5K Tweets' },
  { text: '#IntanJKT48', count: '10.1K Tweets' },
  { text: '#PermataIntan', count: '4.3K Tweets' },
  { text: '#MatchaVibes', count: '6.8K Tweets' },
  { text: '#ShowTheaterIntan', count: '7.2K Tweets' }
];

const HASHTAGS_ROW_2 = [
  { text: '#CahayaIntanium', count: '5.1K Tweets' },
  { text: '#IntanUntukDunia', count: '3.9K Tweets' },
  { text: '#WajibMatcha', count: '2.4K Tweets' },
  { text: '#ChibiIntan', count: '4.8K Tweets' },
  { text: '#IntanLevelUp', count: '9.2K Tweets' },
  { text: '#LoveIntan', count: '11.5K Tweets' }
];

export default function HomeHashtagsSection() {
  const [copiedText, setCopiedText] = useState(null);

  const handleCopyHashtag = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const handleShareOnX = (text) => {
    const message = `Ayo dukung Nur Intan dengan meramaikan tagar resmi! ${text} 🌟✨ @jkt48`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // We duplicate arrays to make infinite scroll smooth
  const doubleRow1 = [...HASHTAGS_ROW_1, ...HASHTAGS_ROW_1, ...HASHTAGS_ROW_1];
  const doubleRow2 = [...HASHTAGS_ROW_2, ...HASHTAGS_ROW_2, ...HASHTAGS_ROW_2];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-4 space-y-6 overflow-hidden">

      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 select-none">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight">
            #Tagar Populer INTANIUM
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Ayo ramaikan tagar resmi media sosial di bawah ini untuk mendukung setiap panggung dan karya Intan!
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
                className="bg-white border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[200px]"
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
                    onClick={() => handleCopyHashtag(hash.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Salin Tagar"
                  >
                    {copiedText === hash.text ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleShareOnX(hash.text)}
                    className="p-1.5 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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
                className="bg-white border border-[var(--border-color)] rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[200px]"
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
                    onClick={() => handleCopyHashtag(hash.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Salin Tagar"
                  >
                    {copiedText === hash.text ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleShareOnX(hash.text)}
                    className="p-1.5 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
        <motion.div
          animate={copiedText ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none bg-slate-900 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl"
          style={{ display: copiedText ? 'flex' : 'none' }}
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          Tagar {copiedText} berhasil disalin ke clipboard!
        </motion.div>
      </div>

    </section>
  );
}

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
