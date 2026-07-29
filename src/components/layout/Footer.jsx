'use client';

import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';
import logoNobg from "../../assets/logos/logo-nobg.webp";
import { SOCIALS } from "../../lib/constants";

const defaultSections = [
  {
    title: "Jelajahi",
    links: [
      { name: "Tentang Intan", href: "/about-intan" },
      { name: "Lore IRIS", href: "/about-iris" },
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
      { name: "Arena Game IRIS", href: "/games" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: FaInstagram, href: SOCIALS.INSTAGRAM, label: "Instagram" },
  { icon: FaXTwitter, href: SOCIALS.TWITTER, label: "X (Twitter)" },
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
    title: "IRIS",
  },
  sections = defaultSections,
  description = "Portal resmi komunitas IRIS untuk fans Nur Intan JKT48. Di sini kamu bisa mengakses jadwal streaming, recap zine, mading interaktif, dan merchandise resmi.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} IRIS Official. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) {
  return (
    <footer className="relative mt-auto border-t border-[#d83584] bg-[var(--color-pink-dark)] text-white transition-colors duration-300 select-none overflow-hidden shadow-md" role="contentinfo">
      {/* Soft ambient edge glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand & Description */}
          <div className="relative space-y-4">
            <Link href={logo.url} className="group flex items-center gap-2.5">
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  width={36}
                  height={36}
                  className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-sm font-extrabold text-white shadow-xs">
                  I
                </span>
              )}
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
                IRIS
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-white/85">
              {description}
            </p>
          </div>

          {/* Columns 2 & 3: Quick Links & Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-white border-b border-white/20 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-xs font-medium text-white/85">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') || link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="transition-colors duration-200 hover:text-white inline-block py-0.5"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="transition-colors duration-200 hover:text-white inline-block py-0.5"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 4: Social Media */}
          <div>
            <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-white border-b border-white/20 pb-2">
              Ikuti Kami
            </h3>
            <p className="text-xs text-white/85 mb-4 leading-relaxed">
              Dapatkan info kegiatan, streaming, dan event terbaru Nur Intan di media sosial resmi.
            </p>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:text-[var(--color-pink-dark)]"
                >
                  {typeof social.icon === "function" ? (
                    <social.icon className="size-4" />
                  ) : social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 text-center md:flex-row text-xs text-white/75 font-medium">
          <p>{copyright}</p>
          <nav className="flex gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>

      </div>
    </footer>
  );
}
