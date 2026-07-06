'use client';

import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

/**
 * Lightweight animated status icon component.
 * Uses Lottie JSON animations from /public for paid, shipped, and completed statuses.
 * Falls back to CSS-animated icons for pending and cancelled statuses.
 */

const STATUS_LOTTIE_MAP = {
  paid: '/verifikasi-admin.json',
  submitted: '/verifikasi-admin.json',
  shipped: '/sedang-diantar.json',
  'in progress': '/sedang-diantar.json',
  'in_progress': '/sedang-diantar.json',
  completed: '/pesanan-selesai.json',
  success: '/pesanan-selesai.json',
};

// CSS-only animated icons for pending & cancelled
function PendingIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
      {/* Pulsing outer ring */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-amber-300/40"
        style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
      />
      <div 
        className="absolute inset-2 rounded-full border-4 border-amber-400/30"
        style={{ animation: 'statusPulse 2s ease-in-out infinite 0.3s' }}
      />
      {/* Center icon - hourglass/clock style */}
      <div 
        className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg flex items-center justify-center"
        style={{ animation: 'statusFloat 3s ease-in-out infinite' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    </div>
  );
}

function CancelledIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
      {/* Pulsing outer ring */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-rose-300/40"
        style={{ animation: 'statusPulse 2s ease-in-out infinite' }}
      />
      <div 
        className="absolute inset-2 rounded-full border-4 border-rose-400/30"
        style={{ animation: 'statusPulse 2s ease-in-out infinite 0.3s' }}
      />
      {/* Center icon - X mark */}
      <div 
        className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 shadow-lg flex items-center justify-center"
        style={{ animation: 'statusFloat 3s ease-in-out infinite' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
    </div>
  );
}

export default function ThreeDBox({ status = "pending", className = "" }) {
  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);

  const normalizedStatus = (status || "pending").toLowerCase();
  const lottiePath = STATUS_LOTTIE_MAP[normalizedStatus];

  useEffect(() => {
    // Only load Lottie if we have a JSON path for this status
    if (!lottiePath || !containerRef.current) return;

    // Clean up previous instance
    if (animInstanceRef.current) {
      animInstanceRef.current.destroy();
      animInstanceRef.current = null;
    }

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: lottiePath,
    });

    animInstanceRef.current = anim;

    return () => {
      anim.destroy();
      animInstanceRef.current = null;
    };
  }, [lottiePath]);

  // For statuses without Lottie, render CSS-animated icons
  if (!lottiePath) {
    return (
      <div className={`w-32 h-32 mx-auto flex items-center justify-center ${className}`}>
        <style>{`
          @keyframes statusFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(2deg); }
          }
          @keyframes statusPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.08); opacity: 0.7; }
          }
        `}</style>
        {normalizedStatus === 'cancelled' ? <CancelledIcon /> : <PendingIcon />}
      </div>
    );
  }

  // Lottie animation container
  return (
    <div 
      ref={containerRef} 
      className={`w-32 h-32 mx-auto flex items-center justify-center ${className}`}
      style={{ overflow: 'hidden' }}
    />
  );
}
