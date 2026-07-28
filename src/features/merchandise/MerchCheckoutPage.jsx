'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { merchandiseService } from '../../services/public/merchandiseService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CheckoutForm from '../../components/merchandise/CheckoutForm';
import { ROUTES, ADMIN_WHATSAPP_NUMBER } from '../../lib/constants';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function MerchCheckoutPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQty = parseInt(searchParams.get('quantity') || '1', 10);
  const initialSize = searchParams.get('size') || '';

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(initialQty > 0 ? initialQty : 1);
  const [selectedSize, setSelectedSize] = useState(initialSize);

  useEffect(() => {
    setIsLoading(true);
    merchandiseService.getProductById(id)
      .then((data) => {
        setProduct(data);
        if (!initialSize && data?.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id, initialSize]);

  useEffect(() => {
    if (product) {
      document.title = `Checkout ${product.name} | Merchandise IRIS`;
    }
  }, [product]);

  if (isLoading) return <Loading message="Menyiapkan formulir checkout..." />;

  if (!product) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto">
        <Card hoverEffect={false} className="text-center py-12 border border-[var(--border-color)] bg-white/60 backdrop-blur-md">
          <span className="text-4xl mb-3 block">🔎</span>
          <h3 className="text-lg font-bold mb-1 text-[var(--color-primary)]">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-6">Kemungkinan produk telah dihapus atau tidak pernah terdaftar.</p>
          <Link href={ROUTES.MERCHANDISE}>
            <Button variant="outline" size="sm">Kembali ke Toko</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleCheckoutSubmit = async (checkoutData) => {
    try {
      const order = await merchandiseService.createOrder({
        ...checkoutData,
        selectedSize,
      });

      // WhatsApp Redirect logic
      const waNumber = ADMIN_WHATSAPP_NUMBER || '6281386701549';
      const invoiceNum = order.invoiceNumber;
      const prodName = product.name;
      const size = selectedSize || '-';
      const qty = checkoutData.quantity || 1;
      const total = order.totalAmount;
      const buyerName = checkoutData.name || '-';
      const buyerPhone = checkoutData.phone || '-';
      const lineId = checkoutData.lineId || '-';
      const memberId = checkoutData.irisMemberId || '-';
      const deliveryMethod = checkoutData.deliveryMethod === 'pickup_fx' ? 'Ambil di FX Sudirman' : 'Ekspedisi J&T';
      const buyerAddress = checkoutData.deliveryMethod === 'pickup_fx' 
        ? 'Tidak diperlukan (Ambil di FX Sudirman)' 
        : `${checkoutData.address || '-'}, ${checkoutData.city || ''}, ${checkoutData.province || ''} ${checkoutData.postalCode || ''}`;
      
      const message = `Halo Admin IRIS, saya ingin mengonfirmasi pesanan merchandise berikut:

*No. Invoice:* ${invoiceNum}
*Produk:* ${prodName}
*Ukuran:* ${size}
*Jumlah:* ${qty} Pcs
*Total Bayar:* Rp ${total.toLocaleString('id-ID')}

*Data Pemesan:*
• Nama: ${buyerName}
• No. HP / WA: ${buyerPhone}
• ID Line: ${lineId}
• ID Membership IRIS: ${memberId}

*Metode Pengiriman:* ${deliveryMethod}
*Alamat Pengiriman:* ${buyerAddress}

Mohon diproses pesanannya. Terima kasih! 🙏`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');

      // Navigate to confirmation page
      router.push(`/merchandise/payment-confirm?invoice=${invoiceNum}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="py-4 sm:py-8 md:py-12 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 sm:pb-4">
        <Link 
          href={`/merchandise/${id}`}
          className="inline-flex items-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition gap-2 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Detail Produk</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Checkout Produk</span>
        </div>
      </div>

      {/* Main Checkout Form Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-[var(--border-color)] p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--border-color)]/60">
          <h1 className="text-lg sm:text-2xl font-extrabold text-[var(--color-primary)]">
            Formulir Checkout Pesanan
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Lengkapi data pemesan & pengiriman untuk menyelesaikan pesanan Anda.
          </p>
        </div>

        <CheckoutForm
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onSubmit={handleCheckoutSubmit}
        />
      </div>
    </div>
  );
}
