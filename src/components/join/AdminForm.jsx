'use client';

import { useState } from 'react';
import { Send, Loader2, Info } from 'lucide-react';
import { joinService } from '@/services/public/joinService';
import { getAgeError, getLineIdError, getXAccountError } from './joinValidation';

export default function AdminForm({ settings, onSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (getAgeError(adminForm.age) || getLineIdError(adminForm.line_id) || getXAccountError(adminForm.x_account)) {
      alert('Mohon periksa kembali input form Anda. Terdapat data yang belum sesuai format.');
      return;
    }
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
      onSubmitted();
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
    <form onSubmit={handleAdminSubmit} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nama lengkap"
            value={adminForm.full_name}
            onChange={(e) => setAdminForm(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Panggilan <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nama panggilan"
            value={adminForm.nickname}
            onChange={(e) => setAdminForm(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ID Line <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="ID Line aktif"
            value={adminForm.line_id}
            onChange={(e) => setAdminForm(prev => ({ ...prev, line_id: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getLineIdError(adminForm.line_id) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getLineIdError(adminForm.line_id) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getLineIdError(adminForm.line_id)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Display Name Line <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Display name Line"
            value={adminForm.line_display_name}
            onChange={(e) => setAdminForm(prev => ({ ...prev, line_display_name: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Akun X / Twitter <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="@username X"
            value={adminForm.x_account}
            onChange={(e) => setAdminForm(prev => ({ ...prev, x_account: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getXAccountError(adminForm.x_account) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getXAccountError(adminForm.x_account) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getXAccountError(adminForm.x_account)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Domisili <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Kota / Kota Kabupaten"
            value={adminForm.domicile}
            onChange={(e) => setAdminForm(prev => ({ ...prev, domicile: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Usia <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            min="12"
            max="80"
            required
            placeholder="Contoh: 20"
            value={adminForm.age}
            onChange={(e) => setAdminForm(prev => ({ ...prev, age: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getAgeError(adminForm.age) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getAgeError(adminForm.age) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getAgeError(adminForm.age)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Posisi Admin yang Dilamar <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={adminForm.position}
          onChange={(e) => setAdminForm(prev => ({ ...prev, position: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
        >
          {(settings?.admin?.available_positions || [
            'Data Archiver',
            'Keanggotaan dan Lapangan',
            'Video Editor',
            'Media Sosial',
            'Design Grafis',
            'Illustrator',
            'E-Sport Management',
            'Merchandise'
          ]).map((pos, idx) => (
            <option key={pos} value={pos}>
              {idx + 1}. {pos}
            </option>
          ))}
          <option value="Lainnya">Lainnya (Sebutkan di Alasan)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pengalaman di bidang tersebut <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={adminForm.has_experience}
            onChange={(e) => setAdminForm(prev => ({ ...prev, has_experience: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Ada">Ada</option>
            <option value="Tidak ada">Tidak ada</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Portofolio (Link G-Drive)
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/... (Wajib untuk Editor/Desain/Illustrator)"
            value={adminForm.portfolio_url}
            onChange={(e) => setAdminForm(prev => ({ ...prev, portfolio_url: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Alasan ingin mendaftar menjadi Admin IRIS, dan alasan mengapa memilih divisi tersebut? <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          required
          rows={2}
          placeholder="Tuliskan alasan bergabung & pilihan divisi..."
          value={adminForm.seriousness}
          onChange={(e) => setAdminForm(prev => ({ ...prev, seriousness: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Apakah sedang menjadi admin di fanbase lain? (Kalau iya, sebutkan) <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Jawab 'Tidak ada' atau tulis nama fanbase & posisi"
          value={adminForm.other_fanbase_admin}
          onChange={(e) => setAdminForm(prev => ({ ...prev, other_fanbase_admin: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Conditional E-Sport Questions */}
      {adminForm.position === 'E-Sport Management' && (
        <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">Khusus Pendaftar E-Sport Management:</h4>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pernah menjadi leader di suatu team?
            </label>
            <select
              value={adminForm.is_leader}
              onChange={(e) => setAdminForm(prev => ({ ...prev, is_leader: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
            >
              <option value="Pernah">Pernah</option>
              <option value="Tidak pernah">Tidak pernah</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Game apa yang Anda kuasai (Maksimal 2):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Mobile Legend', 'Free Fire', 'PUBG/VALORANT', 'Pokemon', 'MCGG'].map((g) => (
                <label key={g} className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(adminForm.games_mastered || []).includes(g)}
                    onChange={() => handleGameCheckbox(g)}
                    className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
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
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Kirim Pendaftaran Admin</span>
        </button>
      </div>
    </form>
  );
}
