import React from 'react';
import MainLayout from '../../../../components/layout/MainLayout';
import MerchCheckoutPage from '../../../../features/merchandise/MerchCheckoutPage';
import { merchandiseService } from '../../../../services/public/merchandiseService';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await merchandiseService.getProductById(id);
  if (!product) {
    return {
      title: 'Checkout Produk | IRIS Official Website',
    };
  }
  return {
    title: `Checkout ${product.name} | Merchandise IRIS`,
    description: product.description || 'Formulir checkout pre-order merchandise IRIS.',
  };
}

export default function Page() {
  return (
    <MainLayout>
      <MerchCheckoutPage />
    </MainLayout>
  );
}
