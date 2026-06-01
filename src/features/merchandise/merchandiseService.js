// Service for managing Official Shop Merchandise Products and Orders

const MOCK_PRODUCTS = [
  {
    id: 'merch-1',
    name: 'Intan 1st Anniversary Limited Hoodie',
    price: 325000,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80'
    ],
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
    imageUrls: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80'
    ],
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
    imageUrls: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
    ],
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
  {
    id: 'merch-5',
    name: 'Intanium Super Soft Cosy Cushion',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
    category: 'Collectibles',
    description: 'Bantal sofa ultra empuk berdiameter 40cm dengan sarung bantal beludru premium berdesain chibi Intan berkilau. Sangat nyaman untuk bersandar saat menonton live stream.',
    isAvailable: true,
    sizes: ['40x40cm'],
  },
  {
    id: 'merch-6',
    name: 'Matcha Vibes Lofi Desk Mat / Mousepad',
    price: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    category: 'Accessories',
    description: 'Mousepad meja ekstra lebar ukuran 80x30cm dengan ketebalan 4mm. Menampilkan ilustrasi digital aesthetic Matcha Vibes dengan jahitan tepi anti-koyak yang awet.',
    isAvailable: true,
    sizes: ['80x30cm'],
  },
  {
    id: 'merch-7',
    name: 'Voice Pack: Good Morning Greeting by Intan',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
    category: 'Collectibles',
    description: 'Rekaman suara alarm pagi spesial berdurasi 30 detik yang ceria dan penuh kehangatan langsung diisi oleh Intan sendiri. File audio berkualitas tinggi berformat MP3 & WAV.',
    isAvailable: true,
    sizes: ['Digital Pack'],
  },
  {
    id: 'merch-8',
    name: 'Summer Party Holographic Art Print',
    price: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
    category: 'Art Prints',
    description: 'Poster cetak seni ukuran A3 menggunakan kertas karton art paper 310gsm tebal dengan lapisan laminasi hologram metalik berkilau yang memberikan nuansa pesta pantai musim panas.',
    isAvailable: true,
    sizes: ['A3 Print'],
  }
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
