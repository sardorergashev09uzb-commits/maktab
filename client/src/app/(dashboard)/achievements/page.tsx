'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Achievement, Certificate, Student } from '@/types';
import { Award, FileText, CheckCircle2, XCircle, Plus, Star, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canManage = roles.some((r) =>
    ['super_admin', 'admin', 'director', 'teacher'].includes(r)
  );
  const isStudent = roles.includes('student');

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates'>('badges');
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [uploadCertModalOpen, setUploadCertModalOpen] = useState(false);

  const [awardForm, setAwardForm] = useState({
    student_id: 0,
    achievement_id: 0,
    notes: 'A\'lo ko\'rsatkichlar uchun taqdim etildi',
  });

  const [certForm, setCertForm] = useState({
    student_id: 0,
    title: '',
    issuer: '',
    issue_date: new Date().toISOString().split('T')[0],
    verification_code: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [achRes, certRes, sRes] = await Promise.all([
        api.getAll<Achievement>('achievement'),
        api.getAll<Certificate>('certificate'),
        api.getAll<Student>('student'),
      ]);

      setAchievements(achRes.items || []);
      setCertificates(certRes.items || []);
      setStudents(sRes.items || []);

      if (sRes.items?.length && !awardForm.student_id) {
        setAwardForm((prev) => ({ ...prev, student_id: sRes.items[0].id }));
        setCertForm((prev) => ({ ...prev, student_id: sRes.items[0].id }));
      }
      if (achRes.items?.length && !awardForm.achievement_id) {
        setAwardForm((prev) => ({ ...prev, achievement_id: achRes.items[0].id }));
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

  const handleAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.achievement.award(awardForm);
      alert('Yutuq o\'quvchiga muvaffaqiyatli taqdim etildi va tegishli coin bonusi berildi!');
      setAwardModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Yutuq berishda xatolik yuz berdi');
    }
  };

  const handleVerifyCert = async (certId: number, status: number) => {
    const notes = status === 20 ? 'Asl nusxasi tasdiqlandi' : 'Talablarga javob bermaydi';
    try {
      await api.certificate.verify(certId, status, notes);
      alert(status === 20 ? 'Sertifikat tasdiqlandi va o\'quvchiga 50 coin berildi!' : 'Sertifikat rad etildi.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Verifikatsiya qilishda xatolik yuz berdi');
    }
  };

  const handleUploadCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.create('certificate', certForm);
      alert('Sertifikat muvaffaqiyatli ro\'yxatga olindi va tekshiruvga yuborildi!');
      setUploadCertModalOpen(false);
      setCertForm({
        student_id: students[0]?.id || 0,
        title: '',
        issuer: '',
        issue_date: new Date().toISOString().split('T')[0],
        verification_code: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Sertifikat qo\'shishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yutuqlar & Sertifikatlar</h1>
          <p className="text-slate-500 text-sm">
            O'quvchilarning akademik, ijodiy va sport yutuqlari, diplom va sertifikatlarni tasdiqlash markazi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'badges'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={15} />
              Nishonlar & Yutuqlar
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'certificates'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={15} />
              Sertifikatlar Verifikatsiyasi
            </button>
          </div>

          {canManage && (
            activeTab === 'badges' ? (
              <button
                onClick={() => setAwardModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition font-medium text-xs shadow-sm"
              >
                <Plus size={16} />
                Yutuq topshirish
              </button>
            ) : (
              <button
                onClick={() => setUploadCertModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg transition font-medium text-xs shadow-sm"
              >
                <Plus size={16} />
                Sertifikat qo'shish
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Yuklanmoqda...
        </div>
      ) : activeTab === 'badges' ? (
        /* BADGES / ACHIEVEMENTS TAB */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-200 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Trophy size={24} />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center gap-1">
                    <Sparkles size={12} />
                    +{ach.coin_reward} coin
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {ach.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{ach.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {ach.studentAchievements?.length || 0} o'quvchi erishgan
                </span>
                <button
                  onClick={() => {
                    setAwardForm((prev) => ({ ...prev, achievement_id: ach.id }));
                    setAwardModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  O'quvchiga berish &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* CERTIFICATES VERIFICATION TAB */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Sertifikatlar va Diplomlar Ro'yxati</h2>
            <span className="text-xs font-medium text-slate-500">{certificates.length} ta sertifikat</span>
          </div>

          {certificates.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Sertifikatlar mavjud emas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Sertifikat Nomi</th>
                    <th className="py-3 px-4">O'quvchi</th>
                    <th className="py-3 px-4">Tashkilot / Manba</th>
                    <th className="py-3 px-4">Berilgan Sana</th>
                    <th className="py-3 px-4">Tekshiruv Kodi</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-right">Verifikatsiya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {certificates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {c.student?.user ? `${c.student.user.first_name} ${c.student.user.last_name}` : `O'quvchi #${c.student_id}`}
                        </p>
                        <p className="text-xs text-slate-400">{c.student?.student_code}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {c.issuer}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {c.issue_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-700">
                        {c.verification_code || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.status === 20
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.status === 30
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.status === 20 ? 'Tasdiqlangan' : c.status === 30 ? 'Rad etilgan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status === 10 ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleVerifyCert(c.id, 20)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                            >
                              <CheckCircle2 size={13} />
                              Tasdiqlash
                            </button>
                            <button
                              onClick={() => handleVerifyCert(c.id, 30)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1.5 rounded-lg transition"
                            >
                              <XCircle size={13} />
                              Rad etish
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Ko'rib chiqilgan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Award Modal */}
      {awardModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              O'quvchiga Yutuq / Nishon berish
            </h3>

            <form onSubmit={handleAwardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quvchi</label>
                <select
                  required
                  value={awardForm.student_id}
                  onChange={(e) => setAwardForm({ ...awardForm, student_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user ? `${s.user.first_name} ${s.user.last_name} (${s.student_code})` : `O'quvchi #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nishon / Yutuq</label>
                <select
                  required
                  value={awardForm.achievement_id}
                  onChange={(e) => setAwardForm({ ...awardForm, achievement_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {achievements.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} (+{a.coin_reward} coin)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Izoh / Asos</label>
                <input
                  type="text"
                  required
                  value={awardForm.notes}
                  onChange={(e) => setAwardForm({ ...awardForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Yutuqni biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Certificate Modal */}
      {uploadCertModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" />
              Yangi Sertifikat qo'shish
            </h3>

            <form onSubmit={handleUploadCertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">O'quvchi</label>
                <select
                  required
                  value={certForm.student_id}
                  onChange={(e) => setCertForm({ ...certForm, student_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user ? `${s.user.first_name} ${s.user.last_name} (${s.student_code})` : `O'quvchi #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sertifikat / Diplom Nomi</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  placeholder="Masalan: Respublika Fizika Olimpiadasi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bergan Tashkilot</label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="Masalan: Ta'lim Vazirligi"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Berilgan Sana</label>
                  <input
                    type="date"
                    required
                    value={certForm.issue_date}
                    onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tekshiruv Kodi</label>
                  <input
                    type="text"
                    value={certForm.verification_code}
                    onChange={(e) => setCertForm({ ...certForm, verification_code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadCertModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  Tekshiruvga yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
