import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function AdminSchedule() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl font-bold text-white">📅 Kalender Jadwal Siaran Streaming</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Kelola agenda streaming mingguan Intan, atur tanggal, platform, dan link siaran langsung.</p>
        </div>
        <Button variant="glow" size="sm">Buat Jadwal Baru</Button>
      </div>

      <Card hoverEffect={false} className="border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden" padding="none">
        <div className="p-6">
          <p className="text-sm text-[var(--text-secondary)]">Mockup antarmuka penjadwalan stream dengan integrasi alarm notifikasi Discord.</p>
        </div>
      </Card>
    </div>
  );
}
