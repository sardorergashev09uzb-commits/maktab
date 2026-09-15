'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Subject } from '@/types';
import { Plus, Search, Trash2, RefreshCw, X, BookOpen, FileText } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAll<Subject>('subject');
      setSubjects(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Fanlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Fan nomi kiritilishi shart!');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        code: formData.code || formData.name.slice(0, 4).toUpperCase(),
        description: formData.description,
        status: 10,
      };

      await api.create('subject', payload);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', description: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Fan qo\'shishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" fanini o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('subject', id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Fanlar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              {subjects.length} ta fan
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Maktab o'quv rejasidagi barcha asosiy, chuqurlashtirilgan va xalqaro fanlar</p>
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
            Fan qo'shish
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fan nomi yoki kodi bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-center"
            >
              Qidiruvni tozalash
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Fan Kodi</th>
                <th className="p-4">Fan Nomi</th>
                <th className="p-4">Tavsifi</th>
                <th className="p-4">Holat</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Fanlar yuklanmoqda...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-700">Fanlar topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">Yangi fan qo'shish uchun yuqoridagi tugmani bosing.</p>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-indigo-600">
                      <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                        {subject.code || 'FAN'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {subject.name}
                    </td>
                    <td className="p-4 text-slate-500 text-xs max-w-md truncate">
                      {subject.description || 'Standart umumta\'lim fani'}
                    </td>
                    <td className="p-4">
                      {subject.status === 10 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Faol
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          Nofaol
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi Fan Qo'shish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fan Nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Masalan: Robototexnika, Kimyo"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Qisqa Kodi (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                  placeholder="Masalan: ROBO, CHEM"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tavsifi</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Dastur haqida qisqacha ma'lumot..."
                />
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
