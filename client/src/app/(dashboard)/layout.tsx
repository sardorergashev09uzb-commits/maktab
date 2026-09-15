'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  DoorOpen,
  CalendarDays,
  Clock,
  UserCheck,
  Award,
  ShieldCheck,
  FileText,
  CheckSquare,
  HelpCircle,
  PlayCircle,
  Receipt,
  CreditCard,
  Coins,
  Gift,
  Bell,
  User,
  ClipboardCheck,
  UserPlus,
  Globe,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: 'Shaxsiy Portallar',
    items: [
      { name: 'O\'quvchi portali', href: '/portal/student', icon: User, roles: ['student'] },
      { name: 'Ota-ona portali', href: '/portal/parent', icon: Users, roles: ['parent'] },
      { name: 'O\'qituvchi stoli', href: '/portal/teacher', icon: GraduationCap, roles: ['teacher'] },
    ],
  },
  {
    groupTitle: 'Boshqaruv & CRM',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'director', 'zavuch', 'accountant'] },
      { name: 'Katta Analitika (KPI)', href: '/analytics', icon: BarChart3, roles: ['super_admin', 'admin', 'director', 'zavuch', 'accountant'] },
      { name: 'Qabul CRM (Admissions)', href: '/admissions', icon: UserPlus, roles: ['super_admin', 'admin', 'director'] },
      { name: 'Sayt Boshqaruvi (CMS)', href: '/cms', icon: Globe, roles: ['super_admin', 'admin', 'director'] },
    ],
  },
  {
    groupTitle: 'Akademik Baza',
    items: [
      { name: 'O\'quvchilar', href: '/students', icon: Users, roles: ['super_admin', 'admin', 'director', 'zavuch', 'accountant'] },
      { name: 'O\'qituvchilar', href: '/teachers', icon: GraduationCap, roles: ['super_admin', 'admin', 'director', 'zavuch'] },
      { name: 'Sinflar', href: '/classes', icon: School, roles: ['super_admin', 'admin', 'director', 'zavuch'] },
      { name: 'Fanlar', href: '/subjects', icon: BookOpen, roles: ['super_admin', 'admin', 'director', 'zavuch'] },
      { name: 'Xonalar', href: '/rooms', icon: DoorOpen, roles: ['super_admin', 'admin', 'director', 'zavuch'] },
      { name: 'O\'quv yili', href: '/academic-years', icon: Calendar, roles: ['super_admin', 'admin', 'director', 'zavuch'] },
    ],
  },
  {
    groupTitle: 'Darslar & Nazorat',
    items: [
      { name: 'Akademik taqvim', href: '/calendar', icon: CalendarDays, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher'] },
      { name: 'Dars jadvali', href: '/schedule', icon: Clock, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher', 'student'] },
      { name: 'Darslar', href: '/lessons', icon: BookOpen, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher'] },
      { name: 'Davomat', href: '/attendance', icon: UserCheck, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher'] },
      { name: 'Baholar & Jurnal', href: '/grades', icon: Award, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher'] },
      { name: 'Zavuch ruxsatlari', href: '/overrides', icon: ShieldCheck, roles: ['super_admin', 'admin', 'zavuch', 'teacher'] },
    ],
  },
  {
    groupTitle: 'Topshiriq & Imtihon',
    items: [
      { name: 'Topshiriqlar', href: '/assignments', icon: FileText, roles: ['super_admin', 'admin', 'zavuch', 'teacher', 'student'] },
      { name: 'Topshiriq tekshirish', href: '/submissions', icon: CheckSquare, roles: ['super_admin', 'admin', 'zavuch', 'teacher'] },
      { name: 'Savollar banki', href: '/question-bank', icon: HelpCircle, roles: ['super_admin', 'admin', 'zavuch', 'teacher'] },
      { name: 'Imtihonlar', href: '/exams', icon: Award, roles: ['super_admin', 'admin', 'zavuch', 'teacher'] },
      { name: 'Test topshirish', href: '/exam-taker', icon: PlayCircle, roles: ['student'] },
    ],
  },
  {
    groupTitle: 'Moliya & Shartnomalar',
    items: [
      { name: 'Shartnomalar', href: '/contracts', icon: FileText, roles: ['super_admin', 'admin', 'director', 'accountant'] },
      { name: 'Invoyslar & Qarz', href: '/invoices', icon: Receipt, roles: ['super_admin', 'admin', 'director', 'accountant'] },
      { name: 'To\'lovlar', href: '/payments', icon: CreditCard, roles: ['super_admin', 'admin', 'director', 'accountant'] },
    ],
  },
  {
    groupTitle: 'Gamifikatsiya & Rag\'bat',
    items: [
      { name: 'Coin Tizimi', href: '/coins', icon: Coins, roles: ['super_admin', 'admin', 'teacher', 'student'] },
      { name: 'Do\'kon & Reyting', href: '/rewards', icon: Gift, roles: ['super_admin', 'admin', 'student'] },
      { name: 'Yutuq & Sertifikat', href: '/achievements', icon: Award, roles: ['super_admin', 'admin', 'teacher', 'student'] },
    ],
  },
  {
    groupTitle: 'Tizim & Muloqot',
    items: [
      { name: 'E\'lonlar taxtasi', href: '/announcements', icon: Bell, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher', 'student', 'parent'] },
      { name: 'So\'rovnomalar', href: '/surveys', icon: ClipboardCheck, roles: ['super_admin', 'admin', 'director', 'zavuch', 'teacher', 'student', 'parent'] },
      { name: 'Audit Jurnali', href: '/audit-logs', icon: ShieldAlert, roles: ['super_admin', 'admin'] },
      { name: 'Tizim Sozlamalari', href: '/settings', icon: Settings, roles: ['super_admin', 'admin'] },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center font-medium text-slate-500">Yuklanmoqda...</div>;
  }

  const userRoles = user.roles || [];

  // Determine user primary landing page
  const getDefaultRoute = () => {
    if (userRoles.includes('student')) return '/portal/student';
    if (userRoles.includes('parent')) return '/portal/parent';
    if (userRoles.includes('teacher') && !userRoles.some(r => ['super_admin', 'admin', 'director', 'zavuch'].includes(r))) return '/portal/teacher';
    return '/dashboard';
  };

  // Filter groups according to user role
  const visibleGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.some(role => userRoles.includes(role))),
  })).filter(group => group.items.length > 0);

  // Check if current page is permitted for this user
  const allPermittedHrefs = navGroups
    .flatMap(g => g.items)
    .filter(item => item.roles.some(role => userRoles.includes(role)))
    .map(i => i.href);

  const isCurrentPageAllowed = () => {
    // Portal subpages
    if (pathname.startsWith('/portal/student') && !userRoles.includes('student') && !userRoles.includes('super_admin')) return false;
    if (pathname.startsWith('/portal/parent') && !userRoles.includes('parent') && !userRoles.includes('super_admin')) return false;
    if (pathname.startsWith('/portal/teacher') && !userRoles.includes('teacher') && !userRoles.includes('super_admin')) return false;
    if (pathname === '/dashboard' && !userRoles.some(r => ['super_admin', 'admin', 'director', 'zavuch', 'accountant'].includes(r))) return false;

    // Direct match or prefix match in permitted hrefs
    return allPermittedHrefs.some(href => pathname === href || pathname.startsWith(`${href}/`));
  };

  const hasAccess = isCurrentPageAllowed();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Barcha maydonlarni to\'ldiring');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yangi parollar bir-biriga mos kelmadi');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.auth.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setPasswordSuccess(res.message || 'Parolingiz muvaffaqiyatli yangilandi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Parolni o\'zgartirishda xatolik yuz berdi');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between">
          <Link href={getDefaultRoute()} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-indigo-200">
              M
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Maktab</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
            {userRoles[0]?.replace('_', ' ') || 'User'}
          </span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {visibleGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setPasswordError('');
              setPasswordSuccess('');
              setPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-sm"
          >
            <KeyRound size={15} className="text-indigo-600" />
            <span>Parolni o'zgartirish</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden flex">
          <div className="w-72 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  M
                </div>
                <span className="text-xl font-black text-slate-900">Maktab</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
              {visibleGroups.map((group) => (
                <div key={group.groupTitle} className="space-y-1">
                  <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {group.groupTitle}
                  </div>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-indigo-600 text-white font-semibold' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPasswordModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <KeyRound size={15} className="text-indigo-600" />
                <span>Parolni o'zgartirish</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Change Password Quick Button */}
            <button
              onClick={() => {
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordModalOpen(true);
              }}
              title="Parolni o'zgartirish"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/60"
            >
              <KeyRound size={14} className="text-indigo-600" />
              <span>Parolni o'zgartirish</span>
            </button>

            {/* User Details */}
            <div className="text-sm text-right hidden sm:block">
              <p className="font-bold text-slate-900 leading-tight">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-indigo-600 font-medium">
                {userRoles.map(r => r.replace('_', ' ')).join(', ') || 'Foydalanuvchi'}
              </p>
            </div>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || ''}
            </div>

            {/* Logout Button */}
            <button 
              onClick={logout}
              title="Chiqish"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        {/* Body Content with Role Access Guard */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {!hasAccess ? (
            <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kirish huquqi cheklangan</h2>
              <p className="text-sm text-slate-500">
                Sizning akkauntingiz (<strong>{userRoles[0] || 'rol'}</strong>) ushbu bo'limni ko'rish ruxsatiga ega emas.
              </p>
              <div className="pt-2">
                <Link
                  href={getDefaultRoute()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                >
                  Mening Bosh Sahifamga Qaytish
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Universal Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Parolni O'zgartirish</h3>
                  <p className="text-xs text-slate-400">Akkaunt xavfsizligini ta'minlash</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Amaldagi (eski) parol *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Hozirgi parolingiz"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Yangi parol *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Yangi parolni tasdiqlang *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yangi parolni qayta tering"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {passwordLoading ? 'O\'zgartirilmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

