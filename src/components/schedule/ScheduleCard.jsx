import Card from '../common/Card';
import Button from '../common/Button';
import { formatEventTime, getEventStatus } from '../../lib/formatDate';
import { Clock, PlayCircle, Bell, Smartphone, Video, MessageSquare, Gamepad2, Radio } from 'lucide-react';

export default function ScheduleCard({ event, className = '' }) {
  const { title, description, time, platform, link, duration, thumbnail } = event;

  const status = getEventStatus(time);

  // Status badges definitions
  const badgeStyles = {
    upcoming: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/25',
    live: 'bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    completed: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
  };

  const statusLabels = {
    upcoming: 'Akan Datang',
    live: '● LIVE SEKARANG',
    completed: 'Selesai',
  };

  const platformConfig = {
    YouTube: { label: 'YouTube', icon: Video, color: 'text-red-500', bg: 'bg-red-50 border border-red-200/40', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.1)]' },
    Twitch: { label: 'Twitch', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50 border border-purple-200/40', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.1)]' },
    TikTok: { label: 'TikTok', icon: Video, color: 'text-pink-500', bg: 'bg-pink-50 border border-pink-200/40', glow: 'shadow-[0_0_8px_rgba(236,72,153,0.1)]' },
    Instagram: { label: 'Instagram Live', icon: Smartphone, color: 'text-pink-600', bg: 'bg-pink-50 border border-pink-200/40', glow: 'shadow-[0_0_8px_rgba(219,39,119,0.1)]' },
    Discord: { label: 'Discord Stage', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50 border border-indigo-200/40', glow: 'shadow-[0_0_8px_rgba(99,102,241,0.1)]' },
    'IDN Live': { label: 'IDN Live', icon: Radio, color: 'text-red-600', bg: 'bg-red-50 border border-red-200/40', glow: 'shadow-[0_0_8px_rgba(220,38,38,0.1)]' },
  };

  const plat = platformConfig[platform] || { label: platform, icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50 border border-indigo-200/40', glow: '' };
  const PlatIcon = plat.icon;

  // Date Parsing for Vertical Editorial Sidebar
  const dateObj = new Date(time);
  const dayNum = dateObj.getDate();
  const monthNamesShort = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const dayNamesShort = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthStr = monthNamesShort[dateObj.getMonth()];
  const dayStr = dayNamesShort[dateObj.getDay()];

  return (
    <div className="relative">
      {/* Date block left side (desktop absolute timeline element) */}
      <div className="hidden md:flex flex-col items-end justify-center absolute left-[-184px] top-6 w-28 text-right pr-6 select-none pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600/70">{dayStr}</span>
        <span className="text-3xl font-black text-[var(--color-primary)] leading-none my-1 drop-shadow-[0_1px_2px_rgba(23,12,121,0.15)]">{dayNum}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{monthStr}</span>
      </div>

      {/* Timeline Node */}
      {status === 'live' ? (
        <div className="absolute left-[-31px] md:left-[-51px] top-7 h-5 w-5 rounded-full bg-red-500 border-[2.5px] border-white flex items-center justify-center z-10 shadow-[0_0_14px_rgba(239,68,68,0.5)]">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
        </div>
      ) : status === 'upcoming' ? (
        <div className="absolute left-[-31px] md:left-[-51px] top-7 h-5 w-5 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-indigo-500 border-[2.5px] border-white z-10 shadow-[0_0_12px_rgba(23,12,121,0.35)]" />
      ) : (
        <div className="absolute left-[-31px] md:left-[-51px] top-7 h-4 w-4 rounded-full bg-slate-300 border-2 border-white z-10 shadow-sm" />
      )}

      <Card
        hoverEffect={true}
        className={`group border border-[var(--border-color)] flex flex-col md:flex-row gap-6 items-center overflow-hidden transition-all duration-400 hover:scale-[1.012] hover:border-[var(--color-primary)]/30 hover:shadow-[0_12px_40px_rgba(23,12,121,0.12)] ${
          status === 'live' ? 'border-red-500/40 bg-gradient-to-r from-[var(--bg-secondary)] via-white to-red-50/50 shadow-[0_0_24px_rgba(239,68,68,0.1)]' : 'bg-white/85 backdrop-blur-xl'
        } ${className}`}
        padding="normal"
      >
        {/* Event Image / Thumbnail Fallback */}
        <div className="w-full md:w-48 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-[var(--border-color)] flex-shrink-0 relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`Poster ${title}`}
              className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#170C79] via-[#1e1494] to-[#2d1f8f] flex flex-col items-center justify-center p-4 text-center select-none relative group-hover:scale-105 transition-transform duration-600">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.15),transparent_70%)] pointer-events-none" />
              <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-cyan-300 mb-2.5 backdrop-blur-sm">
                <PlatIcon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black tracking-[0.18em] text-indigo-200 uppercase">{plat.label}</span>
            </div>
          )}
          {/* Absolute status indicator overlay */}
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] uppercase font-black rounded-lg backdrop-blur-md ${badgeStyles[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Event Details */}
        <div className="flex-grow flex flex-col justify-between h-full gap-4 w-full">
          <div className="space-y-2.5">
            {/* Header metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full ${plat.bg} ${plat.color} ${plat.glow}`}>
                <PlatIcon className="h-3.5 w-3.5" />
                <span>{plat.label}</span>
              </span>
              {duration && (
                <span className="text-[var(--text-muted)] font-bold px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                  ± {duration}
                </span>
              )}
            </div>

            <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-300">
              {title}
            </h3>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl font-semibold">
              {description}
            </p>

            {/* Mobile date display */}
            <div className="md:hidden flex items-center gap-2 text-xs">
              <span className="font-black text-[var(--color-primary)]">{dayStr}, {dayNum} {monthStr}</span>
            </div>
          </div>

          {/* Date, Time and Link Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100/80 pt-4 mt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-cyan-600 shrink-0" />
              <span className="text-sm font-black text-[var(--text-primary)]">
                {formatEventTime(time)}
              </span>
            </div>

            {link && (status === 'live' || status === 'upcoming') && (
              <a 
                href={link} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] rounded-xl"
              >
                <Button
                  variant={status === 'live' ? 'glow' : 'secondary'}
                  size="sm"
                  className="w-full font-bold focus-visible:ring-0"
                >
                  {status === 'live' ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <PlayCircle className="h-4.5 w-4.5 animate-pulse" /> Tonton Live Streaming
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Bell className="h-4.5 w-4.5" /> Pasang Pengingat
                    </span>
                  )}
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
