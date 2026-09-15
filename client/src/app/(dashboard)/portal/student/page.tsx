'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { StudentPortalData } from '@/types';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  Coins,
  FileText,
  CheckCircle2,
  Bell,
  Star,
  BookOpen,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentPortalPage() {
  const [data, setData] = useState<StudentPortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.portal.student();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        O'quvchi portali yuklanmoqda...
      </div>
    );
  }

  const studentName = data.student?.user
    ? `${data.student.user.first_name} ${data.student.user.last_name}`
    : 'O\'quvchi';

  const currentClass = data.student?.enrollments?.[0]?.schoolClass?.name || 'Sinf biriktirilmagan';

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-2xl font-black">
            {data.student?.user ? `${data.student.user.first_name[0]}${data.student.user.last_name[0]}` : 'O\''}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{studentName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                {currentClass}
              </span>
            </div>
            <p className="text-indigo-200 text-sm mt-0.5 font-mono">
              O'quvchi ID: {data.student?.student_code || 'ID yo\'q'}
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[11px] text-indigo-200 uppercase font-bold block">Coin Hamyon</span>
            <span className="text-xl font-black text-amber-300 flex items-center gap-1.5 justify-center">
              <Coins size={18} />
              {data.coin_balance}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[11px] text-indigo-200 uppercase font-bold block">Yutuqlar</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 justify-center">
              <Award size={18} />
              {data.achievements?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Assignments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Lessons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Bugungi Darslar
              </h2>
              <span className="text-xs font-semibold text-slate-500">{new Date().toLocaleDateString('uz-UZ')}</span>
            </div>

            {data.today_lessons?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Bugun uchun rejalashtirilgan darslar yo'q yoki dam olish kuni.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.today_lessons?.map((les, idx) => (
                  <div
                    key={les.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{les.subject?.name || 'Fan'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{les.teacher?.user ? `${les.teacher.user.first_name} ${les.teacher.user.last_name}` : 'O\'qituvchi'}</span>
                          {les.room && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <MapPin size={12} />
                              {les.room.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {les.start_time?.slice(0, 5)} - {les.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                Topshirilishi Kerak Bo'lgan Vazifalar
              </h2>
              <Link href="/assignments" className="text-xs font-semibold text-indigo-600 hover:underline">
                Barchasi
              </Link>
            </div>

            {data.assignments?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Hozirda kutilayotgan faol uy vazifalari mavjud emas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.assignments?.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-indigo-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {a.subject?.name || 'Fan'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{a.max_score} ball</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{a.title}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={12} className="text-rose-500" />
                      Muddat: {a.due_date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Oxirgi Olingan Baholar
              </h2>
              <Link href="/grades" className="text-xs font-semibold text-indigo-600 hover:underline">
                Barcha baholar
              </Link>
            </div>

            {data.recent_grades?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Hali baholar qayd etilmagan.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {data.recent_grades?.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-center space-y-1"
                  >
                    <p className="text-xs font-semibold text-slate-600 truncate">
                      {g.lesson?.subject?.name || 'Dars'}
                    </p>
                    <p className="text-2xl font-black text-indigo-700">{g.score}</p>
                    <p className="text-[10px] text-slate-400">{g.gradeCategory?.name || 'Baho'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Achievements & Announcements */}
        <div className="space-y-6">
          {/* Achievements Gallery */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                Mening Yutuqlarim
              </h2>
              <Link href="/achievements" className="text-xs font-semibold text-indigo-600 hover:underline">
                Barchasi
              </Link>
            </div>

            {data.achievements?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Hozircha yutuqlar qo'shilmagan.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.achievements?.map((sa) => (
                  <div
                    key={sa.id}
                    className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Star size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sa.achievement?.title}</p>
                      <p className="text-[11px] text-slate-500">{sa.awarded_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* School Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bell size={18} className="text-indigo-600" />
                Maktab E'lonlari
              </h2>
              <Link href="/announcements" className="text-xs font-semibold text-indigo-600 hover:underline">
                Barchasi
              </Link>
            </div>

            {data.announcements?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Hozirda faol e'lonlar mavjud emas.
              </p>
            ) : (
              <div className="space-y-3">
                {data.announcements?.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ann.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 pt-1">{ann.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
