'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);

  // Check sessionStorage AFTER mount to prevent React SSR hydration mismatch
  useEffect(() => {
    try {
      if (sessionStorage.getItem('hasSeenPreloader') === 'true') {
        setIsComplete(true);
        setProgress(100);
      }
    } catch (err) {
      console.warn('Could not read sessionStorage:', err);
    }
  }, []);

  const updateProgress = useCallback((value) => {
    setProgress((prev) => Math.max(prev, Math.min(100, value)));
  }, []);

  const completeLoading = useCallback(() => {
    setIsComplete(true);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('hasSeenPreloader', 'true');
      } catch (err) {
        console.warn('Could not save preloader state to sessionStorage:', err);
      }
    }
  }, []);

  const markVideoReady = useCallback(() => {
    setHeroVideoReady(true);
  }, []);

  const setVideoUrl = useCallback((url) => {
    setVideoBlobUrl(url);
  }, []);

  const value = useMemo(() => ({
    progress,
    isComplete,
    heroVideoReady,
    videoBlobUrl,
    updateProgress,
    completeLoading,
    markVideoReady,
    setVideoUrl,
  }), [progress, isComplete, heroVideoReady, videoBlobUrl, updateProgress, completeLoading, markVideoReady, setVideoUrl]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
