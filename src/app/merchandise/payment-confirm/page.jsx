import React, { Suspense } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import PaymentConfirmPage from '../../../features/merchandise/PaymentConfirmPage';

export const metadata = {
  title: 'Konfirmasi Pembayaran | IRIS Official Website',
  description: 'Halaman resmi konfirmasi pembayaran transfer bank atau QRIS untuk pesanan merchandise IRIS.',
};

export default function Page() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading payment page...</div>}>
        <PaymentConfirmPage />
      </Suspense>
    </MainLayout>
  );
}
