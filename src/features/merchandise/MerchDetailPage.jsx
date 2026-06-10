import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { merchandiseService } from './merchandiseService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CheckoutForm from '../../components/merchandise/CheckoutForm';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import { ShieldCheck, Truck, Clock } from 'lucide-react';

export default function MerchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

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

  const images = useMemo(() => {
    if (!product) return [];
    const urls = (product.image_urls ?? product.imageUrls ?? []).filter(Boolean);
    return urls.length > 0 ? urls : [product.image_url ?? product.imageUrl].filter(Boolean);
  }, [product]);

  if (isLoading) return <Loading message="Membuka detail produk..." />;

  if (!product) {
    return (
      <Card hoverEffect={false} className="text-center py-12 border border-[var(--border-color)] max-w-md mx-auto mt-12 bg-white/60 backdrop-blur-md">
        <span className="text-4xl mb-3 block">🔎</span>
        <h3 className="text-lg font-bold mb-1 text-[var(--color-primary)]">Produk Tidak Ditemukan</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-6">Kemungkinan produk telah dihapus atau tidak pernah terdaftar.</p>
        <Link to={ROUTES.MERCHANDISE}>
          <Button variant="outline" size="sm">Kembali ke Toko</Button>
        </Link>
      </Card>
    );
  }

  const isAvailable = product.is_available ?? product.isAvailable ?? true;

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
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Back button */}
      <div>
        <Link
          to={ROUTES.MERCHANDISE}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          ← Kembali ke Toko
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Gallery */}
        <div className="md:col-span-5 space-y-4">
          <div className="border border-[var(--border-color)] rounded-3xl overflow-hidden bg-white aspect-[3/4] shadow-sm relative">
            {images.length > 0 ? (
              <img
                src={images[activeImgIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                Gambar Kosong
              </div>
            )}

            {/* Out of Stock Label */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                <span className="px-4 py-2 rounded-xl border border-red-500 bg-red-500/20 text-red-200 font-extrabold text-sm tracking-wider uppercase">
                  Habis Terjual
                </span>
              </div>
            )}
          </div>

          {/* Image Thumbnails Picker */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  onClick={() => setActiveImgIndex(index)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer ${activeImgIndex === index
                      ? 'border-[var(--color-primary)] shadow-sm'
                      : 'border-[var(--border-color)] bg-white opacity-75 hover:opacity-100'
                    }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specs and Details Info */}
        <div className="md:col-span-7">
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white space-y-6 rounded-[2rem] p-6 shadow-sm md:p-8">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-wider rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2.5 leading-snug">
                {product.name}
              </h1>
              <div className="text-xl font-black text-slate-900 mt-2">
                {formatCurrency(product.price)}
              </div>
            </div>

            <div className="border-t border-b border-[var(--border-color)]/60 py-4.5 space-y-2">
              <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Deskripsi Produk
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Size Selectors */}
            {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' && product.sizes[0] !== 'Set' && (
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  Pilih Ukuran / Varian:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm'
                            : 'border-[var(--border-color)] bg-white text-slate-700 hover:border-slate-400'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {isAvailable && (
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  Jumlah Belanja:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-slate-400 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-slate-400 flex items-center justify-center font-bold text-sm cursor-pointer"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Pre-Order Actions */}
            <div className="pt-2 flex flex-col gap-4">
              {isAvailable ? (
                <Button
                  variant="glow"
                  className="w-full py-3.5 rounded-xl font-bold tracking-wider text-xs"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Pre-Order Sekarang
                </Button>
              ) : (
                <Button variant="outline" className="w-full py-3.5 rounded-xl font-bold text-xs uppercase cursor-not-allowed" disabled={true}>
                  Habis Terjual
                </Button>
              )}
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-3 border-t border-[var(--border-color)]/60 pt-5">
              <div className="flex flex-col items-center text-center space-y-1">
                <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="font-bold text-[9px] text-slate-800 block">Jaminan Resmi</span>
                <span className="text-[8px] text-slate-500 block leading-tight">100% Produk Eksklusif</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-1">
                <Truck className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="font-bold text-[9px] text-slate-800 block">Pengiriman Cepat</span>
                <span className="text-[8px] text-slate-500 block leading-tight">Double Bubble Wrap</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-1">
                <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="font-bold text-[9px] text-slate-800 block">Admin Support</span>
                <span className="text-[8px] text-slate-500 block leading-tight">Proses Cepat 24 Jam</span>
              </div>
            </div>
          </Card>
        </div>
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
