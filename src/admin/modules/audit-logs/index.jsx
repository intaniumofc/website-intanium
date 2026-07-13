'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { auditService } from '../../../services/admin/auditService';
import { createClient } from '../../../utils/supabase/client';
import { Shield, Search, Trash2, Calendar, User, Info, RefreshCw } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminAuditLogs() {
  const notify = useAdminToast();
  const supabase = createClient();

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth details
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchLogs = async (currentLimit) => {
    setIsLoading(true);
    try {
      const data = await auditService.getLogs(currentLimit);
      setLogs(data || []);
    } catch (err) {
      notify.error('Gagal memuat log', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get user session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserEmail(session.user.email || '');
      }
    };
    getSession();
    fetchLogs(limit);
  }, [limit]);

  const handleRefresh = () => {
    fetchLogs(limit);
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 25);
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDeleteLog = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setIsActionLoading(true);
    try {
      await auditService.deleteLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
      notify.success('Log Dihapus', 'Entri log aktivitas admin berhasil dihapus.');
    } catch (err) {
      notify.error('Gagal menghapus log', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const executeClearAllLogs = async () => {
    setConfirmClear(false);
    setIsActionLoading(true);
    try {
      await auditService.clearAllLogs();
      setLogs([]);
      notify.success('Log Dibersihkan', 'Seluruh log aktivitas admin berhasil dikosongkan.');
      await fetchLogs(limit);
    } catch (err) {
      notify.error('Gagal mengosongkan log', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const isITSupport = currentUserEmail.toLowerCase() === 'it_support@iris.admin';

  // Filter logs based on search input
  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (log.admin_username || '').toLowerCase().includes(query) ||
      (log.action || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Shield className="h-5.5 w-5.5 text-[#170C79] shrink-0" /> Log Aktivitas Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Catatan audit universal untuk melacak tindakan administratif dan modifikasi data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleRefresh} className="flex items-center gap-1.5 font-bold">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {isITSupport && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmClear(true)}
              isLoading={isActionLoading}
              className="flex items-center gap-1.5 font-bold"
            >
              <Trash2 className="h-4 w-4" /> Kosongkan Log
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Info Alert */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari admin atau aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-slate-700 placeholder-slate-450"
          />
        </div>
        {!isITSupport && (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-bold">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            Hanya IT Support yang memiliki wewenang untuk menghapus log.
          </div>
        )}
      </div>

      {/* Log Table Card */}
      <Card hoverEffect={false} padding="none">
        {isLoading && logs.length === 0 ? (
          <div className="p-12"><Loading message="Memuat catatan aktivitas..." /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">Tidak ada log aktivitas ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 w-48">Waktu</th>
                  <th className="px-6 py-3.5 w-64">Nama Admin</th>
                  <th className="px-6 py-3.5">Deskripsi Aktivitas</th>
                  {isITSupport && <th className="px-6 py-3.5 w-24 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-700">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        <User className="h-3 w-3 text-slate-400" />
                        {log.admin_username || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 leading-relaxed">
                      {log.action || '-'}
                    </td>
                    {isITSupport && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => handleDeleteClick(log.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus log ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Load More Button */}
      {!isLoading && logs.length >= limit && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" size="sm" onClick={handleLoadMore} className="font-bold">
            Muat Lebih Banyak
          </Button>
        </div>
      )}

      {/* ================= CONFIRM DIALOGS ================= */}
      <ConfirmDialog
        isOpen={confirmClear}
        title="Bersihkan Semua Log Aktivitas?"
        message="Apakah Anda yakin ingin menghapus seluruh log aktivitas admin secara permanen? Tindakan audit ini tidak dapat dibatalkan."
        confirmText="Ya, Bersihkan"
        cancelText="Batal"
        type="danger"
        onConfirm={executeClearAllLogs}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Hapus Entri Log Aktivitas?"
        message="Apakah Anda yakin ingin menghapus catatan aktivitas terpilih?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        onConfirm={executeDeleteLog}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
