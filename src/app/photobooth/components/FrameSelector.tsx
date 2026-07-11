"use client";

import React from "react";
import Image from "next/image";
import { FrameConfig } from "@/lib/photobooth/types";

interface FrameSelectorProps {
  frames: FrameConfig[];
  activeFrameId: string;
  onSelectFrame: (frameId: string) => void;
  disabled?: boolean;
}

export default function FrameSelector({
  frames,
  activeFrameId,
  onSelectFrame,
  disabled = false
}: FrameSelectorProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-bold text-sm text-[var(--text-primary)]">PILIH BINGKAI FOTO</span>
      </div>

      <div 
        className={`flex gap-4 overflow-x-auto pb-3 pt-1 px-1 snap-x scrollbar-thin scrollbar-thumb-[var(--color-primary-light)] scrollbar-track-transparent ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {frames.map((frame) => {
          const isActive = frame.id === activeFrameId;
          
          return (
            <button
              key={frame.id}
              onClick={() => !disabled && onSelectFrame(frame.id)}
              disabled={disabled}
              className={`flex-none snap-start relative group rounded-xl overflow-hidden transition-all duration-200 focus:outline-hidden ${
                isActive 
                  ? "ring-4 ring-[var(--color-primary)] scale-[1.02] shadow-md" 
                  : "ring-2 ring-white/40 hover:ring-[var(--color-primary-light)] hover:scale-[1.01] shadow-xs"
              }`}
              style={{ width: "130px" }}
            >
              {/* Aspect Ratio Container for Thumbnail */}
              <div className="w-full aspect-[2/3] relative bg-neutral-100 flex items-center justify-center">
                <Image
                  src={frame.thumbnail}
                  alt={frame.name}
                  fill
                  sizes="130px"
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Active check overlay */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white rounded-full p-1 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title label */}
              <div className="bg-white/90 backdrop-blur-xs py-1.5 px-2 text-center border-t border-neutral-100">
                <p className="text-[10px] font-semibold text-[var(--text-primary)] truncate leading-none">
                  {frame.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
