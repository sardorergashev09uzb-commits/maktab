'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Exam, SchoolClass, Subject, Teacher, AcademicYear } from '@/types';
import Link from 'next/link';
import { Plus, Clock, BookOpen, CheckCircle, Award, PlayCircle, Users } from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    school_class_id: 0,
    subject_id: 0,
    teacher_id: 0,
    academic_year_id: 0,
    duration_minutes: 45,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    passing_score: 60,
    max_score: 100,
    status: 20, // published
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [exRes, classRes, subRes, teachRes, yearRes] = await Promise.all([
        api.getAll<Exam>('exam'),
        api.getAll<SchoolClass>('school-class'),
        api.getAll<Subject>('subject'),
        api.getAll<Teacher>('teacher'),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      setExams(exRes.items || []);
      setClasses(classRes.items || []);
      setSubjects(subRes.items || []);
      setTeachers(teachRes.items || []);
      setAcademicYears(yearRes.items || []);

      if (classRes.items?.length && !formData.school_class_id) {
        setFormData((prev) => ({
          ...prev,
          school_class_id: classRes.items[0].id,
          subject_id: subRes.items[0]?.id || 0,
          teacher_id: teachRes.items[0]?.id || 0,
          academic_year_id: yearRes.items[0]?.id || 0,
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
      await api.create('exam', {
        ...formData,
        start_time: formData.start_time.replace('T', ' ') + ':00',
        end_time: formData.end_time.replace('T', ' ') + ':00',
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
          <h1 className="text-2xl font-bold text-slate-900">Imtihonlar va Testlar</h1>
          <p className="text-slate-500 text-sm">Oraliq va yakuniy imtihonlar, avtomatik tekshiruv va reyting</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start shadow-sm"
        >
          <Plus size={18} />
          Imtihon yaratish
        </button>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Hozircha e'lon qilingan imtihonlar mavjud emas. Yuqoridagi tugma orqali imtihon yarating.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                    {exam.schoolClass?.name || 'Sinf'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    O'tish: {exam.passing_score} ball
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5 flex items-center gap-1.5">
                    <BookOpen size={14} />
                    {exam.subject?.name || 'Fan'}
                  </p>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <p className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    Davomiyligi: <strong>{exam.duration_minutes} daqiqa</strong>
                  </p>
                  <p>
                    Muddat: {exam.start_time?.slice(0, 10)} dan {exam.end_time?.slice(0, 10)} gacha
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/exam-taker?exam_id=${exam.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs transition shadow-sm"
                >
                  <PlayCircle size={16} />
                  Testni boshlash (Talaba ko'rinishi)
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Yangi imtihon tashkil etish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Imtihon nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 1-Chorak Matematika Oraliq Nazorati"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Daqiqa</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="180"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'tish bali</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Max ball</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Boshlanish vaqti</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tugash vaqti</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
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
