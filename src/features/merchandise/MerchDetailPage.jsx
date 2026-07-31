'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { merchandiseService } from '../../services/public/merchandiseService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatCurrency, getOptimizedImageUrl } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import { ShieldCheck, Truck, Clock, CalendarDays, Factory } from 'lucide-react';

const PRODUCTION_STAGE_LABELS = {
  design: 'Desain',
  sampling: 'Sampling',
  mass_production: 'Produksi Massal',
  qc: 'Quality Control',
  warehousing: 'Pergudangan',
  shipping_prep: 'Persiapan Pengiriman',
};

// Segmented live countdown (Hari / Jam / Menit / Detik)
function CountdownSegments({ ms, accentClass = 'text-slate-800' }) {
  if (ms == null || ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const segments = [
    { value: Math.floor(totalSec / 86400), label: 'Hari' },
    { value: Math.floor((totalSec % 86400) / 3600), label: 'Jam' },
    { value: Math.floor((totalSec % 3600) / 60), label: 'Menit' },
    { value: totalSec % 60, label: 'Detik' },
  ];
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {segments.map((seg) => (
        <div
          key={seg.label}
          className="flex min-w-[52px] flex-col items-center rounded-xl border border-white/80 bg-white/85 px-2 py-2 shadow-xs backdrop-blur-sm"
        >
          <span className={`text-base sm:text-lg font-black tabular-nums leading-none ${accentClass}`}>
            {String(seg.value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MerchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const navigate = (path) => router.push(path);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Pre-Order Merchandise IRIS`;
    }
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    const rawUrls = product.image_urls ?? product.imageUrls ?? [];
    const urls = Array.isArray(rawUrls)
      ? rawUrls.filter(Boolean)
      : (typeof rawUrls === 'string' && rawUrls.trim() ? [rawUrls.trim()] : []);
    return urls.length > 0 ? urls : [product.image_url ?? product.imageUrl].filter(Boolean);
  }, [product]);

  if (isLoading) return <Loading message="Membuka detail produk..." />;

  if (!product) {
    return (
      <Card hoverEffect={false} className="text-center py-12 border border-[var(--border-color)] max-w-md mx-auto mt-12 bg-white/60 backdrop-blur-md">
        <span className="text-4xl mb-3 block">🔎</span>
        <h3 className="text-lg font-bold mb-1 text-[var(--color-primary)]">Produk Tidak Ditemukan</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-6">Kemungkinan produk telah dihapus atau tidak pernah terdaftar.</p>
        <Link href={ROUTES.MERCHANDISE}>
          <Button variant="outline" size="sm">Kembali ke Toko</Button>
        </Link>
      </Card>
    );
  }

  const isAvailable = product.is_available ?? product.isAvailable ?? true;

  // Preorder state computation
  const isPreorder = product.is_preorder ?? false;
  const startMs = product.preorder_start ? new Date(product.preorder_start).getTime() : null;
  const endMs = product.preorder_end ? new Date(product.preorder_end).getTime() : null;

  let preorderPhase = 'regular';
  if (isPreorder) {
    if (product.preorder_closed) preorderPhase = 'closed';
    else if (startMs && now < startMs) preorderPhase = 'upcoming';
    else if (endMs && now > endMs) preorderPhase = 'closed';
    else preorderPhase = 'open';
  }

  const canOrder = isAvailable && preorderPhase !== 'upcoming' && preorderPhase !== 'closed';
  const productionStageLabel = product.production_stage ? PRODUCTION_STAGE_LABELS[product.production_stage] || product.production_stage : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Back button */}
      <div>
        <Link
          href={ROUTES.MERCHANDISE}
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
                src={getOptimizedImageUrl(images[activeImgIndex], { width: 800 })}
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
                  aria-label={`Lihat gambar detail ${index + 1}`}
                  aria-pressed={activeImgIndex === index}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${activeImgIndex === index
                      ? 'border-[var(--color-primary)] shadow-sm'
                      : 'border-[var(--border-color)] bg-white opacity-75 hover:opacity-100'
                    }`}
                >
                  <img src={getOptimizedImageUrl(src, { width: 100 })} alt="" className="w-full h-full object-cover" />
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

            {/* Preorder Status Banner */}
            {isPreorder && preorderPhase === 'open' && (
              <div className="rounded-2xl border border-[var(--color-mint)]/25 bg-[var(--color-mint-tint-15)] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-iris-mint-dark)] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-iris-mint-dark)]" />
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-iris-mint-dark)]">
                      Preorder Dibuka
                    </span>
                  </div>
                  <span className="rounded-full border border-[var(--color-mint)]/30 bg-white/80 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--color-iris-mint-dark)]">
                    Batch {product.preorder_round || 1}
                  </span>
                </div>
                {endMs ? (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Ditutup dalam</p>
                    <CountdownSegments ms={endMs - now} accentClass="text-[var(--color-iris-mint-dark)]" />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-700">Preorder sedang dibuka — pesan sekarang!</p>
                )}
              </div>
            )}
            {isPreorder && preorderPhase === 'upcoming' && (
              <div className="rounded-2xl border border-[var(--color-blue)]/25 bg-[var(--color-blue-tint-15)] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--color-iris-blue-dark)] shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-iris-blue-dark)]">
                      Segera Dibuka
                    </span>
                  </div>
                  <span className="rounded-full border border-[var(--color-blue)]/30 bg-white/80 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--color-iris-blue-dark)]">
                    Batch {product.preorder_round || 1}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Dibuka dalam</p>
                  {startMs - now > 0 ? (
                    <CountdownSegments ms={startMs - now} accentClass="text-[var(--color-iris-blue-dark)]" />
                  ) : (
                    <p className="text-xs font-bold text-slate-700">beberapa saat lagi…</p>
                  )}
                </div>
              </div>
            )}
            {isPreorder && preorderPhase === 'closed' && (
              <div className="rounded-2xl border border-[var(--color-peach)]/30 bg-[var(--color-peach-tint-15)] p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <img
                    src="/closedshop.svg"
                    alt="Preorder ditutup"
                    className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 drop-shadow-sm select-none"
                  />
                  <div className="min-w-0 space-y-1.5">
                    <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-iris-peach-dark)]">
                      Preorder Ditutup · Batch {product.preorder_round || 1}
                    </span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      {productionStageLabel
                        ? 'Pesanan batch ini sedang kami proses. Terima kasih sudah ikut preorder!'
                        : 'Preorder batch ini sudah ditutup. Pantau terus untuk batch selanjutnya!'}
                    </p>
                    {productionStageLabel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-purple)]/25 bg-[var(--color-purple-tint-12)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[var(--color-iris-purple-dark)]">
                        <Factory className="h-3 w-3" /> Tahap: {productionStageLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                        aria-label={`Pilih ukuran ${size}`}
                        aria-pressed={isSelected}
                        className={`px-4.5 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${isSelected
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
            {canOrder && (
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  Jumlah Belanja:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah"
                    className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-slate-400 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Tambah jumlah"
                    className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-slate-400 flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Pre-Order Actions */}
            <div className="pt-2 flex flex-col gap-3">
              {product.estimated_delivery && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                  <CalendarDays className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                  <span>Estimasi pengiriman: <span className="text-slate-800">{product.estimated_delivery}</span></span>
                </div>
              )}
              {canOrder ? (
                <Button
                  variant="glow"
                  className="w-full py-3.5 rounded-xl font-bold tracking-wider text-xs"
                  onClick={() => router.push(`/merchandise/${id}/checkout?quantity=${quantity}&size=${encodeURIComponent(selectedSize)}`)}
                >
                  Pre-Order Sekarang
                </Button>
              ) : (
                <Button variant="outline" className="w-full py-3.5 rounded-xl font-bold text-xs uppercase cursor-not-allowed" disabled={true}>
                  {!isAvailable
                    ? 'Habis Terjual'
                    : preorderPhase === 'upcoming'
                      ? 'Preorder Belum Dibuka'
                      : 'Preorder Telah Ditutup'}
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


    </div>
  );
}
