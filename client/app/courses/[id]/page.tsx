'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Lock, PlayCircle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<Course>(`/courses/${id}`).then(setCourse);
    if (user) {
      api<Course[]>('/enrollments/my').then(list => setEnrolled(list.some(c => c.id === Number(id))));
    }
  }, [id, user]);

  const buy = async () => {
    if (!user) return router.push('/login');
    try {
      await api(`/enrollments/${id}`, { method: 'POST' });
      setEnrolled(true); setMsg('✅ Muvaffaqiyatli sotib olindi!');
    } catch (e: any) { setMsg('⚠️ ' + e.message); }
  };

  if (!course) return <div className="p-20 text-center text-slate-500 animate-pulse">Yuklanmoqda...</div>;

  const free = Number(course.price) === 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_400px] gap-12">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="rounded-3xl overflow-hidden mb-8 aspect-video shadow-lg">
          <img src={course.image_url || `https://picsum.photos/seed/${course.id}/1200/600`} className="w-full h-full object-cover" alt={course.title}/>
        </div>
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">{course.level}</span>
        <h1 className="text-4xl font-extrabold mt-4 text-slate-900">{course.title}</h1>
        <p className="text-slate-600 mt-6 text-lg leading-relaxed whitespace-pre-line">{course.description}</p>

        <h2 className="mt-12 text-2xl font-bold text-slate-900">Kurs dasturi</h2>
        <div className="mt-6 space-y-3">
          {course.lessons?.map((l, i) => (
            <div key={l.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-300 transition-colors shadow-sm">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-slate-50 text-slate-600 font-bold">{i + 1}</span>
              <span className="flex-1 font-semibold text-slate-700">{l.title}</span>
              {l.is_preview ? <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Bepul</span> : <Lock className="text-slate-300" size={20}/>}
            </div>
          ))}
          {(!course.lessons || course.lessons.length === 0) && <p className="text-slate-500">Darslar hali kiritilmagan.</p>}
        </div>
      </motion.div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-28 h-fit">
        <div className="card p-8 space-y-6 shadow-xl shadow-slate-200/50 border-slate-200/60">
          <p className="text-4xl font-extrabold text-slate-900">
            {free ? 'Bepul' : `${Number(course.price).toLocaleString()} so'm`}
          </p>
          
          {enrolled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl justify-center">
                <CheckCircle2 size={20}/> Siz bu kursdasiz
              </div>
              {course.lessons && course.lessons.length > 0 && (
                <button onClick={() => router.push(`/learn/${course.id}/${course.lessons![0].id}`)} className="btn-primary w-full py-4 text-lg">
                  <PlayCircle size={20}/> O'qishni boshlash
                </button>
              )}
            </div>
          ) : (
            <button onClick={buy} className="btn-primary w-full py-4 text-lg">
              <ShoppingCart size={20}/> {free ? 'Bepul yozilish' : 'Sotib olish'}
            </button>
          )}
          
          {msg && <p className="text-sm text-center font-medium text-slate-700">{msg}</p>}
          
          <div className="pt-6 border-t border-slate-100 text-sm space-y-3 text-slate-600">
            <p className="flex items-center gap-3"><Clock size={18} className="text-brand-500"/> {course.duration_hours} soatlik video</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-brand-500"/> Umrbod kirish huquqi</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={18} className="text-brand-500"/> Sertifikat</p>
          </div>
        </div>
      </aside>
    </div>
  );
}