'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/types';
import { Bell, Plus, Filter, Calendar, Users, AlertCircle, Pin } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'all' as 'all' | 'teachers' | 'students' | 'parents',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    is_published: 1,
    published_at: Math.floor(Date.now() / 1000),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAll<Announcement>('announcement');
      setAnnouncements(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('announcement', {
        ...formData,
        published_at: Math.floor(Date.now() / 1000),
      });

      alert('E\'lon muvaffaqiyatli chop etildi!');
      setModalOpen(false);
      setFormData({
        title: '',
        content: '',
        target_role: 'all',
        priority: 'normal',
        is_published: 1,
        published_at: Math.floor(Date.now() / 1000),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'E\'lon yaratishda xatolik yuz berdi');
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (roleFilter === 'all') return true;
    return ann.target_role === roleFilter || ann.target_role === 'all';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maktab E'lonlari</h1>
          <p className="text-slate-500 text-sm">
            Maktab miqyosidagi rasmiy xabarlar, o'quvchilar, ota-onalar va o'qituvchilar uchun e'lonlar taxtasi
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start shadow-sm"
        >
          <Plus size={18} />
          Yangi e'lon chop etish
        </button>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-slate-400 mr-1" />
        {[
          { key: 'all', label: 'Barcha e\'lonlar' },
          { key: 'students', label: 'O\'quvchilar uchun' },
          { key: 'parents', label: 'Ota-onalar uchun' },
          { key: 'teachers', label: 'O\'qituvchilar uchun' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              roleFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          E'lonlar topilmadi.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const date = new Date(ann.published_at * 1000).toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 transition ${
                  ann.priority === 'urgent'
                    ? 'border-rose-200 hover:border-rose-300'
                    : ann.priority === 'high'
                    ? 'border-amber-200 hover:border-amber-300'
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ann.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ann.priority === 'urgent' ? 'Shoshilinch' : ann.priority === 'high' ? 'Muhim' : 'Oddiy'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      Kimlarga: {ann.target_role === 'all' ? 'Barchaga' : ann.target_role === 'teachers' ? 'O\'qituvchilarga' : ann.target_role === 'parents' ? 'Ota-onalarga' : 'O\'quvchilarga'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar size={13} />
                    {date}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900">{ann.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

                {ann.author && (
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
                    <span>Muallif:</span>
                    <span className="font-semibold text-slate-700">
                      {ann.author.first_name} {ann.author.last_name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              Yangi E'lon Chop Etish
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">E'lon Sarlavhasi</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Sarlavhani kiriting..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Kimlar Uchun</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="all">Barchaga (Umumiy)</option>
                    <option value="students">O'quvchilar uchun</option>
                    <option value="parents">Ota-onalar uchun</option>
                    <option value="teachers">O'qituvchilar uchun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Muhimlik Darajasi</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="normal">Oddiy</option>
                    <option value="high">Muhim</option>
                    <option value="urgent">Shoshilinch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">E'lon Matni</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="E'lon tafsilotlarini yozing..."
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
                  E'lonni chop etish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
