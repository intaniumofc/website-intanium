import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { newsService } from '../../features/news/newsService';
import Loading from '../../components/common/Loading';

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await newsService.getNews();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus berita ini?')) {
      const res = await newsService.deleteNews(id);
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
          <h1 className="text-xl font-bold text-white">📰 Publikasi Berita & Pengumuman</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Buat artikel pengumuman resmi terbaru, event komunitas, atau berita penting lainnya.</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => alert('Fitur tambah belum tersedia')}>Tulis Artikel Baru</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        {isLoading ? (
          <div className="p-6"><Loading message="Memuat berita..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-[var(--bg-primary)] text-gray-400">
                <tr>
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border-color)]">
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.date}</td>
                    <td className="px-6 py-4">
                      {item.id.includes('theater') ? (
                        <span className="text-gray-500 text-xs italic">Otomatis API</span>
                      ) : (
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 font-bold">Hapus</button>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada berita.</td>
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
