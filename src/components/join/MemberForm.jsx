'use client';

import { useState } from 'react';
import { Send, Loader2, Info } from 'lucide-react';
import { joinService } from '@/services/public/joinService';
import { getAgeError, getLineIdError, getXAccountError } from './joinValidation';

export default function MemberForm({ onSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (getAgeError(memberForm.age) || getLineIdError(memberForm.line_id) || getXAccountError(memberForm.x_account)) {
      alert('Mohon periksa kembali input form Anda. Terdapat data yang belum sesuai format.');
      return;
    }
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
      onSubmitted();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleMemberSubmit} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Budi Pratama"
            value={memberForm.full_name}
            onChange={(e) => setMemberForm(prev => ({ ...prev, full_name: e.target.value }))}
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
            placeholder="Contoh: Budi"
            value={memberForm.nickname}
            onChange={(e) => setMemberForm(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            value={memberForm.age}
            onChange={(e) => setMemberForm(prev => ({ ...prev, age: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getAgeError(memberForm.age) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getAgeError(memberForm.age) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getAgeError(memberForm.age)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Jenis Kelamin <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={memberForm.gender}
            onChange={(e) => setMemberForm(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Domisili <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Jakarta Selatan"
            value={memberForm.domicile}
            onChange={(e) => setMemberForm(prev => ({ ...prev, domicile: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ID Line <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Pastikan fitur 'Tambah Teman via ID' aktif"
            value={memberForm.line_id}
            onChange={(e) => setMemberForm(prev => ({ ...prev, line_id: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getLineIdError(memberForm.line_id) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getLineIdError(memberForm.line_id) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getLineIdError(memberForm.line_id)}
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
            placeholder="Nama tampilan di Line"
            value={memberForm.line_display_name}
            onChange={(e) => setMemberForm(prev => ({ ...prev, line_display_name: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Username Akun X / Twitter <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="@username (pastikan tidak diprivate)"
            value={memberForm.x_account}
            onChange={(e) => setMemberForm(prev => ({ ...prev, x_account: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getXAccountError(memberForm.x_account) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getXAccountError(memberForm.x_account) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getXAccountError(memberForm.x_account)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Username Instagram
          </label>
          <input
            type="text"
            placeholder="@username (opsional)"
            value={memberForm.instagram_account}
            onChange={(e) => setMemberForm(prev => ({ ...prev, instagram_account: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Alasan ingin bergabung di IRIS <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Tuliskan motivasi & harapan Anda bergabung..."
          value={memberForm.reasons_join}
          onChange={(e) => setMemberForm(prev => ({ ...prev, reasons_join: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Alasan meng-oshikan Intan <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Apa yang membuat Anda menyukai dan mendukung Nur Intan?"
          value={memberForm.reasons_oshi}
          onChange={(e) => setMemberForm(prev => ({ ...prev, reasons_oshi: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Bersedia mematuhi peraturan? <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={memberForm.agree_rules}
            onChange={(e) => setMemberForm(prev => ({ ...prev, agree_rules: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Bersedia">Bersedia</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Bersedia turut aktif meramaikan? <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={memberForm.agree_active}
            onChange={(e) => setMemberForm(prev => ({ ...prev, agree_active: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Bersedia">Bersedia</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Bersedia iuran kas (Rp 10.000)? <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={memberForm.agree_fees}
            onChange={(e) => setMemberForm(prev => ({ ...prev, agree_fees: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Bersedia">Bersedia</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Kirim Pendaftaran Member</span>
        </button>
      </div>
    </form>
  );
}
