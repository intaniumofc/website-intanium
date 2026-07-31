// Lightweight WhatsApp notification helper for the preorder system.
// Notifications are logged in `order_notifications` (server-side) and sent
// manually by admin via pre-filled WhatsApp deep links generated here.

const STATUS_LABELS = {
  pending_review: 'Sedang Ditinjau Admin',
  waiting_payment: 'Menunggu Pembayaran',
  paid: 'Pembayaran Terverifikasi',
  processing: 'Sedang Diproses / Produksi',
  ready_for_pickup: 'Siap Diambil di FX Sudirman',
  shipped: 'Telah Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

// Normalize Indonesian phone numbers into wa.me-compatible format (62xxx)
export function normalizePhoneForWhatsApp(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

// Predefined message templates per notification type
export const NOTIFICATION_TEMPLATES = {
  order_created: ({ invoiceNumber, productName }) =>
    `Halo! Terima kasih, pesanan preorder Anda telah kami terima. 🎉` +
    `\n\n*Invoice:* ${invoiceNumber}\n*Produk:* ${productName || 'Merchandise IRIS'}\n\n` +
    `Silakan lakukan pembayaran dan unggah bukti transfer melalui halaman lacak pesanan. Terima kasih! — Admin IRIS`,

  payment_verified: ({ invoiceNumber }) =>
    `Halo! Pembayaran untuk pesanan *${invoiceNumber}* telah kami *verifikasi*. ✅\n\n` +
    `Pesanan Anda masuk antrean produksi/pemrosesan. Pantau progresnya di halaman lacak pesanan. Terima kasih! — Admin IRIS`,

  payment_rejected: ({ invoiceNumber }) =>
    `Halo! Mohon maaf, bukti pembayaran untuk pesanan *${invoiceNumber}* *belum dapat kami verifikasi*. ❌\n\n` +
    `Mohon unggah ulang bukti transfer yang valid melalui halaman lacak pesanan, atau balas pesan ini untuk bantuan. — Admin IRIS`,

  status_changed: ({ invoiceNumber, status }) =>
    `Halo! Status pesanan *${invoiceNumber}* telah diperbarui menjadi: *${STATUS_LABELS[status] || status}*. 📦\n\n` +
    `Cek detail terbaru di halaman lacak pesanan. Terima kasih! — Admin IRIS`,

  preorder_reminder: ({ productName, endDate }) =>
    `Halo! Pengingat: preorder *${productName || 'Merchandise IRIS'}* akan segera *ditutup*${endDate ? ` pada ${endDate}` : ''}! ⏰\n\n` +
    `Jangan sampai ketinggalan ya. Segera lakukan pemesanan sebelum periode preorder ditutup. — Admin IRIS`,

  shipping_update: ({ invoiceNumber, trackingNumber, trackingUrl }) =>
    `Halo! Pesanan *${invoiceNumber}* telah *dikirim*. 🚚\n\n` +
    `*No. Resi:* ${trackingNumber || '-'}` +
    `${trackingUrl ? `\n*Lacak paket:* ${trackingUrl}` : ''}\n\n` +
    `Mohon konfirmasi jika paket sudah diterima. Terima kasih! — Admin IRIS`,
};

export const notificationService = {
  // Build a plain message string for the given notification type
  buildMessage: (type, params = {}) => {
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) return '';
    return template(params);
  },

  // Generate a wa.me deep link with a pre-filled message
  buildWhatsAppLink: (phone, message) => {
    const normalized = normalizePhoneForWhatsApp(phone);
    if (!normalized) return '';
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  },

  // Convenience: build a deep link straight from a template
  buildNotificationLink: (phone, type, params = {}) => {
    const message = notificationService.buildMessage(type, params);
    if (!message) return '';
    return notificationService.buildWhatsAppLink(phone, message);
  },
};
