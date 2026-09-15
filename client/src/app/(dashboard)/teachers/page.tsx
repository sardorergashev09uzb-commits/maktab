'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Teacher } from '@/types';
import { Plus, Search, Trash2, RefreshCw, X, GraduationCap, Phone, Mail, Award, BookOpen } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '+998',
    email: '',
    specialization: '',
    education: 'Oliy',
    experience_years: 5,
    employee_code: '',
  });

  const loadData = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { expand: 'user' };
      if (query) params.q = query;

      const res = await api.getAll<Teacher>('teacher', params);
      setTeachers(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.specialization) {
      alert('Ism, familiya va mutaxassislik kiritilishi shart!');
      return;
    }

    try {
      setSubmitting(true);
      await api.create('teacher', formData);
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        phone: '+998',
        email: '',
        specialization: '',
        education: 'Oliy',
        experience_years: 5,
        employee_code: '',
      });
      loadData(searchQuery);
    } catch (err: any) {
      alert(err.message || 'O\'qituvchi qo\'shishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}"ni o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('teacher', id);
      setTeachers(prev => prev.filter(t => t.id !== id));
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
            <h1 className="text-2xl font-bold text-slate-900">O'qituvchilar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {teachers.length} nafar pedagog
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Maktabdagi barcha o'qituvchilar tarkibi, yuklamasi va mutaxassisliklari</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(searchQuery)}
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
            O'qituvchi qo'shish
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
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="F.I.Sh, mutaxassislik yoki kod orqali qidirish..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </form>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); loadData(''); }}
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
                <th className="p-4">Kod</th>
                <th className="p-4">O'qituvchi F.I.Sh</th>
                <th className="p-4">Mutaxassisligi</th>
                <th className="p-4">Ma'lumoti</th>
                <th className="p-4">Tajriba</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Holat</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-700">O'qituvchilar topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">Yangi o'qituvchi qo'shish uchun yuqoridagi tugmani bosing.</p>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const fullName = teacher.user
                    ? `${teacher.user.first_name} ${teacher.user.last_name}`
                    : (teacher as any).full_name || 'Noma\'lum';
                  const phone = teacher.user?.phone || '—';

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-medium text-xs text-indigo-600">
                        {teacher.employee_code}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{fullName}</div>
                        <div className="text-xs text-slate-400">{teacher.user?.email || ''}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {teacher.specialization || 'Umumiy'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {teacher.education || 'Oliy'}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {teacher.experience_years ? `${teacher.experience_years} yil` : '—'}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {phone}
                      </td>
                      <td className="p-4">
                        {teacher.status === 10 ? (
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
                          onClick={() => handleDeleteTeacher(teacher.id, fullName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi O'qituvchi Qo'shish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Dilnoza"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Umarova"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mutaxassisligi (Fan) *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Matematika, Fizika"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tajriba (yillarda)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+998901234567"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ma'lumoti</label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Oliy">Oliy (Bakalavr)</option>
                    <option value="Magistr">Magistr</option>
                    <option value="Fan Nomzodi / PhD">Fan Nomzodi / PhD</option>
                    <option value="O'rta maxsus">O'rta maxsus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Xodim ID Kodi (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="Bo'sh qoldirilsa avtomatik yaratiladi (masalan: T-2026-001)"
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
