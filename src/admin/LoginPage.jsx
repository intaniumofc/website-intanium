import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ROUTES } from '../lib/constants';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate login delay
    await new Promise((r) => setTimeout(r, 600));

    // Standard local authentication bypass for boilerplate purposes
    if (formData.email === 'admin@intanium.com' && formData.password === 'admin123') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      setIsLoading(false);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else {
      setError('Email atau password admin salah. Hubungi Developer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative neon gradient blobs */}
      <div className="bg-blob w-[400px] h-[400px] bg-purple-600/20 top-[-100px] left-[-100px]" />
      <div className="bg-blob w-[300px] h-[300px] bg-cyan-600/20 bottom-[-50px] right-[-50px]" />

      <Card hoverEffect={false} padding="normal" className="border border-[var(--border-color)] max-w-sm w-full relative z-10 space-y-6">
        <div className="text-center space-y-2">
          {/* Logo element */}
          <Link to="/" className="inline-flex items-center gap-2 group mb-2 justify-center">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-extrabold shadow-md text-neon-glow">
              I
            </span>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              INTAN<span className="text-[var(--color-primary)]">IUM</span>
            </span>
          </Link>

          <h2 className="text-lg font-bold text-white tracking-wide uppercase">
            Admin Portal Login
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Gunakan akun administrator terdaftar Anda untuk masuk ke dashboard sistem.
          </p>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400 text-center leading-relaxed">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Email Administrator
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@intanium.com"
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Password Sandi</span>
              <span className="text-[9px] text-[var(--text-muted)] lowercase">default: admin123</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="glow"
            className="w-full py-2.5"
            isLoading={isLoading}
          >
            Masuk Sekarang 🔒
          </Button>
        </form>

        <div className="border-t border-[var(--border-color)] pt-4 text-center">
          <Link to="/" className="text-xs text-[var(--text-secondary)] hover:text-purple-300 transition-colors font-medium">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </Card>
    </div>
  );
}
