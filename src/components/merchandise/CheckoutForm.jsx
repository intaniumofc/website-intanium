import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { formatCurrency, isValidEmail } from '../../lib/helpers';

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
    address: '',
    postalCode: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const totalAmount = product.price * quantity;

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
    if (!formData.phone.trim()) tempErrors.phone = 'Nomor telepon wajib diisi';
    if (!formData.address.trim()) tempErrors.address = 'Alamat pengiriman wajib diisi';
    if (!formData.postalCode.trim()) tempErrors.postalCode = 'Kode pos wajib diisi';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      onSubmit({ ...formData, totalAmount, quantity, productId: product.id });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Buyer Details Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)]">
          <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">
            Informasi Penerima & Alamat Pengiriman
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Masukkan nama lengkap Anda"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="email@contoh.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Nomor WhatsApp / Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Contoh: 081234567890"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Alamat Lengkap Pengiriman
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, provinsi"
              />
              {errors.address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Kode Pos
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Masukkan kode pos"
              />
              {errors.postalCode && <p className="mt-1 text-xs text-red-500 font-medium">{errors.postalCode}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Catatan Opsional
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Contoh: Ukuran kaos, warna pilihan dll"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Cart Summary */}
      <div className="space-y-6">
        <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] bg-[var(--bg-secondary)] relative">
          <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            Ringkasan Pesanan
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <img
              src={product.imageUrl}
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
                className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="text-sm font-bold w-4 text-center">{quantity}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary)] flex items-center justify-center font-bold text-sm cursor-pointer"
                onClick={() => onQuantityChange(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>Pengiriman</span>
              <span className="text-green-500 font-semibold">FREE ONGKIR</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[var(--text-primary)] border-t border-[var(--border-color)] pt-3">
              <span>Total Pembayaran</span>
              <span className="text-[var(--color-secondary)]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Button type="submit" variant="glow" className="w-full">
            Buat Pesanan & Bayar
          </Button>
        </Card>
      </div>
    </form>
  );
}
