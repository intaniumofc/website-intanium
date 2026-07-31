'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { merchandiseService } from '../../services/public/merchandiseService';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES, ADMIN_WHATSAPP_NUMBER } from '../../lib/constants';
import { 
  Search, ArrowLeft, Clock, 
  Check, ShieldAlert, Truck, Copy, 
  ExternalLink, UploadCloud, CheckCircle2, XCircle, CalendarDays, Factory
} from 'lucide-react';
import qrisImage from '../../assets/images/qris-iris.webp';
import { StatusBadge } from '../../components/ui/status-badge';
import { OrderStatus } from '../../components/ui/order-status-tracker';

const PRODUCTION_STAGES = [
  { value: 'design', label: 'Desain' },
  { value: 'sampling', label: 'Sampling' },
  { value: 'mass_production', label: 'Produksi Massal' },
  { value: 'qc', label: 'Quality Control' },
  { value: 'warehousing', label: 'Pergudangan' },
  { value: 'shipping_prep', label: 'Persiapan Kirim' },
];

export default function PaymentConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigate = (path) => router.push(path);

  const invoiceParam = searchParams.get('inv') || searchParams.get('invoice') || '';
  const amountParam = searchParams.get('total') || '';

  const [copied, setCopied] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: 'BANK JAGO',
    account_number: '107287946603',
    account_holder: 'Muhammad Fauzan Casimira',
    qris_url: '',
  });

  useEffect(() => {
    document.title = 'Lacak & Cek Pesanan | Official Shop IRIS';
    merchandiseService.getPaymentSettings()
      .then((settings) => {
        if (settings) {
          setPaymentSettings(settings);
        }
      })
      .catch((err) => console.error('Error fetching settings in confirm page:', err));
  }, []);

  const handleCopyBank = () => {
    navigator.clipboard.writeText(paymentSettings.account_number);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Invoice / Order lookup states
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderedProduct, setOrderedProduct] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);
  const [lookupInvoiceInput, setLookupInvoiceInput] = useState('');

  // Payment proof upload states
  const [paymentRecord, setPaymentRecord] = useState(null);
  const { uploadFile, isUploading } = useMediaUpload();
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [proofSenderName, setProofSenderName] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState('');

  // Fetch order details
  useEffect(() => {
    let active = true;

    if (!invoiceParam) {
      Promise.resolve().then(() => {
        if (active) {
          setOrderDetail(null);
          setOrderedProduct(null);
          setIsPaymentSubmitted(false);
          setPaymentRecord(null);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (active) setLoadingOrder(true);
    });

    async function loadOrder() {
      try {
        const orderData = await merchandiseService.getOrderByInvoice(invoiceParam);
        if (!active) return;
        
        if (orderData) {
          setOrderDetail(orderData);
          
          // Fetch product
          if (orderData.order_data?.productId) {
            const productData = await merchandiseService.getProductById(orderData.order_data.productId);
            if (active) setOrderedProduct(productData);
          }
          
          // Check if payment receipt is submitted (with proof & verification status)
          const payment = await merchandiseService.getPaymentByInvoice(invoiceParam);
          if (active) {
            setPaymentRecord(payment);
            setIsPaymentSubmitted(Boolean(payment));
          }
        } else {
          setOrderDetail(null);
          setOrderedProduct(null);
          setIsPaymentSubmitted(false);
          setPaymentRecord(null);
        }
        setLoadingOrder(false);
      } catch (err) {
        console.error(err);
        if (active) setLoadingOrder(false);
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [invoiceParam]);

  const handleWhatsAppRedirect = () => {
    if (!orderDetail) return;
    
    const waNumber = ADMIN_WHATSAPP_NUMBER || '6281386701549';
    const invoiceNum = orderDetail.invoice_number;
    const prodName = orderedProduct ? orderedProduct.name : 'Merchandise';
    const size = orderDetail.order_data?.selectedSize || '-';
    const qty = orderDetail.order_data?.quantity || 1;
    const total = orderDetail.order_data?.totalAmount || amountParam;
    const buyerName = orderDetail.order_data?.name || '-';
    const buyerPhone = orderDetail.order_data?.phone || '-';
    const lineId = orderDetail.order_data?.lineId || '-';
    const memberId = orderDetail.order_data?.irisMemberId || orderDetail.order_data?.intaniumMemberId || '-';
    const deliveryMethod = orderDetail.order_data?.deliveryMethod === 'pickup_fx' ? 'Ambil di FX Sudirman' : 'Ekspedisi J&T';
    const buyerAddress = orderDetail.order_data?.deliveryMethod === 'pickup_fx' 
      ? 'Tidak diperlukan (Ambil di FX Sudirman)' 
      : `${orderDetail.order_data?.address || '-'}, ${orderDetail.order_data?.city || ''}, ${orderDetail.order_data?.province || ''} ${orderDetail.order_data?.postalCode || ''}`;
    
    const shippingCostText = orderDetail.order_data?.deliveryMethod === 'pickup_fx'
      ? 'FREE ONGKIR'
      : formatCurrency(orderDetail.order_data?.shipping_cost || 0);

    const notesText = orderDetail.order_data?.notes ? `\n- *Catatan:* ${orderDetail.order_data.notes}` : '';
    
    const message = `Halo Admin IRIS! Saya ingin melakukan konfirmasi/tanya status Pre-Order Merchandise.

*Rincian Pesanan:*
- *Nomor Invoice:* ${invoiceNum}
- *Produk:* ${prodName}
- *Varian/Size:* ${size}
- *Jumlah:* ${qty} pcs
- *Metode Pengiriman:* ${deliveryMethod}
- *Ongkos Kirim:* ${shippingCostText}
- *Total Nominal:* ${formatCurrency(Number(total))}
- *Nama Penerima:* ${buyerName}
- *No. WhatsApp:* ${buyerPhone}
- *ID Line:* ${lineId}
- *ID Anggota:* ${memberId}
- *Alamat:* ${buyerAddress}${notesText}

*(Saya melampirkan foto bukti transfer jika status pesanan saya sudah 'Menunggu Pembayaran')*`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (lookupInvoiceInput.trim()) {
      navigate(`${ROUTES.PAYMENT_CONFIRM}?inv=${lookupInvoiceInput.trim()}`);
    }
  };

  const handleCopyInvoice = () => {
    if (orderDetail?.invoice_number) {
      navigator.clipboard.writeText(orderDetail.invoice_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProofError('File harus berupa gambar (JPG/PNG/WebP).');
      return;
    }
    setProofError('');
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      setProofError('Pilih file bukti transfer terlebih dahulu.');
      return;
    }
    setIsSubmittingProof(true);
    setProofError('');
    try {
      const publicUrl = await uploadFile(proofFile, 'assets', 'payment-proofs');
      const res = await merchandiseService.submitPaymentProof({
        invoiceNumber: orderDetail.invoice_number,
        proofUrl: publicUrl,
        senderName: proofSenderName.trim(),
      });
      if (!res.success) throw new Error(res.error || 'Gagal mengirim bukti pembayaran.');
      const record = await merchandiseService.getPaymentByInvoice(orderDetail.invoice_number);
      setPaymentRecord(record);
      setIsPaymentSubmitted(true);
      setProofFile(null);
      setProofPreview('');
      setProofSenderName('');
    } catch (err) {
      console.error('Proof upload error:', err);
      setProofError(err.message || 'Gagal mengunggah bukti pembayaran. Coba lagi.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const getTimelineSteps = () => {
    const status = orderDetail?.order_data?.status || 'pending_review';
    const deliveryMethod = orderDetail?.order_data?.deliveryMethod || 'expedition_jnt';
    const isFx = deliveryMethod === 'pickup_fx';
    
    let step1 = 'done'; // Pesanan Dibuat
    let step2 = 'upcoming'; // Pembayaran
    let step3 = 'upcoming'; // Sedang Diproses
    let step4 = 'upcoming'; // Siap Diambil / Pengiriman

    if (status === 'pending_review') {
      step2 = 'current';
    } else if (status === 'waiting_payment') {
      if (isPaymentSubmitted) {
        step2 = 'done';
        step3 = 'current';
      } else {
        step2 = 'current';
      }
    } else if (status === 'paid') {
      step2 = 'done';
      step3 = 'current';
    } else if (status === 'processing') {
      step2 = 'done';
      step3 = 'done';
      step4 = 'current';
    } else if (status === 'ready_for_pickup' || status === 'shipped') {
      step2 = 'done';
      step3 = 'done';
      step4 = 'done';
    } else if (status === 'completed') {
      step2 = 'done';
      step3 = 'done';
      step4 = 'done';
    } else if (status === 'cancelled') {
      step2 = 'upcoming';
      step3 = 'upcoming';
      step4 = 'upcoming';
    }

    if (isFx) {
      return [
        { label: 'Pesanan Dibuat', state: step1, desc: 'Pemesanan pre-order masuk sistem' },
        { label: 'Pembayaran', state: step2, desc: 'Kirim struk bukti bayar via WhatsApp' },
        { label: 'Sedang Diproses', state: step3, desc: 'Kaos/item diproduksi atau dikemas' },
        { label: 'Siap Diambil', state: step4, desc: 'Merchandise siap diambil di FX Sudirman' },
      ];
    } else {
      return [
        { label: 'Pesanan Dibuat', state: step1, desc: 'Pemesanan pre-order masuk sistem' },
        { label: 'Pembayaran', state: step2, desc: 'Kirim struk bukti bayar via WhatsApp' },
        { label: 'Sedang Diproses', state: step3, desc: 'Kaos/item diproduksi atau dikemas' },
        { label: 'Pesanan Dikirim', state: step4, desc: 'Paket diserahkan ke J&T Express' },
      ];
    }
  };

  const timelineSteps = getTimelineSteps();
  const orderStatus = orderDetail?.order_data?.status || 'pending_review';


  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_review': return 'Menunggu Review Admin';
      case 'waiting_payment': return 'Menunggu Pembayaran';
      case 'paid': return 'Pembayaran Terverifikasi';
      case 'processing': return 'Sedang Diproses';
      case 'ready_for_pickup': return 'Siap Diambil';
      case 'shipped': return 'Dalam Pengiriman';
      case 'completed': return 'Pesanan Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Status Tidak Diketahui';
    }
  };

  const getStatusIllustration = (status, isSubmitted) => {
    switch (status) {
      case 'pending_review':
        return 'https://illustrations.popsy.co/violet/graphic-design.svg';
      case 'waiting_payment':
        return isSubmitted 
          ? 'https://illustrations.popsy.co/violet/graphic-design.svg' 
          : 'https://illustrations.popsy.co/violet/online-payment.svg';
      case 'paid':
        return 'https://illustrations.popsy.co/violet/successful-purchase.svg';
      case 'processing':
        return 'https://illustrations.popsy.co/violet/concept-creative-idea.svg';
      case 'ready_for_pickup':
        return 'https://illustrations.popsy.co/violet/received-gift.svg';
      case 'shipped':
        return 'https://illustrations.popsy.co/violet/delivery-service.svg';
      case 'completed':
        return 'https://illustrations.popsy.co/violet/happy-anniversary.svg';
      case 'cancelled':
        return 'https://illustrations.popsy.co/violet/server-status.svg';
      default:
        return 'https://illustrations.popsy.co/violet/online-payment.svg';
    }
  };

  const getStatusTitleAndDesc = (status, isSubmitted) => {
    switch (status) {
      case 'pending_review':
        return { 
          title: "Menunggu Review Admin", 
          desc: "Pesanan Anda sedang diperiksa oleh admin. Jika Anda menggunakan kurir J&T, admin akan memeriksa nominal ongkir Anda." 
        };
      case 'waiting_payment':
        return isSubmitted 
          ? { title: "Menunggu Verifikasi", desc: "Bukti transfer telah Anda kirimkan. Tim admin sedang memverifikasi pembayaran Anda." }
          : { title: "Menunggu Pembayaran", desc: "Silakan lakukan transfer bank dan konfirmasi pembayaran ke WhatsApp Admin." };
      case 'paid':
        return { 
          title: "Pembayaran Terverifikasi", 
          desc: "Pembayaran berhasil dikonfirmasi. Pesanan masuk antrean produksi/pengerjaan pre-order." 
        };
      case 'processing':
        return { 
          title: "Sedang Diproses", 
          desc: "Merchandise Anda sedang diproduksi atau dikemas oleh admin fanbase." 
        };
      case 'ready_for_pickup':
        return { 
          title: "Siap Diambil", 
          desc: "Kabar baik! Merchandise Anda siap diambil di titik temu FX Sudirman Jakarta. Silakan hubungi admin via Line ID." 
        };
      case 'shipped':
        return { 
          title: "Dalam Pengiriman", 
          desc: "Kabar baik! Paket Anda telah diserahkan ke J&T Express dan dalam perjalanan ke alamat Anda." 
        };
      case 'completed':
        return { 
          title: "Pesanan Selesai", 
          desc: "Terima kasih! Paket merchandise pre-order Anda telah berhasil diterima." 
        };
      case 'cancelled':
        return { 
          title: "Pesanan Dibatalkan", 
          desc: "Transaksi pre-order dibatalkan. Hubungi admin via WhatsApp untuk detailnya." 
        };
      default:
        return { title: "Status Tidak Diketahui", desc: "Detail pesanan Anda sedang disiapkan." };
    }
  };

  const { title: statusTitle, desc: statusDescription } = getStatusTitleAndDesc(orderStatus, isPaymentSubmitted);
  const illustrationUrl = getStatusIllustration(orderStatus, isPaymentSubmitted);

  const trackingItem = {
    imageUrl: orderedProduct?.image_url ?? orderedProduct?.imageUrl ?? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=64&h=64&fit=crop&q=80',
    name: orderedProduct?.name || 'IRIS Merchandise',
    details: `Ukuran: ${orderDetail?.order_data?.selectedSize || '-'} • Jumlah: ${orderDetail?.order_data?.quantity || 1} pcs`,
    price: orderedProduct?.price || 0,
    priceFormatted: formatCurrency(orderedProduct?.price || 0)
  };

  const isJnt = orderDetail?.order_data?.deliveryMethod === 'expedition_jnt';

  const trackingSummary = orderDetail ? [
    { label: "Nomor Invoice", value: orderDetail.invoice_number },
    { label: "Nama Penerima", value: orderDetail.order_data?.name || '-' },
    { label: "Nomor WhatsApp", value: orderDetail.order_data?.phone || '-' },
    ...(orderDetail.order_data?.lineId ? [{ label: "ID Line", value: orderDetail.order_data.lineId }] : []),
    ...(orderDetail.order_data?.irisMemberId || orderDetail.order_data?.intaniumMemberId ? [{ label: "ID Anggota", value: orderDetail.order_data.irisMemberId || orderDetail.order_data.intaniumMemberId }] : []),
    { 
      label: "Metode Pengiriman", 
      value: isJnt ? "Ekspedisi J&T Express" : "Ambil di FX Sudirman" 
    },
    ...(isJnt 
      ? [
          { label: "Alamat Pengiriman", value: `${orderDetail.order_data?.address || '-'}, ${orderDetail.order_data?.city || ''}, ${orderDetail.order_data?.province || ''} ${orderDetail.order_data?.postalCode || ''}` },
          { label: "Tarif Ongkir", value: formatCurrency(orderDetail.order_data?.shipping_cost || 0) }
        ]
      : []
    ),
    { label: "Total Tagihan", value: formatCurrency(orderDetail.order_data?.totalAmount || 0) }
  ] : [];

  if (orderDetail?.order_data?.trackingNumber) {
    trackingSummary.push({ label: "Nomor Resi", value: orderDetail.order_data.trackingNumber });
  }

  const getButtonConfig = () => {
    if (orderStatus === 'pending_review') {
      return {
        label: "Hubungi Admin WhatsApp",
        icon: <WhatsAppIcon className="h-4 w-4 fill-current" />,
        action: handleWhatsAppRedirect
      };
    }
    if (orderStatus === 'waiting_payment') {
      return {
        label: isPaymentSubmitted ? "Hubungi Admin WhatsApp" : "Kirim Bukti ke WhatsApp",
        icon: <WhatsAppIcon className="h-4 w-4 fill-current" />,
        action: handleWhatsAppRedirect
      };
    }
    if (orderStatus === 'shipped') {
      return {
        label: "Lacak Lokasi Kurir",
        icon: <Truck className="h-4 w-4" />,
        action: () => {
          if (orderDetail?.order_data?.trackingUrl) {
            window.open(orderDetail.order_data.trackingUrl, '_blank');
          }
        }
      };
    }
    if (orderStatus === 'ready_for_pickup') {
      return {
        label: "Koordinasi Ambil (Line / WA)",
        icon: <ExternalLink className="h-4 w-4" />,
        action: () => {
          const lineId = orderDetail?.order_data?.lineId || '';
          alert(`ID Line Anda: ${lineId}. Admin akan menghubungi Anda via Line. Anda juga bisa menanyakan status pengambilan via WhatsApp.`);
          handleWhatsAppRedirect();
        }
      };
    }
    return {
      label: "Cari Invoice Lain",
      icon: <Search className="h-4 w-4" />,
      action: () => {
        setOrderDetail(null);
        setLookupInvoiceInput('');
        navigate(ROUTES.PAYMENT_CONFIRM);
      }
    };
  };

  const buttonConfig = getButtonConfig();

  const getFooterStatusText = () => {
    if (orderStatus === 'pending_review') {
      return "Admin akan meninjau pesanan Anda sebelum mengubah status menjadi 'Menunggu Pembayaran'.";
    }
    if (orderStatus === 'waiting_payment') {
      return isPaymentSubmitted 
        ? "Proses verifikasi bukti transfer biasanya memakan waktu maksimal 1x24 jam."
        : "Silakan transfer tepat senilai tagihan untuk mengamankan pesanan pre-order Anda.";
    }
    if (orderStatus === 'paid') {
      return "Pembayaran telah kami terima. Pesanan pre-order Anda telah aman.";
    }
    if (orderStatus === 'processing') {
      return "Barang sedang dipersiapkan. Status pengiriman/pickup akan di-update setelah siap.";
    }
    if (orderStatus === 'ready_for_pickup') {
      return "Silakan berkoordinasi dengan admin melalui Line ID Anda untuk titik temu di FX Sudirman.";
    }
    if (orderStatus === 'shipped') {
      return `Estimasi pengiriman dapat dilacak dengan resi ${orderDetail?.order_data?.trackingNumber || '-'}.`;
    }
    if (orderStatus === 'completed') {
      return "Terima kasih telah menjadi bagian dari IRIS!";
    }
    if (orderStatus === 'cancelled') {
      return "Transaksi pre-order dibatalkan. Hubungi admin untuk informasi lebih lanjut.";
    }
    return "";
  };

  const footerStatusText = getFooterStatusText();

  const isNotFound = invoiceParam && !orderDetail && !loadingOrder;

  // Show loading screen during fetch
  if (loadingOrder) {
    return (
      <motion.div
        className="max-w-2xl mx-auto py-24 text-center space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Clock className="animate-spin h-10 w-10 text-[var(--color-primary)] mx-auto" />
        <p className="text-sm font-bold text-[var(--color-text-secondary)]">Memuat rincian pesanan Anda...</p>
      </motion.div>
    );
  }

  // Center lookup state when no invoice is searched
  if (!orderDetail) {
    return (
      <motion.div
        className="max-w-2xl mx-auto space-y-6 py-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.05 } }
        }}
      >
        <motion.div
          className="text-center space-y-3"
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-primary)]">
            Cek & Lacak Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            Masukkan nomor invoice unik Anda untuk melihat status pengerjaan pre-order dan pengiriman kurir secara langsung.
          </p>
        </motion.div>

        {/* Beautiful premium lookup card */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } } }}
        >
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--color-surface)]/70 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleLookupSubmit} className="space-y-4">
              {isNotFound && (
                <motion.div
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
                  Nomor invoice "{invoiceParam}" tidak ditemukan. Silakan periksa kembali.
                </motion.div>
              )}
              <div className="space-y-2">
                <label htmlFor="invoice-lookup-input" className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Nomor Invoice Pesanan
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-4.5 w-4.5 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    id="invoice-lookup-input"
                    placeholder="Masukkan nomor invoice (contoh: INV-123456)"
                    value={lookupInvoiceInput}
                    onChange={(e) => setLookupInvoiceInput(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl pl-11 pr-32 py-3.5 text-sm font-bold placeholder-[var(--color-text-secondary)] text-[var(--color-heading)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                  >
                    Cari Pesanan
                  </button>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Bank transfer instructions */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } } }}
        >
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--color-surface)] rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-black text-[var(--color-heading)] uppercase tracking-wider border-b border-[var(--color-border)] pb-3 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--color-primary)] rounded-full"></span>
              Informasi Pembayaran Fanbase
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Silakan lakukan pembayaran pre-order Anda dengan mentransfer tepat sesuai total tagihan ke rekening resmi berikut:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Bank Transfer Details */}
              <div className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-3">
                <div>
                  <span className="text-[8px] font-extrabold text-[var(--text-muted)] block uppercase tracking-widest">Metode Transfer</span>
                  <span className="text-base font-black text-[var(--color-heading)] tracking-wider block mt-0.5">{paymentSettings.bank_name}</span>
                </div>
                
                <div className="flex items-center justify-between bg-[var(--color-surface)] px-3 py-2 rounded-xl border border-[var(--border-color)]">
                  <span className="font-mono text-sm font-bold text-[var(--color-body)]">{paymentSettings.account_number}</span>
                  <button
                    type="button"
                    onClick={handleCopyBank}
                    aria-label="Salin nomor rekening bank"
                    className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition flex items-center gap-1 text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-md px-1"
                  >
                    {copiedBank ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[10px]">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div>
                  <span className="text-[8px] font-bold text-[var(--text-muted)] block uppercase">Nama Penerima</span>
                  <span className="text-xs font-bold text-[var(--color-heading)]">{paymentSettings.account_holder}</span>
                </div>
              </div>

              {/* QRIS Code */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--color-bg-secondary)] relative overflow-hidden">
                <span className="text-[9px] font-extrabold text-[var(--text-muted)] block uppercase tracking-widest mb-2">Scan QRIS IRIS</span>
                <div className="w-40 h-52 border border-slate-200 rounded-xl overflow-hidden bg-[var(--color-surface)] shadow-xs p-2 flex items-center justify-center">
                  <img
                    src={paymentSettings.qris_url || qrisImage}
                    alt="QRIS Pembayaran IRIS"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] text-center mt-2 font-semibold">
                  A01 • ATHIF, COBLONG
                </span>
                <span className="text-[8px] text-[var(--text-muted)] text-center">
                  NMID: ID1025370590016
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6 max-w-5xl mx-auto py-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
      }}
    >
      <h1 className="sr-only">Rincian Pesanan {orderDetail.invoice_number}</h1>
      {/* Top detailed navbar */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--color-border)]"
        variants={{ hidden: { opacity: 0, y: -16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
      >
        <button
          onClick={() => {
            setOrderDetail(null);
            setLookupInvoiceInput('');
            navigate(ROUTES.PAYMENT_CONFIRM);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[var(--color-primary)] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" /> Cari Invoice Lain
        </button>
        
        {/* Invoice Meta Status Info */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">Nomor Invoice:</span>
          <span className="font-mono text-xs font-black text-[var(--color-heading)] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
            {orderDetail.invoice_number}
            <button 
              onClick={handleCopyInvoice} 
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-body)] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-md"
              title="Salin Nomor Invoice"
              aria-label="Salin Nomor Invoice"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </span>
          <StatusBadge status={orderStatus} customLabel={getStatusLabel(orderStatus)} />
        </div>
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 32, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
      >
        <OrderStatus
          status={orderStatus}
          illustrationUrl={illustrationUrl}
          statusTitle={statusTitle}
          statusDescription={statusDescription}
          item={trackingItem}
          summary={trackingSummary}
          timelineSteps={timelineSteps}
          trackingStatus={footerStatusText}
          buttonLabel={buttonConfig.label}
          buttonIcon={buttonConfig.icon}
          onTrackOrder={buttonConfig.action}
        />
      </motion.div>

      {/* ── Payment Proof Upload / Status ── */}
      {(orderStatus === 'waiting_payment' || paymentRecord) && orderStatus !== 'cancelled' && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
        >
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--color-surface)] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-[var(--color-heading)] uppercase tracking-wider border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[var(--color-primary)] rounded-full"></span>
              Bukti Pembayaran
            </h3>

            {paymentRecord && paymentRecord.status !== 'rejected' ? (
              <div className="space-y-4">
                {paymentRecord.status === 'verified' ? (
                  <div className="rounded-2xl border border-[var(--color-mint)]/25 bg-[var(--color-mint-tint-15)] px-4 py-3 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-[var(--color-iris-mint-dark)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-[var(--color-iris-mint-dark)]">Pembayaran Terverifikasi</p>
                      <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Bukti transfer Anda sudah diverifikasi oleh admin. Pesanan preorder Anda aman!</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--color-peach)]/30 bg-[var(--color-peach-tint-15)] px-4 py-3 flex items-start gap-2.5">
                    <Clock className="h-4.5 w-4.5 text-[var(--color-iris-peach-dark)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-[var(--color-iris-peach-dark)]">Menunggu Verifikasi Admin</p>
                      <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Bukti transfer sudah kami terima. Verifikasi biasanya maksimal 1x24 jam.</p>
                    </div>
                  </div>
                )}
                {paymentRecord.proof_image_url && (
                  <a href={paymentRecord.proof_image_url} target="_blank" rel="noopener noreferrer" className="block w-32">
                    <img
                      src={paymentRecord.proof_image_url}
                      alt="Bukti pembayaran"
                      className="w-32 h-40 object-cover rounded-xl border border-[var(--border-color)] shadow-xs hover:opacity-90 transition"
                    />
                  </a>
                )}
              </div>
            ) : orderStatus === 'waiting_payment' ? (
              <form onSubmit={handleProofSubmit} className="space-y-4">
                {paymentRecord?.status === 'rejected' && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-2.5">
                    <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold text-rose-600">Bukti Pembayaran Ditolak</p>
                      <p className="text-[10px] font-semibold text-slate-600 mt-0.5">Bukti transfer sebelumnya tidak valid. Silakan unggah ulang bukti yang benar.</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Unggah foto/tangkapan layar bukti transfer Anda di sini agar admin dapat memverifikasi pembayaran lebih cepat.
                </p>

                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleProofFileChange} className="hidden" />
                  {proofPreview ? (
                    <div className="relative w-40">
                      <img src={proofPreview} alt="Preview bukti transfer" className="w-40 h-52 object-cover rounded-2xl border border-[var(--border-color)] shadow-xs" />
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[9px] font-bold whitespace-nowrap">Ganti Gambar</span>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-2 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/30 transition">
                      <UploadCloud className="h-7 w-7 text-[var(--color-primary)]" />
                      <span className="text-xs font-bold text-slate-700">Klik untuk pilih foto bukti transfer</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">JPG, PNG, atau WebP • otomatis dikompresi</span>
                    </div>
                  )}
                </label>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                    Nama Pengirim Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    value={proofSenderName}
                    onChange={(e) => setProofSenderName(e.target.value)}
                    placeholder="Nama pemilik rekening pengirim…"
                    className="w-full sm:max-w-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition"
                  />
                </div>

                {proofError && (
                  <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> {proofError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingProof || isUploading || !proofFile}
                  className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition active:scale-95 inline-flex items-center gap-2"
                >
                  <UploadCloud className="h-4 w-4" />
                  {isSubmittingProof || isUploading ? 'Mengunggah…' : 'Kirim Bukti Pembayaran'}
                </button>
              </form>
            ) : null}
          </Card>
        </motion.div>
      )}

      {/* ── Production Stage Tracker (preorder) ── */}
      {orderedProduct?.is_preorder && orderedProduct?.production_stage && ['paid', 'processing'].includes(orderStatus) && (() => {
        const currentStageIdx = PRODUCTION_STAGES.findIndex(s => s.value === orderedProduct.production_stage);
        return (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
          >
            <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--color-surface)] rounded-3xl p-6 shadow-xs space-y-5">
              <h3 className="text-xs font-black text-[var(--color-heading)] uppercase tracking-wider border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[var(--color-primary)] rounded-full"></span>
                <Factory className="h-3.5 w-3.5 text-[var(--color-iris-purple-dark)]" />
                Progres Produksi Preorder • Batch {orderedProduct.preorder_round || 1}
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRODUCTION_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div key={stage.value} className="flex flex-col items-center gap-1.5 text-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition ${
                        isDone
                          ? 'bg-[var(--color-mint-tint-15)] border-[var(--color-mint)]/40 text-[var(--color-iris-mint-dark)]'
                          : isCurrent
                            ? 'bg-[var(--color-purple-tint-12)] border-[var(--color-iris-purple-dark)]/40 text-[var(--color-iris-purple-dark)] animate-pulse'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                      }`}>
                        {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase tracking-wide leading-tight ${
                        isCurrent ? 'text-[var(--color-iris-purple-dark)]' : isDone ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-iris-gradient transition-all duration-700"
                  style={{ width: `${Math.round(((currentStageIdx + 1) / PRODUCTION_STAGES.length) * 100)}%` }}
                />
              </div>

              {orderedProduct.production_notes && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3">
                  <span className="font-extrabold text-slate-700">Catatan Admin:</span> {orderedProduct.production_notes}
                </p>
              )}

              {orderedProduct.estimated_delivery && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                  <CalendarDays className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                  <span>Estimasi pengiriman: <span className="text-slate-800">{orderedProduct.estimated_delivery}</span></span>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })()}
    </motion.div>
  );
}

// ─────────────────────────── Helpers ───────────────────────────

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.702-3.826c1.603.951 3.256 1.487 4.937 1.49 5.451 0 9.885-4.432 9.888-9.886.002-2.643-1.022-5.128-2.883-6.991A9.811 9.811 0 0012.008 1.9c-5.452 0-9.887 4.434-9.89 9.889-.001 1.816.48 3.59 1.391 5.148l-1.007 3.68 3.774-.989zm11.386-5.493c-.268-.134-1.585-.782-1.831-.872-.247-.09-.427-.134-.607.134-.18.269-.696.872-.853 1.05-.157.18-.314.202-.583.068-1.55-.78-2.527-1.347-3.528-3.07-.263-.455.263-.422.753-1.402.083-.168.042-.314-.02-.449-.063-.135-.607-1.462-.831-2.002-.219-.527-.459-.455-.607-.463-.157-.008-.337-.01-.517-.01a1.002 1.002 0 00-.72.337c-.247.269-.944.922-.944 2.247 0 1.325.966 2.607 1.1 2.787.135.18 1.9 2.902 4.602 4.07 1.705.736 2.457.854 3.329.726.549-.082 1.585-.648 1.809-1.272.225-.624.225-1.162.157-1.272-.067-.113-.247-.203-.517-.337z" />
    </svg>
  );
}
