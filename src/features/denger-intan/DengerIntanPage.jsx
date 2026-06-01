import React, { useState, useEffect } from 'react';
import { playlistService } from './playlistService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import VideoEmbed from '../../components/media/VideoEmbed';

export default function DengerIntanPage() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    playlistService.getPlaylists()
      .then((data) => {
        setPlaylists(data);
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
        title="Denger Intan (Playlist Pilihan)"
        subtitle="Rekomendasi playlist lofi chill peneman belajar, lagu upbeat gaming penggugah semangat, hingga koleksi musik kesukaan Intan."
      />

      {isLoading ? (
        <Loading message="Mengunduh daftar putar musik..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              hoverEffect={false}
              className="border border-[var(--border-color)] flex flex-col justify-between"
              padding="normal"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {playlist.title}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {playlist.category}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {playlist.description}
                </p>

                {/* Embedded Video/Media player */}
                <div className="pt-2">
                  <VideoEmbed
                    src={playlist.embedUrl}
                    title={playlist.title}
                    aspectRatio="16/9"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
