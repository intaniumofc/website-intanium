import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Play,
  Star,
  User,
  Zap
} from 'lucide-react';
import { aboutIntanService } from './aboutIntanService';
import Loading from '../../components/common/Loading';
import ScrollExpandMedia from '../../components/media/ScrollExpandMedia';
import intanVideo from '../../assets/images/intan-02.mp4';
import intanPoster from '../../assets/images/intan-02.jpg';
import intanBg from '../../assets/images/intan-04.jpg';
import intanProfile from '../../assets/images/intan-01.jpg';

const PREMIUM_EASE = [0.22, 1, 0.36, 1];

const sectionReveal = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: PREMIUM_EASE
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      duration: 0.75,
      ease: PREMIUM_EASE
    }
  }
};

// ScrollExpansionHero was replaced by ScrollExpandMedia component

function ProfileSummary({ bio }) {
  const socialLinks = {
    'Instagram Followers': 'https://www.instagram.com/intan.jkt48',
    'Twitter / X': 'https://twitter.com/N_IntanJKT48',
    'TikTok Followers': 'https://www.tiktok.com/@jkt48.intan',
    'Showroom Room': 'https://www.showroom-live.com/r/JKT48_Intan'
  };

  const statIconMap = {
    'Instagram Followers': (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    'Twitter / X': (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    'TikTok Followers': (
      <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    'Showroom Room': (
      <div className="flex flex-col items-center leading-none text-[8px] font-black tracking-tight select-none">
        <span>SHOW</span>
        <span>ROOM</span>
      </div>
    )
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionReveal}
      className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch"
    >
      {/* Left Column: Visual Profile Card */}
      <motion.div variants={fadeUp} className="lg:col-span-5 flex">
        <div className="relative w-full overflow-hidden rounded-4xl border border-(--border-color) bg-white/70 p-6 text-center shadow-xl shadow-(--color-primary)/5 backdrop-blur-md flex flex-col justify-between group">
          {/* Top subtle neon indicator line */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-cyan-400 via-(--color-primary) to-purple-500" />
          
          {/* Light radial glow behind the profile image */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-linear-to-tr from-cyan-400/15 to-purple-500/15 rounded-full blur-2xl pointer-events-none -z-10 group-hover:scale-110 transition-transform duration-700" />

          <div className="pt-4 flex flex-col items-center">
            {/* Holographic profile ring */}
            <div className="relative mb-6 h-52 w-52 overflow-hidden rounded-3xl border-2 border-white p-1 bg-linear-to-tr from-cyan-400 via-(--color-primary) to-purple-500 shadow-2xl transition-all duration-500 group-hover:scale-103 group-hover:rotate-1">
              <img 
                src={intanProfile} 
                alt="Nur Intan" 
                className="h-full w-full object-cover rounded-2xl" 
              />
            </div>
            
            {/* Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--color-primary-light) border border-(--color-primary)/10 text-(--color-primary) font-bold text-xs tracking-wider uppercase mb-3 select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {bio.generation}
            </span>

            <h2 className="text-3xl font-black text-(--color-primary) tracking-tight group-hover:text-(--color-primary-hover) transition-colors duration-300">
              {bio.fullName}
            </h2>
            <p className="text-sm font-extrabold text-(--color-secondary) tracking-wide mt-1">
              {bio.nickname}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-(--border-color) pt-6 text-left">
            {[
              ['Asal', bio.origin || 'Bogor, Jawa Barat'],
              ['Ulang Tahun', bio.dateOfBirth],
              ['Zodiak', bio.zodiac],
              ['Gol. Darah', bio.bloodType || 'B']
            ].map(([label, value]) => (
              <div key={label} className="p-3 rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xs flex flex-col justify-center shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-(--text-muted)">{label}</span>
                <span className="font-bold text-sm text-(--color-primary) truncate mt-0.5">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Column: Detailed Bio & Interactive Stats */}
      <motion.div variants={staggerContainer} className="space-y-6 lg:col-span-7 flex flex-col justify-between">
        {/* Bio Description Box */}
        <motion.div 
          variants={fadeUp} 
          className="relative overflow-hidden rounded-4xl border border-(--border-color) bg-white/70 p-6 sm:p-8 shadow-xl shadow-(--color-primary)/5 backdrop-blur-md flex-grow"
        >
          {/* Subtle gradient blob inside card */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-(--color-primary-light) rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--color-primary-light) px-3 py-1 text-xs font-bold text-(--color-primary)">
            <User className="h-4 w-4" />
            Profil singkat
          </div>
          
          <h3 className="text-3xl font-black text-(--color-primary) leading-tight tracking-tight">
            Intan permata yang berkilau
          </h3>
          
          <div className="mt-5 space-y-4">
            <p className="text-base sm:text-lg leading-relaxed text-(--text-secondary) font-medium italic border-l-2 border-(--color-secondary) pl-4">
              "{bio.description}"
            </p>
            <p className="text-sm leading-relaxed text-(--text-secondary) sm:text-base">
              Nur Intan (dikenal sebagai Intan JKT48) adalah member trainee berbakat dari Generasi ke-13 JKT48 yang diperkenalkan resmi pada tanggal 31 Oktober 2024. Karakter keceriaan yang khas dengan pembawaan hangat, ekspresif, dan memiliki kedekatan erat dengan komunitas pendukung menjadikannya sebagai sosok permata yang berkilau bagi para penggemar.
            </p>
            <p className="text-xs leading-relaxed text-(--text-muted)">
              Halaman profil ini didedikasikan secara khusus untuk mendokumentasikan serta mengikuti perkembangan karir dari Nur Intan di JKT48.
            </p>
          </div>
        </motion.div>

        {/* Interactive Social Media Stats Grid */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {bio.socialStats.map((stat) => {
            const IconElement = statIconMap[stat.label] || null;
            const targetUrl = socialLinks[stat.label] || '#';

            return (
              <motion.a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={stat.label}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.025 }}
                className="group flex flex-col items-center justify-center rounded-3xl border border-(--border-color) bg-white/70 p-4 text-center shadow-lg shadow-(--color-primary)/4 backdrop-blur-md cursor-pointer hover:border-(--color-primary)/20 hover:bg-white/95 transition-all duration-300"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-light) text-(--color-primary) group-hover:bg-(--color-primary) group-hover:text-white transition-all duration-300 shadow-xs">
                  {IconElement}
                </div>
                <h4 className="text-xs font-black text-(--color-primary) uppercase tracking-wider line-clamp-1">{stat.label.split(' ')[0]}</h4>
                <p className="mt-1 text-sm font-extrabold text-(--color-secondary) truncate max-w-full">{stat.value}</p>
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function TriviaSection({ trivia }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={sectionReveal}
      className="rounded-4xl border border-(--border-color) bg-white/75 p-6 shadow-xl shadow-(--color-primary)/8 backdrop-blur-md sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--color-primary-light) text-(--color-primary)">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-(--text-muted)">Little details</p>
          <h3 className="text-2xl font-black text-(--color-primary)">Fakta Menarik & Trivia</h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {trivia.map((fact) => (
          <motion.div
            key={fact}
            variants={fadeUp}
            className="flex gap-3 rounded-2xl border border-(--border-color) bg-white/70 p-4"
          >
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-(--color-secondary)" />
            <p className="text-sm leading-relaxed text-(--text-secondary)">{fact}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default function AboutIntanPage() {
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set document title on mount for SEO best practices
  useEffect(() => {
    document.title = 'Tentang Nur Intan | Official Community Space';
  }, []);

  useEffect(() => {
    aboutIntanService.getBio()
      .then((data) => {
        setBio(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <Loading fullPage={false} message="Membaca biodata Intan..." />;

  return (
    <div className="relative -mt-8 space-y-16 overflow-visible">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc={intanVideo}
        posterSrc={intanPoster}
        bgImageSrc={intanBg}
        title="Nur Intan"
        scrollToExpand="Scroll untuk membuka cerita"
        textBlend={false}
      >
        <div className="mx-auto max-w-6xl space-y-10 px-1 pb-12">
          <ProfileSummary bio={bio} />
          <TriviaSection trivia={bio.trivia} />

          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            variants={sectionReveal}
            className="overflow-hidden rounded-4xl border border-(--border-color) bg-linear-to-br from-(--color-primary) to-(--color-primary-hover) p-8 text-white shadow-2xl shadow-(--color-primary)/18"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                  <Heart className="h-4 w-4 text-(--color-secondary)" />
                  Community note
                </div>
                <h3 className="text-2xl font-black sm:text-3xl">Temukan cahayaku di hatimu.</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Dukungan komunitas membuat setiap momen kecil jadi arsip yang berarti, dari live, musik, obrolan, sampai cerita yang tumbuh bersama.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/14">
                <Play className="h-7 w-7 fill-white text-white" />
              </div>
            </div>
          </motion.section>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
