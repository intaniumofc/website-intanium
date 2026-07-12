'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Loading from '../components/common/Loading';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ROUTES } from '../lib/constants';
import { createClient } from '../utils/supabase/client';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  Calendar, 
  Newspaper, 
  Image as ImageIcon, 
  Pin, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  Headphones,
  User,
  Users,
  Hash,
  Gamepad2,
  Trophy,
  Camera,
  HardDrive,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import logoNobg from '../assets/logos/logo-nobg.webp';
import { useAdminToast } from '../components/common/useAdminToast';


export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const notify = useAdminToast();
  const supabase = createClient();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('staff');
  const [permissions, setPermissions] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Dropdown menus states
  const isPathMerch = pathname.startsWith('/admin/merchandise') || pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/categories');
  const isPathProfile = pathname.startsWith('/admin/about-intan') || pathname.startsWith('/admin/schedule') || pathname.startsWith('/admin/intan-shining-star');

  const [openDropdowns, setOpenDropdowns] = useState({
    merchandise_group: isPathMerch,
    'about-intan_group': isPathProfile,
  });

  // Sync state if pathname changes
  useEffect(() => {
    if (pathname.startsWith('/admin/merchandise') || pathname.includes('/admin/merchandise')) {
      setOpenDropdowns(prev => ({ ...prev, merchandise_group: true }));
    }
    if (pathname.startsWith('/admin/about-intan') || pathname.startsWith('/admin/schedule') || pathname.startsWith('/admin/intan-shining-star')) {
      setOpenDropdowns(prev => ({ ...prev, 'about-intan_group': true }));
    }
  }, [pathname]);

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getRequiredPermission = (href) => {
    if (href === ROUTES.ADMIN_DASHBOARD) return 'dashboard';
    if (href === ROUTES.ADMIN_MERCHANDISE) return 'merchandise';
    if (href === ROUTES.ADMIN_CATEGORIES) return 'categories';
    if (href === ROUTES.ADMIN_ORDERS) return 'orders';
    if (href.startsWith(ROUTES.ADMIN_ABOUT_INTAN)) return 'about-intan';
    if (href === ROUTES.ADMIN_SHINING_STAR) return 'shining-star';
    if (href === ROUTES.ADMIN_SCHEDULE) return 'schedule';
    if (href === ROUTES.ADMIN_RECAPS) return 'recaps';
    if (href === ROUTES.ADMIN_NEWS) return 'news';
    if (href === ROUTES.ADMIN_PLAYLISTS) return 'playlists';
    if (href === ROUTES.ADMIN_GALLERY) return 'gallery';
    if (href === ROUTES.ADMIN_MADING) return 'mading';
    if (href === ROUTES.ADMIN_HASHTAGS) return 'hashtags';
    if (href === ROUTES.ADMIN_GAMES) return 'games';
    if (href === ROUTES.ADMIN_ESPORT) return 'esport';
    // Halaman keanggotaan dan photobooth dapat dibaca oleh semua staff, proteksi edit/hapus diatur di halaman
    if (href === ROUTES.ADMIN_MEMBERSHIP) return '';
    if (href === ROUTES.ADMIN_PHOTOBOOTH) return '';
    return '';
  };

  const handleLinkClick = (e, href) => {
    if (userRole === 'super_admin') {
      setIsMobileOpen(false);
      return;
    }

    const requiredPermission = getRequiredPermission(href);
    if (requiredPermission && !permissions.includes(requiredPermission)) {
      e.preventDefault();
      notify.error(
        'Akses Dibatasi',
        'Akun Anda tidak memiliki izin untuk mengelola fitur ini. Silakan hubungi IT Support jika membutuhkan akses.'
      );
    } else {
      setIsMobileOpen(false);
    }
  };

  const isSubLinkActive = (subHref) => {
    const [subPath, subSearch] = subHref.split('?');
    if (pathname !== subPath) return false;
    
    if (subPath === '/admin/about-intan') {
      const activeTab = searchParams?.get('tab') || 'stats';
      const subTab = new URLSearchParams(subSearch).get('tab') || 'stats';
      return activeTab === subTab;
    }
    
    return true;
  };

  // Auth checking logic
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          localStorage.removeItem('isAdminAuthenticated');
          router.push(ROUTES.ADMIN_LOGIN);
        } else {
          // Fetch custom admin profile details
          const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            setAdminProfile(data);
            setUserRole(data.role);
            setPermissions(data.permissions || []);
          } else {
            // Default fallback logic in case profile triggers aren't run
            setUserRole('staff');
            setPermissions(['dashboard']);
          }
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error('Error verifying auth:', err);
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAdminAuthenticated');
    router.push(ROUTES.ADMIN_LOGIN);
  };

  const adminLinks = [
    { id: 'dashboard', name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { 
      id: 'merchandise_group', 
      name: 'Merchandise', 
      icon: ShoppingBag,
      subLinks: [
        { name: 'Daftar Produk', href: ROUTES.ADMIN_MERCHANDISE },
        { name: 'Kategori Produk', href: ROUTES.ADMIN_CATEGORIES },
        { name: 'Kelola Order', href: ROUTES.ADMIN_ORDERS }
      ]
    },
    {
      id: 'about-intan_group',
      name: 'Profil Intan',
      icon: User,
      subLinks: [
        { name: 'Statistik', href: `${ROUTES.ADMIN_ABOUT_INTAN}?tab=stats` },
        { name: 'Setlist & Unit Songs', href: `${ROUTES.ADMIN_ABOUT_INTAN}?tab=setlists` },
        { name: 'Video Highlights', href: `${ROUTES.ADMIN_ABOUT_INTAN}?tab=videos` },
        { name: 'Trivia & Fakta', href: `${ROUTES.ADMIN_ABOUT_INTAN}?tab=trivia` },
        { name: '#IntanShiningStar', href: ROUTES.ADMIN_SHINING_STAR },
        { name: 'Schedule', href: ROUTES.ADMIN_SCHEDULE }
      ]
    },
    { id: 'recaps', name: 'Recap & Zine', href: ROUTES.ADMIN_RECAPS, icon: BookOpen },
    { id: 'news', name: 'Berita & News', href: ROUTES.ADMIN_NEWS, icon: Newspaper },
    { id: 'playlists', name: 'Denger Intan', href: ROUTES.ADMIN_PLAYLISTS, icon: Headphones },
    { id: 'gallery', name: 'Galeri Album', href: ROUTES.ADMIN_GALLERY, icon: ImageIcon },
    { id: 'mading', name: 'Moderasi Mading', href: ROUTES.ADMIN_MADING, icon: Pin },
    { id: 'hashtags', name: 'Kelola Tagar', href: ROUTES.ADMIN_HASHTAGS, icon: Hash },
    { id: 'games', name: 'Kelola Game', href: ROUTES.ADMIN_GAMES, icon: Gamepad2 },
    { id: 'esport', name: 'Kelola Esport', href: ROUTES.ADMIN_ESPORT, icon: Trophy },
    { id: 'keanggotaan', name: 'Kelola Keanggotaan', href: ROUTES.ADMIN_MEMBERSHIP, icon: Users },
    { id: 'photobooth', name: 'Kelola Photobooth', href: ROUTES.ADMIN_PHOTOBOOTH, icon: Camera },
    { id: 'media', name: 'Media Manager', href: ROUTES.ADMIN_MEDIA_MANAGER, icon: HardDrive },
    { id: 'audit-logs', name: 'Log Aktivitas', href: ROUTES.ADMIN_AUDIT_LOGS, icon: Shield },
  ];

  // Filter links based on sidebar search input
  const filteredLinks = adminLinks.filter(link => {
    if (link.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    if (link.subLinks && link.subLinks.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
    return false;
  });

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  if (isAuthLoading) {
    return <Loading message="Memverifikasi hak akses admin..." />;
  }

  return (
    <div 
      className="min-h-screen bg-[#F4F5FC] text-slate-800 flex overflow-x-hidden"
    >
      
      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-350" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* ================= SIDEBAR (DESKTOP & MOBILE) ================= */}
      <aside
        data-lenis-prevent
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200/80 z-50 flex flex-col
          transition-[width,transform] duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          width: isCollapsed ? '100px' : '280px'
        }}
      >
        {/* Header with logo and collapse button */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/30 h-20 shrink-0">
        <div className="flex items-center space-x-2.5 overflow-hidden w-full">
          <Image width={40} height={40} alt="Logo Intanium" src={logoNobg} className={`w-10 h-10 object-contain shrink-0 transition-all duration-300 ${isCollapsed ? "mx-auto" : ""}`} />
          <div className={`flex flex-col text-left transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 select-none whitespace-nowrap">
              Intanium Admin
            </span>
            <span className="text-[10px] text-[#170C79]/85 font-black tracking-wider uppercase whitespace-nowrap">
              {userRole === 'super_admin' ? 'Super Admin' : (userRole === 'coordinator' ? 'Koordinator' : 'Staff Admin')}
            </span>
          </div>
        </div>
 
        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200 border border-slate-200 cursor-pointer text-slate-500 hover:text-slate-800 shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
 
        {/* Search Bar */}
      <div className={`px-4 py-3 shrink-0 border-b border-slate-100 transition-all duration-300 overflow-hidden ${isCollapsed ? "opacity-0 h-0 py-0 border-b-0" : "opacity-100"}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input type="text" name="search-menu" autoComplete="off" placeholder="Search menu…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus-visible:outline-none focus-visible:border-[#170C79] focus-visible:ring-2 focus-visible:ring-[#170C79]/15 transition-colors duration-200" />
        </div>
      </div>

        {/* Navigation List */}
        <nav
          data-lenis-prevent
          className={`flex-1 px-3 py-4 admin-scrollbar ${isCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
        >
          <ul className="space-y-1">
            {filteredLinks.map((item) => {
              const Icon = item.icon;

              if (item.subLinks) {
                const isSubActive = item.subLinks.some(sub => isSubLinkActive(sub.href));
                const isOpen = openDropdowns[item.id];
                
                return (
                  <li key={item.id} className="relative">
                    {!isCollapsed ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleDropdown(item.id)}
                          className={`
                          w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer
                          ${isSubActive
                            ? "bg-[#170C79]/8 text-[#170C79] font-bold border-l-4 border-[#170C79]"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                          }
                        `}
                      >
                        <div className="flex items-center justify-center min-w-[24px]">
                          <Icon
                            className={`
                              h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105
                              ${isSubActive ? "text-[#170C79]" : "text-slate-400 group-hover:text-slate-700"}
                            `}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="text-xs truncate">{item.name}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:text-slate-700 ${
                              isOpen ? "rotate-180 text-[#170C79]" : "text-slate-400"
                            }`}
                          />
                        </div>
                        </button>

                        {isOpen && (
                        <ul className="mt-1 ml-6 pl-2.5 border-l border-slate-200/80 space-y-1 select-none">
                          {item.subLinks.map((sub) => {
                            const isSubItemActive = isSubLinkActive(sub.href);
                            return (
                              <li key={sub.name}>
                                <Link
                                  href={sub.href}
                                  onClick={(e) => handleLinkClick(e, sub.href)}
                                  className={`
                                    block px-3.5 py-2 text-[11px] rounded-lg transition-colors duration-150
                                    ${isSubItemActive
                                      ? "bg-slate-50 text-[#170C79] font-extrabold border-l-2 border-[#170C79]"
                                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-bold"
                                    }
                                  `}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                        )}
                      </div>
                    ) : (
                      // Collapsed Sidebar Sub-links Hover Popover
                      <div className="relative group/popover flex justify-center">
                        <button
                          type="button"
                          className={`
                            w-full flex items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-200
                            ${isSubActive ? "bg-[#170C79]/8 text-[#170C79]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
                          `}
                        >
                          <div className="flex items-center justify-center min-w-[24px]">
                            <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isSubActive ? "text-[#170C79]" : "text-slate-400"}`} />
                          </div>
                        </button>

                        <div className="absolute left-full ml-3 bg-white text-slate-800 text-[10px] rounded-xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all duration-200 z-50 shadow-xl border border-slate-200 py-1.5 min-w-[140px] text-left">
                          <p className="px-3.5 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 mb-1">{item.name}</p>
                          {item.subLinks.map((sub) => {
                            const isSubItemActive = isSubLinkActive(sub.href);
                            return (
                              <Link
                                key={sub.name}
                                  href={sub.href}
                                  onClick={(e) => handleLinkClick(e, sub.href)}
                                  className={`block px-3.5 py-2 hover:bg-slate-50 transition-colors font-bold ${
                                    isSubItemActive ? "text-[#170C79] bg-slate-50" : "text-slate-600 hover:text-slate-900"
                                  }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                          <div className="absolute left-0 top-6 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-white border-l border-b border-slate-200 rotate-45" />
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              const isActive = pathname === item.href;

              return (
                <li key={item.id} className="relative">
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className={`
                      w-full flex items-center rounded-xl transition-all duration-200 group
                      ${isCollapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3.5 py-2.5 text-left"}
                      ${isActive
                        ? "bg-[#170C79]/8 text-[#170C79] font-bold border-l-4 border-[#170C79]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105
                          ${isActive 
                            ? "text-[#170C79]" 
                            : "text-slate-400 group-hover:text-slate-700"
                          }
                        `}
                      />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full min-w-0 transition-all duration-300">
                        <span className="text-xs truncate">{item.name}</span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-colors duration-200 whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-white border-l border-b border-slate-200 rotate-45" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? "md:pl-[100px]" : "md:pl-[280px]"
        }`}
      >
        {/* Sticky App Header */}
        <header className="sticky top-0 z-40 h-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Hamburger Button (Mobile) */}
            <button 
              type="button"
              onClick={toggleSidebar} 
              className="md:hidden flex shrink-0 items-center justify-center w-10 h-10 border border-slate-200 rounded-xl text-[#170C79] hover:bg-slate-50 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Title / Brand */}
            <span className="font-extrabold text-sm md:text-base text-slate-800 tracking-tight truncate">
              <span className="hidden sm:inline">Dashboard Administrator</span>
              <span className="sm:hidden">Dashboard</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* View Site Quick Access */}
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#170C79] hover:bg-[#170C79]/8 border border-slate-200 p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white transition-colors shadow-xs"
              title="Web Publik"
            >
              <span className="hidden sm:inline">Web Publik</span>
              <ExternalLink className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Link>

            {/* Profile Section */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-2 sm:pl-4 h-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#170C79] text-white rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0 select-none">
                  {adminProfile?.username ? adminProfile.username.substring(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {userRole === 'super_admin' ? 'Super Admin' : (userRole === 'coordinator' ? 'Koordinator' : 'Staff Admin')}
                  </p>
                  <p className="text-[9px] text-slate-400">{adminProfile?.username || 'admin@intanium.admin'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main data-lenis-prevent className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
