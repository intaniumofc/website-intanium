'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export const ImageSwiper = ({
  images,
  cardWidth = 256,
  cardHeight = 352,
  className = ''
}) => {
  const cardStackRef = useRef(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef(null);
  const hasMoved = useRef(false);
  const clickDirection = useRef(1);

  const imageList = Array.isArray(images)
    ? images
    : typeof images === 'string'
      ? images.split(',').map(img => img.trim()).filter(img => img)
      : [];
  const [cardOrder, setCardOrder] = useState(() =>
    Array.from({ length: imageList.length }, (_, i) => i)
  );

  const stackOffsets = useMemo(() => {
    const seed = (i) => {
      const x = Math.sin(i * 9301 + 4927) * 49297;
      return x - Math.floor(x); // 0..1
    };
    return imageList.map((_, i) => ({
      rotate: (seed(i) - 0.5) * 12,
      offsetX: (seed(i + 100) - 0.5) * 10,
      offsetY: (seed(i + 200) - 0.5) * 8,
    }));
  }, [imageList.length]);

  const getDurationFromCSS = useCallback((variableName, element) => {
    const targetElement = element || document.documentElement;
    const value = getComputedStyle(targetElement)
      ?.getPropertyValue(variableName)
      ?.trim();
    if (!value) return 0;
    if (value.endsWith("ms")) return parseFloat(value);
    if (value.endsWith("s")) return parseFloat(value) * 1000;
    return parseFloat(value) || 0;
  }, []);

  const getCards = useCallback(() => {
    if (!cardStackRef.current) return [];
    return [...cardStackRef.current.querySelectorAll('.image-card')];
  }, []);

  const getActiveCard = useCallback(() => {
    const cards = getCards();
    return cards.length > 0 ? cards[cards.length - 1] : null;
  }, [getCards]);

  const updatePositions = useCallback(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty('--swipe-x', '0px');
      card.style.setProperty('--swipe-rotate', '0deg');
      card.style.opacity = '1';
    });
  }, [getCards]);

  const applySwipeStyles = useCallback((deltaX) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty('--swipe-x', `${deltaX}px`);
    card.style.setProperty('--swipe-rotate', `${deltaX * 0.15}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 120, 1) * 0.7).toString();
  }, [getActiveCard]);

  const handleStart = useCallback((clientX) => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    hasMoved.current = false;
    const card = getActiveCard();
    if (card) card.style.transition = 'none';
  }, [getActiveCard]);

  const handleEnd = useCallback(() => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    const deltaX = currentX.current - startX.current;
    const threshold = 50;
    const duration = getDurationFromCSS('--card-swap-duration', cardStackRef.current) || 300;
    const card = getActiveCard();

    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      if (Math.abs(deltaX) > threshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty('--swipe-x', `${direction * 300}px`);
        card.style.setProperty('--swipe-rotate', `${direction * 20}deg`);

        setTimeout(() => {
          if (getActiveCard() === card) {
            card.style.setProperty('--swipe-rotate', `${-direction * 20}deg`);
          }
        }, duration * 0.5);

        setTimeout(() => {
          setCardOrder(prev => {
            if (prev.length === 0) return [];
            return [...prev.slice(1), prev[0]];
          });
        }, duration);
      } else if (!hasMoved.current) {
        const direction = clickDirection.current;
        clickDirection.current *= -1;
        card.style.setProperty('--swipe-x', `${direction * 320}px`);
        card.style.setProperty('--swipe-rotate', `${direction * 25}deg`);
        card.style.opacity = '0';

        setTimeout(() => {
          if (getActiveCard() === card) {
            card.style.setProperty('--swipe-rotate', `${-direction * 25}deg`);
          }
        }, duration * 0.5);

        setTimeout(() => {
          setCardOrder(prev => {
            if (prev.length === 0) return [];
            return [...prev.slice(1), prev[0]];
          });
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }

    isSwiping.current = false;
    startX.current = 0;
    currentX.current = 0;
  }, [getDurationFromCSS, getActiveCard, applySwipeStyles]);

  const handleMove = useCallback((clientX) => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(() => {
      currentX.current = clientX;
      const deltaX = currentX.current - startX.current;

      if (Math.abs(deltaX) > 5) {
        hasMoved.current = true;
      }

      applySwipeStyles(deltaX);

      if (Math.abs(deltaX) > 50) {
        handleEnd();
      }
    });
  }, [applySwipeStyles, handleEnd]);

  useEffect(() => {
    const el = cardStackRef.current;
    if (!el) return;

    const onDown = (e) => handleStart(e.clientX);
    const onMove = (e) => handleMove(e.clientX);
    const onUp = () => handleEnd();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleStart, handleMove, handleEnd]);

  useEffect(() => {
    updatePositions();
  }, [cardOrder, updatePositions]);

  const visibleCount = Math.min(imageList.length, 4);

  return (
    <section
      className={`relative select-none ${className}`}
      ref={cardStackRef}
      style={{
        width: cardWidth + 40,
        height: cardHeight + 40,
        touchAction: 'none',
        '--card-swap-duration': '0.3s',
      }}
    >
      {[...cardOrder].reverse().map((originalIndex, reverseIdx) => {
        const displayIndex = cardOrder.length - 1 - reverseIdx;
        const isFront = displayIndex === 0;
        const isVisible = displayIndex < visibleCount;
        const offsets = stackOffsets[originalIndex] || { rotate: 0, offsetX: 0, offsetY: 0 };

        const behindScale = 1 - Math.min(displayIndex, visibleCount - 1) * 0.02;
        const behindY = Math.min(displayIndex, visibleCount - 1) * 6;
        const stackRotate = isFront ? 0 : offsets.rotate;
        const stackX = isFront ? 0 : offsets.offsetX;
        const stackY = isFront ? 0 : behindY + offsets.offsetY;

        return (
          <article
            key={`${(imageList[originalIndex])?.src || imageList[originalIndex]}-${originalIndex}`}
            className={`image-card absolute select-none will-change-transform ${isFront
              ? 'cursor-pointer active:scale-[0.98] transition-transform'
              : 'pointer-events-none'
              }`}
            style={{
              zIndex: imageList.length - displayIndex,
              width: cardWidth,
              height: cardHeight,
              left: '50%',
              top: '50%',
              marginLeft: -cardWidth / 2,
              marginTop: -cardHeight / 2,
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: isFront
                ? '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)'
                : `0 ${4 + displayIndex * 2}px ${12 + displayIndex * 4}px rgba(0,0,0,${0.05 + displayIndex * 0.03})`,
              border: '1px solid rgba(23,12,121,0.1)',
              background: '#ffffff',
              transform: isFront
                ? `translateX(var(--swipe-x, 0px)) rotate(var(--swipe-rotate, 0deg))`
                : `translateX(${stackX}px) translateY(${stackY}px) rotate(${stackRotate}deg) scale(${behindScale})`,
              opacity: isVisible ? (isFront ? undefined : (1 - displayIndex * 0.08)) : 0,
              transition: isFront ? undefined : 'transform 0.4s cubic-bezier(.22,1,.36,1), opacity 0.4s ease',
              visibility: isVisible ? 'visible' : 'hidden',
            }}
          >
            <img
              src={(imageList[originalIndex])?.src || (imageList[originalIndex])}
              alt={`Photo ${originalIndex + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
              loading={isFront ? "eager" : "lazy"}
              style={{ borderRadius: '11px' }}
            />
          </article>
        );
      })}
    </section>
  );
};
