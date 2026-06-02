import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { galleryService } from '../../features/gallery/galleryService';
import Loading from '../../components/common/Loading';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await galleryService.getGalleryPhotos();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus foto ini?')) {
      const res = await galleryService.deleteGalleryPhoto(id);
      if (res.success) {
        setItems(items.filter(item => item.id !== id));
      } else {
        alert('Gagal menghapus: ' + res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl font-bold text-white">🖼️ Album Galeri Foto Resmi</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Unggah tangkapan layar seru streaming atau poster visual resolusi tinggi untuk dipajang di album.</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => alert('Fitur tambah belum tersedia')}>Unggah Foto Baru</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        {isLoading ? (
          <div className="p-6"><Loading message="Memuat galeri..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-[var(--bg-primary)] text-gray-400">
                <tr>
                  <th className="px-6 py-3">Thumbnail</th>
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border-color)]">
                    <td className="px-6 py-4">
                      <img src={item.url} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 font-bold">Hapus</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Belum ada foto galeri.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
