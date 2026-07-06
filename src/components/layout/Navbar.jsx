'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ROUTES } from '../../lib/constants';
import Button from '../common/Button';
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
  ChevronDown as CaretDown
} from "lucide-react";
import logoNobg from '../../assets/logos/logo-nobg.webp';

export default function Navbar({ isHome = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const NAV_ITEMS = [
    {
      id: 1,
      label: "Tentang",
      subMenus: [
        {
          title: "Profil & Karakter",
          items: [
            {
              label: "Tentang Nur Intan",
              description: "Profil lengkap, biodata, dan fakta menarik seputar Intan",
              icon: User,
              link: ROUTES.ABOUT_INTAN,
            },
            {
              label: "#IntanShiningStar",
              description: "Arsip perjalanan dan milestone bersejarah Intan",
              icon: Sparkle,
              link: ROUTES.SHINING_STAR,
            },
          ],
        },
        {
          title: "Komunitas",
          items: [
            {
              label: "Tentang Intanium",
              description: "Asal usul, filosofi, pedoman, dan cara gabung Discord",
              icon: Globe,
              link: ROUTES.ABOUT_INTANIUM,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      label: "Jadwal & Berita",
      subMenus: [
        {
          title: "Update & Kegiatan",
          items: [
            {
              label: "Jadwal Acara",
              description: "Kalender theater, video call, birthday, dan event Nur Intan",
              icon: Calendar,
              link: ROUTES.SCHEDULE,
            },
            {
              label: "Berita & Pengumuman",
              description: "Rilis pengumuman, agenda event resmi terkini",
              icon: Newspaper,
              link: ROUTES.NEWS,
            },
            {
              label: "Zine & Recap",
              description: "Arsip e-magazine digital recap aktivitas bulanan",
              icon: BookOpen,
              link: ROUTES.RECAPS,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      label: "Komunitas",
      subMenus: [
        {
          title: "Aktivitas & Kreativitas",
          items: [
            {
              label: "Papan Mading",
              description: "Tempelkan pesan dukungan hangat Anda di mading digital",
              icon: ChatCenteredText,
              link: ROUTES.MADING,
            },
            {
              label: "Karya Fanart",
              description: "Koleksi lukisan indah sumbangan dari para artist fans",
              icon: Palette,
              link: ROUTES.FANART,
            },
            {
              label: "Intanium Esport",
              description: "Hub divisi olahraga elektronik resmi komunitas Intanium",
              icon: Trophy,
              link: ROUTES.ESPORT,
            },
          ],
        },
        {
          title: "Arsip Dokumentasi",
          items: [
            {
              label: "Galeri Foto",
              description: "Arsip screenshot kenangan momen-momen stream seru",
              icon: ImageIcon,
              link: ROUTES.GALLERY,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      label: "Toko Resmi",
      subMenus: [
        {
          title: "Merchandise Shop",
          items: [
            {
              label: "Pre-Order Merchandise",
              description: "Miliki merchandise intanium sekarang!",
              icon: ShoppingBag,
              link: ROUTES.MERCHANDISE,
            },
            {
              label: "Cek Status Pesanan",
              description: "Pantau status pesanan merchandise",
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

  const navBackground = isHome && !scrolled
    ? 'bg-transparent border-transparent shadow-none'
    : 'bg-[#170C79]/90 border-[#170C79]/20 shadow-lg backdrop-blur-md';

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full border-b transition-all duration-500 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src={logoNobg}
                alt="Intanium"
                width={40}
                height={40}
                priority
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <motion.span
                className="text-2xl font-extrabold tracking-tight bg-[linear-gradient(110deg,#ffffff,35%,#a5b4fc,50%,#ffffff,75%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent select-none"
                initial={{ backgroundPosition: "200% 0" }}
                animate={{ backgroundPosition: "-200% 0" }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear",
                }}
              >
                INTANIUM
              </motion.span>
            </Link>
          </div>

          {/* Desktop Hover Dropdown Navigation */}
          <div className="hidden lg:flex items-center">
            <DropdownNavigation navItems={NAV_ITEMS} />
          </div>

          {/* Action buttons (Admin Portal) */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href={ROUTES.ADMIN_LOGIN}>
              <Button size="sm" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/50">
                Admin Panel
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80 hover:text-white focus:outline-none cursor-pointer transition-colors"
              aria-expanded={isOpen}
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

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-white/15 bg-[#170C79] overflow-hidden shadow-2xl"
          >
            <div className="py-3 px-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {NAV_ITEMS.map((item, index) => {
                const hasSub = !!item.subMenus;
                const isExpanded = activeAccordion === index;

                if (hasSub) {
                  return (
                    <div key={item.label} className="border-b border-white/5 py-1">
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex items-center justify-between py-2 px-3 min-h-[44px] rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-base font-semibold transition-all focus:outline-none cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <span>{item.label}</span>
                        <CaretDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isExpanded ? "rotate-180 text-white" : "text-white/60"
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
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-2">
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
                                        className={`flex items-center gap-3 p-2 min-h-[44px] rounded-lg transition-all ${
                                          isSubActive
                                            ? "text-white bg-white/20 font-semibold"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                        }`}
                                      >
                                        <div className="rounded-md flex items-center justify-center p-1.5 bg-white/10 text-white/80 shrink-0">
                                          <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="leading-tight">
                                          <p className="text-sm font-medium">{subItem.label}</p>
                                          {subItem.description && (
                                            <p className="text-[10px] text-white/50 font-normal line-clamp-1">
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
                      className={`flex items-center gap-3 py-2 px-3 min-h-[44px] rounded-lg text-base font-semibold transition-all ${
                        isActive
                          ? "text-white bg-white/20 shadow-md"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 text-white/80" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                }
              })}

              <div className="pt-4 pb-2 border-t border-white/15">
                <Link
                  href={ROUTES.ADMIN_LOGIN}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-4 min-h-[44px] border border-white/20 rounded-lg text-base font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function DropdownNavigation({ navItems }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [isHover, setIsHover] = useState(null);

  const handleHover = (menuLabel) => {
    setOpenMenu(menuLabel);
  };

  return (
    <ul className="relative flex items-center space-x-1">
      {navItems.map((navItem) => (
        <li
          key={navItem.label}
          className="relative"
          onMouseEnter={() => handleHover(navItem.label)}
          onMouseLeave={() => handleHover(null)}
          onFocus={() => handleHover(navItem.label)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              handleHover(null);
            }
          }}
        >
          {navItem.subMenus ? (
            <button
              className="text-sm py-2 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-white/85 hover:text-white font-semibold relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#170C79]"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span className="relative z-10">{navItem.label}</span>
              <CaretDown
                className={`h-4 w-4 relative z-10 group-hover:rotate-180 duration-300 transition-transform text-white/60 group-hover:text-white
                  ${openMenu === navItem.label ? "rotate-180 text-white" : ""}`}
              />
              {(isHover === navItem.id || openMenu === navItem.label) && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full bg-white/10 border border-white/15"
                  style={{ borderRadius: 99 }}
                />
              )}
            </button>
          ) : (
            <Link
              href={navItem.link || "#"}
              className="text-sm py-2 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-white/85 hover:text-white font-semibold relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#170C79]"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span className="relative z-10">{navItem.label}</span>
              {isHover === navItem.id && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full bg-white/10 border border-white/15"
                  style={{ borderRadius: 99 }}
                />
              )}
            </Link>
          )}

          <AnimatePresence>
            {openMenu === navItem.label && navItem.subMenus && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                <motion.div
                  className="bg-white border border-gray-100 p-5 rounded-2xl shadow-2xl w-max backdrop-blur-md"
                  layoutId="menu"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex gap-8 shrink-0 overflow-hidden">
                    {navItem.subMenus.map((sub) => (
                      <motion.div layout className="min-w-[200px]" key={sub.title}>
                        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                          {sub.title}
                        </h3>
                        <ul className="space-y-4">
                          {sub.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <li key={item.label}>
                                <Link
                                  href={item.link || "#"}
                                  className="flex items-start gap-3 group/item p-1.5 rounded-xl hover:bg-purple-50/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#170C79] focus-visible:ring-offset-2"
                                >
                                  <div className="border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center size-9 shrink-0 group-hover/item:bg-[#170C79] group-hover/item:text-white group-hover/item:border-[#170C79] transition-colors duration-200">
                                    <Icon className="h-5 w-5 flex-none" />
                                  </div>
                                  <div className="leading-tight">
                                    <p className="text-sm font-semibold text-gray-800 group-hover/item:text-[#170C79] transition-colors duration-200">
                                      {item.label}
                                    </p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 max-w-[170px]">
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
      ))}
    </ul>
  );
}
