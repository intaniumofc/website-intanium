'use client';

import { useState, useEffect, useId, useCallback, useMemo, useRef, forwardRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import HTMLFlipBook from 'react-pageflip';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { comicPageService } from '../../services/public/comicPageService';

const DUMMY_PAGES = [
  { id: 'dummy-1', pageNumber: 1, imageUrl: '/cover.jpeg', caption: 'Cover Intan Shining Star' },
  { id: 'dummy-2', pageNumber: 2, imageUrl: null, caption: 'Awal Perjalanan' },
  { id: 'dummy-3', pageNumber: 3, imageUrl: null, caption: 'Panggung Pertama' },
  { id: 'dummy-4', pageNumber: 4, imageUrl: null, caption: 'Langkah Awal' },
  { id: 'dummy-5', pageNumber: 5, imageUrl: null, caption: 'Menjangkau Bintang' },
];

const emptySubscribe = () => () => { };
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function PlaceholderSVG({ label, variant = 'cover' }) {
  const svgId = useId();
  const isCover = variant === 'cover';
  const bgId = `bg-${svgId}`;
  const glowId = `glow-${svgId}`;

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      className="comic-flipbook-placeholder-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isCover ? '#1e1472' : '#15103d'} />
          <stop offset="100%" stopColor={isCover ? '#0d0825' : '#0a0620'} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(109,92,255,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${bgId})`} />
      <rect width="300" height="400" fill={`url(#${glowId})`} />

      {/* Decorative stars */}
      {[
        [60, 70, 3], [240, 90, 2], [150, 50, 4], [80, 320, 2], [220, 340, 3],
        [40, 200, 1.5], [260, 180, 2], [150, 360, 2.5], [100, 150, 1.5], [200, 130, 2],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(167,139,250,0.35)" />
      ))}

      {/* Center artwork */}
      <g transform="translate(150, 180)" opacity="0.2">
        {isCover ? (
          <>
            <polygon points="0,-40 9,-12 40,-12 15,6 24,36 0,18 -24,36 -15,6 -40,-12 -9,-12" fill="#a78bfa" />
            <text y="60" textAnchor="middle" fill="#a78bfa" fontSize="11" fontFamily="sans-serif" fontWeight="700">COVER</text>
          </>
        ) : (
          <>
            <rect x="-30" y="-40" width="60" height="80" rx="4" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <line x1="-20" y1="-20" x2="20" y2="-20" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
            <line x1="-20" y1="-8" x2="10" y2="-8" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
            <line x1="-20" y1="4" x2="15" y2="4" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
            <circle cx="10" cy="22" r="6" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
          </>
        )}
      </g>

      {/* Bottom label */}
      <text
        x="150"
        y="375"
        textAnchor="middle"
        fill="rgba(209,200,240,0.35)"
        fontSize="11"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        {label}
      </text>
    </svg>
  );
}

function PageImage({ page, alt, isCover = false }) {
  if (!page && !isCover) return <div className="comic-flipbook-empty" />;
  const imgUrl = page?.imageUrl || (isCover ? '/cover.jpeg' : null);
  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={alt || page?.caption || `Halaman ${page?.pageNumber || 1}`}
        draggable="false"
        className="comic-page-img object-contain object-center w-full h-full max-h-full mx-auto my-auto"
      />
    );
  }
  return <PlaceholderSVG label={page?.caption || `Halaman ${page?.pageNumber || 1}`} variant={isCover ? 'cover' : 'page'} />;
}

const ComicFlipPage = forwardRef(function ComicFlipPage(
  { page, pageNum, totalPages, isCoverPage },
  ref
) {
  return (
    <div className={`comic-page-flip-item ${isCoverPage ? 'is-cover-page' : ''}`} ref={ref}>
      <PageImage page={page} isCover={isCoverPage} alt={isCoverPage ? 'Cover Komik' : `Halaman ${pageNum}`} />
      <div className="comic-page-number-tag">
        {isCoverPage ? 'Cover' : `${pageNum} / ${totalPages}`}
      </div>
    </div>
  );
});

