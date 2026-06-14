import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Award,
  ArrowRight,
  Clock,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { FaInstagram, FaXTwitter } from 'react-icons/fa6';
import Card from '../../components/common/Card';
import { esportService } from './esportService';

import achievementPlaceholder from '../../assets/images/esport/achievement_placeholder.png';
import logoNobg from '../../assets/logos/logo-nobg.webp';

export default function EsportPage() {
  const [dbDivisions, setDbDivisions] = useState([]);
  const [dbRosters, setDbRosters] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);
  const [dbAchievements, setDbAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const divs = await esportService.getDivisions();
        const rosts = await esportService.getRosters();
        const matchesData = await esportService.getMatches();
        const achs = await esportService.getAchievements();

        setDbDivisions(divs || []);
        setDbRosters(rosts || []);
        setDbMatches(matchesData || []);
        setDbAchievements(achs || []);
      } catch (err) {
        console.error('Error loading dynamic esport data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };


  // Construct dynamic esportData mapping
  const esportData = dbDivisions.reduce((acc, dbDiv) => {
    acc[dbDiv.id] = {
      id: dbDiv.id,
      name: dbDiv.name,
      tagline: dbDiv.tagline,
      logo: dbDiv.logo,
      bannerGradient: dbDiv.banner_gradient,
      roster: dbRosters
        .filter(r => r.division_id === dbDiv.id)
        .map(r => ({
          ...r,
          imageUrl: r.image_url,
          socials: {
            instagram: r.social_instagram,
            twitter: r.social_twitter
          }
        })),
      matches: dbMatches
        .filter(m => m.division_id === dbDiv.id)
        .map(m => ({
          ...m,
          opponentLogo: m.opponent_logo,
          streamUrl: m.stream_url
        })),
      achievements: dbAchievements
        .filter(a => a.division_id === dbDiv.id)
        .map(a => ({
          ...a,
          imageUrl: a.image_url
        })),
      wallpaper: dbDiv.wallpaper || achievementPlaceholder
    };
    return acc;
  }, {});

  const handleFlipToggle = (key) => {
    setFlippedCard((prev) => (prev === key ? null : key));
  };

  const getBadgeColor = (key) => {
    switch (key) {
      case 'mobile_legends':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'efootball':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pubg_mobile':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'free_fire':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Consolidate Matches from all divisions
  const allMatches = Object.keys(esportData).reduce((acc, key) => {
    const div = esportData[key];
    const divMatches = div.matches.map((m) => ({
      ...m,
      divisionKey: key,
      divisionName: div.name,
      divisionIcon: div.logo,
      badgeStyle: getBadgeColor(key)
    }));
    return [...acc, ...divMatches];
  }, []);

  const upcomingMatches = allMatches.filter((m) => m.status === 'Upcoming');
  const pastMatches = allMatches.filter((m) => m.status === 'Past');

  const parseIndonesianDate = (dateStr) => {
    const months = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
    };
    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]] ?? 0;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date();
  };

  const sortedMatches = [...allMatches].sort((a, b) => {
    return parseIndonesianDate(a.date) - parseIndonesianDate(b.date);
  });

  // Consolidate Achievements from all divisions
  const allAchievements = Object.keys(esportData).reduce((acc, key) => {
    const div = esportData[key];
    const divAchievements = div.achievements.map((a) => ({
      ...a,
      divisionKey: key,
      divisionName: div.name,
      divisionIcon: div.logo,
      badgeStyle: getBadgeColor(key)
    }));
    return [...acc, ...divAchievements];
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-16 animate-pulse">
          <div className="text-center space-y-4">
            <div className="h-14 w-3/4 sm:w-1/2 bg-slate-200 rounded-2xl mx-auto" />
            <div className="h-4 w-5/6 sm:w-1/3 bg-slate-200 rounded-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-[380px] bg-slate-100 rounded-2xl border border-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 3D Flip Card specific CSS perspective rules */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Decorative Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] -mr-40 pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-[var(--color-secondary)]/5 rounded-full blur-[100px] -ml-40 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16 animate-fade-in">
        {/* ================= HERO SECTION ================= */}
        <div className="text-center pt-4 pb-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent mb-4 drop-shadow-sm">
            INTANIUM ESPORT
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
            Divisi esport resmi komunitas INTANIUM. Tempat para Intan bersatu, bertanding, dan membawa nama komunitas ke panggung kompetitif dengan semangat dan sportivitas.
          </p>
        </div>

        {/* ================= 3D FLIP CARDS GRID ================= */}
        <div id="divisions-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(esportData).map((key) => {
            const data = esportData[key];
            const isFlipped = flippedCard === key;
            const memberCount = data.roster.length;

            return (
              <DivisionFlipCard
                key={key}
                divKey={key}
                divLabel={data.name}
                divIcon={data.logo}
                wallpaper={data.wallpaper}
                data={data}
                isFlipped={isFlipped}
                onToggle={() => handleFlipToggle(key)}
                memberCount={memberCount}
              />
            );
          })}
        </div>

        {/* ================= MATCH SCHEDULE SECTION ================= */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-[var(--color-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <Calendar className="h-5.5 w-5.5 text-[var(--color-primary)]" /> Jadwal & Hasil Pertandingan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {sortedMatches.map((match) => {
              const isPast = match.status === 'Past';
              const isBattleRoyale = match.divisionKey === 'pubg_mobile' || match.divisionKey === 'free_fire';

              // Helper to determine scores
              let leftScore = "-";
              let rightScore = "-";
              let placementText = "";

              if (isPast) {
                if (!isBattleRoyale && match.score.includes('-')) {
                  const parts = match.score.split('-').map(s => s.trim());
                  const scoreA = parseInt(parts[0]);
                  const scoreB = parseInt(parts[1]);
                  if (match.result === 'win') {
                    leftScore = Math.max(scoreA, scoreB);
                    rightScore = Math.min(scoreA, scoreB);
                  } else {
                    leftScore = Math.min(scoreA, scoreB);
                    rightScore = Math.max(scoreA, scoreB);
                  }
                } else {
                  // Battle Royale placement (e.g. Rank 5, Booyah!)
                  placementText = match.score;
                }
              }

              return (
                <div
                  key={match.id}
                  className="bg-white border border-[var(--color-primary)]/20 rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  {/* Date & Division Header */}
                  <div className="bg-[var(--color-primary)] py-1.5 text-center">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {match.date} | {match.divisionName}
                    </span>
                  </div>

                  {/* Match Details Layout (Left Team - Center Stats - Right Team) */}
                  <div className="py-3 px-4 flex-grow flex flex-col justify-center">
                    <div className="w-full flex items-center justify-between gap-1">
                      {/* Left Team (Intanium) */}
                      <div className="flex-1 flex flex-col items-center text-center max-w-[75px]">
                        <img src={logoNobg} alt="Intanium Logo" className="w-8 h-8 object-contain filter drop-shadow-sm select-none" />
                        <span className="text-[10px] font-black text-slate-800 tracking-wider mt-1 truncate w-full">INTANIUM</span>
                      </div>

                      {/* Left Score */}
                      {isPast && !isBattleRoyale && (
                        <div className="text-2xl font-black text-slate-800 tabular-nums px-1.5">
                          {leftScore}
                        </div>
                      )}

                      {/* Center Info */}
                      <div className="flex-1 flex flex-col items-center text-center px-1 min-w-[110px] max-w-[130px]">
                        {/* Match Time or Placement text */}
                        {isPast && isBattleRoyale ? (
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded border mb-1.5 ${match.result === 'win'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-500/10'
                              : 'bg-rose-50 text-rose-600 border-rose-500/10'
                            }`}>
                            {placementText}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {match.time.split(' ')[0]}
                          </span>
                        )}

                        {/* Stage Badge */}
                        <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-red-600 text-white mt-1 text-center truncate w-full max-w-[100px]" title={match.stage}>
                          {match.stage.split('-')[0].trim()}
                        </span>
                      </div>

                      {/* Right Score */}
                      {isPast && !isBattleRoyale && (
                        <div className="text-2xl font-black text-slate-800 tabular-nums px-1.5">
                          {rightScore}
                        </div>
                      )}

                      {/* Right Team (Opponent) */}
                      <div className="flex-1 flex flex-col items-center text-center max-w-[75px]">
                        {match.opponentLogo && (match.opponentLogo.startsWith('http') || match.opponentLogo.startsWith('blob:')) ? (
                          <img src={match.opponentLogo} alt={match.opponent} className="w-8 h-8 object-contain rounded-full border border-slate-200 bg-white" />
                        ) : (
                          <span className="text-xl filter drop-shadow-sm select-none" role="img" aria-label="opponent logo">{match.opponentLogo}</span>
                        )}
                        <span className="text-[10px] font-black text-slate-800 tracking-wider mt-1 truncate w-full" title={match.opponent}>
                          {match.opponent.split(' ')[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= TROPHY CABINET SECTION ================= */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-black text-[var(--color-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <Award className="h-6 w-6 text-[var(--color-primary)]" /> Ruang Prestasi (Trophy Room)
          </h3>
          {allAchievements.length === 0 ? (
            <Card hoverEffect={false} className="border border-[var(--border-color)] bg-white p-8 text-center text-sm text-[var(--text-muted)] italic">
              Belum ada raihan piala atau prestasi yang tercatat.
            </Card>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {allAchievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0px 10px 30px -5px rgba(0, 0, 0, 0.08)',
                    borderColor: 'var(--color-primary)',
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                  className="w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white flex flex-col shadow-sm cursor-pointer"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={ach.imageUrl || achievementPlaceholder}
                      alt={ach.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Title */}
                      <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                        {ach.title}
                      </h4>

                      {/* Subtitle (Date • Rank) */}
                      <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span>{ach.date}</span>
                        <span>&bull;</span>
                        <span className="text-[var(--color-secondary)] flex items-center gap-1">
                          {ach.badge && (ach.badge.startsWith('http') || ach.badge.startsWith('blob:')) ? (
                            <img src={ach.badge} alt={ach.rank} className="w-4 h-4 object-contain rounded" />
                          ) : (
                            <span>{ach.badge}</span>
                          )} {ach.rank}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                        Membawa nama INTANIUM di kancah kompetitif tingkat regional/nasional.
                      </p>
                    </div>

                    {/* Footer Area with Action Button */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                      <p className="font-extrabold text-[10px] text-[var(--color-primary)] uppercase tracking-wider">
                        {ach.divisionName}
                      </p>
                      <button
                        onClick={() => {
                          setFlippedCard(ach.divisionKey);
                          document.getElementById('divisions-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] flex items-center gap-1 hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer group"
                      >
                        Lihat Roster
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function DivisionFlipCard({
  divKey,
  divLabel,
  divIcon,
  wallpaper,
  data,
  isFlipped,
  onToggle,
  memberCount
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      className="w-full h-[380px] perspective-1000 select-none group"
      role="button"
      tabIndex={0}
      aria-expanded={isFlipped}
      aria-label={`Divisi ${divLabel}, klik untuk melihat roster`}
      onClick={onToggle}
      onKeyDown={handleKeyPress}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full h-full transform-style-3d border border-[var(--border-color)] rounded-2xl cursor-pointer shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
          {/* Background Wallpaper Image & Premium Dark Overlay */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <img
              src={wallpaper}
              alt={divLabel}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              width="260"
              height="380"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
          </div>

          {/* Top Info */}
          <div className="relative z-10 flex justify-end items-start">
            <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 shadow-md">
              {memberCount} Roster
            </span>
          </div>

          {/* Bottom Content Group (Title directly above CTA) */}
          <div className="relative z-10 space-y-3">
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              {divLabel}
            </h3>
            <div className="flex items-center justify-between border-t border-white/20 pt-3 text-white hover:text-indigo-200 transition-colors">
              <span className="text-[10px] font-extrabold uppercase tracking-wider drop-shadow-sm">
                Lihat Roster Lengkap
              </span>
              <ChevronRight className="h-4 w-4 drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-inner">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 flex-shrink-0">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-primary)]">
              Roster {divLabel}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 rounded-full text-gray-400 hover:text-[var(--color-primary)] hover:bg-slate-100 transition-colors focus:outline-none"
              title="Kembali"
              aria-label="Kembali ke depan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrollable Members List */}
          <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-2.5 scrollbar-thin">
            {data.roster.map((member) => (
              <div
                key={member.ign}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-[var(--color-primary)]/10 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 border border-slate-200 bg-white flex-shrink-0">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                      loading="lazy"
                      width="28"
                      height="28"
                    />
                  </div>
                  <div className="leading-tight">
                    <h5 className="font-extrabold text-[var(--color-primary)] text-[11px]">
                      {member.ign}
                    </h5>
                    <p className="text-[9px] text-[var(--text-muted)] font-medium truncate max-w-[80px]">
                      {member.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-block px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/10">
                    {member.role.split(' ')[0]}
                  </span>

                  {/* Aligned Social Links */}
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 text-slate-400">
                    {member.socials.instagram ? (
                      <a
                        href={member.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-pink-500 transition-colors rounded p-0.5 flex items-center justify-center cursor-pointer"
                        aria-label={`Instagram ${member.ign}`}
                      >
                        <FaInstagram className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    {member.socials.twitter ? (
                      <a
                        href={member.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-blue-500 transition-colors rounded p-0.5 flex items-center justify-center cursor-pointer"
                        aria-label={`Twitter ${member.ign}`}
                      >
                        <FaXTwitter className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flip Back Click Area */}
          <div className="flex-shrink-0 pt-2 border-t border-[var(--border-color)]/30 flex justify-center">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
              Klik kartu untuk kembali
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
