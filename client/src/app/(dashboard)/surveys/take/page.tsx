'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Survey, Teacher } from '@/types';
import { 
  Sparkles, ArrowLeft, ArrowRight, Star, 
  Send, Award, Compass, RefreshCw, BarChart2, Check
} from 'lucide-react';

function SurveyTakeContent() {
  const searchParams = useSearchParams();
  const surveyIdParam = searchParams.get('id');

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Store user answers: { [question_id]: { option_id?, rating?, text? } }
  const [answers, setAnswers] = useState<Record<number, { option_id?: number; rating?: number; text?: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let idToLoad = surveyIdParam ? parseInt(surveyIdParam) : null;
        
        if (!idToLoad) {
          const allSurveys = await api.survey.getAll();
          const list = Array.isArray(allSurveys) ? allSurveys : ((allSurveys as any)?.items || []);
          if (list.length > 0) {
            idToLoad = list[0].id;
          }
        }

        if (idToLoad) {
          const detail = await api.survey.getDetail(idToLoad);
          setSurvey(detail);

          if (detail.type === 'teacher_eval') {
            const tRes = await api.getAll<Teacher>('teacher');
            setTeachers(tRes.items || []);
            if (tRes.items && tRes.items.length > 0) {
              setSelectedTeacherId(tRes.items[0].id);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [surveyIdParam]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        So'rovnoma yuklanmoqda...
      </div>
    );
  }

  if (!survey || !survey.questions || survey.questions.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">So'rovnoma topilmadi</h2>
        <p className="text-sm text-slate-500">Ushbu so'rovnomada hali savollar mavjud emas.</p>
        <Link href="/surveys">
          <button className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> So'rovnomalar ro'yxatiga qaytish
          </button>
        </Link>
      </div>
    );
  }

  const questions = survey.questions;
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], option_id: optionId },
    }));
  };

  const handleRating = (questionId: number, rating: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], rating },
    }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], text },
    }));
  };

  const isCurrentAnswered = () => {
    const ans = answers[currentQ.id];
    if (!ans) return false;
    if (currentQ.question_type === 'single_choice') return ans.option_id !== undefined;
    if (currentQ.question_type === 'rating_scale') return ans.rating !== undefined;
    if (currentQ.question_type === 'text') return true;
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answersPayload = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        option_id: val.option_id,
        rating: val.rating,
        text: val.text,
      }));

      const res = await api.survey.submit(survey.id, answersPayload, selectedTeacherId);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // SCORING ENGINE RESULT VIEW
  // ----------------------------------------------------
  if (result) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 rounded-3xl text-white shadow-xl text-center space-y-3">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
            <Award className="w-9 h-9 text-white" />
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Diagnostika Muvaffaqiyatli Yakunlandi
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Sizning Shaxsiy Profilingiz & Natijalar</h1>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm">
            Javoblaringiz Dimension Scoring Engine tomonidan ko'p o'lchovli tahlildan o'tkazildi.
          </p>
          {!survey.is_anonymous && (
            <div className="inline-block mt-2 bg-amber-400/30 text-amber-100 font-semibold px-4 py-1.5 rounded-full text-xs border border-amber-300/40">
              🪙 +15 Maktab Coini hisobingizga muvaffaqiyatli o'tkazildi!
            </div>
          )}
        </div>

        {/* Primary Recommendation Card */}
        {result.recommendation && (
          <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl border-2 border-indigo-200 shadow-md p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Asosiy Tavsiya etilgan Yo'nalish</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {result.primary_dimension?.name || 'Yetakchi Yo\'nalish'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm md:text-base font-medium pt-1 border-t border-indigo-100">
              {result.recommendation}
            </p>
          </div>
        )}

        {/* Dimension Breakdown Cards */}
        {result.dimension_scores && result.dimension_scores.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Barcha Yo'nalishlar Bo'yicha Qobiliyat Balansi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Har bir soha bo'yicha to'plangan ballar va foiz ko'rsatkichlari
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {result.dimension_scores.map((dim: any, idx: number) => (
                <div key={idx} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color_code || '#3b82f6' }}
                      />
                      {dim.name}
                    </span>
                    <span className="font-bold text-slate-700">{dim.percentage}% ({dim.score} ball)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dim.percentage}%`,
                        backgroundColor: dim.color_code || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/surveys">
            <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 inline-flex items-center justify-center text-sm transition">
              <ArrowLeft className="w-4 h-4 mr-2" /> Barcha So'rovnomalar
            </button>
          </Link>
          <Link href={`/surveys/analytics?id=${survey.id}`}>
            <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-50 inline-flex items-center justify-center text-sm transition">
              <BarChart2 className="w-4 h-4 mr-2" /> Umumiy Analitikani Ko'rish
            </button>
          </Link>
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
              setCurrentIndex(0);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md inline-flex items-center justify-center text-sm transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Testni Qayta Topshirish
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // QUESTION RUNNER VIEW
  // ----------------------------------------------------
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/surveys">
          <button className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Chiqish
          </button>
        </Link>
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
          {survey.title}
        </span>
      </div>

      {/* Teacher Select for teacher_eval */}
      {survey.type === 'teacher_eval' && teachers.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-amber-900 block">Baholanayotgan O'qituvchi:</span>
            <p className="text-xs text-amber-700">Qaysi fan o'qituvchisini baholamoqchisiz?</p>
          </div>
          <select
            className="w-full sm:w-72 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            value={selectedTeacherId ? selectedTeacherId.toString() : ''}
            onChange={(e) => setSelectedTeacherId(parseInt(e.target.value))}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                {t.user?.first_name} {t.user?.last_name} ({t.specialization || 'O\'qituvchi'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500">
          <span>Savol {currentIndex + 1} / {totalQuestions}</span>
          <span>{progressPercent}% Yakunlandi</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentQ.question_type === 'rating_scale' ? '5 ballik shkala bo\'yicha baholang' : 'Variantlardan birini tanlang'}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h2>
        </div>

        {/* Single Choice Options */}
        {currentQ.question_type === 'single_choice' && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id]?.option_id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-sm'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-sm md:text-base leading-relaxed">{opt.option_text}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Rating Scale (1 to 5) */}
        {currentQ.question_type === 'rating_scale' && (
          <div className="py-4 space-y-4 text-center">
            <div className="flex justify-center gap-2 sm:gap-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = answers[currentQ.id]?.rating === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRating(currentQ.id, val)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition-all border-2 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500 text-white shadow-lg scale-105'
                        : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700 hover:bg-amber-50/50'
                    }`}
                  >
                    <Star className={`w-5 h-5 mb-0.5 ${isSelected ? 'fill-white text-white' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm">{val}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 px-4">
              <span>1 - Juda yomon</span>
              <span>3 - O'rtacha</span>
              <span>5 - A'lo darajada</span>
            </div>
          </div>
        )}

        {/* Text Feedback */}
        {currentQ.question_type === 'text' && (
          <div className="space-y-2">
            <textarea
              placeholder="Fikr, taklif yoki mulohazangizni yozing..."
              className="w-full min-h-[120px] p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={answers[currentQ.id]?.text || ''}
              onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
            />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Oldingi
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!isCurrentAnswered()}
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center transition"
            >
              Keyingi <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isCurrentAnswered() || submitting}
              onClick={handleSubmit}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center transition"
            >
              {submitting ? (
                'Hisoblanmoqda...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" /> Yakunlash va Natijani Ko'rish
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SurveyTakePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Yuklanmoqda...</div>}>
      <SurveyTakeContent />
    </Suspense>
  );
}
