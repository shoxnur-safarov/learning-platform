'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(email, password); router.push('/dashboard'); }
    catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl">
            <span className="grid place-items-center w-11 h-11 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
              <GraduationCap size={24} />
            </span>
            <span>Edu<span className="text-brand-600">Hub</span></span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Xush kelibsiz! 👋</h1>
          <p className="text-slate-500 text-sm mb-7">Hisobingizga kiring va o'rganishni davom eting</p>

          {err && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium">
              ⚠️ {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="email" placeholder="email@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parol</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10" />
              </div>
            </div>
            <button type="submit" disabled={busy}
              className="btn-primary w-full py-3.5 text-base shadow-lg shadow-brand-500/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirish...
                </span>
              ) : (
                <span className="flex items-center gap-2">Kirish <ArrowRight size={18} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="text-brand-600 font-bold hover:underline">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}