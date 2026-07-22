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
  const isClient = useIsClient();
  const flipBookRef = useRef(null);

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

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const handleReset = useCallback((e) => {
    if (e) e.stopPropagation();
    flipBookRef.current?.pageFlip()?.flip(0);
  }, []);

  if (loading || !isClient) {
    return (
      <div className="comic-inline-container">
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
    <div className="comic-inline-container">
      {/* Header Info */}
      <div className="comic-inline-header">
        <div className="comic-inline-title">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <span>Komik Digital Intan</span>
        </div>
        <div className="comic-inline-hint">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Tarik / klik sudut halaman untuk membaca</span>
        </div>
      </div>

      {/* Main Single Page 3D Flipbook Stage */}
      <div className="comic-inline-stage">
        <button
          type="button"
          className="comic-flipbook-nav comic-flipbook-prev"
          onClick={handlePrev}
          disabled={currentPageIndex === 0}
          aria-label="Halaman sebelumnya"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="comic-inline-pages-frame">
          <HTMLFlipBook
            ref={flipBookRef}
            width={380}
            height={520}
            size="stretch"
            minWidth={260}
            maxWidth={500}
            minHeight={360}
            maxHeight={680}
            showCover={true}
            drawShadow={true}
            maxShadowOpacity={0.45}
            flippingTime={600}
            usePortrait={true}
            startPage={0}
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

        <button
          type="button"
          className="comic-flipbook-nav comic-flipbook-next"
          onClick={handleNext}
          disabled={currentPageIndex >= pages.length - 1}
          aria-label="Halaman berikutnya"
          title="Halaman berikutnya"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="comic-inline-controls">
        <button
          type="button"
          className="comic-flipbook-control-btn"
          onClick={handleReset}
          disabled={currentPageIndex === 0}
          title="Kembali ke awal"
          aria-label="Kembali ke sampul"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Ke Sampul</span>
        </button>

        <span className="comic-flipbook-page-indicator">
          {getPageIndicatorText()}
        </span>
      </div>
    </div>
  );
}

