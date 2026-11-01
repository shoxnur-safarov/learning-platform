'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login(email, password); router.push('/dashboard'); }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-6 py-12">
      <form onSubmit={submit} className="card p-8 w-full max-w-md space-y-5">
        <h1 className="text-3xl font-extrabold">Xush kelibsiz 👋</h1>
        <p className="text-slate-500">Hisobingizga kiring</p>
        {err && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{err}</div>}
        <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"/>
        <input required type="password" placeholder="Parol" value={password} onChange={e=>setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"/>
        <button className="btn-primary w-full">Kirish</button>
        <p className="text-center text-sm text-slate-500">
          Hisobingiz yo'qmi? <Link href="/register" className="text-brand-600 font-semibold hover:underline">Ro'yxatdan o'ting</Link>
        </p>
      </form>
    </div>
  );
}