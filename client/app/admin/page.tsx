'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BookOpen, Users } from 'lucide-react';
import { api, Course } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'courses'|'users'>('courses');
  const [form, setForm] = useState({ title: '', description: '', price: '0', image_url: '', level: 'Boshlang\'ich', duration_hours: '0' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  const reload = () => {
    api<Course[]>('/courses').then(setCourses);
    api<any[]>('/admin/users').then(setUsers).catch(()=>{});
  };
  useEffect(() => { if (user?.role === 'admin') reload(); }, [user]);

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/admin/courses', { method: 'POST', body: JSON.stringify({ ...form, price: Number(form.price), duration_hours: Number(form.duration_hours) }) });
    setForm({ title: '', description: '', price: '0', image_url: '', level: 'Boshlang\'ich', duration_hours: '0' });
    reload();
  };

  const delCourse = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api(`/admin/courses/${id}`, { method: 'DELETE' });
    reload();
  };

  const addLesson = async (courseId: number) => {
    const title = prompt('Dars nomi:');
    if (!title) return;
    const content = prompt('Dars matni:') || '';
    await api(`/admin/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify({ title, content, order_index: 0 })
    });
    alert('✅ Dars qo\'shildi');
  };

  if (user?.role !== 'admin') return <div className="p-20 text-center text-slate-500">Ruxsat yo'q. Admin panelga faqat adminlar kira oladi.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-8">Admin Panel</h1>

      <div className="flex gap-3 mb-8">
        <button onClick={()=>setTab('courses')} className={`btn px-6 py-3 ${tab==='courses'?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><BookOpen size={18}/> Kurslar</button>
        <button onClick={()=>setTab('users')} className={`btn px-6 py-3 ${tab==='users'?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><Users size={18}/> Foydalanuvchilar</button>
      </div>

      {tab === 'courses' && (
        <>
          <form onSubmit={createCourse} className="card p-6 space-y-4 mb-8 bg-slate-50/50">
            <h2 className="font-bold text-lg">Yangi kurs qo'shish</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Sarlavha" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="px-4 py-3 rounded-xl border border-slate-200"/>
              <input placeholder="Rasm URL (ixtiyoriy)" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} className="px-4 py-3 rounded-xl border border-slate-200"/>
              <input placeholder="Narx (0 = bepul)" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="px-4 py-3 rounded-xl border border-slate-200"/>
              <select value={form.level} onChange={e=>setForm({...form,level:e.target.value})} className="px-4 py-3 rounded-xl border border-slate-200">
                <option value="Boshlang'ich">Boshlang'ich</option>
                <option value="O'rta">O'rta</option>
                <option value="Yuqori">Yuqori</option>
              </select>
              <input placeholder="Davomiylik (soat)" type="number" value={form.duration_hours} onChange={e=>setForm({...form,duration_hours:e.target.value})} className="px-4 py-3 rounded-xl border border-slate-200"/>
            </div>
            <textarea required placeholder="Tavsif" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200"/>
            <button className="btn-primary"><Plus size={18}/> Kursni saqlash</button>
          </form>

          <div className="space-y-4">
            {courses.map(c => (
              <div key={c.id} className="card p-4 flex items-center gap-6">
                <img src={c.image_url || `https://picsum.photos/seed/${c.id}/80/80`} className="w-20 h-20 rounded-xl object-cover" alt=""/>
                <div className="flex-1">
                  <p className="font-bold text-lg">{c.title}</p>
                  <p className="text-sm font-medium text-slate-500">{Number(c.price) === 0 ? 'Bepul' : `${Number(c.price).toLocaleString()} so'm`} · {c.level}</p>
                </div>
                <button onClick={()=>addLesson(c.id)} className="btn-ghost text-sm px-4 py-2"><Plus size={16}/> Dars qo'shish</button>
                <button onClick={()=>delCourse(c.id)} className="text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors"><Trash2 size={20}/></button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr><th className="p-4">ID</th><th className="p-4">Ism</th><th className="p-4">Email</th><th className="p-4">Rol</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4">{u.id}</td><td className="p-4 font-semibold text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-slate-100 text-slate-600'}`}>{u.role}</span>
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