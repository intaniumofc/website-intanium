'use client';

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Book from './Book';
import { monthlyRecaps } from './monthlyRecaps';
import { recapService } from '../../services/public/recapService';
import Loading from '../../components/common/Loading';
import './RecapBookPage.css';

const ActivityPage = forwardRef(function ActivityPage({ recap, pageNumber }, ref) {
  return (
    <article className="recap-page recap-page--left" ref={ref}>
      <div className="recap-page__inner">
        <span className="recap-page__chapter">Chapter {String(pageNumber).padStart(2, '0')}</span>
        <h2 className="recap-page__title">{recap.month} {recap.year}</h2>
        <p className="recap-page__subtitle">{recap.theme} · Activity Recap</p>
        <RecapSection title="01 / Theater Activity" badge={`${recap.left.theater.total} Shows`}>
          <ul className="recap-list">
            {recap.left.theater.items.map((item) => (
              <li key={`${recap.id}-${item.date}`}>
                <time>{item.date}</time>
                <strong>{item.title}</strong>
              </li>
            ))}
          </ul>
        </RecapSection>
        <RecapSection title="02 / YouTube Highlight" badge="YouTube">
          {recap.left.youtube.items ? (
            <ul className="recap-list">
              {recap.left.youtube.items.map((item, idx) => (
                <li key={`yt-${recap.id}-${idx}`}>
                  <time>{item.date}</time>
                  <strong>{item.title}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="recap-meta">{recap.left.youtube.date}</p>
              <p className="recap-content-title">{recap.left.youtube.title}</p>
            </>
          )}
        </RecapSection>
        <RecapSection title="03 / Live Activity" badge={`${recap.left.live.total}x Live`}>
          <p className="recap-meta">{recap.left.live.platform}</p>
          <p className="recap-content-title">{recap.left.live.dates.join(', ')}</p>
        </RecapSection>
        <p className="recap-page__number">IRIS · Page {String(pageNumber * 2 - 1).padStart(2, '0')}</p>
      </div>
    </article>
  );
});

const MomentsPage = forwardRef(function MomentsPage({ recap, pageNumber }, ref) {
  return (
    <article className="recap-page recap-page--right" ref={ref}>
      <div className="recap-page__inner">
        <span className="recap-page__chapter">Monthly Journal</span>
        <h2 className="recap-page__title">Moments &<br />Interaction</h2>
        <p className="recap-page__subtitle">{recap.month} {recap.year}</p>
        <RecapSection title="Private Message">
          <div className="recap-pm-grid">
            <Stat label="Bubble Chat" value={recap.right.privateMessage.bubbleChat} />
            <Stat label="Voice Note" value={recap.right.privateMessage.voiceNote} />
            <Stat label="Foto" value={recap.right.privateMessage.photo} />
          </div>
        </RecapSection>
        <RecapSection title="Video Call" badge="Violet">
          <p className="recap-content-title">{recap.right.videoCall.title}</p>
          <p className="recap-meta">{recap.right.videoCall.dates.join(' · ')}</p>
        </RecapSection>
        <RecapSection title="Special Event" badge="Event">
          <p className="recap-content-title">{recap.right.event.title}</p>
          <p className="recap-meta">{recap.right.event.date}</p>
        </RecapSection>
        <p className="recap-page__number">IRIS · Page {String(pageNumber * 2).padStart(2, '0')}</p>
      </div>
    </article>
  );
});

function RecapSection({ title, badge, children }) {
  return (
    <section className="recap-section">
      <div className="recap-section__heading">
        <h3>{title}</h3>
        {badge && <span className="recap-badge">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}

// 🔹 Sekarang menerima prop `onOpenEnd` dan meneruskannya ke <Book>
function ClosedBookIntro({ state, onOpen, onOpenEnd }) {
  const isOpening = state === 'opening';
  const isExiting = state === 'transitioning';
  return (
    <div className={`recap-closed-state ${isOpening ? 'is-opening' : ''} ${isExiting ? 'is-exiting' : ''}`}>
      <button
        type="button"
        className="recap-book-trigger"
        onClick={onOpen}
        disabled={isOpening}
        aria-label="Buka recap book"
      >
        <Book isOpening={isOpening} onOpenEnd={onOpenEnd}>
          <div className="recap-cover-art">
            <span className="recap-cover-art__brand">IRIS</span>
            <span className="recap-cover-art__tag">#Gemintang</span>
            <div className="recap-cover-art__title">Recap<br />Book</div>
            <p className="recap-cover-art__footer">
              Nur Intan<br />Monthly & Yearly Journey · 2026
            </p>
          </div>
        </Book>
        {!isOpening && (
          <span className="recap-book-hint">
            Klik buku untuk membuka
          </span>
        )}
      </button>
      <div className="recap-closed-copy">
        <span className="recap-kicker">Collectible Digital Edition · 2026</span>
        <h2>Satu tahun, dirangkai menjadi cerita.</h2>
        <p>
          Buka catatan aktivitas Intan dari theater, live, video call, event,
          dan momen spesial bersama IRIS.
        </p>
      </div>
    </div>
  );
}

function DesktopReader({ currentMonth, onMonthChange, monthlyRecaps }) {
  const flipBook = useRef(null);
  const isJumpingRef = useRef(false);

  const flipToMonth = (index) => {
    isJumpingRef.current = true;
    const pageFlipObj = flipBook.current?.pageFlip();
    if (pageFlipObj) {
      if (typeof pageFlipObj.turnToPage === 'function') {
        pageFlipObj.turnToPage(index * 2);
      } else {
        pageFlipObj.flip(index * 2);
      }
    }
    onMonthChange(index);
    setTimeout(() => {
      isJumpingRef.current = false;
    }, 600);
  };

  return (
    <>
      <div className="recap-toolbar">
        <div>
          <p className="recap-toolbar__eyebrow">Now Reading · Spread {String(currentMonth + 1).padStart(2, '0')} / {String(monthlyRecaps.length).padStart(2, '0')}</p>
          <p className="recap-toolbar__title">{monthlyRecaps[currentMonth].month} {monthlyRecaps[currentMonth].year} · {monthlyRecaps[currentMonth].theme}</p>
        </div>
        <div className="recap-toolbar__controls">
          <button className="recap-control" disabled={currentMonth === 0} onClick={() => flipBook.current?.pageFlip()?.flipPrev()} aria-label="Bulan sebelumnya">
            <ChevronLeft size={15} /> Sebelumnya
          </button>
          <button className="recap-control" onClick={() => document.querySelector('.recap-toc')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <List size={14} /> Daftar Isi
          </button>
          <button className="recap-control" disabled={currentMonth === monthlyRecaps.length - 1} onClick={() => flipBook.current?.pageFlip()?.flipNext()} aria-label="Bulan berikutnya">
            Berikutnya <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div className="recap-flip-stage">
        <HTMLFlipBook
          ref={flipBook}
          width={480}
          height={580}
          size="stretch"
          minWidth={320}
          maxWidth={520}
          minHeight={440}
          maxHeight={620}
          showCover={false}
          drawShadow
          maxShadowOpacity={0.35}
          flippingTime={800}
          usePortrait={false}
          mobileScrollSupport
          className="recap-flip-book"
          onFlip={(event) => {
            if (isJumpingRef.current) return;
            onMonthChange(Math.min(Math.floor(event.data / 2), monthlyRecaps.length - 1));
          }}
        >
          {monthlyRecaps.flatMap((recap, index) => [
            <ActivityPage key={`${recap.id}-activity`} recap={recap} pageNumber={index + 1} />,
            <MomentsPage key={`${recap.id}-moments`} recap={recap} pageNumber={index + 1} />,
          ])}
        </HTMLFlipBook>
      </div>
      <nav className="recap-toc" aria-label="Daftar isi recap bulanan">
        {monthlyRecaps.map((recap, index) => (
          <button key={recap.id} className={currentMonth === index ? 'active' : ''} onClick={() => flipToMonth(index)}>
            {String(index + 1).padStart(2, '0')} · {recap.month}
          </button>
        ))}
      </nav>
    </>
  );
}

function MobileReader({ currentMonth, onMonthChange, monthlyRecaps }) {
  const [subPage, setSubPage] = useState(0); // 0: Activity (left), 1: Moments (right)
  const [direction, setDirection] = useState(0); // -1: left, 1: right
  const recap = monthlyRecaps[currentMonth];

  // Reset subPage to 0 when month is changed
  useEffect(() => {
    setSubPage(0);
  }, [currentMonth]);

  const handlePrev = () => {
    setDirection(-1);
    if (subPage === 1) {
      setSubPage(0);
    } else if (currentMonth > 0) {
      onMonthChange(currentMonth - 1);
      setSubPage(1);
    }
  };

  const handleNext = () => {
    setDirection(1);
    if (subPage === 0) {
      setSubPage(1);
    } else if (currentMonth < monthlyRecaps.length - 1) {
      onMonthChange(currentMonth + 1);
      setSubPage(0);
    }
  };

  const handleSelectMonth = (event) => {
    const nextMonth = Number(event.target.value);
    setDirection(nextMonth > currentMonth ? 1 : -1);
    onMonthChange(nextMonth);
  };

  const handleTabClick = (pageIdx) => {
    setDirection(pageIdx > subPage ? 1 : -1);
    setSubPage(pageIdx);
  };

  const hasPrev = currentMonth > 0 || subPage === 1;
  const hasNext = currentMonth < monthlyRecaps.length - 1 || subPage === 0;

  const onDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && hasNext) {
      handleNext();
    } else if (info.offset.x > swipeThreshold && hasPrev) {
      handlePrev();
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div className="recap-mobile-reader">
      <select
        className="recap-mobile-select"
        value={currentMonth}
        onChange={handleSelectMonth}
        aria-label="Pilih bulan recap"
      >
        {monthlyRecaps.map((item, index) => (
          <option value={index} key={item.id}>
            {item.month} {item.year} · {item.theme}
          </option>
        ))}
      </select>
      <div className="recap-mobile-tabs">
        <button
          type="button"
          className={`recap-mobile-tab-btn ${subPage === 0 ? 'active' : ''}`}
          onClick={() => handleTabClick(0)}
        >
          Aktivitas (Page 1)
        </button>
        <button
          type="button"
          className={`recap-mobile-tab-btn ${subPage === 1 ? 'active' : ''}`}
          onClick={() => handleTabClick(1)}
        >
          Momen (Page 2)
        </button>
      </div>
      <div className="recap-mobile-pages-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${currentMonth}-${subPage}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={onDragEnd}
            className="recap-mobile-page-transition"
            style={{ width: '100%', touchAction: 'pan-y' }}
          >
            {subPage === 0 ? (
              <ActivityPage recap={recap} pageNumber={currentMonth + 1} />
            ) : (
              <MomentsPage recap={recap} pageNumber={currentMonth + 1} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="recap-mobile-controls">
        <button
          className="recap-control"
          disabled={!hasPrev}
          onClick={handlePrev}
          aria-label="Halaman sebelumnya"
        >
          <ArrowLeft size={15} /> Sebelumnya
        </button>
        <button
          className="recap-control"
          disabled={!hasNext}
          onClick={handleNext}
          aria-label="Halaman berikutnya"
        >
          Berikutnya <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function AnnualRecap({ monthlyRecaps }) {
  const stats = useMemo(() => monthlyRecaps.reduce((total, recap) => ({
    theater: total.theater + (recap.left?.theater?.total || 0),
    live: total.live + (recap.left?.live?.total || 0),
    messages: total.messages + (recap.right?.privateMessage?.bubbleChat || 0),
    moments: total.moments + (recap.right?.privateMessage?.photo || 0),
  }), { theater: 0, live: 0, messages: 0, moments: 0 }), [monthlyRecaps]);
  return (
    <section className="recap-annual animate-fade-in">
      <div className="recap-annual__header">
        <span className="recap-kicker">Annual Edition · 2026 in Progress</span>
        <h2>The story so far.</h2>
        <p className="recap-intro" style={{ textAlign: 'left', margin: '1rem 0 0' }}>
          Ringkasan perjalanan Nur Intan yang telah terdokumentasi dari Januari sampai April 2026.
        </p>
      </div>
      <div className="recap-annual__stats">
        <Stat label="Theater Shows" value={stats.theater} />
        <Stat label="IDN Live" value={stats.live} />
        <Stat label="Bubble Chats" value={stats.messages} />
        <Stat label="Shared Photos" value={stats.moments} />
      </div>
      <div className="recap-annual__months">
        {monthlyRecaps.map((recap) => (
          <article key={recap.id}>
            <h3>{recap.month} · {recap.theme}</h3>
            <p>{recap.right?.monthlyNote}</p>
          </article>
        ))}
      </div>
    </section >
  );
}



export default function RecapListPage() {
  const [mode, setMode] = useState('monthly');
  const [readerState, setReaderState] = useState('closed'); // closed | opening | open
  const [currentMonth, setCurrentMonth] = useState(0);
  const [bookRecaps, setBookRecaps] = useState(monthlyRecaps);
  const openTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  // 🔹 Event-driven: pakai animationend dari <Book>, timer hanya jadi safety net
  const handleOpenBook = useCallback(() => {
    if (readerState !== 'closed') return;

    const shouldRespectReducedMotion = process.env.NODE_ENV === 'production';
    const prefersReducedMotion =
      shouldRespectReducedMotion &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setReaderState('open');
      return;
    }

    setReaderState('opening');

    // Safety net: kalau tab di-background, animationend bisa tidak terpanggil.
    // Sedikit lebih lama dari durasi animasi (1450ms) sebagai cadangan.
    clearOpenTimer();
    openTimerRef.current = window.setTimeout(() => {
      clearTransitionTimer();
      setReaderState('transitioning');
      transitionTimerRef.current = window.setTimeout(() => {
        setReaderState('open');
      }, 600);
      openTimerRef.current = null;
    }, 1700);
  }, [readerState, clearOpenTimer, clearTransitionTimer]);

  // 🔹 Dipanggil tepat saat animasi buku benar-benar selesai → handoff frame-perfect
  const handleOpenEnd = useCallback(() => {
    clearOpenTimer();
    setReaderState((prev) => {
      if (prev === 'opening') {
        clearTransitionTimer();
        transitionTimerRef.current = window.setTimeout(() => {
          setReaderState('open');
        }, 600);
        return 'transitioning';
      }
      return prev;
    });
  }, [clearOpenTimer, clearTransitionTimer]);

  const handleModeChange = (nextMode) => {
    clearOpenTimer();
    clearTransitionTimer();
    setMode(nextMode);
    if (nextMode === 'monthly') {
      setReaderState('closed');
    }
  };

  useEffect(() => {
    recapService.getMonthlyRecaps()
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.map(r => ({
            id: r.id,
            year: r.year,
            month: r.month,
            theme: r.theme,
            left: r.left_page,
            right: r.right_page
          }));
          setBookRecaps(mapped);
        }
      })
      .catch(err => {
        console.error('Gagal memuat dynamic monthly recaps dari database, menggunakan fallback statis:', err);
      });
  }, []);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearTransitionTimer();
    };
  }, [clearOpenTimer, clearTransitionTimer]);

  return (
    <div
      className={`recap-book-page ${readerState === 'opening' ? 'is-cinematic-opening' : ''}`}
      data-force-motion={process.env.NODE_ENV !== 'production' ? 'true' : undefined}
    >
      <header className="recap-intro">
        <span className="recap-kicker">IRIS Editorial Archive</span>
        <h1>Recap Nur Intan</h1>
        <p>Rekap aktivitas dan momen pilihan, disusun sebagai buku perjalanan digital yang dapat dibaca kembali kapan saja.</p>
      </header>

      <div className="recap-mode-switcher" aria-label="Pilih mode recap">
        <button className={mode === 'monthly' ? 'active' : ''} onClick={() => handleModeChange('monthly')}><CalendarDays size={13} className="inline mr-1.5" />Bulanan</button>
        <button className={mode === 'annual' ? 'active' : ''} onClick={() => handleModeChange('annual')}><BookOpen size={13} className="inline mr-1.5" />Tahunan</button>
      </div>

      {mode === 'annual' ? (
        <AnnualRecap monthlyRecaps={bookRecaps} />
      ) : (
        <>
          {(readerState === 'closed' || readerState === 'opening' || readerState === 'transitioning') && (
            <ClosedBookIntro state={readerState} onOpen={handleOpenBook} onOpenEnd={handleOpenEnd} />
          )}
          {(readerState === 'transitioning' || readerState === 'open') && (
            <section className={`recap-reader ${readerState === 'transitioning' ? 'is-entering' : 'recap-reader--after-open'}`}>
              <DesktopReader currentMonth={currentMonth} onMonthChange={setCurrentMonth} monthlyRecaps={bookRecaps} />
              <MobileReader currentMonth={currentMonth} onMonthChange={setCurrentMonth} monthlyRecaps={bookRecaps} />
            </section>
          )}
        </>
      )}
    </div>
  );
}