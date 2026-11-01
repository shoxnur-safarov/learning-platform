'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, BookOpen, ArrowRight, Star } from 'lucide-react';
import type { Course } from '@/lib/api';

export default function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const free = Number(course.price) === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative flex flex-col rounded-3xl bg-white border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={course.image_url || `https://picsum.photos/seed/${course.id}/600/400`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Narx belgisi */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {free ? (
            <span className="text-emerald-600">Bepul</span>
          ) : (
            <span className="text-slate-800">{Number(course.price).toLocaleString()} so'm</span>
          )}
        </div>

        {/* Level belgisi */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border border-white/20">
          {course.level}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-amber-400 mb-3">
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <Star size={14} fill="currentColor" />
          <span className="text-slate-400 text-xs ml-1 font-medium">(4.9)</span>
        </div>

        <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
          {course.description || "Bu kurs haqida ma'lumot tez orada qo'shiladi."}
        </p>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
          <span className="flex items-center gap-1.5"><Clock size={16} className="text-brand-500"/> {course.duration_hours} soat</span>
          <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-brand-500"/> {course.lessons?.length || 0} dars</span>
        </div>

        <Link href={`/courses/${course.id}`} className="mt-auto flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
          Batafsil ma'lumot <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}