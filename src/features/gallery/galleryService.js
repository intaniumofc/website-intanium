// Service for managing official photo gallery collections

const MOCK_GALLERY = [
  {
    id: 'gal-1',
    title: 'Model Live2D Key Visual Reveal (Casual Style)',
    description: 'Pose render orisinal model Live2D Intan gaya casual sci-fi yang pertama kali diperkenalkan saat debut stream.',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'gal-2',
    title: 'Minecraft Multiplayer Castle Stage View',
    description: 'Screenshot kastil megah berbahan ungu yang dibangun bersama para member komunitas Intanium di server Survival.',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'gal-3',
    title: 'Matcha Vibes Chill Cover Artwork Canvas',
    description: 'Kanvas artwork ilustrasi digital promo rilisan EP Album Matcha Vibes Lofi Chill.',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'gal-4',
    title: 'Special Concert Fan Meeting Virtual Room',
    description: 'Screenshot keramaian member dalam room virtual meet and greet konser ulang tahun debut Intan.',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
];

export const galleryService = {
  getGalleryPhotos: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return MOCK_GALLERY;
  }
};
