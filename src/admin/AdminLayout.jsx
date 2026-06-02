import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import Button from '../components/common/Button';
import { supabase } from '../lib/supabaseClient';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Basic protection (can be expanded with full session checks)
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
    { name: '📊 Ringkasan (Dashboard)', path: ROUTES.ADMIN_DASHBOARD },
    { name: '🛍️ Merchandise', path: ROUTES.ADMIN_MERCHANDISE },
    { name: '📖 Recap & Zine', path: ROUTES.ADMIN_RECAPS },
    { name: '📅 Jadwal Stream', path: ROUTES.ADMIN_SCHEDULE },
    { name: '📰 Berita & News', path: ROUTES.ADMIN_NEWS },
    { name: '🖼️ Galeri Album', path: ROUTES.ADMIN_GALLERY },
    { name: '📌 Moderasi Mading', path: ROUTES.ADMIN_MADING },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile Drawer navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center text-white font-extrabold text-xs">A</span>
          <span className="font-bold text-sm tracking-tight">INTANIUM ADMIN</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[var(--text-secondary)] hover:text-white"
        >
          {isOpen ? '✕ Menu' : '☰ Menu'}
        </button>
      </div>

      {/* Sidebar navigation panel */}
      <aside className={`${
        isOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex-shrink-0 flex flex-col justify-between py-6 px-4 space-y-6 relative`}>
        <div className="space-y-6">
          <div className="hidden md:flex items-center gap-3 pb-4 border-b border-[var(--border-color)]">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              A
            </span>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">Intanium Portal</h2>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Super Administrator</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
          <Link to="/" className="block w-full text-center text-xs text-[var(--text-secondary)] hover:underline">
            ← Lihat Website Publik
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white"
          >
            Keluar (Logout) 🔒
          </Button>
        </div>
      </aside>

      {/* Main content viewport */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
