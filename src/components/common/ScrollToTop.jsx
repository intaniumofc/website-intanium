'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';


export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset standard browser scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Reset Lenis smooth scroll if it's active
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
