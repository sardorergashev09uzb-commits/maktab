'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TeacherPortalData } from '@/types';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckSquare,
  BookOpen,
  MapPin,
  Bell,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherPortalPage() {
  const [data, setData] = useState<TeacherPortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.portal.teacher();
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
        O'qituvchi portali yuklanmoqda...
      </div>
    );
  }

  const teacherName = data.teacher?.user
    ? `${data.teacher.user.first_name} ${data.teacher.user.last_name}`
    : 'O\'qituvchi';

  return (
    <div className="space-y-6">
      {/* Teacher Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl font-black">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{teacherName}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Mutaxassislik: {data.teacher?.specialization || 'Fan o\'qituvchisi'} | Xodim kodi: {data.teacher?.employee_code || '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[11px] text-slate-300 uppercase font-bold block">Bugungi darslar</span>
            <span className="text-xl font-black text-white">{data.today_lessons?.length || 0} ta</span>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[11px] text-slate-300 uppercase font-bold block">Kutilayotgan tekshiruv</span>
            <span className="text-xl font-black text-amber-400">{data.pending_submissions?.length || 0} ta</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Pending Submissions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Lessons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Bugungi Dars Jadvali
              </h2>
              <span className="text-xs font-semibold text-slate-500">{new Date().toLocaleDateString('uz-UZ')}</span>
            </div>

            {data.today_lessons?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Bugun uchun o'tiladigan darslar jadvali yo'q.
              </p>
            ) : (
              <div className="space-y-3">
                {data.today_lessons?.map((les) => (
                  <div
                    key={les.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{les.subject?.name}</span>
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {les.schoolClass?.name || 'Sinf'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={13} className="text-slate-400" />
                          {les.start_time?.slice(0, 5)} - {les.end_time?.slice(0, 5)}
                        </span>
                        {les.room && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin size={13} />
                            {les.room.name}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Link
                        href={`/attendance`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Davomat
                      </Link>
                      <Link
                        href={`/grades`}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        Baholash
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Submissions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare size={18} className="text-amber-500" />
                Tekshirilishi Kerak Bo'lgan Vazifalar
              </h2>
              <Link href="/submissions" className="text-xs font-semibold text-indigo-600 hover:underline">
                Tekshirish paneli
              </Link>
            </div>

            {data.pending_submissions?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Barcha topshirilgan vazifalar tekshirilgan!
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.pending_submissions?.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sub.assignment?.subject?.name}</p>
                      <p className="text-xs text-slate-600 font-medium">
                        {sub.student?.user ? `${sub.student.user.first_name} ${sub.student.user.last_name}` : 'O\'quvchi'}
                      </p>
                    </div>
                    <Link
                      href="/submissions"
                      className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                    >
                      Baholash
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Classes & Announcements */}
        <div className="space-y-6">
          {/* Assigned Classes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              Biriktirilgan Sinflar
            </h2>

            {data.teacher_assignments?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Biriktirilgan darslar yo'q.
              </p>
            ) : (
              <div className="space-y-2">
                {data.teacher_assignments?.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">{ta.schoolClass?.name}</span>
                    <span className="font-medium text-slate-600">{ta.subject?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Bell size={18} className="text-indigo-600" />
              Pedagogik E'lonlar
            </h2>

            {data.announcements?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                E'lonlar mavjud emas.
              </p>
            ) : (
              <div className="space-y-3">
                {data.announcements?.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase">
                      {ann.priority}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 pt-1">{ann.title}</h3>
                    <p className="text-xs text-slate-500">{ann.content}</p>
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
