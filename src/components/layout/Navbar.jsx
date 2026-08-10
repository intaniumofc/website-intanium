'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ROUTES } from '../../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Sparkle,
  Globe,
  Calendar,
  BookOpen,
  Newspaper,
  MessageSquare as ChatCenteredText,
  Image as ImageIcon,
  Palette,
  ShoppingBag,
  CreditCard,
  Gamepad2 as GameController,
  Trophy,
  ChevronDown as CaretDown,
  ArrowRight,
  Camera,
  MapPin
} from "lucide-react";
import logoNobg from '../../assets/logos/logo-nobg.webp';

export default function Navbar({ isHome = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = isHome || pathname === '/';
  const isTransparent = isHomePage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const NAV_ITEMS = [
    {
      id: 0,
      label: "Home",
      link: ROUTES.HOME || '/',
    },
    {
      id: 1,
      label: "About",
      subMenus: [
        {
          title: "Profile & Character",
          items: [
            {
              label: "About Nur Intan",
              description: "Profil lengkap, biodata, dan fakta menarik tentang Intan",
              icon: User,
              link: ROUTES.ABOUT_INTAN,
            },
            {
              label: "Journey",
              description: "Arsip perjalanan karier dan pencapaian bersejarah Intan",
              icon: Sparkle,
              link: ROUTES.SHINING_STAR,
            },
            {
              label: "Recap",
              description: "Majalah digital rekap kegiatan dan momen bulanan",
              icon: BookOpen,
              link: ROUTES.RECAPS,
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "About IRIS",
              description: "Asal-usul, filosofi, panduan, dan cara bergabung di Discord",
              icon: Globe,
              link: ROUTES.ABOUT_IRIS,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      label: "Schedule & News",
      subMenus: [
        {
          title: "Updates & Activities",
          items: [
            {
              label: "Event Schedule",
              description: "Jadwal teater, video call, ulang tahun, dan event Intan",
              icon: Calendar,
              link: ROUTES.SCHEDULE,
            },
            {
              label: "Performance Map",
              description: "Peta interaktif lokasi pertunjukan dan event Intan di Indonesia",
              icon: MapPin,
              link: ROUTES.PERFORMANCE_MAP,
            },
            {
              label: "News & Announcements",
              description: "Pengumuman resmi dan kabar terbaru kegiatan IRIS & Intan",
              icon: Newspaper,
              link: ROUTES.NEWS,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      label: "Community",
      subMenus: [
        {
          title: "Activities & Creativity",
          items: [
            {
              label: "Message Board",
              description: "Kirim pesan hangat dan dukungan di papan mading digital",
              icon: ChatCenteredText,
              link: ROUTES.MADING,
            },
            {
              label: "Fanart Gallery",
              description: "Koleksi karya seni dan ilustrasi indah buatan penggemar",
              icon: Palette,
              link: ROUTES.FANART,
            },
            {
              label: "IRIS Esport",
              description: "Pusat kegiatan dan turnamen e-sports resmi komunitas IRIS",
              icon: Trophy,
              link: ROUTES.ESPORT,
            },
            {
              label: "Photo Studio",
              description: "Foto bersama bingkai eksklusif Intan di photobooth digital",
              icon: Camera,
              link: ROUTES.PHOTOBOOTH,
            },
          ],
        },
        {
          title: "Documentation Archive",
          items: [
            {
              label: "Photo Gallery",
              description: "Arsip foto dan tangkapan layar momen keseruan live streaming",
              icon: ImageIcon,
              link: ROUTES.GALLERY,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      label: "Official Store",
      subMenus: [
        {
          title: "Merchandise Shop",
          items: [
            {
              label: "Pre-Order Merchandise",
              description: "Dapatkan koleksi merchandise resmi IRIS sekarang!",
              icon: ShoppingBag,
              link: ROUTES.MERCHANDISE,
            },
            {
              label: "Check Order Status",
              description: "Pantau status dan nomor resi pesanan merchandise kamu",
              icon: CreditCard,
              link: ROUTES.PAYMENT_CONFIRM,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      label: "#dengerINTAN",
      link: ROUTES.DENGER_INTAN,
    },
    {
      id: 6,
      label: "Game Corner",
      link: ROUTES.GAMES,
      icon: GameController,
    },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isTransparent
        ? 'h-20 md:h-24 bg-gradient-to-b from-black/40 via-black/15 to-transparent border-transparent shadow-none'
        : scrolled
          ? 'h-16 md:h-20 bg-white/95 backdrop-blur-md border-b border-[var(--color-border)] shadow-md'
          : 'h-20 md:h-24 bg-white border-b border-[var(--color-border)] shadow-sm'
      }`}>
      <div className="relative flex items-center h-full">
        {/* Panel melengkung bermotif: logo + nama + tagline */}
        <div className={`relative h-full flex items-center pl-5 sm:pl-8 pr-3 sm:pr-5 transition-colors duration-300 ${isTransparent ? 'bg-transparent' : 'bg-[var(--color-pink-dark)]'
          }`}>
          <Link href={ROUTES.HOME || '/'} className="flex items-center gap-2.5 sm:gap-3 group z-10">
            <Image
              src={logoNobg}
              alt="IRIS"
              width={44}
              height={44}
              priority
              className="h-9 w-9 sm:h-11 sm:w-11 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="leading-tight">
              <span className="block text-lg sm:text-2xl font-black tracking-tight text-white select-none">
                IRIS
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-white/70 tracking-wide">
                Fanbase Nur Intan
              </span>
            </div>
          </Link>

          {/* Motif Kurva Transisi Ganda dari logo ke area kanan */}
          <svg
            className={`absolute left-full top-0 h-full w-12 sm:w-20 pointer-events-none transition-opacity duration-300 z-10 ${isTransparent ? 'opacity-0' : 'opacity-100'
              }`}
            viewBox="0 0 80 100"
            preserveAspectRatio="none"
          >
            {/* Layer 1: Accent Pink Glow Wave */}
            <path
              d="M 0,0 L 35,0 C 70,25 20,75 55,100 L 0,100 Z"
              fill="var(--color-pink)"
              opacity="0.4"
            />
            {/* Layer 2: Main Dark Pink Wave */}
            <path
              d="M 0,0 L 20,0 C 52,25 5,75 36,100 L 0,100 Z"
              fill="var(--color-pink-dark)"
            />
          </svg>
        </div>

        {/* Area kanan: nav links + CTA */}
        <div className="flex-1 h-full flex items-center justify-between pl-8 sm:pl-16 pr-3 sm:pr-6 lg:pr-8 min-w-0">
          <div className="hidden lg:flex items-center">
            <DropdownNavigation navItems={NAV_ITEMS} pathname={pathname} isTransparent={isTransparent} />
          </div>

          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <span className={`h-6 w-px transition-colors ${isTransparent ? 'bg-white/30' : 'bg-[var(--color-border)]'}`} />
            <Link href={ROUTES.JOIN_US}>
              <button
                type="button"
                style={
                  isTransparent
                    ? undefined
                    : { backgroundImage: 'var(--gradient-cta, linear-gradient(135deg, var(--color-pink, #ec4899), var(--color-pink-dark, #be185d)))' }
                }
                className={`group flex items-center gap-2.5 pl-5 pr-1.5 py-1.5 rounded-full whitespace-nowrap text-white font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${isTransparent
                    ? 'bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md shadow-sm'
                    : 'shadow-[var(--shadow-pink-glow)] hover:shadow-[var(--shadow-pink-glow-hover)]'
                  }`}
              >
                  <span>Join Us</span>
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors shrink-0">
                  <ArrowRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </button>
            </Link>
          </div>

          {/* Tombol menu mobile */}
          <div className="flex lg:hidden items-center ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 w-11 h-11 flex items-center justify-center rounded-lg focus:outline-none cursor-pointer transition-colors ${isTransparent
                  ? 'hover:bg-white/10 text-white'
                  : 'hover:bg-[var(--color-pink-tint-8)] text-[var(--color-heading)]'
                }`}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer menu mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-[var(--color-border)] bg-white overflow-hidden shadow-lg"
          >
            <div className="py-3 px-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {NAV_ITEMS.map((item, index) => {
                const hasSub = !!item.subMenus;
                const isExpanded = activeAccordion === index;

                if (hasSub) {
                  const isSectionActive = item.subMenus.some((sub) =>
                    sub.items.some((i) => i.link === pathname)
                  );
                  return (
                    <div key={item.label} className="border-b border-[var(--color-border)] py-1">
                      <button
                        onClick={() => toggleAccordion(index)}
                        className={`w-full flex items-center justify-between py-2 px-3 min-h-[44px] rounded-lg text-base font-semibold transition-all focus:outline-none cursor-pointer ${isSectionActive
                          ? "text-[var(--color-pink)]"
                          : "text-[var(--color-heading)] hover:bg-[var(--color-pink-tint-8)]"
                          }`}
                        aria-expanded={isExpanded}
                      >
                        <span>{item.label}</span>
                        <CaretDown
                          className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[var(--color-pink)]" : "text-[var(--color-text-secondary)]"
                            }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden pl-4 pr-2 py-1 space-y-3"
                          >
                            {item.subMenus.map((sub) => (
                              <div key={sub.title} className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block px-2">
                                  {sub.title}
                                </span>
                                <div className="space-y-1">
                                  {sub.items.map((subItem) => {
                                    const Icon = subItem.icon;
                                    const isSubActive = pathname === subItem.link;
                                    return (
                                      <Link
                                        key={subItem.label}
                                        href={subItem.link || "#"}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 p-2 min-h-[44px] rounded-lg transition-all ${isSubActive
                                          ? "text-[var(--color-pink)] bg-[var(--color-pink-tint-8)] font-semibold"
                                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-pink-tint-8)] hover:text-[var(--color-heading)]"
                                          }`}
                                      >
                                        <div className="rounded-md flex items-center justify-center p-1.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] shrink-0">
                                          <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="leading-tight">
                                          <p className="text-sm font-medium">{subItem.label}</p>
                                          {subItem.description && (
                                            <p className="text-[10px] text-[var(--color-text-secondary)] font-normal line-clamp-1">
                                              {subItem.description}
                                            </p>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                } else {
                  const isActive = pathname === item.link;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.link || "#"}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-2 px-3 min-h-[44px] rounded-lg text-base font-semibold transition-all ${isActive
                        ? "text-[var(--color-pink)] bg-[var(--color-pink-tint-8)]"
                        : "text-[var(--color-heading)] hover:bg-[var(--color-pink-tint-8)]"
                        }`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                }
              })}

              <div className="pt-4 pb-2 border-t border-[var(--color-border)]">
                <Link
                  href={ROUTES.JOIN_US}
                  onClick={() => setIsOpen(false)}
                  style={{ backgroundImage: 'var(--gradient-cta, linear-gradient(135deg, var(--color-pink, #ec4899), var(--color-pink-dark, #be185d)))' }}
                  className="flex items-center justify-center gap-2 w-full px-4 min-h-[44px] rounded-full text-base font-extrabold text-white shadow-[var(--shadow-pink-glow)] transition-all active:scale-95"
                >
                    <span>Join Us</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function DropdownNavigation({ navItems, pathname, isTransparent }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleHover = (menuLabel) => {
    setOpenMenu(menuLabel);
  };

  const isParentActive = (navItem) => {
    if (navItem.link) return pathname === navItem.link;
    if (navItem.subMenus) {
      return navItem.subMenus.some((sub) => sub.items.some((i) => i.link === pathname));
    }
    return false;
  };

  return (
    <ul className="relative flex items-center gap-0.5 xl:gap-1">
      {navItems.map((navItem) => {
        const active = isParentActive(navItem);
        const isHovered = hoveredId === navItem.id;

        const textColor = isTransparent
          ? active
            ? "text-white font-extrabold drop-shadow-xs"
            : "text-white/90 hover:text-white font-semibold drop-shadow-xs"
          : active
            ? "text-[var(--color-pink)] font-bold"
            : "text-[var(--color-heading)] hover:text-[var(--color-pink)] font-semibold";

        const hoverBg = isTransparent
          ? "bg-white/20 border border-white/30 backdrop-blur-xs"
          : "bg-[var(--color-pink-tint-8)] border border-[var(--color-pink-tint-15)]";

        const activeUnderline = isTransparent
          ? "bg-white shadow-xs"
          : "bg-[var(--color-pink)]";

        return (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => {
              handleHover(navItem.label);
              setHoveredId(navItem.id);
            }}
            onMouseLeave={() => {
              handleHover(null);
              setHoveredId(null);
            }}
            onFocus={() => {
              handleHover(navItem.label);
              setHoveredId(navItem.id);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                handleHover(null);
                setHoveredId(null);
              }
            }}
          >
            {navItem.subMenus ? (
              <button
                className={`relative text-sm py-2 px-3 xl:px-4 flex cursor-pointer group transition-colors duration-200 items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none rounded-full ${textColor}`}
              >
                <span className="relative z-10">{navItem.label}</span>
                <CaretDown
                  className={`h-3.5 w-3.5 shrink-0 relative z-10 transition-transform duration-300 ${openMenu === navItem.label ? "rotate-180" : ""
                    }`}
                />
                {isHovered && (
                  <motion.div
                    layoutId="hover-bg"
                    className={`absolute inset-0 size-full rounded-full ${hoverBg}`}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                {active && !isHovered && (
                  <motion.span
                    layoutId="nav-underline"
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full ${activeUnderline}`}
                  />
                )}
              </button>
            ) : (
              <Link
                href={navItem.link || "#"}
                className={`relative text-sm py-2 px-3 xl:px-4 flex cursor-pointer group transition-colors duration-200 items-center justify-center gap-1 whitespace-nowrap focus-visible:outline-none rounded-full ${textColor}`}
              >
                <span className="relative z-10">{navItem.label}</span>
                {isHovered && (
                  <motion.div
                    layoutId="hover-bg"
                    className={`absolute inset-0 size-full rounded-full ${hoverBg}`}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                {active && !isHovered && (
                  <motion.span
                    layoutId="nav-underline"
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full ${activeUnderline}`}
                  />
                )}
              </Link>
            )}

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <motion.div
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-[var(--shadow-lg)] w-max backdrop-blur-md"
                    layoutId="menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex gap-8 shrink-0 overflow-hidden">
                      {navItem.subMenus.map((sub) => (
                        <motion.div layout className="min-w-[200px]" key={sub.title}>
                          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-b border-[var(--color-border)] pb-2">
                            {sub.title}
                          </h3>
                          <ul className="space-y-4">
                            {sub.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <li key={item.label}>
                                  <Link
                                    href={item.link || "#"}
                                    className="flex items-start gap-3 group/item p-1.5 rounded-xl hover:bg-[var(--color-pink-tint-8)] transition-all duration-200 focus-visible:outline-none"
                                  >
                                    <div className="border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg flex items-center justify-center size-9 shrink-0 group-hover/item:bg-[var(--color-pink)] group-hover/item:text-white group-hover/item:border-[var(--color-pink)] transition-colors duration-200">
                                      <Icon className="h-5 w-5 flex-none" />
                                    </div>
                                    <div className="leading-tight">
                                      <p className="text-sm font-semibold text-[var(--color-heading)] group-hover/item:text-[var(--color-pink)] transition-colors duration-200">
                                        {item.label}
                                      </p>
                                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mt-0.5 max-w-[170px]">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}