import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioGallery } from '../../components/ui/portfolio-gallery';
import { ROUTES } from '../../lib/constants';
import { galleryService } from './galleryService';
import { getOptimizedImageUrl } from '../../lib/helpers';

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
    title: 'Intanium Cozy Pajamas Outfit',
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
    src: getOptimizedImageUrl(photo.url, { width: 400 }),
    alt: photo.title,
    title: photo.title
  }));

  return (
    <div className="relative w-full">
      {/* Portfolio Gallery 3D & Marquee Component */}
      <PortfolioGallery
        title="Galeri Kilau Intanium"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
          >
            {/* Close Button in top right */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Wrapper with AnimatePresence for navigating */}
            <div
              className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image
            >
              {/* Previous Button */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 sm:-left-16 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all cursor-pointer"
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
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl max-w-full"
              >
                <img
                  src={getOptimizedImageUrl(photos[activePhotoIdx].url, { width: 1000 })}
                  alt={photos[activePhotoIdx].title}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl block"
                />

                {/* Meta details strip at bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 text-white flex justify-between items-center select-none">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-[var(--color-primary-light)]">
                      {photos[activePhotoIdx].category || 'Showcase'}
                    </span>
                    <h5 className="font-extrabold text-sm sm:text-base leading-tight mt-0.5">
                      {photos[activePhotoIdx].title}
                    </h5>
                  </div>
                  <span className="text-xs text-white/75 bg-white/10 px-3 py-1 rounded-full font-bold">
                    {activePhotoIdx + 1} / {photos.length}
                  </span>
                </div>
              </motion.div>

              {/* Next Button */}
              <button
                onClick={nextPhoto}
                className="absolute right-2 sm:-right-16 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all cursor-pointer"
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
