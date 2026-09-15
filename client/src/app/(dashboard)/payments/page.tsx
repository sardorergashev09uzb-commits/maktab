'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Payment } from '@/types';
import { CreditCard, CheckCircle2, RotateCcw, AlertCircle, Calendar, Hash, User } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAll<Payment>('payment');
      setPayments(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReverseModal = (p: Payment) => {
    setSelectedPayment(p);
    setReverseReason('Operator xatoligi tufayli bekor qilindi');
    setReverseModalOpen(true);
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      await api.payment.reverse(selectedPayment.id, reverseReason);
      alert('To\'lov muvaffaqiyatli bekor qilindi va balans to\'g\'rilandi.');
      setReverseModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Bekor qilishda xatolik yuz berdi');
    }
  };

  const totalConfirmed = payments
    .filter((p) => p.status === 10)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">To'lovlar Jurnali</h1>
          <p className="text-slate-500 text-sm">
            Qabul qilingan barcha o'qish to'lovlari kvitansiyalari, kassa va mobil banking tranzaksiyalari
          </p>
        </div>
      </div>

      {/* Summary Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasdiqlangan Jami Tushum</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalConfirmed.toLocaleString()} so'm</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center">
          Jami kvitansiyalar: {payments.length} ta
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">To'lovlar topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Kvitansiya №</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4">To'lov Turi</th>
                  <th className="py-3 px-4">Tranzaksiya Cheki</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((p) => {
                  const amount = Number(p.amount);
                  const isReversed = p.status === 20;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition ${isReversed ? 'opacity-60 bg-slate-50/50' : ''}`}>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {p.payment_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {p.student?.user ? `${p.student.user.first_name} ${p.student.user.last_name}` : `O'quvchi #${p.student_id}`}
                        </p>
                        <p className="text-xs text-slate-400">{p.student?.student_code}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {p.payment_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {p.transaction_reference || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {amount.toLocaleString()} so'm
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            isReversed ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isReversed ? 'Bekor qilingan' : 'Tasdiqlangan'}
                        </span>
                        {isReversed && p.reversal_reason && (
                          <span className="block text-[11px] text-rose-500 mt-0.5">{p.reversal_reason}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isReversed && (
                          <button
                            onClick={() => openReverseModal(p)}
                            title="Xato to'lovni bekor qilish"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
                          >
                            <RotateCcw size={16} />
                            <span className="text-xs font-semibold">Bekor qilish</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reverse Modal */}
      {reverseModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 text-rose-600 flex items-center gap-2">
              <AlertCircle size={20} />
              To'lovni bekor qilish (Reversal)
            </h3>
            <p className="text-xs text-slate-600">
              Ushbu amal to'lov kvitansiyasini bekor qiladi va tegishli invoys hamda shartnoma bo'yicha to'langan summani kamaytiradi.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Kvitansiya:</strong> {selectedPayment.payment_number}</p>
              <p><strong>Summa:</strong> {Number(selectedPayment.amount).toLocaleString()} so'm</p>
            </div>

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bekor qilish sababi</label>
                <textarea
                  required
                  rows={3}
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="Sababni batafsil yozing..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReverseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-medium"
                >
                  Bekor qilishni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
