'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, BookOpen } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) api<Course[]>('/enrollments/my').then(setCourses);
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-20 text-center animate-pulse text-slate-500">Yuklanmoqda...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Salom, {user.email.split('@')[0]}! 👋</h1>
        <p className="text-slate-500 mt-2">Sizning shaxsiy kabinetingiz</p>
      </div>

      <h2 className="text-2xl font-bold mb-6">Mening kurslarim</h2>
      
      {courses.length === 0 ? (
        <div className="card p-16 text-center shadow-sm">
          <BookOpen className="mx-auto text-slate-300 mb-4" size={56}/>
          <p className="text-slate-500 mb-6 text-lg">Siz hali hech qanday kursga yozilmadingiz</p>
          <Link href="/courses" className="btn-primary">Kurslarni ko'rish</Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => (
            <div key={c.id} className="card group hover:-translate-y-1 transition-transform">
              <img src={c.image_url || `https://picsum.photos/seed/${c.id}/600/340`} className="w-full aspect-video object-cover" alt=""/>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4 line-clamp-1">{c.title}</h3>
                <Link href={`/courses/${c.id}`} className="btn-primary w-full">
                  <PlayCircle size={18}/> Davom etish
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}