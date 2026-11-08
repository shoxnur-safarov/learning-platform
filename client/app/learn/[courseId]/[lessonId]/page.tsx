'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, PlayCircle, BookOpen, Zap, CheckCircle2, Clock } from 'lucide-react';
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

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  video:     { icon: <PlayCircle size={16} />,  label: 'Video',     color: 'text-brand-600 bg-brand-50 border-brand-200' },
  guide:     { icon: <BookOpen size={16} />,    label: "Qo'llanma", color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  challenge: { icon: <Zap size={16} />,         label: 'Mashq',     color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

export default function LearnPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api<Course>(`/courses/${courseId}`).then(setCourse).catch(() => {});
    api<number[]>(`/lessons/${courseId}/completions/my`).then(setCompletedIds).catch(() => {});
  }, [courseId]);

  useEffect(() => {
    setLesson(null);
    setError('');
    api(`/lessons/${courseId}/${lessonId}`)
      .then(setLesson)
      .catch((e) => setError(e.message));
  }, [courseId, lessonId]);

  const handleComplete = async () => {
    if (completing || lesson?.completed) return;
    setCompleting(true);
    try {
      await api(`/lessons/${courseId}/${lessonId}/complete`, { method: 'POST', body: JSON.stringify({}) });
      setLesson((l: any) => ({ ...l, completed: true }));
      setCompletedIds(prev => [...prev, Number(lessonId)]);
    } finally {
      setCompleting(false);
    }
  };

  const handleNext = async (nextId: number) => {
    if (!lesson?.completed) {
      await handleComplete();
    }
    router.push(`/learn/${courseId}/${nextId}`);
  };

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
  const type = lesson.lesson_type || 'video';
  const meta = TYPE_META[type] || TYPE_META.video;
  const isCompleted = lesson.completed || completedIds.includes(Number(lessonId));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-[300px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="card p-5 h-fit lg:sticky lg:top-24 border-slate-200/60 shadow-sm">
        <h3 className="font-bold text-xs uppercase text-slate-400 mb-4 tracking-widest">
          Kurs darsliklari
        </h3>
        <div className="space-y-1">
          {lessons.map((l, i) => {
            const lType = (l as any).lesson_type || 'video';
            const lMeta = TYPE_META[lType] || TYPE_META.video;
            const lDone = completedIds.includes(l.id);
            const isActive = l.id === Number(lessonId);
            // Lock: first lesson always open, others need prev completed
            const isLocked = i > 0 && !completedIds.includes(lessons[i - 1].id) && !isActive && !lDone;

            return (
              <div key={l.id}>
                {isLocked ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl text-slate-400 cursor-not-allowed opacity-60">
                    <span className="w-6 h-6 grid place-items-center rounded-md bg-slate-100 text-xs shrink-0">
                      <Lock size={10} />
                    </span>
                    <span className="text-sm line-clamp-2">{l.title}</span>
                  </div>
                ) : (
                  <Link
                    href={`/learn/${courseId}/${l.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 grid place-items-center rounded-md text-xs shrink-0 ${
                      lDone ? 'bg-emerald-100 text-emerald-600' :
                      isActive ? 'bg-white/20 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {lDone ? <CheckCircle2 size={12} /> : i + 1}
                    </span>
                    <span className="flex-1 line-clamp-2">{l.title}</span>
                    <span className={`text-xs shrink-0 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                      {lMeta.icon}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Asosiy kontent */}
      <article>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            {/* Type badge */}
            <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-4 ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
              {lesson.title}
            </h1>

            {/* VIDEO */}
            {type === 'video' && (
              <div>
                {embedUrl ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg mb-6">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={lesson.title}
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-3 mb-6">
                    <PlayCircle size={48} className="text-slate-300" />
                    <p className="text-slate-400 text-sm">Video mavjud emas</p>
                  </div>
                )}
                {lesson.content && (
                  <p className="text-slate-600 leading-relaxed mt-4">{lesson.content}</p>
                )}
              </div>
            )}

            {/* QO'LLANMA */}
            {type === 'guide' && (
              <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {lesson.content || <p className="text-slate-400 italic">Qo'llanma matni mavjud emas.</p>}
              </div>
            )}

            {/* MASHQ */}
            {type === 'challenge' && (
              <div>
                <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <Zap size={20} className="text-amber-500 shrink-0" />
                  <p className="text-amber-700 text-sm font-medium">
                    Quyidagi mashqni bajarib, bilimingizni tekshiring!
                  </p>
                </div>
                <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                  {lesson.challenge || <p className="text-slate-400 italic">Mashq matni mavjud emas.</p>}
                </div>
              </div>
            )}
          </div>

          {/* Complete button */}
          <div className="px-8 pb-8">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle2 size={18} /> Dars tugatildi
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary text-sm"
              >
                {completing ? (
                  <><Clock size={16} className="animate-spin" /> Saqlanmoqda...</>
                ) : (
                  <><CheckCircle2 size={16} /> Darsni tugatdim</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigatsiya */}
        <div className="flex justify-between items-center gap-4">
          {prev ? (
            <Link href={`/learn/${courseId}/${prev.id}`} className="btn-ghost text-sm">
              <ChevronLeft size={16} /> Oldingi
            </Link>
          ) : <span />}
          {next ? (
            <button onClick={() => handleNext(next.id)} className="btn-primary text-sm">
              Keyingi dars <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={async () => { await handleComplete(); router.push(`/courses/${courseId}`); }} className="btn-primary text-sm">
              Kursni tugatish 🎉
            </button>
          )}
        </div>
      </article>
    </div>
  );
}