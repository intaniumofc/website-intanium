'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAdminToast } from '../../components/common/useAdminToast';
import { supabase } from '../../lib/supabaseClient';
import { useSupabaseUpload, useImageUpload } from '../../hooks/useSupabaseUpload';
import { logAdminActivity } from '../../lib/helpers';
import {
  Users,
  GitBranch,
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  UserCheck,
  Key,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { FaInstagram, FaXTwitter } from 'react-icons/fa6';

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard Utama' },
  { id: 'merchandise', label: 'Katalog Produk' },
  { id: 'categories', label: 'Kategori Produk' },
  { id: 'orders', label: 'Kelola Order Merch' },
  { id: 'about-intan', label: 'Profil Member (Intan)' },
  { id: 'shining-star', label: '#IntanShiningStar' },
  { id: 'schedule', label: 'Jadwal / Schedule' },
  { id: 'recaps', label: 'Recap & Zine' },
  { id: 'news', label: 'Berita & News' },
  { id: 'playlists', label: 'Denger Intan (Playlists)' },
  { id: 'gallery', label: 'Galeri Album' },
  { id: 'mading', label: 'Moderasi Mading' },
  { id: 'hashtags', name: 'Kelola Tagar' },
  { id: 'games', label: 'Kelola Game' },
  { id: 'esport', label: 'Kelola Esport' },
  { id: 'keanggotaan', label: 'Kelola Keanggotaan' }
];

