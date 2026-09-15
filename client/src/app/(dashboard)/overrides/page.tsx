'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { GradeOverride } from '@/types';
import { ShieldCheck, Check, X, Clock, AlertTriangle, User, BookOpen } from 'lucide-react';

export default function OverridesPage() {
  const [overrides, setOverrides] = useState<GradeOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('10'); // default pending

  // Action modal
  const [selectedOverride, setSelectedOverride] = useState<GradeOverride | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadOverrides = async () => {
    try {
      setLoading(true);
      const res = await api.getAll<GradeOverride>(
        'grade-override',
        filterStatus !== '' ? { status: filterStatus } : undefined
      );
      setOverrides(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverrides();
  }, [filterStatus]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOverride) return;

    try {
      setProcessing(true);
      if (actionType === 'approve') {
        await api.gradeOverride.approve(selectedOverride.id, decisionNotes);
        alert('Ruxsat tasdiqlandi va o\'quvchiga baho qo\'yildi!');
      } else {
        await api.gradeOverride.reject(selectedOverride.id, decisionNotes);
        alert('Ruxsat so\'rovi rad etildi.');
      }
      setSelectedOverride(null);
      setDecisionNotes('');
      loadOverrides();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadges: Record<number, { label: string; color: string }> = {
    10: { label: 'Kutilmoqda', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    20: { label: 'Tasdiqlangan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    30: { label: 'Rad etilgan', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="text-indigo-600" />
            Zavuch: Baho Override Ruxsatlari
          </h1>
          <p className="text-slate-500 text-sm">
            48 soatlik muddati o'tgan baholar uchun o'qituvchilar tomonidan yuborilgan ruxsat so'rovlari
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setFilterStatus('10')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filterStatus === '10' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kutilayotganlar
          </button>
          <button
            onClick={() => setFilterStatus('20')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filterStatus === '20' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tasdiqlanganlar
          </button>
          <button
            onClick={() => setFilterStatus('30')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filterStatus === '30' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rad etilganlar
          </button>
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filterStatus === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Barchasi
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">So'rovlar yuklanmoqda...</div>
        ) : overrides.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Ushbu holat bo'yicha hech qanday so'rov topilmadi.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overrides.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-base">
                      {item.student?.user?.first_name} {item.student?.user?.last_name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">({item.student?.student_code})</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadges[item.status]?.color || 'bg-gray-100'}`}>
                      {statusBadges[item.status]?.label || item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      So'ralgan: {item.requested_score} ball
                    </span>
                    {item.status === 10 && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => {
                            setSelectedOverride(item);
                            setActionType('approve');
                            setDecisionNotes('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check size={14} /> Tasdiqlash
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOverride(item);
                            setActionType('reject');
                            setDecisionNotes('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <X size={14} /> Rad etish
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-slate-400" />
                    Fan: <strong>{item.lesson?.subject?.name || 'Fan'}</strong> ({item.lesson?.date})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-400" />
                    O'qituvchi: <strong>{item.teacher?.user?.first_name} {item.teacher?.user?.last_name}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    Kategoriya: <strong>{item.gradeCategory?.name || 'Kategoriya'}</strong>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">O'qituvchi izohi:</span>
                  {item.reason}
                </div>

                {item.decision_notes && (
                  <div className="p-3 bg-indigo-50/50 rounded-lg text-xs text-indigo-900 border border-indigo-100">
                    <span className="font-bold block mb-0.5">Zavuch xulosasi:</span>
                    {item.decision_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {selectedOverride && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {actionType === 'approve' ? 'So\'rovni tasdiqlash' : 'So\'rovni rad etish'}
            </h3>
            <p className="text-sm text-slate-600">
              O'quvchi: <strong>{selectedOverride.student?.user?.first_name} {selectedOverride.student?.user?.last_name}</strong>
              <br />
              Ball: <strong>{selectedOverride.requested_score} ball</strong>
            </p>

            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Xulosa / Qaror izohi (ixtiyoriy)
                </label>
                <textarea
                  rows={3}
                  placeholder="Zavuch xulosasi..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOverride(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                    actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {processing ? 'Bajarilmoqda...' : actionType === 'approve' ? 'Tasdiqlash' : 'Rad etish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
