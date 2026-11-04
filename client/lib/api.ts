const API = process.env.NEXT_PUBLIC_API!;

export const token = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  set: (t: string) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token')
};

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = token.get();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Xato');
  return data;
}

export type Course = {
  id: number; title: string; description: string; price: string;
  image_url: string; level: string; duration_hours: number;
  lessons?: { id: number; title: string; content: string; video_url: string; order_index: number; is_preview: boolean }[];
};
export type User = { id: number; name: string; email: string; role: string };