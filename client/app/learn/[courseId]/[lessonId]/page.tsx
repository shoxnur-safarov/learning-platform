'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Lock, PlayCircle, BookOpen, Zap, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';
import { api, Course } from '@/lib/api';

// Markdown-like renderer: kod bloklari, inline kod, bold, linklar
function RichText({ text }: { text: string }) {
  if (!text) return null;

  // ``` kod bloklari
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm sm:text-base leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).split('\n');
          const lang = lines[0].trim();
          const code = (lang && !lang.includes(' ') ? lines.slice(1) : lines).join('\n').trim();
          return (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              {lang && !lang.includes(' ') && (
                <div className="bg-slate-800 px-4 py-1.5 text-xs text-slate-400 font-mono font-semibold">
                  {lang}
                </div>
              )}
              <pre className="bg-slate-900 text-green-300 p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Inline `kod` va **bold** va oddiy matn
        const inlineParts = part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {inlineParts.map((ip, j) => {
              if (ip.startsWith('`') && ip.endsWith('`')) {
                return <code key={j} className="bg-slate-100 text-red-500 px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono">{ip.slice(1, -1)}</code>;
              }
              if (ip.startsWith('**') && ip.endsWith('**')) {
                return <strong key={j} className="font-bold text-slate-900">{ip.slice(2, -2)}</strong>;
              }
              return <span key={j} className="text-slate-700 whitespace-pre-wrap">{ip}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

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
  const [showSolution, setShowSolution] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);

  useEffect(() => {
    if (!courseId || courseId === 'undefined') return;
    api<Course>(`/courses/${courseId}`).then(setCourse).catch(() => {});
    api<number[]>(`/lessons/${courseId}/completions/my`).then(setCompletedIds).catch(() => {});
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !lessonId || courseId === 'undefined' || lessonId === 'undefined') return;
    setLesson(null);
    setError('');
    setShowSolution(false);
    setChallengeDone(false);
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
    <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-6 lg:py-8 grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
      {/* Sidebar — mobile'da pastda, desktop'da chapda */}
      <aside className="card p-4 sm:p-5 h-fit lg:sticky lg:top-24 border-slate-200/60 shadow-sm order-2 lg:order-1 mx-3 sm:mx-0 mb-4 sm:mb-0">
        <h3 className="font-bold text-xs uppercase text-slate-400 mb-3 tracking-widest">
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
      <article className="order-1 lg:order-2">
        <div className="bg-white sm:rounded-3xl shadow-sm border-y sm:border border-slate-100 mb-4 sm:mb-6 overflow-hidden">
          <div className="px-4 sm:px-8 pt-5 sm:pt-8 pb-5 sm:pb-6">
            {/* Type badge */}
            <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-3 sm:mb-4 ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
              {lesson.title}
            </h1>

            {/* VIDEO */}
            {type === 'video' && (
              <div>
                {embedUrl ? (
                  <div className="-mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden bg-slate-900 shadow-lg mb-4 sm:mb-6">
                    <div className="aspect-video">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={lesson.title}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl sm:rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-3 mb-4 sm:mb-6">
                    <PlayCircle size={40} className="text-slate-300" />
                    <p className="text-slate-400 text-sm">Video mavjud emas</p>
                  </div>
                )}
                {lesson.content && (
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{lesson.content}</p>
                )}
              </div>
            )}

            {/* QO'LLANMA */}
            {type === 'guide' && (
              <div>
                {lesson.content
                  ? <RichText text={lesson.content} />
                  : <p className="text-slate-400 italic text-sm">Qo'llanma matni mavjud emas.</p>}
              </div>
            )}

            {/* MASHQ */}
            {type === 'challenge' && (
              <div>
                <div className="flex items-start gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100">
                  <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-sm font-medium">
                    Quyidagi mashqni bajarib, bilimingizni tekshiring!
                  </p>
                </div>
                {lesson.challenge
                  ? <RichText text={lesson.challenge} />
                  : <p className="text-slate-400 italic text-sm">Mashq matni mavjud emas.</p>}
              </div>
            )}
          </div>

          {/* Complete button */}
          <div className="px-4 sm:px-8 pb-5 sm:pb-8">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle2 size={18} /> Dars tugatildi ✓
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary text-sm w-full sm:w-auto justify-center py-3"
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

        {/* ===== MASHQ BO'LIMI — dars tugatilgandan keyin ko'rinadi ===== */}
        {isCompleted && lesson.challenge && (
          <div className="bg-white sm:rounded-3xl shadow-sm border-y sm:border border-amber-200/60 mb-4 sm:mb-6 overflow-hidden">
            <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 grid place-items-center shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-slate-900">Dars mashqi</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Quyidagi topshiriqni bajaring, so'ng javobni tekshiring</p>
                </div>
              </div>

              {/* Vazifa */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">📋 Vazifa</p>
                <RichText text={lesson.challenge} />
              </div>

              {/* Javobni ko'rish toggle */}
              {lesson.solution && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowSolution(v => !v)}
                    className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                      showSolution
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    {showSolution ? <><EyeOff size={15} /> Javobni yashirish</> : <><Eye size={15} /> Javobni ko'rish</>}
                  </button>

                  {showSolution && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">✅ To'g'ri javob</p>
                      <RichText text={lesson.solution} />
                    </div>
                  )}
                </div>
              )}

              {/* Tekshirdim tugmasi */}
              {challengeDone ? (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 size={18} /> Mashq tekshirildi — davom etishingiz mumkin!
                </div>
              ) : (
                <button
                  onClick={() => setChallengeDone(true)}
                  className="btn-primary text-sm w-full sm:w-auto justify-center py-3 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                >
                  <CheckCircle2 size={16} /> Tekshirdim, davom etaman
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigatsiya */}
        <div className="flex justify-between items-center gap-3 px-4 sm:px-0 pb-4 sm:pb-0">
          {prev ? (
            <Link href={`/learn/${courseId}/${prev.id}`} className="btn-ghost text-sm flex-1 sm:flex-none justify-center sm:justify-start">
              <ChevronLeft size={16} /> Oldingi
            </Link>
          ) : <span />}
          {next ? (
            <div className="flex flex-col items-end gap-1 flex-1 sm:flex-none">
              {isCompleted && lesson.challenge && !challengeDone && (
                <p className="text-xs text-amber-600 font-medium">⚡ Avval mashqni bajaring</p>
              )}
              <button
                onClick={() => {
                  if (isCompleted && lesson.challenge && !challengeDone) return;
                  handleNext(next.id);
                }}
                className={`btn-primary text-sm w-full sm:w-auto justify-center transition-opacity ${
                  isCompleted && lesson.challenge && !challengeDone ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                Keyingi <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                if (isCompleted && lesson.challenge && !challengeDone) return;
                await handleComplete();
                router.push(`/courses/${courseId}`);
              }}
              className={`btn-primary text-sm flex-1 sm:flex-none justify-center ${
                isCompleted && lesson.challenge && !challengeDone ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Tugatish 🎉
            </button>
          )}
        </div>
      </article>
    </div>
  );
}