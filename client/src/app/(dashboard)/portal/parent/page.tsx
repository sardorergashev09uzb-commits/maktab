'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ParentPortalData, Student } from '@/types';
import {
  Users,
  UserCheck,
  Award,
  CreditCard,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ParentPortalPage() {
  const [data, setData] = useState<ParentPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const loadData = async (childId?: number) => {
    try {
      setLoading(true);
      const res = await api.portal.parent();
      setData(res);
      if (res.children?.length && !selectedChildId) {
        setSelectedChildId(res.children[0].id);
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

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Ota-ona portali yuklanmoqda...
      </div>
    );
  }

  const currentChild = data.children?.find((c) => c.id === selectedChildId) || data.selected_child;

  const totalDebt = Number(data.total_debt) || 0;

  return (
    <div className="space-y-6">
      {/* Header with Child Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ota-ona Shaxsiy Kabineti</h1>
            <p className="text-slate-500 text-sm">
              Farzandlaringizning o'qish jarayoni, davomati, baholari va to'lovlarini onlayn nazorat qiling
            </p>
          </div>

          {/* Child Switcher */}
          {data.children && data.children.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start">
              <span className="text-xs font-bold text-slate-500 px-2">Farzand:</span>
              {data.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedChildId === child.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {child.user?.first_name || `O'quvchi #${child.id}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Child Info Banner */}
        {currentChild && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base">
                {currentChild.user ? `${currentChild.user.first_name[0]}${currentChild.user.last_name[0]}` : 'F'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {currentChild.user ? `${currentChild.user.first_name} ${currentChild.user.last_name}` : 'Farzand'}
                </h2>
                <p className="text-xs text-indigo-700 font-medium">
                  ID: {currentChild.student_code} | Sinf: {currentChild.enrollments?.[0]?.schoolClass?.name || '1-A sinf'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Qarzdorlik holati</span>
                <span className={totalDebt > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {totalDebt > 0 ? `${totalDebt.toLocaleString()} so'm qarz` : 'Qarzdorlik yo\'q'}
                </span>
              </div>
              <Link
                href="/invoices"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              >
                To'lov qilish
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Attendance & Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Qatnashgan darslar</p>
            <p className="text-xl font-bold text-emerald-600">{data.attendance_stats?.present || 0} ta</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Kechikishlar</p>
            <p className="text-xl font-bold text-amber-600">{data.attendance_stats?.late || 0} ta</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Qoldirilgan (Sababsiz)</p>
            <p className="text-xl font-bold text-rose-600">{data.attendance_stats?.absent || 0} ta</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Sababli qoldirilgan</p>
            <p className="text-xl font-bold text-blue-600">{data.attendance_stats?.excused || 0} ta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Grades (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award size={18} className="text-indigo-600" />
                Oxirgi Qo'yilgan Baholar Kundaligi
              </h2>
              <Link href="/grades" className="text-xs font-semibold text-indigo-600 hover:underline">
                To'liq jurnal
              </Link>
            </div>

            {data.recent_grades?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Hali baholar mavjud emas.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recent_grades?.map((g) => (
                  <div key={g.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{g.lesson?.subject?.name || 'Fan'}</p>
                      <p className="text-xs text-slate-400">{g.gradeCategory?.name || 'Baho turi'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        {g.score} ball
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                O'qish To'lovlari va Invoyslar
              </h2>
              <Link href="/invoices" className="text-xs font-semibold text-indigo-600 hover:underline">
                Barcha to'lovlar
              </Link>
            </div>

            {data.invoices?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                Invoyslar topilmadi.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.invoices?.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{inv.title}</p>
                      <p className="text-[11px] text-slate-400">Muddati: {inv.due_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-slate-900">
                        {Number(inv.amount).toLocaleString()} so'm
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 30
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {inv.status === 30 ? 'To\'langan' : 'To\'lanmagan'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Announcements for Parents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bell size={18} className="text-amber-500" />
                Ota-onalar Uchun E'lonlar
              </h2>
            </div>

            {data.announcements?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-lg">
                E'lonlar mavjud emas.
              </p>
            ) : (
              <div className="space-y-3">
                {data.announcements?.map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
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
