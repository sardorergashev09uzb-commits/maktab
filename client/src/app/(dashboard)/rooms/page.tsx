'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Room } from '@/types';
import { Plus, Search, Trash2, RefreshCw, X, DoorOpen, Users, Building, Layers } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    building: 'A bino',
    floor: 1,
    capacity: 30,
    type: 'classroom',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAll<Room>('room');
      setRooms(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Xonalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Xona nomi kiritilishi shart!');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        building: formData.building,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        type: formData.type,
        status: 10,
      };

      await api.create('room', payload);
      setIsModalOpen(false);
      setFormData({
        name: '',
        building: 'A bino',
        floor: 1,
        capacity: 30,
        type: 'classroom',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xona qo\'shishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" xonasini o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('room', id);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'O\'chirishda xatolik yuz berdi');
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.building && r.building.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (typeFilter !== 'all') return r.type === typeFilter;
    return true;
  });

  const getTypeName = (type?: string) => {
    switch (type) {
      case 'classroom': return 'Darsxona';
      case 'lab': return 'Laboratoriya';
      case 'it': return 'IT xonasi';
      case 'gym': return 'Sport zali';
      case 'library': return 'Kutubxona';
      case 'auditorium': return 'Majlislar zali';
      default: return 'Standart xona';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Xonalar & Auditoriyalar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {rooms.length} ta xona
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Sinf xonalari, laboratoriyalar, sport zali va infratuzilma nazorati</p>
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
            Xona qo'shish
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
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl max-w-fit">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Barchasi ({rooms.length})
          </button>
          <button
            onClick={() => setTypeFilter('classroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === 'classroom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Darsxonalar
          </button>
          <button
            onClick={() => setTypeFilter('lab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === 'lab' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Laboratoriyalar
          </button>
          <button
            onClick={() => setTypeFilter('it')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            IT markazi
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Xona yoki bino bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Xonalar yuklanmoqda...
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <DoorOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Xonalar topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">Yangi xona kiritish uchun yuqoridagi tugmani bosing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                      <span className="text-[11px] text-slate-400">{getTypeName(room.type)}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {room.floor || 1}-qavat
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> Bino:
                    </span>
                    <strong className="text-slate-800">{room.building || 'Asosiy bino'}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> Sig'im:
                    </span>
                    <strong className="text-slate-800">{room.capacity || 30} o'rin</strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-emerald-500" /> Turi:
                    </span>
                    <strong className="text-indigo-600">{getTypeName(room.type)}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Mavjud & Jihozlangan
                </span>
                <button
                  onClick={() => handleDeleteRoom(room.id, room.name)}
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

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi Xona Qo'shish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Xona Nomi / Raqami *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Masalan: 204-Matematika yoki STEAM lab"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Bino</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="A bino"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Qavat (1, 2, 3...)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sig'im (O'quvchi o'rni)</label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Xona Turi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="classroom">Standart darsxona</option>
                    <option value="lab">Laboratoriya</option>
                    <option value="it">IT / Kompyuter xonasi</option>
                    <option value="gym">Sport zali</option>
                    <option value="library">Kutubxona</option>
                    <option value="auditorium">Majlislar zali</option>
                  </select>
                </div>
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
