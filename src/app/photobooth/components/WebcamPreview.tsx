"use client";

import React, { useEffect } from "react";
import { PhotoboothState } from "@/lib/photobooth/types";

interface WebcamPreviewProps {
  state: PhotoboothState;
  stream: MediaStream | null;
  photoIndex: number;
  countdown: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  capturedPhotos: string[];
}

export default function WebcamPreview({
  state,
  stream,
  photoIndex,
  countdown,
  videoRef,
  capturedPhotos
}: WebcamPreviewProps) {
  
  // Attach the media stream to the video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  const showVideo = state === "LIVE_PREVIEW" || state === "COUNTDOWN" || state === "CAPTURING";
  const showCountdown = state === "COUNTDOWN" && countdown > 0;
  const showFlash = state === "CAPTURING";
  const showConfirm = state === "CONFIRM_CAPTURE";
  const confirmPhoto = showConfirm && capturedPhotos && capturedPhotos[photoIndex];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden p-4 aspect-video md:aspect-[4/3] flex flex-col relative w-full max-w-md mx-auto">
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-3 text-[var(--text-primary)] font-medium text-sm border-b border-[var(--border-color)] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <span>
            {showConfirm ? "KONFIRMASI FOTO" : "LIVE PREVIEW"}
          </span>
        </div>
        {(showVideo || showConfirm) && (
          <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2.5 py-0.5 rounded-full text-xs font-semibold">
            SLOT {photoIndex + 1} / {capturedPhotos.length}
          </span>
        )}
      </div>

      {/* Screen Area */}
      <div className="flex-1 bg-[var(--text-primary)]/5 rounded-xl overflow-hidden relative flex items-center justify-center border border-[var(--border-color)]/20">
        {/* Video stream always mounted, visibility toggled */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover scale-x-[-1] rounded-xl ${showVideo ? "block" : "hidden"}`}
        />

        {/* Captured image display */}
        {confirmPhoto && !showVideo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedPhotos[photoIndex]}
            alt={`Foto ${photoIndex + 1}`}
            className="w-full h-full object-cover scale-x-[-1] rounded-xl absolute inset-0"
          />
        )}

        {/* Standby/Error placeholder when neither video nor captured image should show */}
        {!showVideo && !confirmPhoto && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] absolute inset-0">
            {state === "REQUESTING_CAMERA" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="font-medium text-sm">Menghubungkan ke kamera...</p>
              </div>
            ) : state === "CAMERA_ERROR" ? (
              <div className="flex flex-col items-center gap-3 text-red-500">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-semibold text-sm">Akses Kamera Gagal</p>
                <p className="text-xs text-[var(--text-muted)] max-w-[250px] leading-relaxed">
                  Pastikan izin kamera telah diberikan dan kamera tidak sedang digunakan aplikasi lain.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-sm border border-[var(--border-color)]/20">
                  <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-medium text-[var(--text-primary)] text-sm">Kamera Belum Aktif</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">Kamera akan aktif setelah Anda menekan tombol di sebelah kanan.</p>
              </div>
            )}
          </div>
        )}

        {/* Countdown Overlay */}
        {showCountdown && (
          <div className="absolute inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="text-white text-8xl font-bold animate-pulse-slow">
              {countdown}
            </div>
          </div>
        )}

        {/* Flash Overlay */}
        {showFlash && (
          <div className="absolute inset-0 bg-white animate-flash z-20 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
