'use client';

import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import Image from 'next/image';
import Link from 'next/link';
import logoNobg from "../../assets/logos/logo-nobg.webp";
import { SOCIALS } from "../../lib/constants";

const defaultSections = [
  {
    title: "Explore",
    links: [
      { name: "About Intan", href: "/about-intan" },
      { name: "IRIS Lore", href: "/about-iris" },
      { name: "#IntanShiningStar", href: "/shining-star" },
      { name: "#dengerINTAN", href: "/denger-intan" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Official Shop", href: "/merchandise" },
      { name: "Fanart Gallery", href: "/fanart" },
      { name: "Bulletin Board", href: "/mading" },
      { name: "Activity Recaps", href: "/recaps" },
      { name: "IRIS Game Arena", href: "/games" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: FaInstagram, href: SOCIALS.INSTAGRAM, label: "Instagram" },
  { icon: FaXTwitter, href: SOCIALS.TWITTER, label: "X (Twitter)" },
  { icon: FaThreads, href: SOCIALS.THREADS, label: "Threads" },
  { icon: FaTiktok, href: SOCIALS.TIKTOK, label: "TikTok" },
  { icon: FaYoutube, href: SOCIALS.YOUTUBE, label: "YouTube" },
];

const defaultLegalLinks = [
  { name: "Terms of Service", href: "#terms" },
  { name: "Privacy Policy", href: "#privacy" },
];

export default function Footer({
  logo = {
    url: "/",
    src: logoNobg,
    alt: "logo",
    title: "IRIS",
  },
  sections = defaultSections,
  description = "Official portal of the IRIS community for Nur Intan JKT48 fans. Access streaming schedules, recap zines, interactive bulletin boards, and official merchandise.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} IRIS Official. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}) {
  return (
    <footer className="relative mt-16 sm:mt-24 bg-white text-[var(--color-heading)] transition-colors duration-300 select-none" role="contentinfo">
      {/* Top Organic Pink Wave Divider - Positioned above footer */}
      <div className="absolute bottom-full inset-x-0 w-full overflow-hidden leading-none pointer-events-none translate-y-[1px]">
        <svg
          className="relative block w-full h-12 sm:h-16 md:h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Background Soft Pink Glow Wave */}
          <path
            d="M0,10 C180,85 360,10 540,55 C720,105 920,20 1200,65 L1200,120 L0,120 Z"
            fill="var(--color-pink)"
            opacity="0.25"
          />
          {/* Main Pink Wave Stroke */}
          <path
            d="M0,32 C200,92 450,22 700,72 C950,122 1100,32 1200,52"
            fill="none"
            stroke="var(--color-pink)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Main White Body Fill */}
          <path
            d="M0,35 C200,95 450,25 700,75 C950,125 1100,35 1200,55 L1200,120 L0,120 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Soft ambient edge glow */}
      <div className="absolute top-12 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,95,178,0.06)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(168,85,247,0.05)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

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
                <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-pink-tint-8)] text-sm font-extrabold text-[#be185d] shadow-xs">
                  I
                </span>
              )}
              <span className="text-2xl font-black tracking-tight text-[var(--color-heading)]">
                IRIS
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              {description}
            </p>
          </div>

          {/* Columns 2 & 3: Quick Links & Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[#be185d] border-b border-slate-200 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('#') || link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="transition-colors duration-200 text-slate-700 hover:text-[#be185d] hover:underline underline-offset-4 inline-block py-1"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="transition-colors duration-200 text-slate-700 hover:text-[#be185d] hover:underline underline-offset-4 inline-block py-1"
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
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[#be185d] border-b border-slate-200 pb-2">
              Follow Us
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
              Get the latest updates on activities, live streams, and official events of Nur Intan.
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
                  className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:bg-[var(--color-pink)] hover:text-white hover:border-[var(--color-pink)]"
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-center md:flex-row text-xs text-slate-500 font-semibold">
          <p>{copyright}</p>
          <nav className="flex gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-slate-700 transition-colors hover:text-[#be185d] hover:underline underline-offset-4"
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
