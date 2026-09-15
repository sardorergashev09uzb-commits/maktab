'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Contract, Student, AcademicYear } from '@/types';
import { Plus, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, Calendar, DollarSign } from 'lucide-react';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    contract_number: `SH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    student_id: 0,
    academic_year_id: 0,
    total_amount: 15000000,
    discount_amount: 0,
    payment_plan: 'monthly' as 'monthly' | 'quarterly' | 'annual',
    start_date: `${new Date().getFullYear()}-09-01`,
    end_date: `${new Date().getFullYear() + 1}-05-31`,
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, ayRes] = await Promise.all([
        api.getAll<Contract>('contract'),
        api.getAll<Student>('student'),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      setContracts(cRes.items || []);
      setStudents(sRes.items || []);
      setAcademicYears(ayRes.items || []);

      if (sRes.items?.length && !formData.student_id) {
        setFormData((prev) => ({ ...prev, student_id: sRes.items[0].id }));
      }
      if (ayRes.items?.length && !formData.academic_year_id) {
        setFormData((prev) => ({ ...prev, academic_year_id: ayRes.items[0].id }));
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

  const handleGenerateInvoices = async (contractId: number) => {
    try {
      setActionLoading(contractId);
      const res = await api.contract.generateInvoices(contractId);
      alert(res.message || 'Invoyslar muvaffaqiyatli shakllantirildi!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Invoys shakllantirishda xatolik yuz berdi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('contract', formData);
      setModalOpen(false);
      setFormData({
        contract_number: `SH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        student_id: students[0]?.id || 0,
        academic_year_id: academicYears[0]?.id || 0,
        total_amount: 15000000,
        discount_amount: 0,
        payment_plan: 'monthly',
        start_date: `${new Date().getFullYear()}-09-01`,
        end_date: `${new Date().getFullYear() + 1}-05-31`,
        notes: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Shartnoma yaratishda xatolik yuz berdi');
    }
  };

  const totalContractSum = contracts.reduce((acc, c) => acc + (Number(c.total_amount) - Number(c.discount_amount)), 0);
  const totalPaidSum = contracts.reduce((acc, c) => acc + Number(c.paid_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">O'qish Shartnomalari</h1>
          <p className="text-slate-500 text-sm">
            O'quvchilar va ota-onalar bilan tuzilgan rasmiy ta'lim shartnomalari va to'lov rejalari
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start shadow-sm"
        >
          <Plus size={18} />
          Yangi shartnoma tuzish
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami shartnomalar</p>
            <p className="text-xl font-bold text-slate-900">{contracts.length} ta</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami shartnoma summasi</p>
            <p className="text-xl font-bold text-slate-900">{totalContractSum.toLocaleString()} so'm</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">To'langan summa</p>
            <p className="text-xl font-bold text-emerald-600">{totalPaidSum.toLocaleString()} so'm</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Qoldiq to'lov</p>
            <p className="text-xl font-bold text-amber-600">{(totalContractSum - totalPaidSum).toLocaleString()} so'm</p>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Barcha Shartnomalar</h2>
          <span className="text-xs font-medium text-slate-500">{contracts.length} ta shartnoma</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Shartnomalar topilmadi. Yuqoridagi tugma orqali yangi shartnoma qo'shing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Shartnoma №</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Yillik Summa</th>
                  <th className="py-3 px-4">To'langan</th>
                  <th className="py-3 px-4">To'lov Rejasi</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Invoyslar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts.map((c) => {
                  const net = Number(c.total_amount) - Number(c.discount_amount);
                  const paid = Number(c.paid_amount);
                  const percent = net > 0 ? Math.min(100, Math.round((paid / net) * 100)) : 0;
                  const hasInvoices = c.invoices && c.invoices.length > 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {c.contract_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {c.student?.user ? `${c.student.user.first_name} ${c.student.user.last_name}` : `O'quvchi #${c.student_id}`}
                        </p>
                        <p className="text-xs text-slate-400">{c.student?.student_code || 'ID yo\'q'}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {net.toLocaleString()} so'm
                        {Number(c.discount_amount) > 0 && (
                          <span className="block text-xs text-rose-500 font-normal">
                            Chegirma: {Number(c.discount_amount).toLocaleString()} so'm
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">{paid.toLocaleString()} so'm</span>
                          <div className="w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${percent >= 100 ? 'bg-emerald-500' : percent > 50 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500">{percent}% to'langan</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-700 font-medium">
                        {c.payment_plan === 'monthly' ? 'Oylik (10 oy)' : c.payment_plan === 'quarterly' ? 'Choraklik (4 ta)' : 'Bir martalik yillik'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.status === 20
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.status === 10
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {c.status === 20 ? 'To\'liq to\'langan' : c.status === 10 ? 'Faol' : 'Bekor qilingan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {hasInvoices ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {c.invoices?.length} ta invoys mavjud
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGenerateInvoices(c.id)}
                            disabled={actionLoading === c.id}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            <RefreshCw size={14} className={actionLoading === c.id ? 'animate-spin' : ''} />
                            Invoys tuzish
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

      {/* Create Contract Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Yangi o'qish shartnomasi rasmiylashtirish</h3>
            <form onSubmit={handleCreateContract} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Shartnoma Raqami</label>
                <input
                  type="text"
                  required
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quvchi</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user ? `${s.user.first_name} ${s.user.last_name} (${s.student_code})` : `O'quvchi #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quv Yili</label>
                <select
                  required
                  value={formData.academic_year_id}
                  onChange={(e) => setFormData({ ...formData, academic_year_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Yillik Summa (so'm)</label>
                  <input
                    type="number"
                    required
                    step="100000"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Chegirma (so'm)</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">To'lov Grafigi / Rejasi</label>
                <select
                  value={formData.payment_plan}
                  onChange={(e) => setFormData({ ...formData, payment_plan: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="monthly">Oylik (10 oyga bo'lib to'lash)</option>
                  <option value="quarterly">Choraklik (Har chorakda 4 marta)</option>
                  <option value="annual">Yillik bir martalik to'liq to'lov</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Boshlanish Sanasi</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tugash Sanasi</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Izoh / Qo'shimcha shartlar</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Shartnoma bo'yicha maxsus qaydlar..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Shartnomani saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
