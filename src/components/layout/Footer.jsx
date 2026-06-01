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
  { icon: <FaInstagram className="size-5 text-[#170C79]" />, href: "https://instagram.com", label: "Instagram" },
  { icon: <FaTwitter className="size-5 text-[#170C79]" />, href: "https://twitter.com", label: "X" },
  { icon: <FaTiktok className="size-5 text-[#170C79]" />, href: "https://tiktok.com", label: "TikTok" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#terms" },
  { name: "Privacy Policy", href: "#privacy" },
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
    <section className="py-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url} className="flex items-center gap-2">
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#170C79] to-[#8b5cf6] flex items-center justify-center text-white font-extrabold shadow-md border border-purple-400/20 text-xs">
                    I
                  </span>
                )}
                <h2 className="text-xl font-bold tracking-tight text-[#170C79]">{logo.title}</h2>
              </a>
            </div>
            <p className="max-w-[75%] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-[var(--text-secondary)] mt-2">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-[var(--color-primary-hover)] transition-colors">
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
                <h3 className="mb-4 text-sm font-bold text-[#170C79] uppercase tracking-wider">{section.title}</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-[var(--color-primary-hover)] transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-[var(--border-color)] py-5 text-xs font-medium text-[var(--text-muted)] md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-[var(--color-primary-hover)] transition-colors">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
