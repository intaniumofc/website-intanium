'use client';

import { useState, useEffect, useId, useCallback, useRef, forwardRef, useSyncExternalStore } from 'react';
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

const emptySubscribe = () => () => {};
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
        className="comic-page-img"
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

  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentPageIndex(0);
    if (isFullscreen) {
      fullscreenFlipBookRef.current?.pageFlip()?.flip(0);
    } else {
      flipBookRef.current?.pageFlip()?.flip(0);
    }
  }, [isFullscreen]);

  const handleJumpToPage = useCallback((index) => {
    setCurrentPageIndex(index);
    if (isFullscreen) {
      fullscreenFlipBookRef.current?.pageFlip()?.flip(index);
    } else {
      flipBookRef.current?.pageFlip()?.flip(index);
    }
  }, [isFullscreen]);

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
    if (currentPageIndex === 0) return 'Sampul Depan (Cover)';
    return `Halaman ${currentPageIndex} dari ${pages.length - 1}`;
  };

  return (
    <>
      {/* Stand-Alone Inline Comic View (No Card Container) */}
      <div className="comic-standalone-wrap relative">
        {/* Subtle Floating Glass Fullscreen Button (Icon Only) */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="comic-fullscreen-trigger-btn group"
          title="Tampilkan Layar Penuh (Fullscreen)"
          aria-label="Tampilkan Layar Penuh"
        >
          <Maximize2 className="h-4 w-4 text-purple-600 transition-transform group-hover:scale-110" />
        </button>

        {/* 3D Flipbook Stage (Pure Standalone Book - Scaled Up) */}
        <div className="comic-standalone-stage">
          <div className="comic-inline-pages-frame">
            <HTMLFlipBook
              ref={flipBookRef}
              width={460}
              height={640}
              size="stretch"
              minWidth={280}
              maxWidth={680}
              minHeight={380}
              maxHeight={920}
              showCover={true}
              drawShadow={true}
              maxShadowOpacity={0.45}
              flippingTime={600}
              usePortrait={true}
              startPage={currentPageIndex}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              className="comic-html-flipbook"
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
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="comic-fullscreen-modal fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 text-white animate-in fade-in duration-300">
          {/* Modal Header */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <span className="font-bold text-sm sm:text-base text-purple-100">#IntanShiningStar — Arsip Komik Digital</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-xs font-semibold text-purple-200/90 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                {getPageIndicatorText()}
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Tutup (ESC)"
                aria-label="Tutup layar penuh"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Stage */}
          <div className="flex-1 flex items-center justify-center relative my-2 overflow-hidden w-full">
            {/* Prev Nav Button */}
            <button
              type="button"
              className="absolute left-2 sm:left-6 z-30 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-purple-600/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              title="Halaman Sebelumnya"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            {/* Fullscreen HTMLFlipBook - Maximize Viewport Coverage */}
            <div className="comic-fullscreen-pages-frame w-full h-full flex items-center justify-center">
              <HTMLFlipBook
                ref={fullscreenFlipBookRef}
                width={560}
                height={780}
                size="stretch"
                minWidth={320}
                maxWidth={880}
                minHeight={440}
                maxHeight={1160}
                showCover={true}
                drawShadow={true}
                maxShadowOpacity={0.5}
                flippingTime={600}
                usePortrait={true}
                startPage={currentPageIndex}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                className="comic-html-flipbook"
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

            {/* Next Nav Button */}
            <button
              type="button"
              className="absolute right-2 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-purple-600/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleNext}
              disabled={currentPageIndex >= pages.length - 1}
              title="Halaman Berikutnya"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>

          {/* Modal Bottom Footer & Thumbnail List Page Strip */}
          <div className="w-full max-w-6xl mx-auto space-y-3 pt-3 border-t border-white/10 shrink-0">
            {/* Control Buttons Bar */}
            <div className="flex items-center justify-between px-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-200 flex items-center gap-2 border border-white/15 transition-all disabled:opacity-30 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Ke Sampul</span>
              </button>

              <span className="hidden sm:inline-block text-xs text-purple-300/70 font-medium">
                Tarik sudut halaman atau gunakan tombol panah untuk membaca
              </span>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Keluar Fullscreen</span>
              </button>
            </div>

            {/* Page List / Thumbnail Strip */}
            <div className="comic-thumbnail-strip flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto py-2 px-1 scrollbar-none">
              {pages.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => handleJumpToPage(idx)}
                  className={`comic-thumbnail-item group relative rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    currentPageIndex === idx
                      ? 'border-purple-400 scale-105 shadow-md shadow-purple-500/40 ring-2 ring-purple-400/50'
                      : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                  }`}
                  title={idx === 0 ? 'Ke Sampul' : `Halaman ${idx}`}
                >
                  {p.imageUrl || idx === 0 ? (
                    <img
                      src={p.imageUrl || '/cover.jpeg'}
                      alt={`Halaman ${idx}`}
                      className="w-10 h-14 sm:w-12 sm:h-16 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {idx === 0 ? 'Cover' : idx}
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-bold text-center py-0.5 text-purple-200">
                    {idx === 0 ? 'Cover' : idx}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
