'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioGallery } from '../../components/ui/portfolio-gallery';
import { ROUTES } from '../../lib/constants';
import { galleryService } from '../../services/public/galleryService';

const GALLERY_PHOTOS = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    title: 'Visual Key Summer Party',
    category: 'Stage Performance',
    date: '24 Mei 2026'
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    title: 'Matcha Vibes Cafe Shooting',
    category: 'Casual Look',
    date: '10 April 2026'
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    title: '1st Anniversary Key Visual',
    category: 'Official Promotional',
    date: '18 Maret 2026'
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    title: 'Gita & Intan Concert Behind Stage',
    category: 'Stage Behind',
    date: '02 Februari 2026'
  },
  {
    id: 'photo-5',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    title: 'IRIS Cozy Pajamas Outfit',
    category: 'Casual Look',
    date: '12 Januari 2026'
  },
  {
    id: 'photo-6',
    url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&auto=format&fit=crop&q=80',
    title: 'Theater Show JKT48 Portrait',
    category: 'Stage Performance',
    date: '28 Desember 2025'
  }
];

export default function HomeGallerySection() {
  const [photos, setPhotos] = useState(GALLERY_PHOTOS);
  const [activePhotoIdx, setActivePhotoIdx] = useState(null);

  useEffect(() => {
    galleryService.getGalleryPhotos()
      .then((data) => {
        const showcasePhotos = data.filter(p => p.display_type === 'showcase' || p.display_type === 'both');
        if (showcasePhotos.length > 0) {
          setPhotos(showcasePhotos);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat showcase photos:', err);
      });
  }, []);

  const openLightbox = (index) => {
    setActivePhotoIdx(index);
  };

  const closeLightbox = () => {
    setActivePhotoIdx(null);
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Map to format required by PortfolioGallery
  const mappedImages = photos.map(photo => ({
    src: photo.url,
    alt: photo.title,
    title: photo.title
  }));

  return (
    <div className="relative w-full">
      {/* Portfolio Gallery 3D & Marquee Component */}
      <PortfolioGallery
        title="Galeri Kilau IRIS"
        archiveButton={{
          text: "Buka Galeri Foto",
          href: ROUTES.GALLERY
        }}
        images={mappedImages}
        onImageClick={openLightbox}
      />

      {/* Lightbox Overlay Modal */}
      <AnimatePresence>
        {activePhotoIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 md:p-10 select-none"
          >
            {/* Close Button in top right */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[110] text-white hover:text-[#FF5FB2] bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-full transition-all cursor-pointer shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Wrapper with AnimatePresence for navigating */}
            <div
              className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image
            >
              {/* Previous Button */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 sm:-left-16 z-[110] text-white hover:text-[#FF5FB2] bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-full transition-all cursor-pointer shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
                aria-label="Foto Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <motion.div
                key={photos[activePhotoIdx].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-[0_0_60px_rgba(255,95,178,0.2)] flex flex-col justify-center items-center"
              >
                <div className="relative w-full flex justify-center items-center bg-black/60 min-h-[300px] max-h-[68vh] overflow-hidden p-2">
                  <img
                    src={(photos[activePhotoIdx].url)?.src || (photos[activePhotoIdx].url)}
                    alt={photos[activePhotoIdx].title}
                    className="max-h-[68vh] w-full object-contain rounded-2xl block mx-auto transition-transform duration-300"
                  />
                </div>

                {/* Meta details strip at bottom */}
                <div className="w-full bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 text-white flex justify-between items-center select-none border-t border-white/15 gap-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] uppercase font-black tracking-widest text-[#FF5FB2] bg-[#FF5FB2]/15 border border-[#FF5FB2]/30 px-3 py-0.5 rounded-full inline-block">
                      {photos[activePhotoIdx].category || 'Showcase'}
                    </span>
                    <h5 className="font-extrabold text-base sm:text-lg text-white leading-snug drop-shadow-sm">
                      {photos[activePhotoIdx].title}
                    </h5>
                  </div>
                  <span className="text-xs text-white bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-full font-bold shrink-0 shadow-xs">
                    {activePhotoIdx + 1} / {photos.length}
                  </span>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={nextPhoto}
                className="absolute right-2 sm:-right-16 z-[110] text-white hover:text-[#FF5FB2] bg-white/10 hover:bg-white/20 border border-white/20 p-3.5 rounded-full transition-all cursor-pointer shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
                aria-label="Foto Selanjutnya"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
