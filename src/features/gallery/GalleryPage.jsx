import React, { useState, useEffect } from 'react';
import { galleryService } from './galleryService';
import PageHeader from '../../components/layout/PageHeader';
import ImageGrid from '../../components/media/ImageGrid';
import Loading from '../../components/common/Loading';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    galleryService.getGalleryPhotos()
      .then((data) => {
        setPhotos(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Galeri Foto Resmi"
        subtitle="Koleksi tangkapan layar momen-momen seru streaming, foto kenangan event bersama, poster visual utama, serta grafis promo resmi Intan."
      />

      {isLoading ? (
        <Loading message="Mengunduh album galeri..." />
      ) : (
        <ImageGrid images={photos} />
      )}
    </div>
  );
}
