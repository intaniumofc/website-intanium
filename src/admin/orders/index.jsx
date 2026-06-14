import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { merchandiseService } from '../../features/merchandise/merchandiseService';
import { formatCurrency } from '../../lib/helpers';
import { 
  Search, Trash2, Eye, FileText, X, ChevronLeft, ChevronRight, 
  Download, RefreshCw, Check, Clock, AlertTriangle, AlertCircle,
  MoreVertical, ClipboardCheck, ArrowLeft, ExternalLink, Package, Truck, Info
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/status-badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';

const orderStatusOptions = [
  'pending_review',
  'waiting_payment',
  'paid',
  'processing',
  'ready_for_pickup',
  'shipped',
  'completed',
  'cancelled',
];

const bulkStatusOptions = [
  'waiting_payment',
  'paid',
  'processing',
  'ready_for_pickup',
  'shipped',
  'completed',
];

const ORDER_PAGE_SIZE = 12;
const HIGH_TOTAL_THRESHOLD = 1000000;

const STATUS_STYLES = {
  pending_review: {
    dot: 'bg-purple-500',
    pill: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/20 dark:text-purple-300',
    label: 'Pending Review',
  },
  waiting_payment: {
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300',
    label: 'Waiting Payment',
  },
  paid: {
    dot: 'bg-blue-500',
    pill: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300',
    label: 'Paid',
  },
  processing: {
    dot: 'bg-indigo-500',
    pill: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/40 dark:bg-indigo-950/20 dark:text-indigo-300',
    label: 'Processing',
  },
  ready_for_pickup: {
    dot: 'bg-teal-500',
    pill: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/40 dark:bg-teal-950/20 dark:text-teal-300',
    label: 'Ready For Pickup',
  },
  shipped: {
    dot: 'bg-pink-500',
    pill: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800/40 dark:bg-pink-950/20 dark:text-pink-300',
    label: 'Shipped',
  },
  completed: {
    dot: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300',
    label: 'Completed',
  },
  cancelled: {
    dot: 'bg-rose-500',
    pill: 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800/40 dark:bg-rose-950/20 dark:text-rose-400',
    label: 'Cancelled',
  },
  // Keep pending for fallback compatibility
  pending: {
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300',
    label: 'Pending',
  },
};

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateInput(date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

function isPendingOver24Hours(order) {
  if (order.status !== 'pending' && order.status !== 'pending_review' && order.status !== 'waiting_payment') return false;
  const createdMs = new Date(order.created_at).getTime();
  return Date.now() - createdMs > 24 * 60 * 60 * 1000;
}

function formatAuditActor(name, email) {
  return name?.trim() || email?.trim() || 'Admin';
}

export default function AdminOrdersPage() {
  const notify = useAdminToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Filtering states
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minimumTotal, setMinimumTotal] = useState('');

  // Bulk operation states
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('paid');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [statusAuditNote, setStatusAuditNote] = useState('');

  // Progress/Interaction indicator lists
  const [rowSavingIds, setRowSavingIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Detail drawer states
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [fulfillmentSaving, setFulfillmentSaving] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [markShipped, setMarkShipped] = useState(true);
  const [correctedShippingCost, setCorrectedShippingCost] = useState('');
  const [shippingCostSaving, setShippingCostSaving] = useState(false);

  // Unified confirm dialog state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Ya, Lanjutkan',
    actionType: null, // 'singleStatus' | 'bulkStatus' | 'deleteOrder'
    payload: null,
  });

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await merchandiseService.getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar order admin');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, dateFrom, dateTo, minimumTotal]);

  const periodOrders = useMemo(() => {
    return orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      if (dateFrom) {
        const fromDate = new Date(`${dateFrom}T00:00:00`);
        if (createdAt < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(`${dateTo}T23:59:59`);
        if (createdAt > toDate) return false;
      }
      return true;
    });
  }, [dateFrom, dateTo, orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minTotalNumber = minimumTotal.trim() === '' ? null : Number(minimumTotal);

    return periodOrders.filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        [order.order_number, order.shipping_name, order.shipping_phone]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesMinTotal = minTotalNumber === null || Number(order.total_amount) >= minTotalNumber;
      return matchesQuery && matchesStatus && matchesMinTotal;
    });
  }, [minimumTotal, periodOrders, query, statusFilter]);

  const sortedFilteredOrders = useMemo(
    () =>
      [...filteredOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [filteredOrders],
  );

  const totalPages = Math.max(1, Math.ceil(sortedFilteredOrders.length / ORDER_PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (visiblePage - 1) * ORDER_PAGE_SIZE;
    return sortedFilteredOrders.slice(start, start + ORDER_PAGE_SIZE);
  }, [sortedFilteredOrders, visiblePage]);

  const summary = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const totalToday = orders.filter((order) => {
      const created = new Date(order.created_at);
      return created >= todayStart && created <= todayEnd;
    }).length;

    const pending = orders.filter((order) => order.status === 'pending').length;
    const paid = orders.filter((order) => order.status === 'paid').length;
    const revenueInPeriod = periodOrders.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0,
    );
    return { totalToday, pending, paid, revenueInPeriod };
  }, [orders, periodOrders]);

  const allVisibleSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((order) => selectedOrderIds.includes(order.id));

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedOrderIds((current) =>
        current.filter((id) => !paginatedOrders.some((order) => order.id === id)),
      );
      return;
    }
    setSelectedOrderIds((current) => {
      const set = new Set(current);
      paginatedOrders.forEach((order) => set.add(order.id));
      return [...set];
    });
  }

  function toggleSelectOne(orderId) {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  }

  function handleSingleStatusUpdate(order, nextStatus) {
    if (nextStatus === order.status) return;
    const isFinalStatus = nextStatus === 'completed' || nextStatus === 'cancelled';
    if (isFinalStatus) {
      setConfirmState({
        isOpen: true,
        title: 'Ubah Status Order?',
        message: `Status order ${order.order_number} akan diubah ke "${nextStatus}". Ini adalah status final dan tidak bisa dikembalikan.`,
        type: 'warning',
        confirmText: 'Ya, Ubah Status',
        actionType: 'singleStatus',
        payload: { order, nextStatus },
      });
      return;
    }
    executeSingleStatusUpdate(order, nextStatus);
  }

  async function executeSingleStatusUpdate(order, nextStatus) {
    setRowSavingIds((current) => [...current, order.id]);
    setFeedback('');
    setError('');
    try {
      const updated = await merchandiseService.updateAdminOrderStatus(order.id, nextStatus, statusAuditNote);
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setFeedback(`Status order ${updated.order_number} berhasil diperbarui.`);
      notify.success('Status order diperbarui', `Order ${updated.order_number} sekarang berstatus ${nextStatus}.`);
      if (detailData?.order.id === updated.id) void handleOpenDetail(updated.id);
      setStatusAuditNote('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui status order';
      setError(message);
      notify.error('Gagal memperbarui status order', message);
    } finally {
      setRowSavingIds((current) => current.filter((id) => id !== order.id));
    }
  }

  function handleBulkStatusUpdate() {
    if (selectedOrderIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Update Status Massal?',
      message: `${selectedOrderIds.length} order yang dipilih akan diubah ke status "${bulkStatus}". Pastikan perubahan ini sudah sesuai.`,
      type: 'warning',
      confirmText: 'Ya, Terapkan',
      actionType: 'bulkStatus',
      payload: { orderIds: [...selectedOrderIds], status: bulkStatus },
    });
  }

  async function executeBulkStatusUpdate(orderIds, status) {
    setBulkSaving(true);
    setFeedback('');
    setError('');
    setRowSavingIds((current) => [...new Set([...current, ...orderIds])]);
    try {
      const results = await Promise.all(
        orderIds.map(async (orderId) =>
          merchandiseService.updateAdminOrderStatus(orderId, status, statusAuditNote),
        ),
      );
      setOrders((current) =>
        current.map((order) => {
          const updated = results.find((item) => item.id === order.id);
          return updated ?? order;
        }),
      );
      setFeedback(`${results.length} order berhasil diperbarui ke status "${status}".`);
      notify.success('Status massal diperbarui', `${results.length} order berhasil diperbarui ke status ${status}.`);
      setSelectedOrderIds([]);
      if (detailData?.order.id && orderIds.includes(detailData.order.id)) {
        void handleOpenDetail(detailData.order.id);
      }
      setStatusAuditNote('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal bulk update status order';
      setError(message);
      notify.error('Gagal update status massal', message);
    } finally {
      setBulkSaving(false);
      setRowSavingIds((current) =>
        current.filter((id) => !orderIds.includes(id)),
      );
    }
  }

  async function handleOpenDetail(orderId) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError('');
    setDetailData(null);
    try {
      const detail = await merchandiseService.getAdminOrderDetail(orderId);
      if (!detail) {
        setDetailError('Detail order tidak ditemukan.');
        return;
      }
      setDetailData(detail);
      setTrackingNumber(detail.order.tracking_number ?? '');
      setTrackingUrl(detail.order.tracking_url ?? '');
      setMarkShipped(detail.order.status === 'paid');
      setCorrectedShippingCost(detail.order.shipping_cost?.toString() ?? '0');
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Gagal memuat detail order');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdateShippingCost() {
    if (!detailData) return;
    const cost = Number(correctedShippingCost);
    if (isNaN(cost) || cost < 0) {
      notify.error('Kesalahan Input', 'Ongkos kirim harus berupa angka positif.');
      return;
    }
    
    setShippingCostSaving(true);
    try {
      const updated = await merchandiseService.updateAdminOrderShippingCost(detailData.order.id, cost);
      
      // Update local orders list state
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      );
      
      notify.success('Ongkir diperbarui', `Ongkos kirim order ${updated.order_number} berhasil diperbarui.`);
      // Reload drawer details
      await handleOpenDetail(updated.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui ongkos kirim.';
      notify.error('Gagal memperbarui ongkir', message);
    } finally {
      setShippingCostSaving(false);
    }
  }

  async function handleSaveFulfillment() {
    if (!detailData) return;
    setFulfillmentSaving(true);
    setError('');
    setFeedback('');
    try {
      const updated = await merchandiseService.updateAdminOrderFulfillment(detailData.order.id, {
        trackingNumber: trackingNumber.trim() || null,
        trackingUrl: trackingUrl.trim() || null,
        markShipped,
        note: statusAuditNote,
      });
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order)),
      );
      setFeedback(`Resi order ${updated.order_number} berhasil disimpan.`);
      notify.success('Resi disimpan', `Info pengiriman order ${updated.order_number} berhasil disimpan.`);
      await handleOpenDetail(updated.id);
      setStatusAuditNote('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data pengiriman.';
      setError(message);
      notify.error('Gagal menyimpan resi', message);
    } finally {
      setFulfillmentSaving(false);
    }
  }

  function handleDeleteOrder(order) {
    setConfirmState({
      isOpen: true,
      title: 'Hapus Order?',
      message: `Order ${order.order_number} akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      actionType: 'deleteOrder',
      payload: { order },
    });
  }

  async function executeDeleteOrder(order) {
    setDeletingIds((current) => [...current, order.id]);
    setError('');
    setFeedback('');
    try {
      await merchandiseService.deleteAdminOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSelectedOrderIds((current) => current.filter((id) => id !== order.id));
      if (detailData?.order.id === order.id) {
        setDetailOpen(false);
        setDetailData(null);
      }
      setFeedback(`Order ${order.order_number} berhasil dihapus.`);
      notify.success('Order dihapus', `Order ${order.order_number} berhasil dihapus.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus order.';
      setError(message);
      notify.error('Gagal menghapus order', message);
    } finally {
      setDeletingIds((current) => current.filter((id) => id !== order.id));
    }
  }

  function executeConfirmAction() {
    const { actionType, payload } = confirmState;
    closeConfirm();
    switch (actionType) {
      case 'singleStatus':
        executeSingleStatusUpdate(payload.order, payload.nextStatus);
        break;
      case 'bulkStatus':
        executeBulkStatusUpdate(payload.orderIds, payload.status);
        break;
      case 'deleteOrder':
        executeDeleteOrder(payload.order);
        break;
      default:
        break;
    }
  }

  function exportFilteredOrdersToPdf() {
    const rows = sortedFilteredOrders
      .map(
        (order) => `
          <tr>
            <td>${order.order_number}</td>
            <td>${order.shipping_name ?? '-'}</td>
            <td>${formatDateTime(order.created_at)}</td>
            <td>${formatCurrency(Number(order.total_amount))}</td>
            <td>${order.status}</td>
          </tr>
        `,
      )
      .join('');

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin: 0 0 8px; color: #170c79; }
          p { margin: 0 0 16px; color: #555; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f0f4ff; color: #1e3a8a; }
        </style>
      </head>
      <body>
        <h1>Intanium Store · Laporan Merchandise Order</h1>
        <p>Di-generate pada: ${formatDateTime(new Date().toISOString())}</p>
        <p>Filter - status: ${statusFilter}, tanggal: ${dateFrom || '-'} s.d ${dateTo || '-'}, min nominal: ${minimumTotal || '-'}</p>
        <table>
          <thead>
            <tr>
              <th>Nomor Invoice</th>
              <th>Nama Penerima</th>
              <th>Tanggal Transaksi</th>
              <th>Total Nominal</th>
              <th>Status Transaksi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=1200,height=800');
    if (!w) {
      setError('Popup diblokir browser. Izinkan popup untuk export PDF.');
      notify.warning('Popup diblokir', 'Izinkan popup untuk export PDF.');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function exportFilteredOrdersToCsv() {
    const headers = [
      'order_number',
      'customer',
      'phone',
      'created_at',
      'status',
      'subtotal',
      'discount_code',
      'discount_amount',
      'shipping_cost',
      'total_amount',
      'courier',
      'service',
      'tracking_number',
    ];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = sortedFilteredOrders.map((order) => [
      order.order_number,
      order.shipping_name,
      order.shipping_phone,
      order.created_at,
      order.status,
      order.subtotal_amount,
      null, // discount code
      0, // discount amount
      order.shipping_cost,
      order.total_amount,
      order.shipping_courier,
      order.shipping_service,
      order.tracking_number,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intanium-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setMinimumTotal('');
  }

  return (
    <div className="space-y-6 select-none">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-color)]/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Package className="h-5.5 w-5.5 text-[var(--color-primary)] shrink-0" /> Kelola Order Merchandise
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportFilteredOrdersToPdf}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-slate-400 transition cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-blue-500" />
            Cetak PDF
          </button>
          <button
            type="button"
            onClick={exportFilteredOrdersToCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-slate-400 transition cursor-pointer shadow-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Inline stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Order Masuk Hari Ini</span>
          <span className="text-xl font-black text-slate-800 mt-1 block tabular-nums">{summary.totalToday}</span>
        </div>
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-amber-500 block uppercase">Menunggu Pembayaran</span>
          <span className={`text-xl font-black mt-1 block tabular-nums ${summary.pending > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`}>
            {summary.pending}
          </span>
        </div>
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-[var(--color-primary)] block uppercase">Pembayaran Terverifikasi</span>
          <span className="text-xl font-black text-[var(--color-primary)] mt-1 block tabular-nums">{summary.paid}</span>
        </div>
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold text-emerald-500 block uppercase">Revenue dalam Periode</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block tabular-nums">
            {formatCurrency(summary.revenueInPeriod)}
          </span>
        </div>
      </div>

      {/* ── Filter toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-[var(--border-color)]/60 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off" /* autocomplete="off" */ name="query" type="text" placeholder="Cari invoice# / nama / phone…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/10 font-semibold" />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="all">Semua Status</option>
          {orderStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input autoComplete="off" /* autocomplete="off" */ name="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} max={dateTo || undefined} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)]" />
        <span className="text-xs text-slate-400 font-bold">–</span>
        {/* Date To */}
        <input autoComplete="off" /* autocomplete="off" */ name="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom || undefined} max={toDateInput(new Date())} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[var(--color-primary)]" />

        {/* Minimum Total */}
        <input autoComplete="off" /* autocomplete="off" */ name="minimumTotal" type="number" min="0" placeholder="Min nominal…" value={minimumTotal} onChange={(e) => setMinimumTotal(e.target.value)} className="w-32 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)]" />

        {/* Reset Filter Button */}
        {(query || statusFilter !== 'all' || dateFrom || dateTo || minimumTotal) ? (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer border border-slate-200"
          >
            Reset
          </button>
        ) : null}

        <div className="ml-auto text-[10px] font-bold text-slate-400">
          <span className="font-extrabold text-slate-700">{sortedFilteredOrders.length}</span>{' '}
          / {orders.length} order
        </div>
      </div>

      {/* ── Bulk actions bar (sticky, only when selection is active) ── */}
      {selectedOrderIds.length > 0 ? (
        <div className="sticky top-20 z-30 border border-blue-200 bg-blue-50/95 px-4 py-2.5 backdrop-blur rounded-2xl shadow-sm animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-blue-700">
              <span className="font-black text-blue-800">{selectedOrderIds.length}</span> order dipilih
            </span>
            <input autoComplete="off" /* autocomplete="off" */ name="statusAuditNote" type="text" value={statusAuditNote} onChange={(e) => setStatusAuditNote(e.target.value)} placeholder="Catatan perubahan status (opsional)…" className="min-w-[200px] flex-1 max-w-md rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none" />
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {bulkStatusOptions.map((status) => (
                <option key={status} value={status}>
                  Ubah status: {status.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleBulkStatusUpdate()}
              disabled={bulkSaving}
              className="rounded-xl bg-[var(--color-primary)] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-900 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {bulkSaving ? 'Memproses…' : 'Terapkan'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-white cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Feedback Banner ── */}
      {feedback ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4 shrink-0 bg-emerald-100 rounded-full p-0.5 border border-emerald-200" />
          {feedback}
        </div>
      ) : null}

      {/* ── Data Table ── */}
      {loading ? (
        <AdminListSkeleton rows={8} />
      ) : error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 space-y-3">
          <p className="font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            {error}
          </p>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-xs"
          >
            Coba Lagi
          </button>
        </div>
      ) : sortedFilteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 mt-3">
            Tidak Ada Data
          </p>
          <h2 className="mt-1 text-sm font-bold text-slate-600">
            Tidak ada transaksi order yang sesuai dengan filter pencarian.
          </h2>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-color)]/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="text-[10px] uppercase bg-[var(--bg-primary)]/60 text-slate-500 font-bold border-b border-[var(--border-color)]/60 select-none">
                <tr>
                  <th className="w-[50px] px-6 py-4">
                    <input name="file_input" type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-pointer" />
                  </th>
                  <th className="px-4 py-4">Invoice & Update</th>
                  <th className="px-4 py-4">Penerima</th>
                  <th className="px-4 py-4">Tanggal Order</th>
                  <th className="px-4 py-4 text-right">Total Tagihan</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="w-[80px] px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedOrders.map((order) => {
                  const isSaving = rowSavingIds.includes(order.id);
                  const isDeleting = deletingIds.includes(order.id);
                  const isLatePending = isPendingOver24Hours(order);
                  const isHighTotal = Number(order.total_amount) >= HIGH_TOTAL_THRESHOLD;
                  const status = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-slate-50/50 ${
                        isLatePending
                          ? 'bg-amber-50/20'
                          : isHighTotal
                          ? 'bg-blue-50/10'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input name="file_input" type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleSelectOne(order.id)} className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-pointer" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-mono text-xs font-bold text-slate-800">
                          {order.order_number}
                        </p>
                        <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                          Upd: {formatDateTime(order.updated_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-800">{order.shipping_name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{order.shipping_phone}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-semibold">
                        <p>{formatDateTime(order.created_at)}</p>
                        {isLatePending ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-600 mt-0.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {'>'} 24 jam pending
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <p className="font-black text-slate-800 tabular-nums">
                          {formatCurrency(Number(order.total_amount))}
                        </p>
                        {isHighTotal ? (
                          <p className="text-[9px] font-extrabold text-[var(--color-primary)] mt-0.5">High Value</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[130px]">
                          <StatusBadge status={order.status} />
                          <select
                            value={order.status}
                            onChange={(e) =>
                              void handleSingleStatusUpdate(order, e.target.value)
                            }
                            disabled={isSaving}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50 cursor-pointer"
                          >
                            {orderStatusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <OrderRowMenu
                          onDetail={() => void handleOpenDetail(order.id)}
                          onDelete={() => void handleDeleteOrder(order)}
                          isSaving={isSaving}
                          isDeleting={isDeleting}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination controls ── */}
      {!loading && totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold select-none">
          <p>
            Menampilkan{' '}
            <span className="font-bold text-slate-700">
              {(visiblePage - 1) * ORDER_PAGE_SIZE + 1}–
              {Math.min(visiblePage * ORDER_PAGE_SIZE, sortedFilteredOrders.length)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-slate-700">{sortedFilteredOrders.length}</span> order
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white p-1.5 transition hover:border-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={visiblePage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">
              {visiblePage} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white p-1.5 transition hover:border-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={visiblePage >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Detail Drawer ── */}
      {detailOpen ? (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/40 backdrop-blur-xs select-text">
          <button
            type="button"
            className="h-full flex-1 cursor-default bg-transparent border-none focus:outline-none focus:ring-0 outline-none"
            aria-label="Tutup Detail"
            onClick={() => setDetailOpen(false)}
          />
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-2xl border-l border-slate-200 animate-slide-in flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#170c79] px-6 py-5 text-white">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                  Rincian Transaksi
                </p>
                <h3 className="mt-0.5 font-mono text-base font-black">
                  {detailData?.order.order_number ?? 'Memuat…'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="rounded-lg p-1.5 text-indigo-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {detailLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-slate-200 rounded-2xl animate-pulse" />
                  <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  {detailError}
                </div>
              ) : detailData ? (
                <>
                  {/* Status Banner */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Status Saat Ini</span>
                      <div className="mt-1.5">
                        <StatusBadge status={detailData.order.status} />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Tanggal Invoice</span>
                      <span className="text-xs font-bold text-slate-800 mt-1 block">
                        {formatDateTime(detailData.order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Shipping Details */}
                  <DetailSection title="Data Penerima & Pengiriman">
                    <dl className="grid gap-4 text-xs sm:grid-cols-2">
                      <DetailItem label="Nama Lengkap" value={detailData.order.shipping_name} />
                      <DetailItem label="Nomor WhatsApp" value={detailData.order.shipping_phone} />
                      <DetailItem label="ID Line" value={detailData.order.line_id || '-'} />
                      <DetailItem label="ID Anggota Intanium" value={detailData.order.intanium_member_id || '-'} />
                      <DetailItem
                        label="Metode Pengiriman"
                        value={detailData.order.delivery_method === 'pickup_fx' ? 'Bertemu di FX Sudirman (Pickup)' : 'Ekspedisi J&T Express (EZ)'}
                      />
                      
                      {detailData.order.delivery_method === 'expedition_jnt' ? (
                        <>
                          <DetailItem label="Provinsi" value={detailData.order.province || '-'} />
                          <DetailItem label="Kota / Kabupaten" value={detailData.order.shipping_city || '-'} />
                          <DetailItem label="Kode Pos" value={detailData.order.shipping_postal_code || '-'} />
                          <DetailItem
                            label="Alamat Lengkap Pengiriman"
                            value={detailData.order.shipping_address}
                            className="sm:col-span-2"
                          />
                        </>
                      ) : (
                        <div className="sm:col-span-2 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed">
                          <strong>Pengambilan di FX Sudirman:</strong> Alamat pengiriman tidak diperlukan. Admin/fanbase akan menghubungi pembeli menggunakan ID Line (<strong>{detailData.order.line_id || '-'}</strong>) untuk berkoordinasi.
                        </div>
                      )}
                      
                      <DetailItem
                        label="Ongkos Kirim"
                        value={formatCurrency(Number(detailData.order.shipping_cost))}
                      />
                    </dl>
                  </DetailSection>

                  {/* Koreksi Ongkos Kirim Form (Only show for pending_review and waiting_payment) */}
                  {(detailData.order.status === 'pending_review' || detailData.order.status === 'waiting_payment') && (
                    <DetailSection title="Koreksi Ongkos Kirim (Admin)">
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Gunakan fitur ini untuk menyesuaikan nominal ongkos kirim J&T jika pembeli salah menginput tarif. Total nominal tagihan akan dihitung ulang otomatis.
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                            <input autoComplete="off" /* autocomplete="off" */ name="correctedShippingCost" type="number" value={correctedShippingCost} onChange={(e) => setCorrectedShippingCost(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-semibold focus:border-[var(--color-primary)] focus:outline-none" placeholder="Contoh: 15000" />
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleUpdateShippingCost()}
                            disabled={shippingCostSaving}
                            className="rounded-xl bg-[var(--color-primary)] hover:bg-indigo-900 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            {shippingCostSaving ? 'Memproses…' : 'Perbarui Ongkir'}
                          </button>
                        </div>
                      </div>
                    </DetailSection>
                  )}

                  {/* Fulfillment Resi Setup */}
                  <DetailSection title="Fulfillment & Input Resi">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Nomor Resi Pengiriman
                          </span>
                          <input autoComplete="off" /* autocomplete="off" */ name="trackingNumber" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[var(--color-primary)] focus:outline-none" placeholder="Contoh: JNT123456789" />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Tautan Lacak Paket
                          </span>
                          <input autoComplete="off" /* autocomplete="off" */ name="trackingUrl" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[var(--color-primary)] focus:outline-none" placeholder="https://cekresi.com/..." />
                        </label>
                      </div>

                      {detailData.order.status === 'paid' && (
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer">
                          <input name="file_input" type="checkbox" checked={markShipped} onChange={(event) => setMarkShipped(event.target.checked)} className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]/10" />
                          Tandai sebagai dikirim (Shipped) otomatis setelah resi disimpan
                        </label>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Truck className="h-4.5 w-4.5 text-slate-300 shrink-0" />
                          {detailData.order.shipped_at
                            ? `Dikirim pada: ${formatDateTime(detailData.order.shipped_at)}`
                            : 'Belum terkirim'}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleSaveFulfillment()}
                          disabled={fulfillmentSaving}
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {fulfillmentSaving ? 'Menyimpan…' : 'Simpan Info Resi'}
                        </button>
                      </div>
                    </div>
                  </DetailSection>

                  {/* Items list */}
                  <DetailSection title={`Daftar Belanja (${detailData.items.length})`}>
                    {detailData.items.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Tidak ada item dalam order ini.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {detailData.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-xs">{item.product_name}</p>
                              <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                                {item.selected_size ? `Size: ${item.selected_size} · ` : ''}
                                Jumlah: {item.quantity} pcs
                              </p>
                            </div>
                            <p className="text-xs font-black tabular-nums text-slate-800">
                              {formatCurrency(Number(item.subtotal))}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </DetailSection>

                  {/* Payment Summary breakdown */}
                  <DetailSection title="Ringkasan Total Pembayaran">
                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                      <DetailItem
                        label="Subtotal Produk"
                        value={formatCurrency(Number(detailData.order.subtotal_amount))}
                      />
                      <DetailItem
                        label="Ongkos Kirim"
                        value={formatCurrency(Number(detailData.order.shipping_cost))}
                      />
                      <DetailItem
                        label="Diskon Kupon"
                        value={
                          Number(detailData.order.discount_amount) > 0
                            ? `-${formatCurrency(Number(detailData.order.discount_amount))} (${detailData.order.discount_code})`
                            : '-'
                        }
                      />
                      <DetailItem
                        label="Total Nominal Transaksi"
                        value={formatCurrency(Number(detailData.order.total_amount))}
                        emphasize
                      />
                      <DetailItem
                        label="Catatan Pembeli"
                        value={detailData.order.notes || '-'}
                        className="sm:col-span-2 italic text-slate-600 font-semibold"
                      />
                    </dl>
                  </DetailSection>

                  {/* Timeline & Audit changes logs */}
                  <DetailSection title={`Jejak Status & Audit Log (${detailData.auditLogs.length})`}>
                    <div className="space-y-3">
                      {detailData.auditLogs.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200/50">
                          <Info className="h-5 w-5 text-slate-300 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
                            Belum ada log perubahan status.<br />Perubahan status berikutnya akan dicatat otomatis di sini.
                          </p>
                        </div>
                      ) : (
                        detailData.auditLogs.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-3"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-[10px] font-bold">
                              <p className="text-slate-700">
                                <span className="font-mono text-slate-400 uppercase">
                                  {log.previous_status || 'unknown'}
                                </span>{' '}
                                <span className="text-slate-300">→</span>{' '}
                                <span className="font-mono text-[var(--color-primary)] uppercase">
                                  {log.next_status || 'unknown'}
                                </span>
                              </p>
                              <p className="text-slate-400">
                                {formatDateTime(log.created_at)}
                              </p>
                            </div>
                            <p className="mt-1 text-[10px] font-semibold text-slate-500">
                              Diproses oleh: <span className="font-bold text-slate-600">{formatAuditActor(log.actor_name, log.actor_email)}</span>
                            </p>
                            {log.note ? (
                              <p className="mt-2 rounded-lg bg-white border border-slate-200/40 px-3 py-2 text-[10px] font-medium leading-relaxed text-slate-600">
                                {log.note}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </DetailSection>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ================= CONFIRM DIALOG ================= */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText="Batal"
        type={confirmState.type}
        onConfirm={executeConfirmAction}
        onCancel={closeConfirm}
      />
    </div>
  );
}

// ─────────────────────────── Subcomponents ───────────────────────────

function OrderRowMenu({ onDetail, onDelete, isSaving, isDeleting }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left select-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isSaving || isDeleting}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition cursor-pointer"
        aria-label="Aksi"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-in text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDetail();
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer text-left"
            >
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              Detail
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              disabled={isDeleting}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 hover:bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-left border-t border-slate-100"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
              {isDeleting ? 'Hapus…' : 'Hapus Order'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="space-y-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
        {title}
      </h4>
      <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-2xs">
        {children}
      </div>
    </section>
  );
}

function DetailItem({ label, value, className = '', emphasize = false }) {
  return (
    <div className={className}>
      <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd
        className={`mt-1 font-semibold ${
          emphasize
            ? 'text-sm font-black tabular-nums text-[var(--color-secondary)]'
            : 'text-xs text-slate-800'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function AdminListSkeleton({ rows }) {
  return (
    <div className="space-y-4 animate-pulse select-none">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4">
        <div className="space-y-4">
          <div className="h-4.5 bg-slate-100 rounded-md w-1/4" />
          <hr className="border-slate-100" />
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center gap-4 py-1.5">
              <div className="h-4 bg-slate-100 rounded-md w-12" />
              <div className="h-4 bg-slate-100 rounded-md w-24" />
              <div className="h-4 bg-slate-100 rounded-md w-36" />
              <div className="h-4 bg-slate-100 rounded-md w-20" />
              <div className="h-4 bg-slate-100 rounded-md w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
