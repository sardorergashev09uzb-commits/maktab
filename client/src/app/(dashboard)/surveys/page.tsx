'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Survey } from '@/types';
import { 
  ClipboardCheck, Plus, Sparkles, UserCheck, ShieldCheck, 
  BarChart3, Play, Users, CheckCircle2, Search, ArrowRight, X
} from 'lucide-react';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'career_guidance',
    target_role: 'student',
    is_anonymous: false,
  });

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const res = await api.survey.getAll();
      const list = Array.isArray(res) ? res : ((res as any)?.items || []);
      setSurveys(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.create('survey', {
        ...formData,
        status: 20, // published
      });
      setIsCreateOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'career_guidance',
        target_role: 'student',
        is_anonymous: false,
      });
      await loadSurveys();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'career_guidance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-3 h-3 mr-1" /> Kasbga Yo'naltirish
          </span>
        );
      case 'interest_diagnostic':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Diagnostika
          </span>
        );
      case 'teacher_eval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <UserCheck className="w-3 h-3 mr-1" /> O'qituvchini Baholash
          </span>
        );
      case 'school_eval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
            Maktabni Baholash
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            Umumiy So'rovnoma
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <Users className="w-3 h-3 mr-1 text-slate-500" /> O'quvchilar
          </span>
        );
      case 'parent':
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <Users className="w-3 h-3 mr-1 text-slate-500" /> Ota-onalar
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <Users className="w-3 h-3 mr-1 text-slate-500" /> O'qituvchilar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <Users className="w-3 h-3 mr-1 text-slate-500" /> Barcha
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Phase 6 — Ko'p O'lchovli Diagnostika & Baholash</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">So'rovnomalar va Yo'nalish Aniqlash</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            O'quvchilarning kasbiy qiziqishlari, mantiqiy-algoritmik qobiliyatlarini aniqlash (Dimension Scoring Engine) hamda o'qituvchilar faoliyatini xolis baholash tizimi.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-blue-50 font-semibold shadow-md whitespace-nowrap transition text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Yangi So'rovnoma
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Nomi bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setTypeFilter('career_guidance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'career_guidance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kasbga Yo'naltirish
          </button>
          <button
            onClick={() => setTypeFilter('teacher_eval')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              typeFilter === 'teacher_eval'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            O'qituvchini Baholash
          </button>
        </div>
      </div>

      {/* Surveys Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">Yuklanmoqda...</div>
      ) : filteredSurveys.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium">Hozircha hech qanday so'rovnoma topilmadi</p>
          <p className="text-slate-400 text-xs">Yangi so'rovnoma yaratishingiz yoki filtrni o'zgartirishingiz mumkin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition duration-200 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {getTypeBadge(survey.type)}
                  <div className="flex items-center gap-1.5">
                    {survey.is_anonymous && (
                      <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Anonim
                      </span>
                    )}
                    {getRoleBadge(survey.target_role)}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-800 leading-snug">
                  {survey.title}
                </h2>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {survey.description || 'Tavsif ko\'rsatilmagan'}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Holat:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      Faol (Topshirishga ochiq)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mukofot:</span>
                    <span className="font-semibold text-amber-600">Topshirilsa +15 Coin 🪙</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link href={`/surveys/analytics?id=${survey.id}`} className="flex-1">
                  <button className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Analitika
                  </button>
                </Link>

                <Link href={`/surveys/take?id=${survey.id}`} className="flex-1">
                  <button className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition">
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Testdan o'tish <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Survey */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-slate-800">Yangi So'rovnoma Yaratish</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">So'rovnoma Sarlavhasi</label>
                <input
                  required
                  placeholder="Masalan: 9-sinflar uchun kasbiy diagnostika"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Batafsil Tavsifi</label>
                <input
                  placeholder="Test maqsadi va yo'riqnomasi..."
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">So'rovnoma Turi</label>
                  <select
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="career_guidance">Kasbga Yo'naltirish</option>
                    <option value="interest_diagnostic">Diagnostik Test</option>
                    <option value="teacher_eval">O'qituvchini Baholash</option>
                    <option value="school_eval">Maktabni Baholash</option>
                    <option value="custom">Boshqa</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Maqsadli Auditoriya</label>
                  <select
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  >
                    <option value="student">O'quvchilar</option>
                    <option value="parent">Ota-onalar</option>
                    <option value="teacher">O'qituvchilar</option>
                    <option value="all">Barcha</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal_is_anonymous"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                />
                <label htmlFor="modal_is_anonymous" className="cursor-pointer text-xs font-medium text-slate-700">
                  Anonim tarzda o'tkazilsin (Foydalanuvchi shaxsi sir saqlanadi)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
