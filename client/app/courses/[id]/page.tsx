'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Lock, PlayCircle, CheckCircle2, Send, XCircle, BookOpen, GraduationCap, Bell } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

type EnrollStatus = 'none' | 'pending' | 'approved' | 'rejected';

const GRADIENTS = [
  'from-brand-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-pink-600',
  'from-sky-500 to-cyan-600',
  'from-rose-500 to-red-600',
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [status, setStatus] = useState<EnrollStatus>('none');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [justApproved, setJustApproved] = useState(false);
  const prevStatus = useRef<EnrollStatus>('none');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async () => {
    if (!user || user.role === 'admin') return;
    try {
      const r = await api<{ status: string | null }>(`/enrollments/check/${id}`);
      const s = (r.status as EnrollStatus) || 'none';
      if (prevStatus.current === 'pending' && s === 'approved') {
        setJustApproved(true);
      }
      prevStatus.current = s;
      setStatus(s);
    } catch {}
  };

  useEffect(() => {
    api<Course>(`/courses/${id}`).then(setCourse).catch(() => {});
    if (user) {
      if (user.role === 'admin') {
        setStatus('approved');
      } else {
        checkStatus();
        // Har 8 soniyada tekshirish — pending bo'lsa
        pollRef.current = setInterval(() => {
          if (prevStatus.current === 'pending') checkStatus();
        }, 8000);
      }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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

  const grad = GRADIENTS[(course.id ?? 0) % GRADIENTS.length];
  const initials = course.title.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join('');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 grid lg:grid-cols-[1fr_380px] gap-6 sm:gap-12">
      {/* Real-time tasdiqlandi xabari */}
      {justApproved && (
        <div className="lg:col-span-2 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/30 animate-pulse">
          <Bell size={20} />
          <span className="font-bold">🎉 Tabriklaymiz! Admin kursga kirishingizni tasdiqladi.</span>
          <button onClick={() => setJustApproved(false)} className="ml-auto text-white/70 hover:text-white text-xl leading-none">×</button>
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-3xl overflow-hidden mb-6 sm:mb-8 aspect-video shadow-lg bg-slate-100">
          {course.image_url ? (
            <img src={course.image_url} className="w-full h-full object-cover" alt={course.title}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center gap-4`}>
              <GraduationCap size={56} className="text-white/70" />
              <span className="text-white font-extrabold text-4xl tracking-wide opacity-80">{initials}</span>
            </div>
          )}
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