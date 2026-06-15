import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Play,
  Calendar,
  MapPin,
  Clock,
  ListMusic,
  Mic2,
  Ticket,
  Sparkles,
  PlayCircle,
  Video,
  Award,
  ArrowRight,
  Plus,
  ChevronLeft,
  ChevronRight,
  Music
} from 'lucide-react';
import { aboutIntanService } from './aboutIntanService';
import { scheduleService } from '../schedule/scheduleService';
import { FaThreads } from 'react-icons/fa6';
import Loading from '../../components/common/Loading';
import ScrollExpandMedia from '../../components/media/ScrollExpandMedia';
import intanVideo from '../../assets/images/intan-02.mp4';
import intanPoster from '../../assets/images/intan-02.webp';
import intanBg from '../../assets/images/intan-04.webp';
import intanProfile from '../../assets/images/Nur_Intan.webp';
import intan1 from '../../assets/images/intan-01.webp';
import { ImageSwiper } from '../../components/ui/ImageSwiper';
import {
  CalendarBlank as PhCalendarBlank,
  Drop as PhDrop,
  Ruler as PhRuler,
  MapPin as PhMapPin,
  UsersThree as PhUsersThree,
  ShootingStar as PhShootingStar
} from '@phosphor-icons/react';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: PREMIUM_EASE }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// scaleIn removed as it was unused

// Reusable IconCrystalTile Component for crystal glass badges
function IconCrystalTile({ icon: IconComp }) {
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/70 bg-white/65 text-[#17105F] shadow-[0_18px_40px_rgba(23,16,95,0.12),inset_0_1.5px_3px_rgba(255,255,255,0.85)] backdrop-blur-xl transition-all duration-300 group-hover:border-purple-200/50 group-hover:bg-white/75 group-hover:shadow-[0_22px_45px_rgba(124,58,237,0.18),inset_0_1.5px_3px_rgba(255,255,255,0.95)]">
      {/* Radial Highlight */}
      <span className="absolute inset-0 rounded-[1.35rem] bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.95),transparent_58%)] opacity-80 pointer-events-none" />
      
      {/* Subtle Inner Glow */}
      <span className="absolute inset-[1px] rounded-[1.28rem] border border-white/40 pointer-events-none" />

      {/* Phosphor Icon with Duotone styling */}
      <IconComp
        size={30}
        weight="duotone"
        className="relative z-10 text-[#17105F] transition-transform duration-350 ease-out group-hover:scale-105 group-hover:rotate-[2deg] select-none"
      />

      {/* Hover Sparkle Accent */}
      <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-(--color-secondary) opacity-60 scale-0 group-hover:scale-100 transition-transform duration-350" />
    </div>
  );
}

// Reusable ProfileFactItem Component for premium profile stats
function ProfileFactItem({ fact, delay = 0 }) {
  const { label, value, icon: IconComp, position } = fact;
  const isRight = position === 'right';

  return (
    <motion.div
      className={`flex items-center gap-4.5 group cursor-default ${
        isRight ? 'md:flex-row-reverse md:text-right' : 'text-left'
      }`}
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{ y: -3, transition: { duration: 0.25 } }}
    >
      <IconCrystalTile icon={IconComp} />
      <div className={`flex flex-col justify-center pt-0.5 ${isRight ? 'md:items-end' : 'items-start'}`}>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest transition-colors duration-300 group-hover:text-(--color-primary) mb-1">
          {label}
        </h3>
        <p className="text-base sm:text-lg font-black text-(--color-primary) leading-tight transition-colors duration-300 group-hover:text-indigo-950">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// Premium StatCounter Component with spring counting and interactive icon/line hover
function StatCounter({ icon: IconComp, value, label, description, delay = 0 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { once: false, amount: 0.1 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAnimated(true);
      const endNum = parseInt(value.replace(/\D/g, '')) || 0;
      let startTime = null;
      const duration = 1.4; // seconds

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        setCount(Math.floor(easeProgress * endNum));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    } else if (!isInView && hasAnimated) {
      setHasAnimated(false);
      setCount(0);
    }
  }, [isInView, value, hasAnimated]);

  const suffix = value.replace(/[\d]/g, '');

  return (
    <motion.div
      ref={elementRef}
      className="bg-(--bg-card) border border-(--border-color) p-6 rounded-3xl flex flex-col items-center text-center group hover:bg-white hover:border-(--color-primary)/20 transition-all duration-300 shadow-(--box-shadow-sm) relative"
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl bg-(--color-primary-light) flex items-center justify-center mb-4 text-(--color-primary) group-hover:bg-(--color-primary) group-hover:text-white transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        <IconComp className="w-6 h-6" />
      </motion.div>
      <div className="text-3.5xl font-black text-(--color-primary) flex items-center justify-center font-mono tracking-tight leading-none">
        <span>{count}</span>
        <span className="text-(--color-secondary) font-sans text-xl ml-0.5">{suffix}</span>
      </div>
      <h4 className="text-xs font-bold text-(--text-primary) mt-3 line-clamp-1">{label}</h4>
      <p className="text-[10px] text-(--text-muted) mt-1.5 leading-relaxed line-clamp-2 max-w-50">{description}</p>
      <motion.div className="w-8 h-0.5 bg-(--color-secondary) mt-4 group-hover:w-16 transition-all duration-300" />
    </motion.div>
  );
}

