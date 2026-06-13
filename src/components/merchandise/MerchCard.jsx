import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatCurrency } from '../../lib/helpers';

export default function MerchCard({ product, className = '' }) {
  const { id, name, price, imageUrl, category, isAvailable } = product;

  return (
    <Card className={`flex flex-col h-full overflow-hidden border border-[var(--border-color)] group hover:shadow-[var(--neon-glow-primary)] ${className}`} padding="none">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-black/20 border-b border-[var(--border-color)]">
        <img
          src={imageUrl || 'https://via.placeholder.com/300'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category Label */}
        <span className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase font-bold rounded bg-black/60 text-purple-300 border border-purple-500/30">
          {category}
        </span>
        {/* Out of Stock Label */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg border border-red-500 bg-red-500/20 text-red-200 font-extrabold text-sm tracking-wider uppercase">
              Habis Terjual
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors truncate mb-1">
            {name}
          </h3>
          <span className="text-lg font-extrabold text-[var(--color-secondary)]">
            {formatCurrency(price)}
          </span>
        </div>

        {/* Action Button */}
        <div>
          <Link to={`/merchandise/${id}`} className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-lg">
            <Button
              variant={isAvailable ? 'primary' : 'outline'}
              size="sm"
              className="w-full"
              disabled={!isAvailable}
            >
              Detail Produk
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
