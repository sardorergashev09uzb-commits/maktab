'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Lesson, Student, Attendance, Enrollment } from '@/types';
import { CheckCircle2, Clock, XCircle, AlertCircle, Save, Check, CalendarCheck } from 'lucide-react';

function StudentAttendanceView() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Qatnashdi', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' },
    2: { label: 'Kechikdi', color: 'text-amber-700 bg-amber-50 border border-amber-200' },
    3: { label: 'Qatnashmadi', color: 'text-rose-700 bg-rose-50 border border-rose-200' },
    4: { label: 'Sababli', color: 'text-blue-700 bg-blue-50 border border-blue-200' },
  };

  useEffect(() => {
    api.getAll<any>('attendance', { expand: 'lesson.subject', 'per-page': '200' })
      .then((res) => setRecords(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const present = records.filter((r) => r.status === 1).length;
  const total = records.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mening Davomatim</h1>
        <p className="text-slate-500 text-sm">Darslarga qatnashish ko'rsatkichingiz va davomat statistikasi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-emerald-600">{pct}%</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Davomat Ko'rsatkichi</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-indigo-600">{present}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Qatnashgan Darslar</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-extrabold text-rose-600">{records.filter((r) => r.status === 3).length}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Qoldirilgan Darslar</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="text-indigo-600" size={18} /> Davomat Tarixi
          </h2>
          <span className="text-xs text-slate-500">{records.length} ta yozuv</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Davomat yozuvlari mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 text-left">Fan</th>
                  <th className="p-4 text-left">Holat</th>
                  <th className="p-4 text-left">Izoh</th>
                  <th className="p-4 text-right">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const st = statusMap[r.status] || { label: 'Noma\'lum', color: 'text-slate-600 bg-slate-100' };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-semibold text-slate-900">
                        {r.lesson?.subject?.name || 'Fan'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-xs">{r.remarks || '—'}</td>
                      <td className="p-4 text-right text-xs text-slate-400">
                        {r.created_at ? new Date(r.created_at * 1000).toLocaleDateString('uz-UZ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_OPTS = [
  { id: 1, label: 'Qatnashdi', color: 'bg-emerald-600 text-white border-emerald-600', inactiveColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 2, label: 'Kechikdi', color: 'bg-amber-500 text-white border-amber-500', inactiveColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 3, label: 'Qatnashmadi', color: 'bg-rose-600 text-white border-rose-600', inactiveColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 4, label: 'Sababli', color: 'bg-blue-600 text-white border-blue-600', inactiveColor: 'bg-blue-50 text-blue-700 border-blue-200' },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isStudent = roles.includes('student');

  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get('lesson_id');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | ''>(initialLessonId ? Number(initialLessonId) : '');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, { status: number; remarks: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load all lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.getAll<Lesson>('lesson');
        setLessons(res.items || []);
        if (res.items?.length && !selectedLessonId) {
          setSelectedLessonId(res.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLessons();
  }, []);

  // When selected lesson changes, load students of that class and existing attendance
  useEffect(() => {
    if (!selectedLessonId) return;

    const loadLessonAttendance = async () => {
      try {
        setLoading(true);
        setSavedSuccess(false);

        const currentLesson = lessons.find((l) => l.id === Number(selectedLessonId));
        const classId = currentLesson?.school_class_id;

        // Load existing attendance for this lesson
        const attRes = await api.getAll<Attendance>('attendance', { lesson_id: String(selectedLessonId) });
        const existingAtt = attRes.items || [];

        // Load students enrolled in this class
        let studentList: Student[] = [];
        if (classId) {
          const enrollRes = await api.getAll<Enrollment>('enrollment', { school_class_id: String(classId) });
          studentList = (enrollRes.items || []).map((e) => e.student).filter(Boolean) as Student[];
        }

        if (studentList.length === 0) {
          // Fallback to all students if enrollments not populated
          const allStudentsRes = await api.getAll<Student>('student');
          studentList = allStudentsRes.items || [];
        }

        setStudents(studentList);

        // Populate attendance state
        const map: Record<number, { status: number; remarks: string }> = {};
        studentList.forEach((st) => {
          const found = existingAtt.find((a) => a.student_id === st.id);
          map[st.id] = {
            status: found ? found.status : 1, // Default to present
            remarks: found?.remarks || '',
          };
        });
        setAttendanceMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLessonAttendance();
  }, [selectedLessonId, lessons]);

  const handleStatusChange = (studentId: number, status: number) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedLessonId) return;

    try {
      setSaving(true);
      const records = Object.entries(attendanceMap).map(([stId, data]) => ({
        student_id: Number(stId),
        status: data.status,
        remarks: data.remarks,
      }));

      await api.attendance.batchSave(Number(selectedLessonId), records);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Davomatni saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: number) => {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[Number(key)] = { ...next[Number(key)], status };
      });
      return next;
    });
  };

  // Counters
  const counts = Object.values(attendanceMap).reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  if (isStudent) {
    return <StudentAttendanceView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Davomat Belgilash</h1>
          <p className="text-slate-500 text-sm">Dars bo'yicha o'quvchilar qatnashuvini belgilash va qayd etish</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading || students.length === 0}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm shadow-sm disabled:opacity-50 self-start"
        >
          {saving ? (
            'Saqlanmoqda...'
          ) : savedSuccess ? (
            <>
              <Check size={18} /> Saqlandi!
            </>
          ) : (
            <>
              <Save size={18} /> Davomatni saqlash
            </>
          )}
        </button>
      </div>

      {/* Lesson Selector and Stats Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Darsni tanlang:</label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.date} | {l.start_time?.substring(0, 5)} - {l.subject?.name || `Dars #${l.id}`} ({l.schoolClass?.name || 'Sinf'})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Tezkor:</span>
            <button
              onClick={() => markAll(1)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Barchasi keldi
            </button>
            <button
              onClick={() => markAll(3)}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
            >
              Barchasi kelmadi
            </button>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 text-xs font-medium">
          <span className="text-slate-500">Jami o'quvchilar: {students.length}</span>
          <span className="h-3 w-px bg-slate-200" />
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 size={14} /> Qatnashdi: {counts[1] || 0}
          </span>
          <span className="text-amber-700 font-semibold flex items-center gap-1">
            <Clock size={14} /> Kechikdi: {counts[2] || 0}
          </span>
          <span className="text-rose-700 font-semibold flex items-center gap-1">
            <XCircle size={14} /> Qatnashmadi: {counts[3] || 0}
          </span>
          <span className="text-blue-700 font-semibold flex items-center gap-1">
            <AlertCircle size={14} /> Sababli: {counts[4] || 0}
          </span>
        </div>
      </div>

      {/* Students Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">O'quvchilar ro'yxati yuklanmoqda...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Ushbu sinfda o'quvchilar ro'yxati topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold">O'quvchi F.I.Sh</th>
                  <th className="py-3 px-4 font-semibold">ID Kod</th>
                  <th className="py-3 px-4 font-semibold text-center">Davomat holati</th>
                  <th className="py-3 px-4 font-semibold">Sabab / Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st, idx) => {
                  const currentStatus = attendanceMap[st.id]?.status || 1;
                  const currentRemarks = attendanceMap[st.id]?.remarks || '';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {st.user?.first_name ? `${st.user.first_name} ${st.user.last_name}` : `O'quvchi #${st.id}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{st.student_code || '-'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {STATUS_OPTS.map((opt) => {
                            const isSelected = currentStatus === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleStatusChange(st.id, opt.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                  isSelected ? opt.color : opt.inactiveColor + ' hover:opacity-80'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Sabab (ixtiyoriy)..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                          className="w-full border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
