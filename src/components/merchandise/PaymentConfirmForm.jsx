import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import { Camera } from 'lucide-react';

export default function PaymentConfirmForm({
  onSubmit,
  isSubmitting = false,
  initialInvoice = '',
  initialAmount = '',
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: initialInvoice,
    senderBank: '',
    senderName: '',
    paymentAmount: initialAmount,
    receiptUrl: '',
  });

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      invoiceNumber: initialInvoice || prev.invoiceNumber,
      paymentAmount: initialAmount || prev.paymentAmount,
    }));
  }, [initialInvoice, initialAmount]);

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { uploadFile, isUploading, progress } = useSupabaseUpload();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (errors.receiptUrl) {
        setErrors((prev) => ({ ...prev, receiptUrl: '' }));
      }
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.invoiceNumber.trim()) tempErrors.invoiceNumber = 'Nomor Invoice wajib diisi';
    if (!formData.senderBank.trim()) tempErrors.senderBank = 'Bank pengirim wajib diisi';
    if (!formData.senderName.trim()) tempErrors.senderName = 'Nama pengirim wajib diisi';
    if (!formData.paymentAmount.trim() || isNaN(formData.paymentAmount)) {
      tempErrors.paymentAmount = 'Jumlah transfer valid wajib diisi';
    }
    if (!file && !formData.receiptUrl) {
      tempErrors.receiptUrl = 'Bukti transfer wajib diunggah';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let finalReceiptUrl = formData.receiptUrl;
      if (file) {
        finalReceiptUrl = await uploadFile(file, 'payments', 'receipts');
      }
      
      onSubmit({
        ...formData,
        paymentAmount: parseFloat(formData.paymentAmount),
        receiptUrl: finalReceiptUrl,
      });
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, receiptUrl: 'Gagal mengunggah gambar bukti transfer. Coba lagi.' }));
    }
  };

  return (
    <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] max-w-xl mx-auto">
      <h3 className="text-xl font-bold mb-6 text-center text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
        Form Konfirmasi Pembayaran
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Nomor Invoice / Kode Pesanan
          </label>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            placeholder="Contoh: INV-349832"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          {errors.invoiceNumber && <p className="mt-1 text-xs text-red-500 font-medium">{errors.invoiceNumber}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Bank Pengirim
            </label>
            <input
              type="text"
              name="senderBank"
              value={formData.senderBank}
              onChange={handleChange}
              placeholder="Contoh: BCA, Mandiri, Gopay"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
            {errors.senderBank && <p className="mt-1 text-xs text-red-500 font-medium">{errors.senderBank}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Nama Rekening Pengirim
            </label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
            {errors.senderName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.senderName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Jumlah yang Ditransfer (Rupiah)
          </label>
          <input
            type="number"
            name="paymentAmount"
            value={formData.paymentAmount}
            onChange={handleChange}
            placeholder="Contoh: 150000"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          {errors.paymentAmount && <p className="mt-1 text-xs text-red-500 font-medium">{errors.paymentAmount}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Unggah Bukti Transfer (JPG/PNG)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-primary)] hover:border-[var(--color-primary)] transition-all">
            <div className="space-y-1 text-center">
              <Camera className="h-8 w-8 text-purple-400 block mx-auto mb-2" />
              <div className="flex text-sm text-gray-400 justify-center">
                <label className="relative cursor-pointer rounded-md font-semibold text-[var(--color-primary-hover)] hover:underline focus-within:outline-none">
                  <span>Pilih file gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="text-xs text-[var(--text-muted)]">PNG, JPG, JPEG up to 5MB</p>
              {file && (
                <p className="mt-2 text-xs font-semibold text-emerald-400 truncate max-w-xs mx-auto">
                  ✓ {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
          {errors.receiptUrl && <p className="mt-1 text-xs text-red-500 font-medium">{errors.receiptUrl}</p>}
        </div>

        {/* Upload Progress Loader */}
        {isUploading && (
          <div className="w-full bg-[var(--border-color)] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <Button
          type="submit"
          variant="glow"
          className="w-full pt-3 pb-3"
          isLoading={isSubmitting || isUploading}
        >
          Kirim Konfirmasi Pembayaran
        </Button>
      </form>
    </Card>
  );
}
