'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Question, Subject, QuestionBank } from '@/types';
import { Plus, Check, HelpCircle, BookOpen, Layers, CheckCircle2, Sigma, Image } from 'lucide-react';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Question form
  const [formData, setFormData] = useState({
    subject_id: 0,
    question_text: '',
    type: 'single_choice' as 'single_choice' | 'formula' | 'true_false' | 'short_text',
    points: 10,
    formula: '',
    explanation: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [qRes, subRes] = await Promise.all([
        api.getAll<Question>('question'),
        api.getAll<Subject>('subject'),
      ]);

      setQuestions(qRes.items || []);
      setSubjects(subRes.items || []);

      if (subRes.items?.length && !formData.subject_id) {
        setFormData((prev) => ({ ...prev, subject_id: subRes.items[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOptionChange = (idx: number, text: string) => {
    const next = [...formData.options];
    next[idx].text = text;
    setFormData({ ...formData, options: next });
  };

  const handleCorrectSelect = (idx: number) => {
    const next = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === idx,
    }));
    setFormData({ ...formData, options: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create Question
      const createdQ = await api.create<Question>('question', {
        subject_id: formData.subject_id || subjects[0]?.id,
        question_text: formData.question_text,
        type: formData.type,
        points: formData.points,
        formula: formData.formula,
        explanation: formData.explanation,
      });

      // 2. Create Options if multiple choice or formula
      if (createdQ?.id && (formData.type === 'single_choice' || formData.type === 'formula')) {
        for (let i = 0; i < formData.options.length; i++) {
          if (formData.options[i].text.trim()) {
            await api.create('question-option', {
              question_id: createdQ.id,
              option_text: formData.options[i].text,
              is_correct: formData.options[i].is_correct ? 1 : 0,
              order_number: i + 1,
            });
          }
        }
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const filteredQuestions = selectedSubjectId
    ? questions.filter((q) => q.subject_id === Number(selectedSubjectId))
    : questions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savollar Banki</h1>
          <p className="text-slate-500 text-sm">
            Fanlar bo'yicha test savollari, formulalar (LaTeX), rasmli va nazorat topshiriqlari bazasi
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm self-start shadow-sm"
        >
          <Plus size={18} />
          Yangi savol qo'shish
        </button>
      </div>

      {/* Subject filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers size={18} className="text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">Fan bo'yicha filter:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Barcha fanlar</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-semibold text-slate-500">Jami savollar: {filteredQuestions.length}</span>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Savollar topilmadi. Yuqoridagi tugma orqali savollar bankiga yangi savol qo'shing.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const sub = subjects.find((s) => s.id === q.subject_id);

            return (
              <div
                key={q.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      {sub?.name || 'Fan'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                      {q.type}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{q.points} ball</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{q.question_text}</h3>

                {q.formula && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm text-indigo-800 flex items-center gap-2">
                    <Sigma size={18} className="text-indigo-600" />
                    <span>Formula: {q.formula}</span>
                  </div>
                )}

                {/* Options preview */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                          opt.is_correct
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>
                          <strong>{String.fromCharCode(65 + oIdx)})</strong> {opt.option_text}
                        </span>
                        {opt.is_correct && <CheckCircle2 size={14} className="text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Yangi test savoli qo'shish</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fan</label>
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Savol turi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="single_choice">Yagona to'g'ri javobli test (A, B, C, D)</option>
                  <option value="formula">Matematik / Formulali savol</option>
                  <option value="true_false">To'g'ri / Noto'g'ri</option>
                  <option value="short_text">Qisqa yozma javob</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Savol matni</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Savol shartini kiriting..."
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {formData.type === 'formula' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Formula (LaTeX)</label>
                  <input
                    type="text"
                    placeholder="Masalan: x^2 - 5x + 6 = 0"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ball</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Options */}
              {(formData.type === 'single_choice' || formData.type === 'formula') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 uppercase">
                    Variantlar (To'g'ri javobni radio orqali tanlang)
                  </label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={opt.is_correct}
                        onChange={() => handleCorrectSelect(i)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-500 w-4">{String.fromCharCode(65 + i)}</span>
                      <input
                        type="text"
                        placeholder={`Variant ${String.fromCharCode(65 + i)}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

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
