'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Exam, Question, ExamAttempt } from '@/types';
import Link from 'next/link';
import { Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ArrowLeft, Award, Sigma, Home } from 'lucide-react';

export default function ExamTakerPage() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get('exam_id');

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | ''>(examIdParam ? Number(examIdParam) : '');
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // { questionId: selectedOptionId }

  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(false);

  // Load available exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.getAll<Exam>('exam');
        setExams(res.items || []);
        if (res.items?.length && !selectedExamId) {
          setSelectedExamId(res.items[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, answers, attempt]);

  const handleStartExam = async () => {
    if (!selectedExamId) return;

    try {
      setLoading(true);
      const res = await api.exam.start(Number(selectedExamId));
      setAttempt(res.attempt);
      setExam(res.exam);
      setQuestions(res.exam?.questions || []);
      setTimeLeft((res.exam?.duration_minutes || 45) * 60);
      setIsStarted(true);
      setIsFinished(false);
      setCurrentIndex(0);
      setAnswers({});
    } catch (err: any) {
      alert(err.message || 'Imtihonni boshlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitExam = async () => {
    if (!attempt) return;

    try {
      setLoading(true);
      const answerPayload = Object.entries(answers).map(([qId, optId]) => ({
        question_id: Number(qId),
        selected_option_id: optId,
      }));

      const res = await api.examAttempt.submit(attempt.id, answerPayload);
      setResultAttempt(res.attempt);
      setIsFinished(true);
    } catch (err: any) {
      alert(err.message || 'Topshirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Imtihon Simulyatori</h1>
          <p className="text-slate-500 text-sm">O'quvchi interaktiv test topshirish tizimi va tezkor natija</p>
        </div>
      </div>

      {/* Screen 1: Exam Selection & Start */}
      {!isStarted && !isFinished && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Award size={32} />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Imtihonni tanlang</h2>
            <p className="text-xs text-slate-500">
              Test boshlanishi bilanoq teskari vaqt sanog'i ishga tushadi. Vaqt tugagach test avtomatik topshiriladi.
            </p>

            <div className="pt-4">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.duration_minutes} daqiqa, O'tish: {ex.passing_score} ball)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={handleStartExam}
              disabled={loading || !selectedExamId}
              className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Yuklanmoqda...' : 'Imtihonni boshlash'}
            </button>
          </div>
        </div>
      )}

      {/* Screen 2: Exam In Progress */}
      {isStarted && !isFinished && currentQ && (
        <div className="space-y-4">
          {/* Top Bar with Timer */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">
                Savol {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {currentQ.points} ball
              </span>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold ${
                timeLeft < 300
                  ? 'bg-rose-50 text-rose-700 animate-pulse border border-rose-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Clock size={16} />
              <span>Qolgan vaqt: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                {currentIndex + 1}. {currentQ.question_text}
              </h2>

              {currentQ.formula && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-base text-indigo-900 flex items-center gap-3">
                  <Sigma size={20} className="text-indigo-600" />
                  <span>{currentQ.formula}</span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected = answers[currentQ.id] === opt.id;

                return (
                  <label
                    key={opt.id || oIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 flex-1">{opt.option_text}</span>
                  </label>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              >
                <ArrowLeft size={16} /> Oldingi
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Keyingi <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm"
                >
                  <CheckCircle2 size={16} /> Imtihonni yakunlash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Instant Scorecard Result */}
      {isFinished && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 text-center">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto ${
              resultAttempt?.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {resultAttempt?.passed ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              {resultAttempt?.passed ? 'Tabriklaymiz, Imtihondan o\'tdingiz!' : 'Afsuski, yetarli ball to\'planmadi'}
            </h2>
            <p className="text-sm text-slate-500">{exam?.title}</p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500">To'plangan ball</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">{resultAttempt?.total_score || 0}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500">O'tish bali</p>
              <p className="text-2xl font-extrabold text-slate-700 mt-1">{exam?.passing_score || 60}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500">Holat</p>
              <p
                className={`text-lg font-bold mt-1.5 ${
                  resultAttempt?.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {resultAttempt?.passed ? 'O\'tdi' : 'O\'tmadi'}
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50"
            >
              Imtihonlar ro'yxatiga qaytish
            </Link>
            <button
              onClick={() => {
                setIsStarted(false);
                setIsFinished(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700"
            >
              Qaytadan topshirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
