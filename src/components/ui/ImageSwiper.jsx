import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Reusable ImageSwiper component with smooth pointer-based swipe gestures
 * AND native click-to-swipe automation handled directly in the pointer pipeline.
 */
export const ImageSwiper = ({
  images,
  cardWidth = 256,  // 16rem = 256px
  cardHeight = 352, // 22rem = 352px
  className = ''
}) => {
  const cardStackRef = useRef(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef(null);
  const hasMoved = useRef(false); // Track if pointer dragged more than 5px
  const clickDirection = useRef(1); // Alternates between 1 (right) and -1 (left)

  const imageList = images.split(',').map(img => img.trim()).filter(img => img);
  const [cardOrder, setCardOrder] = useState(() =>
    Array.from({ length: imageList.length }, (_, i) => i)
  );

  const getDurationFromCSS = useCallback((
    variableName,
    element
  ) => {
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
    return cards[0] || null;
  }, [getCards]);

  const updatePositions = useCallback(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty('--i', (i + 1).toString());
      card.style.setProperty('--swipe-x', '0px');
      card.style.setProperty('--swipe-rotate', '0deg');
      card.style.opacity = '1';
    });
  }, [getCards]);

  const applySwipeStyles = useCallback((deltaX) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty('--swipe-x', `${deltaX}px`);
    card.style.setProperty('--swipe-rotate', `${deltaX * 0.2}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
  }, [getActiveCard]);

  const handleStart = useCallback((clientX) => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    hasMoved.current = false; // Reset pointer movement flag
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
        // Drag crossed threshold: swipe in the direction of the drag
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
        // Drag didn't happen (user clicked): alternate swipe direction left/right
        const direction = clickDirection.current;
        clickDirection.current *= -1; // Flip for next click
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
        // Dragged but didn't cross threshold: snap back to center
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
      
      // If movement is larger than 5px, it is a drag, not a simple click
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
    const cardStackElement = cardStackRef.current;
    if (!cardStackElement) return;

    const handlePointerDown = (e) => {
      handleStart(e.clientX);
    };
    const handlePointerMove = (e) => {
      handleMove(e.clientX);
    };
    const handlePointerUp = (e) => {
      handleEnd();
    };

    cardStackElement.addEventListener('pointerdown', handlePointerDown);
    cardStackElement.addEventListener('pointermove', handlePointerMove);
    cardStackElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      cardStackElement.removeEventListener('pointerdown', handlePointerDown);
      cardStackElement.removeEventListener('pointermove', handlePointerMove);
      cardStackElement.removeEventListener('pointerup', handlePointerUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleStart, handleMove, handleEnd]);

  useEffect(() => {
    updatePositions();
  }, [cardOrder, updatePositions]);

  return (
    <section
      className={`relative grid place-content-center select-none ${className}`}
      ref={cardStackRef}
      style={{
        width: cardWidth + 32,
        height: cardHeight + 32,
        touchAction: 'none',
        transformStyle: 'preserve-3d',
        '--card-perspective': '700px',
        '--card-z-offset': '12px',
        '--card-y-offset': '7px',
        '--card-max-z-index': imageList.length.toString(),
        '--card-swap-duration': '0.3s',
      }}
    >
      {cardOrder.map((originalIndex, displayIndex) => (
        <article
          key={`${imageList[originalIndex]}-${originalIndex}`}
          className={`image-card absolute select-none place-self-center border border-[var(--border-color)] rounded-xl bg-white shadow-md overflow-hidden will-change-transform ${
            displayIndex === 0 ? 'cursor-pointer active:scale-98 transition-transform' : 'pointer-events-none'
          }`}
          style={{
            '--i': (displayIndex + 1).toString(),
            zIndex: imageList.length - displayIndex,
            width: cardWidth,
            height: cardHeight,
            transform: `perspective(var(--card-perspective))
                       translateZ(calc(-1 * var(--card-z-offset) * var(--i)))
                       translateY(calc(var(--card-y-offset) * var(--i)))
                       translateX(var(--swipe-x, 0px))
                       rotateY(var(--swipe-rotate, 0deg))`
          }}
        >
          <img
            src={imageList[originalIndex]}
            alt={`Swiper image ${originalIndex + 1}`}
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        </article>
      ))}
    </section>
  );
};
