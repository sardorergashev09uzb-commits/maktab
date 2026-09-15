'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AcademicYear } from '@/types';
import { Plus, RefreshCw, Calendar, CheckCircle2, X, Trash2, CalendarDays, ArrowRight } from 'lucide-react';

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '2026/2027',
    start_date: '2026-09-02',
    end_date: '2027-06-25',
    is_current: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAll<AcademicYear>('academic-year');
      setYears(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'O\'quv yillarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    try {
      setSubmitting(true);
      const slug = formData.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      await api.create('academic-year', {
        ...formData,
        slug,
        status: 10,
      });

      setIsModalOpen(false);
      setFormData({
        name: '2027/2028',
        start_date: '2027-09-02',
        end_date: '2028-06-25',
        is_current: false,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'O\'quv yili yaratishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (year: AcademicYear) => {
    try {
      await api.update('academic-year', year.id, { is_current: 1 });
      loadData();
    } catch (err: any) {
      alert(err.message || 'O\'zgartirishda xatolik yuz berdi');
    }
  };

  const handleDeleteYear = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" o'quv yilini o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('academic-year', id);
      setYears(prev => prev.filter(y => y.id !== id));
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">O'quv Yillari & Choraklar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {years.length} ta davr
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Akademik taqvim, o'quv yillari davomiyligi va faol semestrlar boshqaruvi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Yangi o'quv yili
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Years Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          O'quv yillari yuklanmoqda...
        </div>
      ) : years.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">O'quv yillari kiritilmagan</p>
          <p className="text-xs text-slate-400 mt-1">Yangi o'quv yilini boshlash uchun yuqoridagi tugmani bosing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {years.map((year) => (
            <div
              key={year.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                year.is_current
                  ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-slate-900">{year.name}</span>
                      {year.is_current && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Joriy Yil
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">{year.slug || year.name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Boshlanish sanasi:</span>
                    <strong className="text-slate-800">{year.start_date}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tugash sanasi:</span>
                    <strong className="text-slate-800">{year.end_date}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500">Status:</span>
                    <strong className="text-emerald-600 font-medium">Faol</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {!year.is_current ? (
                  <button
                    onClick={() => handleSetCurrent(year)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Joriy deb belgilash <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Barcha jurnallar ushbu yilda
                  </span>
                )}
                <button
                  onClick={() => handleDeleteYear(year.id, year.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="O'chirish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Year Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi O'quv Yili Kiritish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">O'quv Yili Nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="2026/2027"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Boshlanish sanasi *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tugash sanasi *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>Ushbu o'quv yilini hozirdanoq "Joriy yil" qilib belgilash</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
