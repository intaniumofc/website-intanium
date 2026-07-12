'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { HardDrive, Search, Trash2, Copy, ExternalLink, Image as ImageIcon, Folder, ChevronRight } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminMediaManager() {
  const notify = useAdminToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prefix, setPrefix] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, targetKeys: [] });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async (newPrefix) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newPrefix) params.set('prefix', newPrefix);
      params.set('maxKeys', '200');
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const sorted = (data.items || []).sort((a, b) => a.key < b.key ? -1 : 1);
        setItems(sorted);
      } else {
        notify.error('Gagal mengambil daftar media', data.error);
      }
    } catch (err) {
      notify.error('Gagal menghubungkan server', err.message);
    }
    setIsLoading(false);
    setSelectedKeys(new Set());
  };

  useEffect(() => {
    fetchMedia(prefix);
  }, [prefix]);

  const handleDeleteClick = (keys) => {
    setConfirmDelete({ isOpen: true, targetKeys: keys });
  };

  const confirmDeleteAction = async () => {
    setIsDeleting(true);
    setConfirmDelete({ isOpen: false, targetKeys: [] });
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        body: JSON.stringify({ keys: confirmDelete.targetKeys }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        const remaining = items.filter((item) => !data.deleted.includes(item.key));
        setItems(remaining);
        setSelectedKeys(new Set());
        notify.success('File dihapus', `${data.deletedCount} file berhasil dihapus dari R2.`);
      } else {
        notify.error('Gagal menghapus file', data.error);
      }
    } catch (err) {
      notify.error('Gagal menghapus file', err.message);
    }
    setIsDeleting(false);
  };

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedKeys.size === filteredItems.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(filteredItems.map((i) => i.key)));
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      notify.success('URL disalin', 'Tautan gambar disalin ke clipboard.');
    } catch {
      notify.error('Gagal menyalin', 'Clipboard tidak dapat diakses.');
    }
  };

  const goToFolder = (folderPrefix) => {
    setPrefix(folderPrefix);
  };

  const goUp = () => {
    const parts = prefix.replace(/\/$/, '').split('/');
    parts.pop();
    setPrefix(parts.join('/') + (parts.length ? '/' : ''));
  };

  const filteredItems = items.filter((item) =>
    item.key && item.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = new Map();
  const files = [];
  for (const item of filteredItems) {
    const key = item.key;
    const relativeKey = prefix ? key.substring(prefix.length) : key;
    const slashIdx = relativeKey.indexOf('/');
    if (slashIdx !== -1) {
      const folderName = relativeKey.substring(0, slashIdx);
      if (!folders.has(folderName)) {
        folders.set(folderName, { name: folderName, fullPrefix: prefix + folderName + '/' });
      }
    } else if (relativeKey) {
      files.push(item);
    }
  }

  const totalSize = filteredItems.reduce((sum, i) => sum + (i.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <HardDrive className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Media Manager
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Kelola file yang tersimpan di Cloudflare R2 — {items.length} objek, {formatBytes(totalSize)}
          </p>
        </div>
        {selectedKeys.size > 0 && (
          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(Array.from(selectedKeys))} isLoading={isDeleting} className="flex items-center gap-1.5">
            <Trash2 className="h-4 w-4" /> Hapus ({selectedKeys.size})
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[var(--border-color)] rounded-xl text-sm w-full md:w-80 shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Cari file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
          <Folder className="h-3.5 w-3.5" />
          {prefix ? (
            <>
              <button onClick={goUp} className="hover:text-[var(--color-primary)] font-bold">&larr;</button>
              <span className="text-[var(--text-primary)] font-bold truncate max-w-[200px]">{prefix}</span>
            </>
          ) : (
            <span className="font-bold">/ (root)</span>
          )}
        </div>
      </div>

      <Card hoverEffect={false} padding="none">
        {isLoading ? (
          <div className="p-12"><Loading message="Memuat daftar media..." /></div>
        ) : filteredItems.length === 0 && !folders.size ? (
          <div className="p-12 text-center text-[var(--text-muted)] text-sm">Folder ini kosong.</div>
        ) : (
          <div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-secondary)]">
                <thead className="text-xs uppercase bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] font-bold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-4 py-3 w-10"><input type="checkbox" onChange={selectAll} checked={selectedKeys.size === filteredItems.length && filteredItems.length > 0} className="cursor-pointer" /></th>
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Ukuran</th>
                    <th className="px-6 py-3">Terakhir Diubah</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {Array.from(folders.values()).map((folder) => (
                    <tr key={folder.fullPrefix} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => goToFolder(folder.fullPrefix)}>
                      <td className="px-4 py-3"></td>
                      <td className="px-6 py-3 font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Folder className="h-4 w-4 text-yellow-500" /> {folder.name}/ <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
                      </td>
                      <td className="px-6 py-3 text-xs">-</td>
                      <td className="px-6 py-3 text-xs">-</td>
                      <td className="px-6 py-3 text-right text-xs">Folder</td>
                    </tr>
                  ))}
                  {files.map((item) => (
                    <tr key={item.key}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedKeys.has(item.key)} onChange={() => toggleSelect(item.key)} className="cursor-pointer" />
                      </td>
                      <td className="px-6 py-3 text-xs font-mono text-[var(--text-primary)] truncate max-w-[280px]">{item.key}</td>
                      <td className="px-6 py-3 text-xs">{formatBytes(item.size || 0)}</td>
                      <td className="px-6 py-3 text-xs">{formatDate(item.lastModified)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors" title="Salin URL">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--text-secondary)] hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-colors" title="Buka">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteClick([item.key]); }} className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
              {Array.from(folders.values()).map((folder) => (
                <div key={folder.fullPrefix} className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50/50" onClick={() => goToFolder(folder.fullPrefix)}>
                  <Folder className="h-5 w-5 text-yellow-500" />
                  <div className="text-sm font-bold text-[var(--text-primary)]">{folder.name}/</div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] ml-auto" />
                </div>
              ))}
              {files.map((item) => (
                <div key={item.key} className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedKeys.has(item.key)} onChange={() => toggleSelect(item.key)} />
                    <span className="text-xs font-mono text-[var(--text-primary)] truncate">{item.key}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{formatBytes(item.size || 0)} &middot; {formatDate(item.lastModified)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => copyUrl(item.url)} className="px-2 py-1 text-blue-600 bg-blue-50 border border-blue-100 rounded text-xs">Copy URL</button>
                      <button onClick={() => handleDeleteClick([item.key])} className="px-2 py-1 text-red-500 bg-red-50 border border-red-100 rounded text-xs">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, targetKeys: [] })}
        onConfirm={confirmDeleteAction}
        type="danger"
        title="Hapus File dari R2?"
        message={`${confirmDelete.targetKeys.length} file akan dihapus permanen dari Cloudflare R2. Tindakan ini tidak dapat dikembalikan.`}
        confirmLabel="Hapus Permanen"
      />
    </div>
  );
}