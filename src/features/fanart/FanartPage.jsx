import React, { useState, useEffect } from 'react';
import { fanartService } from './fanartService';
import PageHeader from '../../components/layout/PageHeader';
import ImageGrid from '../../components/media/ImageGrid';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import { Palette } from 'lucide-react';

export default function FanartPage() {
  const [fanarts, setFanarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    url: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { uploadFile, isUploading, progress } = useSupabaseUpload();

  useEffect(() => {
    fanartService.getFanarts()
      .then((data) => {
        setFanarts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (errors.url) {
        setErrors((prev) => ({ ...prev, url: '' }));
      }
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Judul karya wajib diisi';
    if (!formData.author.trim()) tempErrors.author = 'Nama artis/nickname wajib diisi';
    if (!file && !formData.url) tempErrors.url = 'File gambar fanart wajib dipilih';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let finalUrl = formData.url;
      if (file) {
        finalUrl = await uploadFile(file, 'fanarts', 'submissions');
      }

      const response = await fanartService.submitFanart({
        ...formData,
        url: finalUrl,
      });

      setSuccessMsg(response.message);
      setIsSubmitting(false);
      setIsSubmitOpen(false);

      // Add to local state list for instant feedback
      const newFanart = {
        id: `local-${Date.now()}`,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        url: finalUrl,
      };
      setFanarts((prev) => [newFanart, ...prev]);

      // Reset form fields
      setFormData({ title: '', author: '', description: '', url: '' });
      setFile(null);

      // Auto dismiss success alert
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const headerAction = (
    <Button variant="glow" size="sm" onClick={() => setIsSubmitOpen(true)}>
      <span className="flex items-center gap-1.5">
        <Palette className="h-4 w-4" /> Submit Karya Fanart Anda
      </span>
    </Button>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Galeri Karya Seni (Fanart)"
        subtitle="Sudut pameran ilustrasi indah, komik menarik, dan karya visual kreatif hasil goresan tangan berbakat rekan-rekan komunitas Intanium."
        action={headerAction}
      />

      {successMsg && (
        <Card hoverEffect={false} padding="compact" className="bg-emerald-500/10 border-emerald-500 text-emerald-400 border py-3 text-center text-sm font-semibold max-w-xl mx-auto rounded-xl">
          ✓ {successMsg}
        </Card>
      )}

      {isLoading ? (
        <Loading message="Mengambil karya seni fanart..." />
      ) : (
        <ImageGrid images={fanarts} />
      )}

      {/* Submission Overlay Dialog */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title="Kirim Karya Fanart Anda"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Judul Karya Seni
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Chibi Intan Summer Party"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Nama Seniman / Kredit
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Contoh: SakuraDraws"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
            {errors.author && <p className="mt-1 text-xs text-red-500 font-medium">{errors.author}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Deskripsi Singkat Karya
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Ceritakan sedikit inspirasi di balik pembuatan ilustrasi ini..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Pilih Berkas Gambar (JPG/PNG)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-[var(--border-color)] border-dashed rounded-lg bg-[var(--bg-primary)] hover:border-[var(--color-primary)] transition-all">
              <div className="space-y-1 text-center">
                <Palette className="h-8 w-8 text-purple-400 block mx-auto mb-1" />
                <div className="flex text-sm text-gray-400 justify-center">
                  <label className="relative cursor-pointer rounded-md font-semibold text-[var(--color-primary-hover)] hover:underline focus-within:outline-none">
                    <span>Pilih file gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-xs font-semibold text-emerald-400 truncate max-w-xs mx-auto">
                    ✓ {file.name}
                  </p>
                )}
              </div>
            </div>
            {errors.url && <p className="mt-1 text-xs text-red-500 font-medium">{errors.url}</p>}
          </div>

          {isUploading && (
            <div className="w-full bg-[var(--border-color)] rounded-full h-1 overflow-hidden">
              <div
                className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="glow"
            className="w-full"
            isLoading={isSubmitting || isUploading}
          >
            Kirim Karya Seni Anda
          </Button>
        </form>
      </Modal>
    </div>
  );
}
