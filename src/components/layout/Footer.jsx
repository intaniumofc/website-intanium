import React from "react";
import { FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";

const defaultSections = [
  {
    title: "Jelajahi",
    links: [
      { name: "Tentang Intan", href: "/about-intan" },
      { name: "Lore Intanium", href: "/about-intanium" },
      { name: "Bintang Berkilau", href: "/shining-star" },
      { name: "Diskografi & Rilis", href: "/discography" },
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
  { icon: <FaInstagram className="size-5 text-white/80 hover:text-white transition-colors duration-200" />, href: "https://instagram.com", label: "Instagram" },
  { icon: <FaTwitter className="size-5 text-white/80 hover:text-white transition-colors duration-200" />, href: "https://twitter.com", label: "X" },
  { icon: <FaTiktok className="size-5 text-white/80 hover:text-white transition-colors duration-200" />, href: "https://tiktok.com", label: "TikTok" },
];

const defaultLegalLinks = [
  { name: "Ketentuan Layanan", href: "#terms" },
  { name: "Kebijakan Privasi", href: "#privacy" },
];

export default function Footer({
  logo = {
    url: "/",
    src: "", // Empty to trigger gorgeous custom text logo
    alt: "logo",
    title: "INTANIUM",
  },
  sections = defaultSections,
  description = "Portal komunitas resmi dari fans Intan (Intanium). Kumpulan informasi seputar jadwal streaming, zine recap, produk official merchandise, galeri submit karya fanart, dan corkboard mading interaktif.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} Intanium Official. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) {
  return (
    <section className="py-12 border-t border-white/10 bg-[#170C79] text-white mt-auto select-none">
      <div className="container mx-auto px-6">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url} className="flex items-center gap-2 group">
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md border border-white/20 text-xs">
                    I
                  </span>
                )}
                <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                  INTAN<span className="text-purple-300 font-extrabold">IUM</span>
                </h2>
              </a>
            </div>
            <p className="max-w-[85%] text-xs sm:text-sm text-white/70 leading-relaxed">
              {description}
            </p>
            <ul className="flex items-center space-x-5 text-white/80 mt-2">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-white transition-colors duration-200">
                  <a href={social.href} aria-label={social.label} target="_blank" rel="noreferrer">
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-8 grid-cols-2 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">{section.title}</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-white/70">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-white hover:underline transition-colors duration-200"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 py-6 text-xs font-medium text-white/50 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-white hover:underline transition-colors duration-200">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
