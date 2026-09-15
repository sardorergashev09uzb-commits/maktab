'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  DoorOpen,
  TrendingUp,
  UserCheck,
  Award,
  CreditCard,
  UserPlus,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart3,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  total_rooms: number;
  total_parents: number;
  total_applications: number;
  capacity_rate: number;
  teacher_student_ratio: string;
  average_class_capacity: number;
  academic_year: string;
  attendance_rate: number;
  attendance_present: number;
  attendance_late: number;
  attendance_absent: number;
  average_score: number;
  total_collected: number;
  total_debt: number;
  collection_rate: number;
  top_classes: Array<{ id: number; name: string; grade_level: number; avg_score: number; student_count: number }>;
  top_subjects: Array<{ id: number; name: string; code: string; avg_score: number }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    total_subjects: 0,
    total_rooms: 0,
    total_parents: 0,
    total_applications: 0,
    capacity_rate: 0,
    teacher_student_ratio: '1 : 1',
    average_class_capacity: 0,
    academic_year: '2026/2027',
    attendance_rate: 100,
    attendance_present: 0,
    attendance_late: 0,
    attendance_absent: 0,
    average_score: 0,
    total_collected: 0,
    total_debt: 0,
    collection_rate: 0,
    top_classes: [],
    top_subjects: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both director analytics (detailed internal KPI) and public cms stats
      const [directorRes, publicRes] = await Promise.allSettled([
        api.analytics.getDirector(),
        api.cms.getPublic(),
      ]);

      const dir = directorRes.status === 'fulfilled' ? directorRes.value : null;
      const pub = publicRes.status === 'fulfilled' ? publicRes.value?.live_stats : null;

      const totalStudents = dir?.overview?.total_students ?? pub?.total_students ?? 0;
      const totalTeachers = dir?.overview?.total_teachers ?? pub?.total_teachers ?? 0;
      const totalClasses = dir?.overview?.total_classes ?? pub?.total_classes ?? 0;
      const totalSubjects = pub?.total_subjects ?? 0;
      const totalRooms = pub?.total_rooms ?? 0;
      const totalParents = pub?.total_parents ?? 0;
      const totalApplications = pub?.total_applications ?? dir?.admissions?.total_applications ?? 0;
      const ratio = pub?.teacher_student_ratio || (totalTeachers > 0 ? `1 : ${Math.round(totalStudents / totalTeachers)}` : '1 : 1');
      const capacityRate = dir?.overview?.capacity_rate ?? 0;
      const avgCapacity = pub?.average_class_capacity ?? 25;
      const academicYear = pub?.academic_year ?? '2026/2027';

      setStats({
        total_students: totalStudents,
        total_teachers: totalTeachers,
        total_classes: totalClasses,
        total_subjects: totalSubjects,
        total_rooms: totalRooms,
        total_parents: totalParents,
        total_applications: totalApplications,
        capacity_rate: capacityRate,
        teacher_student_ratio: ratio,
        average_class_capacity: avgCapacity,
        academic_year: academicYear,
        attendance_rate: dir?.attendance?.overall_rate ?? 100,
        attendance_present: dir?.attendance?.present ?? 0,
        attendance_late: dir?.attendance?.late ?? 0,
        attendance_absent: dir?.attendance?.absent ?? 0,
        average_score: dir?.academic?.average_score ?? 0,
        total_collected: dir?.finance?.total_collected ?? 0,
        total_debt: dir?.finance?.total_debt ?? 0,
        collection_rate: dir?.finance?.collection_rate ?? 0,
        top_classes: dir?.academic?.top_classes || [],
        top_subjects: dir?.academic?.top_subjects || [],
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayString = new Intl.DateTimeFormat('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-100 flex items-center gap-1.5 border border-white/20">
                <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
                {stats.academic_year} O'quv Yili
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-medium text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Tizim faol & Sinxron
              </span>
              <span className="px-3 py-1 bg-indigo-500/30 rounded-full text-xs text-indigo-200">
                {todayString}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Xush kelibsiz, {user?.first_name || 'Hurmatli Admin'}!
            </h1>
            <p className="text-indigo-200 mt-2 text-sm sm:text-base max-w-2xl font-light">
              Maktab boshqaruv markazidagi real vaqt statistikasi, akademik natijalar va operatsion hisobotlar.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-sm font-medium backdrop-blur-sm border border-white/15 transition-all shadow-sm"
              title="Ma'lumotlarni qayta yuklash"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Yangilash</span>
            </button>
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-950/20"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Katta KPI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <Link
          href="/students"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jami O'quvchilar</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats.total_students.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-slate-500">nafar</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Barcha faol sinflar kesimida
            </p>
          </div>
        </Link>

        {/* Total Teachers */}
        <Link
          href="/teachers"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">O'qituvchilar</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats.total_teachers.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-slate-500">pedagog</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Nisbat: <strong className="text-slate-700">{stats.teacher_student_ratio}</strong>
            </p>
          </div>
        </Link>

        {/* Active Classes */}
        <Link
          href="/classes"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <School className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faol Sinflar</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats.total_classes.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-slate-500">ta sinf</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              O'rtacha sig'im: <strong className="text-slate-700">{stats.average_class_capacity} o'rin</strong>
            </p>
          </div>
        </Link>

        {/* Subjects & Labs */}
        <Link
          href="/subjects"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fanlar Ro'yxati</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats.total_subjects.toLocaleString()}
              </h3>
              <span className="text-xs font-medium text-slate-500">ta fan</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Laboratoriya & Xonalar: <strong className="text-slate-700">{stats.total_rooms} ta</strong>
            </p>
          </div>
        </Link>
      </div>

      {/* Operational Highlights (Attendance, Admissions, Capacity, Academic) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900">Davomat Holati</h2>
              </div>
              <Link href="/attendance" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                Batafsil <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.attendance_rate}%</span>
              <span className="text-xs text-emerald-600 font-medium">umumiy qatnashuv</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.attendance_rate, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Qatnashdi</span>
                <span className="text-base font-bold text-emerald-600">{stats.attendance_present}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Kechikdi</span>
                <span className="text-base font-bold text-amber-600">{stats.attendance_late}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Kelmadi</span>
                <span className="text-base font-bold text-rose-600">{stats.attendance_absent}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Dars jurnallari orqali avtomat hisoblanadi.
          </p>
        </div>

        {/* Admissions & CRM Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900">Qabul & Onlayn Ariza</h2>
              </div>
              <Link href="/admissions" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                CRM Ochish <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.total_applications}</span>
              <span className="text-xs text-blue-600 font-medium">ta yangi ariza tushgan</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Ro'yxatdan o'tgan ota-onalar:</span>
                <strong className="text-slate-900">{stats.total_parents} nafar</strong>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Maktab sig'im darajasi:</span>
                <strong className="text-slate-900">{stats.capacity_rate}% band</strong>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Bo'sh o'rinlar monitoringi:</span>
                <strong className="text-emerald-600 font-semibold">Qabul ochiq</strong>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Landing page orqali topshirilgan barcha arizalar integratsiyasi.
          </p>
        </div>

        {/* Academic GPA & Top Results */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900">O'zlashtirish & GPA</h2>
              </div>
              <Link href="/grades" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                Baholar <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats.average_score > 0 ? stats.average_score : '—'}
              </span>
              <span className="text-xs text-purple-600 font-medium">o'rtacha maktab bali (100 dan)</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Faol baholash siyosati:</span>
                <strong className="text-indigo-600">48 soatlik muddat</strong>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Imtihonlar & Nazoratlar:</span>
                <strong className="text-slate-900">Faol rejimda</strong>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Katta analitika:</span>
                <Link href="/analytics" className="text-indigo-600 hover:underline font-semibold">
                  Tahlillarni ko'rish
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Choraklik va oraliq baholar asosida avtomatik hisoblanadi.
          </p>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Tezkor Amallar va Bo'limlar</h2>
          <span className="text-xs text-slate-500">Asosiy boshqaruv havolalari</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            href="/students"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">O'quvchilar</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Ro'yxat & qabul</span>
          </Link>

          <Link
            href="/teachers"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">O'qituvchilar</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Tarkib & yuklama</span>
          </Link>

          <Link
            href="/schedule"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Dars Jadvali</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Haftalik reja</span>
          </Link>

          <Link
            href="/attendance"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Davomat</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Elektron jurnal</span>
          </Link>

          <Link
            href="/grades"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Baholash</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Ballar & audit</span>
          </Link>

          <Link
            href="/analytics"
            className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">KPI Analitika</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Direktor paneli</span>
          </Link>
        </div>
      </div>

      {/* Infrastructure & Overview Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes & Grades overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Maktab Sinflari & Bosqichlar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Faol o'quv dasturi bo'yicha</p>
            </div>
            <Link href="/classes" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Barchasini ko'rish →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1-4
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Boshlang'ich Ta'lim</h4>
                  <p className="text-xs text-slate-500">Kembrij va Milliy dastur uyg'unligi</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                Faol
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  5-9
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">O'rta Maktab</h4>
                  <p className="text-xs text-slate-500">Chuqurlashtirilgan fanlar & STEAM</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                Faol
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  10-11
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Yuqori Maktab & IELTS</h4>
                  <p className="text-xs text-slate-500">Universitetlarga tayyorgarlik va kasbga yo'naltirish</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                Faol
              </span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Facilities */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Maktab Infratuzilmasi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Xonalar, jihozlar va resurslar holati</p>
            </div>
            <Link href="/rooms" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Xonalar →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <DoorOpen className="w-4 h-4 text-indigo-600" />
                <span>O'quv xonalari & Lab</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.total_rooms} ta</span>
              <p className="text-[11px] text-slate-500 mt-1">Interaktiv doskalar bilan</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>O'quv Fanlari</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.total_subjects} ta</span>
              <p className="text-[11px] text-slate-500 mt-1">Davlat & xalqaro standart</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Ustoz/O'quvchi nisbati</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.teacher_student_ratio}</span>
              <p className="text-[11px] text-slate-500 mt-1">Individual yondashuv</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>O'quv Yili</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{stats.academic_year}</span>
              <p className="text-[11px] text-slate-500 mt-1">Joriy faol yil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
