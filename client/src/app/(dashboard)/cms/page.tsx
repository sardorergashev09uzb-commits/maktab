'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CmsSection, CmsFaq } from '@/types';
import {
  Globe,
  Plus,
  Edit2,
  Check,
  X,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layers,
  Save,
} from 'lucide-react';

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<'sections' | 'faqs'>('sections');
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Section Editing Modal
  const [selectedSection, setSelectedSection] = useState<CmsSection | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    is_active: true,
    order_number: 1,
    content: '',
  });

  // FAQ Editing / Creation Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'umumiy',
    order_number: 1,
    is_active: true,
  });

  // FAQ Category Filter
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [secRes, faqRes] = await Promise.all([
        api.cms.getSections(),
        api.cms.getFaqs(),
      ]);
      setSections(secRes || []);
      setFaqs(faqRes || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'CMS maʼlumotlarini yuklashda xatolik yuz berdi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditSection = (sec: CmsSection) => {
    setSelectedSection(sec);
    setSectionForm({
      title: sec.title || '',
      subtitle: sec.subtitle || '',
      image_url: sec.image_url || '',
      is_active: Boolean(sec.is_active),
      order_number: sec.order_number || 1,
      content: typeof sec.content === 'object' ? JSON.stringify(sec.content, null, 2) : (sec.content || ''),
    });
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      setSaving(true);
      setMessage(null);
      await api.cms.updateSection(selectedSection.id, {
        title: sectionForm.title,
        subtitle: sectionForm.subtitle,
        image_url: sectionForm.image_url,
        is_active: sectionForm.is_active ? 1 : 0,
        order_number: Number(sectionForm.order_number),
        content: sectionForm.content,
      });

      setMessage({ type: 'success', text: `"${sectionForm.title}" bo'limi muvaffaqiyatli saqlandi!` });
      setSectionModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Bo\'limni saqlashda xatolik yuz berdi.' });
    } finally {
      setSaving(false);
    }
  };

  const openNewFaq = () => {
    setEditingFaqId(null);
    setFaqForm({
      question: '',
      answer: '',
      category: 'qabul',
      order_number: (faqs.length + 1),
      is_active: true,
    });
    setFaqModalOpen(true);
  };

  const openEditFaq = (faq: CmsFaq) => {
    setEditingFaqId(faq.id);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'umumiy',
      order_number: faq.order_number || 1,
      is_active: Boolean(faq.is_active),
    });
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category,
        order_number: Number(faqForm.order_number),
        is_active: faqForm.is_active ? 1 : 0,
      };

      if (editingFaqId) {
        await api.cms.updateFaq(editingFaqId, payload);
        setMessage({ type: 'success', text: 'Savol-javob muvaffaqiyatli yangilandi!' });
      } else {
        await api.cms.createFaq(payload);
        setMessage({ type: 'success', text: 'Yangi savol-javob qo\'shildi!' });
      }

      setFaqModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Savol-javobni saqlashda xatolik yuz berdi.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFaqStatus = async (faq: CmsFaq) => {
    try {
      await api.cms.updateFaq(faq.id, {
        is_active: faq.is_active ? 0 : 1,
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    faqCategoryFilter === 'all' || f.category === faqCategoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <Globe className="w-4 h-4" />
            <span>Kontent & CMS Boshqaruvi</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sayt Boshqaruvi (Landing CMS)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Maktab ochiq landing sahifasidagi matnlar, bannerlar, afzalliklar va FAQ savol-javoblarini boshqarish
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Saytni ko'rish</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all relative ${
            activeTab === 'sections'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Landing Bo'limlari ({sections.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all relative ${
            activeTab === 'faqs'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ko'p Beriladigan Savollar ({faqs.length})</span>
        </button>
      </div>

      {/* SECTIONS TAB */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-medium">
                      #{sec.key}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sec.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {sec.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">{sec.title}</h3>
                    {sec.subtitle && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sec.subtitle}</p>
                    )}
                  </div>

                  {sec.image_url && (
                    <div className="h-28 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                      <img src={sec.image_url} alt={sec.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {sec.content && (
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 line-clamp-3 font-mono">
                      {typeof sec.content === 'object' ? JSON.stringify(sec.content) : sec.content}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Tartib: #{sec.order_number}</span>
                  <button
                    onClick={() => openEditSection(sec)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Tahrirlash</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Kategoriya:</span>
              <select
                value={faqCategoryFilter}
                onChange={(e) => setFaqCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Barcha kategoriyalar</option>
                <option value="qabul">Qabul jarayoni</option>
                <option value="talim">Ta'lim tizimi</option>
                <option value="tolov">To'lov va shartnoma</option>
                <option value="umumiy">Umumiy</option>
              </select>
            </div>

            <button
              onClick={openNewFaq}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi FAQ Qo'shish</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Hech qanday savol-javob topilmadi.
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wider">
                          {faq.category || 'umumiy'}
                        </span>
                        <span className="text-xs text-slate-400">Tartib: #{faq.order_number}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{faq.question}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleFaqStatus(faq)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          faq.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {faq.is_active ? 'Faol' : 'Nofaol'}
                      </button>
                      <button
                        onClick={() => openEditFaq(faq)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION EDIT MODAL */}
      {sectionModalOpen && selectedSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600">#{selectedSection.key}</span>
                <h3 className="text-lg font-black text-slate-900">Bo'limni Tahrirlash</h3>
              </div>
              <button
                onClick={() => setSectionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sarlavha (Title)</label>
                <input
                  type="text"
                  required
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quyi Sarlavha (Subtitle)</label>
                <input
                  type="text"
                  value={sectionForm.subtitle}
                  onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rasm Havolasi (Image URL)</label>
                <input
                  type="text"
                  value={sectionForm.image_url}
                  onChange={(e) => setSectionForm({ ...sectionForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tartib Raqami</label>
                  <input
                    type="number"
                    value={sectionForm.order_number}
                    onChange={(e) => setSectionForm({ ...sectionForm, order_number: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={sectionForm.is_active}
                      onChange={(e) => setSectionForm({ ...sectionForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span>Saytda ko'rsatilsin (Faol)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qo'shimcha Konfiguratsiya (JSON / Matn)</label>
                <textarea
                  rows={4}
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder='{"badge": "2026-2027", "items": [...]}'
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSectionModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingFaqId ? 'Savol-javobni Tahrirlash' : 'Yangi Savol-javob'}
              </h3>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Savol matni</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Masalan: Qabul imtihonlari qachon o'tkaziladi?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Javob matni</label>
                <textarea
                  rows={4}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Javobni batafsil tushuntiring..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategoriya</label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="qabul">Qabul jarayoni</option>
                    <option value="talim">Ta'lim tizimi</option>
                    <option value="tolov">To'lov va shartnoma</option>
                    <option value="umumiy">Umumiy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tartib Raqami</label>
                  <input
                    type="number"
                    value={faqForm.order_number}
                    onChange={(e) => setFaqForm({ ...faqForm, order_number: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={faqForm.is_active}
                    onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>Saytda ko'rsatilsin (Faol)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
