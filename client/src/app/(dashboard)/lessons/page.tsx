'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Lesson, SchoolClass, Subject, Teacher, Room, AcademicYear } from '@/types';
import Link from 'next/link';
import { Plus, BookOpen, Clock, MapPin, CheckCircle2, UserCheck, Award, Calendar as CalendarIcon } from 'lucide-react';

export default function LessonsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canCreate = roles.some((r) =>
    ['super_admin', 'admin', 'director', 'zavuch', 'teacher'].includes(r)
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    academic_year_id: 0,
    school_class_id: 0,
    subject_id: 0,
    teacher_id: 0,
    room_id: 0,
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '09:45',
    topic: '',
    notes: '',
    status: 10,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [lesRes, classRes, subRes, teachRes, roomRes, yearRes] = await Promise.all([
        api.getAll<Lesson>('lesson', filterDate ? { date: filterDate } : undefined),
        api.getAll<SchoolClass>('school-class'),
        api.getAll<Subject>('subject'),
        api.getAll<Teacher>('teacher'),
        api.getAll<Room>('room'),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      setLessons(lesRes.items || []);
      setClasses(classRes.items || []);
      setSubjects(subRes.items || []);
      setTeachers(teachRes.items || []);
      setRooms(roomRes.items || []);
      setAcademicYears(yearRes.items || []);

      if (yearRes.items?.length && !formData.academic_year_id) {
        const cur = yearRes.items.find((y) => y.is_current) || yearRes.items[0];
        setFormData((prev) => ({ ...prev, academic_year_id: cur.id }));
      }
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('lesson', {
        ...formData,
        academic_year_id: formData.academic_year_id || academicYears[0]?.id,
      });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const statusLabels: Record<number, { label: string; color: string }> = {
    10: { label: 'Rejalashtirilgan', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    20: { label: 'Dars o\'tilmoqda', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    30: { label: 'Yakunlangan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    40: { label: 'Qoldirilgan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Darslar (Real instansiyalar)</h1>
          <p className="text-slate-500 text-sm">Har bir sanadagi haqiqiy dars mashg'ulotlari, davomat va mavzular</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start"
          >
            <Plus size={18} />
            Dars o'tishni rejalashtirish
          </button>
        )}
      </div>

      {/* Filter by date */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className="text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">Sanani tanlang:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Bugungi kunga o'tish
        </button>
      </div>

      {/* Lessons List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          {filterDate} sanasida hozircha darslar mavjud emas. Yuqoridagi tugma orqali dars qo'shishingiz mumkin.
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const subject = subjects.find((s) => s.id === lesson.subject_id);
            const teacher = teachers.find((t) => t.id === lesson.teacher_id);
            const schoolClass = classes.find((c) => c.id === lesson.school_class_id);
            const room = rooms.find((r) => r.id === lesson.room_id);

            return (
              <div
                key={lesson.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen size={18} className="text-indigo-600" />
                      {subject?.name || 'Fan'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {schoolClass?.name || 'Sinf'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusLabels[lesson.status]?.color || 'bg-gray-100'}`}>
                      {statusLabels[lesson.status]?.label || 'Reja'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    Mavzu: <span className="text-slate-900 font-normal">{lesson.topic || 'Mavzu kiritilmagan'}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={14} /> {lesson.start_time?.substring(0, 5)} - {lesson.end_time?.substring(0, 5)}
                    </span>
                    <span>
                      O'qituvchi: <strong className="text-slate-700">{teacher?.user?.first_name ? `${teacher.user.first_name} ${teacher.user.last_name}` : `O'qituvchi #${teacher?.id}`}</strong>
                    </span>
                    {room && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {room.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  <Link
                    href={`/attendance?lesson_id=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                  >
                    <UserCheck size={16} />
                    Davomat
                  </Link>

                  <Link
                    href={`/grades?lesson_id=${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
                  >
                    <Award size={16} />
                    Baholash
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && canCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Yangi dars kiritish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sana</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sinf</label>
                <select
                  required
                  value={formData.school_class_id}
                  onChange={(e) => setFormData({ ...formData, school_class_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Sinfni tanlang</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade_level}-sinf)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fan</label>
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Fanni tanlang</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">O'qituvchi</label>
                <select
                  required
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">O'qituvchini tanlang</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user?.first_name ? `${t.user.first_name} ${t.user.last_name}` : `O'qituvchi #${t.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Boshlanish</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tugash</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dars mavzusi</label>
                <input
                  type="text"
                  placeholder="Masalan: Kvadrat tenglamalar"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
