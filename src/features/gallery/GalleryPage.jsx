import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { galleryService } from './galleryService';
import Loading from '../../components/common/Loading';

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for each gallery item
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// Modal component for displaying the selected image
const ImageModal = ({ item, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt={item.title}
          className="h-auto max-h-[90vh] w-full rounded-lg object-contain"
        />
      </motion.div>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
        aria-label="Close image view"
      >
        <X size={24} />
      </button>
    </motion.div>
  );
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    document.title = 'Galeri Foto Intanium | Album Memori Komunitas';
    galleryService.getGalleryPhotos()
      .then((data) => {
        const filtered = data.filter(p => p.display_type === 'gallery' || p.display_type === 'both');
        setPhotos(filtered);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const mappedImageItems = photos.map((photo, index) => {
    const spans = [
      "md:col-span-2 md:row-span-2",
      "md:row-span-1",
      "md:row-span-1",
      "md:row-span-2",
      "md:row-span-1",
      "md:col-span-2 md:row-span-1",
    ];
    return {
      id: photo.id,
      title: photo.title,
      desc: photo.description || '',
      url: photo.url,
      span: spans[index % spans.length]
    };
  });

  // Calculate draggable constraint for bento grid
  useEffect(() => {
    const calculateConstraints = () => {
      if (gridRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const gridWidth = gridRef.current.scrollWidth;
        const newConstraint = Math.min(0, containerWidth - gridWidth - 32);
        setDragConstraint(newConstraint);
      }
    };

    calculateConstraints();
    window.addEventListener("resize", calculateConstraints);
    return () => window.removeEventListener("resize", calculateConstraints);
  }, [photos]);



  return (
    <div className="w-full animate-fade-in space-y-10">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl font-extrabold text-(--color-primary) sm:text-5xl tracking-tight">
          Galeri Foto Intanium
        </h1>
        <p className="text-sm leading-relaxed text-(--text-secondary) sm:text-base">
          Koleksi tangkapan layar momen-momen seru streaming, foto kenangan event bersama, poster visual utama, serta grafis promo resmi Intan.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Loading message="Mengunduh album galeri..." />
        </div>
      ) : (
        <section
          ref={targetRef}
          className="relative w-full overflow-hidden bg-background py-2 sm:py-4"
        >
          <div
            ref={containerRef}
            className="relative mt-4 w-full cursor-grab active:cursor-grabbing"
          >
            <motion.div
              className="w-max"
              drag="x"
              dragConstraints={{ left: dragConstraint, right: 0 }}
              dragElastic={0.05}
            >
              <motion.div
                ref={gridRef}
                className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 px-4 md:px-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {mappedImageItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className={cn(
                      "group relative flex h-full min-h-[15rem] w-full min-w-[15rem] cursor-pointer items-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                      item.span,
                    )}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Lihat foto: ${item.title}`}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/80">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence>
            {selectedItem && (
              <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
