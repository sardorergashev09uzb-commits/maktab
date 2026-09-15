'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Student, SchoolClass } from '@/types';
import { Plus, Search, Trash2, RefreshCw, X, User, Phone, Mail, Calendar, School, CheckCircle2 } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
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
    gender: 1,
    birth_date: '',
    student_code: '',
    school_class_id: '',
  });

  const loadData = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { expand: 'user,currentEnrollment.schoolClass' };
      if (query) params.q = query;

      const [studentsRes, classesRes] = await Promise.all([
        api.getAll<Student>('student', params),
        api.getAll<SchoolClass>('school-class'),
      ]);

      setStudents(studentsRes.items || []);
      setClasses(classesRes.items || []);
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      alert('Ism va familiya to\'ldirilishi shart!');
      return;
    }

    try {
      setSubmitting(true);
      await api.create('student', formData);
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        phone: '+998',
        email: '',
        gender: 1,
        birth_date: '',
        student_code: '',
        school_class_id: '',
      });
      loadData(searchQuery);
    } catch (err: any) {
      alert(err.message || 'O\'quvchi qo\'shishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}"ni tizimdan o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('student', id);
      setStudents(prev => prev.filter(s => s.id !== id));
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
            <h1 className="text-2xl font-bold text-slate-900">O'quvchilar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {students.length} nafar
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Maktabdagi barcha faol o'quvchilar ro'yxati va profili</p>
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
            O'quvchi qo'shish
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="F.I.Sh, kod yoki telefon orqali qidirish..."
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
                <th className="p-4">ID / Kod</th>
                <th className="p-4">O'quvchi F.I.Sh</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Jinsi</th>
                <th className="p-4">Biriktirilgan Sinf</th>
                <th className="p-4">Holat</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <User className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-700">Hech qanday o'quvchi topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">Yangi o'quvchi qo'shish uchun yuqoridagi tugmani bosing.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const fullName = student.user
                    ? `${student.user.first_name} ${student.user.last_name}`
                    : (student as any).full_name || 'Noma\'lum';
                  const phone = student.user?.phone || '—';
                  const className = (student as any).currentEnrollment?.schoolClass?.name || 'Biriktirilmagan';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-medium text-xs text-indigo-600">
                        {student.student_code}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{fullName}</div>
                        <div className="text-xs text-slate-400">{student.user?.email || ''}</div>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {phone}
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {student.gender === 1 ? 'O\'g\'il bola' : student.gender === 2 ? 'Qiz bola' : '—'}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {className}
                        </span>
                      </td>
                      <td className="p-4">
                        {student.status === 10 ? (
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
                          onClick={() => handleDeleteStudent(student.id, fullName)}
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

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi O'quvchi Qo'shish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Sardor"
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
                    placeholder="Masalan: Karimov"
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Jinsi</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value={1}>O'g'il bola</option>
                    <option value={2}>Qiz bola</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tug'ilgan sana</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sinfga biriktirish</label>
                  <select
                    value={formData.school_class_id}
                    onChange={(e) => setFormData({ ...formData, school_class_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Sinf tanlang...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.grade_level}-sinf)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">O'quvchi ID kodi (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="Bo'sh qoldirilsa avtomatik yaratiladi"
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
