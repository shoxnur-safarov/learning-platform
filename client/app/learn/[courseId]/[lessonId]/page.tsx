'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { api, Course } from '@/lib/api';

function toYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return null;
}

export default function LearnPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Course>(`/courses/${courseId}`).then(setCourse).catch(() => {});
  }, [courseId]);

  useEffect(() => {
    setLesson(null);
    setError('');
    api(`/lessons/${courseId}/${lessonId}`)
      .then(setLesson)
      .catch((e) => setError(e.message));
  }, [courseId, lessonId]);

  if (error) return (
    <div className="max-w-2xl mx-auto mt-20 p-10 text-center bg-red-50 rounded-3xl border border-red-100">
      <Lock className="mx-auto mb-4 text-red-400" size={40} />
      <p className="text-red-600 font-bold text-lg">{error}</p>
      <Link href={`/courses/${courseId}`} className="btn-primary mt-6 inline-flex">
        Kursga qaytish
      </Link>
    </div>
  );

  if (!course || !lesson) return (
    <div className="p-20 text-center text-slate-400 animate-pulse text-lg">
      Dars yuklanmoqda...
    </div>
  );

  const lessons = course.lessons || [];
  const idx = lessons.findIndex(l => l.id === Number(lessonId));
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const embedUrl = toYouTubeEmbed(lesson.video_url);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[300px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="card p-5 h-fit lg:sticky lg:top-24 border-slate-200/60 shadow-sm">
        <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 tracking-widest">
          Kurs darsliklari
        </h3>
        <div className="space-y-1">
          {lessons.map((l, i) => (
            <Link
              key={l.id}
              href={`/learn/${courseId}/${l.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                l.id === Number(lessonId)
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={`w-6 h-6 grid place-items-center rounded-md text-xs shrink-0 ${
                l.id === Number(lessonId) ? 'bg-white/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {i + 1}
              </span>
              <span className="line-clamp-2">{l.title}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Asosiy kontent */}
      <article>
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-slate-900">
            {lesson.title}
          </h1>

          {embedUrl ? (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-900 shadow-lg">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={lesson.title}
              />
            </div>
          ) : lesson.video_url ? (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Video URL noto'g'ri formatda</p>
            </div>
          ) : null}

          {lesson.content && (
            <div className="prose max-w-none text-slate-700 leading-relaxed text-base whitespace-pre-line">
              {lesson.content}
            </div>
          )}
        </div>

        {/* Navigatsiya */}
        <div className="flex justify-between items-center gap-4">
          {prev ? (
            <Link href={`/learn/${courseId}/${prev.id}`} className="btn-ghost text-sm">
              <ChevronLeft size={16} /> Oldingi dars
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/learn/${courseId}/${next.id}`} className="btn-primary text-sm">
              Keyingi dars <ChevronRight size={16} />
            </Link>
          ) : (
            <Link href={`/courses/${courseId}`} className="btn-primary text-sm">
              Kursni tugatish 🎉
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}