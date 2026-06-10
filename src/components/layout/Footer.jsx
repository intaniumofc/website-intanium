import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from 'framer-motion';
import logoNobg from "../../assets/logos/logo-nobg.png";
import { SOCIALS } from "../../lib/constants";

const defaultSections = [
  {
    title: "Jelajahi",
    links: [
      { name: "Tentang Intan", href: "/about-intan" },
      { name: "Lore Intanium", href: "/about-intanium" },
      { name: "#IntanShiningStar", href: "/shining-star" },
      { name: "#dengerINTAN", href: "/denger-intan" },
    ],
  },
  {
    title: "Komunitas",
    links: [
      { name: "Official Shop", href: "/merchandise" },
      { name: "Karya Seni Fanart", href: "/fanart" },
      { name: "Papan Mading", href: "/mading" },
      { name: "Recap Aktivitas", href: "/recaps" },
    ],
  },
  {
    title: "Bantuan & Legal",
    links: [
      { name: "Kebijakan Privasi", href: "#privacy" },
      { name: "Ketentuan Layanan", href: "#terms" },
      { name: "Admin Portal", href: "/admin/login" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: FaInstagram, href: SOCIALS.INSTAGRAM, label: "Instagram" },
  { icon: FaXTwitter, href: SOCIALS.TWITTER, label: "X" },
  { icon: FaTiktok, href: SOCIALS.TIKTOK, label: "TikTok" },
  { icon: FaYoutube, href: SOCIALS.YOUTUBE, label: "YouTube" },
];

const defaultLegalLinks = [
  { name: "Ketentuan Layanan", href: "#terms" },
  { name: "Kebijakan Privasi", href: "#privacy" },
];

export default function Footer({
  logo = {
    url: "/",
    src: logoNobg,
    alt: "logo",
    title: "INTANIUM",
  },
  sections = defaultSections,
  description = "Selamat datang di portal resmi komunitas Intanium. Di sini, kami merayakan setiap momen perjalanan Intan melalui jadwal streaming terpadu, arsip zine recap yang mendalam, dan galeri kreatif untuk memamerkan karya fanart terbaikmu. Jadilah bagian dari diskusi interaktif di corkboard mading kami dan miliki koleksi eksklusif melalui katalog merchandise resmi. Segala hal tentang Intan, dari fans untuk fans, ada di sini.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} Intanium Official. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) {
  return (
    <section className="mt-auto border-t border-white/10 bg-[#170C79] py-6 text-white select-none sm:py-7">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="border-b border-dotted border-white/20 pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <a href={logo.url} className="group flex shrink-0 items-center gap-3">
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-extrabold">
                  I
                </span>
              )}
              <motion.h2
                className="text-xl font-extrabold tracking-tight bg-[linear-gradient(110deg,#ffffff,35%,#a5b4fc,50%,#ffffff,75%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent sm:text-2xl"
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear",
                }}
              >
                INTANIUM
              </motion.h2>
            </a>
            <p className="max-w-5xl text-xs leading-relaxed text-white/65 sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="border-b border-dotted border-white/20 py-5">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="text-center">
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  {section.title}
                </h3>
                <ul className="space-y-1.5 text-xs text-white/60 sm:text-sm">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="transition-colors duration-200 hover:text-white"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center pt-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={`Kunjungi ${social.label} Intanium`}
                title={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all duration-200 hover:-translate-y-1 hover:border-white/35 hover:bg-white/10 hover:text-white"
              >
                {typeof social.icon === "function" ? (
                  <social.icon className="size-4" />
                ) : social.icon}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 text-center text-xs font-medium text-white/45 sm:flex-row">
            <p>{copyright}</p>
            <span className="hidden text-white/20 sm:inline" aria-hidden="true">•</span>
            <ul className="flex items-center gap-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="transition-colors duration-200 hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
