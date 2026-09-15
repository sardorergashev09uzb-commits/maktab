'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DirectorKpi, AcademicKpi, FinancialAnalytics } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Users,
  GraduationCap,
  School,
  Award,
  CreditCard,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Phone,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'director' | 'academic' | 'finance'>('director');
  const [directorData, setDirectorData] = useState<DirectorKpi | null>(null);
  const [academicData, setAcademicData] = useState<AcademicKpi | null>(null);
  const [financeData, setFinanceData] = useState<FinancialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dir, acad, fin] = await Promise.all([
        api.analytics.getDirector(),
        api.analytics.getAcademic(),
        api.analytics.getFinance(),
      ]);
      setDirectorData(dir);
      setAcademicData(acad);
      setFinanceData(fin);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = (type: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const exportUrl = api.analytics.getExportUrl(type);
    // Download via direct link or fetch
    fetch(exportUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maktab_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert('Eksport qilishda xatolik yuz berdi: ' + err.message));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Katta Analitika & KPI Paneli</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maktab Boshqaruv Markazi</h1>
          <p className="text-slate-500 text-sm mt-1">
            Direktor, Zavuch va Buxgalteriya uchun umumiy tahlillar, KPI ko'rsatkichlari va eksport hisobotlari
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Hisobot Eksport (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            title="Chop etish / PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Chop etish</span>
          </button>
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

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 print:hidden">
        <button
          onClick={() => setActiveTab('director')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all relative ${
            activeTab === 'director'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Boshqaruv (Direktor KPI)</span>
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all relative ${
            activeTab === 'academic'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>O'quv Ishlari (Zavuch Analitika)</span>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all relative ${
            activeTab === 'finance'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Moliya & Kassa (Buxgalteriya)</span>
        </button>
      </div>

      {/* 1. DIRECTOR DASHBOARD */}
      {activeTab === 'director' && directorData && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">O'quvchilar Soni</span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {directorData.overview.total_students}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Quvvat to'lishi:</span>
                <span className="font-bold text-slate-700">{directorData.overview.capacity_rate}%</span>
                <span className="text-slate-400">({directorData.overview.total_capacity} o'rin)</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">O'qituvchilar</span>
                <GraduationCap className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {directorData.overview.total_teachers}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>Faol sinflar:</span> <span className="font-bold text-slate-700">{directorData.overview.total_classes} ta</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Davomat Ko'rsatkichi</span>
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {directorData.attendance.overall_rate}%
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>Qatnashdi:</span> <span className="font-bold text-emerald-600">{directorData.attendance.present}</span>,
                <span className="ml-1">Sababsiz:</span> <span className="font-bold text-rose-600">{directorData.attendance.absent}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">O'rtacha GPA / Baho</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {directorData.academic.average_score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Maktab umumiy o'zlashtirishi</span>
              </div>
            </div>
          </div>

          {/* Attendance & Finance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Davomat Taqsimoti (Umumiy)</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">Qatnashganlar ({directorData.attendance.present})</span>
                    <span className="text-slate-600">
                      {directorData.attendance.total > 0 ? Math.round((directorData.attendance.present / directorData.attendance.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${directorData.attendance.total > 0 ? (directorData.attendance.present / directorData.attendance.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700">Kechikkanlar ({directorData.attendance.late})</span>
                    <span className="text-slate-600">
                      {directorData.attendance.total > 0 ? Math.round((directorData.attendance.late / directorData.attendance.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${directorData.attendance.total > 0 ? (directorData.attendance.late / directorData.attendance.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-700">Kelmadi / Sababsiz ({directorData.attendance.absent})</span>
                    <span className="text-slate-600">
                      {directorData.attendance.total > 0 ? Math.round((directorData.attendance.absent / directorData.attendance.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${directorData.attendance.total > 0 ? (directorData.attendance.absent / directorData.attendance.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-700">Sababli ({directorData.attendance.excused})</span>
                    <span className="text-slate-600">
                      {directorData.attendance.total > 0 ? Math.round((directorData.attendance.excused / directorData.attendance.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${directorData.attendance.total > 0 ? (directorData.attendance.excused / directorData.attendance.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Moliyaviy Holat (Tushum va Undiruv)</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Jami Shartnomalar</div>
                  <div className="text-lg font-bold text-slate-900">
                    {directorData.finance.total_contracted.toLocaleString()} UZS
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
                  <div className="text-xs text-emerald-700 mb-1">Undirilgan Summa</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {directorData.finance.total_collected.toLocaleString()} UZS
                  </div>
                </div>

                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100">
                  <div className="text-xs text-rose-700 mb-1">Qoldiq Qarzdorlik</div>
                  <div className="text-lg font-bold text-rose-800">
                    {directorData.finance.total_debt.toLocaleString()} UZS
                  </div>
                </div>

                <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100">
                  <div className="text-xs text-indigo-700 mb-1">Undiruv Foizi</div>
                  <div className="text-lg font-bold text-indigo-800">
                    {directorData.finance.collection_rate}%
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1.5 flex justify-between">
                  <span>Moliya yig'ilishi darajasi</span>
                  <span className="font-bold text-slate-800">{directorData.finance.collection_rate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(directorData.finance.collection_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Top Lists & Admissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Classes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-600" />
                <span>O'zlashtirish Bo'yicha Yetakchi Sinflar</span>
              </h3>

              {directorData.academic.top_classes.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-6">Baholangan sinflar mavjud emas</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {directorData.academic.top_classes.map((c, idx) => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.grade_level}-sinf bosqichi</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-base">{c.avg_score}</span>
                        <span className="text-xs text-slate-400"> ball</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admission Funnel Snapshot */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Qabul Voronkasi (Admissions Funnel)</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500">Jami Arizalar</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{directorData.admissions.total_applications}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xs text-blue-700">Imtihon/Suhbat</div>
                  <div className="text-xl font-bold text-blue-900 mt-1">
                    {directorData.admissions.counts.interview + directorData.admissions.counts.exam}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-xs text-emerald-700">Qabul Qilingan</div>
                  <div className="text-xl font-bold text-emerald-900 mt-1">{directorData.admissions.counts.enrolled}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Qabul konversiya samaradorligi</span>
                  <span className="font-bold text-emerald-600">{directorData.admissions.conversion_rate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(directorData.admissions.conversion_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACADEMIC (ZAVUCH) DASHBOARD */}
      {activeTab === 'academic' && academicData && (
        <div className="space-y-6">
          {/* Zavuch KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Baho O'zgartirishlar</span>
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {academicData.overrides.total}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>Tasdiqlangan:</span> <span className="font-bold text-emerald-600">{academicData.overrides.approved} ta</span> ({academicData.overrides.approval_rate}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Imtihon Natijalari</span>
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {academicData.exams.passing_rate}%
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>O'rtacha ball:</span> <span className="font-bold text-slate-800">{academicData.exams.average_score}</span> / 100
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">O'tkazilgan Imtihonlar</span>
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {academicData.exams.total_exams}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                <span>Topshirilgan urinishlar:</span> <span className="font-bold text-slate-800">{academicData.exams.total_attempts} ta</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase">Kutilayotgan Ruxsatlar</span>
                <Clock className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-rose-600">
                {academicData.overrides.pending}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Zavuch tasdig'ini kutayotgan baholar
              </div>
            </div>
          </div>

          {/* Teacher Grading & Career Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher Activity Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>O'qituvchilar Baholash Faolligi</span>
              </h3>

              {academicData.teachers_activity.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-6">O'qituvchilar faoliyati hali qayd etilmagan</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {academicData.teachers_activity.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-bold text-slate-800">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.specialization || 'Fani kiritilmagan'}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                          {t.grades_count} ta baho
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">{t.lessons_count} ta dars o'tilgan</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Career Guidance Balance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>O'quvchilar Kasbiy Qiziqishlari Balansi</span>
              </h3>

              {academicData.career_distribution.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-6">So'rovnoma natijalari hali to'planmagan</div>
              ) : (
                <div className="space-y-3">
                  {academicData.career_distribution.map((d) => (
                    <div key={d.id}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">{d.name}</span>
                        <span className="text-slate-500">{d.count} nafar o'quvchi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min((d.count / Math.max(...academicData.career_distribution.map(x => x.count || 1))) * 100, 100)}%`,
                            backgroundColor: d.color_code || '#6366f1'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. FINANCE (BUXGALTER) DASHBOARD */}
      {activeTab === 'finance' && financeData && (
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>To'lov Usullari Bo'yicha Tushum</span>
              </h3>

              <div className="space-y-3">
                {financeData.payment_methods.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-6">To'lovlar jurnali bo'sh</div>
                ) : (
                  financeData.payment_methods.map((m) => (
                    <div key={m.payment_method} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-800 capitalize text-sm">{m.payment_method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-sm">
                          {m.total.toLocaleString()} UZS
                        </div>
                        <div className="text-xs text-slate-400">{m.count} ta tranzaksiya</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Export & Actions Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-2xl text-white shadow-lg space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Kassa & Audit</span>
                <h3 className="text-xl font-black mt-1">Buxgalteriya Hisobotlari</h3>
                <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                  Barcha o'quvchilar, qarzdorliklar, to'langan cheklar va shartnomalarni 1-tugma orqali Excel (CSV) formatida yuklab oling.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleExportCsv('debtors')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span>Qarzdorlar Ro'yxati (CSV)</span>
                  </div>
                  <Download className="w-4 h-4 text-indigo-200" />
                </button>

                <button
                  onClick={() => handleExportCsv('students')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-300" />
                    <span>O'quvchilar Bosh Ro'yxati (CSV)</span>
                  </div>
                  <Download className="w-4 h-4 text-indigo-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Debtors List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Qarzdor O'quvchilar Reytingi (Top Debtors)</h3>
                <p className="text-xs text-slate-400 mt-0.5">To'lov muddati o'tgan yoki to'lanmagan o'qish to'lovlari</p>
              </div>
              <button
                onClick={() => handleExportCsv('debtors')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">O'quvchi</th>
                    <th className="py-3 px-4">Sinf</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Muddati O'tgan</th>
                    <th className="py-3 px-4 text-right">Qarz Miqdori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {financeData.debtors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        Qarzdor o'quvchilar mavjud emas
                      </td>
                    </tr>
                  ) : (
                    financeData.debtors.map((d) => (
                      <tr key={d.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{d.student_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">#{d.student_code}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold">
                            {d.class_name || 'Sinfi yo\'q'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {d.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{d.phone}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-xs font-bold">
                            {d.overdue_invoices} ta invoys
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600 text-base">
                          {d.total_debt.toLocaleString()} UZS
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="text-lg text-slate-900">Hisobot Eksport Markazi</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Kerakli ma'lumotlar toifasini tanlang. Fayl Microsoft Excel va Google Sheets bilan mos keluvchi UTF-8 CSV formatida yuklanadi.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => { handleExportCsv('students'); setExportModalOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>O'quvchilar Bosh Qaydnomasi</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { handleExportCsv('attendance'); setExportModalOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Umumiy Davomat Jurnali</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { handleExportCsv('grades'); setExportModalOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Baholar va Reytinglar Arxivi</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { handleExportCsv('debtors'); setExportModalOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Qarzdorlar va To'lovlar Hisoboti</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { handleExportCsv('exams'); setExportModalOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-semibold transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Imtihon va Test Natijalari</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
