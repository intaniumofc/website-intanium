// Service for managing the Interactive digital corkboard (Mading board messages)
import { generateId } from '../../lib/helpers';

let LOCAL_NOTES = [
  {
    id: 'note-1',
    name: 'Admin Intanium',
    message: 'Selamat datang di Mading Resmi Intanium! 📌 Silakan tempelkan pesan dukungan, candaan bersahabat, atau ucapan selamat Anda di sini agar bisa direview langsung oleh Intan saat stream nanti!',
    themeColor: 'purple',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isAdmin: true,
  },
  {
    id: 'note-2',
    name: 'MatchaLover',
    message: 'Intan-chan! Semoga hari-harimu selalu menyenangkan! Jangan lupa minum es matcha latte hari ini yaaa 🍵💚',
    themeColor: 'green',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isAdmin: false,
  },
  {
    id: 'note-3',
    name: 'WibuGamer99',
    message: 'Stream Minecraft kemarin petjah abis kakk! Ditunggu collab mabar kastil ungu selanjutnya, ga sabar bangeeet!',
    themeColor: 'blue',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isAdmin: false,
  },
  {
    id: 'note-4',
    name: 'Andi_Kreatif',
    message: 'Happy Anniversary 1st Year Debut Intan! Sukses selalu, semoga lancar terus stream dan karir nyanyinya! We love you! 🎉✨',
    themeColor: 'pink',
    createdAt: new Date().toISOString(),
    isAdmin: false,
  },
];

export const madingService = {
  getNotes: async () => {
    // In real app, fetch from Supabase "mading" table
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...LOCAL_NOTES].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  postNote: async (noteData) => {
    // In real app, insert into Supabase "mading" table
    await new Promise(resolve => setTimeout(resolve, 400));
    const newNote = {
      id: generateId(),
      name: noteData.name || 'Anonim',
      message: noteData.message,
      themeColor: noteData.themeColor || 'yellow',
      createdAt: new Date().toISOString(),
      isAdmin: false,
    };
    LOCAL_NOTES = [newNote, ...LOCAL_NOTES];
    return newNote;
  },

  deleteNote: async (id) => {
    // In real app, delete from Supabase
    await new Promise(resolve => setTimeout(resolve, 300));
    LOCAL_NOTES = LOCAL_NOTES.filter(note => note.id !== id);
    return { success: true };
  }
};
