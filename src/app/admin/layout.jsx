'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '../../admin/AdminLayout';
import { AdminToastProvider } from '../../components/common/AdminToastProvider';

export default function Layout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AdminToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        {isLoginPage ? (
          children
        ) : (
          <AdminLayout>{children}</AdminLayout>
        )}
      </Suspense>
    </AdminToastProvider>
  );
}
