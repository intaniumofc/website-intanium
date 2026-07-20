'use client';

import { useState, useEffect, useRef } from "react";

/**
 * useCanvasVisibility
 *
 * Returns true when the referenced element is visible in the viewport AND
 * the document is visible AND the window has focus.
 *
 * This is the single source of truth for pausing/resuming canvas/WebGL loops.
 */
export function useCanvasVisibility(ref) {
  const [isActive, setIsActive] = useState(false);
  const intersectRef = useRef(false);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return undefined;

    const update = () => {
      const active =
        intersectRef.current &&
        !document.hidden &&
        document.hasFocus();
      setIsActive(active);
    };

    const handleVisibility = () => update();
    const handleFocus = () => update();
    const handleBlur = () => update();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersectRef.current = entry.isIntersecting;
        update();
      },
      { threshold: 0.05, rootMargin: "10% 0px 10% 0px" }
    );

    observer.observe(element);

    // Initial update
    update();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      observer.disconnect();
    };
  }, [ref]);

  return isActive;
}

export default useCanvasVisibility;