'use client';

import { useState, useEffect, useRef, createContext, useContext, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { galleryService } from '../../services/public/galleryService';
import Loading from '../../components/common/Loading';

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
  duration: 0.3,
};

const blurVariants = {
  hidden: {
    filter: "blur(10px)",
    opacity: 0,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
  },
};

const ContainerScrollContext = createContext(undefined);

function useContainerScrollContext() {
  const context = useContext(ContainerScrollContext);
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll Component"
    );
  }
  return context;
}

export const ContainerScroll = ({ children, className, style, ...props }) => {
  const [scrollElement, setScrollElement] = useState(null);
  const { scrollYProgress } = useScroll({
    target: scrollElement ? { current: scrollElement } : undefined,
    offset: ["start end", "end start"]
  });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={setScrollElement}
        className={cn("relative min-h-[140vh] w-full", className)}
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center top",
          transformStyle: "preserve-3d",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

export const ContainerSticky = ({ className, style, ...props }) => {
  return (
    <div
      className={cn(
        "sticky left-0 top-20 min-h-[35rem] w-full overflow-hidden",
        className
      )}
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center top",
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    />
  );
};
ContainerSticky.displayName = "ContainerSticky";

export const GalleryContainer = ({ children, className, style, isMobile, ...props }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const rotateX = useTransform(scrollYProgress, [0.1, 0.6], isMobile ? [24, 0] : [65, 0]);
  const scale = useTransform(scrollYProgress, [0.1, 0.6], [1.12, 1]);

  return (
    <motion.div
      className={cn(
        "relative grid size-full gap-4 rounded-2xl",
        className
      )}
      style={{
        rotateX,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
GalleryContainer.displayName = "GalleryContainer";

export const GalleryCol = ({ className, style, yRange = ["0%", "-10%"], ...props }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const y = useTransform(scrollYProgress, [0.1, 0.8], yRange);

  return (
    <motion.div
      className={cn("relative flex w-full flex-col gap-4", className)}
      style={{
        y,
        ...style,
      }}
      {...props}
    />
  );
};
GalleryCol.displayName = "GalleryCol";

export const ContainerStagger = forwardRef(({ className, viewport, transition, ...props }, ref) => {
  return (
    <motion.div
      className={cn("relative", className)}
      ref={ref}
      initial="hidden"
      whileInView={"visible"}
      viewport={{ once: true, ...viewport }}
      transition={{
        staggerChildren: transition?.staggerChildren || 0.2,
        ...transition,
      }}
      {...props}
    />
  );
});
ContainerStagger.displayName = "ContainerStagger";

export const ContainerAnimated = forwardRef(({ className, transition, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={blurVariants}
      transition={SPRING_CONFIG || transition}
      {...props}
    />
  );
});
ContainerAnimated.displayName = "ContainerAnimated";

// Modal component for displaying the selected image
const ImageModal = ({ item, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-[0_0_60px_rgba(255,95,178,0.2)] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex justify-center items-center bg-black/60 min-h-[250px] max-h-[70vh] overflow-hidden p-2">
          <img
            src={(item.url)?.src || (item.url)}
            alt={item.title}
            className="max-h-[70vh] w-full object-contain rounded-2xl block mx-auto transition-transform duration-300"
          />
        </div>

        <div className="w-full bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 text-white text-left select-none border-t border-white/15">
          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">{item.title}</h3>
          {item.desc && <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed">{item.desc}</p>}
        </div>
      </motion.div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[110] text-white hover:text-[#FF5FB2] bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-full transition-all cursor-pointer shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95"
        aria-label="Close image view"
      >
        <X size={22} />
      </button>
    </motion.div>
  );
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.title = 'Galeri Foto IRIS | Album Memori Komunitas';
    fetchPhotos(0);
  }, []);

  const fetchPhotos = async (currentOffset) => {
    try {
      if (currentOffset === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      const data = await galleryService.getGalleryPhotos(LIMIT, currentOffset);
      const filtered = data.filter(p => p.display_type === 'gallery' || p.display_type === 'both');
      
      if (data.length < LIMIT) {
        setHasMore(false);
      }

      if (currentOffset === 0) {
        setPhotos(filtered);
      } else {
        setPhotos(prev => {
          // Prevent duplicates just in case
          const existingIds = new Set(prev.map(p => p.id));
          const newPhotos = filtered.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPhotos];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchPhotos(newOffset);
  };

  const columns = useMemo(() => {
    if (isMobile) {
      // 2 columns layout on mobile
      const col1 = photos.filter((_, idx) => idx % 2 === 0);
      const col2 = photos.filter((_, idx) => idx % 2 === 1);
      return [
        { items: col1, yRange: ["0%", "-10%"] },
        { items: col2, yRange: ["0%", "-20%"] }
      ];
    } else {
      // 3 columns layout on desktop
      const col1 = photos.filter((_, idx) => idx % 3 === 0);
      const col2 = photos.filter((_, idx) => idx % 3 === 1);
      const col3 = photos.filter((_, idx) => idx % 3 === 2);
      return [
        { items: col1, yRange: ["0%", "-10%"] },
        { items: col2, yRange: ["0%", "-25%"] },
        { items: col3, yRange: ["0%", "-15%"] }
      ];
    }
  }, [photos, isMobile]);

  const renderPhotoCard = (item, idx) => {
    const aspectRatios = ["aspect-[3/4]", "aspect-square", "aspect-[4/3]"];
    const aspectClass = aspectRatios[idx % aspectRatios.length];

    return (
      <motion.div
        key={item.id}
        className={cn(
          "group relative flex w-full cursor-pointer items-end overflow-hidden rounded-2xl border border-[var(--border-color)] bg-card shadow-md transition-all duration-300 ease-in-out hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          aspectClass
        )}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setSelectedItem({ ...item, desc: item.description })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedItem({ ...item, desc: item.description });
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Lihat foto: ${item.title}`}
      >
        <img
          src={(item.url)?.src || (item.url)}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative z-10 p-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 text-left">
          <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight">{item.title}</h4>
          {item.description && (
            <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full animate-fade-in space-y-10">
      <div className="mx-auto max-w-3xl space-y-4 text-center select-none px-4">
        <h1 className="text-3xl font-extrabold text-(--color-primary) sm:text-5xl tracking-tight">
          Galeri Foto IRIS
        </h1>
        <p className="text-sm leading-relaxed text-(--text-secondary) sm:text-base">
          Koleksi tangkapan layar momen-momen seru streaming, foto kenangan event bersama, poster visual utama, serta grafis promo resmi Intan.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Loading message="Mengunduh album galeri..." />
        </div>
      ) : photos.length === 0 ? (
        <div className="py-24 text-center text-sm font-bold text-slate-500 font-sans">
          Belum ada foto yang diunggah ke dalam galeri.
        </div>
      ) : (
        <ContainerScroll className="w-full pb-16 pt-4">
          <ContainerSticky className="mx-auto max-w-7xl px-4 md:px-8 hide-scrollbar overflow-y-auto">
            <GalleryContainer
              className={isMobile ? "grid-cols-2" : "grid-cols-3"}
              isMobile={isMobile}
            >
              {columns.map((col, colIdx) => (
                <GalleryCol
                  key={colIdx}
                  yRange={col.yRange}
                >
                  {col.items.map((item, itemIdx) => renderPhotoCard(item, itemIdx))}
                </GalleryCol>
              ))}
            </GalleryContainer>
            
            {hasMore && (
              <div className="flex justify-center mt-12 mb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </ContainerSticky>
        </ContainerScroll>
      )}

      <AnimatePresence>
        {selectedItem && (
          <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
