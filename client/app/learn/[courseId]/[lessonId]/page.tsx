'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { api, Course } from '@/lib/api';

export default function LearnPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course>(`/courses/${courseId}`).then(setCourse);
  }, [courseId]);

  useEffect(() => {
    api(`/lessons/${courseId}/${lessonId}`)
      .then(setLesson)
      .catch((e) => setError(e.message));
  }, [courseId, lessonId]);

  if (error) return <div className="p-20 text-center text-red-500 font-bold bg-red-50 rounded-2xl max-w-2xl mx-auto mt-10">{error}</div>;
  if (!course || !lesson) return <div className="p-20 text-center text-slate-500 animate-pulse">Dars yuklanmoqda...</div>;

  const lessons = course.lessons || [];
  const idx = lessons.findIndex(l => l.id === Number(lessonId));
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[320px_1fr] gap-8">
      <aside className="card p-5 h-fit lg:sticky lg:top-24 border-slate-200/60 shadow-sm">
        <h3 className="font-bold text-sm uppercase text-slate-400 mb-4 tracking-wider">Kurs darsliklari</h3>
        <div className="space-y-1">
          {lessons.map((l, i) => (
            <Link key={l.id} href={`/learn/${courseId}/${l.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${l.id === Number(lessonId) ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'hover:bg-slate-100 text-slate-700'}`}>
              <span className={`w-6 h-6 grid place-items-center rounded-md text-xs ${l.id === Number(lessonId) ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{i+1}</span>
              <span className="line-clamp-1">{l.title}</span>
            </Link>
          ))}
        </div>
      </aside>

      <article>
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h1 className="text-3xl font-extrabold mb-6 text-slate-900">{lesson.title}</h1>
          
          {lesson.video_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-900 shadow-lg">
              <iframe src={lesson.video_url} className="w-full h-full" allowFullScreen />
            </div>
          )}
          
          <div className="prose max-w-none whitespace-pre-line text-slate-700 leading-relaxed text-lg">
            {lesson.content || "Bu dars uchun matn kiritilmagan."}
          </div>
        </div>

        <div className="flex justify-between items-center">
          {prev ? (
            <Link href={`/learn/${courseId}/${prev.id}`} className="btn-ghost"><ChevronLeft size={18}/> Oldingi dars</Link>
          ) : <span/>}
          {next ? (
            <Link href={`/learn/${courseId}/${next.id}`} className="btn-primary">Keyingi dars <ChevronRight size={18}/></Link>
          ) : <span/>}
        </div>
      </article>
    </div>
  );
}