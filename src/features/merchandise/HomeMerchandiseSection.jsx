import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import { ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  }
};

const ProductCard = ({ product }) => {
  const images = useMemo(() => {
    const urls = (product.image_urls ?? product.imageUrls ?? []).filter(Boolean);
    return urls.length > 0 ? urls : [product.image_url ?? product.imageUrl].filter(Boolean);
  }, [product.image_url, product.imageUrl, product.image_urls, product.imageUrls]);

  const [imgIndex, setImgIndex] = useState(0);

  // imgIndex resets to 0 automatically when key changes, so useEffect is redundant

  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setImgIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [images.length]);

  const visibleThumbs = images.slice(0, 4);
  const extraCount = Math.max(0, images.length - visibleThumbs.length);

  const isAvailable = product.is_available ?? product.isAvailable ?? true;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className="group h-full select-none"
    >
      <Link to={`/merchandise/${product.id}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-[1.75rem]">
        <Card
          padding="none"
          hoverEffect={true}
          className="flex flex-col border border-[var(--border-color)] overflow-hidden h-full shadow-sm bg-white hover:shadow-md transition-all rounded-[1.75rem] p-3.5 gap-3.5 relative"
        >
          {/* Out of Stock Ribbon */}
          {!isAvailable ? (
            <span className="absolute top-6 left-6 z-30 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] uppercase tracking-widest font-black text-white border border-white/10 select-none pointer-events-none">
              HABIS
            </span>
          ) : (
            /* Green NEW badge like the screenshot */
            product.id === 'merch-1' && (
              <span className="absolute top-6 left-6 z-30 px-2 py-0.5 rounded bg-[#00B050] text-[9px] uppercase tracking-wide font-black text-white select-none pointer-events-none">
                NEW
              </span>
            )
          )}

          {/* Image container inside the padded card */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black/5">
            {images.map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={index === 0 ? product.name : ''}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
                  index === imgIndex ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            ))}

            {/* LIHAT PRODUK hover button overlay */}
            {isAvailable && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-20">
                <div className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-extrabold text-[9px] sm:text-[10px] tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 select-none">
                  LIHAT PRODUK
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[var(--color-primary)]">
                    <ArrowRight className="w-2.5 h-2.5 stroke-[3.5]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content details */}
          <div className="px-1 flex flex-col justify-between flex-grow gap-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block select-none">
                {product.category}
              </span>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--color-primary)] transition-colors">
                {product.name}
              </h4>
            </div>

            {/* Row at the bottom: Price on the left, circles on the right */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-1">
              <span className="text-sm sm:text-base font-black text-slate-900 block">
                {formatCurrency(product.price)}
              </span>

              {/* Thumbnail bubbles on the right */}
              {visibleThumbs.length > 1 ? (
                <div className="flex items-center gap-1 select-none">
                  {visibleThumbs.map((src, index) => (
                    <motion.button
                      key={`${src}-${index}`}
                      type="button"
                      aria-label={`Lihat gambar ${index + 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImgIndex(index);
                      }}
                      whileTap={{ scale: 0.92 }}
                      className={`flex h-6.5 w-6.5 items-center justify-center rounded-full border p-0.5 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                        index === imgIndex
                          ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] bg-white'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
                    </motion.button>
                  ))}
                  {extraCount > 0 ? (
                    <span className="text-[9px] font-extrabold text-slate-400">+{extraCount}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

const PaginationDots = ({ totalPages, activePage, labelPrefix, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex justify-center items-center gap-2 select-none">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange(index + 1)}
          aria-label={`Pindah ke halaman ${index + 1} ${labelPrefix}`}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${activePage === index + 1
            ? "bg-[var(--color-primary)] w-6 shadow-[0_0_8px_rgba(74,122,191,0.4)]"
            : "bg-[var(--border-color)] hover:bg-[var(--color-primary-light)]"
            }`}
        />
      ))}
    </div>
  );
};

export default function HomeMerchandiseSection({ products = [] }) {
  const [recentPage, setRecentPage] = useState(1);
  const itemsPerPage = 4;

  // Fetch only active dynamic products
  const recentProducts = [...products];
  const recentTotalPages = Math.ceil(recentProducts.length / itemsPerPage) || 1;
  const recentDisplayProducts = recentProducts.slice((recentPage - 1) * itemsPerPage, recentPage * itemsPerPage);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-4 space-y-6">

      {/* Products — Produk Terbaru Section Header */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 select-none">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight">
            Merchandise Official Intanium
          </h3>
        </div>
        <Link
          to={ROUTES.MERCHANDISE}
          className="text-xs font-bold text-[var(--color-primary-hover)] hover:underline flex items-center gap-1 cursor-pointer pb-0.5 transition-all"
        >
          Lihat semua <span className="text-[var(--color-primary-hover)] font-bold">→</span>
        </Link>
      </div>

      {/* Grid Layout (Mobile & Desktop) */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`recent-grid-${recentPage}`}
            variants={cardContainerVariants}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
          >
            {recentDisplayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <PaginationDots
          totalPages={recentTotalPages}
          activePage={recentPage}
          labelPrefix="produk terbaru"
          onChange={setRecentPage}
        />
      </div>

    </section>
  );
}
