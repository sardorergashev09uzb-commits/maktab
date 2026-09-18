'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Lesson, Student, Grade, GradeCategory, DeadlineInfo, Enrollment } from '@/types';
import { Award, Clock, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Send, BookOpen } from 'lucide-react';

function StudentGradesView() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAll<any>('grade', { expand: 'lesson.subject,gradeCategory', 'per-page': '200' })
      .then((res) => setGrades(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mening Baholarim</h1>
        <p className="text-slate-500 text-sm">O'qituvchilar tomonidan darslar bo'yicha qo'yilgan baholar va izohlar</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-indigo-600" size={18} /> Baholar Jurnali
          </h2>
          <span className="text-xs text-slate-500">{grades.length} ta baho</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Yuklanmoqda...</div>
        ) : grades.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Hozircha qo'yilgan baholar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Fan</th>
                  <th className="p-4">Kategoriya</th>
                  <th className="p-4">Ball</th>
                  <th className="p-4">Maks</th>
                  <th className="p-4">Izoh</th>
                  <th className="p-4 text-right">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-900">
                      {g.lesson?.subject?.name || 'Fan'}
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {g.gradeCategory?.name || 'Oraliq'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-extrabold text-base ${
                          g.score >= g.max_score * 0.85
                            ? 'text-emerald-600'
                            : g.score >= g.max_score * 0.7
                            ? 'text-indigo-600'
                            : g.score >= g.max_score * 0.55
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {g.score}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{g.max_score || 100}</td>
                    <td className="p-4 text-slate-600 text-xs max-w-xs truncate">
                      {g.comment || '—'}
                    </td>
                    <td className="p-4 text-right text-xs text-slate-400">
                      {g.created_at ? new Date(g.created_at * 1000).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GradesPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isStudent = roles.includes('student');

  const searchParams = useSearchParams();
  const initialLessonId = searchParams.get('lesson_id');

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | ''>(initialLessonId ? Number(initialLessonId) : '');
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Score state per student: { [studentId]: score }
  const [scores, setScores] = useState<Record<number, string>>({});
  const [savingStudentId, setSavingStudentId] = useState<number | null>(null);

  // Zavuch Override Request Modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideStudent, setOverrideStudent] = useState<Student | null>(null);
  const [overrideScore, setOverrideScore] = useState<string>('85');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // Load lessons and grade categories
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [lesRes, catRes] = await Promise.all([
          api.getAll<Lesson>('lesson'),
          api.getAll<GradeCategory>('grade-category'),
        ]);

        setLessons(lesRes.items || []);
        setCategories(catRes.items || []);

        if (catRes.items?.length) {
          setSelectedCategoryId(catRes.items[0].id);
        }
        if (lesRes.items?.length && !selectedLessonId) {
          setSelectedLessonId(lesRes.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitial();
  }, []);

  // Load lesson students, existing grades, and deadline info
  useEffect(() => {
    if (!selectedLessonId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const currentLesson = lessons.find((l) => l.id === Number(selectedLessonId));
        const classId = currentLesson?.school_class_id;

        const [gradeRes, deadlineRes] = await Promise.all([
          api.getAll<Grade>('grade', { lesson_id: String(selectedLessonId) }),
          api.lesson.getDeadline(Number(selectedLessonId)),
        ]);

        setGrades(gradeRes.items || []);
        setDeadlineInfo(deadlineRes);

        // Load class students
        let studentList: Student[] = [];
        if (classId) {
          const enrollRes = await api.getAll<Enrollment>('enrollment', { school_class_id: String(classId) });
          studentList = (enrollRes.items || []).map((e) => e.student).filter(Boolean) as Student[];
        }
        if (studentList.length === 0) {
          const allRes = await api.getAll<Student>('student');
          studentList = allRes.items || [];
        }
        setStudents(studentList);

        // Populate scores map for selected category
        const scoreMap: Record<number, string> = {};
        (gradeRes.items || []).forEach((g) => {
          if (!selectedCategoryId || g.grade_category_id === Number(selectedCategoryId)) {
            scoreMap[g.student_id] = String(g.score);
          }
        });
        setScores(scoreMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLessonId, selectedCategoryId, lessons]);

  const handleSaveGrade = async (student: Student) => {
    if (!selectedLessonId || !selectedCategoryId) return;

    const scoreVal = parseFloat(scores[student.id] || '');
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      alert('Ball 0 dan 100 gacha bo\'lishi kerak');
      return;
    }

    // If deadline is expired and not approved, open override modal
    if (deadlineInfo && !deadlineInfo.is_open) {
      setOverrideStudent(student);
      setOverrideScore(String(scoreVal));
      setOverrideReason('');
      setOverrideModalOpen(true);
      return;
    }

    const currentLesson = lessons.find((l) => l.id === Number(selectedLessonId));

    try {
      setSavingStudentId(student.id);

      // Check if grade already exists
      const existing = grades.find(
        (g) => g.student_id === student.id && g.grade_category_id === Number(selectedCategoryId)
      );

      if (existing) {
        await api.update('grade', existing.id, {
          score: scoreVal,
        });
      } else {
        await api.create('grade', {
          lesson_id: Number(selectedLessonId),
          student_id: student.id,
          teacher_id: currentLesson?.teacher_id,
          grade_category_id: Number(selectedCategoryId),
          score: scoreVal,
          max_score: 100,
        });
      }

      // Refresh grades
      const gradeRes = await api.getAll<Grade>('grade', { lesson_id: String(selectedLessonId) });
      setGrades(gradeRes.items || []);
    } catch (err: any) {
      alert(err.message || 'Bahoni saqlashda xatolik yuz berdi');
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudent || !selectedLessonId || !selectedCategoryId) return;

    const currentLesson = lessons.find((l) => l.id === Number(selectedLessonId));

    try {
      setSubmittingOverride(true);
      await api.create('grade-override', {
        lesson_id: Number(selectedLessonId),
        student_id: overrideStudent.id,
        teacher_id: currentLesson?.teacher_id,
        grade_category_id: Number(selectedCategoryId),
        requested_score: parseFloat(overrideScore),
        reason: overrideReason,
      });

      alert('Zavuchga ruxsat so\'rovi yuborildi. Tasdiqlangandan so\'ng baho avtomatik qo\'yiladi.');
      setOverrideModalOpen(false);

      // Reload deadline status
      const dl = await api.lesson.getDeadline(Number(selectedLessonId));
      setDeadlineInfo(dl);
    } catch (err: any) {
      alert(err.message || 'So\'rovni yuborishda xatolik yuz berdi');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const getBadge = () => {
    if (!deadlineInfo) return null;
    switch (deadlineInfo.status) {
      case 'allowed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} /> Baholash oynasi ochiq (Ruxsat berilgan)
          </span>
        );
      case 'override_approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck size={14} /> Zavuch ruxsat bergan
          </span>
        );
      case 'override_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={14} /> Zavuchga ruxsat so'rovi yuborilgan (Kutilmoqda)
          </span>
        );
      case 'override_rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={14} /> Zavuch ruxsatni rad etgan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={14} /> Muddati o'tgan (Zavuch ruxsati kerak)
          </span>
        );
    }
  };

  if (isStudent) {
    return <StudentGradesView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Baholash Jurnali</h1>
          <p className="text-slate-500 text-sm">48 soatlik baholash oynasi, qat'iy deadline va Zavuch ruxsati workflow'i</p>
        </div>
        <div>{getBadge()}</div>
      </div>

      {/* Lesson & Category selectors */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Darsni tanlang:</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.date} | {l.subject?.name || `Dars #${l.id}`} ({l.schoolClass?.name || 'Sinf'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Baho kategoriyasi:</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Max: {c.max_score} ball, vazn: {c.weight})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade entry table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">O'quvchilar va baholar yuklanmoqda...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">O'quvchilar topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                  <th className="py-3 px-4 font-semibold">O'quvchi F.I.Sh</th>
                  <th className="py-3 px-4 font-semibold">ID Kod</th>
                  <th className="py-3 px-4 font-semibold w-48">Ball (0 - 100)</th>
                  <th className="py-3 px-4 font-semibold">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st, idx) => {
                  const existingGrade = grades.find(
                    (g) => g.student_id === st.id && g.grade_category_id === Number(selectedCategoryId)
                  );
                  const isSaving = savingStudentId === st.id;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {st.user?.first_name ? `${st.user.first_name} ${st.user.last_name}` : `O'quvchi #${st.id}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{st.student_code || '-'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Ball..."
                            value={scores[st.id] ?? ''}
                            onChange={(e) => setScores({ ...scores, [st.id]: e.target.value })}
                            className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleSaveGrade(st)}
                          disabled={isSaving}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            deadlineInfo && !deadlineInfo.is_open
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isSaving ? (
                            'Saqlanmoqda...'
                          ) : deadlineInfo && !deadlineInfo.is_open ? (
                            <>
                              <AlertTriangle size={14} /> Ruxsat so'rash
                            </>
                          ) : existingGrade ? (
                            'Yangilash'
                          ) : (
                            'Qo\'yish'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Zavuch Override Request Modal */}
      {overrideModalOpen && overrideStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-900">Zavuchdan baholashga ruxsat so'rash</h3>
            </div>
            <p className="text-sm text-slate-600">
              Ushbu dars bo'yicha belgilangan <strong>48 soatlik baholash muddati o'tgan</strong>. Baho qo'yish uchun Zavuchga sabab ko'rsatilgan so'rov yuboriladi.
            </p>

            <form onSubmit={handleSubmitOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">O'quvchi</label>
                <div className="p-2.5 rounded-lg bg-slate-50 font-semibold text-sm text-slate-800 border border-slate-200">
                  {overrideStudent.user?.first_name} {overrideStudent.user?.last_name} ({overrideStudent.student_code})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qo'yilishi so'ralgan ball</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kechikish sababi (Zavuch uchun)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Masalan: O'quvchi kasallik sababli darsda qatnashmagan va keyinroq topshirgan..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium flex items-center gap-1.5"
                >
                  <Send size={16} />
                  {submittingOverride ? 'Yuborilmoqda...' : 'Zavuchga yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
