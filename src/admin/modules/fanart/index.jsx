'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { CheckCircle, XCircle, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { fanartService } from '../../../services/public/fanartService';
import { proxyR2Url } from '../../../lib/helpers';

export default function AdminFanart() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fanartService.getFanarts('all');
      setItems(data);
    } catch (error) {
      notify.error('Gagal memuat', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fanartService.updateFanartStatus(id, status);
      if (res.success) {
        notify.success('Status Diperbarui', `Karya fanart berhasil diubah menjadi ${status}.`);
        fetchData();
      } else {
        notify.error('Gagal', res.error);
      }
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.id;
    setConfirmDelete({ isOpen: false, id: null });
    try {
      const res = await fanartService.deleteFanart(id);
      if (res.success) {
        notify.success('Dihapus', 'Karya fanart berhasil dihapus dari sistem.');
        fetchData();
      } else {
        notify.error('Gagal menghapus', res.error);
      }
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Palette className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Moderasi Fan-art
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Tinjau karya seni yang disubmit oleh fans. Setujui untuk menampilkannya di halaman publik.
          </p>
        </div>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white overflow-hidden rounded-2xl shadow-sm" padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat daftar fan-art..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 font-bold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4">Karya</th>
                  <th className="px-6 py-4">Kredit & Judul</th>
                  <th className="px-6 py-4">Tanggal / Waktu</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {item.url ? (
                          <img src={proxyR2Url(item.url)} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)] mb-1">{item.title}</div>
                      <div className="text-xs font-semibold text-[var(--color-primary)]">Oleh: {item.author}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        'bg-red-100 text-red-700 border-red-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'approved' && (
                          <button onClick={() => handleUpdateStatus(item.id, 'approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-colors" title="Setujui (Approve)">
                            <CheckCircle className="h-4.5 w-4.5" />
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors" title="Tolak (Reject)">
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        )}
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors" title="Hapus Permanen">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-muted)] text-sm">
                      Tidak ada karya fan-art yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={confirmDeleteAction}
        title="Hapus Fan-art"
        message="Apakah Anda yakin ingin menghapus karya fan-art ini secara permanen?"
        confirmText="Hapus"
      />
    </div>
  );
}
