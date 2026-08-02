'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ExternalLink, Sparkles, Building, Info, Navigation } from 'lucide-react';
import Image from 'next/image';

export default function PerformanceModal({ location, onClose }) {
  // Handle Keyboard Escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (location) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [location]);

  if (!location) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-performance-title"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 my-0 sm:my-8 max-h-[85vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Header Bar / Image Banner */}
          <div className="relative w-full h-36 sm:h-56 bg-slate-900 shrink-0">
            {location.photo_url ? (
              <Image
                src={location.photo_url}
                alt={location.title}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover opacity-90 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5FB2] via-[#A855F7] to-[#72C4FF] flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white/40 animate-pulse" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Tutup detail modal"
              className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-[#FF5FB2]"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Title & Location Header overlay */}
            <div className="absolute bottom-3 left-4 right-4 z-10 text-white space-y-0.5">
              <h2 id="modal-performance-title" className="text-lg sm:text-2xl font-black tracking-tight text-white line-clamp-2">
                {location.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                <Building className="w-3.5 h-3.5 text-[#72C4FF] shrink-0" />
                <span className="truncate">{location.venue_name}</span>
              </div>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-slate-800 text-sm">
            {/* Date & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-pink-50/60 p-3 sm:p-3.5 rounded-2xl border border-pink-200">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-pink-100 text-[#D83584] flex items-center justify-center shrink-0 border border-pink-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Tanggal Pelaksanaan</div>
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {formatDate(location.event_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-blue-100 text-[#2E7BC4] flex items-center justify-center shrink-0 border border-blue-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Kota & Provinsi</div>
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {location.city}{location.province ? `, ${location.province}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            {(location.description || location.summary) && (
              <div className="space-y-1.5">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#D83584]" /> Deskripsi Event
                </h3>
                <p className="text-slate-800 font-semibold leading-relaxed bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm">
                  {location.description || location.summary}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer / Source & Navigation Links */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#2E7BC4] hover:bg-blue-100 font-extrabold text-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#2E7BC4]" /> Google Maps
              </a>

              {location.source_url && (
                <a
                  href={location.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5FB2] to-[#FFA66E] text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition-opacity"
                >
                  Lihat Sumber <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-extrabold hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
