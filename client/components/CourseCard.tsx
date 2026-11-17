'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, BookOpen, ArrowRight, GraduationCap } from 'lucide-react';
import type { Course } from '@/lib/api';

const GRADIENTS = [
  'from-brand-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-pink-600',
  'from-sky-500 to-cyan-600',
  'from-rose-500 to-red-600',
];

function CoursePlaceholder({ title, id }: { title: string; id: number }) {
  const grad = GRADIENTS[id % GRADIENTS.length];
  const initials = title.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center gap-3`}>
      <GraduationCap size={36} className="text-white/70" />
      <span className="text-white font-extrabold text-2xl tracking-wide">{initials}</span>
    </div>
  );
}

export default function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const free = Number(course.price) === 0;
  const lessonCount = course.lesson_count ?? course.lessons?.length ?? 0;
  const hours = Number(course.duration_hours);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative flex flex-col rounded-3xl bg-white border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <CoursePlaceholder title={course.title} id={course.id} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {free
            ? <span className="text-emerald-600">Bepul</span>
            : <span className="text-slate-800">{Number(course.price).toLocaleString()} so'm</span>
          }
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border border-white/20">
          {course.level}
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
          {course.description || ''}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
          {hours > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-brand-500" /> {hours} soat
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} className="text-brand-500" />
            {lessonCount > 0 ? `${lessonCount} dars` : "Darslar yo'q"}
          </span>
        </div>
        <Link
          href={`/courses/${course.id}`}
          className="mt-auto flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold group-hover:bg-brand-600 group-hover:text-white transition-all duration-300"
        >
          Batafsil ma'lumot <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}