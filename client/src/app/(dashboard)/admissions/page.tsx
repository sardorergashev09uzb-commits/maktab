'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AdmissionApplication, AdmissionFunnelStats, SchoolClass } from '@/types';
import { 
  UserPlus, Search, Filter, Phone, Mail, Calendar, 
  CheckCircle2, XCircle, Clock, Award, Users, ChevronRight,
  UserCheck, AlertCircle, Sparkles, X
} from 'lucide-react';

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [stats, setStats] = useState<AdmissionFunnelStats | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected application for detail / status change
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'new',
    notes: '',
    interview_date: '',
    exam_score: '',
  });

  // Auto-enroll modal
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    school_class_id: 0,
    annual_tuition_fee: 25000000,
  });
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appRes, statsRes, classRes] = await Promise.all([
        api.admission.getAll(statusFilter !== 'all' ? { status: statusFilter } : undefined),
        api.admission.getStats(),
        api.getAll<SchoolClass>('school-class'),
      ]);

      setApplications(Array.isArray(appRes) ? appRes : ((appRes as any)?.items || []));
      setStats(statsRes);
      setClasses(classRes.items || []);
      if (classRes.items && classRes.items.length > 0) {
        setEnrollForm((prev) => ({ ...prev, school_class_id: classRes.items[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenStatusModal = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setStatusForm({
      status: app.status,
      notes: app.notes || '',
      interview_date: app.interview_date ? app.interview_date.replace(' ', 'T').substring(0, 16) : '',
      exam_score: app.exam_score ? app.exam_score.toString() : '',
    });
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      await api.admission.updateStatus(selectedApp.id, {
        status: statusForm.status,
        notes: statusForm.notes,
        interview_date: statusForm.interview_date ? statusForm.interview_date.replace('T', ' ') + ':00' : undefined,
        exam_score: statusForm.exam_score ? parseFloat(statusForm.exam_score) : undefined,
      });
      setStatusModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Statusni yangilashda xatolik');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEnrollModal = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setEnrollResult(null);
    setEnrollModalOpen(true);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setEnrolling(true);
      const res = await api.admission.enroll(
        selectedApp.id,
        enrollForm.school_class_id,
        enrollForm.annual_tuition_fee
      );
      setEnrollResult(res);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Rasmiylashtirishda xatolik yuz berdi');
    } finally {
      setEnrolling(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    const matchSearch =
      a.application_number.toLowerCase().includes(search.toLowerCase()) ||
      a.first_name.toLowerCase().includes(search.toLowerCase()) ||
      a.last_name.toLowerCase().includes(search.toLowerCase()) ||
      a.parent_phone.includes(search);
    return matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Yangi</span>;
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Bog'lanilgan</span>;
      case 'interview':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Suhbat</span>;
      case 'exam':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">Imtihon</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Qabul qilingan</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Rad etilgan</span>;
      case 'enrolled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">O'quvchi bo'lgan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-2">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Phase 7 — Admissions CRM & Qabul Voronkasi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Qabul Jarayoni & Nomzodlar</h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
            Veb-sayt va boshqa manbalardan tushgan barcha arizalar, suhbatlar, qabul qarorlari va o'quvchi qilib rasmiylashtirish (Auto-Enrollment) boshqaruvi.
          </p>
        </div>
      </div>

      {/* Funnel KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Jami Arizalar</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.total_applications}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm text-center">
            <span className="text-[11px] text-blue-600 font-semibold uppercase">Yangi</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.counts.new}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm text-center">
            <span className="text-[11px] text-amber-600 font-semibold uppercase">Suhbat</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.counts.interview}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm text-center">
            <span className="text-[11px] text-emerald-600 font-semibold uppercase">Qabul</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.counts.accepted}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-sm text-center">
            <span className="text-[11px] text-indigo-600 font-semibold uppercase">O'quvchi Bo'lgan</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{stats.counts.enrolled}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Konversiya</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.conversion_rate}%</div>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Nomzod ismi, ariza raqami yoki telefon..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'new', label: 'Yangi' },
            { id: 'interview', label: 'Suhbat' },
            { id: 'accepted', label: 'Qabul qilingan' },
            { id: 'enrolled', label: 'Rasmiylashtirilgan' },
            { id: 'rejected', label: 'Rad etilgan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">Arizalar yuklanmoqda...</div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium">Hozircha hech qanday ariza topilmadi</p>
          <p className="text-slate-400 text-xs">Landing sahifa orqali yuborilgan arizalar shu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ariza №</th>
                  <th className="py-3.5 px-4">Nomzod O'quvchi</th>
                  <th className="py-3.5 px-4">Sinf</th>
                  <th className="py-3.5 px-4">Ota-ona (Vasiy)</th>
                  <th className="py-3.5 px-4">Manba</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {app.application_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {app.first_name} {app.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.gender === 1 ? "O'g'il bola" : 'Qiz bola'} • {app.birth_date || 'Tug\'ilgan sana yo\'q'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {app.applying_grade}-sinf
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{app.parent_name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {app.parent_phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-500">
                      {app.source ? app.source.replace('_', ' ') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition"
                      >
                        Boshqarish
                      </button>

                      {app.status === 'accepted' && (
                        <button
                          onClick={() => handleOpenEnrollModal(app)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition"
                        >
                          Sinfga Biriktirish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Management Modal */}
      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Arizani Ko'rib Chiqish ({selectedApp.application_number})
                </h3>
                <p className="text-[11px] text-slate-500">{selectedApp.first_name} {selectedApp.last_name}</p>
              </div>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Ariza Holati (Pipeline Status)</label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  <option value="new">Yangi (New)</option>
                  <option value="contacted">Aloqa qilingan (Contacted)</option>
                  <option value="interview">Suhbat belgilangan (Interview)</option>
                  <option value="exam">Kirish imtihonida (Exam)</option>
                  <option value="accepted">Qabul qilingan (Accepted)</option>
                  <option value="rejected">Rad etilgan (Rejected)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Suhbat Vaqti</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={statusForm.interview_date}
                    onChange={(e) => setStatusForm({ ...statusForm, interview_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Imtihon Bali (100 dan)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Masalan: 85.5"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={statusForm.exam_score}
                    onChange={(e) => setStatusForm({ ...statusForm, exam_score: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Izoh va Eslatmalar</label>
                <textarea
                  rows={3}
                  placeholder="Suhbat natijalari, ota-ona talablari..."
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {updating ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Enrollment Modal */}
      {enrollModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  O'quvchini Sinfga Rasmiylashtirish (Auto-Enroll)
                </h3>
                <p className="text-[11px] text-slate-500">{selectedApp.first_name} {selectedApp.last_name}</p>
              </div>
              <button onClick={() => setEnrollModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrollResult ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  O'quvchi Muvaffaqiyatli Rasmiylashtirildi!
                </h4>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">O'quvchi Kodi:</span>
                    <span className="font-mono font-bold text-indigo-600">{enrollResult.student?.student_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tizim Logini:</span>
                    <span className="font-mono font-bold text-slate-800">{enrollResult.user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dastlabki Parol:</span>
                    <span className="font-mono font-bold text-slate-800">{enrollResult.user?.initial_password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biriktirilgan Sinf:</span>
                    <span className="font-bold text-slate-800">{enrollResult.class?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shartnoma Raqami:</span>
                    <span className="font-bold text-slate-800">{enrollResult.contract?.contract_number}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md hover:bg-indigo-700"
                >
                  Tushundim
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnroll} className="space-y-4">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900">
                  Ushbu amal orqali tizim avtomatik ravishda nomzodga User hisobini ochadi, sinf jurnaliga (Enrollment) qo'shadi va to'lov shartnomasini shakllantiradi.
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Biriktiriladigan Sinf *</label>
                  <select
                    required
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={enrollForm.school_class_id}
                    onChange={(e) => setEnrollForm({ ...enrollForm, school_class_id: parseInt(e.target.value) })}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade_level}-sinf)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Yillik Ta'lim Shartnomasi Summasi (so'm)</label>
                  <input
                    type="number"
                    required
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={enrollForm.annual_tuition_fee}
                    onChange={(e) => setEnrollForm({ ...enrollForm, annual_tuition_fee: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEnrollModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={enrolling}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {enrolling ? 'Rasmiylashtirilmoqda...' : 'Rasmiylashtirish (Auto-Enroll)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
