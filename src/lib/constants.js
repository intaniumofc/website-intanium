// Application-wide constant configurations

export const SITE_NAME = 'Intanium';
export const SITE_TAGLINE = 'The Official Portal for Intanium Community & Intan';
export const ADMIN_WHATSAPP_NUMBER = '6281386701549';

export const ROUTES = {
  HOME: '/',
  ABOUT_INTAN: '/about-intan',
  ABOUT_INTANIUM: '/about-intanium',
  MERCHANDISE: '/merchandise',
  MERCH_DETAIL: '/merchandise/:id',
  PAYMENT_CONFIRM: '/merchandise/payment-confirm',
  RECAPS: '/recaps',
  RECAP_DETAIL: '/recaps/:id',
  SCHEDULE: '/schedule',
  SHINING_STAR: '/shining-star',
  FANART: '/fanart',
  DENGER_INTAN: '/denger-intan',
  MADING: '/mading',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',
  GALLERY: '/gallery',

  // Admin Routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ABOUT_INTAN: '/admin/about-intan',
  ADMIN_SHINING_STAR: '/admin/intan-shining-star',
  ADMIN_MERCHANDISE: '/admin/merchandise',
  ADMIN_CATEGORIES: '/admin/merchandise/categories',
  ADMIN_ORDERS: '/admin/merchandise/orders',
  ADMIN_RECAPS: '/admin/recaps',
  ADMIN_SCHEDULE: '/admin/schedule',
  ADMIN_NEWS: '/admin/news',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_MADING: '/admin/mading',
  ADMIN_PLAYLISTS: '/admin/denger-intan',
};

export const SOCIALS = {
  TWITTER: 'https://x.com/intanium_ofc',
  INSTAGRAM: 'https://instagram.com/intanium_ofc',
  TIKTOK: 'https://tiktok.com/@intanium_ofc',
  YOUTUBE: 'https://www.youtube.com/@IntaniumOfc',
  EMAIL: 'mailto:intaniumofc@gmail.com',
  THREADS: 'https://www.threads.net/@intanium_ofc',
};

export const MERCH_CATEGORIES = {
  ALL: 'All',
  CLOTHING: 'Clothing',
  ACCESSORIES: 'Accessories',
  COLLECTIBLES: 'Collectibles',
  ART: 'Art Prints',
};

export const MADING_COLOR_THEMES = [
  { id: 'yellow', name: 'Sunny Yellow', bgClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800' },
  { id: 'pink', name: 'Sakura Pink', bgClass: 'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-800' },
  { id: 'blue', name: 'Sky Blue', bgClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800' },
  { id: 'purple', name: 'Neon Purple', bgClass: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800' },
  { id: 'green', name: 'Emerald', bgClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800' },
];
