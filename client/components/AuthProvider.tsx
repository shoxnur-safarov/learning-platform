'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, token, User } from '@/lib/api';

type Ctx = { user: User | null; loading: boolean; login: (email:string,password:string)=>Promise<void>; register:(name:string,email:string,password:string)=>Promise<void>; logout:()=>void; };
const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = token.get();
    if (!t) { setLoading(false); return; }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setUser({ id: payload.id, email: payload.email, name: '', role: payload.role });
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    token.set(r.token); setUser(r.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const r = await api<{ user: User; token: string }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, password })
    });
    token.set(r.token); setUser(r.user);
  };

  const logout = () => { token.clear(); setUser(null); };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}