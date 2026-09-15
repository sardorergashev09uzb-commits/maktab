'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CoinTransaction, CoinRule, Student } from '@/types';
import { Coins, Plus, TrendingUp, Award, Clock, ArrowUpRight, ArrowDownRight, Gift } from 'lucide-react';

export default function CoinsPage() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [rules, setRules] = useState<CoinRule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardModalOpen, setAwardModalOpen] = useState(false);

  const [awardForm, setAwardForm] = useState({
    student_id: 0,
    amount: 15,
    reason: 'Darsda namunali xulq va faollik uchun',
    reference_type: 'manual_bonus',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [txRes, ruleRes, sRes] = await Promise.all([
        api.getAll<CoinTransaction>('coin-transaction'),
        api.getAll<CoinRule>('coin-rule'),
        api.getAll<Student>('student'),
      ]);

      setTransactions(txRes.items || []);
      setRules(ruleRes.items || []);
      setStudents(sRes.items || []);

      if (sRes.items?.length && !awardForm.student_id) {
        setAwardForm((prev) => ({ ...prev, student_id: sRes.items[0].id }));
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

  const handleRuleSelect = (rule: CoinRule) => {
    setAwardForm((prev) => ({
      ...prev,
      amount: rule.coins_amount,
      reason: rule.title,
    }));
  };

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.coin.award({
        student_id: awardForm.student_id,
        amount: Number(awardForm.amount),
        reason: awardForm.reason,
        reference_type: awardForm.reference_type,
      });

      alert('Coin muvaffaqiyatli o\'quvchi balansiga o\'tkazildi!');
      setAwardModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Coin berishda xatolik yuz berdi');
    }
  };

  const totalCirculation = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maktab Valyutasi (Coin Ledger)</h1>
          <p className="text-slate-500 text-sm">
            O'quvchilarning akademik yutuqlari, faolligi va namunali xulqini rag'batlantiruvchi ichki valyuta va audit hisob-kitobi
          </p>
        </div>
        <button
          onClick={() => setAwardModalOpen(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition font-medium text-sm self-start shadow-sm"
        >
          <Coins size={18} />
          Coin berish
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Coins size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami aylanmadagi Coin</p>
            <p className="text-2xl font-extrabold text-amber-600">{totalCirculation} coin</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rag'batlantirish Qoidalari</p>
            <p className="text-2xl font-extrabold text-slate-900">{rules.length} ta faol qoida</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tranzaksiyalar Soni</p>
            <p className="text-2xl font-extrabold text-slate-900">{transactions.length} ta operatsiya</p>
          </div>
        </div>
      </div>

      {/* Preset Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Standart Mukofotlash Qoidalari</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between hover:border-amber-200 transition"
            >
              <div>
                <p className="font-bold text-xs text-slate-900">{r.title}</p>
                <p className="text-[11px] text-slate-500">{r.description || r.code}</p>
              </div>
              <span className="font-extrabold text-amber-600 text-sm bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 whitespace-nowrap">
                +{r.coins_amount} coin
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Tranzaksiyalar Tarixi (Immutable Ledger)</h2>
          <span className="text-xs font-medium text-slate-500">{transactions.length} ta yozuv</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Tranzaksiyalar mavjud emas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Turi</th>
                  <th className="py-3 px-4">Coin Miqdori</th>
                  <th className="py-3 px-4">Sababi / Asos</th>
                  <th className="py-3 px-4">Manba</th>
                  <th className="py-3 px-4">Kim tomonidan</th>
                  <th className="py-3 px-4 text-right">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => {
                  const isCredit = Number(tx.amount) > 0;
                  const date = new Date(tx.created_at * 1000).toLocaleString();

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {tx.student?.user ? `${tx.student.user.first_name} ${tx.student.user.last_name}` : `O'quvchi #${tx.student_id}`}
                        </p>
                        <p className="text-xs text-slate-400">{tx.student?.student_code}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                            isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isCredit ? 'Kirim' : 'Chiqim'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-extrabold text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCredit ? `+${tx.amount}` : tx.amount} coin
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {tx.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 font-mono">
                          {tx.reference_type || 'manual'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {tx.createdByUser ? `${tx.createdByUser.first_name} ${tx.createdByUser.last_name}` : 'Tizim'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                        {date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Award Modal */}
      {awardModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coins size={20} className="text-amber-500" />
              O'quvchiga Coin taqdim etish
            </h3>

            <form onSubmit={handleAwardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quvchi</label>
                <select
                  required
                  value={awardForm.student_id}
                  onChange={(e) => setAwardForm({ ...awardForm, student_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user ? `${s.user.first_name} ${s.user.last_name} (${s.student_code})` : `O'quvchi #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fast presets */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tayyor shablon qoidalar</label>
                <div className="flex flex-wrap gap-1.5">
                  {rules.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => handleRuleSelect(r)}
                      className="text-[11px] bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 px-2.5 py-1 rounded transition"
                    >
                      {r.title} (+{r.coins_amount})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Coin Miqdori</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={awardForm.amount}
                  onChange={(e) => setAwardForm({ ...awardForm, amount: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-amber-600 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sababi / Taqriz</label>
                <input
                  type="text"
                  required
                  value={awardForm.reason}
                  onChange={(e) => setAwardForm({ ...awardForm, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-medium"
                >
                  Coinni topshirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
