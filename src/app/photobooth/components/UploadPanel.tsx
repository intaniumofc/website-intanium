"use client";

import React, { useRef } from "react";

interface UploadPanelProps {
  photos: string[]; // array of 4 strings representing base64 data URLs
  onPhotoUploaded: (index: number, dataUrl: string) => void;
  onPhotoRemoved: (index: number) => void;
}

export default function UploadPanel({
  photos,
  onPhotoUploaded,
  onPhotoRemoved
}: UploadPanelProps) {
  
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoUploaded(index, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const slotsCount = photos.length;

  return (
    <div className="glass-panel rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col relative w-full max-w-md mx-auto">
      {/* Title Bar */}
      <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)] font-semibold text-sm border-b border-[var(--border-color)]/25 pb-2">
        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" />
        </svg>
        <span>UNGGAH FOTO ANDA</span>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed font-body">
        Pilih {slotsCount} foto terbaik dari galeri perangkat Anda untuk disusun ke dalam photostrip.
      </p>

      {/* Grid of Dynamic Upload Slots */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {photos.map((photoUrl, idx) => {
          const inputRef = React.createRef<HTMLInputElement>();

          return (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-dashed border-[var(--border-color)] bg-black/5 hover:bg-black/10 transition-colors flex flex-col items-center justify-center p-2 cursor-pointer group"
              onClick={() => {
                if (!photoUrl) {
                  inputRef.current?.click();
                }
              }}
            >
              {/* Hidden file input */}
              <input
                type="file"
                ref={inputRef}
                accept="image/*"
                onChange={(e) => handleFileChange(idx, e)}
                className="hidden"
              />

              {photoUrl ? (
                // Uploaded state
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  
                  {/* Hover overlay to change or delete */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inputRef.current?.click();
                      }}
                      className="bg-white/90 hover:bg-white text-[var(--color-primary)] text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm transition-all"
                    >
                      Ubah Foto
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhotoRemoved(idx);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                // Empty state
                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] text-center">
                  <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center border border-[var(--border-color)]/20 shadow-xs group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold text-[var(--text-primary)]">Foto {idx + 1}</span>
                  <span className="text-[9px] text-[var(--text-muted)] leading-tight max-w-[90px] block">Klik untuk memilih</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
