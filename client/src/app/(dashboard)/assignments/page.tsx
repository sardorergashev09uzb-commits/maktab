'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Assignment, SchoolClass, Subject, Teacher } from '@/types';
import Link from 'next/link';
import { Plus, BookOpen, Calendar, Clock, CheckCircle, FileText, ArrowRight, User } from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    school_class_id: 0,
    subject_id: 0,
    teacher_id: 0,
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    max_score: 100,
    attachment_url: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [assRes, classRes, subRes, teachRes] = await Promise.all([
        api.getAll<Assignment>('assignment'),
        api.getAll<SchoolClass>('school-class'),
        api.getAll<Subject>('subject'),
        api.getAll<Teacher>('teacher'),
      ]);

      setAssignments(assRes.items || []);
      setClasses(classRes.items || []);
      setSubjects(subRes.items || []);
      setTeachers(teachRes.items || []);

      if (classRes.items?.length && !formData.school_class_id) {
        setFormData((prev) => ({
          ...prev,
          school_class_id: classRes.items[0].id,
          subject_id: subRes.items[0]?.id || 0,
          teacher_id: teachRes.items[0]?.id || 0,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('assignment', {
        ...formData,
        due_date: formData.due_date.replace('T', ' ') + ':00',
      });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Uy Vazifalari (LMS)</h1>
          <p className="text-slate-500 text-sm">O'quvchilarga berilgan topshiriqlar, muddatlar va tekshirish jurnali</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start shadow-sm"
        >
          <Plus size={18} />
          Vazifa berish
        </button>
      </div>

      {/* Grid of assignments */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Hozircha faol uy vazifalari mavjud emas. Yuqoridagi tugma orqali vazifa bering.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((item) => {
            const subCount = item.submissions?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      {item.schoolClass?.name || 'Sinf'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Max: {item.max_score} ball</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5 flex items-center gap-1.5">
                      <BookOpen size={14} />
                      {item.subject?.name || 'Fan'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-amber-500" /> Muddat: {item.due_date?.slice(0, 10)}
                    </span>
                    <span className="font-semibold text-slate-700">{subCount} ta topshirilgan</span>
                  </div>

                  <Link
                    href={`/submissions?assignment_id=${item.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-indigo-600 hover:bg-indigo-50 font-bold text-xs transition border border-slate-200"
                  >
                    Topshiriqlarni tekshirish <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Yangi uy vazifasi berish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vazifa mavzusi / Sarlavha</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Paragraf 12, 1-5 mashqlar"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sinf</label>
                  <select
                    required
                    value={formData.school_class_id}
                    onChange={(e) => setFormData({ ...formData, school_class_id: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fan</label>
                  <select
                    required
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'qituvchi</label>
                <select
                  required
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.first_name} {t.user?.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Topshirish muddati</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Maksimal ball</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Batafsil tavsif</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Vazifa talablari, shartlari va ko'rsatmalar..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  E'lon qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
