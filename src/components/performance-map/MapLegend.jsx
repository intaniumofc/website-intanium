'use client';

import React from 'react';

export default function MapLegend({ onairCount = 0, offairCount = 0 }) {
  return (
    <div className="bg-white/98 backdrop-blur-xl border border-slate-300 rounded-2xl p-3 sm:p-3.5 shadow-2xl text-slate-800 text-xs font-sans select-none space-y-2 min-w-[170px] max-w-[210px]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7BC4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2E7BC4]"></span>
            </span>
            <span className="flex items-center gap-1.5 font-extrabold text-[#2E7BC4]">
              On-Air (Blue)
            </span>
          </div>
          <span className="font-black text-slate-900">{onairCount}</span>
        </div>

        <div className="flex items-center justify-between gap-3 text-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5FB2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF5FB2]"></span>
            </span>
            <span className="flex items-center gap-1.5 font-extrabold text-[#FF5FB2]">
              Off-Air (Pink)
            </span>
          </div>
          <span className="font-black text-slate-900">{offairCount}</span>
        </div>
      </div>
    </div>
  );
}
