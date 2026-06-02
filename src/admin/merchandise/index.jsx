import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { merchandiseService } from '../../features/merchandise/merchandiseService';
import Loading from '../../components/common/Loading';

export default function AdminMerchandise() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await merchandiseService.getProducts();
    setItems(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus merchandise ini?')) {
      const res = await merchandiseService.deleteProduct(id);
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
          <h1 className="text-xl font-bold text-white">🛍️ Manajemen Toko Merchandise</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Daftar produk merchandise official Intan. Tambah, edit stok, atau perbarui harga produk.</p>
        </div>
        <Button variant="glow" size="sm" onClick={() => alert('Fitur tambah belum tersedia')}>Tambah Produk Baru</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        {isLoading ? (
          <div className="p-6"><Loading message="Memuat merchandise..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-[var(--bg-primary)] text-gray-400">
                <tr>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Harga</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--border-color)]">
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">Rp {item.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400 font-bold">Hapus</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada data.</td>
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
