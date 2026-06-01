import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ZineViewer component - A beautiful simulated interactive Zine / Booklet booklet viewer.
 */
export default function ZineViewer({
  pages = [],
  title = 'Zine Recap',
  className = '',
}) {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const prevPage = () => {
    setCurrentPageIdx((prev) => Math.max(0, prev - 1));
  };

  const nextPage = () => {
    setCurrentPageIdx((prev) => Math.min(pages.length - 1, prev + 1));
  };

  if (!pages || pages.length === 0) {
    return (
      <Card className="text-center py-12">
        <BookOpen className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">Tidak ada halaman zine tersedia.</p>
      </Card>
    );
  }

  const activePage = pages[currentPageIdx];

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Zine Canvas Frame */}
      <Card
        hoverEffect={false}
        padding="none"
        className="w-full max-w-xl aspect-[3/4] border border-[var(--border-color)] overflow-hidden rounded-2xl bg-[#0f0f15] shadow-2xl relative flex flex-col items-center justify-between"
      >
        {/* Page counter label */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1 text-xs rounded-full bg-black/60 text-white border border-purple-500/30">
          Hal. {currentPageIdx + 1} dari {pages.length}
        </div>

        {/* Page content */}
        <div className="w-full flex-grow flex items-center justify-center p-4 relative">
          {activePage.imageUrl ? (
            <img
              src={activePage.imageUrl}
              alt={`Zine page ${currentPageIdx + 1}`}
              className="max-h-full max-w-full object-contain rounded shadow-lg animate-fade-in"
            />
          ) : (
            <div className="text-center p-8 max-w-sm animate-fade-in">
              <h4 className="text-lg font-bold text-purple-300 mb-2">{activePage.title || `Halaman ${currentPageIdx + 1}`}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{activePage.content || 'Konten deskripsi halaman zine.'}</p>
            </div>
          )}
        </div>

        {/* Footer overlay */}
        <div className="w-full py-4 px-6 bg-black/40 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
          {activePage.caption || `${title} - Halaman ${currentPageIdx + 1}`}
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={currentPageIdx === 0}
        >
          <span className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Halaman Sebelumnya
          </span>
        </Button>
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {currentPageIdx + 1} / {pages.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={currentPageIdx === pages.length - 1}
        >
          <span className="flex items-center gap-1">
            Halaman Berikutnya <ChevronRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  );
}
