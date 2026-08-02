'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Standard user layout wrapping the entire guest page routing system.
 * @param {boolean} isHome - If true, layout is rendered full-bleed without max-width or top-padding constraints.
 */
export default function MainLayout({ children, isHome = false, fullWidth = false, noPaddingTop = false }) {
  return (
    <div className="flex flex-col min-h-screen text-[var(--text-primary)] relative">


      <Navbar isHome={isHome} />

      {isHome ? (
        /* Full-bleed wrapper for homepage */
        <main className="flex-grow w-full">
          {children}
        </main>
      ) : fullWidth ? (
        /* Full-width layout for page templates like About Iris and Shining Star, avoiding fixed-pinning conflicts */
        <main className={`flex-grow w-full relative ${noPaddingTop ? '' : 'pt-20 sm:pt-24 md:pt-28'}`}>
          {children}
        </main>
      ) : (
        /* Constrained layout for standard pages */
        <main className={`flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 animate-fade-in relative ${noPaddingTop ? '' : 'pt-20 sm:pt-24 md:pt-28'}`}>
          {children}
        </main>
      )}

      <Footer />
    </div>
  );
}
