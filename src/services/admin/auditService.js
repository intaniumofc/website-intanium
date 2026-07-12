export const auditService = {
  getLogs: async (limit = 10) => {
    const res = await fetch(`/api/admin/audit-logs?limit=${limit}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal mengambil log aktivitas');
    return data.logs;
  },

  deleteLog: async (logId) => {
    const res = await fetch(`/api/admin/audit-logs?id=${logId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal menghapus log aktivitas');
    return { success: true };
  },

  clearAllLogs: async () => {
    const res = await fetch('/api/admin/audit-logs?all=true', {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Gagal membersihkan log aktivitas');
    return { success: true };
  },
};
