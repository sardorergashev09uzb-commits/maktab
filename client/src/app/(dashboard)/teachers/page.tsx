'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Teacher, Subject, SchoolClass, AcademicYear } from '@/types';
import {
  Plus, Search, Trash2, RefreshCw, X, GraduationCap,
  ChevronDown, ChevronUp, BookOpen, Link2, School,
} from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expanded panel
  const [expandedTeacher, setExpandedTeacher] = useState<number | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  // Assign modal
  const [assignModal, setAssignModal] = useState<{ teacherId: number; teacherName: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ subject_id: '', school_class_id: '' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '+998',
    email: '',
    specialization: '',
    education: 'Oliy',
    experience_years: 5,
    employee_code: '',
  });

  const loadData = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { expand: 'user', 'per-page': '200' };
      if (query) params.q = query;

      const [teachersRes, subjectsRes, classesRes, yearsRes] = await Promise.all([
        api.getAll<Teacher>('teacher', params),
        api.getAll<Subject>('subject', { 'per-page': '200' }),
        api.getAll<SchoolClass>('school-class', { 'per-page': '200' }),
        api.getAll<AcademicYear>('academic-year'),
      ]);

      setTeachers(teachersRes.items || []);
      setSubjects(subjectsRes.items || []);
      setClasses(classesRes.items || []);
      setAcademicYears(yearsRes.items || []);
    } catch (err: any) {
      setError(err.message || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadTeacherPanel = async (teacherId: number) => {
    setPanelLoading(true);
    try {
      const res = await api.getAll<any>('teacher-assignment', {
        teacher_id: String(teacherId),
        expand: 'subject,schoolClass',
      });
      setTeacherAssignments(res.items || []);
    } catch {
      setTeacherAssignments([]);
    } finally {
      setPanelLoading(false);
    }
  };

  const toggleExpand = (teacherId: number) => {
    if (expandedTeacher === teacherId) {
      setExpandedTeacher(null);
    } else {
      setExpandedTeacher(teacherId);
      loadTeacherPanel(teacherId);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadData(searchQuery); };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.specialization) {
      alert('Ism, familiya va mutaxassislik kiritilishi shart!'); return;
    }
    try {
      setSubmitting(true);
      await api.create('teacher', formData);
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '', phone: '+998', email: '', specialization: '', education: 'Oliy', experience_years: 5, employee_code: '' });
      loadData(searchQuery);
    } catch (err: any) {
      alert(err.message || "O'qituvchi qo'shishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}"ni o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('teacher', id);
      setTeachers(prev => prev.filter(t => t.id !== id));
      if (expandedTeacher === id) setExpandedTeacher(null);
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  const handleAssign = async () => {
    if (!assignModal || !assignForm.subject_id || !assignForm.school_class_id) {
      alert('Fan va sinf tanlanishi shart!'); return;
    }
    const currentYear = academicYears.find(y => y.is_current) || academicYears[0];
    try {
      setSubmitting(true);
      await api.create('teacher-assignment', {
        teacher_id: assignModal.teacherId,
        subject_id: Number(assignForm.subject_id),
        school_class_id: Number(assignForm.school_class_id),
        academic_year_id: currentYear?.id,
      });
      setAssignForm({ subject_id: '', school_class_id: '' });
      loadTeacherPanel(assignModal.teacherId);
    } catch (err: any) {
      alert(err.message || 'Biriktirishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (id: number) => {
    if (!confirm("Bu biriktirishni o'chirmoqchimisiz?")) return;
    await api.remove('teacher-assignment', id);
    if (expandedTeacher) loadTeacherPanel(expandedTeacher);
  };

  const filteredTeachers = teachers.filter(t => {
    const name = t.user ? `${t.user.first_name} ${t.user.last_name}` : '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.employee_code || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">O'qituvchilar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {teachers.length} nafar pedagog
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">O'qituvchilarni boshqarish, fan va sinflarga biriktirish</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadData(searchQuery)} className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95">
            <Plus size={18} /> O'qituvchi qo'shish
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="F.I.Sh, mutaxassislik yoki kod..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </form>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); loadData(''); }} className="text-xs text-slate-500 hover:text-slate-800 underline">
              Tozalash
            </button>
          )}
        </div>

        {/* Teachers List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Ma'lumotlar yuklanmoqda...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-700">O'qituvchilar topilmadi</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTeachers.map(teacher => {
              const fullName = teacher.user
                ? `${teacher.user.first_name} ${teacher.user.last_name}`
                : (teacher as any).full_name || "Noma'lum";
              const isExpanded = expandedTeacher === teacher.id;

              return (
                <div key={teacher.id}>
                  <div className="flex items-center gap-4 p-4 hover:bg-slate-50/60 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 font-bold text-indigo-700 text-sm">
                      {teacher.user?.first_name?.[0]}{teacher.user?.last_name?.[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{fullName}</span>
                        {teacher.employee_code && (
                          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{teacher.employee_code}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {teacher.specialization && (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{teacher.specialization}</span>
                        )}
                        {teacher.experience_years && <span>{teacher.experience_years} yil tajriba</span>}
                        {teacher.user?.phone && <span>{teacher.user.phone}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setAssignModal({ teacherId: teacher.id, teacherName: fullName }); if (expandedTeacher !== teacher.id) toggleExpand(teacher.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-100 transition-colors"
                      >
                        <Link2 size={12} /> Fan+Sinf biriktir
                      </button>
                      <button onClick={() => toggleExpand(teacher.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <button onClick={() => handleDeleteTeacher(teacher.id, fullName)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: assignments */}
                  {isExpanded && (
                    <div className="bg-slate-50/60 border-t border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <BookOpen size={13} className="text-amber-500" /> Fan-Sinf Biriktirishlar
                        </p>
                        <button
                          onClick={() => setAssignModal({ teacherId: teacher.id, teacherName: fullName })}
                          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium"
                        >
                          <Plus size={11} /> Biriktirish
                        </button>
                      </div>
                      {panelLoading ? (
                        <p className="text-xs text-slate-400 py-2">Yuklanmoqda...</p>
                      ) : teacherAssignments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">Hech qanday fan-sinf biriktirilmagan</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {teacherAssignments.map((asgn: any) => (
                            <div key={asgn.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs group">
                              <span className="font-semibold text-amber-700">{asgn.subject?.name}</span>
                              <span className="text-slate-400">—</span>
                              <span className="text-slate-600 flex items-center gap-1">
                                <School size={10} /> {asgn.schoolClass?.name}
                              </span>
                              <button onClick={() => handleRemoveAssignment(asgn.id)}
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 ml-0.5">
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi O'qituvchi Qo'shish</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ism *</label>
                  <input type="text" required value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Dilnoza" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Familiya *</label>
                  <input type="text" required value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Umarova" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mutaxassisligi (Fan) *</label>
                  <input type="text" required value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Masalan: Matematika, Fizika" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tajriba (yillarda)</label>
                  <input type="number" min={0} value={formData.experience_years}
                    onChange={e => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefon raqam</label>
                  <input type="text" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+998901234567" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ma'lumoti</label>
                  <select value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="Oliy">Oliy (Bakalavr)</option>
                    <option value="Magistr">Magistr</option>
                    <option value="Fan Nomzodi / PhD">Fan Nomzodi / PhD</option>
                    <option value="O'rta maxsus">O'rta maxsus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Xodim ID Kodi (Ixtiyoriy)</label>
                <input type="text" value={formData.employee_code}
                  onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="Bo'sh qoldirilsa avtomatik yaratiladi" />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50">
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Fan+Sinf — {assignModal.teacherName}</h3>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fan *</label>
                <select value={assignForm.subject_id} onChange={e => setAssignForm({ ...assignForm, subject_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Fan tanlang...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf *</label>
                <select value={assignForm.school_class_id} onChange={e => setAssignForm({ ...assignForm, school_class_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Sinf tanlang...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade_level}-sinf)</option>)}
                </select>
              </div>
              <button onClick={handleAssign} disabled={submitting}
                className="w-full py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50">
                {submitting ? "Qo'shilmoqda..." : '+ Biriktirish'}
              </button>
            </div>

            {/* Current */}
            {teacherAssignments.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Hozirgi biriktirishlar:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {teacherAssignments.map((asgn: any) => (
                    <div key={asgn.id} className="flex items-center justify-between text-xs group">
                      <span className="text-slate-600">
                        <span className="font-semibold text-amber-700">{asgn.subject?.name}</span>
                        {' → '}<span className="text-slate-500 flex items-center gap-1 inline-flex"><School size={10} /> {asgn.schoolClass?.name}</span>
                      </span>
                      <button onClick={() => handleRemoveAssignment(asgn.id)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
