'use client';

import { useEffect, useState } from 'react';

const QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1199px)',
};

function readTier() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
  if (window.matchMedia(QUERIES.mobile).matches) return 'mobile';
  if (window.matchMedia(QUERIES.tablet).matches) return 'tablet';
  return 'desktop';
}

function readReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Local environment detection for the journey map only. Intentionally
 * scoped here (not the shared useSafeReducedMotion) so enabling reduced
 * motion here does not alter unrelated animations elsewhere on the page.
 */
export function useJourneyEnvironment() {
  const [tierKey, setTierKey] = useState('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const update = () => {
      setTierKey(readTier());
      setReducedMotion(readReducedMotion());
    };
    update();

    const mqls = [
      window.matchMedia(QUERIES.mobile),
      window.matchMedia(QUERIES.tablet),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    mqls.forEach((m) => m.addEventListener('change', update));
    return () => mqls.forEach((m) => m.removeEventListener('change', update));
  }, []);

  return { tierKey, reducedMotion };
}
