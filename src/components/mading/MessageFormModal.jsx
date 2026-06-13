import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pin } from 'lucide-react';

export default function MessageFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    color: 'yellow',
    agreed: false
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const colors = [
    { id: 'yellow', name: 'Sunny Yellow', bgClass: 'bg-[#fef9c3] border-[#fef08a]' },
    { id: 'pink', name: 'Sakura Pink', bgClass: 'bg-[#ffe5ec] border-[#ffccd5]' },
    { id: 'blue', name: 'Sky Blue', bgClass: 'bg-[#e0f2fe] border-[#bae6fd]' },
    { id: 'lavender', name: 'Neon Lavender', bgClass: 'bg-[#f3e8ff] border-[#e9d5ff]' },
    { id: 'peach', name: 'Warm Peach', bgClass: 'bg-[#ffedd5] border-[#fed7aa]' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectColor = (colorId) => {
    setFormData((prev) => ({ ...prev, color: colorId }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Nama / Username wajib diisi';
    } else if (formData.name.length > 25) {
      tempErrors.name = 'Nama maksimal 25 karakter';
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Isi pesan wajib diisi';
    } else if (formData.message.length > 200) {
      tempErrors.message = 'Pesan maksimal 200 karakter';
    }

    if (!formData.agreed) {
      tempErrors.agreed = 'Anda harus menyetujui kesepakatan';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form fields
      setFormData({
        name: '',
        message: '',
        color: 'yellow',
        agreed: false
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-[var(--border-color)] p-6 shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 className="text-lg font-extrabold text-[var(--color-primary)] flex items-center gap-2">
            📌 Tulis Pesan Baru untuk Intan
          </h4>
          <button
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
          {/* Name Input */}
          <div>
            <label htmlFor="mading-form-name" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 cursor-pointer">
              Nama / Username Panggilan
            </label>
            <input
              type="text"
              name="name"
              id="mading-form-name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: MatchaLover"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name}</p>}
          </div>

          {/* Message Input */}
          <div>
            <label htmlFor="mading-form-message" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex justify-between cursor-pointer">
              <span>Isi Pesan Dukungan</span>
              <span className="text-[10px] text-slate-400 lowercase font-medium">
                {formData.message.length}/200 karakter
              </span>
            </label>
            <textarea
              name="message"
              id="mading-form-message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Tulis ucapan selamat, kata penyemangat, atau candaan hangat di sini..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 resize-none"
            />
            {errors.message && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.message}</p>}
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Pilih Warna Sticky Note
            </label>
            <div className="flex gap-3">
              {colors.map((color) => {
                const isActive = formData.color === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => selectColor(color.id)}
                    className={`w-8 h-8 rounded-full ${color.bgClass} border transition-all cursor-pointer transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                      isActive ? 'border-[var(--color-primary)] ring-2 ring-purple-300/40 scale-105 shadow-sm' : 'border-slate-300'
                    }`}
                    title={color.name}
                    aria-label={`Warna ${color.name}`}
                    aria-pressed={isActive}
                  />
                );
              })}
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
                Saya setuju untuk menjaga ruang ini tetap positif dan suportif.
              </span>
            </label>
            {errors.agreed && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.agreed}</p>}
          </div>

          {/* Submit Action */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              <Pin className="h-4 w-4" />
              <span>Tempel Pesan</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
