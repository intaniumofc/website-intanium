'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Trash2, Edit, Plus, X, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminHashtags() {
  const [hashtags, setHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    text: '',
    count: '0 Tweets',
    explanation: '',
    row_number: 1
  });

  useEffect(() => {
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHashtags(data || []);
    } catch (err) {
      console.error('Error fetching hashtags:', err);
      alert('Gagal mengambil data tagar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (hashtag = null) => {
    if (hashtag) {
      setFormData({
        id: hashtag.id,
        text: hashtag.text,
        count: hashtag.count,
        explanation: hashtag.explanation,
        row_number: hashtag.row_number
      });
      setIsEditMode(true);
    } else {
      setFormData({
        id: null,
        text: '',
        count: '0 Tweets',
        explanation: '',
        row_number: 1
      });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'row_number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text) {
      alert('Tagar wajib diisi');
      return;
    }

    try {
      const payload = {
        text: formData.text,
        count: formData.count,
        explanation: formData.explanation,
        row_number: formData.row_number
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('hashtags')
          .update(payload)
          .eq('id', formData.id);
        if (error) throw error;
        alert('Berhasil memperbarui tagar!');
      } else {
        const { error } = await supabase
          .from('hashtags')
          .insert([payload]);
        if (error) throw error;
        alert('Berhasil menambah tagar baru!');
      }

      handleCloseModal();
      fetchHashtags();
    } catch (err) {
      console.error('Error saving hashtag:', err);
      alert('Gagal menyimpan tagar.');
    }
  };

  const handleDelete = async (id, text) => {
    if (!window.confirm(`Hapus tagar ${text}?`)) return;

    try {
      const { error } = await supabase
        .from('hashtags')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      alert('Berhasil menghapus tagar.');
      fetchHashtags();
    } catch (err) {
      console.error('Error deleting hashtag:', err);
      alert('Gagal menghapus tagar.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Tagar & Penjelasan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Atur tagar yang muncul di bagian Marquee halaman Home.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#170C79] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e8a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Tagar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data…</div>
        ) : hashtags.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Belum ada tagar. Silakan tambah tagar baru.
          </div>
        ) : (
          <div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">Tagar</th>
                    <th className="p-4">Jumlah Tweet</th>
                    <th className="p-4">Baris</th>
                    <th className="p-4">Penjelasan</th>
                    <th className="p-4 text-right pr-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hashtags.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <Hash className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 truncate max-w-[150px] lg:max-w-[250px]">{h.text}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{h.count}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          h.row_number === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          Baris {h.row_number}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500 max-w-[150px] lg:max-w-xs truncate" title={h.explanation}>
                        {h.explanation || '-'}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(h)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(h.id, h.text)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {hashtags.map((h) => (
                <div key={h.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{h.text}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{h.count}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenModal(h)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id, h.text)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pl-[52px] min-w-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      h.row_number === 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Baris {h.row_number}
                    </span>
                    {h.explanation && (
                      <div className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3 break-words min-w-0">
                        {h.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  {isEditMode ? 'Edit Tagar' : 'Tambah Tagar'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Teks Tagar
                  </label>
                  <input autoComplete="off" /* autocomplete="off" */ type="text" name="text" value={formData.text} onChange={handleChange} placeholder="Contoh: #IRIS" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" required />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Jumlah Tweet / Info
                  </label>
                  <input autoComplete="off" /* autocomplete="off" */ type="text" name="count" value={formData.count} onChange={handleChange} placeholder="Contoh: 14.2K Tweets" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Posisi Baris
                  </label>
                  <select name="row_number"
                    value={formData.row_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors"
                  >
                    <option value={1}>Baris 1 (Atas)</option>
                    <option value={2}>Baris 2 (Bawah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Penjelasan (Saat Modal Dibuka)
                  </label>
                  <textarea name="explanation" value={formData.explanation} onChange={handleChange} placeholder="Tuliskan penjelasan singkat mengenai tagar ini…" rows={4} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#170C79]/15 focus:border-[#170C79] transition-colors resize-none" ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#170C79] hover:bg-[#1a0e8a] text-white rounded-xl font-bold transition-colors shadow-md shadow-[#170C79]/20"
                  >
                    {isEditMode ? 'Simpan Perubahan' : 'Tambahkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
