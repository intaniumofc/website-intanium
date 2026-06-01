import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recapService } from './recapService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatDate } from '../../lib/formatDate';
import { BookOpen } from 'lucide-react';

export default function RecapListPage() {
  const [recaps, setRecaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    recapService.getRecaps()
      .then((data) => {
        setRecaps(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Recap & Zine Aktivitas"
        subtitle="Telusuri jejak log aktivitas, majalah recap digital (Zine), dan rangkuman momen bersejarah perjalanan karir streaming Intan bersama komunitas."
      />

      {isLoading ? (
        <Loading message="Mengambil data arsip zine..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recaps.map((recap) => (
            <Card
              key={recap.id}
              className="flex flex-col justify-between border border-[var(--border-color)] group hover:shadow-[var(--neon-glow-primary)] transition-all duration-300"
              padding="none"
            >
              {/* Cover Banner */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-black/20 border-b border-[var(--border-color)] relative">
                <img
                  src={recap.thumbnailUrl}
                  alt={recap.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 text-[9px] uppercase font-bold rounded-lg bg-black/60 text-purple-300 border border-purple-500/30">
                  {recap.pages.length} Halaman
                </span>
              </div>

              {/* Descriptions body */}
              <div className="p-6 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Diterbitkan: {formatDate(recap.publishDate)}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors leading-snug">
                    {recap.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {recap.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-color)]">
                  <Link to={`/recaps/${recap.id}`} className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      <span className="flex items-center justify-center gap-1.5">
                        <BookOpen className="h-4 w-4" /> Buka & Baca Zine Digital
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
