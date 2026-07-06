'use client';

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { formatCurrency, isValidEmail } from '../../lib/helpers';
import { MapPin, Truck, ExternalLink, Info, ArrowLeft, Copy, Check } from 'lucide-react';
import qrisImage from '../../assets/images/qris-intanium.webp';
import { merchandiseService } from '../../features/merchandise/merchandiseService';

export default function CheckoutForm({
  product,
  quantity,
  onQuantityChange,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lineId: '',
    intaniumMemberId: '',
    deliveryMethod: 'pickup_fx', // 'pickup_fx' or 'expedition_jnt'
    address: '',
    city: '',
    province: '',
    postalCode: '',
    shippingCost: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    bank_name: 'BANK JAGO',
    account_number: '107287946603',
    account_holder: 'Muhammad Fauzan Casimira',
    qris_url: '',
  });

  useEffect(() => {
    merchandiseService.getPaymentSettings()
      .then((settings) => {
        if (settings) {
          setPaymentSettings(settings);
        }
      })
      .catch((err) => console.error('Error fetching payment settings:', err));
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(paymentSettings.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = () => {
    if (handleValidation()) {
      setStep(2);
    }
  };

  const subtotal = product.price * quantity;
  const isJnt = formData.deliveryMethod === 'expedition_jnt';
  const shippingCostNum = isJnt ? Number(formData.shippingCost) || 0 : 0;
  const totalAmount = subtotal + shippingCostNum;

  const handleDeliveryMethodChange = (method) => {
    setFormData((prev) => {
      if (method === 'pickup_fx') {
        // Reset shipment details when switching to FX pickup
        return {
          ...prev,
          deliveryMethod: method,
          address: '',
          city: '',
          province: '',
          postalCode: '',
          shippingCost: '',
        };
      }
      return {
        ...prev,
        deliveryMethod: method,
      };
    });
    // Clear errors for delivery-dependent fields
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.address;
      delete newErrors.city;
      delete newErrors.province;
      delete newErrors.postalCode;
      delete newErrors.shippingCost;
      return newErrors;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleValidation = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Nama lengkap wajib diisi';

    if (!formData.email.trim()) {
      tempErrors.email = 'Email wajib diisi';
    } else if (!isValidEmail(formData.email)) {
      tempErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) tempErrors.phone = 'Nomor WhatsApp wajib diisi';
    if (!formData.lineId.trim()) tempErrors.lineId = 'ID Line wajib diisi';

    if (isJnt) {
      if (!formData.address.trim()) tempErrors.address = 'Alamat pengiriman wajib diisi';
      if (!formData.city.trim()) tempErrors.city = 'Kota/Kabupaten wajib diisi';
      if (!formData.province.trim()) tempErrors.province = 'Provinsi wajib diisi';
      if (!formData.postalCode.trim()) tempErrors.postalCode = 'Kode pos wajib diisi';

      const parsedCost = Number(formData.shippingCost);
      if (!formData.shippingCost.trim()) {
        tempErrors.shippingCost = 'Ongkos kirim wajib diisi';
      } else if (isNaN(parsedCost) || parsedCost < 0) {
        tempErrors.shippingCost = 'Ongkos kirim harus berupa angka positif';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      onSubmit({
        ...formData,
        subtotal,
        shipping_cost: shippingCostNum,
        totalAmount,
        quantity,
        productId: product.id,
        courier: isJnt ? 'J&T' : null,
        service: isJnt ? 'EZ' : null,
        status: 'pending_review'
      });
    }
  };

  // Determine if the submit button should be disabled for J&T
  const isSubmitDisabled = isJnt && (!formData.shippingCost.trim() || isNaN(Number(formData.shippingCost)) || Number(formData.shippingCost) < 0);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Buyer Details Form or Payment Info */}
      <div className="lg:col-span-2 space-y-6">
        {step === 1 ? (
          <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)]">
            <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">
              Informasi Pembeli & Metode Pengiriman
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Masukkan nama lengkap Anda"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Alamat Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="email@contoh.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Contoh: 081234567890"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="lineId" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  ID Line
                </label>
                <input
                  type="text"
                  id="lineId"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="ID Line untuk koordinasi"
                />
                {errors.lineId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.lineId}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="intaniumMemberId" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  ID Anggota Intanium (Opsional)
                </label>
                <input
                  type="text"
                  id="intaniumMemberId"
                  name="intaniumMemberId"
                  value={formData.intaniumMemberId}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Contoh: INT-9999"
                />
              </div>

              {/* Delivery Method Radio Cards */}
              <div className="md:col-span-2">
                <label id="delivery-method-label" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  Metode Pengiriman
                </label>
                <div
                  role="radiogroup"
                  aria-labelledby="delivery-method-label"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* FX Sudirman Card */}
                  <div
                    role="radio"
                    aria-checked={formData.deliveryMethod === 'pickup_fx'}
                    tabIndex={0}
                    onClick={() => handleDeliveryMethodChange('pickup_fx')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDeliveryMethodChange('pickup_fx');
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col justify-between transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                      formData.deliveryMethod === 'pickup_fx'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-5 w-5 ${formData.deliveryMethod === 'pickup_fx' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`} />
                        <span className="font-bold text-sm">Ambil di FX Sudirman</span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Titik temu di FX Sudirman Jakarta. Alamat pengiriman tidak wajib diisi.
                    </p>
                  </div>

                  {/* J&T Expedition Card */}
                  <div
                    role="radio"
                    aria-checked={formData.deliveryMethod === 'expedition_jnt'}
                    tabIndex={0}
                    onClick={() => handleDeliveryMethodChange('expedition_jnt')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDeliveryMethodChange('expedition_jnt');
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col justify-between transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                      formData.deliveryMethod === 'expedition_jnt'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className={`h-5 w-5 ${formData.deliveryMethod === 'expedition_jnt' ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`} />
                        <span className="font-bold text-sm">Ekspedisi J&T (EZ)</span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Dikirim lewat J&T Express dari Depok. Cek tarif dan input ongkir sendiri.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional Fields: FX Sudirman info */}
              {formData.deliveryMethod === 'pickup_fx' && (
                <div className="md:col-span-2 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-3">
                  <Info className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">Titik Temu FX Sudirman</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Anda tidak perlu mengisi alamat lengkap. Setelah menekan tombol kirim pesanan, admin akan menghubungi Anda lewat ID Line untuk koordinasi waktu dan titik temu.
                    </p>
                  </div>
                </div>
              )}

              {/* Conditional Fields: J&T Expedition Address fields */}
              {formData.deliveryMethod === 'expedition_jnt' && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-4 mt-2">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Alamat Lengkap Pengiriman
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Kota / Kabupaten
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Contoh: Depok"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500 font-medium">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Contoh: Jawa Barat"
                    />
                    {errors.province && <p className="mt-1 text-xs text-red-500 font-medium">{errors.province}</p>}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Masukkan kode pos"
                    />
                    {errors.postalCode && <p className="mt-1 text-xs text-red-500 font-medium">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label htmlFor="shippingCost" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                      Ongkos Kirim J&T EZ (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="shippingCost"
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) {
                          handleChange(e);
                        }
                      }}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Masukkan hasil cek tarif"
                    />
                    {errors.shippingCost && <p className="mt-1 text-xs text-red-500 font-medium">{errors.shippingCost}</p>}
                  </div>

                  {/* Guide J&T Check Box */}
                  <div className="md:col-span-2 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                      <Info className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Panduan Cek Tarif Ongkos Kirim J&T Express</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
                      <div>
                        <span className="block text-[var(--text-muted)] font-medium">Asal Pengiriman</span>
                        <strong className="text-[var(--text-primary)]">Depok</strong>
                      </div>
                      <div>
                        <span className="block text-[var(--text-muted)] font-medium">Berat Barang</span>
                        <strong className="text-[var(--text-primary)]">1 KG (EZ)</strong>
                      </div>
                      <div>
                        <span className="block text-[var(--text-muted)] font-medium">Tipe Layanan</span>
                        <strong className="text-[var(--text-primary)]">EZ (Reguler)</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Kunjungi website resmi J&T Express untuk mengecek tarif ongkos kirim dari <strong>Depok</strong> ke Kota/Kecamatan Anda. Masukkan nominal yang sesuai pada field di atas.
                    </p>
                    <a
                      href="https://jet.co.id/rates"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                    >
                      <span>Buka Cek Tarif J&T</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Notes field */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Catatan Opsional
                </label>
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder={formData.deliveryMethod === 'pickup_fx' ? 'Contoh: Waktu luang bertemu, varian baju, dll.' : 'Contoh: Ukuran kaos, warna pilihan dll'}
                />
              </div>
            </div>
          </Card>
        ) : (
          <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-white relative">
            {/* Step 2 Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-color)] pb-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali Edit Form
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
              Instruksi Transfer & Pembayaran
            </h3>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs leading-relaxed mb-6">
              Silakan lakukan pembayaran sebesar <strong className="text-[var(--color-secondary)] font-extrabold">{formatCurrency(totalAmount)}</strong> terlebih dahulu. Setelah transfer berhasil, klik tombol <strong>Kirim Pesanan & Konfirmasi WA</strong> di sebelah kanan. Anda akan langsung diarahkan ke WhatsApp Admin untuk melampirkan struk/bukti transfer.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Transfer Details */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[9px] font-extrabold text-[var(--text-muted)] block uppercase tracking-widest">Metode Transfer</span>
                  <span className="text-base font-black text-slate-800 tracking-wider block mt-1">{paymentSettings.bank_name}</span>

                  <div className="flex items-center justify-between mt-3 bg-[var(--bg-primary)] px-3 py-2 rounded-xl border border-[var(--border-color)]">
                    <span className="font-mono text-sm font-bold text-slate-700">{paymentSettings.account_number}</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      aria-label="Salin nomor rekening bank"
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition flex items-center gap-1 text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-md px-1"
                    >
                      {copied ? (
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

                  <div className="mt-3">
                    <span className="text-[9px] font-bold text-[var(--text-muted)] block uppercase">Nama Penerima</span>
                    <span className="text-xs font-bold text-slate-850">{paymentSettings.account_holder}</span>
                  </div>
                </div>

                {/* Instructions Checklist */}
                <div className="p-4 rounded-2xl bg-white border border-[var(--border-color)] text-[var(--text-secondary)] space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">Langkah Transfer:</h4>
                  <ul className="list-decimal list-inside text-[11px] space-y-2 leading-relaxed">
                    <li>Gunakan aplikasi m-banking atau e-wallet Anda.</li>
                    <li>Kirim transfer tepat sebesar <strong className="text-[var(--text-primary)]">{formatCurrency(totalAmount)}</strong>.</li>
                    <li>Simpan bukti bayar berupa screenshot/foto struk.</li>
                    <li>Tekan tombol di samping kanan untuk mengirim detail pesanan ke sistem dan membuka WhatsApp Admin.</li>
                  </ul>
                </div>
              </div>

              {/* QRIS Code */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--border-color)] bg-slate-50 relative overflow-hidden">
                <span className="text-[9px] font-extrabold text-[var(--text-muted)] block uppercase tracking-widest mb-2">Scan QRIS Intanium</span>
                <div className="w-48 h-64 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs p-2 flex items-center justify-center">
                  <img
                    src={(paymentSettings.qris_url || qrisImage)?.src || (paymentSettings.qris_url || qrisImage)}
                    alt="QRIS Pembayaran Intanium"
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
        )}
      </div>

      {/* Cart Summary */}
      <div className="space-y-6">
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-[var(--bg-secondary)] relative">
          <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            Ringkasan Pesanan
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={(product.image_url ?? product.imageUrl)?.src || (product.image_url ?? product.imageUrl)}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg border border-[var(--border-color)]"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{product.name}</h4>
              <p className="text-xs text-[var(--text-secondary)]">{formatCurrency(product.price)}</p>
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">Jumlah Kaos / Item</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Kurangi jumlah item"
                className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || step !== 1}
              >
                -
              </button>
              <span className="text-sm font-bold w-4 text-center">{quantity}</span>
              <button
                type="button"
                aria-label="Tambah jumlah item"
                className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] flex items-center justify-center font-bold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={step !== 1}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Pengiriman</span>
              {!isJnt ? (
                <span className="text-green-500 font-bold uppercase text-xs">FREE ONGKIR</span>
              ) : formData.shippingCost.trim() ? (
                <span>{formatCurrency(shippingCostNum)}</span>
              ) : (
                <span className="text-amber-500 font-bold text-xs">Belum diisi</span>
              )}
            </div>
            <div className="flex justify-between text-base font-extrabold text-[var(--text-primary)] border-t border-[var(--border-color)] pt-3">
              <span>Total Pembayaran</span>
              {isJnt && !formData.shippingCost.trim() ? (
                <span className="text-amber-500 text-xs font-bold">Menunggu ongkir</span>
              ) : (
                <span className="text-[var(--color-secondary)]">{formatCurrency(totalAmount)}</span>
              )}
            </div>
          </div>

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              variant={isSubmitDisabled ? 'outline' : 'glow'}
              className="w-full font-bold py-3 text-xs"
              disabled={isSubmitDisabled}
            >
              {isSubmitDisabled ? 'Lengkapi Ongkir Dulu' : 'Lanjut ke Pembayaran'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                type="submit"
                variant="glow"
                className="w-full font-bold py-3 text-xs"
              >
                Kirim Pesanan & Konfirmasi WA
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                ← Kembali Edit Detail
              </button>
            </div>
          )}
        </Card>
      </div>
    </form>
  );
}

