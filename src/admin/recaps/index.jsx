import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { recapService } from '../../features/recaps/recapService';
import Loading from '../../components/common/Loading';

export default function AdminRecaps() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await recapService.getRecaps();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus recap ini?')) {
      const res = await recapService.deleteRecap(id);
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
          <h1 className="text-xl font-bold text-white">📖 Arsip Recap & Zine Digital</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Unggah majalah Zine baru atau log komik recap mingguan dalam format JPG/PNG.</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => alert('Fitur tambah belum tersedia')}>Unggah Edisi Zine</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        {isLoading ? (
          <div className="p-6"><Loading message="Memuat recaps..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-[var(--bg-primary)] text-gray-400">
                <tr>
                  <th className="px-6 py-3">Thumbnail</th>
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Tanggal Terbit</th>
                  <th className="px-6 py-3">Total Halaman</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border-color)]">
                    <td className="px-6 py-4">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-20 object-cover rounded-md" />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">{item.publishDate}</td>
                    <td className="px-6 py-4">{item.pages?.length || 0} Halaman</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 font-bold">Hapus</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada recap/zine.</td>
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
