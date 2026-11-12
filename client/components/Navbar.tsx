'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { GraduationCap, LogOut, Shield, Menu, X, LayoutDashboard, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  const links = [
    { href: '/', label: 'Asosiy' },
    { href: '/courses', label: 'Kurslar' },
    ...(user ? [{ href: '/dashboard', label: 'Kabinet' }] : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin', admin: true }] : []),
  ];

  const handleLogout = () => { logout(); setOpen(false); };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl shrink-0" onClick={() => setOpen(false)}>
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/30">
            <GraduationCap size={20} />
          </span>
          <span className="text-slate-900">Edu<span className="text-brand-600">Hub</span></span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-medium transition-colors ${
                l.admin
                  ? path === l.href ? 'text-purple-600 font-semibold' : 'text-purple-500 hover:text-purple-700 flex items-center gap-1'
                  : path === l.href ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}>
              {l.admin && <Shield size={14} className="inline mr-1" />}{l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold grid place-items-center shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
                <LogOut size={16} /> Chiqish
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4 py-2 text-sm">Kirish</Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm shadow-sm shadow-brand-500/20">Boshlash</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm px-4 pb-6 pt-4 space-y-1">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white text-sm font-bold grid place-items-center shadow-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{user.name || user.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Links */}
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                path === l.href
                  ? l.admin ? 'bg-purple-50 text-purple-700' : 'bg-brand-50 text-brand-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {l.admin && <Shield size={16} className="text-purple-500" />}
              {l.label}
            </Link>
          ))}

          {/* Auth buttons */}
          <div className="pt-3 border-t border-slate-100 mt-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Chiqish
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost text-center py-3 text-sm">Kirish</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-center py-3 text-sm">Ro'yxatdan o'tish</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}