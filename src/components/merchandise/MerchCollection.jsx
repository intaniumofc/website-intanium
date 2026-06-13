// No unused React import here
import MerchCard from './MerchCard';
import EmptyState from '../common/EmptyState';
import { ShoppingBag } from 'lucide-react';

export default function MerchCollection({
  products = [],
  isLoading = false,
  className = '',
}) {
  if (products.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="Merchandise Tidak Ditemukan"
        description="Kami tidak menemukan merchandise dengan pencarian atau filter kategori tersebut. Coba pilih kategori lain."
        icon={ShoppingBag}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <MerchCard key={product.id} product={product} />
      ))}
    </div>
  );
}
