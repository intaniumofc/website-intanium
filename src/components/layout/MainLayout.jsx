'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Standard user layout wrapping the entire guest page routing system.
 * @param {boolean} isHome - If true, layout is rendered full-bleed without max-width or top-padding constraints.
 */
export default function MainLayout({ children, isHome = false, fullWidth = false }) {
  return (
    <div className="flex flex-col min-h-screen text-[var(--text-primary)] relative">
      {/* Dynamic decorative visual blobs — show only on non-home pages */}
      {!isHome && (
        <>
          <div className="bg-blob w-[500px] h-[500px] bg-purple-600/10 top-[-250px] left-[-200px]" />
          <div className="bg-blob w-[400px] h-[400px] bg-cyan-600/10 bottom-[200px] right-[-200px]" />
        </>
      )}

      <Navbar isHome={isHome} />

      {isHome ? (
        /* Full-bleed wrapper for homepage */
        <main className="flex-grow w-full">
          {children}
        </main>
      ) : fullWidth ? (
        /* Full-width layout for page templates like About Iris and Shining Star, avoiding fixed-pinning conflicts */
        <main className="flex-grow w-full pt-24 relative">
          {children}
        </main>
      ) : (
        /* Constrained layout for standard pages */
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fade-in relative">
          {children}
        </main>
      )}

      <Footer />
    </div>
  );
}
