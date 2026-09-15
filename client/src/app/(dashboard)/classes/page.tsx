'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SchoolClass, Room, AcademicYear } from '@/types';
import { Plus, Search, Trash2, RefreshCw, X, School, Users, DoorOpen, Calendar, BookOpen } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'primary' | 'middle' | 'high'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    grade_level: 1,
    section: 'A',
    room_id: '',
    capacity: 25,
    academic_year_id: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesRes, roomsRes, yearsRes] = await Promise.all([
        api.getAll<SchoolClass>('school-class', { expand: 'academicYear,room' }),
        api.getAll<Room>('room'),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      const classList = classesRes.items || [];
      setClasses(classList);
      setRooms(roomsRes.items || []);
      const years = yearsRes.items || [];
      setAcademicYears(years);

      const currentYear = years.find(y => y.is_current) || years[0];
      if (currentYear) {
        setFormData(prev => ({ ...prev, academic_year_id: String(currentYear.id) }));
      }
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Sinf nomi kiritilishi shart!');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        grade_level: Number(formData.grade_level),
        section: formData.section,
        capacity: Number(formData.capacity),
        status: 10,
      };
      if (formData.room_id) payload.room_id = Number(formData.room_id);
      if (formData.academic_year_id) payload.academic_year_id = Number(formData.academic_year_id);

      await api.create('school-class', payload);
      setIsModalOpen(false);
      setFormData(prev => ({
        name: '',
        grade_level: 1,
        section: 'A',
        room_id: '',
        capacity: 25,
        academic_year_id: prev.academic_year_id,
      }));
      loadData();
    } catch (err: any) {
      alert(err.message || 'Sinf yaratishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" sinfini o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('school-class', id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (stageFilter === 'primary') return cls.grade_level >= 1 && cls.grade_level <= 4;
    if (stageFilter === 'middle') return cls.grade_level >= 5 && cls.grade_level <= 9;
    if (stageFilter === 'high') return cls.grade_level >= 10 && cls.grade_level <= 11;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Sinflar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {classes.length} ta sinf
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Maktabdagi barcha ta'lim bosqichlari va sinflar monitoringi</p>
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
            Yangi sinf
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl max-w-fit">
          <button
            onClick={() => setStageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stageFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Barchasi ({classes.length})
          </button>
          <button
            onClick={() => setStageFilter('primary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stageFilter === 'primary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            1-4 Boshlang'ich
          </button>
          <button
            onClick={() => setStageFilter('middle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stageFilter === 'middle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            5-9 O'rta
          </button>
          <button
            onClick={() => setStageFilter('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stageFilter === 'high' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            10-11 Yuqori
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sinf nomini qidirish..."
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Sinflar yuklanmoqda...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <School className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Hech qanday sinf topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">Yangi sinf ochish uchun yuqoridagi tugmani bosing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => {
            const roomName = cls.room?.name || 'Biriktirilmagan';
            const yearName = cls.academicYear?.name || '2026/2027';

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                      {cls.name}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {cls.grade_level}-bosqich
                    </span>
                  </div>

                  <div className="space-y-2 mt-4 text-xs text-slate-600">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="flex items-center gap-1 text-slate-500">
                        <DoorOpen className="w-3.5 h-3.5 text-indigo-500" /> Xona:
                      </span>
                      <strong className="text-slate-800">{roomName}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-blue-500" /> Sig'im:
                      </span>
                      <strong className="text-slate-800">{cls.capacity || 25} o'rin</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> O'quv yili:
                      </span>
                      <strong className="text-slate-800">{yearName}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Holat: <strong className="text-emerald-600">Faol</strong>
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi Sinf Ochish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Masalan: 3-A, 9-B, 11-A"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Bosqichi (1-11)</label>
                  <input
                    type="number"
                    min={1}
                    max={11}
                    required
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Harf / Bo'lim</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Xona biriktirish</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Xona tanlang...</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.capacity || 25} o'rin)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Sig'imi</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">O'quv Yili</label>
                <select
                  value={formData.academic_year_id}
                  onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.is_current ? '(Joriy)' : ''}
                    </option>
                  ))}
                </select>
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
