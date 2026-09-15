'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Schedule, SchoolClass, Subject, Teacher, Room, AcademicYear } from '@/types';
import { Plus, Clock, MapPin, User as UserIcon, BookOpen } from 'lucide-react';

const DAYS = [
  { id: 1, name: 'Dushanba' },
  { id: 2, name: 'Seshanba' },
  { id: 3, name: 'Chorshanba' },
  { id: 4, name: 'Payshanba' },
  { id: 5, name: 'Juma' },
  { id: 6, name: 'Shanba' },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    academic_year_id: 0,
    school_class_id: 0,
    subject_id: 0,
    teacher_id: 0,
    room_id: 0,
    day_of_week: 1,
    start_time: '08:30',
    end_time: '09:15',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedRes, classRes, subRes, teachRes, roomRes, yearRes] = await Promise.all([
        api.getAll<Schedule>('schedule'),
        api.getAll<SchoolClass>('school-class'),
        api.getAll<Subject>('subject'),
        api.getAll<Teacher>('teacher'),
        api.getAll<Room>('room'),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      setSchedules(schedRes.items || []);
      setClasses(classRes.items || []);
      setSubjects(subRes.items || []);
      setTeachers(teachRes.items || []);
      setRooms(roomRes.items || []);
      setAcademicYears(yearRes.items || []);

      if (classRes.items?.length && !selectedClassId) {
        setSelectedClassId(classRes.items[0].id);
      }
      if (yearRes.items?.length && !formData.academic_year_id) {
        const cur = yearRes.items.find((y) => y.is_current) || yearRes.items[0];
        setFormData((prev) => ({ ...prev, academic_year_id: cur.id }));
      }
    } catch (err) {
      console.error('Failed to load schedule data', err);
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
      await api.create('schedule', {
        ...formData,
        academic_year_id: formData.academic_year_id || academicYears[0]?.id,
        school_class_id: selectedClassId || formData.school_class_id,
        day_of_week: selectedDay,
      });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    const classMatch = selectedClassId ? Number(s.school_class_id) === Number(selectedClassId) : true;
    const dayMatch = Number(s.day_of_week) === Number(selectedDay);
    return classMatch && dayMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dars Jadvali</h1>
          <p className="text-slate-500 text-sm">Haftalik dars taqsimoti, o'qituvchilar va xonalar biriktirmasi</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start"
        >
          <Plus size={18} />
          Dars qo'shish
        </button>
      </div>

      {/* Class filter and Days bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Sinfni tanlang:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.grade_level}-sinf)
              </option>
            ))}
          </select>
        </div>

        {/* Days tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {DAYS.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                selectedDay === day.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable view */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          {DAYS.find((d) => d.id === selectedDay)?.name} kuni uchun hali dars rejalashtirilmagan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((item, index) => {
            const subject = subjects.find((s) => s.id === item.subject_id);
            const teacher = teachers.find((t) => t.id === item.teacher_id);
            const room = rooms.find((r) => r.id === item.room_id);

            return (
              <div
                key={item.id || index}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {index + 1}-soat
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock size={14} />
                    {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600" />
                    {subject?.name || 'Fan'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{subject?.code || ''}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserIcon size={14} className="text-slate-400" />
                    {teacher?.user?.first_name ? `${teacher.user.first_name} ${teacher.user.last_name}` : teacher?.specialization || 'O\'qituvchi'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    {room?.name || 'Xona belgilanmagan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Jadvalga dars qo'shish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hafta kuni</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
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
                      {s.name} ({s.code})
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
                      {t.user?.first_name ? `${t.user.first_name} ${t.user.last_name}` : `O'qituvchi #${t.id}`} ({t.specialization || 'Umumiy'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Xona (auditoriya)</label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Xona tanlang (ixtiyoriy)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.building || 'Bosh bino'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Boshlanish vaqti</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tugash vaqti</label>
                  <input
                    type="time"
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
