'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);

  const updateProgress = useCallback((value) => {
    setProgress((prev) => Math.max(prev, Math.min(100, value)));
  }, []);

  const completeLoading = useCallback(() => {
    setIsComplete(true);
  }, []);

  const markVideoReady = useCallback(() => {
    setHeroVideoReady(true);
  }, []);

  const setVideoUrl = useCallback((url) => {
    setVideoBlobUrl(url);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
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
