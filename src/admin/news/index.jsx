import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminNews() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl font-bold text-white">📰 Publikasi Berita & Pengumuman</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Buat artikel pengumuman resmi terbaru, event komunitas, atau berita penting lainnya.</p>
        </div>
        <Button variant="glow" size="sm">Tulis Artikel Baru</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)]">Mockup panel teks editor berita, mendukung penulisan sintaksis Markdown.</p>
        </div>
      </Card>
    </div>
  );
}
