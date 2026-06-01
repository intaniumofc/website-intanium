import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { merchandiseService } from './merchandiseService';
import PageHeader from '../../components/layout/PageHeader';
import MerchCollection from '../../components/merchandise/MerchCollection';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { MERCH_CATEGORIES, ROUTES } from '../../lib/constants';
import { useDebounce } from '../../hooks/useDebounce';
import { CreditCard, Search } from 'lucide-react';

export default function MerchandisePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setIsLoading(true);
    merchandiseService.getProducts(activeCategory, debouncedSearch)
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [activeCategory, debouncedSearch]);

  const headerAction = (
    <Link to={ROUTES.PAYMENT_CONFIRM}>
      <Button variant="secondary" size="sm">
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-4 w-4" /> Konfirmasi Pembayaran
        </span>
      </Button>
    </Link>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Official Merchandise"
        subtitle="Miliki koleksi produk eksklusif persembahan Intan & Komunitas Intanium. Seluruh keuntungan penjualan didedikasikan untuk mendukung kelangsungan aktivitas streaming Intan!"
        action={headerAction}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-[var(--border-color)]">
        {/* Category List buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.values(MERCH_CATEGORIES).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {cat === 'All' ? 'Semua Kategori' : cat}
              </button>
            );
          })}
        </div>

        {/* Search input field */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari merchandise..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          {/* Magnifying glass icon indicator */}
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <Loading message="Mengambil katalog produk merchandise..." />
      ) : (
        <MerchCollection products={products} isLoading={isLoading} />
      )}
    </div>
  );
}
