'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { GraduationCap, LogOut, Shield, LayoutDashboard, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase();

  const navLink = (href: string, label: string) => (
    <Link key={href} href={href}
      className={`text-sm font-medium transition-colors ${path === href ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/30">
            <GraduationCap size={20} />
          </span>
          <span className="text-slate-900">Edu<span className="text-brand-600">Hub</span></span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLink('/', 'Asosiy')}
          {navLink('/courses', 'Kurslar')}
          {user && navLink('/dashboard', 'Kabinet')}
          {user?.role === 'admin' && (
            <Link href="/admin"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${path === '/admin' ? 'text-purple-600' : 'text-purple-500 hover:text-purple-700'}`}>
              <Shield size={15} /> Admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold grid place-items-center shadow-sm">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <button onClick={logout}
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
      </nav>
    </header>
  );
}