'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { joinService } from '@/services/public/joinService';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  Star,
  Info
} from 'lucide-react';

export default function JoinUsPage() {
  const [activeTab, setActiveTab] = useState('member'); // 'member' | 'admin' | 'volunteer'
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef(null);

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setIsSubmitted(false);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form states
  const [memberForm, setMemberForm] = useState({
    full_name: '',
    nickname: '',
    age: '',
    gender: 'Laki-laki',
    domicile: '',
    line_id: '',
    line_display_name: '',
    x_account: '',
    instagram_account: '',
    reasons_join: '',
    reasons_oshi: '',
    agree_rules: 'Bersedia',
    agree_active: 'Bersedia',
    agree_fees: 'Bersedia',
    feedback: ''
  });

  const [adminForm, setAdminForm] = useState({
    full_name: '',
    nickname: '',
    line_id: '',
    line_display_name: '',
    x_account: '',
    domicile: '',
    age: '',
    seriousness: '',
    other_fanbase_admin: '',
    position: 'Data Archiver',
    has_experience: 'Ada',
    portfolio_url: '',
    is_leader: 'Pernah',
    games_mastered: []
  });

  const [volunteerForm, setVolunteerForm] = useState({
    full_name: '',
    nickname: '',
    domicile: '',
    gender: 'Laki-laki',
    line_id: '',
    whatsapp_number: '',
    x_account: '',
    division: 'Divisi Acara',
    skills_experience: '',
    motivation: '',
    availability: 'Bersedia mengikuti penuh waktu',
    agree_all: false
  });

  useEffect(() => {
    let active = true;
    joinService.getJoinSettings().then((res) => {
      if (active) {
        setSettings(res);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const currentSetting = settings?.[activeTab] || {
    status: 'open',
    title: activeTab === 'member' ? 'Open Member IntaniumOFC' : (activeTab === 'admin' ? 'Recruitment Admin Intanium' : 'Open Volunteer Event'),
    description: ''
  };

  const isClosed = currentSetting.status === 'closed';

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await joinService.submitJoinApplication({
        type: 'member',
        full_name: memberForm.full_name,
        nickname: memberForm.nickname,
        age: memberForm.age,
        gender: memberForm.gender,
        domicile: memberForm.domicile,
        line_id: memberForm.line_id,
        line_display_name: memberForm.line_display_name,
        x_account: memberForm.x_account,
        instagram_account: memberForm.instagram_account,
        reasons: `Alasan Join: ${memberForm.reasons_join} | Alasan Oshi: ${memberForm.reasons_oshi} | Feedback: ${memberForm.feedback}`,
        extra_answers: {
          agree_rules: memberForm.agree_rules,
          agree_active: memberForm.agree_active,
          agree_fees: memberForm.agree_fees,
        }
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await joinService.submitJoinApplication({
        type: 'admin',
        full_name: adminForm.full_name,
        nickname: adminForm.nickname,
        line_id: adminForm.line_id,
        line_display_name: adminForm.line_display_name,
        x_account: adminForm.x_account,
        domicile: adminForm.domicile,
        age: adminForm.age,
        position_or_division: adminForm.position,
        experience: adminForm.has_experience,
        portfolio_url: adminForm.portfolio_url,
        is_leader: adminForm.is_leader,
        games_mastered: adminForm.games_mastered,
        reasons: `Keseriusan: ${adminForm.seriousness} | Admin Fanbase Lain: ${adminForm.other_fanbase_admin}`
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!volunteerForm.agree_all) return;
    setIsSubmitting(true);
    try {
      await joinService.submitJoinApplication({
        type: 'volunteer',
        full_name: volunteerForm.full_name,
        nickname: volunteerForm.nickname,
        domicile: volunteerForm.domicile,
        gender: volunteerForm.gender,
        line_id: volunteerForm.line_id,
        whatsapp_number: volunteerForm.whatsapp_number,
        x_account: volunteerForm.x_account,
        position_or_division: volunteerForm.division,
        experience: volunteerForm.skills_experience,
        reasons: volunteerForm.motivation,
        availability: volunteerForm.availability,
        agreement: volunteerForm.agree_all
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGameCheckbox = (game) => {
    setAdminForm(prev => {
      const current = prev.games_mastered || [];
      if (current.includes(game)) {
        return { ...prev, games_mastered: current.filter(g => g !== game) };
      }
      if (current.length >= 2) return prev; // max 2 games
      return { ...prev, games_mastered: [...current, game] };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0620] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-amber-300 animate-spin-slow" />
            <span>Bergabung Bersama Komunitas IRIS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-300 leading-tight mb-4"
          >
            Pilih Peranmu & Dukung Nur Intan!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-purple-200/70 font-medium leading-relaxed"
          >
            Kami membuka pintu bagi seluruh fans dan pendukung untuk menjadi anggota resmi, staf admin pengurus, maupun relawan kegiatan kebersamaan IRIS.
          </motion.p>
        </div>

        {/* 3 Interactive Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Join Member (MAIN FOCUS) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelectTab('member')}
            className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden group ${
              activeTab === 'member'
                ? 'bg-gradient-to-b from-[#1f135b] to-[#120a3a] border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] scale-[1.02]'
                : 'bg-[#150d3a]/60 border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1a1148]/80'
            }`}
          >
            {/* Main Focus Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-pink-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" />
              <span>Main Focus</span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Join Member
              </h3>
              <p className="text-xs text-purple-200/70 font-medium leading-relaxed mb-4">
                Keanggotaan resmi IRIS untuk berpartisipasi aktif dalam kegiatan harian, gathering, dan dukungan bersama.
              </p>
            </div>

            <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                settings?.member?.status === 'closed'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {settings?.member?.status === 'closed' ? <Lock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                <span>{settings?.member?.status === 'closed' ? 'Tutup' : 'Open Registration'}</span>
              </span>

              <span className={`text-xs font-bold flex items-center gap-1 transition-transform ${activeTab === 'member' ? 'text-amber-300 translate-x-1' : 'text-purple-400'}`}>
                Pilih <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Card 2: Join Admin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelectTab('admin')}
            className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden group ${
              activeTab === 'admin'
                ? 'bg-gradient-to-b from-[#1c1256] to-[#110938] border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.25)] scale-[1.02]'
                : 'bg-[#150d3a]/60 border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1a1148]/80'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Join Admin
              </h3>
              <p className="text-xs text-purple-200/70 font-medium leading-relaxed mb-4">
                Perekrutan tim pengurus internal (Data Archiver, Sosmed, Video Editor, Desain Grafis, E-Sport, & Merch).
              </p>
            </div>

            <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                settings?.admin?.status === 'closed'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {settings?.admin?.status === 'closed' ? <Lock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                <span>{settings?.admin?.status === 'closed' ? 'Tutup' : 'Open Recruitment'}</span>
              </span>

              <span className={`text-xs font-bold flex items-center gap-1 transition-transform ${activeTab === 'admin' ? 'text-purple-300 translate-x-1' : 'text-purple-400'}`}>
                Pilih <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Card 3: Join Volunteer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelectTab('volunteer')}
            className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden group ${
              activeTab === 'volunteer'
                ? 'bg-gradient-to-b from-[#1b1554] to-[#0f0a34] border-pink-400/80 shadow-[0_0_40px_rgba(236,72,153,0.25)] scale-[1.02]'
                : 'bg-[#150d3a]/60 border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1a1148]/80'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-pink-300 transition-colors">
                Join Volunteer
              </h3>
              <p className="text-xs text-purple-200/70 font-medium leading-relaxed mb-4">
                Bergabung sebagai relawan pelaksana untuk event kebersamaan, perayaan ulang tahun, dan santunan sosial.
              </p>
            </div>

            <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                settings?.volunteer?.status === 'closed'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {settings?.volunteer?.status === 'closed' ? <Lock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                <span>{settings?.volunteer?.status === 'closed' ? 'Tutup' : 'Open Volunteer'}</span>
              </span>

              <span className={`text-xs font-bold flex items-center gap-1 transition-transform ${activeTab === 'volunteer' ? 'text-pink-300 translate-x-1' : 'text-purple-400'}`}>
                Pilih <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Form Area */}
        <div ref={formRef} className="bg-[#120a33]/80 border border-purple-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden scroll-mt-28">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              <span className="text-sm font-semibold text-purple-300">Memuat formulir...</span>
            </div>
          ) : isSubmitted ? (
            /* Post-Submission Simple Confirmation View */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center max-w-xl mx-auto flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Pendaftaran Berhasil Dikirim!
              </h2>
              <p className="text-sm text-purple-200/80 font-medium leading-relaxed mb-8">
                Terima kasih telah mendaftar. Data pendaftaran Anda telah berhasil kami terima dan akan segera ditinjau oleh panitia IRIS. Mohon pastikan akun Line / sosial media Anda aktif.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-full bg-purple-600/40 border border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-600/60 font-semibold text-xs transition-all cursor-pointer"
              >
                Kirim Pendaftaran Lain
              </button>
            </motion.div>
          ) : isClosed ? (
            /* Form Closed Locked State */
            <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Pendaftaran Sedang Ditutup</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed mb-6">
                Formulir pendaftaran untuk opsi <strong className="text-white capitalize">{activeTab}</strong> saat ini sedang dikunci oleh panitia admin. Silakan pantau pengumuman resmi di sosial media IRIS untuk pembukaan batch berikutnya.
              </p>
            </div>
          ) : (
            /* Active Form Inputs */
            <div>
              <div className="mb-8 pb-6 border-b border-purple-500/20">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Info className="h-4 w-4" />
                  <span>Formulir Pendaftaran Resmi</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">
                  {currentSetting.title}
                </h2>
                {currentSetting.description && (
                  <p className="text-xs text-purple-200/70 leading-relaxed max-w-2xl">
                    {currentSetting.description}
                  </p>
                )}
              </div>

              {/* FORM 1: JOIN MEMBER */}
              {activeTab === 'member' && (
                <form onSubmit={handleMemberSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Nama Lengkap <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Pratama"
                        value={memberForm.full_name}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Nama Panggilan <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi"
                        value={memberForm.nickname}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Usia <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 20 Tahun"
                        value={memberForm.age}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Jenis Kelamin <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={memberForm.gender}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Domisili <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Jakarta Selatan"
                        value={memberForm.domicile}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, domicile: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        ID Line <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Pastikan fitur 'Tambah Teman via ID' aktif"
                        value={memberForm.line_id}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, line_id: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Display Name Line <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama tampilan di Line"
                        value={memberForm.line_display_name}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, line_display_name: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Username Akun X / Twitter <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="@username (pastikan tidak diprivate)"
                        value={memberForm.x_account}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, x_account: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Username Instagram
                      </label>
                      <input
                        type="text"
                        placeholder="@username (opsional)"
                        value={memberForm.instagram_account}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, instagram_account: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Alasan ingin bergabung di IRIS <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tuliskan motivasi & harapan Anda bergabung..."
                      value={memberForm.reasons_join}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, reasons_join: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Alasan meng-oshikan Intan <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Apa yang membuat Anda menyukai dan mendukung Nur Intan?"
                      value={memberForm.reasons_oshi}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, reasons_oshi: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Bersedia mematuhi peraturan? <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={memberForm.agree_rules}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, agree_rules: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
                      >
                        <option value="Bersedia">Bersedia</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Bersedia turut aktif meramaikan? <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={memberForm.agree_active}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, agree_active: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
                      >
                        <option value="Bersedia">Bersedia</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Bersedia iuran kas (Rp 10.000)? <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={memberForm.agree_fees}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, agree_fees: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition-all"
                      >
                        <option value="Bersedia">Bersedia</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Kritik dan saran untuk Nur Intan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Kesan, pesan hangat, atau saran dukungan..."
                      value={memberForm.feedback}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Kirim Pendaftaran Member</span>
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 2: JOIN ADMIN */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Nama Lengkap <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap"
                        value={adminForm.full_name}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Nama Panggilan <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama panggilan"
                        value={adminForm.nickname}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        ID Line <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ID Line aktif"
                        value={adminForm.line_id}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, line_id: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Display Name Line <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Display name Line"
                        value={adminForm.line_display_name}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, line_display_name: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Akun X / Twitter <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="@username X"
                        value={adminForm.x_account}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, x_account: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Domisili <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Kota / Kota Kabupaten"
                        value={adminForm.domicile}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, domicile: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Usia <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Usia Anda"
                        value={adminForm.age}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Posisi Admin yang Dilamar <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={adminForm.position}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                    >
                      <option value="Data Archiver">1. Data Archiver (Merekap data & aktivitas Intan)</option>
                      <option value="Keanggotaan dan Lapangan">2. Keanggotaan dan Lapangan (Database & event)</option>
                      <option value="Video Editor">3. Video Editor (Konten video & tren)</option>
                      <option value="Media Sosial">4. Media Sosial (Copywriting & publikasi sosmed)</option>
                      <option value="Design Grafis">5. Design Grafis (Edit poster, meme, visual)</option>
                      <option value="Illustrator">6. Illustrator (Drawing fanart & artwork)</option>
                      <option value="E-Sport Management">7. E-Sport Management (Manajemen divisi E-Sport)</option>
                      <option value="Merchandise">8. Merchandise (Konsep, riset vendor, produksi & sales)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Pengalaman di bidang tersebut <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={adminForm.has_experience}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, has_experience: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                      >
                        <option value="Ada">Ada</option>
                        <option value="Tidak ada">Tidak ada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        Portofolio (Link G-Drive)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... (Wajib untuk Editor/Desain/Illustrator)"
                        value={adminForm.portfolio_url}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, portfolio_url: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Apakah kalian benar-benar serius ingin menjadi Admin IRIS? <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Komitmen dan waktu yang siap dialokasikan..."
                      value={adminForm.seriousness}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, seriousness: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      Apakah sedang menjadi admin di fanbase lain? (Kalau iya, sebutkan) <span className="text-pink-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jawab 'Tidak ada' atau tulis nama fanbase & posisi"
                      value={adminForm.other_fanbase_admin}
                      onChange={(e) => setAdminForm(prev => ({ ...prev, other_fanbase_admin: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400 transition-all"
                    />
                  </div>

                  {/* Conditional E-Sport Questions */}
                  {adminForm.position === 'E-Sport Management' && (
                    <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-2xl space-y-4">
                      <h4 className="text-xs font-bold text-purple-300">Khusus Pendaftar E-Sport Management:</h4>
                      <div>
                        <label className="block text-xs font-bold text-purple-200 mb-2">
                          Pernah menjadi leader di suatu team?
                        </label>
                        <select
                          value={adminForm.is_leader}
                          onChange={(e) => setAdminForm(prev => ({ ...prev, is_leader: e.target.value }))}
                          className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="Pernah">Pernah</option>
                          <option value="Tidak pernah">Tidak pernah</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-purple-200 mb-2">
                          Game apa yang Anda kuasai (Maksimal 2):
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['Mobile Legend', 'Free Fire', 'PUBG/VALORANT', 'Pokemon', 'MCGG'].map((g) => (
                            <label key={g} className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(adminForm.games_mastered || []).includes(g)}
                                onChange={() => handleGameCheckbox(g)}
                                className="rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                              />
                              <span>{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Kirim Pendaftaran Admin</span>
                    </button>
                  </div>
                </form>
              )}

              {/* FORM 3: JOIN VOLUNTEER */}
              {activeTab === 'volunteer' && (
                <form onSubmit={handleVolunteerSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        NAMA LENGKAP <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama lengkap"
                        value={volunteerForm.full_name}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        NAMA PANGGILAN <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama panggilan"
                        value={volunteerForm.nickname}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        DOMISILI <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Domisili tempat tinggal"
                        value={volunteerForm.domicile}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, domicile: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        GENDER <span className="text-pink-400">*</span>
                      </label>
                      <select
                        value={volunteerForm.gender}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        ID LINE <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ID Line aktif"
                        value={volunteerForm.line_id}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, line_id: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        NO WHATSAPP <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="08123456789"
                        value={volunteerForm.whatsapp_number}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-2">
                        AKUN X/TWITTER <span className="text-pink-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="@username X"
                        value={volunteerForm.x_account}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, x_account: e.target.value }))}
                        className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      DIVISI YANG DIMINATI <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={volunteerForm.division}
                      onChange={(e) => setVolunteerForm(prev => ({ ...prev, division: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                    >
                      <option value="Divisi Acara">Divisi Acara (Rangkaian acara, rundown, games, ice breaking)</option>
                      <option value="Divisi Konsumsi">Divisi Konsumsi (Kebutuhan & porsi konsumsi acara)</option>
                      <option value="Divisi Sarana & Prasarana">Divisi Sarana & Prasarana (Logistik, barang games, koordinasi venue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      KEAHLIAN DAN PENGALAMAN YANG RELAVAN
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Cth: Public speaking, Ms. Office, dokumentasi, keahlian pendukung..."
                      value={volunteerForm.skills_experience}
                      onChange={(e) => setVolunteerForm(prev => ({ ...prev, skills_experience: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      MOTIVASI MENGIKUTI KEGIATAN <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tuliskan alasan & semangat Anda bergabung menjadi relawan event..."
                      value={volunteerForm.motivation}
                      onChange={(e) => setVolunteerForm(prev => ({ ...prev, motivation: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-2">
                      TANGGAL DAN WAKTU KETERSEDIAAN <span className="text-pink-400">*</span>
                    </label>
                    <select
                      value={volunteerForm.availability}
                      onChange={(e) => setVolunteerForm(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full bg-[#1b1248]/80 border border-purple-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-400 transition-all"
                    >
                      <option value="Bersedia mengikuti penuh waktu">Bersedia mengikuti penuh waktu</option>
                      <option value="Tidak bersedia">Tidak bersedia</option>
                      <option value="Bersedia pada hari H saja">Bersedia pada hari H saja</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 text-xs text-purple-200/90 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={volunteerForm.agree_all}
                        onChange={(e) => setVolunteerForm(prev => ({ ...prev, agree_all: e.target.checked }))}
                        className="mt-0.5 rounded border-purple-500 text-pink-500 focus:ring-pink-500"
                      />
                      <span>
                        Saya menyatakan data yang diberikan adalah benar, mengizinkan dokumentasi, serta bersedia aktif mendukung kegiatan dari pra hingga post-kegiatan. <span className="text-pink-400">*</span>
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !volunteerForm.agree_all}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span>Kirim Pendaftaran Volunteer</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
