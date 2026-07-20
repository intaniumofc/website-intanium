'use client';

import { useEffect, useRef } from 'react';
import { useLoading } from '../components/loading/LoadingContext';

/**
 * usePreloader
 * 
 * Preloads critical assets (hero video & key images) with real progress.
 * 
 * Phase 1 (0-70%): Hero Video stream fetch into HTTP cache
 * Phase 2 (70-90%): Critical Images decode
 * Phase 3 (90-100%): Fonts readiness
 */
export function usePreloader({ videoSrc, imageSources = [], onComplete }) {
  const loadingRef = useRef(useLoading());
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const loading = useLoading();
  loadingRef.current = loading;

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let safetyTimeout;

    const setProgress = (val) => {
      loadingRef.current.updateProgress(Math.min(100, Math.max(0, val)));
    };

    const finishLoading = () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      clearTimeout(safetyTimeout);

      setProgress(100);

      setTimeout(() => {
        loadingRef.current.completeLoading();
        onComplete?.();
      }, 400);
    };

    safetyTimeout = setTimeout(() => {
      console.warn('[Preloader] Safety timeout reached. Forcing completion.');
      finishLoading();
    }, 10000);

    const run = async () => {
      try {
        let currentProgress = 0;

        // ── Phase 1: Video (0% → 70%) ──
        if (videoSrc) {
          try {
            const response = await fetch(videoSrc);
            if (!response.ok) throw new Error('Video fetch failed');

            const contentLength = response.headers.get('Content-Length');
            const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

            if (totalBytes > 0 && response.body) {
              const reader = response.body.getReader();
              let receivedBytes = 0;

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedBytes += value.length;
                currentProgress = (receivedBytes / totalBytes) * 70;
                setProgress(currentProgress);
              }
            } else {
              // Simulated progress fallback
              for (let i = 1; i <= 7; i++) {
                await new Promise((r) => setTimeout(r, 80));
                setProgress(i * 10);
              }
            }
          } catch (err) {
            console.warn('[Preloader] Video fetch warning, continuing:', err);
          }
          setProgress(70);
          loadingRef.current.markVideoReady();
        } else {
          setProgress(70);
        }

        // ── Phase 2: Images (70% → 90%) ──
        const images = (imageSources || []).filter(Boolean);
        if (images.length > 0) {
          const perImage = 20 / images.length;
          await Promise.all(
            images.map(async (src, i) => {
              try {
                const img = new Image();
                img.src = typeof src === 'string' ? src : (src.src || src);
                await img.decode();
              } catch {}
              currentProgress = 70 + perImage * (i + 1);
              setProgress(currentProgress);
            })
          );
        } else {
          setProgress(90);
        }

        // ── Phase 3: Fonts (90% → 100%) ──
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        finishLoading();
      } catch (err) {
        console.error('[Preloader] Error during preload:', err);
        finishLoading();
      }
    };

    run();

    return () => {
      clearTimeout(safetyTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
