'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function useSafeReducedMotion() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? shouldReduceMotion : false;
}
