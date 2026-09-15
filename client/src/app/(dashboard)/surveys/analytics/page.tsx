'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Survey, SurveyAnalytics } from '@/types';
import { 
  Users, Star, MessageSquare, ArrowLeft, 
  Sparkles, PieChart, ShieldCheck
} from 'lucide-react';

function SurveyAnalyticsContent() {
  const searchParams = useSearchParams();
  const surveyIdParam = searchParams.get('id');

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await api.survey.getAll();
        const list = Array.isArray(res) ? res : ((res as any)?.items || []);
        setSurveys(list);
        if (list.length > 0) {
          const defaultId = surveyIdParam || list[0].id.toString();
          setSelectedId(defaultId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadList();
  }, [surveyIdParam]);

  useEffect(() => {
    if (!selectedId) return;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.survey.getAnalytics(parseInt(selectedId));
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedId]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/surveys">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              So'rovnoma Analitikasi & Natijalari
            </h1>
            <p className="text-sm text-slate-500">
              Umumiy qatnashuv statistikasi, yo'nalishlar taqsimoti va baholar tahlili
            </p>
          </div>
        </div>

        {/* Survey Switcher */}
        {surveys.length > 0 && (
          <div className="w-full sm:w-80">
            <select
              className="w-full p-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id.toString()}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">Analitika yuklanmoqda...</div>
      ) : !analytics ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">
          Ma'lumot topilmadi
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-600 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Jami Qatnashuvchilar</span>
              <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                {analytics.total_responses}
              </div>
              <p className="text-xs text-slate-500">Topshirilgan anketalar va testlar</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">So'rovnoma Turi</span>
              <div className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {analytics.survey.type.replace('_', ' ')}
              </div>
              <p className="text-xs text-slate-500">Auditoriya: {analytics.survey.target_role}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Xolislik & Maxfiylik</span>
              <div className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                {analytics.survey.is_anonymous ? 'To\'liq Anonim' : 'Identifikatsiyalangan'}
              </div>
              <p className="text-xs text-slate-500">
                {analytics.survey.is_anonymous ? 'Foydalanuvchi shaxsi berkitilgan' : 'O\'quvchi profili bilan bog\'langan'}
              </p>
            </div>
          </div>

          {/* Dimension Breakdown (For Career / Interest Tests) */}
          {analytics.dimensions && analytics.dimensions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Yo'nalishlar Bo'yicha Qobiliyatlar Taqsimoti
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Qatnashuvchilarning necha foizida qaysi soha ustun chiqqanligi ko'rsatkichi
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.dimensions.map((dim) => (
                  <div key={dim.dimension_id} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: dim.color_code || '#3b82f6' }}
                        />
                        {dim.name}
                      </span>
                      <span className="font-bold text-slate-700">
                        {dim.percentage}% ({dim.primary_count} ta o'quvchi)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
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

          {/* Rating Scale Stats (For Teacher / School Evaluations) */}
          {analytics.ratings && analytics.ratings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Baholash Mezonlari Bo'yicha O'rtacha Ko'rsatkichlar
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  5 ballik shkala bo'yicha mezonlarning umumiy bahosi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {analytics.ratings.map((rate) => (
                  <div key={rate.question_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2">
                      {rate.question_text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(rate.average_rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-extrabold text-slate-900">
                        {rate.average_rating} / 5.0
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualitative Recent Feedback */}
          {analytics.recent_feedback && analytics.recent_feedback.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                  Qatnashuvchilarning Fikr va Mulohazalari
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Anketada yozib qoldirilgan ochiq takliflar
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.recent_feedback.map((fb, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                    <p className="italic font-medium">"{fb.text_answer}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(fb.created_at * 1000).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SurveyAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Yuklanmoqda...</div>}>
      <SurveyAnalyticsContent />
    </Suspense>
  );
}
