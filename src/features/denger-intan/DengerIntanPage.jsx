import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playlistService } from './playlistService';
import {
  Share2,
  ArrowLeft,
  ArrowRight,
  Headphones,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import { ContainerScroll } from '../../components/ui/container-scroll-animation';

const MOST_PLAYED_LIVE_SONGS = [
  {
    id: 'song-1',
    title: 'Untuk Selamanya',
    artist: 'Kunto Aji',
    playCount: 'Sering diputar',
    mood: 'Chill / Calm',
    note: 'Lagu favorit Intan untuk meredakan kecemasan, sering dinyanyikan saat acoustic live stream malam hari.'
  },
  {
    id: 'song-2',
    title: 'Hati-Hati di Jalan',
    artist: 'Tulus',
    playCount: 'Sering diputar',
    mood: 'Nostalgic',
    note: 'Lagu kebangsaan galau yang hampir selalu diputar saat ngobrol santai dengan fans.'
  },
  {
    id: 'song-3',
    title: 'Heavy Rotation',
    artist: 'JKT48',
    playCount: 'Sangat sering diputar',
    mood: 'Hype / Energetic',
    note: 'Lagu wajib pembuka stream perayaan debut atau pencapaian target subscriber.'
  },
  {
    id: 'song-4',
    title: 'Secukupnya',
    artist: 'Hindia',
    playCount: 'Sering diputar',
    mood: 'Focus / Work',
    note: 'Diputar sebagai musik latar belakang saat sesi streaming belajar bareng atau nugas malam.'
  }
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};




const staggerSection = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05
    }
  }
};

