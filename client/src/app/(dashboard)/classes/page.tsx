'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SchoolClass, Room, AcademicYear, Teacher, Student, Subject } from '@/types';
import {
  Plus, Search, Trash2, RefreshCw, X, School, Users, DoorOpen, Calendar,
  UserCheck, ChevronDown, ChevronUp, BookOpen, Link2, UserPlus,
} from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'primary' | 'middle' | 'high'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [teacherModal, setTeacherModal] = useState<{ classId: number; className: string } | null>(null);
  const [enrollModal, setEnrollModal] = useState<{ classId: number; className: string; yearId: number } | null>(null);
  const [assignModal, setAssignModal] = useState<{ classId: number; className: string; yearId: number } | null>(null);

  // Panel data
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    grade_level: 1,
    section: 'A',
    room_id: '',
    capacity: 25,
    academic_year_id: '',
  });

  // Teacher assign form
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Enrollment form
  const [enrollStudentId, setEnrollStudentId] = useState('');

  // Teacher-subject assignment form
  const [assignForm, setAssignForm] = useState({ teacher_id: '', subject_id: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesRes, roomsRes, yearsRes, teachersRes, studentsRes, subjectsRes] = await Promise.all([
        api.getAll<SchoolClass>('school-class', { expand: 'academicYear,room,classTeacher.user', 'per-page': '200' }),
        api.getAll<Room>('room'),
        api.getAll<AcademicYear>('academic-year'),
        api.getAll<Teacher>('teacher', { expand: 'user', 'per-page': '200' }),
        api.getAll<Student>('student', { expand: 'user', 'per-page': '500' }),
        api.getAll<Subject>('subject', { 'per-page': '200' }),
      ]);

      setClasses(classesRes.items || []);
      setRooms(roomsRes.items || []);
      setSubjects(subjectsRes.items || []);
      setTeachers(teachersRes.items || []);
      setStudents(studentsRes.items || []);

      const years = yearsRes.items || [];
      setAcademicYears(years);

      const currentYear = years.find(y => y.is_current) || years[0];
      if (currentYear) {
        setFormData(prev => ({ ...prev, academic_year_id: String(currentYear.id) }));
      }
    } catch (err: any) {
      setError(err.message || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadClassPanel = async (classId: number) => {
    setPanelLoading(true);
    try {
      const [enrollRes, assignRes] = await Promise.all([
        api.getAll<any>('enrollment', { school_class_id: String(classId), expand: 'student.user' }),
        api.getAll<any>('teacher-assignment', { school_class_id: String(classId), expand: 'teacher.user,subject' }),
      ]);
      setClassStudents(enrollRes.items || []);
      setClassAssignments(assignRes.items || []);
    } catch {
      setClassStudents([]);
      setClassAssignments([]);
    } finally {
      setPanelLoading(false);
    }
  };

  const toggleExpand = (classId: number) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      loadClassPanel(classId);
    }
  };

  // Create class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) { alert('Sinf nomi kiritilishi shart!'); return; }
    try {
      setSubmitting(true);
      const payload: any = {
        name: formData.name,
        grade_level: Number(formData.grade_level),
        section: formData.section,
        capacity: Number(formData.capacity),
        status: 10,
      };
      if (formData.room_id) payload.room_id = Number(formData.room_id);
      if (formData.academic_year_id) payload.academic_year_id = Number(formData.academic_year_id);
      await api.create('school-class', payload);
      setIsCreateModalOpen(false);
      setFormData(prev => ({ name: '', grade_level: 1, section: 'A', room_id: '', capacity: 25, academic_year_id: prev.academic_year_id }));
      loadData();
    } catch (err: any) {
      alert(err.message || 'Sinf yaratishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  // Set class teacher
  const handleSetTeacher = async () => {
    if (!teacherModal || !selectedTeacherId) { alert("O'qituvchi tanlang!"); return; }
    try {
      setSubmitting(true);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://sardorbek.alwaysdata.net/v1'}/school-class/${teacherModal.classId}/set-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ teacher_id: Number(selectedTeacherId) }),
      });
      setTeacherModal(null);
      setSelectedTeacherId('');
      loadData();
      if (expandedClass) loadClassPanel(expandedClass);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Enroll student
  const handleEnroll = async () => {
    if (!enrollModal || !enrollStudentId) { alert("O'quvchi tanlang!"); return; }
    try {
      setSubmitting(true);
      const currentYear = academicYears.find(y => y.is_current) || academicYears[0];
      await api.create('enrollment', {
        student_id: Number(enrollStudentId),
        school_class_id: enrollModal.classId,
        academic_year_id: enrollModal.yearId || currentYear?.id,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 10,
      });
      setEnrollModal(null);
      setEnrollStudentId('');
      if (expandedClass) loadClassPanel(expandedClass);
    } catch (err: any) {
      alert(err.message || "O'quvchi biriktirishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  // Assign teacher to subject in class
  const handleAssign = async () => {
    if (!assignModal || !assignForm.teacher_id || !assignForm.subject_id) {
      alert("O'qituvchi va fan tanlanishi shart!"); return;
    }
    try {
      setSubmitting(true);
      const currentYear = academicYears.find(y => y.is_current) || academicYears[0];
      await api.create('teacher-assignment', {
        teacher_id: Number(assignForm.teacher_id),
        subject_id: Number(assignForm.subject_id),
        school_class_id: assignModal.classId,
        academic_year_id: assignModal.yearId || currentYear?.id,
      });
      setAssignForm({ teacher_id: '', subject_id: '' });
      if (expandedClass) loadClassPanel(expandedClass);
    } catch (err: any) {
      alert(err.message || "O'qituvchi biriktirishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEnrollment = async (enrollId: number) => {
    if (!confirm("O'quvchini sinfdan chiqarmoqchimisiz?")) return;
    await api.remove('enrollment', enrollId);
    if (expandedClass) loadClassPanel(expandedClass);
  };

  const handleRemoveAssignment = async (assignId: number) => {
    if (!confirm("Bu biriktirishni o'chirmoqchimisiz?")) return;
    await api.remove('teacher-assignment', assignId);
    if (expandedClass) loadClassPanel(expandedClass);
  };

  const handleDeleteClass = async (id: number, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" sinfini o'chirmoqchimisiz?`)) return;
    try {
      await api.remove('school-class', id);
      setClasses(prev => prev.filter(c => c.id !== id));
      if (expandedClass === id) setExpandedClass(null);
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik");
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (stageFilter === 'primary') return cls.grade_level >= 1 && cls.grade_level <= 4;
    if (stageFilter === 'middle') return cls.grade_level >= 5 && cls.grade_level <= 9;
    if (stageFilter === 'high') return cls.grade_level >= 10 && cls.grade_level <= 11;
    return true;
  });

  // Enrolled student IDs to exclude from enroll dropdown
  const enrolledStudentIds = classStudents.map((e: any) => e.student_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Sinflar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {classes.length} ta sinf
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Sinflarni boshqarish, o'quvchi va o'qituvchi biriktirish</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors" title="Yangilash">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Yangi sinf
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">{error}</div>}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl max-w-fit">
          {(['all', 'primary', 'middle', 'high'] as const).map(f => (
            <button key={f} onClick={() => setStageFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stageFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {f === 'all' ? `Barchasi (${classes.length})` : f === 'primary' ? "1-4 Boshlang'ich" : f === 'middle' ? "5-9 O'rta" : '10-11 Yuqori'}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Sinf nomini qidirish..."
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />
        </div>
      </div>

      {/* Classes List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Sinflar yuklanmoqda...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <School className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700">Hech qanday sinf topilmadi</p>
          <p className="text-xs text-slate-400 mt-1">Yangi sinf ochish uchun yuqoridagi tugmani bosing.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClasses.map(cls => {
            const teacherName = (cls as any).classTeacher?.user
              ? `${(cls as any).classTeacher.user.first_name} ${(cls as any).classTeacher.user.last_name}`
              : null;
            const isExpanded = expandedClass === cls.id;
            const currentYear = academicYears.find(y => y.is_current) || academicYears[0];

            return (
              <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Class Header Row */}
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-lg font-extrabold text-indigo-700">{cls.grade_level}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-slate-900">{cls.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {cls.grade_level}-bosqich
                        </span>
                        {(cls as any).room?.name && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <DoorOpen size={12} /> {(cls as any).room.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        {teacherName ? (
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <UserCheck size={12} /> {teacherName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sinf ustozi belgilanmagan</span>
                        )}
                        <span>·</span>
                        <span>{(cls as any).academicYear?.name || '—'}</span>
                        {cls.capacity && <span>· Sig'im: {cls.capacity} o'rin</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setTeacherModal({ classId: cls.id, className: cls.name }); setSelectedTeacherId(String((cls as any).class_teacher_id || '')); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors"
                      title="Sinf ustozi biriktirish"
                    >
                      <UserCheck size={13} /> Ustoz
                    </button>
                    <button
                      onClick={() => { setEnrollModal({ classId: cls.id, className: cls.name, yearId: (cls as any).academic_year_id || currentYear?.id }); toggleExpand(cls.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                      title="O'quvchi biriktirish"
                    >
                      <UserPlus size={13} /> O'quvchi
                    </button>
                    <button
                      onClick={() => { setAssignModal({ classId: cls.id, className: cls.name, yearId: (cls as any).academic_year_id || currentYear?.id }); toggleExpand(cls.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-100 transition-colors"
                      title="O'qituvchi+fan biriktirish"
                    >
                      <BookOpen size={13} /> Fan
                    </button>
                    <button onClick={() => toggleExpand(cls.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Students */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Users size={15} className="text-blue-500" />
                          O'quvchilar ({classStudents.length})
                        </h4>
                        <button
                          onClick={() => setEnrollModal({ classId: cls.id, className: cls.name, yearId: (cls as any).academic_year_id || currentYear?.id })}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Plus size={12} /> Qo'shish
                        </button>
                      </div>
                      {panelLoading ? (
                        <div className="text-xs text-slate-400 text-center py-4">Yuklanmoqda...</div>
                      ) : classStudents.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-4">Hech qanday o'quvchi biriktirilmagan</div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {classStudents.map((enr: any) => {
                            const s = enr.student;
                            const name = s?.user ? `${s.user.first_name} ${s.user.last_name}` : `O'quvchi #${enr.student_id}`;
                            return (
                              <div key={enr.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 group">
                                <span className="text-xs text-slate-700 font-medium">{name}</span>
                                <span className="text-xs text-slate-400 font-mono">{s?.student_code}</span>
                                <button onClick={() => handleRemoveEnrollment(enr.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Teacher Assignments */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <BookOpen size={15} className="text-amber-500" />
                          O'qituvchi-Fanlar ({classAssignments.length})
                        </h4>
                        <button
                          onClick={() => setAssignModal({ classId: cls.id, className: cls.name, yearId: (cls as any).academic_year_id || currentYear?.id })}
                          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium"
                        >
                          <Plus size={12} /> Biriktirish
                        </button>
                      </div>
                      {panelLoading ? (
                        <div className="text-xs text-slate-400 text-center py-4">Yuklanmoqda...</div>
                      ) : classAssignments.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-4">Hech qanday biriktirish yo'q</div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {classAssignments.map((asgn: any) => {
                            const t = asgn.teacher;
                            const tName = t?.user ? `${t.user.first_name} ${t.user.last_name}` : `#${asgn.teacher_id}`;
                            const subName = asgn.subject?.name || `Fan #${asgn.subject_id}`;
                            return (
                              <div key={asgn.id} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 group">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded truncate">{subName}</span>
                                  <span className="text-xs text-slate-500 truncate">→ {tName}</span>
                                </div>
                                <button onClick={() => handleRemoveAssignment(asgn.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-rose-500 transition-all shrink-0"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ====== MODALS ====== */}

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yangi Sinf Ochish</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Nomi *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Masalan: 3-A, 9-B, 11-A" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Bosqichi (1-11)</label>
                  <input type="number" min={1} max={11} required value={formData.grade_level}
                    onChange={e => setFormData({ ...formData, grade_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Harf / Bo'lim</label>
                  <input type="text" maxLength={5} value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    placeholder="A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Xona biriktirish</label>
                  <select value={formData.room_id} onChange={e => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">Xona tanlang...</option>
                    {rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sinf Sig'imi</label>
                  <input type="number" min={5} max={50} value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">O'quv Yili</label>
                <select value={formData.academic_year_id} onChange={e => setFormData({ ...formData, academic_year_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.name} {y.is_current ? '(Joriy)' : ''}</option>)}
                </select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50">
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Teacher Modal */}
      {teacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Sinf Ustozi — {teacherModal.className}</h3>
              <button onClick={() => setTeacherModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">O'qituvchini tanlang</label>
              <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="">— Sinf ustozi yo'q —</option>
                {teachers.map(t => {
                  const name = t.user ? `${t.user.first_name} ${t.user.last_name}` : `O'qituvchi #${t.id}`;
                  return <option key={t.id} value={t.id}>{name} {t.specialization ? `(${t.specialization})` : ''}</option>;
                })}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setTeacherModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Bekor qilish</button>
              <button onClick={handleSetTeacher} disabled={submitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50">
                {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">O'quvchi Qo'shish — {enrollModal.className}</h3>
              <button onClick={() => setEnrollModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">O'quvchini tanlang</label>
              <select value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="">O'quvchi tanlang...</option>
                {students
                  .filter(s => !enrolledStudentIds.includes(s.id))
                  .map(s => {
                    const name = s.user ? `${s.user.first_name} ${s.user.last_name}` : `O'quvchi #${s.id}`;
                    return <option key={s.id} value={s.id}>{name} ({s.student_code})</option>;
                  })}
              </select>
              <p className="text-xs text-slate-400 mt-1">* Allaqachon biriktirilgan o'quvchilar ko'rsatilmaydi</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setEnrollModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Bekor qilish</button>
              <button onClick={handleEnroll} disabled={submitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50">
                {submitting ? 'Qo\'shilmoqda...' : 'Biriktirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher+Subject Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Fan-O'qituvchi — {assignModal.className}</h3>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>

            {/* Quick add form */}
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">O'qituvchi *</label>
                <select value={assignForm.teacher_id} onChange={e => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">O'qituvchi tanlang...</option>
                  {teachers.map(t => {
                    const name = t.user ? `${t.user.first_name} ${t.user.last_name}` : `O'qituvchi #${t.id}`;
                    return <option key={t.id} value={t.id}>{name} {t.specialization ? `(${t.specialization})` : ''}</option>;
                  })}
                </select>
              </div>
              <button onClick={handleAssign} disabled={submitting}
                className="w-full py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50 transition-colors">
                {submitting ? 'Qo\'shilmoqda...' : '+ Biriktirish'}
              </button>
            </div>

            {/* Current assignments */}
            {classAssignments.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Hozirgi biriktirishlar:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {classAssignments.map((asgn: any) => {
                    const t = asgn.teacher;
                    const tName = t?.user ? `${t.user.first_name} ${t.user.last_name}` : `#${asgn.teacher_id}`;
                    return (
                      <div key={asgn.id} className="flex items-center justify-between text-xs py-0.5 group">
                        <span className="text-slate-600">
                          <span className="font-semibold text-amber-700">{asgn.subject?.name}</span> → {tName}
                        </span>
                        <button onClick={() => handleRemoveAssignment(asgn.id)}
                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
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
