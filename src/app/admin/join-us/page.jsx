'use client';

import AdminLayout from '@/admin/AdminLayout';
import AdminJoinUsPage from '@/admin/modules/join-us/AdminJoinUsPage';

export default function AdminJoinUsRoute() {
  return (
    <AdminLayout>
      <AdminJoinUsPage />
    </AdminLayout>
  );
}