export default function AdminMembershipPage() {
  const notify = useAdminToast();

  const { uploadFile, isUploading: isFileUploading } = useSupabaseUpload();
  const avatarUpload = useImageUpload();

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'structure' | 'admins'
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [branches, setBranches] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [members, setMembers] = useState([]);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('staff');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Modal / Editing states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState('add'); // 'add' | 'edit'
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    division_id: '',
    instagram_url: '',
    twitter_url: '',
    avatar_url: '',
    email: ''
  });

  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [divModalMode, setDivModalMode] = useState('add'); // 'add' | 'edit'
  const [editingDivId, setEditingDivId] = useState(null);
  const [divFormData, setDivFormData] = useState({
    name: '',
    branch_id: 'external'
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    role: 'staff',
    permissions: [],
    division_id: ''
  });

  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [resetPwdAdmin, setResetPwdAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Sorting states
  const [memberSortField, setMemberSortField] = useState('name');
  const [memberSortOrder, setMemberSortOrder] = useState('asc');
  const [adminSortField, setAdminSortField] = useState('username');
  const [adminSortOrder, setAdminSortOrder] = useState('asc');

  // Pagination states
  const [memberCurrentPage, setMemberCurrentPage] = useState(0);
  const [memberRowsPerPage, setMemberRowsPerPage] = useState(10);
  const [adminCurrentPage, setAdminCurrentPage] = useState(0);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);

  // Confirm delete states
  const [confirmDeleteMember, setConfirmDeleteMember] = useState({ isOpen: false, id: null, name: '' });
  const [confirmDeleteDiv, setConfirmDeleteDiv] = useState({ isOpen: false, id: null, name: '' });

  const canManage = currentUserRole === 'super_admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch current user session to determine viewing/editing permissions
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserEmail(session.user.email || '');
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setCurrentUserRole(profile.role);
        }
      }

      const { data: bData } = await supabase.from('org_branches').select('*').order('id');
      const { data: dData } = await supabase.from('org_divisions').select('*').order('name');
      const { data: mData } = await supabase.from('org_members').select('*').order('name');
      const { data: aData } = await supabase.from('admin_profiles').select('*').order('username');

      setBranches(bData || []);
      setDivisions(dData || []);
      setMembers(mData || []);
      setAdminProfiles(aData || []);
    } catch (err) {
      console.error(err);
      notify.error('Gagal memuat data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // MEMBER HANDLERS
  // ==========================================
  const handleOpenAddMember = () => {
    setMemberModalMode('add');
    setEditingMemberId(null);
    setMemberFormData({
      name: '',
      division_id: divisions[0]?.id || '',
      instagram_url: '',
      twitter_url: '',
      avatar_url: '',
      email: ''
    });
    avatarUpload.setInitialValue(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setMemberModalMode('edit');
    setEditingMemberId(member.id);
    setMemberFormData({
      name: member.name,
      division_id: member.division_id,
      instagram_url: member.instagram_url || '',
      twitter_url: member.twitter_url || '',
      avatar_url: member.avatar_url || '',
      email: member.email || ''
    });
    avatarUpload.setInitialValue(member.avatar_url);
    setIsMemberModalOpen(true);
  };

  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setMemberFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!memberFormData.name.trim() || !memberFormData.division_id) {
      notify.warning('Periksa data', 'Nama dan divisi harus diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      let currentAvatarUrl = memberFormData.avatar_url;
      if (avatarUpload.file) {
        currentAvatarUrl = await uploadFile(avatarUpload.file, 'assets', 'members');
      }

      const payload = {
        name: memberFormData.name.trim(),
        division_id: parseInt(memberFormData.division_id, 10),
        instagram_url: memberFormData.instagram_url.trim() || null,
        twitter_url: memberFormData.twitter_url.trim() || null,
        avatar_url: currentAvatarUrl || null,
        email: memberFormData.email?.trim() || null
      };

      let error;
      if (memberModalMode === 'add') {
        const { error: err } = await supabase.from('org_members').insert([payload]);
        error = err;
      } else {
        const { error: err } = await supabase.from('org_members').update(payload).eq('id', editingMemberId);
        error = err;
      }

      if (error) throw error;

      await logAdminActivity(
        memberModalMode === 'add'
          ? `Menambahkan anggota baru: ${payload.name}`
          : `Memperbarui data anggota: ${payload.name}`
      );

      notify.success(
        memberModalMode === 'add' ? 'Anggota Ditambahkan' : 'Anggota Diperbarui',
        `Data anggota ${payload.name} berhasil disimpan.`
      );
      setIsMemberModalOpen(false);
      avatarUpload.setInitialValue(null);
      fetchData();
    } catch (err) {
      notify.error('Gagal menyimpan anggota', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemberClick = (member) => {
    setConfirmDeleteMember({ isOpen: true, id: member.id, name: member.name });
  };

  const handleConfirmDeleteMember = async () => {
    const { id, name } = confirmDeleteMember;
    setConfirmDeleteMember({ isOpen: false, id: null, name: '' });
    try {
      const { error } = await supabase.from('org_members').delete().eq('id', id);
      if (error) throw error;
      await logAdminActivity(`Menghapus anggota: ${name}`);
      notify.success('Anggota Dihapus', `Data anggota ${name} berhasil dihapus.`);
      fetchData();
    } catch (err) {
      notify.error('Gagal menghapus anggota', err.message);
    }
  };

  // ==========================================
  // DIVISION HANDLERS
  // ==========================================
  const handleOpenAddDiv = () => {
    setDivModalMode('add');
    setEditingDivId(null);
    setDivFormData({
      name: '',
      branch_id: 'external'
    });
    setIsDivModalOpen(true);
  };

  const handleOpenEditDiv = (div) => {
    setDivModalMode('edit');
    setEditingDivId(div.id);
    setDivFormData({
      name: div.name,
      branch_id: div.branch_id
    });
    setIsDivModalOpen(true);
  };

  const handleDivInputChange = (e) => {
    const { name, value } = e.target;
    setDivFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDiv = async (e) => {
    e.preventDefault();
    if (!divFormData.name.trim() || !divFormData.branch_id) {
      notify.warning('Periksa data', 'Nama divisi dan cabang harus diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: divFormData.name.trim(),
        branch_id: divFormData.branch_id
      };

      let error;
      if (divModalMode === 'add') {
        const { error: err } = await supabase.from('org_divisions').insert([payload]);
        error = err;
      } else {
        const { error: err } = await supabase.from('org_divisions').update(payload).eq('id', editingDivId);
        error = err;
      }

      if (error) throw error;

      await logAdminActivity(
        divModalMode === 'add'
          ? `Menambahkan divisi baru: ${payload.name}`
          : `Memperbarui divisi: ${payload.name}`
      );

      notify.success(
        divModalMode === 'add' ? 'Divisi Ditambahkan' : 'Divisi Diperbarui',
        `Divisi ${payload.name} berhasil disimpan.`
      );
      setIsDivModalOpen(false);
      fetchData();
    } catch (err) {
      notify.error('Gagal menyimpan divisi', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDivClick = (div) => {
    setConfirmDeleteDiv({ isOpen: true, id: div.id, name: div.name });
  };

  const handleConfirmDeleteDiv = async () => {
    const { id, name } = confirmDeleteDiv;
    setConfirmDeleteDiv({ isOpen: false, id: null, name: '' });
    try {
      const { error } = await supabase.from('org_divisions').delete().eq('id', id);
      if (error) throw error;
      await logAdminActivity(`Menghapus divisi: ${name}`);
      notify.success('Divisi Dihapus', `Divisi ${name} beserta seluruh anggotanya berhasil dihapus.`);
      fetchData();
    } catch (err) {
      notify.error('Gagal menghapus divisi', err.message);
    }
  };

  // ==========================================
  // ADMIN PROFILE HANDLERS (Otorisasi & Permissions)
  // ==========================================
  const handleOpenEditAdmin = (profile) => {
    setEditingAdminId(profile.id);
    setAdminFormData({
      username: profile.username,
      role: profile.role,
      permissions: profile.permissions || [],
      division_id: profile.division_id || ''
    });
    setIsAdminModalOpen(true);
  };

  const handleAdminRoleChange = (e) => {
    const role = e.target.value;
    // Auto populate permissions for super_admin to have everything
    let newPermissions = [...adminFormData.permissions];
    if (role === 'super_admin') {
      newPermissions = AVAILABLE_PERMISSIONS.map(p => p.id);
    }
    setAdminFormData(prev => ({ ...prev, role, permissions: newPermissions }));
  };

  const handlePermissionCheckboxChange = (permId, checked) => {
    setAdminFormData(prev => {
      let updatedPerms = [...prev.permissions];
      if (checked) {
        if (!updatedPerms.includes(permId)) updatedPerms.push(permId);
      } else {
        updatedPerms = updatedPerms.filter(id => id !== permId);
      }
      return { ...prev, permissions: updatedPerms };
    });
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        role: adminFormData.role,
        permissions: adminFormData.permissions,
        division_id: adminFormData.division_id ? parseInt(adminFormData.division_id, 10) : null
      };

      const { error } = await supabase.from('admin_profiles').update(payload).eq('id', editingAdminId);
      if (error) throw error;

      await logAdminActivity(`Memperbarui hak akses admin: ${adminFormData.username}`);

      notify.success('Profil Admin Diperbarui', `Hak akses untuk admin ${adminFormData.username} berhasil disimpan.`);
      setIsAdminModalOpen(false);
      fetchData();
    } catch (err) {
      notify.error('Gagal menyimpan profil admin', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenResetPassword = (profile) => {
    setResetPwdAdmin(profile);
    setNewPassword('');
    setIsResetPwdModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify.warning('Kata Sandi Terlalu Pendek', 'Password minimal terdiri dari 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('admin_reset_staff_password', {
        target_user_id: resetPwdAdmin.id,
        new_password: newPassword
      });

      if (error) throw error;

      await logAdminActivity(`Mengganti password admin: ${resetPwdAdmin.username}`);

      notify.success('Password Diperbarui', `Password untuk akun ${resetPwdAdmin.username} berhasil diganti.`);
      setIsResetPwdModalOpen(false);
    } catch (err) {
      notify.error('Gagal mengganti password', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers
  const getDivisionName = (divId) => {
    const div = divisions.find(d => d.id === divId);
    return div ? div.name : '-';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : '-';
  };

  const canEditMember = (member) => {
    if (canManage) return true;
    return member.email && currentUserEmail && member.email.toLowerCase() === currentUserEmail.toLowerCase();
  };

  const handleMemberSort = (field) => {
    if (memberSortField === field) {
      setMemberSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setMemberSortField(field);
      setMemberSortOrder('asc');
    }
    setMemberCurrentPage(0);
  };

  const handleAdminSort = (field) => {
    if (adminSortField === field) {
      setAdminSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAdminSortField(field);
      setAdminSortOrder('asc');
    }
    setAdminCurrentPage(0);
  };

  const sortedAndFilteredMembers = React.useMemo(() => {
    const filtered = members.filter(member => {
      const divName = getDivisionName(member.division_id).toLowerCase();
      const nameMatch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
      const usernameMatch = member.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const divMatch = divName.includes(searchQuery.toLowerCase());
      return nameMatch || usernameMatch || divMatch;
    });

    if (!memberSortField) return filtered;

    return [...filtered].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (memberSortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (memberSortField === 'username') {
        valA = (a.username || '').toLowerCase();
        valB = (b.username || '').toLowerCase();
      } else if (memberSortField === 'division') {
        valA = getDivisionName(a.division_id).toLowerCase();
        valB = getDivisionName(b.division_id).toLowerCase();
      }

      if (valA < valB) return memberSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return memberSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, searchQuery, memberSortField, memberSortOrder, divisions]);

  const paginatedMembers = React.useMemo(() => {
    const startIndex = memberCurrentPage * memberRowsPerPage;
    return sortedAndFilteredMembers.slice(startIndex, startIndex + memberRowsPerPage);
  }, [sortedAndFilteredMembers, memberCurrentPage, memberRowsPerPage]);

  const sortedAndFilteredAdmins = React.useMemo(() => {
    const filtered = adminProfiles.filter(profile => {
      const usernameMatch = profile.username.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = profile.role.toLowerCase().includes(searchQuery.toLowerCase());
      const divName = getDivisionName(profile.division_id).toLowerCase();
      const divMatch = divName.includes(searchQuery.toLowerCase());
      return usernameMatch || roleMatch || divMatch;
    });

    if (!adminSortField) return filtered;

    return [...filtered].sort((a, b) => {
      let valA = '';
      let valB = '';

      if (adminSortField === 'username') {
        valA = a.username.toLowerCase();
        valB = b.username.toLowerCase();
      } else if (adminSortField === 'role') {
        valA = a.role.toLowerCase();
        valB = b.role.toLowerCase();
      } else if (adminSortField === 'division') {
        valA = getDivisionName(a.division_id).toLowerCase();
        valB = getDivisionName(b.division_id).toLowerCase();
      }

      if (valA < valB) return adminSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return adminSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [adminProfiles, searchQuery, adminSortField, adminSortOrder, divisions]);

  const paginatedAdmins = React.useMemo(() => {
    const startIndex = adminCurrentPage * adminRowsPerPage;
    return sortedAndFilteredAdmins.slice(startIndex, startIndex + adminRowsPerPage);
  }, [sortedAndFilteredAdmins, adminCurrentPage, adminRowsPerPage]);

  return (
    <div className="space-y-6 select-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-[#170C79] shrink-0" /> Kelola Keanggotaan & Role
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola struktur pengurus fanbase INTANIUM, edit detail profil media sosial anggota, serta atur izin akses (permissions) staff admin.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'members' && canManage && (
            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddMember}>
              <Plus className="h-4 w-4" /> Tambah Anggota
            </Button>
          )}
          {activeTab === 'structure' && canManage && (
            <Button variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md cursor-pointer text-xs" onClick={handleOpenAddDiv}>
              <Plus className="h-4 w-4" /> Tambah Divisi
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-1">
        <button
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'members' ? 'border-[#170C79] text-[#170C79]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => { setActiveTab('members'); setSearchQuery(''); setMemberCurrentPage(0); }}
        >
          Daftar Anggota Pengurus
        </button>
        <button
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'structure' ? 'border-[#170C79] text-[#170C79]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => { setActiveTab('structure'); setSearchQuery(''); }}
        >
          Divisi & Cabang Organisasi
        </button>
        <button
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'admins' ? 'border-[#170C79] text-[#170C79]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => { setActiveTab('admins'); setSearchQuery(''); setAdminCurrentPage(0); }}
        >
          Hak Akses & Staff Admin
        </button>
      </div>

      {/* =========================================================
          TAB 1: MEMBERS LIST
          ========================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4 text-left">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-80 shadow-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="memberSearch"
              autoComplete="off"
              placeholder="Cari nama, username, divisi…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setMemberCurrentPage(0); }}
              className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-slate-800 placeholder-slate-400 text-xs"
            />
          </div>

          <Card hoverEffect={false} className="border border-slate-200 bg-white overflow-hidden rounded-2xl shadow-xs" padding="none">
            {isLoading ? (
              <div className="p-12"><Loading message="Memuat daftar anggota…" /></div>
            ) : (
              <div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                      <tr>
                        <th className="px-6 py-4 w-16">Foto</th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleMemberSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Nama
                            {memberSortField === 'name' ? (
                              memberSortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#170C79]" /> : <ArrowDown className="h-3 w-3 text-[#170C79]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleMemberSort('division')}
                        >
                          <div className="flex items-center gap-1">
                            Divisi (Cabang)
                            {memberSortField === 'division' ? (
                              memberSortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#170C79]" /> : <ArrowDown className="h-3 w-3 text-[#170C79]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4">Social Media</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedMembers.map(member => (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.avatar_url ? (
                              <img
                                src={(member.avatar_url)?.src || (member.avatar_url)}
                                alt={member.name}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                            <div>{getDivisionName(member.division_id)}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              ({getBranchName(divisions.find(d => d.id === member.division_id)?.branch_id)})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {member.instagram_url ? (
                                <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-pink-50 border border-pink-100 text-pink-600 hover:scale-105 transition-transform" title="Instagram">
                                  <FaInstagram className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="p-1 text-slate-300" title="Tidak ada Instagram"><FaInstagram className="h-4 w-4" /></span>
                              )}
                              {member.twitter_url ? (
                                <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 hover:scale-105 transition-transform" title="Twitter / X">
                                  <FaXTwitter className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="p-1 text-slate-300" title="Tidak ada X/Twitter"><FaXTwitter className="h-4 w-4" /></span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            <div className="flex items-center justify-end gap-2">
                              {canEditMember(member) && (
                                <button
                                  onClick={() => handleOpenEditMember(member)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                                  title={canManage ? "Ubah Anggota" : "Ubah Profil Saya"}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {canManage && (
                                <button
                                  onClick={() => handleDeleteMemberClick(member)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Anggota"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedMembers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                            Belum ada anggota pengurus terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {paginatedMembers.map(member => (
                    <div key={member.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={(member.avatar_url)?.src || (member.avatar_url)}
                            alt={member.name}
                            className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-sm truncate">{member.name}</span>
                          <span className="text-xs font-semibold text-slate-600 truncate mt-0.5">{getDivisionName(member.division_id)}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">({getBranchName(divisions.find(d => d.id === member.division_id)?.branch_id)})</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                        <div className="flex gap-2">
                          {member.instagram_url ? (
                            <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-pink-50 border border-pink-100 text-pink-600 hover:bg-pink-100 transition-colors" title="Instagram">
                              <FaInstagram className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="p-1.5 text-slate-300" title="Tidak ada Instagram"><FaInstagram className="h-4 w-4" /></span>
                          )}
                          {member.twitter_url ? (
                            <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors" title="Twitter / X">
                              <FaXTwitter className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="p-1.5 text-slate-300" title="Tidak ada X/Twitter"><FaXTwitter className="h-4 w-4" /></span>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          {canEditMember(member) && (
                            <button
                              onClick={() => handleOpenEditMember(member)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => handleDeleteMemberClick(member)}
                              className="p-1.5 text-red-500 bg-red-50 border border-red-100 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {paginatedMembers.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400 text-sm">
                      Belum ada anggota pengurus terdaftar.
                    </div>
                  )}
                </div>
              </div>
            )}
            {!isLoading && sortedAndFilteredMembers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <span>Baris per halaman:</span>
                  <select
                    value={memberRowsPerPage}
                    onChange={(e) => {
                      setMemberRowsPerPage(Number(e.target.value));
                      setMemberCurrentPage(0);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#170C79]/15"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span>
                    {memberCurrentPage * memberRowsPerPage + 1} - {Math.min((memberCurrentPage + 1) * memberRowsPerPage, sortedAndFilteredMembers.length)} dari {sortedAndFilteredMembers.length}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMemberCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={memberCurrentPage === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                    </button>

                    {Array.from({ length: Math.ceil(sortedAndFilteredMembers.length / memberRowsPerPage) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMemberCurrentPage(i)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${memberCurrentPage === i
                          ? 'bg-[#170C79] text-white'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setMemberCurrentPage(prev => Math.min(Math.ceil(sortedAndFilteredMembers.length / memberRowsPerPage) - 1, prev + 1))}
                      disabled={memberCurrentPage >= Math.ceil(sortedAndFilteredMembers.length / memberRowsPerPage) - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================
          TAB 2: DIVISIONS & BRANCHES
          ========================================================= */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {isLoading ? (
            <div className="col-span-3 p-12"><Loading message="Memuat divisi..." /></div>
          ) : (
            branches.map(branch => {
              const branchDivs = divisions.filter(d => d.branch_id === branch.id);

              return (
                <div key={branch.id} className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Koordinator: {branch.coordinator}</span>
                    <h3 className="font-extrabold text-sm text-[#170C79] mt-1">{branch.name}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1.5">{branch.description}</p>
                  </div>

                  <div className="space-y-2.5">
                    {branchDivs.map(div => {
                      const memberCount = members.filter(m => m.division_id === div.id).length;
                      return (
                        <div key={div.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#170C79]/30 transition-colors shadow-xs">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800">{div.name}</h4>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 block">{memberCount} Anggota</span>
                          </div>
                          {canManage && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenEditDiv(div)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                title="Ubah Divisi"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDivClick(div)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Hapus Divisi"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {branchDivs.length === 0 && (
                      <p className="text-center text-slate-400 text-xs py-4 border border-dashed border-slate-200 rounded-2xl">Belum ada divisi.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: ADMIN ACCESS & STAFF PROFILE
          ========================================================= */}
      {activeTab === 'admins' && (
        <div className="space-y-4 text-left">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700 flex items-start gap-2.5 leading-relaxed font-semibold">
            <ShieldAlert className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">Informasi Otorisasi Keamanan</p>
              <p className="mt-1 font-medium text-blue-600/80">
                Pemetaan hak akses (permissions) ini menentukan fitur mana saja yang dapat dimodifikasi oleh admin. Menampilkan menu di sidebar tetap terjadi untuk transparansi, namun interaksi simpan/edit/akses halaman akan dibatasi sesuai izin di bawah ini.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-80 shadow-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="adminSearch"
              autoComplete="off"
              placeholder="Cari ID, role, divisi…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setAdminCurrentPage(0); }}
              className="bg-transparent border-none focus:outline-none focus:ring-0 flex-1 text-slate-800 placeholder-slate-400 text-xs"
            />
          </div>

          <Card hoverEffect={false} className="border border-slate-200 bg-white overflow-hidden rounded-2xl shadow-xs" padding="none">
            {isLoading ? (
              <div className="p-12"><Loading message="Memuat staff admin…" /></div>
            ) : (
              <div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200 select-none">
                      <tr>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleAdminSort('username')}
                        >
                          <div className="flex items-center gap-1">
                            Username (ID)
                            {adminSortField === 'username' ? (
                              adminSortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#170C79]" /> : <ArrowDown className="h-3 w-3 text-[#170C79]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleAdminSort('role')}
                        >
                          <div className="flex items-center gap-1">
                            Role Sistem
                            {adminSortField === 'role' ? (
                              adminSortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#170C79]" /> : <ArrowDown className="h-3 w-3 text-[#170C79]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => handleAdminSort('division')}
                        >
                          <div className="flex items-center gap-1">
                            Mengelola Divisi
                            {adminSortField === 'division' ? (
                              adminSortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-[#170C79]" /> : <ArrowDown className="h-3 w-3 text-[#170C79]" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4">Menu Hak Akses</th>
                        {canManage && <th className="px-6 py-4 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAdmins.map(profile => (
                        <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="h-4.5 w-4.5 text-slate-400" /> {profile.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                            {profile.role === 'super_admin' ? (
                              <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                                <Shield className="h-3.5 w-3.5 fill-red-100" /> Super Admin
                              </span>
                            ) : profile.role === 'coordinator' ? (
                              <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                Koordinator
                              </span>
                            ) : (
                              <span className="text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                Staff Admin
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                            {profile.division_id ? getDivisionName(profile.division_id) : <span className="text-slate-400 italic">Umum / Semua</span>}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium max-w-xs">
                            {profile.role === 'super_admin' ? (
                              <span className="text-red-600 font-bold">Semua Akses (Super Admin)</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {profile.permissions?.map(p => (
                                  <span key={p} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold border border-slate-200/40 text-[10px]">
                                    {AVAILABLE_PERMISSIONS.find(item => item.id === p)?.label || p}
                                  </span>
                                ))}
                                {(!profile.permissions || profile.permissions.length === 0) && (
                                  <span className="text-slate-400 italic text-[11px]">Tidak ada akses</span>
                                )}
                              </div>
                            )}
                          </td>
                          {canManage && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditAdmin(profile)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg transition-colors cursor-pointer"
                                  title="Ubah Hak Akses Admin"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenResetPassword(profile)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-colors cursor-pointer"
                                  title="Ganti Password Staff"
                                >
                                  <Key className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {paginatedAdmins.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                            Tidak ada data staff admin ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {paginatedAdmins.map(profile => (
                    <div key={profile.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserCheck className="h-5 w-5 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-800 text-sm truncate">{profile.username}</span>
                        </div>
                        <div className="shrink-0 ml-2">
                          {profile.role === 'super_admin' ? (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              <Shield className="h-3 w-3 fill-red-100" /> Super Admin
                            </span>
                          ) : profile.role === 'coordinator' ? (
                            <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              Koordinator
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              Staff Admin
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mengelola Divisi</div>
                        <div className="text-sm font-semibold text-slate-700">
                          {profile.division_id ? getDivisionName(profile.division_id) : <span className="text-slate-400 italic">Umum / Semua</span>}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Menu Hak Akses</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.role === 'super_admin' ? (
                            <span className="text-red-600 font-bold text-xs">Semua Akses (Super Admin)</span>
                          ) : (
                            <>
                              {profile.permissions?.map(p => (
                                <span key={p} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold border border-slate-200/40 text-[10px]">
                                  {AVAILABLE_PERMISSIONS.find(item => item.id === p)?.label || p}
                                </span>
                              ))}
                              {(!profile.permissions || profile.permissions.length === 0) && (
                                <span className="text-slate-400 italic text-[11px]">Tidak ada akses</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
                          <button
                            onClick={() => handleOpenEditAdmin(profile)}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit Akses
                          </button>
                          <button
                            onClick={() => handleOpenResetPassword(profile)}
                            className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Key className="h-3.5 w-3.5" /> Reset Password
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {paginatedAdmins.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400 text-sm">
                      Tidak ada data staff admin ditemukan.
                    </div>
                  )}
                </div>
              </div>
            )}
            {!isLoading && sortedAndFilteredAdmins.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <span>Baris per halaman:</span>
                  <select
                    value={adminRowsPerPage}
                    onChange={(e) => {
                      setAdminRowsPerPage(Number(e.target.value));
                      setAdminCurrentPage(0);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#170C79]/15"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span>
                    {adminCurrentPage * adminRowsPerPage + 1} - {Math.min((adminCurrentPage + 1) * adminRowsPerPage, sortedAndFilteredAdmins.length)} dari {sortedAndFilteredAdmins.length}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAdminCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={adminCurrentPage === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                    </button>

                    {Array.from({ length: Math.ceil(sortedAndFilteredAdmins.length / adminRowsPerPage) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setAdminCurrentPage(i)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${adminCurrentPage === i
                          ? 'bg-[#170C79] text-white'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setAdminCurrentPage(prev => Math.min(Math.ceil(sortedAndFilteredAdmins.length / adminRowsPerPage) - 1, prev + 1))}
                      disabled={adminCurrentPage >= Math.ceil(sortedAndFilteredAdmins.length / adminRowsPerPage) - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================
          MEMBER FORM MODAL
          ========================================================= */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => { setIsMemberModalOpen(false); avatarUpload.setInitialValue(null); }}
        title={memberModalMode === 'add' ? 'Tambah Anggota Baru' : (canManage ? 'Ubah Detail Anggota' : 'Ubah Profil Saya')}
        size="md"
      >
        <form onSubmit={handleSubmitMember} className="space-y-4 text-sm text-slate-700 text-left">

          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            {/* Foto Profil Upload Widget */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
              <label className="font-bold text-xs uppercase text-slate-500">Foto Profil</label>
              <div
                onClick={avatarUpload.handleThumbnailClick}
                className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 hover:border-[#170C79] bg-slate-50 hover:bg-slate-100/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all relative group shadow-sm"
                title="Klik untuk mengunggah foto profil"
              >
                {avatarUpload.previewUrl ? (
                  <>
                    <img src={(avatarUpload.previewUrl)?.src || (avatarUpload.previewUrl)} alt="Preview Foto" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      Ubah Foto
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Plus className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-bold">Unggah</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={avatarUpload.fileInputRef}
                accept="image/*"
                onChange={avatarUpload.handleFileChange}
                style={{ display: 'none' }}
              />
              {avatarUpload.previewUrl && (
                <button
                  type="button"
                  onClick={avatarUpload.handleRemove}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer mt-1"
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Nama & Divisi */}
            <div className="flex-grow w-full space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-xs uppercase text-slate-500">Nama Lengkap / Panggilan</label>
                <input
                  type="text"
                  name="name"
                  autoComplete="off"
                  placeholder="Misal: Ivan"
                  value={memberFormData.name}
                  onChange={handleMemberInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                  disabled={!canManage}
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="font-bold text-xs uppercase text-slate-500">Divisi Organisasi</label>
                <select
                  name="division_id"
                  value={memberFormData.division_id}
                  onChange={handleMemberInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] font-semibold text-xs text-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                  disabled={!canManage}
                >
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name} ({getBranchName(div.branch_id)})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase text-slate-500 flex items-center gap-1 text-pink-600">
                Instagram
              </label>
              <input
                type="url"
                name="instagram_url"
                autoComplete="off"
                placeholder="https://instagram.com/username"
                value={memberFormData.instagram_url}
                onChange={handleMemberInputChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase text-slate-500 flex items-center gap-1 text-slate-800">
                Twitter
              </label>
              <input
                type="url"
                name="twitter_url"
                autoComplete="off"
                placeholder="https://x.com/username"
                value={memberFormData.twitter_url}
                onChange={handleMemberInputChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs"
              />
            </div>
          </div>

          {canManage && (
            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
              <label className="font-bold text-xs uppercase text-slate-500">Email Akun Admin</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                placeholder="misal: Casimira@intanium.admin"
                value={memberFormData.email}
                onChange={handleMemberInputChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setIsMemberModalOpen(false); avatarUpload.setInitialValue(null); }}
              disabled={isSubmitting || isFileUploading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isFileUploading}
              className="cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan…' : isFileUploading ? 'Mengunggah Foto…' : 'Simpan Anggota'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          DIVISION FORM MODAL
          ========================================================= */}
      <Modal
        isOpen={isDivModalOpen}
        onClose={() => setIsDivModalOpen(false)}
        title={divModalMode === 'add' ? 'Tambah Divisi Baru' : 'Ubah Nama Divisi'}
        size="sm"
      >
        <form onSubmit={handleSubmitDiv} className="space-y-4 text-sm text-slate-700 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase text-slate-500">Nama Divisi</label>
            <input
              type="text"
              name="name"
              autoComplete="off"
              placeholder="Misal: Humas"
              value={divFormData.name}
              onChange={handleDivInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase text-slate-500">Cabang Organisasi</label>
            <select
              name="branch_id"
              value={divFormData.branch_id}
              onChange={handleDivInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] font-semibold text-xs text-slate-700 transition-colors"
              required
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDivModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Menyimpan…' : 'Simpan Divisi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          ADMIN SETTINGS FORM MODAL
          ========================================================= */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title={`Ubah Hak Akses & Peran Admin`}
        size="md"
      >
        <form onSubmit={handleSubmitAdmin} className="space-y-4 text-sm text-slate-700 text-left">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-400 font-bold block">Username Admin</span>
            <span className="text-slate-800 font-extrabold text-sm block mt-0.5">{adminFormData.username}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase text-slate-500">Peran / Role Sistem</label>
              <select
                name="role"
                value={adminFormData.role}
                onChange={handleAdminRoleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] font-bold text-xs text-slate-700 transition-colors"
                required
              >
                <option value="staff">Staff Admin</option>
                <option value="coordinator">Koordinator Cabang</option>
                <option value="super_admin">Super Admin (IT Support)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-xs uppercase text-slate-500">Penanggung Jawab Divisi</label>
              <select
                name="division_id"
                value={adminFormData.division_id}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, division_id: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] font-semibold text-xs text-slate-700 transition-colors"
              >
                <option value="">Umum / Tidak Ada</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions Area */}
          <div className="border-t border-slate-100 pt-3">
            <label className="font-bold text-xs uppercase text-slate-500 block mb-2">Halaman Yang Boleh Dikelola</label>

            {adminFormData.role === 'super_admin' ? (
              <p className="text-xs text-red-500 font-bold p-3 bg-red-50/50 rounded-xl border border-red-100">
                Super Admin otomatis memiliki izin penuh untuk mengelola semua halaman dan rute di website admin.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 border border-slate-200/60 p-3 rounded-xl bg-slate-50/20 custom-scrollbar">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isChecked = adminFormData.permissions.includes(perm.id);
                  return (
                    <label key={perm.id} className="flex items-center gap-2 py-1 px-1 text-xs font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handlePermissionCheckboxChange(perm.id, e.target.checked)}
                        className="rounded border-slate-300 text-[#170C79] focus:ring-[#170C79]/15"
                      />
                      <span className={isChecked ? 'text-slate-800 font-bold' : 'text-slate-500'}>
                        {perm.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAdminModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Menyimpan…' : 'Simpan Izin'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================
          RESET PASSWORD MODAL (IT Support only)
          ========================================================= */}
      <Modal
        isOpen={isResetPwdModalOpen}
        onClose={() => setIsResetPwdModalOpen(false)}
        title="Ganti Password Akun Staff"
        size="sm"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-sm text-slate-700 text-left">
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold leading-relaxed">
            Tindakan ini akan langsung mengubah password untuk akun staff <strong>{resetPwdAdmin?.username}</strong>. Harap informasikan password baru ini kepada staff yang bersangkutan setelah selesai.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-xs uppercase text-slate-500">Password Baru</label>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="Masukkan password baru (min 6 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors"
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsResetPwdModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? 'Mengganti…' : 'Ganti Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm deletion dialogs */}
      <ConfirmDialog
        isOpen={confirmDeleteMember.isOpen}
        onClose={() => setConfirmDeleteMember({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDeleteMember}
        title="Hapus Anggota"
        message={`Apakah Anda yakin ingin menghapus data anggota ${confirmDeleteMember.name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmDialog
        isOpen={confirmDeleteDiv.isOpen}
        onClose={() => setConfirmDeleteDiv({ isOpen: false, id: null, name: '' })}
        onConfirm={handleConfirmDeleteDiv}
        title="Hapus Divisi"
        message={`Apakah Anda yakin ingin menghapus divisi ${confirmDeleteDiv.name}? Menghapus divisi juga akan menghapus seluruh data anggota di dalam divisi ini.`}
        confirmText="Hapus"
        cancelText="Batal"
      />

    </div>
  );
}