export default function DengerIntanPage() {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const playerCardRef = useRef(null);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [playerMousePosition, setPlayerMousePosition] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef(null);

  // Set page title for SEO best practices
  useEffect(() => {
    document.title = '#DengerINTAN Playlist | Intanium';
  }, []);

  // Fetch playlists on mount
  useEffect(() => {
    playlistService.getPlaylists()
      .then((data) => {
        setPlaylists(data);
        if (data.length > 0) {
          // Check query param for active playlist
          const params = new URLSearchParams(window.location.search);
          const playlistId = params.get('playlist');
          const found = data.find(p => p.id === playlistId);
          setActivePlaylist(found || data[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    // Auto hide after 2.5s
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  const handlePlaylistChange = (playlist) => {
    setActivePlaylist(playlist);
    // Update URL query param to maintain navigation state
    const newUrl = `${window.location.origin}${window.location.pathname}?playlist=${playlist.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const sharePlaylist = () => {
    if (!activePlaylist) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?playlist=${activePlaylist.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast("Tautan playlist berhasil disalin ke clipboard!");
      })
      .catch(() => {
        showToast("Gagal menyalin tautan.");
      });
  };

  const handlePlayerMouseMove = (e) => {
    if (!playerCardRef.current) return;
    const rect = playerCardRef.current.getBoundingClientRect();
    setPlayerMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const scrollContainer = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; // Card width + gap (300 + 40)
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading || !activePlaylist) {
    return <Loading message="Mengunduh daftar putar musik..." />;
  }

  return (
    <div className="space-y-16 max-w-7xl mx-auto py-6 relative">
      {/* Decorative blue floral vine repeating background pattern with ambient drift */}
      <div
        className="fixed inset-0 pointer-events-none z-0 animate-floral-drift"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%234A7ABF' opacity='0.22'%3E%3Ccircle cx='60' cy='60' r='4' stroke-width='1.2'/%3E%3Ccircle cx='60' cy='60' r='8' stroke-width='0.8'/%3E%3Cpath d='M60 52 C56 48,56 40,60 36 C64 40,64 48,60 52' stroke-width='1'/%3E%3Cpath d='M60 68 C56 72,56 80,60 84 C64 80,64 72,60 68' stroke-width='1'/%3E%3Cpath d='M52 60 C48 56,40 56,36 60 C40 64,48 64,52 60' stroke-width='1'/%3E%3Cpath d='M68 60 C72 56,80 56,84 60 C80 64,72 64,68 60' stroke-width='1'/%3E%3Cpath d='M54 54 C50 50,44 50,42 42 C50 44,50 50,54 54' stroke-width='0.8'/%3E%3Cpath d='M66 54 C70 50,76 50,78 42 C70 44,70 50,66 54' stroke-width='0.8'/%3E%3Cpath d='M54 66 C50 70,44 70,42 78 C50 76,50 70,54 66' stroke-width='0.8'/%3E%3Cpath d='M66 66 C70 70,76 70,78 78 C70 76,70 70,66 66' stroke-width='0.8'/%3E%3Cpath d='M0 60 Q15 50,30 58 Q40 62,50 58' stroke-width='0.8'/%3E%3Cpath d='M70 62 Q80 58,90 62 Q105 70,120 60' stroke-width='0.8'/%3E%3Cpath d='M60 0 Q50 15,58 30 Q62 40,58 50' stroke-width='0.8'/%3E%3Cpath d='M62 70 Q58 80,62 90 Q70 105,60 120' stroke-width='0.8'/%3E%3Cpath d='M20 56 C18 52,20 48,24 50 C22 52,20 54,20 56Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M96 58 C98 54,100 50,104 52 C102 54,100 56,96 58Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M56 20 C52 18,48 20,50 24 C52 22,54 20,56 20Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Cpath d='M58 96 C54 98,50 100,52 104 C54 102,56 100,58 96Z' stroke-width='0.6' fill='%234A7ABF' fill-opacity='0.12'/%3E%3Ccircle cx='0' cy='0' r='2' stroke-width='0.8'/%3E%3Ccircle cx='120' cy='0' r='2' stroke-width='0.8'/%3E%3Ccircle cx='0' cy='120' r='2' stroke-width='0.8'/%3E%3Ccircle cx='120' cy='120' r='2' stroke-width='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Centered Premium Editorial Hero Section with 3D Scroll Perspective */}
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center select-none pt-1">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[var(--color-primary)] leading-none tracking-tight relative mb-8">
              #DengerINTAN
            </h2>
          </div>
        }
      >
        <div className="w-full relative">
          {/* Decorative Outer Blob */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-secondary)]/20 to-[var(--color-primary)]/20 opacity-30 blur-2xl rounded-full z-0 pointer-events-none"></div>

          <div
            ref={playerCardRef}
            className="w-full rounded-[32px] overflow-hidden relative cursor-default group z-10"
            style={{
              background: 'radial-gradient(25% 40% at 50% 30%, rgba(23, 12, 121, 0.22), rgba(7, 10, 36, 0.98))',
              boxShadow: `0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset, 
                          0px 0px 25px 5px rgba(23, 12, 121, 0.06), 
                          0px 0px 40px 20px rgba(23, 12, 121, 0.03), 
                          0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                          0 10px 30px -5px rgba(0, 0, 0, 0.3)`
            }}
            onMouseEnter={() => setIsPlayerHovered(true)}
            onMouseLeave={() => setIsPlayerHovered(false)}
            onMouseMove={handlePlayerMouseMove}
          >
            {/* Cursor-tracking radial spotlight */}
            <div
              className="absolute w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(circle at ${playerMousePosition.x}% ${playerMousePosition.y}%, rgba(8, 145, 178, 0.15) 0%, transparent 60%)`,
                filter: 'blur(25px)',
              }}
            />

            {/* Secondary blur */}
            <div
              className="absolute w-full h-full pointer-events-none transition-opacity duration-700"
              style={{
                background: 'radial-gradient(50% 50% at 50% 50%, rgba(23, 12, 121, 0.10) 0%, transparent 100%)',
                opacity: isPlayerHovered ? 0.8 : 0,
                filter: 'blur(30px)',
                transform: 'translateY(20%)'
              }}
            />

            <div className="p-6 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-xl mr-3 flex items-center justify-center overflow-hidden bg-black/90 relative"
                    style={{
                      boxShadow: isPlayerHovered ? '0 0 15px rgba(30, 215, 96, 0.25)' : 'none',
                      transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 transition-transform duration-700"
                      style={{
                        fill: '#1ED760',
                        transform: isPlayerHovered ? 'scale(1.08)' : 'scale(1)',
                        filter: isPlayerHovered ? 'drop-shadow(0 0 3px rgba(30, 215, 96, 0.5))' : 'none'
                      }}>
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </div>
                  <div className="text-white text-left font-medium text-base transition-all duration-300">
                    <span className="bg-clip-text bg-gradient-to-r from-white to-green-300 font-extrabold">
                      {activePlaylist.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase text-green-400 font-semibold tracking-wider select-none">
                        On Going Playlist
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={sharePlaylist}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Bagikan Tautan Playlist"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={activePlaylist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                    title="Buka di Spotify"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Spotify Playlist Embed Iframe with Smooth Transition */}
              <div
                className="w-full rounded-2xl overflow-hidden shadow-md border border-white/5 bg-black/40 p-1.5 transition-all duration-500"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePlaylist.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <iframe
                      data-testid="embed-iframe"
                      style={{ borderRadius: '12px' }}
                      src={activePlaylist.spotifyEmbedUrl}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen=""
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Pulsing border overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[32px] transition-opacity duration-700 opacity-0 group-hover:opacity-100"
              style={{
                border: '1px solid rgba(23, 12, 121, 0.2)',
                animation: 'pulse-border 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />

            <style>{`
              @keyframes pulse-border {
                0%, 100% {
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.7;
                  transform: scale(1.002);
                }
              }
              @keyframes floral-drift {
                0%, 100% {
                  transform: translate(0, 0);
                }
                50% {
                  transform: translate(-12px, 8px);
                }
              }
              .animate-floral-drift {
                animation: floral-drift 18s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      </ContainerScroll>


      {/* Most Played Song by Intan di Live Section */}
      <motion.section
        className="py-10 border-t border-[var(--border-color)]/40 pt-16 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerSection}
      >
        <motion.div variants={fadeUp} className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
            <Headphones className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[var(--color-primary)]">
              Most Played Song by Nur Intan
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Daftar lagu terpopuler yang paling sering dinyanyikan atau diputar Intan saat siaran langsung.
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col gap-4 select-none"
          variants={staggerContainer}
        >
          {MOST_PLAYED_LIVE_SONGS.map((song) => (
            <motion.div
              key={song.id}
              variants={fadeUp}
              className="group relative grid grid-cols-1 md:grid-cols-12 items-center gap-5 rounded-[28px] bg-white/75 backdrop-blur-md border border-[var(--color-primary)]/10 shadow-[0_12px_32px_rgba(23,12,121,0.06)] px-5 sm:px-6 py-5 transition-all duration-300 hover:bg-white/90 hover:border-[var(--color-primary)]/25 hover:shadow-[0_18px_45px_rgba(23,12,121,0.10)] hover:-translate-y-1 cursor-default"
            >
              {/* Left Accent Gradient Bar */}
              <div className="absolute left-0 top-5 bottom-5 w-1 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] opacity-70" />

              {/* Col 1: Icon + Song Title (order-1 on mobile, spans 3 cols on desktop) */}
              <div className="order-1 md:order-none md:col-span-3 flex items-center gap-3">
                <span className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center shadow-inner transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:scale-105 shrink-0">
                  <Headphones className="w-5 h-5" />
                </span>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-800 truncate leading-snug">
                    {song.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold leading-tight mt-0.5 truncate">
                    by {song.artist}
                  </p>
                </div>
              </div>

              {/* Col 2: Tags (order-3 on mobile, spans 2 cols on desktop) */}
              <div className="order-3 md:order-none md:col-span-2 flex items-center gap-1.5 flex-wrap">
                <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[8px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[var(--color-primary)]/5">
                  {song.playCount}
                </span>
                <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-2.5 py-1 rounded-full uppercase border border-slate-200/50">
                  {song.mood}
                </span>
              </div>

              {/* Col 3: Note/Description (order-2 on mobile, spans 5 cols on desktop) */}
              <div className="order-2 md:order-none md:col-span-5 w-full">
                <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed bg-[var(--color-primary-light)]/35 border border-[var(--color-primary)]/10 rounded-2xl px-5 py-3 w-full">
                  "{song.note}"
                </p>
              </div>

              {/* Col 4: Action Button (order-4 on mobile, spans 2 cols on desktop) */}
              <div className="order-4 md:order-none md:col-span-2 flex items-center justify-end w-full">
                <a
                  className="rounded-full px-6 py-3 bg-white/80 border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-extrabold uppercase tracking-wider text-[10px] shadow-sm transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:shadow-[0_10px_24px_rgba(23,12,121,0.18)] flex items-center justify-center gap-1.5 ml-auto w-fit cursor-pointer"
                  href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Dengar Lagu</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Archives of Past Monthly Playlists / Koleksi Playlist */}
      <motion.section
        className="relative mt-16 select-none relative z-10 border-t border-[var(--border-color)]/40 pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerSection}
      >
        <motion.div variants={fadeUp} className="mb-6 flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] mb-1">
              Koleksi Playlist #DengerINTAN
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Arsip playlist yang pernah dikurasi Intan dari waktu ke waktu.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scrollContainer('left')}
              className="w-10 h-10 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              title="Scroll Kiri"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="w-10 h-10 rounded-full border border-[var(--color-primary)]/25 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
              title="Scroll Rujukan"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Scrollable Horizontal Container */}
        <motion.div
          ref={scrollContainerRef}
          variants={staggerContainer}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 scroll-smooth snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
        >
          {playlists.map((play) => {
            const isActivePlaylist = play.id === activePlaylist.id;
            return (
              <motion.div
                key={play.id}
                onClick={() => handlePlaylistChange(play)}
                variants={fadeUp}
                whileHover={!isActivePlaylist ? { y: -6, scale: 1.015 } : {}}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`snap-start shrink-0 w-[290px] sm:w-[320px] glass-panel p-4 rounded-[28px] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${isActivePlaylist ? 'border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]/10 scale-[0.98]' : 'border-[var(--border-color)]/60 bg-white/40 shadow-sm hover:shadow-md hover:scale-[1.01] cursor-pointer'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 pr-2">
                    <span className="bg-[var(--color-secondary)]/90 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-1 shadow-sm uppercase tracking-wider">
                      {play.category}
                    </span>
                    <h3 className="text-xs font-extrabold text-[var(--color-primary)] truncate leading-tight mt-0.5">
                      {play.title}
                    </h3>
                  </div>
                  {isActivePlaylist ? (
                    <span className="bg-[var(--color-primary)] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 uppercase shrink-0 tracking-wider shadow-[0_0_8px_rgba(23,12,121,0.25)] animate-pulse">
                      <Headphones className="w-2.5 h-2.5 animate-bounce" />
                      Sedang Diputar
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200 select-none">
                      Putar
                    </span>
                  )}
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-sm border border-white/5 bg-black/10">
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: '12px' }}
                    src={play.spotifyEmbedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Toast Notification Message Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-slate-900 text-white font-bold text-xs tracking-wider px-5 py-3 rounded-full flex items-center gap-2 shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
