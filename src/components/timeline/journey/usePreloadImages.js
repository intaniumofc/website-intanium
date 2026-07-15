'use client';

import { useEffect, useState } from 'react';

/**
 * Preloads image URLs and resolves once all have loaded or errored.
 * Prevents ScrollTrigger from measuring the pinned container before
 * images settle, which is the usual cause of jumpy first-scroll behaviour.
 */
export function usePreloadImages(urls) {
  const [ready, setReady] = useState(false);
  const key = urls.filter(Boolean).join('|');

  useEffect(() => {
    let cancelled = false;
    const list = urls.filter(Boolean);

    if (list.length === 0) {
      setReady(true);
      return;
    }

    setReady(false);
    let remaining = list.length;
    const settle = () => {
      remaining -= 1;
      if (remaining <= 0 && !cancelled) setReady(true);
    };

    list.forEach((src) => {
      const img = new window.Image();
      img.onload = settle;
      img.onerror = settle;
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ready;
}
