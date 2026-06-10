import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { merchandiseService } from './merchandiseService';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import Button from '../../components/common/Button';
import { CreditCard, Search } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Harga: Rendah ke Tinggi', value: 'price_asc' },
  { label: 'Harga: Tinggi ke Rendah', value: 'price_desc' },
  { label: 'Nama: A-Z', value: 'name_asc' },
];

const ITEMS_PER_PAGE = 12;

const fadeUpContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20, rotateY: -6, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const drawerOverlayVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25 },
  },
};

const drawerPanelVariants = {
  hidden: { x: 50, opacity: 0.95 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 24,
    },
  },
  exit: {
    x: 30,
    opacity: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

const PRODUCT_CATEGORY_OPTIONS = [
  { label: 'Semua Kategori', value: '' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Collectibles', value: 'Collectibles' },
  { label: 'Art Prints', value: 'Art Prints' },
];

function getCategoryLabel(value) {
  const option = PRODUCT_CATEGORY_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
}



function buildProductsLink(options) {
  const params = new URLSearchParams();

  if (options.query) params.set('q', options.query);
  if (options.category) params.set('category', options.category);
  if (options.newOnly) params.set('new', '1');

  const queryString = params.toString();
  return queryString ? `/merchandise?${queryString}` : '/merchandise';
}

export default function MerchandisePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const newOnly = searchParams.get('new') === '1';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gridCols, setGridCols] = useState(3);
  const [sortValue, setSortValue] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(true);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    merchandiseService.getProducts('All', '')
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Gagal memuat katalog produk.');
        setLoading(false);
      });
  }, []);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (query.trim()) {
      const term = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    if (category && category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    if (newOnly) {
      // Show merch-1, merch-2, merch-3 as new arrivals
      result = result.filter(p => p.id === 'merch-1' || p.id === 'merch-2' || p.id === 'merch-3');
    }

    return result;
  }, [products, query, category, newOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const nextProducts = [...filteredProducts];

    if (sortValue === 'price_asc') {
      return nextProducts.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    if (sortValue === 'price_desc') {
      return nextProducts.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    if (sortValue === 'name_asc') {
      return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    return nextProducts; // newest / default
  }, [filteredProducts, sortValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, newOnly, query]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (visiblePage - 1) * ITEMS_PER_PAGE,
    visiblePage * ITEMS_PER_PAGE,
  );

  const heading = useMemo(() => {
    if (query) return `Hasil pencarian "${query}"`;
    if (newOnly) return 'New Arrival';
    if (category) return getCategoryLabel(category);
    return 'Semua Produk';
  }, [category, newOnly, query]);

  const resultLabel = useMemo(() => {
    if (query) return 'Hasil Terpilih';
    if (newOnly) return 'New Arrival';
    return 'Katalog Resmi';
  }, [newOnly, query]);

  const hasFilter = Boolean(query || category || newOnly);

  const gridClassName = {
    2: 'grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[gridCols];

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="border-b border-[var(--border-color)] bg-white/60 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                {resultLabel}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-primary)]">{heading}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
                Miliki koleksi produk eksklusif persembahan Intan & Komunitas Intanium. Seluruh keuntungan penjualan didedikasikan untuk mendukung kelangsungan aktivitas streaming Intan!
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center ml-0 md:ml-auto">
              {hasFilter ? (
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/merchandise"
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-white px-4 py-2 text-xs font-bold text-[var(--text-secondary)] transition hover:bg-slate-50 cursor-pointer shadow-sm"
                  >
                    <IconClose />
                    Reset filter
                  </Link>
                </motion.div>
              ) : null}

              <Link to={ROUTES.PAYMENT_CONFIRM}>
                <Button variant="secondary" size="sm" className="flex items-center gap-1.5 shadow-sm">
                  <Search className="h-4 w-4" /> Cek Pesanan
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-0 xl:gap-8 py-2">
          <aside className="hidden w-[260px] shrink-0 xl:block">
            <SidebarContent
              query={query}
              category={category}
              newOnly={newOnly}
              categoryExpanded={categoryExpanded}
              setCategoryExpanded={setCategoryExpanded}
            />
          </aside>

          <main className="min-w-0 flex-1">
            <motion.div
              layout
              className="mb-5 flex flex-wrap items-center gap-3"
              transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
            >
              <motion.button
                type="button"
                onClick={() => setDrawerOpen(true)}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer xl:hidden"
              >
                <IconFilter />
                Filter & Cari
              </motion.button>

              <AnimatePresence mode="popLayout">
                {newOnly ? (
                  <motion.div
                    key="pill-new"
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FilterPill tone="amber">New Arrival</FilterPill>
                  </motion.div>
                ) : null}
                {category ? (
                  <motion.div
                    key={`pill-category-${category}`}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FilterPill tone="primary">{getCategoryLabel(category)}</FilterPill>
                  </motion.div>
                ) : null}
                {query ? (
                  <motion.div
                    key={`pill-query-${query}`}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FilterPill tone="slate">Kata kunci: {query}</FilterPill>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <p className="ml-auto text-xs font-bold text-[var(--text-secondary)]">
                <span className="font-extrabold text-[var(--color-primary)] text-sm">{sortedProducts.length}</span> produk ditemukan
              </p>

              <div className="hidden items-center gap-0.5 rounded-xl border border-[var(--border-color)] bg-white p-1 shadow-sm sm:flex">
                {[2, 3, 4].map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setGridCols(value)}
                    title={`${value} kolom`}
                    whileTap={{ scale: 0.94 }}
                    className={`flex items-center justify-center rounded-lg p-2 transition-all duration-150 cursor-pointer ${gridCols === value
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                  >
                    {value === 2 ? <Grid2 /> : value === 3 ? <Grid3 /> : <Grid4 />}
                  </motion.button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={sortValue}
                  onChange={(event) => {
                    setSortValue(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none cursor-pointer rounded-xl border border-[var(--border-color)] bg-white py-2 pl-4 pr-8 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconChevronDown open={false} />
                </span>
              </div>
            </motion.div>

            {loading ? (
              <ProductGridSkeleton cols={gridCols} />
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-sm text-red-600 font-semibold shadow-sm"
              >
                {error}
              </motion.div>
            ) : paginatedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-dashed border-[var(--border-color)] bg-white/50 backdrop-blur-md px-6 py-12 text-center text-sm text-[var(--text-secondary)] font-bold shadow-sm"
              >
                Produk yang dicari belum tersedia.
              </motion.div>
            ) : (
              <motion.div
                layout
                variants={fadeUpContainer}
                initial="hidden"
                animate="show"
                className={`grid gap-4 sm:gap-6 ${gridClassName}`}
                transition={{ layout: { duration: 0.35, ease: 'easeInOut' } }}
              >
                {paginatedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    variants={fadeUpItem}
                    transition={{ layout: { duration: 0.35, ease: 'easeInOut' } }}
                    className="[transform-style:preserve-3d]"
                    style={{ transformPerspective: 900, transformOrigin: 'center bottom' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {totalPages > 1 ? (
              <Pagination current={visiblePage} total={totalPages} onChange={handlePageChange} />
            ) : null}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              variants={drawerOverlayVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setDrawerOpen(false)}
            />

            <motion.div
              variants={drawerPanelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative ml-auto h-full w-[300px] overflow-y-auto bg-white shadow-2xl z-10 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-800">
                  <IconFilter />
                  Filter & Cari
                </div>
                <motion.button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  whileTap={{ scale: 0.92 }}
                  className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
                >
                  <IconClose />
                </motion.button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <SidebarContent
                  query={query}
                  category={category}
                  newOnly={newOnly}
                  categoryExpanded={categoryExpanded}
                  setCategoryExpanded={setCategoryExpanded}
                  onLinkClick={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FilterPill({ children, tone }) {
  const className = {
    amber: 'border border-amber-200 bg-amber-50 text-amber-700',
    primary: 'border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    slate: 'border border-slate-200 bg-slate-100 text-slate-600',
  }[tone];

  return (
    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className} shadow-sm`}>
      {children}
    </span>
  );
}

function SidebarContent({
  query,
  category,
  newOnly,
  categoryExpanded,
  setCategoryExpanded,
  onLinkClick,
}) {
  const [searchVal, setSearchVal] = useState(query);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchVal(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchVal.trim()) {
      nextParams.set('q', searchVal.trim());
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams);
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="space-y-5">
      {/* Search Input Panel */}
      <div className="glass-panel rounded-2xl bg-white p-4.5 shadow-sm border border-[var(--border-color)]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Cari Produk</h3>
        <form onSubmit={handleSearchSubmit} className="mt-3 relative flex items-center">
          <input
            type="text"
            placeholder="Cari..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--text-primary)] font-semibold focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
          />
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        </form>
      </div>

      <FilterSection
        title="Kategori Produk"
        expanded={categoryExpanded}
        onToggle={() => setCategoryExpanded(!categoryExpanded)}
      >
        {PRODUCT_CATEGORY_OPTIONS.map((option) => {
          const active = category === option.value || (!category && option.value === '');

          return (
            <Link
              key={option.value || 'all-products'}
              to={buildProductsLink({ query, category: option.value, newOnly })}
              onClick={onLinkClick}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition ${active
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
                }`}
            >
              <span>{option.label}</span>
              {active ? <IconChevronRight /> : null}
            </Link>
          );
        })}
      </FilterSection>

      <div className="glass-panel rounded-2xl bg-white p-4.5 shadow-sm border border-[var(--border-color)]">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Mode Katalog</h3>
        <div className="mt-3.5 space-y-2">
          <Link
            to={buildProductsLink({ query, category, newOnly: false })}
            onClick={onLinkClick}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition ${!newOnly
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
              }`}
          >
            <span>Semua Produk</span>
            {!newOnly ? <IconChevronRight /> : null}
          </Link>
          <Link
            to={buildProductsLink({ query, category, newOnly: true })}
            onClick={onLinkClick}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition ${newOnly
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                : 'text-slate-700 hover:bg-slate-100'
              }`}
          >
            <span>New Arrival</span>
            {newOnly ? <IconChevronRight /> : null}
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-2xl bg-white p-4.5 shadow-sm border border-[var(--border-color)] space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Layanan</h3>
        {[
          { title: 'Pengiriman', sub: 'Pengiriman aman untuk official merch.' },
          { title: 'Support', sub: 'Tim bantuan siap membantu proses belanja Anda.' },
          { title: 'Official Guarantee', sub: 'Produk Intan autentik dan resmi.' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700 select-none">
              {index + 1}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800">{item.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl bg-white p-4.5 shadow-sm border border-[var(--border-color)]">
        <h3 className="mb-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Ikuti Kami</h3>
        <div className="flex gap-2">
          {[
            { label: 'Instagram', href: 'https://www.instagram.com/intan.jkt48' },
            { label: 'X', href: 'https://x.com/N_IntanJKT48' },
            { label: 'TikTok', href: 'https://www.tiktok.com/@jkt48.intan' }
          ].map((social) => (
            <SocialLink key={social.label} href={social.href} label={social.label}>
              {social.label === 'Instagram' ? (
                <InstagramIcon />
              ) : social.label === 'TikTok' ? (
                <TikTokIcon />
              ) : (
                <XIcon />
              )}
            </SocialLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, expanded, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white shadow-sm glass-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50 cursor-pointer font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider"
      >
        <span>{title}</span>
        <IconChevronDown open={expanded} />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-t border-[var(--border-color)]/60 px-3 py-3 bg-white">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product }) {
  const isAvailable = product.is_available ?? product.isAvailable ?? true;

  const images = useMemo(() => {
    const urls = (product.image_urls ?? product.imageUrls ?? []).filter(Boolean);
    return urls.length > 0 ? urls : [product.image_url ?? product.imageUrl].filter(Boolean);
  }, [product.image_url, product.imageUrl, product.image_urls, product.imageUrls]);

  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    setImgIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setImgIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [images.length]);

  const visibleThumbs = images.slice(0, 4);
  const extraCount = Math.max(0, images.length - visibleThumbs.length);

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group text-center [backface-visibility:hidden] h-full flex flex-col bg-white border border-[var(--border-color)] rounded-[1.75rem] p-3.5 shadow-sm hover:shadow-md transition-all relative"
    >
      <Link to={`/merchandise/${product.id}`} className="block relative w-full">
        {/* Out of Stock Label */}
        {!isAvailable ? (
          <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] uppercase tracking-widest font-black text-white border border-white/10 select-none pointer-events-none">
            HABIS
          </span>
        ) : (
          /* Green NEW badge like the screenshot */
          product.id === 'merch-1' && (
            <span className="absolute top-2.5 left-2.5 z-30 px-2 py-0.5 rounded bg-[#00B050] text-[9px] uppercase tracking-wide font-black text-white select-none pointer-events-none">
              NEW
            </span>
          )
        )}

        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f4f4f5] transition duration-300 w-full">
          {images.length > 0 ? (
            images.map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={index === 0 ? product.name : ''}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-[1.03] ${index === imgIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                loading="lazy"
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 min-h-[220px]">
              <EmptyImageIcon />
            </div>
          )}

          {isAvailable && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center z-20">
              <span className="btn-slide inline-flex translate-y-3 items-center gap-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] px-5 py-2.5 text-[9px] font-extrabold uppercase tracking-wider text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 select-none">
                Pre-Order Sekarang
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[var(--color-primary)]">
                  <ArrowRightMini />
                </span>
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 px-1 flex flex-col justify-between flex-grow gap-2">
        <div>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block text-left mb-1">
            {product.category}
          </span>
          <Link to={`/merchandise/${product.id}`} className="block">
            <h3 className="text-left font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[var(--color-primary)] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <p className="text-sm sm:text-base font-black text-slate-900">{formatCurrency(product.price)}</p>

          {visibleThumbs.length > 1 ? (
            <div className="flex items-center justify-end gap-1">
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
                  className={`flex h-6.5 w-6.5 items-center justify-center rounded-full border p-0.5 transition cursor-pointer ${index === imgIndex
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
    </motion.article>
  );
}

function Pagination({ current, total, onChange }) {
  const pages = useMemo(() => {
    const items = [];

    if (total <= 7) {
      for (let page = 1; page <= total; page += 1) items.push(page);
      return items;
    }

    items.push(1, 2);

    if (current > 4) items.push('...');

    const start = Math.max(3, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let page = start; page <= end; page += 1) items.push(page);

    if (current < total - 3) items.push('...');

    items.push(total - 1, total);

    return items;
  }, [current, total]);

  return (
    <div className="mt-10 flex items-center justify-center gap-2 select-none">
      <motion.button
        type="button"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        whileTap={{ scale: 0.93 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <ChevronLeftIcon />
      </motion.button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-xs text-slate-400 font-bold">
            ...
          </span>
        ) : (
          <motion.button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            whileTap={{ scale: 0.93 }}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition cursor-pointer ${current === page
                ? 'bg-[var(--color-primary)] text-white shadow-md shadow-indigo-100'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
              }`}
          >
            {page}
          </motion.button>
        ),
      )}

      <motion.button
        type="button"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        whileTap={{ scale: 0.93 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
      >
        <ChevronRightIcon />
      </motion.button>
    </div>
  );
}

function ProductGridSkeleton({ cols }) {
  const gridClassName = {
    2: 'grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridClassName} animate-pulse`}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="bg-white border border-[var(--border-color)] rounded-[1.75rem] p-3.5 h-[340px] flex flex-col gap-3">
          <div className="bg-slate-100 rounded-2xl w-full aspect-[3/4]" />
          <div className="h-3.5 bg-slate-100 rounded-md w-1/3 mt-1" />
          <div className="h-4 bg-slate-100 rounded-md w-4/5" />
          <div className="flex justify-between items-center mt-auto">
            <div className="h-5 bg-slate-100 rounded-md w-1/2" />
            <div className="h-6 w-6 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileTap={{ scale: 0.94 }}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
    >
      {children}
    </motion.a>
  );
}

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const IconChevronDown = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Grid2 = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <rect x="0" y="0" width="9" height="9" rx="2" />
    <rect x="11" y="0" width="9" height="9" rx="2" />
    <rect x="0" y="11" width="9" height="9" rx="2" />
    <rect x="11" y="11" width="9" height="9" rx="2" />
  </svg>
);

const Grid3 = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <rect x="0" y="0" width="5.5" height="5.5" rx="1.2" />
    <rect x="7.2" y="0" width="5.5" height="5.5" rx="1.2" />
    <rect x="14.5" y="0" width="5.5" height="5.5" rx="1.2" />
    <rect x="0" y="7.2" width="5.5" height="5.5" rx="1.2" />
    <rect x="7.2" y="7.2" width="5.5" height="5.5" rx="1.2" />
    <rect x="14.5" y="7.2" width="5.5" height="5.5" rx="1.2" />
    <rect x="0" y="14.5" width="5.5" height="5.5" rx="1.2" />
    <rect x="7.2" y="14.5" width="5.5" height="5.5" rx="1.2" />
    <rect x="14.5" y="14.5" width="5.5" height="5.5" rx="1.2" />
  </svg>
);

const Grid4 = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <rect x="0" y="0" width="3.8" height="3.8" rx="0.8" />
    <rect x="5.4" y="0" width="3.8" height="3.8" rx="0.8" />
    <rect x="10.8" y="0" width="3.8" height="3.8" rx="0.8" />
    <rect x="16.2" y="0" width="3.8" height="3.8" rx="0.8" />
    <rect x="0" y="5.4" width="3.8" height="3.8" rx="0.8" />
    <rect x="5.4" y="5.4" width="3.8" height="3.8" rx="0.8" />
    <rect x="10.8" y="5.4" width="3.8" height="3.8" rx="0.8" />
    <rect x="16.2" y="5.4" width="3.8" height="3.8" rx="0.8" />
    <rect x="0" y="10.8" width="3.8" height="3.8" rx="0.8" />
    <rect x="5.4" y="10.8" width="3.8" height="3.8" rx="0.8" />
    <rect x="10.8" y="10.8" width="3.8" height="3.8" rx="0.8" />
    <rect x="16.2" y="10.8" width="3.8" height="3.8" rx="0.8" />
    <rect x="0" y="16.2" width="3.8" height="3.8" rx="0.8" />
    <rect x="5.4" y="16.2" width="3.8" height="3.8" rx="0.8" />
    <rect x="10.8" y="16.2" width="3.8" height="3.8" rx="0.8" />
    <rect x="16.2" y="16.2" width="3.8" height="3.8" rx="0.8" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const EmptyImageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ArrowRightMini = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
