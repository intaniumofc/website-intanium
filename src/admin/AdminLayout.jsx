import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { supabase } from '../lib/supabaseClient';
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
  Search,
  ExternalLink,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import logoNobg from '../assets/logos/logo-nobg.png';


export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth checking logic
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !localStorage.getItem('isAdminAuthenticated')) {
        navigate(ROUTES.ADMIN_LOGIN);
      }
    };
    checkAuth();
  }, [navigate]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAdminAuthenticated');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const adminLinks = [
    { id: 'dashboard', name: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { id: 'merchandise', name: 'Merchandise', href: ROUTES.ADMIN_MERCHANDISE, icon: ShoppingBag },
    { id: 'recaps', name: 'Recap & Zine', href: ROUTES.ADMIN_RECAPS, icon: BookOpen },
    { id: 'schedule', name: 'Jadwal Stream', href: ROUTES.ADMIN_SCHEDULE, icon: Calendar },
    { id: 'news', name: 'Berita & News', href: ROUTES.ADMIN_NEWS, icon: Newspaper },
    { id: 'playlists', name: 'Denger Intan', href: ROUTES.ADMIN_PLAYLISTS, icon: Headphones },
    { id: 'gallery', name: 'Galeri Album', href: ROUTES.ADMIN_GALLERY, icon: ImageIcon },
    { id: 'mading', name: 'Moderasi Mading', href: ROUTES.ADMIN_MADING, icon: Pin },
  ];


  // Filter links based on sidebar search input
  const filteredLinks = adminLinks.filter(link => 
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen text-[var(--text-primary)] flex overflow-x-hidden">
      
      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* ================= SIDEBAR (DESKTOP & MOBILE) ================= */}
      <aside
        data-lenis-prevent
        className={`
          fixed top-0 left-0 h-full bg-[#170C79] border-r border-white/10 z-50 transition-all duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-[112px]" : "w-[312px]"}
          md:translate-x-0
        `}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/10 h-20 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <img
                src={logoNobg}
                alt="Intanium Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="flex flex-col text-left">
                <motion.span
                  className="font-extrabold text-sm tracking-tight whitespace-nowrap bg-[linear-gradient(110deg,#ffffff,35%,#a5b4fc,50%,#ffffff,75%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent select-none"
                  initial={{ backgroundPosition: "200% 0" }}
                  animate={{ backgroundPosition: "-200% 0" }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                  }}
                >
                  Intanium Portal
                </motion.span>
                <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Super Admin</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <img
              src={logoNobg}
              alt="Intanium Logo"
              className="w-10 h-10 object-contain mx-auto shrink-0"
            />
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 cursor-pointer text-white/70 hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-white/70" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white/70" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/25 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav
          data-lenis-prevent
          className={`flex-1 px-3 py-3 admin-scrollbar ${isCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
        >
          <ul className="space-y-1">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <li key={item.id} className="relative">
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-white/15 text-white font-bold shadow-sm"
                        : "text-white/70 hover:bg-white/5 hover:text-white font-medium"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105
                          ${isActive 
                            ? "text-white" 
                            : "text-white/50 group-hover:text-white/80"
                          }
                        `}
                      />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="text-xs truncate">{item.name}</span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-white/10 shrink-0 bg-black/10">
          {/* Profile Panel */}
          <div className={`border-b border-white/10 ${isCollapsed ? 'py-4 px-2' : 'p-4'}`}>
            {!isCollapsed ? (
              <div className="flex items-center px-2.5 py-2 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                <div className="w-9 h-9 bg-white text-[#170C79] rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                  SA
                </div>
                <div className="flex-1 min-w-0 ml-3 text-left">
                  <p className="text-xs font-bold text-white truncate leading-tight">Super Admin</p>
                  <p className="text-[9px] text-white/50 truncate mt-0.5">admin@intanium.com</p>
                </div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full ml-2 shrink-0 border-2 border-[#170C79] shadow-sm" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative cursor-default group">
                  <div className="w-10 h-10 bg-white text-[#170C79] rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm">
                    SA
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#170C79] shadow-sm" />
                  
                  {/* Tooltip for collapsed avatar */}
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg text-left">
                    <span className="block font-bold">Super Admin</span>
                    <span className="block text-[8px] text-slate-400">admin@intanium.com</span>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center rounded-xl text-left transition-all duration-200 group cursor-pointer
                text-red-400 hover:bg-red-500/10 hover:text-red-300
                ${isCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3"}
              `}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-300 transition-transform group-hover:scale-105" />
              </div>
              
              {!isCollapsed && (
                <span className="text-xs font-bold">Sign out</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                  Sign out
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <div 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:pl-[112px]" : "md:pl-[312px]"}
        `}
      >
        {/* Sticky App Header */}
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile) */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden flex items-center justify-center w-10 h-10 border border-slate-200 rounded-xl text-[var(--color-primary)] hover:bg-slate-50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Title / Brand */}
            <span className="font-extrabold text-sm md:text-base text-slate-800 tracking-tight">
              Dashboard Administrator
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Site Quick Access */}
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] border border-[var(--border-color)] px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] transition-all shadow-sm"
            >
              Web Publik <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
