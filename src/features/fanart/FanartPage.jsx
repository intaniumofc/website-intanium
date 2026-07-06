'use client';

import { useState, useEffect } from 'react';
import { fanartService } from './fanartService';
import ImageGrid from '../../components/media/ImageGrid';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { useSupabaseUpload } from '../../hooks/useSupabaseUpload';
import { FileUploadCard } from '../../components/ui/FileUploadCard';
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
    document.title = 'Fanart Intanium | Galeri Karya Seni Komunitas';
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

  return (
    <div className="space-y-10">
      {/* HERO SECTION */}
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-(--color-primary) sm:text-5xl tracking-tight">
          Fanart Intanium
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
          Sudut pameran ilustrasi indah, komik menarik, dan karya visual kreatif hasil goresan tangan berbakat rekan-rekan komunitas Intanium.
        </p>
        <div className="flex justify-center pt-2">
          <Button variant="glow" size="sm" onClick={() => setIsSubmitOpen(true)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
              <Palette className="h-4 w-4" /> Submit Karya Fanart Anda
            </span>
          </Button>
        </div>
      </section>

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
            <label htmlFor="fanart-form-title" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 cursor-pointer">
              Judul Karya Seni
            </label>
            <input
              type="text"
              name="title"
              id="fanart-form-title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Chibi Intan Summer Party"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="fanart-form-author" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 cursor-pointer">
              Nama Seniman / Kredit
            </label>
            <input
              type="text"
              name="author"
              id="fanart-form-author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Contoh: SakuraDraws"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            />
            {errors.author && <p className="mt-1 text-xs text-red-500 font-medium">{errors.author}</p>}
          </div>

          <div>
            <label htmlFor="fanart-form-desc" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 cursor-pointer">
              Deskripsi Singkat Karya
            </label>
            <textarea
              name="description"
              id="fanart-form-desc"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Ceritakan sedikit inspirasi di balik pembuatan ilustrasi ini..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Pilih Berkas Gambar (JPG/PNG)
            </label>
            <FileUploadCard
              files={file ? [{
                id: 'fanart-upload',
                file: file,
                progress: progress,
                status: isUploading ? 'uploading' : 'completed'
              }] : []}
              onFilesChange={(newFiles) => {
                if (newFiles && newFiles.length > 0) {
                  setFile(newFiles[0]);
                  if (errors.url) {
                    setErrors((prev) => ({ ...prev, url: '' }));
                  }
                }
              }}
              onFileRemove={() => setFile(null)}
              accept="image/*"
              multiple={false}
              className="max-w-full"
            />
            {errors.url && <p className="mt-1 text-xs text-red-500 font-medium">{errors.url}</p>}
          </div>

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
