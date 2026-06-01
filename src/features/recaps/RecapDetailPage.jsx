import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recapService } from './recapService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ZineViewer from '../../components/media/ZineViewer';
import { ROUTES } from '../../lib/constants';
import { Search } from 'lucide-react';

export default function RecapDetailPage() {
  const { id } = useParams();
  const [recap, setRecap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    recapService.getRecapById(id)
      .then((data) => {
        setRecap(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <Loading message="Membuka halaman recap zine..." />;

  if (!recap) {
    return (
      <Card className="text-center py-12 border border-[var(--border-color)]">
        <Search className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-2">Arsip Recap Tidak Ditemukan</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Kami gagal menemukan zine dengan kode pengenal ini.</p>
        <Link to={ROUTES.RECAPS}>
          <Button variant="outline" size="sm">Kembali ke Daftar</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <Link to={ROUTES.RECAPS} className="text-sm text-[var(--text-secondary)] hover:text-[var(--color-primary)] font-semibold transition-colors">
          ← Kembali ke Arsip Recap
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
          {recap.title}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          {recap.summary}
        </p>
      </div>

      {/* Book simulation widget */}
      <ZineViewer pages={recap.pages} title={recap.title} className="py-6" />
    </div>
  );
}
