'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CmsPublicData } from '@/types';
import { 
  Sparkles, CheckCircle, ChevronDown, ChevronUp, ArrowRight, 
  Phone, Mail, MapPin, Award, BookOpen, Users, Shield, 
  Send, X, CheckCircle2, Clock, Globe, Laptop, UserCheck,
  Building2, FileText, Scale, School
} from 'lucide-react';

const iconMap: Record<string, any> = {
  BookOpen,
  Users,
  Laptop,
  Award,
  Shield,
  Globe,
  CheckCircle,
  Sparkles,
  UserCheck,
  Building2,
  FileText,
  Scale,
  School,
};

export default function PublicLandingPage() {
  const [cmsData, setCmsData] = useState<CmsPublicData | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    birth_date: '',
    gender: 1,
    applying_grade: 1,
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    previous_school: '',
  });

  useEffect(() => {
    const loadCms = async () => {
      try {
        const res = await api.cms.getPublic();
        setCmsData(res);
      } catch (err) {
        console.error('CMS maʼlumotlarini yuklashda xatolik:', err);
      }
    };
    loadCms();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.admission.apply(formData);
      setSubmittedApp(res);
    } catch (err: any) {
      alert(err.message || 'Ariza yuborishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const liveStats = cmsData?.live_stats;

  // Default educational programs fallback
  const defaultPrograms = [
    {
      title: "Boshlang'ich Ta'lim (1-4 sinf)",
      desc: `Kichik guruhlar (${liveStats?.average_class_capacity || 16} nafargacha), individual yondashuv, qiziqarli o'yin metodikalari va chet tillari.`,
      badge: "Boshlang'ich",
      countLabel: `${liveStats?.classes_by_program?.primary || 2} ta faol sinf`,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "O'rta Ta'lim (5-9 sinf)",
      desc: "Chuqurlashtirilgan matematika, fizika, informatika, ikkinchi chet tili (nemis/arab) va laboratoriya amaliyotlari.",
      badge: "Asosiy",
      countLabel: `${liveStats?.classes_by_program?.middle || 4} ta faol sinf`,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Yuqori Ta'lim & OTM (10-11 sinf)",
      desc: "IELTS 7.0+, SAT imtihonlariga maqsadli tayyorgarlik, xalqaro olimpiadalar va kasbiy yo'naltirish.",
      badge: "Bitiruvchi",
      countLabel: `${liveStats?.classes_by_program?.high || 2} ta faol sinf`,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "STEAM & IT Laboratoriyalari",
      desc: `${liveStats?.total_rooms || 10} ta jihozlangan xona, robototexnika, Python dasturlash, 3D modellashtirish va sun'iy intellekt.`,
      badge: "Innovatsiya",
      countLabel: `${liveStats?.total_subjects || 12} ta o'quv fani`,
      color: "from-amber-500 to-orange-600",
    },
  ];

  // Default advantages fallback
  const defaultAdvantages = [
    {
      icon: "BookOpen",
      title: "Cambridge & STEAM Dasturi",
      desc: "Xalqaro standartlar bo'yicha integratsiyalashgan ta'lim va chuqur amaliyot.",
    },
    {
      icon: "Users",
      title: "Oliy Toifali Ustozlar",
      desc: "Xalqaro sertifikatlarga ega, ko'p yillik tajribali mutaxassislar jamoasi.",
    },
    {
      icon: "Laptop",
      title: "Raqamli Ekotizim (ERP & LMS)",
      desc: "Ota-onalar uchun shaxsiy mobil kabinet, onlayn baholar, dars jadvali va davomat nazorati.",
    },
    {
      icon: "Award",
      title: "Rag'batlantiruvchi Coin Tizimi",
      desc: "A'lo baholar va intizom uchun maktab ichki valyutasi va qimmatbaho sovg'alar do'koni.",
    },
    {
      icon: "Shield",
      title: "24/7 Xavfsizlik & Face-ID",
      desc: "Xavfsiz yopiq hudud, video nazorat va ota-onaga bolaning kirib-chiqishi bo'yicha SMS xabarnomalar.",
    },
    {
      icon: "Globe",
      title: "3 Mahal Ovqatlanish & Transport",
      desc: "Parhezshunos nazoratidagi issiq taomlar va shahar bo'ylab qulay qatnovchi maktab avtobuslari.",
    },
  ];

  // Default FAQs fallback
  const defaultFaqs = [
    {
      question: "Maktabga qabul jarayoni qanday bosqichlardan iborat?",
      answer: "Veb-saytimiz orqali onlayn ariza qoldirasiz. Qabul komissiyasi siz bilan bog'lanib, o'quvchi bilan psixologik suhbat va fanlar bo'yicha diagnostik test kunini belgilaydi.",
    },
    {
      question: "O'qish to'lovi va to'lov muddatlari qanday tartibda amalga oshiriladi?",
      answer: "Yillik ta'lim to'lovi qulay grafik asosida oylik, choraklik yoki bir yillik (10% chegirma bilan) shaklda to'lanishi mumkin. Click, Payme yoki bank orqali qabul qilinadi.",
    },
    {
      question: "Maktabda ovqatlanish va transport xizmati bormi?",
      answer: "Ha, kuniga 3 mahal issiq va muvozanatli parhez taomlar beriladi. Shuningdek, shahar bo'ylab maxsus qulay maktab avtobuslari (shuttle bus) xizmat ko'rsatadi.",
    },
    {
      question: "Chet tillari qaysi darajada o'rgatiladi?",
      answer: "Ingliz tili Cambridge dasturi asosida har kuni o'rgatiladi va bitiruvchilar IELTS 7.0+ darajaga ega bo'ladilar. 5-sinfdan boshlab ikkinchi xorijiy til sifatida nemis yoki arab tili tanlanadi.",
    },
    {
      question: "Qanday sport va ijodiy to'garaklar faoliyat yuritadi?",
      answer: "Robototexnika, Mental arifmetika, Dasturlash, Suzish, Shaxmat, Taekvondo va Teatr studiyasi kabi 20 dan ortiq to'garaklar maktab dasturiga to'liq kiritilgan.",
    },
  ];

  // Dynamic values bound to backend
  const schoolName = cmsData?.settings?.school_name || "Al-Xorazmiy Xalqaro Xususiy Maktabi";
  const schoolPhone = cmsData?.settings?.school_phone || "+998 71 200 00 20";
  const schoolEmail = cmsData?.settings?.school_email || "info@al-xorazmiy.uz";
  const schoolAddress = cmsData?.settings?.school_address || "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi, 14-uy";
  const academicYear = liveStats?.academic_year || "2026/2027";

  const heroSection = cmsData?.sections?.hero;
  const aboutSection = cmsData?.sections?.about;
  const programsSection = cmsData?.sections?.programs;
  const advantagesSection = cmsData?.sections?.advantages;
  const missionSection = cmsData?.sections?.mission;
  const ctaSection = cmsData?.sections?.cta;

  const heroBadge = `${academicYear} O'quv Yili Uchun Qabul Ochiq`;
  const heroTitle = heroSection?.title || "Farzandingizning Yorqin Kelajagi Shu Yerdan Boshlanadi";
  const heroSubtitle = heroSection?.subtitle || "Xalqaro standartlar, Cambridge dasturi, STEAM laboratoriyalari, mantiqiy diagnostika va kuchli axloqiy tarbiya uyg'unligi.";

  // Dynamic real-time quick metrics directly counted from DB
  const metricsToDisplay = [
    { 
      value: liveStats?.total_students !== undefined ? `${liveStats.total_students} nafar` : "500+", 
      label: "Faol O'quvchilar", 
      color: "text-indigo-600",
      sub: "Barcha sinflarda"
    },
    { 
      value: liveStats?.total_teachers !== undefined ? `${liveStats.total_teachers} nafar` : "45+", 
      label: "Oliy Toifali Ustozlar", 
      color: "text-violet-600",
      sub: "Xalqaro malakali"
    },
    { 
      value: liveStats?.total_classes !== undefined ? `${liveStats.total_classes} ta sinf` : "8 ta sinf", 
      label: "Akademik Sinflar", 
      color: "text-emerald-600",
      sub: "Kichik guruhlar"
    },
    { 
      value: liveStats?.total_subjects !== undefined ? `${liveStats.total_subjects} ta fan` : "12 ta fan", 
      label: "O'quv Fanlari & Lablar", 
      color: "text-amber-500",
      sub: "STEAM & IT dasturi"
    },
  ];

  // Dynamic programs
  const programsToDisplay = Array.isArray(programsSection?.content) && programsSection.content.length > 0
    ? programsSection.content
    : defaultPrograms;

  // Dynamic advantages
  const advantagesToDisplay = Array.isArray(advantagesSection?.content) && advantagesSection.content.length > 0
    ? advantagesSection.content
    : defaultAdvantages;

  // Dynamic FAQs
  const faqsToDisplay = cmsData?.faqs && cmsData.faqs.length > 0 ? cmsData.faqs : defaultFaqs;

  // Dynamic mission points
  const missionPoints = Array.isArray(missionSection?.content?.points)
    ? missionSection.content.points
    : [
        `Har bir sinfda o'rtacha ko'pi bilan ${liveStats?.average_class_capacity || 16} nafargacha o'quvchi`,
        `${liveStats?.total_subjects || 12} ta chuqurlashtirilgan va xalqaro fan dasturlari`,
        `${liveStats?.total_rooms || 10} ta ixtisoslashtirilgan zamonaviy o'quv xonasi va laboratoriya`,
        "Psixolog va tyutorlar tomonidan muntazam monitoring",
      ];

  const missionRatio = liveStats?.teacher_student_ratio || missionSection?.content?.ratio || "1 : 8";
  const missionRatioLabel = missionSection?.content?.ratio_label || "Ustoz / O'quvchi hisoblangan nisbati";
  const missionTarget = missionSection?.content?.target || "IELTS 7.5+";
  const missionTargetLabel = missionSection?.content?.target_label || "Bitiruvchilar o'rtacha bali";

  // Dynamic available grades for enrollment
  const availableGrades = liveStats?.grades && liveStats.grades.length > 0
    ? liveStats.grades
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              {schoolName.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-tight">
                {schoolName}
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold tracking-wider uppercase block">
                Xususiy Maktab Platformasi
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-indigo-600 transition">Biz haqimizda</a>
            <a href="#programs" className="hover:text-indigo-600 transition">Ta'lim Dasturlari</a>
            <a href="#infrastructure" className="hover:text-indigo-600 transition">Ko'rsatkichlar</a>
            <a href="#advantages" className="hover:text-indigo-600 transition">Afzalliklar</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
            <a href="#contact" className="hover:text-indigo-600 transition">Aloqa</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Onlayn Ariza
            </button>

            <Link href="/login">
              <button className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-xs text-slate-700 transition">
                Tizimga Kirish (ERP)
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight md:leading-tight">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-200 transition duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Onlayn Ariza Qoldirish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <Link href="/surveys" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition">
                Kasbiy Qobiliyat Testi (Diagnostika)
              </button>
            </Link>
          </div>

          {/* Quick Real-Time Metrics Banner */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {metricsToDisplay.map((m: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center hover:border-indigo-200 transition duration-200">
                <div className={`text-3xl font-extrabold ${m.color || 'text-indigo-600'}`}>{m.value}</div>
                <div className="text-xs text-slate-800 font-bold mt-1">{m.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Popular Subjects Pills */}
          {liveStats?.popular_subjects && liveStats.popular_subjects.length > 0 && (
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-xs text-slate-400 font-medium mr-1">O'qitiladigan asosiy fanlar:</span>
              {liveStats.popular_subjects.map((sub, idx) => (
                <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Live School Infrastructure Bar */}
      <section id="infrastructure" className="bg-white border-y border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-extrabold text-slate-900">{liveStats?.total_rooms || 10} ta</div>
                <div className="text-[11px] text-slate-500">Xona & Laboratoriyalar</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-extrabold text-slate-900">{missionRatio}</div>
                <div className="text-[11px] text-slate-500">Ustoz / O'quvchi nisbati</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-extrabold text-slate-900">{liveStats?.total_applications || 3} ta</div>
                <div className="text-[11px] text-slate-500">Qabul arizalari</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-extrabold text-slate-900">Maks. {liveStats?.average_class_capacity || 16} nafar</div>
                <div className="text-[11px] text-slate-500">Sinfdagi o'quvchi limiti</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> {aboutSection?.subtitle || "Biz haqimizda"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {aboutSection?.title || "Har Bir Bolaning Shaxsiy Iqtidorini Kashf Etamiz"}
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                {typeof aboutSection?.content === 'string'
                  ? aboutSection.content
                  : "Bizning xususiy maktabimiz zamonaviy ta'lim metodikasi va chuqurlashtirilgan bilimlarni qulay muhitda birlashtiradi. Biz faqat dars berish bilan cheklanmay, o'quvchilarda tanqidiy fikrlash, erkin muloqot, jamoaviy yetakchilik va odob-axloq fazilatlarini shakllantiramiz."}
              </p>
              <ul className="space-y-3 pt-2 text-sm text-slate-700">
                {missionPoints.map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-tr from-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <h3 className="text-2xl font-bold">{missionSection?.title || "Maktabimizning Bosh Maqsadi"}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  {missionSection?.subtitle || "Dunyoning nufuzli oliygohlarida erkin raqobatlasha oladigan, milliy qadriyatlarga sodiq, intellektual salohiyatli barkamol avlodni tarbiyalash."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 relative z-10">
                <div>
                  <div className="text-2xl font-black">{missionRatio}</div>
                  <div className="text-xs text-indigo-200 mt-0.5">{missionRatioLabel}</div>
                </div>
                <div>
                  <div className="text-2xl font-black">{missionTarget}</div>
                  <div className="text-xs text-indigo-200 mt-0.5">{missionTargetLabel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Programs Section */}
      <section id="programs" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Ta'lim Bosqichlari
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {programsSection?.title || "Bizning Ta'lim Dasturlarimiz"}
            </h2>
            <p className="text-slate-500 text-sm">
              {programsSection?.subtitle || "Har bir yosh davriga moslashtirilgan o'quv dasturlari va fanlar integratsiyasi"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programsToDisplay.map((p: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50">
                      {p.badge}
                    </span>
                    {p.countLabel && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {p.countLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Batafsil ma'lumot</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Qulayliklar & Imkoniyatlar
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {advantagesSection?.title || "Nega Ota-onalar Bizni Tanlaydilar?"}
            </h2>
            <p className="text-slate-500 text-sm">
              {advantagesSection?.subtitle || "Farzandingizning sog'lom, xavfsiz va sermahsul ta'lim olishi uchun barcha sharoitlar"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantagesToDisplay.map((adv: any, idx: number) => {
              const Icon = typeof adv.icon === 'string' && iconMap[adv.icon] ? iconMap[adv.icon] : BookOpen;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition duration-200 space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{adv.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{adv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Savol-Javoblar
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Ko'p Beriladigan Savollar
            </h2>
            <p className="text-slate-500 text-sm">
              Qabul va maktab tartib-qoidalari bo'yicha eng muhim ma'lumotlar
            </p>
          </div>

          <div className="space-y-3">
            {faqsToDisplay.map((faq: any, idx: number) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-slate-800 hover:text-indigo-600 transition"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section id="contact" className="py-16 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {ctaSection?.title || "Farzandingiz Kelajagiga Bugunoq Poydevor Qo'ying!"}
          </h2>
          <p className="text-indigo-100 text-sm max-w-xl mx-auto">
            {ctaSection?.subtitle || "Ariza qoldiring, qabul komissiyamiz siz bilan bog'lanib, bepul konsultatsiya va maktab bo'ylab ekskursiya tashkil qiladi."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-white text-indigo-700 hover:bg-blue-50 font-bold text-sm shadow-xl transition"
            >
              {ctaSection?.content?.button_text || "Hozirroq Ariza Qoldirish"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-black">
                {schoolName.charAt(0)}
              </div>
              <span className="uppercase">{schoolName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Xususiy maktab ta'limini raqamlashtiruvchi zamonaviy ERP va LMS boshqaruv ekotizimi.
            </p>
            {cmsData?.settings?.director_name && (
              <p className="text-slate-500 text-[11px]">
                Direktor: <span className="text-slate-300 font-medium">{cmsData.settings.director_name}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Aloqa Ma'lumotlari</h4>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400 shrink-0" /> {schoolPhone}</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400 shrink-0" /> {schoolEmail}</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400 shrink-0" /> {schoolAddress}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Ish Vaqti</h4>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400 shrink-0" /> Dushanba - Shanba</p>
            <p className="text-slate-400">08:30 dan 18:00 gacha</p>
            <p className="text-slate-400">Yakshanba: Dam olish kuni</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Tizimga O'tish</h4>
            <Link href="/login" className="block text-indigo-400 hover:text-indigo-300">
              O'qituvchi & Admin Kirish →
            </Link>
            <Link href="/portal/student" className="block text-indigo-400 hover:text-indigo-300">
              O'quvchi Kabineti →
            </Link>
            <Link href="/portal/parent" className="block text-indigo-400 hover:text-indigo-300">
              Ota-ona Portali →
            </Link>
            <Link href="/cms" className="block text-slate-500 hover:text-slate-400 text-[11px] pt-1">
              Sayt Boshqaruvi (CMS) ⚙️
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-center text-slate-500">
          © {new Date().getFullYear()} {schoolName}. Barcha huquqlar himoyalangan.
        </div>
      </footer>

      {/* Online Admission Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Maktabga Qabul Arizasi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ma'lumotlarni to'ldiring, qabul komissiyasi siz bilan bog'lanadi</p>
              </div>
              <button onClick={() => { setModalOpen(false); setSubmittedApp(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {submittedApp ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">Arizangiz Muvaffaqiyatli Qabul Qilindi!</h4>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 max-w-xs mx-auto text-xs space-y-1.5">
                  <div className="text-slate-500">Ariza Raqamingiz:</div>
                  <div className="text-lg font-black text-indigo-700">{submittedApp.application_number}</div>
                  <div className="text-[11px] text-slate-400">Nomzod: {submittedApp.first_name} {submittedApp.last_name}</div>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  24 soat ichida qabul komissiyamiz ko'rsatilgan telefon raqamingizga qo'ng'iroq qilib, suhbat vaqti haqida ma'lumot beradi.
                </p>
                <button
                  onClick={() => { setModalOpen(false); setSubmittedApp(null); }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md hover:bg-indigo-700 transition"
                >
                  Tushundim
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                {/* O'quvchi ma'lumotlari */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-800 text-sm block border-b pb-1">
                    1. O'quvchi (Nomzod) Ma'lumotlari
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Ismi *</label>
                      <input
                        required
                        placeholder="Masalan: Sardor"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Familiyasi *</label>
                      <input
                        required
                        placeholder="Masalan: Qodirov"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Tug'ilgan sanasi *</label>
                      <input
                        required
                        type="date"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Jinsi</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: parseInt(e.target.value) })}
                      >
                        <option value={1}>O'g'il bola</option>
                        <option value={2}>Qiz bola</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Qaysi sinfga? *</label>
                      <select
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        value={formData.applying_grade}
                        onChange={(e) => setFormData({ ...formData, applying_grade: parseInt(e.target.value) })}
                      >
                        {availableGrades.map((g: number) => (
                          <option key={g} value={g}>{g}-sinf</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ota-ona ma'lumotlari */}
                <div className="space-y-3 pt-2">
                  <span className="font-bold text-slate-800 text-sm block border-b pb-1">
                    2. Ota-ona (Vasiy) Ma'lumotlari
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Ota-onaning F.I.O. *</label>
                      <input
                        required
                        placeholder="Masalan: Aliyev Botir"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.parent_name}
                        onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Telefon Raqam *</label>
                      <input
                        required
                        placeholder="+998 90 123 45 67"
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={formData.parent_phone}
                        onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Yashash Manzili</label>
                    <input
                      placeholder="Toshkent sh., Yunusobod tumani..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Yuborilmoqda...' : 'Arizani Yuborish'}
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
