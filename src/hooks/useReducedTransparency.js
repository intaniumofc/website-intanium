'use client';

import { useState, useEffect } from "react";

/**
 * useReducedTransparency
 *
 * Mirrors useSafeReducedMotion but for prefers-reduced-transparency.
 * Browser support is limited, so false (no reduction requested) is the safe default.
 */
export function useReducedTransparency() {
  const [reducedTransparency, setReducedTransparency] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const query = "(prefers-reduced-transparency: reduce)";
    const mql = window.matchMedia(query);

    const update = () => setReducedTransparency(mql.matches);
    update();

    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return reducedTransparency;
}

export default useReducedTransparency;