// Service for managing Official Shop Merchandise Products and Orders

const MOCK_PRODUCTS = [
  {
    id: 'merch-1',
    name: 'Intan 1st Anniversary Limited Hoodie',
    price: 325000,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    category: 'Clothing',
    description: 'Hoodie edisi terbatas perayaan 1 tahun debut Intan. Menggunakan material Cotton Fleece 330gsm ultra premium yang sangat lembut dan hangat. Sablon DTF resolusi tinggi di bagian punggung menampilkan desain eksklusif Chibi Intan, lengkap dengan emblem bordir logo Intanium di dada kiri.',
    isAvailable: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'merch-2',
    name: 'Intanium Holographic Acrylic Standee',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    category: 'Collectibles',
    description: 'Akrilik standee premium dengan efek hologram pelangi di tepi luar. Tinggi 15cm dengan ketebalan akrilik 4mm ganda yang kokoh. Menampilkan visual menawan Key Visual Intan Summer Party. Cocok untuk pajangan di meja komputer atau rak koleksi Anda.',
    isAvailable: true,
    sizes: ['Standard'],
  },
  {
    id: 'merch-3',
    name: 'Es Matcha Latte Special Tumbler',
    price: 135000,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    category: 'Accessories',
    description: 'Tumbler termal tahan dingin/panas hingga 12 jam, dirancang khusus bernuansa warna hijau matcha kesukaan Intan. Kapasitas 500ml dari stainless steel SUS304 food grade bebas BPA. Grafis luar dicetak laser grafir tidak akan pudar.',
    isAvailable: true,
    sizes: ['500ml'],
  },
  {
    id: 'merch-4',
    name: 'Chibi Intan Keyring (Set of 3)',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    category: 'Accessories',
    description: 'Satu set gantungan kunci akrilik berisikan 3 ekspresi chibi Intan yang super imut (senang, cemberut, menangis). Gantungan kuat menggunakan tipe jepit putar berkualitas tinggi.',
    isAvailable: false,
    sizes: ['Set'],
  },
];

export const merchandiseService = {
  getProducts: async (category = 'All', search = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = [...MOCK_PRODUCTS];

    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search.trim()) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  },

  getProductById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  },

  createOrder: async (orderData) => {
    // In real app, write to Supabase "orders" table
    await new Promise(resolve => setTimeout(resolve, 500));
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      invoiceNumber,
      ...orderData
    };
  },

  confirmPayment: async (confirmData) => {
    // In real app, write to Supabase "payments" table
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Konfirmasi pembayaran berhasil dikirim. Kami akan memverifikasi dalam waktu 24 jam.'
    };
  }
};
