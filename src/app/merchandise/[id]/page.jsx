import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import MerchDetailPage from '../../../features/merchandise/MerchDetailPage';
import { merchandiseService } from '../../../services/public/merchandiseService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await merchandiseService.getProductById(id);
  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Intanium Official Website',
    };
  }
  return {
    title: `Pre-Order ${product.name} | Merchandise Intanium`,
    description: product.description || 'Pre-order merchandise eksklusif Nur Intan JKT48.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <MerchDetailPage />
    </MainLayout>
  );
}
