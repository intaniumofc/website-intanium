import React, { useState, useEffect } from 'react';
import { discographyService } from './discographyService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatDate } from '../../lib/formatDate';

export default function DiscographyPage() {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    discographyService.getAlbums()
      .then((data) => {
        setAlbums(data);
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
        title="Diskografi & Rilis Musik"
        subtitle="Dengarkan kompilasi EP album Lofi Chill, cover lagu orisinal, serta track instrumental spesial persembahan Intan."
      />

      {isLoading ? (
        <Loading message="Mengunduh diskografi musik..." />
      ) : (
        <div className="space-y-8">
          {albums.map((album) => (
            <Card
              key={album.id}
              hoverEffect={false}
              className="border border-[var(--border-color)] flex flex-col md:flex-row gap-6 p-6 items-start"
            >
              {/* Artwork Cover */}
              <div className="w-full md:w-48 aspect-square rounded-xl overflow-hidden bg-black/20 flex-shrink-0 border border-[var(--border-color)]">
                <img
                  src={album.artworkUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Album Details & Tracks */}
              <div className="flex-grow space-y-4 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {album.type}
                    </span>
                    <h3 className="text-xl font-extrabold text-[var(--text-primary)] mt-1.5 leading-snug">
                      {album.title}
                    </h3>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-semibold">
                    Rilis: {formatDate(album.releaseDate)}
                  </span>
                </div>

                {/* Tracklist table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Daftar Lagu
                  </h4>
                  <div className="divide-y divide-[var(--border-color)] text-sm">
                    {album.tracklist.map((track) => (
                      <div key={track.trackNum} className="flex justify-between py-2 items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--text-muted)] font-mono">{track.trackNum}.</span>
                          <span className="font-semibold text-[var(--text-primary)]">{track.title}</span>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">{track.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Music platforms actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {album.spotifyUrl && (
                    <a href={album.spotifyUrl} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="sm">
                        🟢 Dengar di Spotify
                      </Button>
                    </a>
                  )}
                  {album.youtubeUrl && (
                    <a href={album.youtubeUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        🔴 Putar di YouTube Music
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
