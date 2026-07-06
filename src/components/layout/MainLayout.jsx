'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Standard user layout wrapping the entire guest page routing system.
 */
export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen text-[var(--text-primary)] relative">
      {/* Dynamic decorative visual blobs for high-end styling */}
      <div className="bg-blob w-[500px] h-[500px] bg-purple-600/10 top-[-250px] left-[-200px]" />
      <div className="bg-blob w-[400px] h-[400px] bg-cyan-600/10 bottom-[200px] right-[-200px]" />

      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 animate-fade-in relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
