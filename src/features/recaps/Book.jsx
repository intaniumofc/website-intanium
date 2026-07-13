'use client';

import { forwardRef, useEffect, useRef } from 'react';

const Book = forwardRef(function Book(
  { children, isOpening = false, onOpenEnd, color = '#17105F', width = 292 },
  ref
) {
  const bodyRef = useRef(null);

  // 🔹 Dengarkan animasi "body" buku selesai → lebih akurat daripada setTimeout.
  useEffect(() => {
    if (!isOpening) return;
    const body = bodyRef.current;
    if (!body) return;

    const handleEnd = (event) => {
      // Hanya bereaksi pada animasi body buku (bukan layer anak: glow, pages, dll)
      if (
        event.target === body &&
        event.animationName?.includes('book-body-power-open')
      ) {
        onOpenEnd?.();
      }
    };

    body.addEventListener('animationend', handleEnd);
    return () => body.removeEventListener('animationend', handleEnd);
  }, [isOpening, onOpenEnd]);

  return (
    <div
      ref={ref}
      className={`recap-closed-book ${isOpening ? 'is-opening' : ''}`}
      style={{ '--book-color': color, '--book-width': `${width}px` }}
    >
      <div className="recap-closed-book__body" ref={bodyRef}>
        <div className="recap-closed-book__glow" aria-hidden="true" />
        <div className="recap-closed-book__burst" aria-hidden="true" />
        <div className="recap-closed-book__back" aria-hidden="true" />
        <div className="recap-closed-book__inner-spread" aria-hidden="true">
          <div className="recap-closed-book__inner-page recap-closed-book__inner-page--left">
            <span>IRIS</span>
            <strong>Recap<br />Nur Intan</strong>
            <small>Editorial Archive · 2026</small>
          </div>
          <div className="recap-closed-book__inner-page recap-closed-book__inner-page--right">
            <span>Chapter 01</span>
            <strong>Januari<br />2026</strong>
            <small>A Bright New Chapter</small>
          </div>
        </div>
        <div className="recap-closed-book__pages" aria-hidden="true" />
        <div className="recap-closed-book__cover">
          <div className="recap-closed-book__cover-face recap-closed-book__cover-face--front">
            {children}
          </div>
          <div className="recap-closed-book__cover-face recap-closed-book__cover-face--back">
            IRIS
          </div>
        </div>
      </div>
    </div>
  );
});

export default Book;