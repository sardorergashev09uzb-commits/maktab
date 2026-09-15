'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Invoice } from '@/types';
import { Receipt, AlertTriangle, CheckCircle2, Clock, DollarSign, CreditCard, Filter } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'payme' as 'cash' | 'click' | 'payme' | 'uzum' | 'bank_transfer',
    transaction_reference: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAll<Invoice>('invoice');
      setInvoices(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPayModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    const remaining = Number(inv.amount) - Number(inv.paid_amount);
    setPaymentForm({
      amount: remaining,
      payment_method: 'payme',
      transaction_reference: `TX-${Date.now().toString().slice(-6)}`,
      notes: `${inv.title} uchun to'lov`,
    });
    setPayModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await api.payment.pay({
        invoice_id: selectedInvoice.id,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        transaction_reference: paymentForm.transaction_reference,
        notes: paymentForm.notes,
      });

      alert('To\'lov muvaffaqiyatli qabul qilindi va kvitansiya rasmiylashtirildi!');
      setPayModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'To\'lovni qabul qilishda xatolik yuz berdi');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return inv.status === 10;
    if (statusFilter === 'partially_paid') return inv.status === 20;
    if (statusFilter === 'paid') return inv.status === 30;
    if (statusFilter === 'overdue') {
      return inv.status !== 30 && new Date(inv.due_date) < new Date();
    }
    return true;
  });

  const totalDebt = invoices
    .filter((inv) => inv.status !== 30 && inv.status !== 50)
    .reduce((sum, inv) => sum + (Number(inv.amount) - Number(inv.paid_amount)), 0);

  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hisob-fakturalar va Qarzdorlik</h1>
          <p className="text-slate-500 text-sm">
            O'qish to'lovlari invoyslari, muddati o'tgan qarzdorliklar monitoringi va to'lovlarni qabul qilish
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami invoyslar</p>
            <p className="text-xl font-bold text-slate-900">{invoices.length} ta</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami undirilgan to'lov</p>
            <p className="text-xl font-bold text-emerald-600">{totalPaid.toLocaleString()} so'm</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Kutilayotgan qarzdorlik</p>
            <p className="text-xl font-bold text-rose-600">{totalDebt.toLocaleString()} so'm</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-slate-400 mr-1" />
        {[
          { key: 'all', label: 'Barchasi' },
          { key: 'pending', label: 'Kutilmoqda' },
          { key: 'partially_paid', label: 'Qisman to\'langan' },
          { key: 'paid', label: 'To\'langan' },
          { key: 'overdue', label: 'Muddati o\'tganlar' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Invoyslar topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Invoys №</th>
                  <th className="py-3 px-4">Tafsilot</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Muddat</th>
                  <th className="py-3 px-4">Summa</th>
                  <th className="py-3 px-4">Qoldiq Qarz</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((inv) => {
                  const amount = Number(inv.amount);
                  const paid = Number(inv.paid_amount);
                  const remaining = Math.max(0, amount - paid);
                  const isOverdue = inv.status !== 30 && new Date(inv.due_date) < new Date();

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {inv.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {inv.student?.user ? `${inv.student.user.first_name} ${inv.student.user.last_name}` : `O'quvchi #${inv.student_id}`}
                        </p>
                        <p className="text-xs text-slate-400">{inv.student?.student_code}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                          {inv.due_date}
                        </span>
                        {isOverdue && <span className="block text-[10px] text-rose-500 font-bold uppercase">Muddati o'tdi</span>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {amount.toLocaleString()} so'm
                      </td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">
                        {remaining > 0 ? `${remaining.toLocaleString()} so'm` : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            inv.status === 30
                              ? 'bg-emerald-50 text-emerald-700'
                              : inv.status === 20
                              ? 'bg-blue-50 text-blue-700'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {inv.status === 30
                            ? 'To\'liq to\'langan'
                            : inv.status === 20
                            ? 'Qisman to\'langan'
                            : isOverdue
                            ? 'Muddati o\'tgan'
                            : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status !== 30 ? (
                          <button
                            onClick={() => openPayModal(inv)}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                          >
                            <CreditCard size={14} />
                            To'lov qilish
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">To'langan</span>
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

      {/* Pay Modal */}
      {payModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">To'lov qabul qilish</h3>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Invoys:</strong> {selectedInvoice.invoice_number} ({selectedInvoice.title})</p>
              <p><strong>Jami summa:</strong> {Number(selectedInvoice.amount).toLocaleString()} so'm</p>
              <p><strong>Qoldiq qarz:</strong> {(Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)).toLocaleString()} so'm</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">To'lov Summasi (so'm)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">To'lov Turi</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="payme">Payme</option>
                  <option value="click">Click</option>
                  <option value="cash">Naqd pul (Kassa)</option>
                  <option value="uzum">Uzum Bank</option>
                  <option value="bank_transfer">Bank orqali o'tkazma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tranzaksiya Cheki / ID</label>
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  placeholder="Masalan: PAYME-12849"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Qo'shimcha izoh</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                >
                  To'lovni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
