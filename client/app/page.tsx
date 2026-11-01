'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Rocket, Users, Award, ArrowRight } from 'lucide-react';
import { api, Course } from '@/lib/api';
import CourseCard from '@/components/CourseCard';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => { 
    api<Course[]>('/courses').then(setCourses).catch(() => {}); 
  }, []);

  return (
    <div className="overflow-hidden pb-20">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative text-center max-w-3xl mx-auto z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-bold shadow-sm shadow-brand-100">
            <Sparkles size={16} /> Yangi avlod ta'lim platformasi
          </span>
          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Kelajagingizni <br className="hidden md:block"/> bugun <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">boshlang</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Eng yaxshi mutaxassislardan onlayn kurslar. O'zingizga mos yo'nalishni tanlang va o'rganishni hoziroq boshlang.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/courses" className="btn-primary px-8 py-4 text-lg shadow-xl shadow-brand-500/20">
              Kurslarni ko'rish <ArrowRight size={20}/>
            </Link>
            <Link href="/register" className="btn-ghost px-8 py-4 text-lg bg-white">
              Bepul boshlash
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="relative mt-20 grid grid-cols-3 max-w-3xl mx-auto gap-6 z-10">
          {[
            { icon: Users, n: '10K+', t: "O'quvchilar" },
            { icon: Rocket, n: '150+', t: 'Kurslar' },
            { icon: Award, n: '98%', t: 'Natija' }
          ].map(({ icon: Icon, n, t }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="glass p-6 rounded-2xl text-center">
              <Icon className="mx-auto text-brand-600 mb-2" size={28} />
              <p className="text-3xl font-extrabold text-slate-800">{n}</p>
              <p className="text-sm font-medium text-slate-500">{t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Mashhur kurslar</h2>
            <p className="text-slate-500 mt-2">Eng ko'p tanlangan va yuqori reytingga ega yo'nalishlar</p>
          </div>
          <Link href="/courses" className="hidden md:flex items-center gap-2 text-brand-600 font-bold hover:gap-3 transition-all">
            Barchasini ko'rish <ArrowRight size={18}/>
          </Link>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-700">Hozircha kurslar yo'q</h3>
            <p className="text-slate-500 mt-2">Tez orada admin panel orqali yangi kurslar qo'shiladi.</p>
          </div>
        )}
      </section>
    </div>
  );
}