'use client';

import { useState } from 'react';
import { Send, Loader2, Info } from 'lucide-react';
import { joinService } from '@/services/public/joinService';
import { getWAError, getLineIdError, getXAccountError } from './joinValidation';

export default function VolunteerForm({ settings, onSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!volunteerForm.agree_all) return;
    if (getWAError(volunteerForm.whatsapp_number) || getLineIdError(volunteerForm.line_id) || getXAccountError(volunteerForm.x_account)) {
      alert('Mohon periksa kembali input form Anda. Terdapat data yang belum sesuai format.');
      return;
    }
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
      onSubmitted();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleVolunteerSubmit} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Nama Lengkap <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nama lengkap"
            value={volunteerForm.full_name}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, full_name: e.target.value }))}
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
            value={volunteerForm.nickname}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Domisili <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Domisili tempat tinggal"
            value={volunteerForm.domicile}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, domicile: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Jenis Kelamin <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={volunteerForm.gender}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ID Line <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="ID Line aktif"
            value={volunteerForm.line_id}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, line_id: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getLineIdError(volunteerForm.line_id) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getLineIdError(volunteerForm.line_id) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getLineIdError(volunteerForm.line_id)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            No WhatsApp <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="Contoh: 081234567890"
            value={volunteerForm.whatsapp_number}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getWAError(volunteerForm.whatsapp_number) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getWAError(volunteerForm.whatsapp_number) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getWAError(volunteerForm.whatsapp_number)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Akun X / Twitter <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="@username X"
            value={volunteerForm.x_account}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, x_account: e.target.value }))}
            className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-400 ${
              getXAccountError(volunteerForm.x_account) ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-slate-200 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]'
            }`}
          />
          {getXAccountError(volunteerForm.x_account) && (
            <p className="text-[11px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> {getXAccountError(volunteerForm.x_account)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Divisi Yang Diminati <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={volunteerForm.division}
          onChange={(e) => setVolunteerForm(prev => ({ ...prev, division: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
        >
          {(settings?.volunteer?.available_divisions || [
            'Divisi Acara',
            'Divisi Konsumsi',
            'Divisi Sarana & Prasarana',
            'Divisi Dokumentasi & Media'
          ]).map((div, idx) => (
            <option key={div} value={div}>
              {idx + 1}. {div}
            </option>
          ))}
          <option value="Lainnya">Lainnya (Sebutkan di Motivasi)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Keahlian dan Pengalaman Yang Relavan
        </label>
        <textarea
          rows={2}
          placeholder="Cth: Public speaking, Ms. Office, dokumentasi, keahlian pendukung..."
          value={volunteerForm.skills_experience}
          onChange={(e) => setVolunteerForm(prev => ({ ...prev, skills_experience: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Motivasi Mengikuti Kegiatan <span className="text-red-500 ml-0.5">*</span>
        </label>
        <textarea
          required
          rows={3}
          placeholder="Tuliskan alasan & semangat Anda bergabung menjadi relawan event..."
          value={volunteerForm.motivation}
          onChange={(e) => setVolunteerForm(prev => ({ ...prev, motivation: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Tanggal dan Waktu Ketersediaan <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={volunteerForm.availability}
          onChange={(e) => setVolunteerForm(prev => ({ ...prev, availability: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none transition-all"
        >
          <option value="Bersedia mengikuti penuh waktu">Bersedia mengikuti penuh waktu</option>
          <option value="Tidak bersedia">Tidak bersedia</option>
          <option value="Bersedia pada hari H saja">Bersedia pada hari H saja</option>
        </select>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-3 text-xs text-slate-700 font-medium cursor-pointer">
          <input
            type="checkbox"
            required
            checked={volunteerForm.agree_all}
            onChange={(e) => setVolunteerForm(prev => ({ ...prev, agree_all: e.target.checked }))}
            className="mt-0.5 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
          />
          <span>
            Saya menyatakan data yang diberikan adalah benar, mengizinkan dokumentasi, serta bersedia aktif mendukung kegiatan dari pra hingga post-kegiatan. <span className="text-red-500 ml-0.5">*</span>
          </span>
        </label>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !volunteerForm.agree_all}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Kirim Pendaftaran Volunteer</span>
        </button>
      </div>
    </form>
  );
}
