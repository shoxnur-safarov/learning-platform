'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Lock, PlayCircle, CheckCircle2, Send, XCircle, BookOpen } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

type EnrollStatus = 'none' | 'pending' | 'approved' | 'rejected';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<EnrollStatus>('none');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<Course>(`/courses/${id}`).then(setCourse).catch(() => {});
    if (user) {
      if (user.role === 'admin') {
        setStatus('approved'); // Admin hamma kursni ko'ra oladi
      } else {
        api<{ status: string | null }>(`/enrollments/check/${id}`)
          .then(r => setStatus((r.status as EnrollStatus) || 'none'))
          .catch(() => {});
      }
    }
  }, [id, user]);

  const sendRequest = async () => {
    if (!user) return router.push('/login');
    setBusy(true);
    try {
      await api(`/enrollments/${id}`, { method: 'POST' });
      setStatus('pending');
      setMsg("✅ So'rovingiz yuborildi! Admin tasdiqlashini kuting.");
    } catch (e: any) {
      setMsg('⚠️ ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_380px] gap-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-3xl overflow-hidden mb-8 aspect-video shadow-lg bg-slate-100">
          <img src={course.image_url || `https://picsum.photos/seed/${course.id}/1200/600`}
            className="w-full h-full object-cover" alt={course.title} />
        </div>
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
          {course.level}
        </span>
        <h1 className="text-4xl font-extrabold mt-4 text-slate-900">{course.title}</h1>
        <p className="text-slate-600 mt-6 text-lg leading-relaxed whitespace-pre-line">{course.description}</p>

        {/* Kurs dasturi */}
        <h2 className="mt-12 text-2xl font-bold text-slate-900">Kurs dasturi</h2>
        <div className="mt-6 space-y-3">
          {course.lessons?.map((l, i) => (
            <div key={l.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-200 transition-colors shadow-sm">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-slate-50 text-slate-600 font-bold shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 font-semibold text-slate-700">{l.title}</span>
              {l.is_preview
                ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Bepul</span>
                : <Lock className="text-slate-300 shrink-0" size={18} />}
            </div>
          ))}
          {(!course.lessons || course.lessons.length === 0) && (
            <p className="text-slate-400 py-4">Darslar hali kiritilmagan.</p>
          )}
        </div>
      </motion.div>

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-28 h-fit">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-8 space-y-6">
          <div>
            <p className="text-4xl font-extrabold text-slate-900">
              {Number(course.price) === 0 ? 'Bepul' : `${Number(course.price).toLocaleString()} so'm`}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Clock size={15} className="text-brand-500" /> {course.duration_hours} soat</span>
              <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-brand-500" /> {course.lessons?.length || 0} dars</span>
            </div>
          </div>

          {/* Holat tugmasi */}
          {status === 'approved' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl justify-center border border-emerald-100">
                <CheckCircle2 size={18} /> Kursga kirish tasdiqlangan
              </div>
              {course.lessons && course.lessons.length > 0 && (
                <button onClick={() => router.push(`/learn/${course.id}/${course.lessons![0].id}`)}
                  className="btn-primary w-full py-4 text-base shadow-lg shadow-brand-500/20">
                  <PlayCircle size={20} /> O'qishni boshlash
                </button>
              )}
            </div>
          )}

          {status === 'pending' && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-xl">
              <Send size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">So'rov yuborildi</p>
                <p className="text-xs mt-0.5 text-amber-600">Admin tasdiqlashini kuting. Tez orada javob beriladi.</p>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl">
                <XCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">So'rov rad etildi</p>
                  <p className="text-xs mt-0.5">Qayta so'rov yuborishingiz mumkin.</p>
                </div>
              </div>
              <button onClick={sendRequest} disabled={busy}
                className="btn-primary w-full py-3.5 disabled:opacity-60">
                <Send size={18} /> Qayta so'rov yuborish
              </button>
            </div>
          )}

          {status === 'none' && (
            <button onClick={sendRequest} disabled={busy}
              className="btn-primary w-full py-4 text-base shadow-lg shadow-brand-500/20 disabled:opacity-60">
              {busy
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yuborilmoqda...</span>
                : <><Send size={18} /> Kursga yozilish so'rovi</>}
            </button>
          )}

          {msg && <p className="text-sm text-center font-medium text-slate-600 bg-slate-50 p-3 rounded-xl">{msg}</p>}

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-sm text-slate-600">
            <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-brand-500" /> Umrbod kirish huquqi</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-brand-500" /> YouTube darsliklar</p>
            <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-brand-500" /> Sertifikat</p>
          </div>
        </div>
      </aside>
    </div>
  );
}