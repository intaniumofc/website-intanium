import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { merchandiseService } from './merchandiseService';
import PageHeader from '../../components/layout/PageHeader';
import PaymentConfirmForm from '../../components/merchandise/PaymentConfirmForm';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../lib/helpers';
import { ROUTES } from '../../lib/constants';
import { CheckCircle } from 'lucide-react';

export default function PaymentConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const inv = searchParams.get('inv');
    const total = searchParams.get('total');
    if (inv) setInvoice(inv);
    if (total) setAmount(total);
  }, [searchParams]);

  const handleConfirmSubmit = async (confirmData) => {
    setIsSubmitting(true);
    try {
      const response = await merchandiseService.confirmPayment(confirmData);
      setSuccessMsg(response.message);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <Card className="text-center py-12 border border-[var(--border-color)] max-w-lg mx-auto mt-12 animate-fade-in space-y-6">
        <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-emerald-400">Konfirmasi Berhasil!</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
          {successMsg} Kami juga mengirimkan notifikasi status pesanan Anda ke email/nomor WhatsApp yang Anda cantumkan.
        </p>
        <div>
          <button
            onClick={() => navigate(ROUTES.MERCHANDISE)}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] font-bold text-sm cursor-pointer shadow-md"
          >
            Kembali ke Toko
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Konfirmasi Transaksi"
        subtitle="Selesaikan pembayaran Anda dan unggah bukti transfer di bawah ini agar pesanan bisa langsung kami verifikasi & kirim!"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Payment Transfer Instructions Info */}
        <div className="md:col-span-1 space-y-6">
          <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider border-b border-[var(--border-color)] pb-2">
              Instruksi Rekening Bank
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Silakan transfer total belanjaan Anda ke salah satu rekening pembayaran resmi komunitas berikut:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] block">BANK CENTRAL ASIA (BCA)</span>
                <span className="text-sm font-bold text-white tracking-wider block mt-1">8723-9482-12</span>
                <span className="text-[10px] font-medium text-[var(--text-secondary)] block mt-0.5">a.n. Intan Merch Admin</span>
              </div>

              <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] block">E-WALLET (GOPAY/OVO)</span>
                <span className="text-sm font-bold text-white tracking-wider block mt-1">0812-3456-7890</span>
                <span className="text-[10px] font-medium text-[var(--text-secondary)] block mt-0.5">a.n. Intan Official Shop</span>
              </div>
            </div>

            {invoice && amount && (
              <div className="p-4 bg-purple-950/20 border border-[var(--color-primary)] rounded-xl mt-4">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase">Invoice Anda:</span>
                <span className="text-xs font-bold text-purple-300 block mt-1">{invoice}</span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] block uppercase mt-2">Tagihan Belanja:</span>
                <span className="text-sm font-extrabold text-[var(--color-secondary)] block mt-0.5">{formatCurrency(amount)}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Upload Form Component */}
        <div className="md:col-span-2">
          <PaymentConfirmForm
            onSubmit={handleConfirmSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
