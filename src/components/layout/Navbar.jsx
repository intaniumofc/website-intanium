import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Globe,
  Sparkles,
  Calendar,
  BookOpen,
  Newspaper,
  MessageSquare,
  Image,
  Palette,
  ShoppingBag,
  CreditCard,
  Music,
  PlayCircle,
  ChevronDown
} from "lucide-react";
import logoNobg from '../../assets/logos/logo-nobg.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Tentang Intan', path: ROUTES.ABOUT_INTAN },
    { name: 'Intanium', path: ROUTES.ABOUT_INTANIUM },
    { name: 'Merchandise', path: ROUTES.MERCHANDISE },
    { name: 'News', path: ROUTES.NEWS },
    { name: 'Schedule', path: ROUTES.SCHEDULE },
    { name: 'Mading', path: ROUTES.MADING },
    { name: 'Galeri', path: ROUTES.GALLERY },
    { name: '#dengerINTAN', path: ROUTES.DENGER_INTAN },
  ];

  // Nested navigation schemas for custom hover dropdowns on desktop viewports
  const NAV_ITEMS = [
    {
      id: 1,
      label: "About",
      subMenus: [
        {
          title: "Profile & Character",
          items: [
            {
              label: "About Nur Intan",
              description: "Profil lengkap, biodata, dan fakta menarik seputar Intan",
              icon: User,
              link: ROUTES.ABOUT_INTAN,
            },
            {
              label: "Bintang Berkilau",
              description: "Kilas balik milestone pencapaian bersejarah Intan",
              icon: Sparkles,
              link: ROUTES.SHINING_STAR,
            },
          ],
        },
        {
          title: "Lore Komunitas",
          items: [
            {
              label: "About Intanium",
              description: "Asal usul, filosofi, pedoman, dan cara gabung Discord server",
              icon: Globe,
              link: ROUTES.ABOUT_INTANIUM,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      label: "Aktivitas",
      subMenus: [
        {
          title: "Kalender & Logs",
          items: [
            {
              label: "Schedule",
              description: "Jadwal theater, video call, birthday, dan event Nur Intan",
              icon: Calendar,
              link: ROUTES.SCHEDULE,
            },
            {
              label: "Zine & Recap",
              description: "Arsip e-magazine digital recap aktivitas bulanan komunitas",
              icon: BookOpen,
              link: ROUTES.RECAPS,
            },
          ],
        },
        {
          title: "Informasi",
          items: [
            {
              label: "Berita & News",
              description: "Rilis pengumuman, agenda event resmi terkini",
              icon: Newspaper,
              link: ROUTES.NEWS,
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
          title: "Interaksi Kreatif",
          items: [
            {
              label: "Papan Mading",
              description: "Tempelkan pesan dukungan hangat Anda di mading digital",
              icon: MessageSquare,
              link: ROUTES.MADING,
            },
            {
              label: "Karya Fanart",
              description: "Koleksi lukisan indah sumbangan dari para artist fans",
              icon: Palette,
              link: ROUTES.FANART,
            },
          ],
        },
        {
          title: "Dokumentasi",
          items: [
            {
              label: "Galeri Foto",
              description: "Arsip screenshot kenangan momen-momen stream seru",
              icon: Image,
              link: ROUTES.GALLERY,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      label: "Official Shop",
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
              label: "Cek Pesanan",
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
  ];

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-[#170C79]/90 border-b border-[#170C79]/20 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logoNobg}
                alt="Intanium"
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
            <Link to={ROUTES.ADMIN_LOGIN}>
              <Button size="sm" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/50">
                Admin Panel
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white focus:outline-none cursor-pointer transition-colors"
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
      {isOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[#170C79] py-2 px-4 space-y-1 shadow-2xl animate-slide-down">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold transition-all ${isActive
                  ? 'text-white bg-white/20 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-2 border-t border-white/15">
            <Link
              to={ROUTES.ADMIN_LOGIN}
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2 border border-white/20 rounded-lg text-base font-semibold text-white hover:bg-white/10 transition-all"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
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
        >
          {navItem.subMenus ? (
            <button
              className="text-sm py-2 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-white/85 hover:text-white font-semibold relative rounded-full"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span className="relative z-10">{navItem.label}</span>
              <ChevronDown
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
              to={navItem.link || "#"}
              className="text-sm py-2 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-white/85 hover:text-white font-semibold relative rounded-full"
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
                                  to={item.link || "#"}
                                  className="flex items-start gap-3 group/item p-1.5 rounded-xl hover:bg-purple-50/50 transition-all duration-200"
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
