'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { esportService } from '../../../services/public/esportService';
import {
  Trophy,
  Users,
  Calendar,
  Award,
  Plus,
  Edit,
  Trash2,
  X,
  Sparkles,
  Link2,
  Gamepad2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseUpload, useImageUpload } from '../../../hooks/useSupabaseUpload';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAdminToast } from '../../../components/common/useAdminToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export default function AdminEsportPage() {
  const notify = useAdminToast();
  const [activeTab, setActiveTab] = useState('divisions');
  const [divisions, setDivisions] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [matches, setMatches] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useSupabaseUpload integration
  const { uploadFile, isUploading, progress } = useSupabaseUpload();

  // useImageUpload instances for previews and file selection
  const wallpaperUpload = useImageUpload();
  const avatarUpload = useImageUpload();
  const opponentLogoUpload = useImageUpload();
  const badgeUpload = useImageUpload();
  const photoUpload = useImageUpload();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'division', 'roster', 'match', 'achievement'
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: null, id: null, displayName: '' });

  // Form states
  const [divisionForm, setDivisionForm] = useState({ id: '', name: '', tagline: '', logo: '', banner_gradient: '', wallpaper: '' });
  const [rosterForm, setRosterForm] = useState({ id: null, division_id: '', name: '', ign: '', role: '', image_url: '', social_instagram: '', social_twitter: '', sort_order: 0 });
  const [matchForm, setMatchForm] = useState({ id: null, division_id: '', opponent: '', opponent_logo: '', date: '', time: '', stage: '', status: 'Upcoming', score: '', result: '', stream_url: '' });
  const [achievementForm, setAchievementForm] = useState({ id: null, division_id: '', title: '', rank: '', date: '', badge: '', image_url: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const divsData = await esportService.getDivisions();
      const rostData = await esportService.getRosters();
      const matchData = await esportService.getMatches();
      const achsData = await esportService.getAchievements();

      setDivisions(divsData);
      setRosters(rostData);
      setMatches(matchData);
      setAchievements(achsData);
    } catch (err) {
      console.error('Error fetching esport data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to open CRUD modal
  const handleOpenModal = (type, mode = 'add', item = null) => {
    setModalType(type);
    setIsEditMode(mode === 'edit');

    if (type === 'division') {
      const divisionData = item || { id: '', name: '', tagline: '', logo: '', banner_gradient: 'from-blue-600/20 to-purple-600/20', wallpaper: '' };
      setDivisionForm(divisionData);
      wallpaperUpload.setInitialValue(divisionData.wallpaper);
    } else if (type === 'roster') {
      const rosterData = item || { id: null, division_id: divisions[0]?.id || '', name: '', ign: '', role: '', image_url: '', social_instagram: '', social_twitter: '', sort_order: rosters.length };
      setRosterForm(rosterData);
      avatarUpload.setInitialValue(rosterData.image_url);
    } else if (type === 'match') {
      const matchData = item || { id: null, division_id: divisions[0]?.id || '', opponent: '', opponent_logo: '', date: '', time: '', stage: '', status: 'Upcoming', score: '', result: '', stream_url: '' };
      setMatchForm(matchData);
      opponentLogoUpload.setInitialValue(matchData.opponent_logo);
    } else if (type === 'achievement') {
      const achData = item || { id: null, division_id: divisions[0]?.id || '', title: '', rank: '', date: '', badge: '', image_url: '' };
      setAchievementForm(achData);
      badgeUpload.setInitialValue(achData.badge);
      photoUpload.setInitialValue(achData.image_url);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    wallpaperUpload.setInitialValue(null);
    avatarUpload.setInitialValue(null);
    opponentLogoUpload.setInitialValue(null);
    badgeUpload.setInitialValue(null);
    photoUpload.setInitialValue(null);
    setIsModalOpen(false);
  };

  // Handle Form changes
  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'division') {
      setDivisionForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'roster') {
      setRosterForm(prev => ({ ...prev, [name]: name === 'sort_order' ? parseInt(value) || 0 : value }));
    } else if (formType === 'match') {
      setMatchForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'achievement') {
      setAchievementForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    let res = null;

    try {
      if (modalType === 'division') {
        let currentWallpaper = divisionForm.wallpaper;
        if (wallpaperUpload.file) {
          currentWallpaper = await uploadFile(wallpaperUpload.file, 'assets', 'esports/divisions/wallpapers');
        }

        const slugId = divisionForm.id || divisionForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
        const payload = {
          id: slugId,
          name: divisionForm.name,
          tagline: divisionForm.tagline || 'Divisi Resmi IRIS Esport',
          logo: divisionForm.logo || '🎮',
          banner_gradient: divisionForm.banner_gradient || 'from-blue-600/20 to-purple-600/20',
          wallpaper: currentWallpaper
        };

        if (isEditMode) {
          res = await esportService.updateDivision(divisionForm.id, payload);
        } else {
          res = await esportService.createDivision(payload);
        }
      } else if (modalType === 'roster') {
        let currentImageUrl = rosterForm.image_url;
        if (avatarUpload.file) {
          currentImageUrl = await uploadFile(avatarUpload.file, 'assets', 'esports/rosters');
        }
        const updatedRosterForm = { ...rosterForm, image_url: currentImageUrl };
        if (isEditMode) {
          res = await esportService.updateRoster(rosterForm.id, updatedRosterForm);
        } else {
          res = await esportService.createRoster(updatedRosterForm);
        }
      } else if (modalType === 'match') {
        let currentOpponentLogo = matchForm.opponent_logo;
        if (opponentLogoUpload.file) {
          currentOpponentLogo = await uploadFile(opponentLogoUpload.file, 'assets', 'esports/matches');
        }
        const updatedMatchForm = { ...matchForm, opponent_logo: currentOpponentLogo };
        if (isEditMode) {
          res = await esportService.updateMatch(matchForm.id, updatedMatchForm);
        } else {
          res = await esportService.createMatch(updatedMatchForm);
        }
      } else if (modalType === 'achievement') {
        let currentBadge = achievementForm.badge;
        let currentImageUrl = achievementForm.image_url;
        if (badgeUpload.file) {
          currentBadge = await uploadFile(badgeUpload.file, 'assets', 'esports/achievements/badges');
        }
        if (photoUpload.file) {
          currentImageUrl = await uploadFile(photoUpload.file, 'assets', 'esports/achievements/photos');
        }
        const updatedAchievementForm = { ...achievementForm, badge: currentBadge, image_url: currentImageUrl };
        if (isEditMode) {
          res = await esportService.updateAchievement(achievementForm.id, updatedAchievementForm);
        } else {
          res = await esportService.createAchievement(updatedAchievementForm);
        }
      }

      const typeLabels = {
        division: 'Divisi game',
        roster: 'Roster',
        match: 'Pertandingan',
        achievement: 'Prestasi'
      };
      const label = typeLabels[modalType] || 'Data';

      if (res && res.success === false) {
        notify.error(`Gagal menyimpan ${label}`, res.error || 'Terjadi kesalahan');
      } else {
        notify.success(`${label} disimpan`, `Detail ${label} berhasil disimpan.`);
        handleCloseModal();
        fetchData();
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menyimpan', `Terjadi kesalahan saat menyimpan: ${err.message}`);
    }
  };

  // Delete operations
  const handleDelete = (type, id, displayName) => {
    setConfirmDelete({ isOpen: true, type, id, displayName });
  };

  const confirmDeleteAction = async () => {
    const { type, id, displayName } = confirmDelete;
    setConfirmDelete({ isOpen: false, type: null, id: null, displayName: '' });

    let res = null;
    try {
      if (type === 'division') {
        res = await esportService.deleteDivision(id);
      } else if (type === 'roster') {
        res = await esportService.deleteRoster(id);
      } else if (type === 'match') {
        res = await esportService.deleteMatch(id);
      } else if (type === 'achievement') {
        res = await esportService.deleteAchievement(id);
      }

      const typeLabels = {
        division: 'Divisi game',
        roster: 'Roster',
        match: 'Pertandingan',
        achievement: 'Prestasi'
      };
      const label = typeLabels[type] || 'Data';

      if (res && res.success === false) {
        notify.error(`Gagal menghapus ${label}`, res.error || 'Terjadi kesalahan');
      } else {
        notify.success(`${label} dihapus`, `${label} "${displayName}" berhasil dihapus.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      notify.error('Gagal menghapus', err.message || 'Terjadi kesalahan saat menghapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#170C79]" /> Kelola IRIS Esport
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola divisi, daftar roster, jadwal & hasil pertandingan, serta ruang prestasi (trophy room).
          </p>
        </div>
        <button
          onClick={() => handleOpenModal(activeTab === 'divisions' ? 'division' : activeTab.slice(0, -1))}
          className="flex items-center gap-2 bg-[#170C79] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e8a] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah {activeTab === 'divisions' ? 'Divisi Game' : activeTab === 'rosters' ? 'Roster' : activeTab === 'matches' ? 'Pertandingan' : 'Prestasi'}
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-wrap border-b border-slate-200">
        <button
          onClick={() => setActiveTab('divisions')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'divisions'
              ? 'border-[#170C79] text-[#170C79]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> Divisi Game
        </button>
        <button
          onClick={() => setActiveTab('rosters')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rosters'
              ? 'border-[#170C79] text-[#170C79]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Roster Divisi
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'matches'
              ? 'border-[#170C79] text-[#170C79]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" /> Pertandingan
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'border-[#170C79] text-[#170C79]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" /> Prestasi (Trophy)
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 py-12 text-center text-slate-500">Memuat data…</div>
      ) : (
        <div className={activeTab === 'divisions' ? "" : "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6"}>
          <div>
            {/* === TAB 1: DIVISIONS === */}
            {activeTab === 'divisions' && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {divisions.map((div) => (
                  <motion.div
                    key={div.id}
                    variants={itemVariants}
                    className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Wallpaper Card Header Banner */}
                      <div className="relative h-36 bg-slate-900 overflow-hidden">
                        {div.wallpaper ? (
                          <img src={(div.wallpaper)?.src || (div.wallpaper)} alt={div.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#170C79]/40 to-[#1a0e8a]/20 flex items-center justify-center">
                            <span className="text-white/40 text-xs font-semibold">Belum Ada Wallpaper</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm border border-slate-100">
                          {div.id}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-black text-slate-800">{div.name}</h3>
                      </div>
                    </div>
                    <div className="px-5 pb-5 flex justify-between items-center">
                      <button
                        onClick={() => handleDelete('division', div.id, div.name)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                      <button
                        onClick={() => handleOpenModal('division', 'edit', div)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Divisi
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* === TAB 2: ROSTERS === */}
            {activeTab === 'rosters' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="p-4 pl-6">Foto & Nama</th>
                        <th className="p-4">IGN</th>
                        <th className="p-4">Divisi</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Sosial Media</th>
                        <th className="p-4 text-right pr-6">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rosters.map((r) => {
                        const div = divisions.find(d => d.id === r.division_id);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <img src={(r.image_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder')?.src || (r.image_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder')} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                <span className="font-bold text-slate-800 text-sm max-w-[150px] lg:max-w-[200px] truncate">{r.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm font-semibold text-slate-700 truncate max-w-[120px]">{r.ign}</td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {div?.name || r.division_id}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 truncate max-w-[100px]">{r.role}</td>
                            <td className="p-4">
                              <div className="flex gap-2 text-slate-400">
                                {r.social_instagram && (
                                  <a href={r.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500" title="Instagram">
                                    <Link2 className="w-4 h-4" />
                                  </a>
                                )}
                                {r.social_twitter && (
                                  <a href={r.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500" title="Twitter">
                                    <Link2 className="w-4 h-4" />
                                  </a>
                                )}
                                {!r.social_instagram && !r.social_twitter && '-'}
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenModal('roster', 'edit', r)}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('roster', r.id, `${r.ign} (${r.name})`)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {rosters.map((r) => {
                    const div = divisions.find(d => d.id === r.division_id);
                    return (
                      <div key={r.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={(r.image_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder')?.src || (r.image_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder')} alt={r.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-sm truncate">{r.name}</div>
                            <div className="text-xs font-semibold text-slate-600 truncate mt-0.5">{r.ign}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {div?.name || r.division_id}
                          </span>
                          <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{r.role}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                          <div className="flex gap-2 text-slate-400">
                            {r.social_instagram && (
                              <a href={r.social_instagram} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-pink-500 bg-slate-50 rounded" title="Instagram">
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {r.social_twitter && (
                              <a href={r.social_twitter} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-blue-500 bg-slate-50 rounded" title="Twitter">
                                <Link2 className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {!r.social_instagram && !r.social_twitter && <span className="text-xs italic">No social</span>}
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal('roster', 'edit', r)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete('roster', r.id, `${r.ign} (${r.name})`)}
                              className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* === TAB 3: MATCHES === */}
            {activeTab === 'matches' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-x-auto"
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="p-4 pl-6">Tanggal & Waktu</th>
                        <th className="p-4">Lawan</th>
                        <th className="p-4">Divisi</th>
                        <th className="p-4">Stage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Skor & Hasil</th>
                        <th className="p-4 text-right pr-6">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matches.map((m) => {
                        const div = divisions.find(d => d.id === m.division_id);
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="text-sm font-semibold text-slate-800">{m.date}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{m.time}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {m.opponent_logo && (m.opponent_logo.startsWith('http') || m.opponent_logo.startsWith('blob:')) ? (
                                  <img src={(m.opponent_logo)?.src || (m.opponent_logo)} alt={m.opponent} className="w-8 h-8 object-contain rounded-full border border-slate-200 bg-white" />
                                ) : (
                                  <span className="text-lg">{m.opponent_logo}</span>
                                )}
                                <span className="font-bold text-slate-800 text-sm">{m.opponent}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {div?.name || m.division_id}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={m.stage}>{m.stage}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                m.status === 'Upcoming' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              {m.status === 'Past' ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">{m.score || '-'}</span>
                                  {m.result && (
                                    <span className={`inline-block px-1.5 py-0.2 text-[9px] font-black rounded uppercase ${
                                      m.result === 'win' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                                    }`}>
                                      {m.result}
                                    </span>
                                  )}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenModal('match', 'edit', m)}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('match', m.id, `Lawan ${m.opponent}`)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {matches.map((m) => {
                    const div = divisions.find(d => d.id === m.division_id);
                    return (
                      <div key={m.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {m.opponent_logo && (m.opponent_logo.startsWith('http') || m.opponent_logo.startsWith('blob:')) ? (
                              <img src={(m.opponent_logo)?.src || (m.opponent_logo)} alt={m.opponent} className="w-10 h-10 object-contain rounded-full border border-slate-200 bg-white" />
                            ) : (
                              <span className="text-2xl">{m.opponent_logo}</span>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm truncate">{m.opponent}</span>
                              <span className="text-xs text-slate-500 truncate">{m.stage}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            m.status === 'Upcoming' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {m.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {div?.name || m.division_id}
                          </span>
                          {m.status === 'Past' && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-sm">{m.score || '-'}</span>
                              {m.result && (
                                <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                                  m.result === 'win' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                  {m.result}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{m.date}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{m.time}</span>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal('match', 'edit', m)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete('match', m.id, `Lawan ${m.opponent}`)}
                              className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* === TAB 4: ACHIEVEMENTS === */}
            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="p-4 pl-6">Prestasi / Piala</th>
                        <th className="p-4">Badge</th>
                        <th className="p-4">Divisi</th>
                        <th className="p-4">Peringkat</th>
                        <th className="p-4">Tanggal Perolehan</th>
                        <th className="p-4 text-right pr-6">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {achievements.map((a) => {
                        const div = divisions.find(d => d.id === a.division_id);
                        return (
                          <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-slate-800 text-sm max-w-[200px] truncate">{a.title}</div>
                              {a.image_url && (
                                <div className="text-[10px] text-blue-500 font-semibold mt-0.5 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Memiliki Foto
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              {a.badge && (a.badge.startsWith('http') || a.badge.startsWith('blob:')) ? (
                                <img src={(a.badge)?.src || (a.badge)} alt={a.title} className="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-white" />
                              ) : (
                                <span className="text-lg">{a.badge}</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {div?.name || a.division_id}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-semibold text-slate-700">{a.rank}</td>
                            <td className="p-4 text-sm text-slate-600">{a.date}</td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenModal('achievement', 'edit', a)}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('achievement', a.id, a.title)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {achievements.map((a) => {
                    const div = divisions.find(d => d.id === a.division_id);
                    return (
                      <div key={a.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 min-w-0">
                            {a.badge && (a.badge.startsWith('http') || a.badge.startsWith('blob:')) ? (
                              <img src={(a.badge)?.src || (a.badge)} alt={a.title} className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white shrink-0" />
                            ) : (
                              <span className="text-2xl shrink-0">{a.badge}</span>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-800 text-sm truncate">{a.title}</span>
                              {a.image_url && (
                                <span className="text-[10px] text-blue-500 font-semibold mt-0.5 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Memiliki Foto
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 shrink-0 ml-2">
                            {a.rank}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {div?.name || a.division_id}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                          <span className="text-xs font-semibold text-slate-500">{a.date}</span>
                          
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal('achievement', 'edit', a)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete('achievement', a.id, a.title)}
                              className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* CRUD Modals Wrapper */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h3 className="text-xl font-bold text-slate-800">
                  {isEditMode ? 'Edit' : 'Tambah'} {modalType === 'division' ? 'Divisi Game' : modalType === 'roster' ? 'Roster Divisi' : modalType === 'match' ? 'Pertandingan' : 'Prestasi'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Scroll Area */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow">
                {/* ================= FORM 1: DIVISION ================= */}
                {modalType === 'division' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Divisi Game</label>
                      <input autoComplete="off" type="text" name="name" value={divisionForm.name} onChange={(e) => handleInputChange(e, 'division')} placeholder="Contoh: Mobile Legends" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors font-semibold" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Wallpaper Card</label>
                      <div className="flex items-center gap-4">
                        <div
                          onClick={wallpaperUpload.handleThumbnailClick}
                          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all"
                          title="Klik untuk memilih gambar"
                        >
                          {wallpaperUpload.previewUrl ? (
                            <img src={(wallpaperUpload.previewUrl)?.src || (wallpaperUpload.previewUrl)} alt="Preview Wallpaper" className="w-full h-full object-cover" />
                          ) : (
                            <Plus className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-grow space-y-1">
                          <input
                            type="file"
                            ref={wallpaperUpload.fileInputRef}
                            accept="image/*"
                            onChange={wallpaperUpload.handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <div className="text-xs text-slate-600 font-medium">
                            {wallpaperUpload.fileName ? (
                              <span className="font-semibold text-[#170C79]">{wallpaperUpload.fileName}</span>
                            ) : (
                              <span className="text-slate-400">Belum ada file terpilih</span>
                            )}
                          </div>
                          {wallpaperUpload.previewUrl && (
                            <button
                              type="button"
                              onClick={wallpaperUpload.handleRemove}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              Hapus Gambar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= FORM 2: ROSTER ================= */}
                {modalType === 'roster' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Divisi Game</label>
                      <select name="division_id" value={rosterForm.division_id} onChange={(e) => handleInputChange(e, 'roster')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors">
                        {divisions.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                        <input autoComplete="off" type="text" name="name" value={rosterForm.name} onChange={(e) => handleInputChange(e, 'roster')} placeholder="Budi Santoso" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">In-Game Name (IGN)</label>
                        <input autoComplete="off" type="text" name="ign" value={rosterForm.ign} onChange={(e) => handleInputChange(e, 'roster')} placeholder="Zenith" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors font-bold" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role / Jabatan</label>
                      <input autoComplete="off" type="text" name="role" value={rosterForm.role} onChange={(e) => handleInputChange(e, 'roster')} placeholder="Contoh: Team Manager, Captain / Mid Laner" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Foto Roster</label>
                      <div className="flex items-center gap-4">
                        <div
                          onClick={avatarUpload.handleThumbnailClick}
                          className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all animate-fade-in"
                          title="Klik untuk memilih gambar"
                        >
                          {avatarUpload.previewUrl ? (
                            <img src={(avatarUpload.previewUrl)?.src || (avatarUpload.previewUrl)} alt="Preview Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-grow space-y-1">
                          <input
                            type="file"
                            ref={avatarUpload.fileInputRef}
                            accept="image/*"
                            onChange={avatarUpload.handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <div className="text-xs text-slate-600 font-medium">
                            {avatarUpload.fileName ? (
                              <span className="font-semibold text-[#170C79]">{avatarUpload.fileName}</span>
                            ) : (
                              <span className="text-slate-400">Belum ada file terpilih</span>
                            )}
                          </div>
                          {avatarUpload.previewUrl && (
                            <button
                              type="button"
                              onClick={avatarUpload.handleRemove}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              Hapus Gambar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instagram URL</label>
                        <input autoComplete="off" type="url" name="social_instagram" value={rosterForm.social_instagram} onChange={(e) => handleInputChange(e, 'roster')} placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Twitter URL</label>
                        <input autoComplete="off" type="url" name="social_twitter" value={rosterForm.social_twitter} onChange={(e) => handleInputChange(e, 'roster')} placeholder="https://x.com/..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urutan Tampil (Sort Order)</label>
                      <input type="number" name="sort_order" value={rosterForm.sort_order} onChange={(e) => handleInputChange(e, 'roster')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                    </div>
                  </div>
                )}

                {/* ================= FORM 3: MATCH ================= */}
                {modalType === 'match' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Divisi Game</label>
                      <select name="division_id" value={matchForm.division_id} onChange={(e) => handleInputChange(e, 'match')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors">
                        {divisions.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lawan</label>
                        <input autoComplete="off" type="text" name="opponent" value={matchForm.opponent} onChange={(e) => handleInputChange(e, 'match')} placeholder="EVOS Hope" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Logo Lawan</label>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={opponentLogoUpload.handleThumbnailClick}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all"
                            title="Klik untuk memilih gambar"
                          >
                            {opponentLogoUpload.previewUrl ? (
                              opponentLogoUpload.previewUrl.startsWith('http') || opponentLogoUpload.previewUrl.startsWith('blob:') ? (
                                <img src={(opponentLogoUpload.previewUrl)?.src || (opponentLogoUpload.previewUrl)} alt="Preview Opponent Logo" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-3xl">{opponentLogoUpload.previewUrl}</span>
                              )
                            ) : (
                              <Plus className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-grow space-y-1">
                            <input
                              type="file"
                              ref={opponentLogoUpload.fileInputRef}
                              accept="image/*"
                              onChange={opponentLogoUpload.handleFileChange}
                              style={{ display: 'none' }}
                            />
                            <div className="text-xs text-slate-600 font-medium">
                              {opponentLogoUpload.fileName ? (
                                <span className="font-semibold text-[#170C79]">{opponentLogoUpload.fileName}</span>
                              ) : (
                                <span className="text-slate-400">Belum ada file terpilih</span>
                              )}
                            </div>
                            {opponentLogoUpload.previewUrl && (
                              <button
                                type="button"
                                onClick={opponentLogoUpload.handleRemove}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                Hapus Gambar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Main (Bahasa Indonesia)</label>
                        <input autoComplete="off" type="text" name="date" value={matchForm.date} onChange={(e) => handleInputChange(e, 'match')} placeholder="Contoh: 20 Juni 2026" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Waktu Main</label>
                        <input autoComplete="off" type="text" name="time" value={matchForm.time} onChange={(e) => handleInputChange(e, 'match')} placeholder="Contoh: 15:30 WIB" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stage / Tahap Kompetisi</label>
                      <input autoComplete="off" type="text" name="stage" value={matchForm.stage} onChange={(e) => handleInputChange(e, 'match')} placeholder="Contoh: Grand Finals - IRIS Cup" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Tanding</label>
                        <select name="status" value={matchForm.status} onChange={(e) => handleInputChange(e, 'match')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors">
                          <option value="Upcoming">Upcoming (Mendatang)</option>
                          <option value="Past">Past (Selesai)</option>
                        </select>
                      </div>
                      {matchForm.status === 'Past' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hasil Akhir (Result)</label>
                          <select name="result" value={matchForm.result} onChange={(e) => handleInputChange(e, 'match')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors">
                            <option value="">Pilih Hasil...</option>
                            <option value="win">Win (Menang)</option>
                            <option value="lose">Lose (Kalah)</option>
                            <option value="draw">Draw (Seri)</option>
                          </select>
                        </div>
                      )}
                    </div>
                    {matchForm.status === 'Past' && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Skor / Peringkat Akhir</label>
                        <input autoComplete="off" type="text" name="score" value={matchForm.score} onChange={(e) => handleInputChange(e, 'match')} placeholder="Contoh: 2 - 1 ATAU Rank 5 ATAU Booyah!" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Live Stream</label>
                      <input autoComplete="off" type="url" name="stream_url" value={matchForm.stream_url} onChange={(e) => handleInputChange(e, 'match')} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs font-mono" />
                    </div>
                  </div>
                )}

                {/* ================= FORM 4: ACHIEVEMENT ================= */}
                {modalType === 'achievement' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Divisi Game</label>
                      <select name="division_id" value={achievementForm.division_id} onChange={(e) => handleInputChange(e, 'achievement')} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors">
                        {divisions.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Prestasi</label>
                      <input autoComplete="off" type="text" name="title" value={achievementForm.title} onChange={(e) => handleInputChange(e, 'achievement')} placeholder="Contoh: Champion - IRIS Cup 2026" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors font-bold" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Peringkat / Medali</label>
                        <input autoComplete="off" type="text" name="rank" value={achievementForm.rank} onChange={(e) => handleInputChange(e, 'achievement')} placeholder="Contoh: 1st Place" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Badge/Emoji Peringkat</label>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={badgeUpload.handleThumbnailClick}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all"
                            title="Klik untuk memilih gambar"
                          >
                            {badgeUpload.previewUrl ? (
                              badgeUpload.previewUrl.startsWith('http') || badgeUpload.previewUrl.startsWith('blob:') ? (
                                <img src={(badgeUpload.previewUrl)?.src || (badgeUpload.previewUrl)} alt="Preview Badge" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-3xl">{badgeUpload.previewUrl}</span>
                              )
                            ) : (
                              <Plus className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-grow space-y-1">
                            <input
                              type="file"
                              ref={badgeUpload.fileInputRef}
                              accept="image/*"
                              onChange={badgeUpload.handleFileChange}
                              style={{ display: 'none' }}
                            />
                            <div className="text-xs text-slate-600 font-medium">
                              {badgeUpload.fileName ? (
                                <span className="font-semibold text-[#170C79]">{badgeUpload.fileName}</span>
                              ) : (
                                <span className="text-slate-400">Belum ada file terpilih</span>
                              )}
                            </div>
                            {badgeUpload.previewUrl && (
                              <button
                                type="button"
                                onClick={badgeUpload.handleRemove}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                Hapus Badge
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Waktu Perolehan (Bulan Tahun)</label>
                      <input autoComplete="off" type="text" name="date" value={achievementForm.date} onChange={(e) => handleInputChange(e, 'achievement')} placeholder="Contoh: Juni 2026" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Foto Prestasi</label>
                      <div className="flex items-center gap-4">
                        <div
                          onClick={photoUpload.handleThumbnailClick}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all"
                          title="Klik untuk memilih gambar"
                        >
                          {photoUpload.previewUrl ? (
                            <img src={(photoUpload.previewUrl)?.src || (photoUpload.previewUrl)} alt="Preview Photo" className="w-full h-full object-cover" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-grow space-y-1">
                          <input
                            type="file"
                            ref={photoUpload.fileInputRef}
                            accept="image/*"
                            onChange={photoUpload.handleFileChange}
                            style={{ display: 'none' }}
                          />
                          <div className="text-xs text-slate-600 font-medium">
                            {photoUpload.fileName ? (
                              <span className="font-semibold text-[#170C79]">{photoUpload.fileName}</span>
                            ) : (
                              <span className="text-slate-400">Belum ada file terpilih</span>
                            )}
                          </div>
                          {photoUpload.previewUrl && (
                            <button
                              type="button"
                              onClick={photoUpload.handleRemove}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button inside form */}
                <div className="pt-4 shrink-0 space-y-4">
                  {isUploading && (
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-[#170C79] h-2.5 rounded-full transition-all duration-300 animate-pulse" style={{ width: `${progress}%` }}></div>
                      <p className="text-[10px] text-slate-500 mt-1 text-center font-bold">Mengunggah & mengoptimalkan gambar ({progress}%)...</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-3.5 bg-[#170C79] hover:bg-[#1a0e8a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-md shadow-[#170C79]/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isUploading ? 'Sedang Mengunggah...' : (isEditMode ? 'Simpan Perubahan' : 'Tambahkan Data')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={`Hapus ${confirmDelete.type === 'division' ? 'Divisi Game' : confirmDelete.type === 'roster' ? 'Roster' : confirmDelete.type === 'match' ? 'Pertandingan' : 'Prestasi'}`}
        message={`Apakah Anda yakin ingin menghapus ${confirmDelete.displayName}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, type: null, id: null, displayName: '' })}
      />
    </div>
  );
}
