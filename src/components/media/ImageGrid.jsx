import { useState } from 'react';
import Card from '../common/Card';
import Modal from '../common/Modal';

/**
 * Premium glassmorphic Image Grid component with interactive Modal Lightbox preview.
 */
export default function ImageGrid({
  images = [],
  columns = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  className = '',
}) {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <div className={className}>
      <div className={`grid gap-4 ${columns}`}>
        {images.map((img, idx) => (
          <Card
            key={img.id || idx}
            padding="none"
            className="group relative cursor-pointer overflow-hidden border border-[var(--border-color)] rounded-xl aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            onClick={() => setActiveImage(img)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveImage(img);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Lihat karya: ${img.title || 'Fanart'}${img.author ? ` oleh ${img.author}` : ''}`}
          >
            {/* Gallery Image */}
            <img
              src={img.url}
              alt={img.title || 'Gallery image'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Backdrop Overlay on Hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-sm font-semibold text-white truncate text-neon-glow">
                {img.title || 'Lihat Gambar'}
              </span>
              {img.author && (
                <span className="text-xs text-purple-300 truncate">
                  oleh: {img.author}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
        title={activeImage?.title || 'Detail Gambar'}
        size="lg"
      >
        {activeImage && (
          <div className="flex flex-col items-center">
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-black/40 max-w-full">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="max-h-[60vh] object-contain mx-auto"
              />
            </div>
            {activeImage.description && (
              <p className="mt-4 text-sm text-[var(--text-secondary)] text-center max-w-lg leading-relaxed">
                {activeImage.description}
              </p>
            )}
            {activeImage.author && (
              <div className="mt-2 text-xs font-semibold text-[var(--color-primary-hover)]">
                Artis: {activeImage.author}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
