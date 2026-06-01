import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatEventTime, getEventStatus } from '../../lib/formatDate';
import { Clock, PlayCircle, Bell, Smartphone, Video, MessageSquare, Gamepad2 } from 'lucide-react';

export default function ScheduleCard({ event, className = '' }) {
  const { title, description, time, platform, link, duration, thumbnail } = event;

  const status = getEventStatus(time);

  // Status badges definitions
  const badgeStyles = {
    upcoming: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    live: 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    completed: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
  };

  const statusLabels = {
    upcoming: 'Akan Datang',
    live: '● LIVE SEKARANG',
    completed: 'Selesai',
  };

  const platformConfig = {
    YouTube: { label: 'YouTube', icon: Video, color: 'text-red-500' },
    Twitch: { label: 'Twitch', icon: Gamepad2, color: 'text-purple-500' },
    TikTok: { label: 'TikTok', icon: Video, color: 'text-pink-500' },
    Instagram: { label: 'Instagram Live', icon: Smartphone, color: 'text-pink-600' },
    Discord: { label: 'Discord Stage', icon: MessageSquare, color: 'text-indigo-500' },
  };

  const plat = platformConfig[platform] || { label: platform, icon: Video, color: 'text-blue-400' };
  const PlatIcon = plat.icon;

  return (
    <Card
      hoverEffect={true}
      className={`border border-[var(--border-color)] flex flex-col md:flex-row gap-6 items-center overflow-hidden transition-all duration-300 ${
        status === 'live' ? 'border-red-500/50 bg-gradient-to-r from-[var(--bg-secondary)] to-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''
      } ${className}`}
      padding="normal"
    >
      {/* Event Image / Thumbnail */}
      <div className="w-full md:w-48 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-[var(--border-color)] flex-shrink-0 relative">
        <img
          src={thumbnail || 'https://via.placeholder.com/300x200'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Absolute status indicator overlay */}
        <span className={`absolute top-3 left-3 px-2 py-1 text-[9px] uppercase font-bold rounded-lg ${badgeStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Event Details */}
      <div className="flex-grow flex flex-col justify-between h-full gap-4 w-full">
        <div className="space-y-2">
          {/* Header metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <PlatIcon className={`h-4 w-4 ${plat.color}`} />
              <span>{plat.label}</span>
            </span>
            {duration && (
              <span className="text-[var(--text-muted)]">
                • Durasi: ± {duration}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
            {title}
          </h3>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* Date, Time and Link Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[var(--border-color)] pt-4 mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {formatEventTime(time)}
            </span>
          </div>

          {link && (status === 'live' || status === 'upcoming') && (
            <a href={link} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button
                variant={status === 'live' ? 'glow' : 'secondary'}
                size="sm"
                className="w-full"
              >
                {status === 'live' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <PlayCircle className="h-4 w-4 animate-pulse" /> Tonton Live Streaming
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Bell className="h-4 w-4" /> Pasang Pengingat
                  </span>
                )}
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
