export const orderService = {
  getOrders: async () => {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal mengambil pesanan');
    return data.orders;
  },

  getOrderDetail: async (orderId) => {
    const res = await fetch(`/api/admin/orders?id=${orderId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal mengambil detail pesanan');
    return data; // returns { order, items, auditLogs }
  },

  updateOrderStatus: async (orderId, nextStatus, note) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', orderId, nextStatus, note }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal memperbarui status');
    return data.order;
  },

  updateOrderFulfillment: async (orderId, { trackingNumber, trackingUrl, markShipped, note }) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateFulfillment', orderId, trackingNumber, trackingUrl, markShipped, note }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal memperbarui pemenuhan');
    return data.order;
  },

  updateOrderShippingCost: async (orderId, newCost) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateShippingCost', orderId, newCost }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal menyesuaikan ongkos kirim');
    return data.order;
  },

  deleteOrder: async (orderId) => {
    const res = await fetch(`/api/admin/orders?id=${orderId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal menghapus pesanan');
    return { success: true };
  },
};
