"use client";

import React from "react";
import { PhotoboothState } from "@/lib/photobooth/types";

interface ControlPanelProps {
  state: PhotoboothState;
  onSelectFrameNext: () => void;
  onStart: () => void; // request camera permission
  onStartUpload: () => void;
  onRetry: () => void; // retake current photo index
  onRetake: () => void; // reset all / start over
  onDownload: () => void;
  onShare: () => void;
  onProcessUpload: () => void; // finalize photostrip -> REVIEW
  onCancelUpload: () => void; // cancel / back
  canShare: boolean;
  uploadedCount: number;
  slotsCount: number;
  photoIndex: number;
  onCaptureClick: () => void; // take photo (trigger countdown)
  onConfirmPhoto: () => void; // confirm slot photo
  isAllCaptured: boolean; // checks if all slots are filled
  photoScale: number; // scale value for current slot (1.0 - 2.5)
  onScaleChange: (scale: number) => void;
  showZoomSlider: boolean;
}

export default function ControlPanel({
  state,
  onSelectFrameNext,
  onStart,
  onStartUpload,
  onRetry,
  onRetake,
  onDownload,
  onShare,
  onProcessUpload,
  onCancelUpload,
  canShare,
  uploadedCount,
  slotsCount,
  photoIndex,
  onCaptureClick,
  onConfirmPhoto,
  isAllCaptured,
  photoScale,
  onScaleChange,
  showZoomSlider
}: ControlPanelProps) {
  const isSelectFrame = state === "SELECT_FRAME";
  const isSelectInput = state === "SELECT_INPUT_MODE";
  const isError = state === "CAMERA_ERROR";
  const isRequesting = state === "REQUESTING_CAMERA";
  const isLivePreview = state === "LIVE_PREVIEW";
  const isCountdown = state === "COUNTDOWN";
  const isCapturing = state === "CAPTURING";
  const isConfirmCapture = state === "CONFIRM_CAPTURE";
  const isUploadPreview = state === "UPLOAD_PREVIEW";
  const isReview = state === "REVIEW";
  const isExporting = state === "EXPORTING";

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center gap-4 w-full max-w-sm mx-auto h-full min-h-[260px]">
      {/* Step Indicator Header */}
      <div className="flex justify-between items-center text-[10px] text-[var(--color-primary)] font-bold tracking-wider uppercase border-b border-[var(--border-color)]/20 pb-2">
        <span>LANGKAH / STEP</span>
        <span className="bg-[var(--color-primary-light)] px-2 py-0.5 rounded-sm">
          {isSelectFrame && "1 dari 4"}
          {isSelectInput && "2 dari 4"}
          {(isRequesting || isError || isLivePreview || isCountdown || isCapturing || isConfirmCapture || isUploadPreview) && "3 dari 4"}
          {(isReview || isExporting) && "4 dari 4"}
        </span>
      </div>

      <div className="text-center mb-2">
        <h3 className="font-bold text-xl text-[var(--text-primary)]">
          {isSelectFrame && "Pilih Bingkai Foto"}
          {isSelectInput && "Pilih Metode Foto"}
          {isRequesting && "Membuka Kamera"}
          {isError && "Akses Kamera Gagal"}
          {isLivePreview && `Foto Slot ke-${photoIndex + 1} / ${slotsCount}`}
          {isCountdown && "Siap-siap..."}
          {isCapturing && "Cekrek!"}
          {isConfirmCapture && `Konfirmasi Foto Slot ${photoIndex + 1} / ${slotsCount}`}
          {isUploadPreview && `Unggah Foto (${uploadedCount}/${slotsCount})`}
          {isReview && "Hasil Photostrip Kamu!"}
          {isExporting && "Menyimpan Gambar..."}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
          {isSelectFrame && "Pilih tema bingkai foto Anda (Klasik Vertikal, Kotak Grid, atau Lebar Horisontal) sebelum memotret."}
          {isSelectInput && "Ambil pose foto langsung menggunakan kamera webcam perangkat Anda, atau unggah foto yang sudah ada dari galeri."}
          {isRequesting && "Berikan izin kamera jika muncul petunjuk dari browser Anda."}
          {isError && "Kami membutuhkan akses webcam Anda untuk mengambil foto secara langsung."}
          {isLivePreview && `Posisikan diri Anda di depan kamera, lalu klik tombol Ambil Foto di bawah untuk slot foto ke-${photoIndex + 1}.`}
          {isCountdown && "Pose yang kece! Hitung mundur sedang berjalan..."}
          {isCapturing && "Sedang mengambil gambar, harap diam sejenak."}
          {isConfirmCapture && "Apakah foto slot ini sudah pas? Anda bisa memperbesar/kecilkan gambar sebelum menyimpannya."}
          {isUploadPreview && `Unggah ${slotsCount} file foto di panel sebelah kiri untuk menyusun photostrip.`}
          {isReview && "Photostrip Anda sudah siap! Anda bisa langsung mengunduh atau membagikan hasilnya sekarang."}
          {isExporting && "Sedang memproses komposit photostrip kualitas tinggi..."}
        </p>
      </div>

      {/* Zoom Slider */}
      {showZoomSlider && (
        <div className="flex flex-col gap-1.5 px-3 py-2.5 border border-[var(--border-color)]/20 my-1 bg-black/5 rounded-xl">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-primary)]">
            <span>Sesuaikan Ukuran (Zoom)</span>
            <span className="text-[var(--color-primary)] font-bold">{Math.round(photoScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.05"
            value={photoScale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {/* Step 1: Select Frame */}
        {isSelectFrame && (
          <button
            onClick={onSelectFrameNext}
            aria-label="Lanjut ke pemilihan metode pengambilan foto"
            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            Lanjut
          </button>
        )}

        {/* Step 2: Select Input Mode */}
        {isSelectInput && (
          <>
            <button
              onClick={onStart}
              aria-label="Mulai Foto menggunakan Kamera"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Gunakan Kamera
            </button>
            <button
              onClick={onStartUpload}
              aria-label="Mulai menggunakan Unggah Foto"
              className="w-full bg-transparent hover:bg-[var(--color-primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-base py-3.5 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" />
              </svg>
              Unggah Foto File
            </button>
            <button
              onClick={onCancelUpload}
              aria-label="Kembali ke pemilihan bingkai"
              className="w-full bg-transparent hover:bg-neutral-100 text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-base py-3.5 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
            >
              Kembali
            </button>
          </>
        )}

        {/* Step 3 (Camera): Live Preview */}
        {isLivePreview && (
          <>
            <button
              onClick={onCaptureClick}
              aria-label="Ambil foto selfie"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ambil Foto
            </button>
            
            {isAllCaptured && (
              <button
                onClick={onProcessUpload}
                aria-label="Proses hasil foto menjadi photostrip"
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-base py-3 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
              >
                Proses Photostrip
              </button>
            )}

            <button
              onClick={onCancelUpload}
              aria-label="Kembali ke menu pemilihan metode"
              className="w-full bg-transparent hover:bg-neutral-100 text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-base py-3.5 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
            >
              Kembali
            </button>
          </>
        )}

        {/* Step 3 (Camera): Confirm Capture */}
        {isConfirmCapture && (
          <>
            <button
              onClick={onConfirmPhoto}
              aria-label="Konfirmasi dan simpan foto ini"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
            >
              Simpan Foto
            </button>
            <button
              onClick={onRetry}
              aria-label="Ambil ulang pose untuk slot ini"
              className="w-full bg-transparent hover:bg-red-50 text-red-500 border border-red-200 font-semibold text-base py-3 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
            >
              Foto Ulang Slot Ini
            </button>
          </>
        )}

        {/* Step 3 (Upload): Uploading Photos */}
        {isUploadPreview && (
          <>
            <button
              onClick={onProcessUpload}
              disabled={uploadedCount < 4}
              aria-label="Proses hasil foto menjadi photostrip"
              className={`w-full font-semibold text-base py-3.5 px-6 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
                uploadedCount === 4
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white shadow-md active:scale-95 cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300"
              }`}
            >
              Proses Photostrip
            </button>
            <button
              onClick={onCancelUpload}
              aria-label="Batal dan kembali ke menu pemilihan metode"
              className="w-full bg-transparent hover:bg-neutral-100 text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-base py-3.5 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
            >
              Kembali
            </button>
          </>
        )}

        {/* Retry Camera Button (when camera error) */}
        {isError && (
          <button
            onClick={onRetry}
            aria-label="Coba Aktifkan Kamera Lagi"
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-base py-3 px-6 rounded-xl transition-all active:scale-95 cursor-pointer text-center"
          >
            Coba Lagi
          </button>
        )}

        {/* Loading / Disabled states during capture countdown */}
        {isRequesting && (
          <button
            disabled
            className="w-full bg-[var(--color-primary-light)] text-[var(--text-muted)] font-semibold text-base py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-[var(--border-color)]/20"
          >
            <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
            Menghubungkan...
          </button>
        )}

        {isCountdown && (
          <button
            disabled
            className="w-full bg-[var(--color-primary-light)] text-[var(--text-muted)] font-semibold text-base py-3 px-6 rounded-xl cursor-not-allowed text-center border border-[var(--border-color)]/20 animate-pulse"
          >
            Hitung Mundur...
          </button>
        )}

        {isCapturing && (
          <button
            disabled
            className="w-full bg-[var(--color-primary-light)] text-[var(--text-muted)] font-semibold text-base py-3 px-6 rounded-xl cursor-not-allowed text-center border border-[var(--border-color)]/20"
          >
            Memotret...
          </button>
        )}

        {/* Step 4: Review Action Buttons */}
        {isReview && (
          <>
            <button
              onClick={onDownload}
              aria-label="Unduh Foto Ke Galeri"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-semibold text-base py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Foto
            </button>

            {canShare && (
              <button
                onClick={onShare}
                aria-label="Bagikan Foto"
                className="w-full bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-primary)] font-semibold text-base py-3 px-6 rounded-xl border border-[var(--color-primary)]/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.684-2.342m0 5.2l-4.684-2.342M19 12a3 3 0 11-6 0 3 3 0 016 0zM6 6a3 3 0 11-6 0 3 3 0 016 0zm0 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bagikan
              </button>
            )}

            <button
              onClick={onRetake}
              aria-label="Mulai Baru (Reset Semua)"
              className="w-full bg-transparent hover:bg-[var(--color-primary-light)] text-[var(--text-primary)] border border-[var(--border-color)] font-semibold text-base py-3 px-6 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
              Mulai Baru
            </button>
          </>
        )}

        {isExporting && (
          <button
            disabled
            className="w-full bg-[var(--color-primary-light)] text-[var(--text-muted)] font-semibold text-base py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-[var(--border-color)]/20"
          >
            <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
            Mengekspor...
          </button>
        )}
      </div>
    </div>
  );
}
