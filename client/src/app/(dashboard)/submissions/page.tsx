'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Submission, Assignment } from '@/types';
import { CheckCircle2, Clock, FileText, Send, User, Award } from 'lucide-react';

export default function SubmissionsPage() {
  const searchParams = useSearchParams();
  const initialAssignmentId = searchParams.get('assignment_id');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | ''>(
    initialAssignmentId ? Number(initialAssignmentId) : ''
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading modal state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.getAll<Assignment>('assignment');
        setAssignments(res.items || []);
        if (res.items?.length && !selectedAssignmentId) {
          setSelectedAssignmentId(res.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignments();
  }, []);

  const loadSubmissions = async () => {
    if (!selectedAssignmentId) return;
    try {
      setLoading(true);
      const res = await api.getAll<Submission>('submission', {
        assignment_id: String(selectedAssignmentId),
      });
      setSubmissions(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedAssignmentId]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setSaving(true);
      await api.submission.grade(selectedSubmission.id, parseFloat(score), feedback);
      alert('Topshiriq muvaffaqiyatli baholandi!');
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const currentAssignment = assignments.find((a) => a.id === Number(selectedAssignmentId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vazifalarni Tekshirish va Baholash</h1>
        <p className="text-slate-500 text-sm">O'quvchilar tomonidan topshirilgan uy vazifalarini ko'rib chiqish va baholash</p>
      </div>

      {/* Assignment selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vazifani tanlang:</label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.schoolClass?.name || 'Sinf'} - {a.subject?.name || 'Fan'})
              </option>
            ))}
          </select>
        </div>

        {currentAssignment && (
          <div className="text-right text-xs text-slate-500 space-y-1">
            <p>Maksimal ball: <strong className="text-indigo-600 font-bold">{currentAssignment.max_score} ball</strong></p>
            <p>Muddati: <strong className="text-slate-700">{currentAssignment.due_date?.slice(0, 16)}</strong></p>
          </div>
        )}
      </div>

      {/* Submissions table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Topshiriqlar yuklanmoqda...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Ushbu vazifa bo'yicha hali hech qanday o'quvchi javob topshirmagan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">O'quvchi</th>
                  <th className="py-3 px-4 font-semibold">Topshirilgan vaqt</th>
                  <th className="py-3 px-4 font-semibold">Javob matni</th>
                  <th className="py-3 px-4 font-semibold">Baho</th>
                  <th className="py-3 px-4 font-semibold">Holat</th>
                  <th className="py-3 px-4 font-semibold">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sub.student?.user?.first_name} {sub.student?.user?.last_name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(sub.submitted_at * 1000).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs truncate">
                      {sub.text_content || (sub.file_url ? 'Fayl biriktirilgan' : 'Javob berilmagan')}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                          {sub.score} ball
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Baholanmagan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 20 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Baholangan
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Tekshiruv kutilmoqda
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setScore(sub.score ? String(sub.score) : '');
                          setFeedback(sub.teacher_feedback || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition"
                      >
                        {sub.status === 20 ? 'Qayta baholash' : 'Baholash'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="text-indigo-600" />
              O'quvchi topshirig'ini baholash
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-200">
              <p>O'quvchi: <strong>{selectedSubmission.student?.user?.first_name} {selectedSubmission.student?.user?.last_name}</strong></p>
              <p>Topshirilgan matn:</p>
              <div className="p-2 bg-white rounded border border-slate-200 text-slate-800 italic">
                {selectedSubmission.text_content || 'Matn mavjud emas'}
              </div>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Ball (Maksimal: {currentAssignment?.max_score || 100})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={currentAssignment?.max_score || 100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Masalan: 95"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  O'qituvchi fikri / Izoh
                </label>
                <textarea
                  rows={3}
                  placeholder="Javob to'liq va aniq bajarilgan..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  {saving ? 'Saqlanmoqda...' : 'Bahoni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
