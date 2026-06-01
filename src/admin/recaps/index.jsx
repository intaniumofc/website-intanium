import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminRecaps() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl font-bold text-white">📖 Arsip Recap & Zine Digital</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Unggah majalah Zine baru atau log komik recap mingguan dalam format JPG/PNG.</p>
        </div>
        <Button variant="glow" size="sm">Unggah Edisi Zine</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)]">Mockup antarmuka pengunggahan zine PDF/PNG halaman demi halaman.</p>
        </div>
      </Card>
    </div>
  );
}
