'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BookOpen, Users, ChevronDown, ChevronUp, Edit2, Eye, EyeOff, Video } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

type Lesson = { id: number; title: string; content: string; video_url: string; order_index: number; is_preview: boolean };
type CourseWithLessons = Course & { lessons: Lesson[] };

const emptyForm = { title: '', description: '', price: '0', image_url: '', level: "Boshlang'ich", duration_hours: '0' };
const emptyLesson = { title: '', content: '', video_url: '', order_index: '0', is_preview: false };

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'courses' | 'users'>('courses');

  // Kurs form
  const [courseForm, setCourseForm] = useState(emptyForm);
  const [editingCourse, setEditingCourse] = useState<number | null>(null);

  // Dars form
  const [openCourseId, setOpenCourseId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  const reload = async () => {
    const [cs, us] = await Promise.all([
      api<CourseWithLessons[]>('/courses'),
      api<any[]>('/admin/users').catch(() => [])
    ]);
    setCourses(cs);
    setUsers(us);
  };

  useEffect(() => { if (user?.role === 'admin') reload(); }, [user]);

  const flash = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  // --- Kurs CRUD ---
  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({ ...courseForm, price: Number(courseForm.price), duration_hours: Number(courseForm.duration_hours) });
    if (editingCourse) {
      await api(`/admin/courses/${editingCourse}`, { method: 'PUT', body });
      setEditingCourse(null);
    } else {
      await api('/admin/courses', { method: 'POST', body });
    }
    setCourseForm(emptyForm);
    reload();
    flash(editingCourse ? '✅ Kurs yangilandi' : '✅ Kurs qo\'shildi');
  };

  const startEdit = (c: CourseWithLessons) => {
    setEditingCourse(c.id);
    setCourseForm({ title: c.title, description: c.description, price: String(c.price), image_url: c.image_url || '', level: c.level, duration_hours: String(c.duration_hours) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const delCourse = async (id: number) => {
    if (!confirm("Kursni o'chirishni tasdiqlaysizmi? Barcha darslar ham o'chadi!")) return;
    await api(`/admin/courses/${id}`, { method: 'DELETE' });
    reload();
    flash("🗑️ Kurs o'chirildi");
  };

  // --- Dars CRUD ---
  const addLesson = async (e: React.FormEvent, courseId: number) => {
    e.preventDefault();
    await api(`/admin/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify({ ...lessonForm, order_index: Number(lessonForm.order_index) })
    });
    setLessonForm(emptyLesson);
    reload();
    flash('✅ Dars qo\'shildi');
  };

  const delLesson = async (lessonId: number) => {
    if (!confirm("Darsni o'chirishni tasdiqlaysizmi?")) return;
    await api(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
    reload();
    flash("🗑️ Dars o'chirildi");
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Yuklanmoqda...</div>;
  if (user?.role !== 'admin') return <div className="p-20 text-center text-slate-500 font-bold">Ruxsat yo'q.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Admin Panel</h1>
        {msg && <span className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl text-sm">{msg}</span>}
      </div>

      {/* Tablar */}
      <div className="flex gap-3 mb-8">
        {(['courses', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn px-6 py-3 ${tab === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {t === 'courses' ? <><BookOpen size={18} /> Kurslar ({courses.length})</> : <><Users size={18} /> Foydalanuvchilar ({users.length})</>}
          </button>
        ))}
      </div>

      {/* ===== KURSLAR ===== */}
      {tab === 'courses' && (
        <>
          {/* Kurs form */}
          <form onSubmit={saveCourse} className="card p-6 space-y-4 mb-8 bg-slate-50/50">
            <h2 className="font-bold text-lg">{editingCourse ? '✏️ Kursni tahrirlash' : '➕ Yangi kurs qo\'shish'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Kurs nomi *" value={courseForm.title}
                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input placeholder="Rasm URL (ixtiyoriy)" value={courseForm.image_url}
                onChange={e => setCourseForm({ ...courseForm, image_url: e.target.value })}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <input placeholder="Narx (0 = bepul)" type="number" min="0" value={courseForm.price}
                onChange={e => setCourseForm({ ...courseForm, price: e.target.value })}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <select value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400">
                <option>Boshlang'ich</option>
                <option>O'rta</option>
                <option>Yuqori</option>
              </select>
              <input placeholder="Davomiylik (soat)" type="number" min="0" value={courseForm.duration_hours}
                onChange={e => setCourseForm({ ...courseForm, duration_hours: e.target.value })}
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <textarea required placeholder="Tavsif *" value={courseForm.description}
              onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
              rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                <Plus size={18} /> {editingCourse ? 'Saqlash' : 'Kurs qo\'shish'}
              </button>
              {editingCourse && (
                <button type="button" onClick={() => { setEditingCourse(null); setCourseForm(emptyForm); }}
                  className="btn-ghost">Bekor qilish</button>
              )}
            </div>
          </form>

          {/* Kurslar ro'yxati */}
          <div className="space-y-4">
            {courses.length === 0 && (
              <div className="text-center py-16 text-slate-400">Hali kurs qo'shilmagan</div>
            )}
            {courses.map(c => (
              <div key={c.id} className="card">
                {/* Kurs header */}
                <div className="p-4 flex items-center gap-4">
                  <img src={c.image_url || `https://picsum.photos/seed/${c.id}/80/80`}
                    className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{c.title}</p>
                    <p className="text-sm text-slate-500">{Number(c.price) === 0 ? 'Bepul' : `${Number(c.price).toLocaleString()} so'm`} · {c.level} · {c.duration_hours}h · {c.lessons?.length || 0} dars</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(c)} className="btn-ghost px-3 py-2 text-sm">
                      <Edit2 size={15} /> Tahrirlash
                    </button>
                    <button onClick={() => setOpenCourseId(openCourseId === c.id ? null : c.id)}
                      className="btn-ghost px-3 py-2 text-sm">
                      {openCourseId === c.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      Darslar
                    </button>
                    <button onClick={() => delCourse(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Darslar paneli */}
                {openCourseId === c.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    {/* Darslar ro'yxati */}
                    {c.lessons?.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mavjud darslar</p>
                        {c.lessons.map((l, i) => (
                          <div key={l.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                            <span className="w-7 h-7 grid place-items-center rounded-lg bg-slate-100 text-slate-500 text-xs font-bold shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{l.title}</p>
                              {(l as any).video_url && <p className="text-xs text-brand-500 flex items-center gap-1 mt-0.5"><Video size={11} /> YouTube video bor</p>}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${l.is_preview ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {l.is_preview ? <><Eye size={11} className="inline" /> Bepul</> : <><EyeOff size={11} className="inline" /> Yopiq</>}
                            </span>
                            <button onClick={() => delLesson(l.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Yangi dars qo'shish */}
                    <form onSubmit={e => addLesson(e, c.id)} className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yangi dars qo'shish</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <input required placeholder="Dars nomi *" value={lessonForm.title}
                          onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                        <input placeholder="YouTube URL (youtu.be/... yoki watch?v=...)" value={lessonForm.video_url}
                          onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                        <input placeholder="Tartib raqami" type="number" min="0" value={lessonForm.order_index}
                          onChange={e => setLessonForm({ ...lessonForm, order_index: e.target.value })}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer">
                          <input type="checkbox" checked={lessonForm.is_preview}
                            onChange={e => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                            className="w-4 h-4 accent-brand-600" />
                          <span className="text-sm font-medium text-slate-700">Bepul ko'rish (preview)</span>
                        </label>
                      </div>
                      <textarea placeholder="Dars matni (ixtiyoriy)" value={lessonForm.content}
                        onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                        rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                      <button type="submit" className="btn-primary text-sm px-4 py-2.5">
                        <Plus size={16} /> Dars qo'shish
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== FOYDALANUVCHILAR ===== */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Ism</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Sana</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-400">{u.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}