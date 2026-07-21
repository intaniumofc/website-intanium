'use client';

import { useState, useEffect, useId, useCallback, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Loader2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
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
    return <img src={imgUrl} alt={alt || page?.caption || `Halaman ${page?.pageNumber || 1}`} draggable="false" />;
  }
  return <PlaceholderSVG label={page?.caption || `Halaman ${page?.pageNumber || 1}`} variant={isCover ? 'cover' : 'page'} />;
}

export default function ComicFlipbook() {
  const [pages, setPages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isClient = useIsClient();

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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

  const coverPage = pages[0] || DUMMY_PAGES[0];
  const innerPages = pages.slice(1);

  const spreads = [];
  for (let i = 0; i < innerPages.length; i += 2) {
    spreads.push({
      left: innerPages[i] || null,
      right: innerPages[i + 1] || null,
    });
  }

  const totalSpreads = Math.max(1, spreads.length);
  const currentSpread = spreads[spreadIndex] || { left: null, right: null };

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setSpreadIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
  }, [totalSpreads]);

  const handleClose = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setSpreadIndex(0);
    setIsFullscreen(false);
  }, []);

  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    setSpreadIndex(0);
  }, []);

  const toggleFullscreen = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsFullscreen((prev) => !prev);
  }, []);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleNext();
      } else if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Home') {
        setSpreadIndex(0);
      } else if (e.key === 'End') {
        setSpreadIndex(totalSpreads - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handlePrev, handleNext, handleClose, totalSpreads]);

  // Touch Swipe Gesture
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && spreadIndex < totalSpreads - 1) {
      handleNext();
    } else if (isSwipeRight && spreadIndex > 0) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <div className="comic-flipbook-wrap">
        <div className="comic-flipbook-loading" role="status">
          <Loader2 className="comic-flipbook-spinner animate-spin" aria-hidden="true" />
          <span>Memuat komik...</span>
        </div>
      </div>
    );
  }

  // Determine current readable page numbers for display indicator
  const getPageRangeLabel = () => {
    if (!isOpen) return '';
    const leftNum = currentSpread.left?.pageNumber;
    const rightNum = currentSpread.right?.pageNumber;
    if (leftNum && rightNum) return `Hal. ${leftNum} - ${rightNum} dari ${pages.length}`;
    if (leftNum) return `Hal. ${leftNum} dari ${pages.length}`;
    if (rightNum) return `Hal. ${rightNum} dari ${pages.length}`;
    return `Lembar ${spreadIndex + 1} dari ${totalSpreads}`;
  };

  return (
    <div className="comic-flipbook-wrap">
      {/* Cover Preview (Trigger Button) */}
      <div
        className="comic-flipbook"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label="Klik untuk membaca Komik Intan Shining Star"
      >
        <div className="comic-flipbook-cover">
          <div className="comic-flipbook-page">
            <PageImage page={coverPage} alt="Cover Komik Intan Shining Star" isCover />
          </div>
          <div className="comic-flipbook-spine" />
          <div className="comic-flipbook-hint">
            <BookOpen className="comic-flipbook-hint-icon" />
            <span>Klik untuk membuka komik</span>
            <Sparkles className="comic-flipbook-sparkle" />
          </div>
        </div>
      </div>

      {/* Modal View rendered via Portal to avoid 3D perspective / stacking blur bugs */}
      {isOpen && isClient && createPortal(
        <div className={`comic-flipbook-modal-portal ${isFullscreen ? 'is-fullscreen' : ''}`}>
          {/* Backdrop overlay */}
          <div
            className="comic-flipbook-backdrop"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Spread Dialog Container */}
          <div
            className="comic-flipbook-spread"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Pembaca Komik Flipbook"
          >
            {/* Top Bar Controls */}
            <div className="comic-flipbook-topbar">
              <div className="comic-flipbook-title-tag">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span>Arsip Cahaya Intan</span>
              </div>
              <div className="comic-flipbook-top-actions">
                <button
                  type="button"
                  className="comic-flipbook-action-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                  aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  className="comic-flipbook-action-btn comic-flipbook-close-btn"
                  onClick={handleClose}
                  title="Tutup (Esc)"
                  aria-label="Tutup komik"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Book Pages Container */}
            <div className="comic-flipbook-stage">
              <button
                type="button"
                className="comic-flipbook-nav comic-flipbook-prev"
                onClick={handlePrev}
                disabled={spreadIndex === 0}
                aria-label="Halaman sebelumnya"
                title="Halaman sebelumnya (Panah Kiri)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="comic-flipbook-pages">
                <div className="comic-flipbook-page comic-flipbook-page-left">
                  {currentSpread.left ? (
                    <PageImage page={currentSpread.left} alt={`Halaman ${currentSpread.left.pageNumber}`} />
                  ) : (
                    <div className="comic-flipbook-empty" />
                  )}
                </div>
                <div className="comic-flipbook-page-divider" />
                <div className="comic-flipbook-page comic-flipbook-page-right">
                  {currentSpread.right ? (
                    <PageImage page={currentSpread.right} alt={`Halaman ${currentSpread.right.pageNumber}`} />
                  ) : (
                    <div className="comic-flipbook-empty" />
                  )}
                </div>
              </div>

              <button
                type="button"
                className="comic-flipbook-nav comic-flipbook-next"
                onClick={handleNext}
                disabled={spreadIndex >= totalSpreads - 1}
                aria-label="Halaman berikutnya"
                title="Halaman berikutnya (Panah Kanan)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="comic-flipbook-controls">
              <button
                type="button"
                className="comic-flipbook-control-btn"
                onClick={handleReset}
                disabled={spreadIndex === 0}
                title="Kembali ke awal"
                aria-label="Kembali ke lembar awal"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Awal</span>
              </button>

              <span className="comic-flipbook-page-indicator">
                {getPageRangeLabel()}
              </span>

              <button
                type="button"
                className="comic-flipbook-control-btn comic-flipbook-close-text-btn"
                onClick={handleClose}
                aria-label="Tutup pembaca komik"
              >
                <X className="h-3.5 w-3.5" />
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


