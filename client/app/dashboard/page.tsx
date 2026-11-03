'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, BookOpen, Clock, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) api<Course[]>('/enrollments/my').then(setCourses).catch(() => {});
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const name = user.name || user.email?.split('@')[0] || 'Foydalanuvchi';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-brand-200 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{name}!</h1>
          <p className="text-brand-200">O'qishni davom ettiring — maqsadingizga yaqinlashyapsiz.</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            {[
              { icon: BookOpen, label: "Kurslar", value: courses.length },
              { icon: TrendingUp, label: "Faol", value: courses.length },
              { icon: Award, label: "Tugallangan", value: 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                <Icon size={20} className="text-brand-200 mb-2" />
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-brand-200 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">Mening kurslarim</h2>
          <Link href="/courses" className="flex items-center gap-1 text-brand-600 font-semibold text-sm hover:gap-2 transition-all">
            Yangi kurs <ChevronRight size={16} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-brand-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hali birorta kursga yozilmadingiz</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              O'zingizga mos kursni tanlang va bugundan o'rganishni boshlang!
            </p>
            <Link href="/courses" className="btn-primary px-8 py-4 text-base shadow-lg shadow-brand-500/20">
              Kurslarni ko'rish
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(c => (
              <div key={c.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={c.image_url || `https://picsum.photos/seed/${c.id}/600/340`}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {c.level}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">{c.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Clock size={12} /> {c.duration_hours}h</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {c.lessons?.length || 0} dars</span>
                  </div>
                  {/* Progress bar placeholder */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <Link href={`/courses/${c.id}`} className="btn-primary w-full text-sm py-2.5">
                    <PlayCircle size={16} /> Davom etish
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}