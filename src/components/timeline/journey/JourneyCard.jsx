'use client';

import { memo, useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';

const CATEGORY_CLASS = {
  Milestone: 'milestone',
  Theater: 'theater',
  Live: 'live',
  'Video Call': 'video-call',
  Event: 'event',
  Content: 'content',
  'Fan Project': 'fan-project',
};

/**
 * Glass floating destination card. Reveal animation is driven by the parent
 * timeline (via the classNames below). Hover interactions — tilt, image
 * parallax, shine sweep, magnetic pull — are handled locally with GSAP
 * quickTo setters so pointer moves never trigger React re-renders.
 */
function JourneyCard({ achievement, cardW, onSelect, interactive = true }) {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const setters = useRef(null);

  useEffect(() => {
    if (!interactive) return undefined;
    const card = cardRef.current;
    const img = imgRef.current;
    if (!card) return undefined;

    const ctx = gsap.context(() => {
      setters.current = {
        rx: gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' }),
        ry: gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' }),
        mx: gsap.quickTo(rootRef.current, 'x', { duration: 0.5, ease: 'power3.out' }),
        my: gsap.quickTo(rootRef.current, 'y', { duration: 0.5, ease: 'power3.out' }),
        ix: img ? gsap.quickTo(img, 'xPercent', { duration: 0.6, ease: 'power3.out' }) : null,
        iy: img ? gsap.quickTo(img, 'yPercent', { duration: 0.6, ease: 'power3.out' }) : null,
      };
    }, rootRef);

    return () => ctx.revert();
  }, [interactive]);

  const handleMove = useCallback(
    (e) => {
      const s = setters.current;
      const card = cardRef.current;
      if (!s || !card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      s.ry(px * 10);
      s.rx(-py * 10);
      s.mx(px * 10); // magnetic pull toward cursor
      s.my(py * 10);
      if (s.ix) s.ix(-px * 8);
      if (s.iy) s.iy(-py * 8);
    },
    []
  );

  const handleLeave = useCallback(() => {
    const s = setters.current;
    if (!s) return;
    s.rx(0);
    s.ry(0);
    s.mx(0);
    s.my(0);
    if (s.ix) s.ix(0);
    if (s.iy) s.iy(0);
  }, []);

  const category = CATEGORY_CLASS[achievement.category] || 'milestone';
  const imgSrc = achievement.image?.src || achievement.image;

  return (
    <div ref={rootRef} className="journey-card-mover" style={{ width: cardW }}>
      <div
        ref={cardRef}
        className={`journey-card ${category}`}
        onMouseMove={interactive ? handleMove : undefined}
        onMouseLeave={interactive ? handleLeave : undefined}
        onClick={onSelect}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="journey-card-shine" aria-hidden="true" />

        {imgSrc && (
          <div className="journey-card-photo">
            <img ref={imgRef} src={imgSrc} alt={achievement.title} loading="lazy" draggable="false" />
          </div>
        )}

        <div className="journey-card-body">
          <span className={`journey-card-badge ${category}`}>{achievement.category}</span>
          <p className="journey-card-date">{achievement.date}</p>
          <h3 className="journey-card-title">{achievement.title}</h3>
          <p className="journey-card-desc">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}

export default memo(JourneyCard);
