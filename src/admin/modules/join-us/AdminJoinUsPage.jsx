import { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loading from '../../../components/common/Loading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';
import { joinService } from '../../../services/public/joinService';
import { logAdminActivity } from '../../../lib/helpers';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Download,
  Lock,
  Unlock,
  Settings,
  Phone,
  FileText,
  Clock,
  Save,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export default function AdminJoinUsPage() {
  const notify = useAdminToast();

  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'settings'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submissions data
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'member' | 'admin' | 'volunteer'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Settings data
  const [settings, setSettings] = useState({});
  const [newAdminPosition, setNewAdminPosition] = useState('');
  const [newVolunteerDivision, setNewVolunteerDivision] = useState('');

  const handleAddAdminPosition = () => {
    const val = newAdminPosition.trim();
    if (!val) return;
    const currentList = settings.admin?.available_positions || [
      'Data Archiver', 'Keanggotaan dan Lapangan', 'Video Editor', 'Media Sosial', 'Design Grafis', 'Illustrator', 'E-Sport Management', 'Merchandise'
    ];
    if (currentList.includes(val)) return;
    const updated = [...currentList, val];
    setSettings(prev => ({
      ...prev,
      admin: { ...prev.admin, available_positions: updated }
    }));
    setNewAdminPosition('');
  };

  const handleRemoveAdminPosition = (posToRemove) => {
    const currentList = settings.admin?.available_positions || [];
    const updated = currentList.filter(p => p !== posToRemove);
    setSettings(prev => ({
      ...prev,
      admin: { ...prev.admin, available_positions: updated }
    }));
  };

  const handleAddVolunteerDivision = () => {
    const val = newVolunteerDivision.trim();
    if (!val) return;
    const currentList = settings.volunteer?.available_divisions || [
      'Divisi Acara', 'Divisi Konsumsi', 'Divisi Sarana & Prasarana', 'Divisi Dokumentasi & Media'
    ];
    if (currentList.includes(val)) return;
    const updated = [...currentList, val];
    setSettings(prev => ({
      ...prev,
      volunteer: { ...prev.volunteer, available_divisions: updated }
    }));
    setNewVolunteerDivision('');
  };

  const handleRemoveVolunteerDivision = (divToRemove) => {
    const currentList = settings.volunteer?.available_divisions || [];
    const updated = currentList.filter(d => d !== divToRemove);
    setSettings(prev => ({
      ...prev,
      volunteer: { ...prev.volunteer, available_divisions: updated }
    }));
  };

  // Detail Modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Delete Confirm
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      joinService.getJoinSubmissions(),
      joinService.getJoinSettings(),
    ])
      .then(([subsData, settingsData]) => {
        if (isMounted) {
          setSubmissions(subsData || []);
          setSettings(settingsData || {});
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading join us admin data:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subsData, settingsData] = await Promise.all([
        joinService.getJoinSubmissions(),
        joinService.getJoinSettings(),
      ]);
      setSubmissions(subsData || []);
      setSettings(settingsData || {});
    } catch (err) {
      console.error('Error loading join us admin data:', err);
      notify.error('Gagal Memuat Data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" /> Diterima
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" /> Ditolak
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1 w-fit">
            <Phone className="h-3 w-3" /> Diatasi / Diwas
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> Menunggu Review
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'member':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/30 text-[10px] font-extrabold">Join Member</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/30 text-[10px] font-extrabold">Join Admin</span>;
      case 'volunteer':
        return <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-700 border border-pink-500/30 text-[10px] font-extrabold">Join Volunteer</span>;
      default:
        return null;
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = item.full_name?.toLowerCase().includes(q) || item.nickname?.toLowerCase().includes(q);
      const lineMatch = item.line_id?.toLowerCase().includes(q);
      const xMatch = item.x_account?.toLowerCase().includes(q);
      const posMatch = item.position_or_division?.toLowerCase().includes(q);
      return nameMatch || lineMatch || xMatch || posMatch;
    });
  }, [submissions, filterType, filterStatus, searchQuery]);

  const handleOpenDetail = (sub) => {
    setSelectedSub(sub);
    setAdminNotes(sub.notes || '');
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsSubmitting(true);
    try {
      await joinService.updateSubmissionStatus(id, newStatus, adminNotes);
      await logAdminActivity(`Mengubah status pendaftar ID ${id} menjadi ${newStatus}`);
      notify.success('Status Diperbarui', `Status pendaftar berhasil diubah.`);
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub(prev => ({ ...prev, status: newStatus, notes: adminNotes }));
      }
      fetchData();
    } catch (err) {
      notify.error('Gagal Memperbarui Status', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSub = (sub) => {
    setConfirmDelete({ isOpen: true, id: sub.id, name: sub.full_name });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = confirmDelete;
    setConfirmDelete({ isOpen: false, id: null, name: '' });
    try {
      await joinService.deleteSubmission(id);
      await logAdminActivity(`Menghapus data pendaftar: ${name}`);
      notify.success('Pendaftar Dihapus', `Data pendaftaran ${name} berhasil dihapus.`);
      if (selectedSub && selectedSub.id === id) {
        setIsDetailModalOpen(false);
      }
      fetchData();
    } catch (err) {
      notify.error('Gagal Menghapus Data', err.message);
    }
  };

  const handleSaveSetting = async (type, currentSetting) => {
    setIsSubmitting(true);
    try {
      await joinService.updateJoinSettings(type, currentSetting);
      await logAdminActivity(`Memperbarui pengaturan form join us (${type})`);
      notify.success('Pengaturan Disimpan', `Pengaturan form ${type} berhasil disimpan.`);
      fetchData();
    } catch (err) {
      notify.error('Gagal Menyimpan Pengaturan', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (type) => {
    const current = settings[type] || { status: 'open' };
    const nextStatus = current.status === 'open' ? 'closed' : 'open';
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], status: nextStatus }
    }));
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      notify.warning('Tidak ada data', 'Tidak ada data pendaftar untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Tipe', 'Nama Lengkap', 'Nama Panggilan', 'Domisili', 'Usia', 'Gender', 'ID Line', 'No WA', 'Akun X', 'Posisi/Divisi', 'Status', 'Tanggal'];
    const rows = filteredSubmissions.map(s => [
      s.id,
      s.type,
      `"${s.full_name || ''}"`,
      `"${s.nickname || ''}"`,
      `"${s.domicile || ''}"`,
      s.age || '',
      s.gender || '',
      `"${s.line_id || ''}"`,
      `"${s.whatsapp_number || ''}"`,
      `"${s.x_account || ''}"`,
      `"${s.position_or_division || ''}"`,
      s.status || 'pending',
      new Date(s.created_at).toLocaleDateString('id-ID')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pendaftar_join_us_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Ekspor CSV Berhasil', 'Data pendaftar telah didownload.');
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--color-pink)] shrink-0" /> Kelola Join Us & Pendaftaran
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau pendaftar masuk (Member, Admin, Volunteer) dan atur status buka/kunci form pendaftaran.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'submissions' && (
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs" onClick={exportToCSV}>
              <Download className="h-4 w-4" /> Ekspor CSV
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions' ? 'border-[var(--color-pink)] text-[var(--color-pink)]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('submissions')}
        >
          <FileText className="h-4 w-4" />
          <span>Pendaftar Masuk ({filteredSubmissions.length})</span>
        </button>
        <button
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings' ? 'border-[var(--color-pink)] text-[var(--color-pink)]' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan & Status Form</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS LIST */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex-1">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama, ID Line, akun X, divisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none flex-1 text-slate-800 placeholder-slate-400 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Opsi Form</option>
                <option value="member">Join Member</option>
                <option value="admin">Join Admin</option>
                <option value="volunteer">Join Volunteer</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Review</option>
                <option value="approved">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <Card hoverEffect={false} className="border border-slate-200 bg-white overflow-hidden rounded-2xl shadow-xs" padding="none">
            {isLoading ? (
              <div className="p-12"><Loading message="Memuat daftar pendaftar..." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                    <tr>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4">Nama / Panggilan</th>
                      <th className="px-6 py-4">Kontak (Line / X)</th>
                      <th className="px-6 py-4">Posisi / Divisi</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(sub.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">{sub.full_name}</div>
                          <div className="text-xs text-slate-400">({sub.nickname || '-'}) • {sub.domicile || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <div className="font-medium text-slate-700">Line: <span className="font-bold">{sub.line_id || '-'}</span></div>
                          <div className="text-slate-400">X: {sub.x_account || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-purple-900">
                          {sub.position_or_division || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                          {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetail(sub)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Respon"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub)}
                              className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Data Pendaftar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSubmissions.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                          Belum ada data pendaftar yang sesuai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: SETTINGS & FORM LOCKING */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['member', 'admin', 'volunteer'].map((type) => {
            const cur = settings[type] || {
              title: type === 'member' ? 'Open Member IntaniumOFC' : (type === 'admin' ? 'Recruitment Admin Intanium' : 'Open Volunteer Event'),
              description: '',
              status: 'open'
            };

            const isClosed = cur.status === 'closed';

            return (
              <Card key={type} className="border border-slate-200 bg-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      {type === 'member' && <Users className="h-5 w-5 text-amber-500" />}
                      {type === 'admin' && <ShieldCheck className="h-5 w-5 text-purple-500" />}
                      {type === 'volunteer' && <HeartHandshake className="h-5 w-5 text-pink-500" />}
                      <span className="font-extrabold text-slate-800 text-sm uppercase">Form {type}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(type)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isClosed ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}
                    >
                      {isClosed ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      <span>{isClosed ? 'Pendaftaran Dikunci' : 'Pendaftaran Dibuka'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Form</label>
                      <input
                        type="text"
                        value={cur.title || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, [type]: { ...prev[type], title: e.target.value } }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Petunjuk</label>
                      <textarea
                        rows={3}
                        value={cur.description || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, [type]: { ...prev[type], description: e.target.value } }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </div>

                    {type === 'admin' && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-bold text-purple-900">
                          Posisi Open Recruitment Admin
                        </label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                          {(cur.available_positions || [
                            'Data Archiver', 'Keanggotaan dan Lapangan', 'Video Editor', 'Media Sosial', 'Design Grafis', 'Illustrator', 'E-Sport Management', 'Merchandise'
                          ]).map((pos) => (
                            <span key={pos} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
                              {pos}
                              <button
                                type="button"
                                onClick={() => handleRemoveAdminPosition(pos)}
                                className="w-4 h-4 rounded-full hover:bg-purple-200 flex items-center justify-center text-purple-700 hover:text-red-600 transition-colors cursor-pointer text-xs leading-none"
                                title="Hapus posisi ini"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ketik posisi baru..."
                            value={newAdminPosition}
                            onChange={(e) => setNewAdminPosition(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAdminPosition(); } }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddAdminPosition}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            + Tambah
                          </button>
                        </div>
                      </div>
                    )}

                    {type === 'volunteer' && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <label className="block text-xs font-bold text-pink-900">
                          Divisi Open Recruitment Volunteer
                        </label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                          {(cur.available_divisions || [
                            'Divisi Acara', 'Divisi Konsumsi', 'Divisi Sarana & Prasarana', 'Divisi Dokumentasi & Media'
                          ]).map((div) => (
                            <span key={div} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-100 text-pink-900 border border-pink-200 flex items-center gap-1.5 shadow-2xs">
                              {div}
                              <button
                                type="button"
                                onClick={() => handleRemoveVolunteerDivision(div)}
                                className="w-4 h-4 rounded-full hover:bg-pink-200 flex items-center justify-center text-pink-700 hover:text-red-600 transition-colors cursor-pointer text-xs leading-none"
                                title="Hapus divisi ini"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ketik divisi baru..."
                            value={newVolunteerDivision}
                            onChange={(e) => setNewVolunteerDivision(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVolunteerDivision(); } }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddVolunteerDivision}
                            className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            + Tambah
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSaveSetting(type, cur)}
                    className={`px-4 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 ${
                      type === 'member'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : type === 'admin'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    <Save className="h-4 w-4" /> Simpan Form {type}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Submission Modal */}
      {isDetailModalOpen && selectedSub && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Pendaftar: ${selectedSub.full_name}`}
        >
          <div className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedSub.type)}
                <span className="text-xs text-slate-500 font-medium">
                  {new Date(selectedSub.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <div>{getStatusBadge(selectedSub.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Nama Lengkap:</span>
                <span className="font-bold text-slate-800">{selectedSub.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Nama Panggilan:</span>
                <span className="font-bold text-slate-800">{selectedSub.nickname || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">ID Line / Display Name:</span>
                <span className="font-bold text-slate-800">{selectedSub.line_id} ({selectedSub.line_display_name || '-'})</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">No WhatsApp:</span>
                <span className="font-bold text-slate-800">{selectedSub.whatsapp_number || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Akun X:</span>
                <span className="font-bold text-slate-800">{selectedSub.x_account || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Domisili / Usia / Gender:</span>
                <span className="font-bold text-slate-800">{selectedSub.domicile || '-'} / {selectedSub.age || '-'} / {selectedSub.gender || '-'}</span>
              </div>
            </div>

            {selectedSub.position_or_division && (
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs">
                <span className="text-purple-600 font-bold block mb-1">Posisi / Divisi Dilamar:</span>
                <span className="font-extrabold text-purple-950 text-sm">{selectedSub.position_or_division}</span>
              </div>
            )}

            {selectedSub.portfolio_url && (
              <div className="text-xs">
                <span className="text-slate-400 font-semibold block mb-1">Link Portofolio G-Drive:</span>
                <a href={selectedSub.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold break-all">
                  {selectedSub.portfolio_url}
                </a>
              </div>
            )}

            {selectedSub.reasons && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-500 font-bold block mb-1">Alasan & Motivasi:</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedSub.reasons}</p>
              </div>
            )}

            {/* Status Update Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Catatan Admin:</label>
              <textarea
                rows={2}
                placeholder="Tuliskan catatan internal panitia..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'approved')}
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer text-xs font-bold"
                  >
                    Setujui / Terima
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedSub.id, 'rejected')}
                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer text-xs font-bold"
                  >
                    Tolak
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="cursor-pointer text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Pendaftar"
        message={`Apakah Anda yakin ingin menghapus data pendaftaran dari "${confirmDelete.name}"? Action ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
