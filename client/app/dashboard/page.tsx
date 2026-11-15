'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, BookOpen, Clock, TrendingUp, Award, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

type Progress = Record<number, { total: number; completed: number; percent: number }>;

function ProgressRing({ percent, size = 48 }: { percent: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - percent / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={percent === 100 ? '#10b981' : '#6366f1'}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      api<Course[]>('/enrollments/my').then(setCourses).catch(() => {});
      api<Progress>('/enrollments/my/progress')
        .then(setProgress)
        .catch(() => {})
        .finally(() => setProgressLoading(false));
    }
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const name = user.name || user.email?.split('@')[0] || 'Foydalanuvchi';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  const approvedCourses = courses.filter(c => (c as any).status === 'approved');
  const totalCompleted = approvedCourses.filter(c => (progress[c.id]?.percent ?? 0) === 100).length;
  const totalLessons = Object.values(progress).reduce((s, p) => s + p.completed, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-brand-200 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">{name}!</h1>
          <p className="text-brand-200 text-sm sm:text-base">O'qishni davom ettiring — maqsadingizga yaqinlashyapsiz.</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 max-w-lg">
            {[
              { icon: BookOpen,    label: 'Kurslar',    value: approvedCourses.length },
              { icon: TrendingUp,  label: 'Darslar',    value: totalLessons },
              { icon: Award,       label: 'Tugallangan',value: totalCompleted },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-3 sm:p-4 border border-white/20">
                <Icon size={18} className="text-brand-200 mb-2" />
                <p className="text-xl sm:text-2xl font-extrabold">{value}</p>
                <p className="text-brand-200 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Mening kurslarim</h2>
          <Link href="/courses" className="flex items-center gap-1 text-brand-600 font-semibold text-sm hover:gap-2 transition-all">
            Yangi kurs <ChevronRight size={16} />
          </Link>
        </div>

        {/* Pending so'rovlar */}
        {courses.filter(c => (c as any).status === 'pending').length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Admin tasdigini kutmoqdasiz</p>
              <p className="text-amber-600 text-xs mt-0.5">
                {courses.filter(c => (c as any).status === 'pending').map(c => c.title).join(', ')}
              </p>
            </div>
          </div>
        )}

        {approvedCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 sm:p-16 text-center shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen className="text-brand-400" size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Hali birorta kursga yozilmadingiz</h3>
            <p className="text-slate-500 mb-7 max-w-sm mx-auto text-sm sm:text-base">
              O'zingizga mos kursni tanlang va bugundan o'rganishni boshlang!
            </p>
            <Link href="/courses" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base shadow-lg shadow-brand-500/20">
              Kurslarni ko'rish
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {approvedCourses.map(c => {
              const p = progress[c.id] ?? { total: 0, completed: 0, percent: 0 };
              const done = p.percent === 100;
              const firstLesson = (c as any).first_lesson_id;
              return (
                <div key={c.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300">
                  {/* Rasm */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={(c as any).image_url || `https://picsum.photos/seed/${c.id}/600/340`}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Progress ring ustida */}
                    <div className="absolute bottom-3 right-3 bg-white rounded-full p-0.5 shadow-lg">
                      <div className="relative w-12 h-12 grid place-items-center">
                        <ProgressRing percent={p.percent} size={48} />
                        <span className="absolute text-[10px] font-extrabold text-slate-700">
                          {p.percent}%
                        </span>
                      </div>
                    </div>
                    {done && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Tugallandi
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors text-sm sm:text-base">
                      {c.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={11} /> {c.duration_hours}h</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {p.completed}/{p.total} dars</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${done ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>

                    <Link
                      href={`/courses/${c.id}`}
                      className="btn-primary w-full text-sm py-2.5 justify-center"
                    >
                      <PlayCircle size={15} />
                      {p.completed === 0 ? 'Boshlash' : done ? 'Ko\'rish' : 'Davom etish'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}