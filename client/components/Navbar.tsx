'use client';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { GraduationCap, LogOut, Shield, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-600 text-white">
            <GraduationCap size={20} />
          </span>
          <span>Edu<span className="text-brand-600">Hub</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-600 transition">Asosiy</Link>
          <Link href="/courses" className="hover:text-brand-600 transition">Kurslar</Link>
          {user && <Link href="/dashboard" className="hover:text-brand-600 transition">Kabinet</Link>}
          {user?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1 text-brand-700 hover:text-brand-800">
              <Shield size={16} /> Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserIcon size={16} /> {user.email}
              </span>
              <button onClick={logout} className="btn-ghost px-3 py-2 text-sm">
                <LogOut size={16} /> Chiqish
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4 py-2 text-sm">Kirish</Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">Boshlash</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}