export default function ComicFlipbook() {
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isClient = useIsClient();
  const flipBookRef = useRef(null);
  const fullscreenFlipBookRef = useRef(null);

  useEffect(() => {
    let active = true;
    comicPageService
      .getPages()
      .then((data) => {
        if (active) {
          setPages(data && data.length > 0 ? data : DUMMY_PAGES);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed loading comic pages:', err);
        if (active) {
          setPages(DUMMY_PAGES);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll & listen ESC key in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsFullscreen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullscreen]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (isFullscreen) {
      fullscreenFlipBookRef.current?.pageFlip()?.flipPrev();
    } else {
      flipBookRef.current?.pageFlip()?.flipPrev();
    }
  }, [isFullscreen]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (isFullscreen) {
      fullscreenFlipBookRef.current?.pageFlip()?.flipNext();
    } else {
      flipBookRef.current?.pageFlip()?.flipNext();
    }
  }, [isFullscreen]);

  const [flipping3DClass, setFlipping3DClass] = useState('');

  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    if (currentPageIndex === 0) return;

    const targetRef = isFullscreen ? fullscreenFlipBookRef : flipBookRef;
    const animClass = 'comic-3d-flipping-backward';
    setFlipping3DClass(animClass);

    setTimeout(() => {
      setCurrentPageIndex(0);
      targetRef.current?.pageFlip()?.turnToPage(0);
    }, 200);

    setTimeout(() => {
      setFlipping3DClass('');
    }, 450);
  }, [isFullscreen, currentPageIndex]);

  const handleJumpToPage = useCallback((index) => {
    if (index === currentPageIndex) return;

    const targetRef = isFullscreen ? fullscreenFlipBookRef : flipBookRef;
    setCurrentPageIndex(index);

    try {
      targetRef.current?.pageFlip()?.turnToPage(index);
    } catch (err) {
      console.warn('pageFlip turnToPage exception:', err);
    }
  }, [isFullscreen, currentPageIndex]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chapters = useMemo(() => {
    if (!pages || !pages.length) return [];
    const map = new Map();
    pages.forEach((p, idx) => {
      const chNum = Number(p.chapterNumber) || 1;
      const chTitle = p.chapterTitle ? `: ${p.chapterTitle}` : '';
      const key = `ch-${chNum}`;
      if (!map.has(key)) {
        map.set(key, {
          chapterNumber: chNum,
          chapterTitle: p.chapterTitle || `Chapter ${chNum}`,
          firstPageIndex: idx,
          label: `Chapter ${chNum}${chTitle}`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [pages]);

  const currentChapter = useMemo(() => {
    if (!chapters.length) return null;
    let active = chapters[0];
    for (const ch of chapters) {
      if (currentPageIndex >= ch.firstPageIndex) {
        active = ch;
      }
    }
    return active;
  }, [chapters, currentPageIndex]);

  if (loading || !isClient) {
    return (
      <div className="comic-standalone-wrap">
        <div className="comic-flipbook-loading" role="status">
          <Loader2 className="comic-flipbook-spinner animate-spin" aria-hidden="true" />
          <span>Memuat komik...</span>
        </div>
      </div>
    );
  }

  const getPageIndicatorText = () => {
    const totalPages = pages.length - 1;
    if (currentPageIndex === 0) return 'Sampul Depan (Cover)';

    if (isMobile) {
      return `Halaman ${currentPageIndex} dari ${totalPages}`;
    }

    const secondPage = Math.min(currentPageIndex + 1, totalPages);
    if (secondPage > currentPageIndex && secondPage <= totalPages) {
      return `Halaman ${currentPageIndex} - ${secondPage} dari ${totalPages}`;
    }
    return `Halaman ${currentPageIndex} dari ${totalPages}`;
  };

  const renderFullscreenModal = () => {
    if (!isFullscreen) return null;

    const modalContent = (
      <div className="comic-fullscreen-modal fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-4 text-white animate-in fade-in duration-300 h-screen max-h-screen overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto pb-2.5 border-b border-white/20 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border rounded-md shadow-sm bg-pink-100 text-pink-800 border-pink-300 shrink-0">
              Arsip Komik
            </span>
            <span className="font-black text-xs sm:text-sm md:text-base text-white tracking-tight flex items-center gap-1.5 truncate">
              <BookOpen className="h-4 w-4 text-pink-400 shrink-0" />
              <span className="truncate">Arsip Komik Digital</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Chapter Selection Dropdown */}
            {chapters.length > 0 && (
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md border border-white/20">
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider hidden sm:inline">Chapter:</span>
                <select
                  value={currentChapter?.chapterNumber || 1}
                  onChange={(e) => {
                    const targetCh = chapters.find(c => c.chapterNumber === Number(e.target.value));
                    if (targetCh) handleJumpToPage(targetCh.firstPageIndex);
                  }}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {chapters.map((ch) => (
                    <option key={ch.chapterNumber} value={ch.chapterNumber} className="bg-slate-900 text-white">
                      {ch.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <span className="text-xs font-bold text-white/90 bg-black/60 px-3 py-1 rounded-md border border-white/20 hidden xs:inline-block">
              {getPageIndicatorText()}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="w-9 h-9 bg-black/60 hover:bg-black/85 text-white border border-white/20 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-105 active:scale-95"
              title="Tutup (ESC)"
              aria-label="Tutup layar penuh"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Main Stage */}
        <div className="flex-1 flex items-center justify-center relative my-1 overflow-hidden w-full min-h-0 px-2 sm:px-12">
          {/* Prev Nav Button */}
          <button
            type="button"
            className="absolute left-2 sm:left-4 z-30 p-2 sm:p-3 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            onClick={handlePrev}
            disabled={currentPageIndex === 0}
            title="Halaman Sebelumnya"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Fullscreen HTMLFlipBook - Centered Single-Page Height-Fit View */}
          <div className={`comic-fullscreen-pages-frame flex-1 flex items-center justify-center overflow-hidden relative w-full h-full my-auto py-1 ${flipping3DClass}`}>
            <div className="comic-fullscreen-book-container relative flex items-center justify-center h-full w-full mx-auto">
              <HTMLFlipBook
                ref={fullscreenFlipBookRef}
                width={460}
                height={660}
                size="stretch"
                minWidth={240}
                maxWidth={700}
                minHeight={340}
                maxHeight={900}
                showCover={false}
                drawShadow={true}
                maxShadowOpacity={0.3}
                flippingTime={500}
                usePortrait={true}
                startPage={currentPageIndex}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                className="comic-html-flipbook-single mx-auto shadow-2xl rounded-xl"
                onFlip={(e) => {
                  setCurrentPageIndex(e.data);
                }}
              >
                {pages.map((p, idx) => (
                  <ComicFlipPage
                    key={p.id || idx}
                    page={p}
                    pageNum={idx === 0 ? 'Cover' : idx}
                    totalPages={pages.length - 1}
                    isCoverPage={idx === 0}
                  />
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Next Nav Button */}
          <button
            type="button"
            className="absolute right-2 sm:right-4 z-30 p-2 sm:p-3 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleNext}
            disabled={currentPageIndex >= pages.length - 1}
            title="Halaman Berikutnya"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Modal Bottom Footer & Thumbnail List Page Strip */}
        <div className="w-full max-w-6xl mx-auto space-y-2 pt-2 border-t border-white/20 shrink-0">
          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={currentPageIndex === 0}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-white/20 bg-black/50 hover:bg-black/80 text-white flex items-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Ke Sampul</span>
            </button>

            <span className="hidden sm:inline-block text-xs text-white/80 font-medium">
              Tarik sudut halaman atau gunakan tombol panah untuk membaca
            </span>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3.5 py-1.5 text-xs font-extrabold text-white rounded-xl bg-[var(--color-pink)] hover:bg-[var(--color-iris-pink-dark)] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Keluar Fullscreen</span>
            </button>
          </div>

          {/* Page List / Thumbnail Strip */}
          <div className="comic-thumbnail-strip flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
            {pages.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => handleJumpToPage(idx)}
                className={`comic-thumbnail-item group relative rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${currentPageIndex === idx
                    ? 'border-pink-400 scale-105 shadow-md shadow-pink-500/40 ring-2 ring-pink-400/50'
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                  }`}
                title={idx === 0 ? 'Ke Sampul' : `Halaman ${idx}`}
              >
                {p.imageUrl || idx === 0 ? (
                  <img
                    src={p.imageUrl || '/cover.jpeg'}
                    alt={`Halaman ${idx}`}
                    className="w-9 h-12 sm:w-11 sm:h-14 object-cover"
                  />
                ) : (
                  <div className="w-9 h-12 sm:w-11 sm:h-14 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {idx === 0 ? 'Cover' : idx}
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-bold text-center py-0.5 text-pink-200">
                  {idx === 0 ? 'Cover' : idx}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    if (mounted && typeof document !== 'undefined') {
      return createPortal(modalContent, document.body);
    }
    return null;
  };

  return (
    <>
      {/* Stand-Alone Inline Comic View */}
      <div className="comic-standalone-wrap relative flex flex-col items-center justify-center py-2 sm:py-4">
        <div
          onClick={() => setIsFullscreen(true)}
          className="comic-cover-trigger group relative cursor-pointer flex flex-col items-center justify-center transition-all duration-300"
          title="Klik untuk membuka komik digital di Layar Penuh"
        >
          {/* Card Container with Soft Purple Backdrop Glow */}
          <div className="comic-cover-preview-card relative w-[280px] sm:w-[340px] md:w-[380px] aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(76,29,149,0.35),0_0_50px_10px_rgba(192,132,252,0.15)] border border-slate-200/60 bg-white transition-all duration-300 mx-auto">
            <PageImage page={pages[0]} isCover={true} alt="Cover Komik Intan Shining Star" />

            {/* Bottom Right "Cover" Pill Badge */}
            <div className="absolute bottom-3.5 right-3.5 z-20">
              <span className="px-4 py-1.5 text-xs font-bold text-white bg-[#261f47]/85 border border-white/20 rounded-full shadow-lg backdrop-blur-md select-none tracking-wide">
                Cover
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View via Portal */}
      {renderFullscreenModal()}
    </>
  );
}
