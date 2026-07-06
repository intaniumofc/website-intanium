'use client';

import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { MADING_COLOR_THEMES } from '../../lib/constants';
import { Pin } from 'lucide-react';

export default function MessageForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    themeColor: 'yellow',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectTheme = (themeId) => {
    setFormData((prev) => ({ ...prev, themeColor: themeId }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Nama/Panggilan wajib diisi';
    } else if (formData.name.length > 25) {
      tempErrors.name = 'Nama maksimal 25 karakter';
    }
    
    if (!formData.message.trim()) {
      tempErrors.message = 'Pesan wajib diisi';
    } else if (formData.message.length > 200) {
      tempErrors.message = 'Pesan maksimal 200 karakter';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form message but keep name
      setFormData((prev) => ({ ...prev, message: '' }));
    }
  };

  return (
    <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)]">
      <h4 className="text-lg font-bold mb-4 text-[var(--text-primary)]">
        Tulis Pesan Dukungan Anda
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input */}
        <div>
          <label htmlFor="mading-side-name" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 cursor-pointer">
            Nama / Nama Panggilan
          </label>
          <input
            type="text"
            name="name"
            id="mading-side-name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contoh: FansSetiaIntan"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="mading-side-message" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex justify-between cursor-pointer">
            <span>Isi Pesan Dukungan</span>
            <span className="text-[10px] text-[var(--text-muted)] lowercase">
              {formData.message.length}/200 karakter
            </span>
          </label>
          <textarea
            name="message"
            id="mading-side-message"
            value={formData.message}
            onChange={handleChange}
            rows="3"
            placeholder="Tulis pesan semangat, ucapan selamat, atau candaan hangat di sini..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 resize-none"
          />
          {errors.message && <p className="mt-1 text-xs text-red-500 font-medium">{errors.message}</p>}
        </div>

        {/* Theme color selectors */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
            Pilih Warna Kertas Sticky Note
          </label>
          <div className="flex gap-3">
            {MADING_COLOR_THEMES.map((theme) => {
              const isActive = formData.themeColor === theme.id;
              // Simple extraction of background values for the circles
              let circleColor = 'bg-yellow-200';
              if (theme.id === 'pink') circleColor = 'bg-pink-200';
              if (theme.id === 'blue') circleColor = 'bg-blue-200';
              if (theme.id === 'purple') circleColor = 'bg-purple-200';
              if (theme.id === 'green') circleColor = 'bg-emerald-200';

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectTheme(theme.id)}
                  className={`w-7 h-7 rounded-full ${circleColor} border-2 transition-all cursor-pointer transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                    isActive ? 'border-[var(--color-primary)] ring-2 ring-purple-300' : 'border-transparent'
                  }`}
                  title={theme.name}
                  aria-label={`Warna ${theme.name}`}
                  aria-pressed={isActive}
                />
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isSubmitting}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Pin className="h-4 w-4" /> Tempelkan di Mading
          </span>
        </Button>
      </form>
    </Card>
  );
}
