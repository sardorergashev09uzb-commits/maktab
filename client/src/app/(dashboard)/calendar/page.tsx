'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AcademicCalendar, AcademicYear } from '@/types';
import { Plus, Calendar as CalendarIcon, Tag, Check, AlertTriangle } from 'lucide-react';

export default function CalendarPage() {
  const [calendarDays, setCalendarDays] = useState<AcademicCalendar[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: 'holiday',
    title: '',
    description: '',
    is_working_day: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [calRes, yearRes] = await Promise.all([
        api.getAll<AcademicCalendar>('calendar'),
        api.getAll<AcademicYear>('academic-year'),
      ]);
      setCalendarDays(calRes.items || []);
      setAcademicYears(yearRes.items || []);
      if (yearRes.items?.length && !selectedYearId) {
        const current = yearRes.items.find((y) => y.is_current) || yearRes.items[0];
        setSelectedYearId(current.id);
      }
    } catch (err) {
      console.error('Failed to load calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearId) return;

    try {
      await api.create('calendar', {
        ...formData,
        academic_year_id: selectedYearId,
      });
      setModalOpen(false);
      setFormData({
        date: '',
        type: 'holiday',
        title: '',
        description: '',
        is_working_day: false,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    school_day: { label: 'O\'quv kuni', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    weekend: { label: 'Dam olish', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    holiday: { label: 'Bayram / Ta\'til', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    special_closure: { label: 'Favqulodda ta\'til', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    exam_period: { label: 'Imtihon davri', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Akademik Taqvim</h1>
          <p className="text-slate-500 text-sm">O'quv kunlari, bayramlar, ta'tillar va baholash oynasi qoidalari</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start"
        >
          <Plus size={18} />
          Maxsus kun / Bayram qo'shish
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Ish kunlari</p>
            <p className="text-xl font-bold text-slate-900">Dushanba - Juma</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Baholash oynasi</p>
            <p className="text-xl font-bold text-slate-900">48 soat</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Deadline qoidasi</p>
            <p className="text-xl font-bold text-slate-900">Shanba/Yakshanba hisobmas</p>
          </div>
        </div>
      </div>

      {/* Calendar Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Taqvimdagi maxsus kunlar va ta'tillar</h2>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(Number(e.target.value))}
            className="text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.is_current ? '(Joriy)' : ''}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>
        ) : calendarDays.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Hozircha maxsus taqvim yozuvlari kiritilmagan. Standart ish haftasi qo'llanilmoqda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Sana</th>
                  <th className="py-3 px-4 font-semibold">Turi</th>
                  <th className="py-3 px-4 font-semibold">Sarlavha</th>
                  <th className="py-3 px-4 font-semibold">Tavsif</th>
                  <th className="py-3 px-4 font-semibold">Ish kuni?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calendarDays.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeLabels[item.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {typeLabels[item.type]?.label || item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.title || '-'}</td>
                    <td className="py-3 px-4 text-slate-500">{item.description || '-'}</td>
                    <td className="py-3 px-4">
                      {item.is_working_day ? (
                        <span className="text-emerald-600 font-medium">Ha</span>
                      ) : (
                        <span className="text-rose-600 font-medium">Yo'q (Dam olish)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Yangi taqvim kuni qo'shish</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Kunning turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    const isWorking = type === 'school_day' || type === 'exam_period';
                    setFormData({ ...formData, type, is_working_day: isWorking });
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="holiday">Bayram / Ta'til</option>
                  <option value="weekend">Dam olish kuni</option>
                  <option value="special_closure">Favqulodda ta'til (Special closure)</option>
                  <option value="exam_period">Imtihon davri</option>
                  <option value="school_day">Qo'shimcha dars kuni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sarlavha</label>
                <input
                  type="text"
                  placeholder="Masalan: Mustaqillik bayrami"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Qo'shimcha izoh</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_working"
                  checked={formData.is_working_day}
                  onChange={(e) => setFormData({ ...formData, is_working_day: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_working" className="text-sm font-medium text-slate-700">
                  Ushbu kunda dars va baholash oynasi ishlaydi (ish kuni)
                </label>
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