// Built-in minimalist YouTube Video Modal Player
function VideoModal({ video, onClose }) {
  if (!video) return null;
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-[#121225] rounded-3xl overflow-hidden shadow-(--box-shadow-lg) aspect-video z-10 border border-(--border-color)">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-(--color-accent) hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Tutup"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          src={embedUrl}
          title={video.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// Reusable Section Header Component
function SectionHeader({ label, title, description, id }) {
  return (
    <motion.div
      id={id}
      variants={fadeUp}
      className="mb-8 border-b border-(--border-color) pb-5 scroll-mt-24"
    >
      <div>
        {label && <p className="text-[10px] font-black uppercase tracking-widest text-(--color-secondary) mb-0.5">{label}</p>}
        <h3 className="text-2xl font-black text-(--color-primary) tracking-tight sm:text-3xl font-heading">{title}</h3>
      </div>
      {description && <p className="mt-2 text-sm text-(--text-secondary) leading-relaxed max-w-2xl">{description}</p>}
    </motion.div>
  );
}

const Radio = (props) => (
  <svg {...props} className="w-5 h-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
  </svg>
);

const TRANSITION_CONFIG = {
  duration: 0.7,
  ease: [0.4, 0.2, 0.2, 1],
};

const TRANSFORM_STYLES = {
  transformStyle: "preserve-3d",
  perspective: "1000px",
  backfaceVisibility: "hidden",
};

const FlipCardContext = React.createContext(undefined);

function useFlipCardContext() {
  const context = React.useContext(FlipCardContext);
  if (!context) {
    throw new Error("useFlipCardContext must be used within a FlipCard");
  }
  return context;
}

const FlipCard = React.forwardRef(({ className, flipDirection = "horizontal", isFlipped, onFlip, disabled, children, ...props }, ref) => {
  const contextValue = React.useMemo(() => ({ isFlipped, flipDirection, disabled }), [isFlipped, flipDirection, disabled]);
  return (
    <FlipCardContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={`relative border-none bg-none shadow-none rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 ${disabled ? "pointer-events-none" : ""} ${className || ""}`}
        style={{ ...TRANSFORM_STYLES, ...props.style }}
        onClick={() => !disabled && onFlip?.(!isFlipped)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onFlip?.(!isFlipped);
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-pressed={isFlipped}
        {...props}
      >
        {children}
      </div>
    </FlipCardContext.Provider>
  );
});
FlipCard.displayName = "FlipCard";

const FlipCardFront = React.forwardRef(({ className, ...props }, ref) => {
  const { isFlipped, flipDirection } = useFlipCardContext();
  const rotation = React.useMemo(() => {
    if (!isFlipped) return { rotateX: 0, rotateY: 0 };
    return flipDirection === "horizontal" ? { rotateY: -180, rotateX: 0 } : { rotateX: -180, rotateY: 0 };
  }, [isFlipped, flipDirection]);

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 z-20 w-full h-full overflow-hidden ${className || ""}`}
      initial={false}
      animate={rotation}
      transition={TRANSITION_CONFIG}
      style={{ ...TRANSFORM_STYLES, ...props.style }}
      {...props}
    />
  );
});
FlipCardFront.displayName = "FlipCardFront";

const FlipCardBack = React.forwardRef(({ className, ...props }, ref) => {
  const { isFlipped, flipDirection } = useFlipCardContext();
  const rotation = React.useMemo(() => {
    if (isFlipped) return { rotateX: 0, rotateY: 0 };
    return flipDirection === "horizontal" ? { rotateY: 180, rotateX: 0 } : { rotateX: 180, rotateY: 0 };
  }, [isFlipped, flipDirection]);

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 z-10 w-full h-full ${className || ""}`}
      initial={false}
      animate={rotation}
      transition={TRANSITION_CONFIG}
      style={{ ...TRANSFORM_STYLES, ...props.style }}
      {...props}
    />
  );
});
FlipCardBack.displayName = "FlipCardBack";

const SetlistPosterCard = ({ setlist }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = !shouldReduceMotion;
  // Deterministic slight tilt based on setlist name length
  const tiltAngle = setlist.name.length % 2 === 0 ? 1.5 : -1.5;

  const getThemePinColor = () => {
    switch (setlist.theme) {
      case 'aitakatta': return 'bg-blue-500 border-blue-700';
      case 'pajama': return 'bg-indigo-500 border-indigo-700';
      case 'kirakira': return 'bg-purple-500 border-purple-700';
      case 'passion': return 'bg-rose-500 border-rose-700';
      case 'ramune': return 'bg-cyan-500 border-cyan-700';
      case 'renai': return 'bg-pink-500 border-pink-700';
      case 'gandeng': return 'bg-pink-600 border-pink-800';
      default: return 'bg-red-500 border-red-700';
    }
  };

  const containerVariants = {
    rest: {
      scale: 1,
      y: 0,
      rotateZ: tiltAngle * 0.5,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
    },
    hover: shouldAnimate ? {
      scale: 1.03,
      y: -4,
      rotateZ: tiltAngle * 1.5,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    } : {},
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className="relative w-full max-w-70 sm:max-w-75 mx-auto select-none bg-transparent"
    >
      <FlipCard
        isFlipped={isFlipped}
        onFlip={setIsFlipped}
        className="w-full aspect-[3/3.8] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2"
      >
        {/* ================= FRONT SIDE (Polaroid) ================= */}
        <FlipCardFront className="p-3 pb-20 bg-[#fdfcf8] rounded-sm border border-black/5 shadow-md flex flex-col justify-between">
          {/* Push Pin */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 drop-shadow-sm">
            <div className={`w-3.5 h-3.5 rounded-full shadow-[inset_-1px_-2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.4)] border relative overflow-hidden ${getThemePinColor()}`}>
              <div className="absolute top-[1.5px] left-[2.5px] w-1.5 h-1.5 bg-white/70 rounded-full blur-[0.5px]"></div>
            </div>
          </div>

          {/* Image Wrapper */}
          <div className="relative w-full h-full rounded-sm overflow-hidden bg-gray-100 border border-black/5">
            {setlist.image ? (
              <img src={setlist.image} alt={setlist.name} className="w-full h-full object-cover object-center" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <Music className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-500 uppercase">{setlist.name}</span>
              </div>
            )}
          </div>

          {/* Polaroid Bottom Text */}
          <div className="absolute bottom-0 left-0 right-0 h-20 px-4 flex flex-col justify-center items-center">
            <span className="text-slate-800 font-serif italic text-xl md:text-2xl tracking-tight leading-none text-center opacity-90" style={{ transform: 'rotate(-2deg)' }}>
              {setlist.name}
            </span>
            <span className="text-slate-600 font-mono text-[9px] mt-1.5 uppercase tracking-widest flex items-center gap-1">
              Tap untuk unit songs
            </span>
          </div>
        </FlipCardFront>

        {/* ================= BACK SIDE (Polaroid Back) ================= */}
        <FlipCardBack
          className="bg-[#fdfcf8] p-5 pb-6 rounded-sm border border-black/5 shadow-md text-slate-800 flex flex-col justify-between"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")'
          }}
        >
          {/* Push Pin Needle Point */}
          <div className="absolute top-3.25 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-zinc-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8),inset_-1px_-1px_1px_rgba(0,0,0,0.4)] border border-zinc-400"></div>
          </div>

          <div className="space-y-3 h-full flex flex-col justify-between pt-1 relative z-10">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase border-b border-slate-200 pb-1">Unit Songs</span>
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-2 overflow-y-auto custom-scrollbar-light my-2 max-h-55 px-1">
              {setlist.unitSongs.map((song, i) => (
                <div key={i} className="flex items-start gap-2 text-left text-[12px] font-serif italic text-slate-700">
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="leading-tight">{song}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                Kembali ke poster
              </span>
            </div>
          </div>
        </FlipCardBack>
      </FlipCard>
    </motion.div>
  );
};

const TriviaItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = React.useId();

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className={`rounded-2xl border transition-colors duration-300 ${isOpen
        ? "border-(--color-primary)/40 bg-(--color-primary-light)/40"
        : "border-(--border-color) bg-(--bg-card)/60"
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`trivia-panel-${uniqueId}`}
        className="flex w-full items-center justify-between gap-4 py-3.5 px-4.5 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 rounded-2xl"
      >
        <span
          className={`text-sm sm:text-base font-bold transition-colors duration-300 ${isOpen ? "text-(--color-primary)" : "text-(--text-primary) group-hover:text-(--color-secondary)"
            }`}
        >
          {question}
        </span>
        <motion.span
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.25, ease: PREMIUM_EASE }}
          className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isOpen ? "bg-(--color-primary) text-white" : "bg-(--color-primary-light) text-(--color-primary)"
            }`}
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>
      <motion.div
        id={`trivia-panel-${uniqueId}`}
        role="region"
        initial={false}
        animate={{
          height: isOpen ? "auto" : "0px",
          marginBottom: isOpen ? "12px" : "0px"
        }}
        transition={{ duration: 0.35, ease: PREMIUM_EASE }}
        className="overflow-hidden px-4.5"
      >
        <p className={`text-xs sm:text-sm leading-relaxed text-(--text-secondary) font-medium ${question?.includes('Quote') || question?.includes('quote') ? 'italic text-base text-(--color-primary) border-l-2 border-(--color-accent) pl-3 mt-1' : ''}`}>
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const ScheduleSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getEvents('all');
        if (isMounted) {
          const mapped = data.map(event => {
            const dateObj = new Date(event.time);
            return {
              id: event.id,
              date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
              time: dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
              title: event.title,
              location: event.description || 'Online',
              type: event.platform,
              link: event.link
            };
          });
          setScheduleData(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      }
    };
    fetchSchedules();
    return () => { isMounted = false; };
  }, []);

  const getDayEventStyle = (events, isSelected) => {
    if (isSelected) {
      if (events.length > 0) {
        const firstType = events[0].type;
        let ringColor;
        if (firstType === 'Show Theater') ringColor = 'ring-rose-500';
        else if (firstType === 'Video Call') ringColor = 'ring-sky-500';
        else if (firstType === 'Birthday') ringColor = 'ring-amber-500';
        else if (['YouTube', 'IDN Live', 'Showroom', 'TikTok'].includes(firstType)) ringColor = 'ring-indigo-500';
        else ringColor = 'ring-purple-500';

        return `bg-slate-100 text-slate-800 ring-2 ${ringColor} scale-105 shadow-md`;
      }
      return 'bg-[#170C79] text-white shadow-md scale-105 ring-2 ring-indigo-300';
    }

    if (events.length === 0) {
      return 'text-slate-600 hover:bg-indigo-50 hover:text-[#170C79]';
    }

    const firstType = events[0].type;
    if (firstType === 'Show Theater') {
      return 'bg-rose-400 text-white hover:bg-rose-500 shadow-xs';
    }
    if (firstType === 'Video Call') {
      return 'bg-sky-400 text-white hover:bg-sky-500 shadow-xs';
    }
    if (firstType === 'Birthday') {
      return 'bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-xs';
    }
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok'].includes(firstType)) {
      return 'bg-indigo-400 text-white hover:bg-indigo-500 shadow-xs';
    }
    return 'bg-purple-400 text-white hover:bg-purple-500 shadow-xs';
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return scheduleData.filter(e => e.date === dateStr);
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const upcomingEvents = scheduleData.filter(e => e.date !== selectedDateStr).slice(0, selectedEvents.length <= 1 ? 3 : 0);



  const getTypeStyle = (type) => {
    if (type === 'Show Theater') return 'bg-rose-50 text-rose-600 border-rose-100';
    if (type === 'Video Call') return 'bg-sky-50 text-sky-600 border-sky-100';
    if (type === 'Birthday') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (['YouTube', 'IDN Live', 'Showroom', 'TikTok'].includes(type)) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
  };

  const categoryLegend = [
    { label: 'Theater', color: 'bg-rose-400' },
    { label: 'Video Call', color: 'bg-sky-400' },
    { label: 'Birthday', color: 'bg-amber-400' },
    { label: 'Other Events', color: 'bg-purple-400' },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      className="space-y-5"
    >
      <SectionHeader
        label="Jadwal Acara"
        title="Schedule & Kegiatan"
        description="Pantau jadwal pertunjukan teater, siaran langsung, dan berbagai event off-air Nur Intan."
      />

      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-[2rem] border border-(--border-color) bg-white/72 p-4 shadow-(--box-shadow-md) backdrop-blur-md sm:p-5 lg:p-6"
      >
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-(--color-primary-light)/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-[rgba(236,72,153,0.08)] blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[300px_1fr] justify-between gap-5 lg:gap-7 items-start">
          {/* Left Panel: Mini Calendar */}
          <div className="bg-[#fdfcf8]/95 p-4 rounded-3xl border border-(--border-color) shadow-(--box-shadow-sm) mx-auto w-full max-w-sm lg:max-w-none">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-(--color-primary) font-heading">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)" aria-label="Bulan sebelumnya">
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)" aria-label="Bulan berikutnya">
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 mb-1.5 text-center">
            {dayNames.map(day => (
              <div key={day} className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{day}</div>
            ))}
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 gap-y-1.5 gap-x-0.5">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
              const isSelected = isSameDate(date, selectedDate);
              const dayEvents = getEventsForDate(date);
              const formattedDateLabel = `${i + 1} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

              return (
                <div key={i} className="flex flex-col items-center justify-center">
                  <button
                    onClick={() => setSelectedDate(date)}
                    aria-label={formattedDateLabel}
                    aria-pressed={isSelected}
                    className={`w-7.5 h-7.5 flex items-center justify-center rounded-full text-[12px] font-black transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) ${
                      getDayEventStyle(dayEvents, isSelected)
                    }`}
                  >
                    {i + 1}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-500">
              {categoryLegend.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          </div>

          {/* Right Panel: Details */}
          <div className="flex flex-col h-full rounded-3xl border border-(--border-color) bg-white/86 p-4 shadow-xs sm:p-5">
          <div className="mb-4 border-b border-(--border-color) pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-(--color-primary) font-heading">
              {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            <p className="text-xs sm:text-sm text-(--text-muted) mt-1 font-semibold">
              {selectedEvents.length > 0 ? `Ada ${selectedEvents.length} momen Intan di tanggal ini` : 'Belum ada jadwal terkonfirmasi'}
            </p>
          </div>

          <div className="space-y-3">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event, idx) => (
                <div key={idx} className="group p-4 rounded-2xl border border-(--border-color) bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${getTypeStyle(event.type)}`}>
                        {event.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-black text-(--color-primary) group-hover:text-(--color-secondary) transition-colors leading-tight">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    {event.link ? (
                      <>
                        <span className="text-[9px] text-slate-400 italic mb-2 hidden sm:block">Dukung Intan secara langsung!</span>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="self-start sm:self-auto px-4 py-2 bg-(--color-primary-light) text-(--color-primary) hover:bg-(--color-primary) hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
                          {['YouTube', 'IDN Live', 'Showroom', 'TikTok'].includes(event.type) ? 'Buka Live' : 'Lihat Detail'} <ArrowRight className="w-3 h-3" />
                        </a>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-medium px-2 py-1 bg-slate-50 rounded-md border border-slate-100">Jadwal Internal</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 rounded-2xl border border-dashed border-(--border-color) bg-slate-50/50">
                <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">Tidak ada jadwal untuk hari ini.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Pilih tanggal lain yang memiliki penanda titik, atau nantikan pengumuman acara selanjutnya.</p>
              </div>
            )}
          </div>

          {/* Upcoming Mini List if <= 1 event */}
          {upcomingEvents.length > 0 && selectedEvents.length <= 1 && (
            <div className="mt-6 pt-5 border-t border-(--border-color)">
              <h4 className="text-xs font-bold text-slate-400 tracking-widest mb-3">Upcoming</h4>
              <div className="space-y-2.5">
                {upcomingEvents.map((evt, idx) => {
                  const day = evt.date.split('-')[2];
                  const monthIdx = parseInt(evt.date.split('-')[1]) - 1;
                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDate(new Date(evt.date))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDate(new Date(evt.date));
                        }
                      }}
                      className="flex items-center justify-between group cursor-pointer bg-white/45 hover:bg-white/75 p-3 rounded-xl border border-transparent hover:border-(--border-color) transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-(--color-primary)">
                          <span className="text-[10px] font-bold leading-none">{day}</span>
                          <span className="text-[8px] uppercase tracking-wider">{monthNames[monthIdx].substring(0, 3)}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-700 group-hover:text-(--color-primary) transition-colors line-clamp-1">{evt.title}</h5>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5 shrink-0" />{evt.time} - {evt.location}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-(--color-secondary) transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default function AboutIntanPage() {
  const [bio, setBio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // States for interactive filter tabs
  const [videoFilter, setVideoFilter] = useState('All');

  // State for YouTube Modal Player
  const [activeVideo, setActiveVideo] = useState(null);

  // Scrolling reference and transforms for floating parallax elements
  const pageRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -25]);

  // Profile facts structure mapping user-provided specs with dynamic database values
  const PROFILE_FACTS = React.useMemo(() => {
    if (!bio) return [];
    return [
      {
        label: 'Tanggal Lahir',
        value: bio.dateOfBirth,
        icon: PhCalendarBlank,
        position: 'left',
        delay: 0
      },
      {
        label: 'Golongan Darah',
        value: `${bio.bloodType}`,
        icon: PhDrop,
        position: 'left',
        delay: 0.2
      },
      {
        label: 'Tinggi Badan',
        value: bio.height,
        icon: PhRuler,
        position: 'left',
        delay: 0.4
      },
      {
        label: 'Asal Daerah',
        value: bio.origin,
        icon: PhMapPin,
        position: 'right',
        delay: 0.1
      },
      {
        label: 'Generasi',
        value: bio.generation,
        icon: PhUsersThree,
        position: 'right',
        delay: 0.3
      },
      {
        label: 'Zodiak',
        value: bio.zodiac,
        icon: PhShootingStar,
        position: 'right',
        delay: 0.5
      }
    ];
  }, [bio]);

  // Set document title on mount for SEO best practices
  useEffect(() => {
    document.title = 'Tentang Nur Intan JKT48 | Fan Archive & Profile';
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

  // Filtered lists
  const filteredVideos = videoFilter === 'All'
    ? bio.videos
    : bio.videos.filter(v => v.category === videoFilter);



  const statIcons = {
    'Total Show Teater': Ticket,
    'Total Live Showroom': Radio,
    'Total Jam Live': Clock,
    'Partisipasi Setlist': ListMusic,
    'Total Event / Konser': Mic2
  };

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/intan.jkt48',
      color: '#E1306C',
      icon: (
        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      name: 'Twitter / X',
      href: 'https://twitter.com/N_IntanJKT48',
      color: '#111111',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      name: 'Threads',
      href: 'https://www.threads.net/@intan.jkt48',
      color: '#000000',
      icon: (
        <FaThreads className="w-5 h-5" />
      )
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@jkt48.intan',
      color: '#000000',
      icon: (
        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      )
    },
    {
      name: 'IDN Live',
      href: 'https://www.idn.app/jkt48_intan',
      color: '#E1251B',
      icon: (
        <PlayCircle className="w-5 h-5" />
      )
    },
    {
      name: 'Showroom',
      href: 'https://www.showroom-live.com/r/JKT48_Intan',
      color: '#0891b2',
      icon: (
        <Video className="w-5 h-5" />
      )
    }
  ];

  return (
    <div ref={pageRef} className="relative -mt-8 space-y-16 overflow-visible">
      {/* Decorative background elements driven by page scroll */}
      <motion.div
        className="absolute top-24 -left-40 w-72 h-72 rounded-full bg-(--color-primary-light)/5 blur-3xl pointer-events-none -z-10"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-24 -right-40 w-80 h-80 rounded-full bg-[rgba(236,72,153,0.02)] blur-3xl pointer-events-none -z-10"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/4 left-1/12 w-4 h-4 rounded-full bg-(--color-secondary)/30 pointer-events-none"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/12 w-5 h-5 rounded-full bg-(--color-primary)/20 pointer-events-none"
        animate={{
          y: [0, 25, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />
      {/* Existing Hero Scroll-Expand Component (unchanged for visual consistency) */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc={intanVideo}
        posterSrc={intanPoster}
        bgImageSrc={intanBg}
        title="Nur Intan"
        scrollToExpand="Scroll untuk melihat profil Intan"
        textBlend={false}
      >
        <div className="mx-auto max-w-7xl space-y-20 px-4 pb-20 pt-10 text-(--text-primary) relative">

          {/* Subtle decorative elements for premium light-theme style */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(23,12,121,0.035)_1.5px,transparent_1.5px)] bg-size-[20px_20px] pointer-events-none -z-10" />
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-(--color-primary-light) rounded-full blur-3xl pointer-events-none -z-10 opacity-30" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[rgba(236,72,153,0.03)] rounded-full blur-3xl pointer-events-none -z-10 opacity-30" />

          {/* ================= 2. PROFIL UTAMA & BIODATA (HERO INTRO) ================= */}
          <motion.section
            id="profile"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="space-y-12 scroll-mt-32"
          >
            {/* Centered Page Header inspired by Reference Component */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6">
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-heading mb-3"
              >
                <motion.span
                  className="inline-block bg-[linear-gradient(110deg,#170c79,28%,#4a7abf,40%,#ffffff,50%,#7dd3fc,58%,#345b8b,70%,#170c79)] bg-size-[240%_100%] bg-clip-text text-transparent select-none drop-shadow-[0_3px_12px_rgba(74,122,191,0.22)]"
                  initial={{ backgroundPosition: '200% 0' }}
                  animate={{ backgroundPosition: '-200% 0' }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.2,
                    ease: 'linear',
                  }}
                >
                  Nur Intan
                </motion.span>
              </motion.h2>
              <motion.div
                className="w-24 h-1 bg-(--color-secondary) rounded-full mb-4"
                variants={fadeUp}
              />
              <motion.div variants={fadeUp} className="py-2 flex flex-col items-center">
                <p className="text-lg md:text-xl lg:text-2xl text-(--color-primary) font-medium italic relative inline-block px-4 text-center md:whitespace-nowrap" style={{ fontFamily: '"Playfair Display", "Merriweather", serif' }}>
                  <span className="absolute -top-3 -left-1 text-4xl text-(--color-secondary) opacity-40 font-serif leading-none">"</span>
                  {bio.description}
                  <span className="absolute -bottom-2 -right-1 text-4xl text-(--color-secondary) opacity-40 font-serif leading-none">"</span>
                </p>
                <p className="text-[10px] md:text-xs font-bold text-(--color-secondary) mt-5 tracking-widest uppercase">
                  — Jikoshoukai Nur Intan
                </p>
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 lg:gap-16 items-center relative">
              {/* Left Column: Bio Details (3 items) */}
              <div className="space-y-6 md:space-y-12 order-2 md:order-1 flex-1 w-full max-w-sm">
                {PROFILE_FACTS.filter(fact => fact.position === 'left').map((fact) => (
                  <ProfileFactItem
                    key={fact.label}
                    fact={fact}
                    delay={fact.delay}
                  />
                ))}
              </div>

              {/* Center Portrait Image Swiper Frame */}
              <div className="flex flex-col justify-center items-center order-1 md:order-2 mb-8 md:mb-0 shrink-0">
                <motion.div className="relative" variants={fadeUp}>
                  <div className="absolute inset-0 bg-(--color-primary-light) opacity-20 blur-3xl rounded-3xl -m-6 pointer-events-none" />

                  <ImageSwiper
                    images={`${intanProfile},${intan1},${intanPoster}`}
                    cardWidth={270}
                    cardHeight={360}
                    className="z-10"
                  />

                  {/* Floating Accent Blobs */}
                  <motion.div
                    className="absolute -top-4 -right-8 w-12 h-12 rounded-full bg-(--color-primary)/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ y: y1 }}
                  />
                  <motion.div
                    className="absolute -bottom-6 -left-10 w-16 h-16 rounded-full bg-(--color-secondary)/15"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ y: y2 }}
                  />

                  {/* Caption & CTA */}
                  <motion.div variants={fadeUp} className="mt-8 text-center flex flex-col items-center gap-5">
                    <Link
                      to="/shining-star"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-(--color-primary) text-white hover:bg-(--color-accent) font-bold text-sm tracking-wide shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      Lihat Perjalanan Nur Intan
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Column: Bio Details (3 items) */}
              <div className="space-y-6 md:space-y-12 order-3 md:order-3 flex-1 w-full max-w-sm">
                {PROFILE_FACTS.filter(fact => fact.position === 'right').map((fact) => (
                  <ProfileFactItem
                    key={fact.label}
                    fact={fact}
                    delay={fact.delay}
                  />
                ))}
              </div>
            </div>

            {/* Social Media Bar (No Card, Positioned Above Stats) */}
            <motion.div
              variants={fadeUp}
              className="mt-16 text-center space-y-5"
            >
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-(--color-primary) tracking-tight font-heading">
                  Saluran Resmi Nur Intan
                </h3>
                <p className="text-(--text-secondary) text-xs font-medium leading-relaxed max-w-xl mx-auto">
                  Dapatkan kabar aktivitas langsung dan postingan harian resmi dari Intan JKT48.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mx-auto">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ '--hover-color': social.color }}
                    className="group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl border border-(--border-color) text-(--text-primary) font-bold text-xs bg-(--bg-card) hover:bg-(--hover-color) hover:border-(--hover-color) hover:text-white transition-all duration-300 cursor-pointer shadow-xs"
                  >
                    {social.icon}
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Stats Counter Grid (directly below Bio layout) */}
            <div id="stats-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 scroll-mt-24">
              {bio.stats.map((stat, index) => {
                const IconComp = statIcons[stat.label] || Award;
                return (
                  <StatCounter
                    key={stat.label}
                    icon={IconComp}
                    value={stat.value}
                    label={stat.label}
                    description={stat.description}
                    delay={index * 0.1}
                  />
                );
              })}
            </div>
          </motion.section>

          {/* ================= NEW SCHEDULE SECTION ================= */}
          <ScheduleSection />

          {/* ================= 8. FUN FACTS & TRIVIA ================= */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <SectionHeader
              label="Trivia & Fakta"
              title="Fakta Menarik & Kebiasaan Unik"
              description="Kumpulan anekdot kecil, quote inspiratif, cerita di balik layar teater, serta chemistry bersama rekan member lainnya."
            />

            {/* FAQ Tabs */}
            {/* FAQ List */}
            <motion.div
              variants={fadeUp}
              className="mx-auto mt-4 max-w-3xl w-full space-y-2.5"
            >
              {bio.triviaDetails.map((faq, index) => (
                <TriviaItem key={index} {...faq} />
              ))}
            </motion.div>
          </motion.section>

          {/* ================= 6. SETLIST & UNIT SONGS ================= */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <SectionHeader
              label="Karya Panggung"
              title="Setlist & Unit Songs"
              description="Daftar setlist teater resmi JKT48 beserta lagu unit (unit songs) yang dibawakan. Klik kartu poster untuk membalikkan kartu dan melihat daftar lagunya."
            />

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-start pt-4"
            >
              {bio.setlistsAndUnitSongs.map((setlist) => {
                return (
                  <motion.div key={setlist.id} variants={fadeUp}>
                    <SetlistPosterCard setlist={setlist} />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* ================= 7. GALERI KONTEN & YOUTUBE ================= */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <SectionHeader
              id="highlights-section"
              label="Galeri Video"
              title="Intan’s Highlights & Dokumentasi"
              description="Kurasi video dokumentasi pilihan seputar aktivitas panggung, vlog keseharian, serta performa menarik Nur Intan."
            />

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center sm:justify-start border-b border-(--border-color) pb-3">
              {['All', 'Profile', 'Vlog', 'Jahat-Jahatan', 'Last Content', 'Temen Main', 'Secret Cam'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVideoFilter(cat)}
                  aria-pressed={videoFilter === cat}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) ${videoFilter === cat
                    ? 'bg-(--color-primary) text-white shadow-sm'
                    : 'text-(--text-secondary) hover:bg-(--color-primary-light)'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Video Cards Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video) => (
                  <motion.div
                    layout
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.45 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveVideo(video)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveVideo(video);
                      }
                    }}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-(--border-color) bg-(--bg-card) shadow-(--box-shadow-sm) hover:shadow-(--box-shadow-md) transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2"
                  >
                    <div>
                      {/* Image Thumbnail wrapper with Zoom and Play overlay */}
                      <div className="relative aspect-video overflow-hidden bg-black/10">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                        />

                        {/* Minimalist Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-(--color-primary) shadow-md transform group-hover:scale-108 transition-transform duration-300">
                            <Play className="h-5.5 w-5.5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Video Duration Badge */}
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black text-white bg-black/60 tracking-wider">
                          {video.duration}
                        </span>
                      </div>

                      {/* Text info */}
                      <div className="p-5 space-y-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-(--color-secondary)/15 text-(--color-secondary) bg-[rgba(8,145,178,0.04)] tracking-wide">
                          {video.category}
                        </span>
                        <h4 className="text-sm font-black text-(--color-primary) tracking-tight leading-snug line-clamp-2 pt-1 group-hover:text-(--color-primary-hover) transition-colors">
                          {video.title}
                        </h4>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-(--color-primary) border-t border-(--border-color)/60">
                      <span>Tonton Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.section>

        </div>
      </ScrollExpandMedia>

      {/* Embed YouTube Modal Overlay */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal
            video={activeVideo}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

