'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, Course } from '@/lib/api';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState('');
  
  useEffect(() => { api<Course[]>('/courses').then(setCourses); }, []);
  
  const filtered = courses.filter(c => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-2 text-slate-900">Barcha kurslar</h1>
      <p className="text-slate-500 mb-8">O'zingizga mos yo'nalishni toping</p>

      <div className="relative max-w-md mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Kursni qidirish..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
        {filtered.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">Hech narsa topilmadi 😔</p>}
      </div>
    </div>
  );
}