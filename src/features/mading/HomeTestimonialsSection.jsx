import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TestimonialsColumn } from "../../components/ui/testimonials-columns-1";
import { MessageSquare, Sparkles } from "lucide-react";
import { ROUTES } from "../../lib/constants";

const FAN_TESTIMONIALS = [
  {
    text: "Setiap kali Intan mulai live stream, hari beratku langsung terasa cerah! Suaranya saat bernyanyi lofi benar-benar menenangkan hati. Tetap bersinar permata kami! ✨",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    name: "MatchaLover",
    role: "Matcha Enthusiast",
  },
  {
    text: "Happy Anniversary 1st Year Debut Intan! Sukses selalu, semoga lancar terus stream dan karir nyanyinya! We love you! 🎉✨",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    name: "Andi_Kreatif",
    role: "Digital Artist Fan",
  },
  {
    text: "Es Matcha Latte itu minuman wajib setiap kali nemenin nonton stream Intan! Desain merchandise tumbler matcha-nya aesthetic banget, ga sabar nunggu barangnya sampai! 🍵",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    name: "MelodiMatcha",
    role: "Regular Stream Watcher",
  },
  {
    text: "Stream Minecraft kemarin petjah abis kakk! Ditunggu collab mabar kastil ungu selanjutnya, ga sabar bangeeet! 🎮💜",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    name: "WibuGamer99",
    role: "Intanium Gamer",
  },
  {
    text: "Terima kasih sudah selalu menghibur kami dengan senyuman ceriamu di panggung teater. JKT48 punya permata terindah di hatimu! 🌸",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    name: "TeaterGarisKeras",
    role: "Theater Regular",
  },
  {
    text: "Visual key standee akrilik hologramnya luar biasa cantik! Koleksi merchandise wajib buat dipajang di meja PC. We love you Intan! 💖",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    name: "PermataHatiIntan",
    role: "Active Member Fanbase",
  },
  {
    text: "Dari awal debut sampai sekarang, perkembangan dance dan vocal-nya luar biasa pesat. Selalu ramah sama fans dan konten streamingnya sangat menghibur. Sukses terus!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    name: "LofiPemberiSemangat",
    role: "Dedicated Supporter",
  },
  {
    text: "Web ini keren banget! Mading interaktifnya bikin fans gampang ngasih ucapan selamat. Intan, semoga lancar terus karir nyanyi dan stream gaming-nya ya! 💙",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    name: "Admin Intanium",
    role: "Fanbase Moderator",
  },
  {
    text: "Setiap mading penuh dukungan dari fans di sini membuktikan seberapa besar pengaruh positif Intan bagi kita semua. Bersama-sama mari kita dukung Intan menuju puncak! ✨",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    name: "KeyVisualEnjoyer",
    role: "Art Director Fan",
  },
];

const firstColumn = FAN_TESTIMONIALS.slice(0, 3);
const secondColumn = FAN_TESTIMONIALS.slice(3, 6);
const thirdColumn = FAN_TESTIMONIALS.slice(6, 9);

export default function HomeTestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-0 pb-4 space-y-6 relative">

      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-[var(--border-color)]/60 pb-3 select-none">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#170C79] tracking-tight flex items-center gap-2">
            Pesan Dari Kita <MessageSquare className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Kesan hangat, motivasi, dan dukungan tulus dari komunitas penggemar setia Intanium.
          </p>
        </div>
        <Link 
          to={ROUTES.MADING}
          className="text-xs font-bold text-[var(--color-primary-hover)] hover:underline flex items-center gap-1 cursor-pointer pb-0.5 transition-all"
        >
          Buka Mading <span className="text-[var(--color-primary-hover)] font-bold">→</span>
        </Link>
      </div>

      <div className="container z-10 mx-auto select-none pt-4">
        {/* Animated Heading Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-center mb-8"
        >

          <h4 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Pesan Dan Kesan Dari Teman-Teman
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Inilah surat apresiasi dan suara hati teman-teman fanbase yang selalu setia menemani setiap langkah perjalanan Intan.
          </p>
        </motion.div>

        {/* 3-Column Testimonials Infinite Scroll list */}
        <div className="flex justify-center gap-6 mt-8 overflow-hidden max-h-[640px]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={22} className="w-full max-w-xs" />
          <TestimonialsColumn testimonials={secondColumn} duration={26} className="hidden md:block w-full max-w-xs" />
          <TestimonialsColumn testimonials={thirdColumn} duration={24} className="hidden lg:block w-full max-w-xs" />
        </div>
      </div>
    </section>
  );
}
