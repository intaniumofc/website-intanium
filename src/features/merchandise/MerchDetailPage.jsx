import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { merchandiseService } from './merchandiseService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CheckoutForm from '../../components/merchandise/CheckoutForm';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';

export default function MerchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    merchandiseService.getProductById(id)
      .then((data) => {
        setProduct(data);
        if (data?.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <Loading message="Membuka detail produk..." />;

  if (!product) {
    return (
      <Card className="text-center py-12 border border-[var(--border-color)]">
        <span className="text-4xl mb-2">🔎</span>
        <h3 className="text-lg font-bold mb-2">Produk Tidak Ditemukan</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Kemungkinan produk telah dihapus atau tidak pernah terdaftar.</p>
        <Link to={ROUTES.MERCHANDISE}>
          <Button variant="outline" size="sm">Kembali ke Toko</Button>
        </Link>
      </Card>
    );
  }

  const handleCheckoutSubmit = async (checkoutData) => {
    setIsSubmitting(true);
    try {
      const order = await merchandiseService.createOrder({
        ...checkoutData,
        selectedSize,
      });
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      // Navigate to confirm page with initial invoice parameters in query or state
      navigate(`${ROUTES.PAYMENT_CONFIRM}?inv=${order.invoiceNumber}&total=${order.totalAmount}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link to={ROUTES.MERCHANDISE} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
          ← Kembali ke Katalog Toko
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image Panel */}
        <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-black/20 aspect-square">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Specs and Details Info */}
        <Card hoverEffect={false} className="border border-[var(--border-color)] space-y-6">
          <div>
            <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-3 leading-tight">
              {product.name}
            </h1>
            <div className="text-2xl font-extrabold text-[var(--color-secondary)] mt-2">
              {formatCurrency(product.price)}
            </div>
          </div>

          <div className="border-t border-b border-[var(--border-color)] py-4">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Deskripsi Produk
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Selectors if applicable */}
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' && product.sizes[0] !== 'Set' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Pilih Ukuran / Varian:
              </label>
              <div className="flex gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] font-bold'
                          : 'border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA Buying Actions */}
          <div className="pt-2 flex flex-col gap-4">
            {product.isAvailable ? (
              <Button variant="glow" className="w-full py-3.5" onClick={() => setIsCheckoutOpen(true)}>
                Beli Sekarang & Buat Pesanan 🛍️
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled={true}>
                Habis Terjual
              </Button>
            )}
            <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
              *Pengiriman menggunakan proteksi ganda bubble wrap tebal. Seluruh pesanan diproses max 1x24 jam kerja.
            </p>
          </div>
        </Card>
      </div>

      {/* Checkout Wizard Overlay Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Formulir Checkout Pesanan"
        size="xl"
      >
        <CheckoutForm
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onSubmit={handleCheckoutSubmit}
        />
      </Modal>
    </div>
  );
}
