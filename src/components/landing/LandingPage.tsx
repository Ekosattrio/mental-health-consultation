import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { PsychologistProfile } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Star,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen,
  HelpCircle,
  ChevronDown,
  Stethoscope,
  Lock,
  HeartHandshake,
  ClipboardCheck,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onSelectBooking: (psychologistId?: string, packageId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectBooking }) => {
  const {
    psychologists,
    users,
    packages,
    reviews,
    openAuthModal,
    currentUser,
    currentRole,
    landingCms,
    showToast
  } = useApp();

  const [isBioModalOpen, setIsBioModalOpen] = useState<boolean>(false);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [selectedPackageCategory, setSelectedPackageCategory] = useState<'ALL' | 'KONSELING' | 'ASESMEN' | 'PSIKOTERAPI'>('ALL');

  // Single Doctor definition
  const soloPsychologist: PsychologistProfile = psychologists[0];
  const soloUser = users.find(u => u.id === soloPsychologist?.userId) || users.find(u => u.role === 'PSYCHOLOGIST');

  // Auth Guard helper: if guest or not logged in, route to login modal
  const requireAuth = (callback: () => void, featureName: string) => {
    if (!currentUser || currentRole === 'GUEST') {
      showToast(
        'Login Diperlukan',
        `Silakan masuk atau daftar akun terlebih dahulu untuk ${featureName}.`,
        'info'
      );
      openAuthModal('LOGIN');
      return;
    }
    callback();
  };

  const approvedReviews = reviews.filter(r => r.isApproved);
  const testimonialItems = approvedReviews.length > 0
    ? Array.from({ length: 10 }, (_, index) => approvedReviews[index % approvedReviews.length])
    : [];
  const visibleTestimonials = testimonialItems.slice(testimonialPage, testimonialPage + 3);

  useEffect(() => {
    if (testimonialItems.length <= 3 || !landingCms.sliderAutoPlay) return;
    const timer = window.setInterval(() => {
      setTestimonialPage(prev => (prev + 1) % Math.max(1, testimonialItems.length - 2));
    }, Math.max(2, landingCms.sliderIntervalSeconds) * 1000);
    return () => window.clearInterval(timer);
  }, [testimonialItems.length, landingCms.sliderAutoPlay, landingCms.sliderIntervalSeconds]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-16 pb-28 sm:pb-36 lg:pb-44">
        {/* Subtle background glow effect */}
        {landingCms.heroImageUrl && <ImageWithFallback src={landingCms.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" fallback={null} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>{landingCms.heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {landingCms.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-teal-100/90 max-w-2xl leading-relaxed">
                {landingCms.heroSubtitle}
              </p>

              {/* Action Buttons with Auth Guard */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'melakukan reservasi jadwal')}
                  className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Reservasi Jadwal Konsultasi
                </button>

                <button
                  onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'mengisi pre-test dan booking konsultasi')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-amber-300" />
                  Isi Pre-Test & Booking
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-teal-700/50">
                <div>
                  <div className="text-2xl font-bold text-white">10+ Tahun</div>
                  <div className="text-xs text-teal-200/80">Pengalaman Klinis Aktif</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.9 / 5.0</div>
                  <div className="text-xs text-teal-200/80">Kepuasan Pasien Terverifikasi</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100% Privat</div>
                  <div className="text-xs text-teal-200/80">Kerahasiaan Medis Terjamin</div>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Solo Doctor Profile Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white text-slate-800 shadow-2xl border border-white/40 p-6 sm:p-7 backdrop-blur-xl transition-all space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {soloPsychologist?.isAvailableToday ? 'Praktik Mandiri Aktif' : 'Jadwal Praktik Terbatas'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    Praktik Terjadwal
                  </span>
                </div>

                {/* Doctor Identity Badge WITH DYNAMIC PHOTO */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-teal-50 border-2 border-teal-200/90 shadow-md shrink-0 overflow-hidden relative group">
                    {soloPsychologist?.avatarUrl || soloUser?.avatar ? (
                      <ImageWithFallback
                        src={soloPsychologist?.avatarUrl || soloUser?.avatar}
                        alt={soloUser?.name || 'dr. Sarah Jenkins, M.Psi.'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallback={<Stethoscope className="w-9 h-9 m-auto text-teal-700" />}
                      />
                    ) : (
                      <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center">
                        <Stethoscope className="w-9 h-9" />
                      </div>
                    )}
                    <span
                      className={`absolute bottom-1 right-1 w-3.5 h-3.5 ${soloPsychologist?.isAvailableToday === false ? 'bg-amber-500' : 'bg-emerald-500'} border-2 border-white rounded-full shadow-xs`}
                      title={soloPsychologist?.isAvailableToday === false ? 'Status: Praktik Terbatas' : 'Status: Praktik Aktif'}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold mb-1">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Psikolog Penanggung Jawab
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight truncate">
                      {soloUser?.name}
                    </h3>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">
                      {soloPsychologist?.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      SIP: {soloPsychologist?.sipNumber}
                    </p>
                  </div>
                </div>

                {/* Rating & Experience Stats */}
                <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{soloPsychologist?.rating} ★</span>
                      <span className="text-[10px] text-slate-400 block">({soloPsychologist?.reviewCount} ulasan)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{soloPsychologist?.experienceYears} Thn Praktik</span>
                    <span className="text-[10px] text-slate-400 block">{soloPsychologist?.clinicalHours}+ Jam Konseling</span>
                  </div>
                </div>

                {/* Specialties Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fokus Penanganan Utama:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {soloPsychologist?.specialties.map(spec => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Konsultasi Terjadwal</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBioModalOpen(true)}
                      className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Lihat Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'reservasi konsultasi')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Reservasi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SVG WAVE TRANSITION TO NEXT SECTION */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            className="relative block w-full h-12 sm:h-16 lg:h-22 text-slate-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C150,95 350,-35 500,50 C650,135 900,15 1200,45 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* 2. TENTANG PSIKOLOG & PENDEKATAN KLINIS (PROFIL MANDIRI 1 DOKTER) */}
      <section id="about-psychologist" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Doctor Identity & Badges */}
          <div className="lg:col-span-5 space-y-4">
            {landingCms.aboutImageUrl && <ImageWithFallback src={landingCms.aboutImageUrl} alt={landingCms.clinicName} className="aspect-video w-full rounded-lg object-cover" fallback={null} />}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 p-8 text-white flex flex-col justify-between min-h-[360px]">
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shadow-inner overflow-hidden">
                  {soloPsychologist?.avatarUrl || soloUser?.avatar ? (
                    <ImageWithFallback
                      src={soloPsychologist?.avatarUrl || soloUser?.avatar}
                      alt={soloUser?.name || 'Psikolog'}
                      className="w-full h-full object-cover"
                      fallback={<Stethoscope className="w-10 h-10" />}
                    />
                  ) : (
                    <Stethoscope className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                    Psikolog Klinis Praktik Terjadwal
                  </span>
                  <h3 className="text-2xl font-black mt-1 text-white">{soloUser?.name}</h3>
                  <p className="text-sm text-teal-100 font-medium mt-0.5">{soloPsychologist?.title}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-teal-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Profil Praktik dengan STR & SIP</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;Mendampingi setiap langkah pemulihan Anda dalam ruang konseling yang aman, hangat, dan bebas stigma.&rdquo;
                </p>
              </div>
            </div>

            {/* License & Education Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-700">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Identitas Praktik</span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold">
                  STR: {soloPsychologist?.strNumber}
                </p>
                <p className="text-[11px] text-slate-600 font-semibold">
                  SIP: {soloPsychologist?.sipNumber}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-700">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>Pendidikan Profesi</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  S1 & S2 Magister Psikologi Profesi Klinis Universitas Indonesia
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Clinical Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Mengenal Psikolog Anda
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Ruang Pulih yang Aman, Suportif, & Terarah Bersama {soloUser?.name}
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {soloPsychologist?.bio}
              </p>
            </div>

            {/* 4 Clinical Pillars */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pendekatan Terapi Klinis yang Diterapkan:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Cognitive Behavioral Therapy (CBT)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-4">
                    Mengurai pola pikir katastrofik (overthinking) dan menata perilaku adaptif.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Acceptance & Commitment (ACT)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-4">
                    Menerima emosi sulit dan bertindak selaras dengan nilai hidup personal.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Mindfulness-Based Stress Reduction</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-4">
                    Teknik grounding pernapasan dan regulasi sistem saraf saat cemas akut.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Solution-Focused Brief Therapy (SFBT)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-4">
                    Merumuskan langkah aksi praktis yang terukur untuk tantangan hidup Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'reservasi jadwal')}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Jadwalkan Konsultasi dengan {soloUser?.name.split(',')[0]}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATALOG PAKET KONSULTASI */}
      <section id="packages" className="py-20 bg-slate-100 border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-3 py-1 rounded-full">
              Pilihan Format Layanan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Katalog Layanan Psikologi Klinis
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Seluruh sesi ditangani langsung secara privat oleh {soloUser?.name}. Rincian tarif dan kalender reservasi dapat diakses setelah Anda masuk akun & melengkapi data diri pasien.
            </p>
          </div>

          {/* Category Filter Tabs */}
          {(() => {
            const activePackages = packages.filter(p => p.isActive !== false);
            const countAll = activePackages.length;
            const countKonseling = activePackages.filter(p => p.category === 'KONSELING').length;
            const countAsesmen = activePackages.filter(p => p.category === 'ASESMEN').length;
            const countPsikoterapi = activePackages.filter(p => p.category === 'PSIKOTERAPI').length;

            const displayedPackages = selectedPackageCategory === 'ALL'
              ? activePackages
              : activePackages.filter(p => p.category === selectedPackageCategory);

            return (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                  <button
                    type="button"
                    onClick={() => setSelectedPackageCategory('ALL')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPackageCategory === 'ALL'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Semua Layanan ({countAll})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPackageCategory('KONSELING')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPackageCategory === 'KONSELING'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Konseling ({countKonseling})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPackageCategory('ASESMEN')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPackageCategory === 'ASESMEN'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Paket Asesmen ({countAsesmen})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPackageCategory('PSIKOTERAPI')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedPackageCategory === 'PSIKOTERAPI'
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Psikoterapi ({countPsikoterapi})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {displayedPackages.map(pkg => {
                    const isPopular = pkg.badge === 'Paling Populer' || pkg.badge === 'Rekomendasi Klinis' || pkg.badge === 'Termasuk Laporan';
                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-3xl bg-white p-6 sm:p-7 flex flex-col justify-between border transition-all ${
                          isPopular
                            ? 'border-teal-500 shadow-xl ring-2 ring-teal-500/20'
                            : 'border-slate-200 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        {pkg.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-600 text-white tracking-wide shadow-xs whitespace-nowrap">
                            {pkg.badge}
                          </div>
                        )}

                        <div>
                          {/* Header Package */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100 shrink-0">
                              {pkg.category === 'KONSELING' && <Users className="w-5 h-5" />}
                              {pkg.category === 'ASESMEN' && <ClipboardCheck className="w-5 h-5" />}
                              {pkg.category === 'PSIKOTERAPI' && <Sparkles className="w-5 h-5" />}
                              {!pkg.category && <ClipboardCheck className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                                {pkg.category || 'LAYANAN KLINIS'}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>Durasi {pkg.durationMinutes} Menit</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-5">
                            {pkg.description}
                          </p>

                          {/* Price Display: Hidden for Guest, Shown after Sign In */}
                          {currentUser && currentRole === 'PATIENT' ? (
                            <div className="mb-5 p-4 bg-teal-50/70 rounded-2xl border border-teal-100 space-y-1">
                              <span className="text-[11px] font-bold text-teal-700 block uppercase tracking-wider">
                                Biaya Investasi Diri
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-900">
                                  Rp {pkg.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">/ {pkg.type === 'PSYCHOTHERAPY' ? 'sesi' : 'paket'}</span>
                              </div>
                              {pkg.notes && (
                                <p className="text-[11px] text-teal-800/90 mt-1 font-medium leading-relaxed bg-white/70 p-2 rounded-xl border border-teal-100">
                                  📌 {pkg.notes}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Rincian Tarif & Jadwal
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3 text-teal-700" />
                                  Masuk Akun
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                Tarif dan kuota jadwal sesi dapat diakses setelah Anda masuk akun & melengkapi data diri pasien.
                              </p>
                              {pkg.notes && (
                                <p className="text-[10px] text-slate-500 italic mt-0.5">
                                  * {pkg.notes}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Benefits list */}
                          <div className="space-y-2 mb-6">
                            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Fasilitas Layanan:</div>
                            {pkg.benefits.map((b, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span className="leading-snug">{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId, pkg.id), 'pemilihan paket')}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                            isPopular
                              ? 'bg-teal-600 hover:bg-teal-700 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {currentUser && currentRole === 'PATIENT' ? (
                            <>
                              <span>Pilih Paket Ini</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Masuk untuk Reservasi</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* 4. INFORMASI LOKASI RUANG PRAKTIK */}
      <section id="clinic-address" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Lokasi Praktik</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{landingCms.clinicName}</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Dirancang khusus dengan konsep interior peredam suara, pencahayaan alami yang menenangkan, serta fasilitas ruang tunggu privat untuk menjamin rasa nyaman dan privasi penuh pasien tatap muka.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Alamat Fisik</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {landingCms.clinicAddress}
                  </p>
                  <span className="text-[11px] text-teal-700 font-semibold mt-1 inline-block">
                    Dekat MRT Blok M / Senayan & Area Parkir Luas
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Jam Operasional Praktik</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {landingCms.clinicHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Kontak & Janji Temu</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    WhatsApp: <strong>{landingCms.clinicWhatsapp}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Telepon: <strong>{landingCms.clinicPhone}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Email: <strong>{landingCms.clinicEmail}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stylized Integrated Map Preview */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900 relative">
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">{landingCms.clinicName}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">Senopati, Jakarta Selatan</span>
              </div>

              <div className="h-84 sm:h-96 w-full bg-slate-800 relative flex items-center justify-center p-8">
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div className="relative z-10 text-center animate-bounce duration-1000">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-2xl ring-4 ring-white">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className="mt-3 px-3 py-1 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-xl border border-slate-200">
                    {landingCms.clinicName}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 text-white text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-400 font-bold">Akses:</span>
                    <span className="text-slate-300">5 Menit dari SCBD via Jl. Suryo / Jl. Gunawarman</span>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-teal-300 hover:text-white font-semibold underline"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONI & ULASAN PASIEN */}
      <section id="reviews" className="py-20 bg-white border-t border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Ulasan Pasien Nyata</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {landingCms.sliderTitle}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {landingCms.sliderSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100">
              <div className="text-3xl font-black text-teal-900">4.9</div>
              <div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-teal-700 font-medium mt-0.5">
                  Berdasarkan {approvedReviews.length + 120} ulasan pasien
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((rev, index) => (
              <div
                key={`${rev.id}-${testimonialPage}-${index}`}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{rev.isAnonymous ? rev.anonymousAlias : rev.patientName}</span>
                      {rev.isAnonymous && (
                        <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                          Anonim
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                      Sesi Konseling Privat
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testimonialItems.length > 3 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setTestimonialPage(prev => (prev - 1 + Math.max(1, testimonialItems.length - 2)) % Math.max(1, testimonialItems.length - 2))}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-slate-500 font-semibold">
                {testimonialPage + 1} / {Math.max(1, testimonialItems.length - 2)}
              </span>
              <button
                type="button"
                onClick={() => setTestimonialPage(prev => (prev + 1) % Math.max(1, testimonialItems.length - 2))}
                className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. CONSENT & PRIVACY */}
      <section id="privacy-consent" className="py-16 bg-slate-50 border-t border-slate-200 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Informed Consent',
                text: 'Pasien menyetujui proses konsultasi, penggunaan data pre-test untuk persiapan sesi, dan batas layanan sesuai praktik psikologi.'
              },
              {
                title: 'Privasi Data',
                text: 'Data profil, keluhan, jadwal, pembayaran, dan riwayat konsultasi hanya digunakan untuk operasional layanan dan dijaga kerahasiaannya.'
              },
              {
                title: 'Bukan Diagnosis Otomatis',
                text: 'Pre-test hanya membantu psikolog memahami kondisi awal. Kesimpulan klinis hanya diberikan melalui sesi konsultasi profesional.'
              }
            ].map(item => (
              <div key={item.title} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Baca Ringkasan Persetujuan & Privasi
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ & PERTANYAAN UMUM (PALING BAWAH SEBELUM CTA FOOTER) */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pusat Informasi & Bantuan</span>
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Jawaban seputar privasi data, mekanisme booking, DP flat Rp 100.000, dan alur konsultasi klinis.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apakah sesi konsultasi di JiwaSehat dijamin kerahasiaannya?',
                a: 'Ya, 100% rahasia medis klinis. Seluruh data, catatan klinis, dan riwayat sesi Anda dilindungi prinsip kerahasiaan praktik psikologi dan informed consent. Informasi Anda tidak akan pernah dibagikan kepada pihak ketiga tanpa izin tertulis dari Anda.'
              },
              {
                q: 'Bagaimana sistem pembayaran dan reservasi jadwal?',
                a: 'Untuk mengunci slot waktu pada jadwal psikolog, pasien membayar DP flat Rp 100.000 melalui transfer bank. Sisa biaya paket dilunasi saat hadir atau setelah sesi selesai sesuai arahan administrasi.'
              },
              {
                q: 'Apakah saya bisa mengajukan perubahan jadwal (reschedule)?',
                a: 'Bisa. Reschedule dapat diajukan secara mandiri melalui menu Jadwal & Riwayat di portal pasien minimal H-1 (24 jam sebelum sesi dimulai) tanpa potongan biaya, dengan memilih slot ketersediaan dokter yang baru.'
              },
              {
                q: 'Apakah saya wajib mengisi pre-test keluhan sebelum konsultasi?',
                a: 'Pengisian pre-test singkat langsung terintegrasi di langkah pemesanan jadwal. Hal ini membantu psikolog memetakan fokus permasalahan Anda sebelum sesi berlangsung sehingga durasi konsultasi menjadi lebih efektif dan mendalam.'
              },
              {
                q: 'Di mana lokasi ruang praktik konsultasi tatap muka?',
                a: 'Praktik tatap muka bertempat di JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan. Ruangan didesain kedap suara, tenang, ber-AC, dan memiliki ruang tunggu privat yang nyaman.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-900 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOP SVG WAVE TRANSITION TO DARK CTA SECTION */}
      <div className="w-full overflow-hidden leading-none bg-slate-50 -mb-1 pointer-events-none">
        <svg
          className="relative block w-full h-12 sm:h-16 lg:h-20 text-slate-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,45 C300,115 550,15 750,75 C950,135 1100,25 1200,65 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* 8. CALL TO ACTION (CTA) FOOTER */}
      <section id="cta" className="bg-slate-900 text-white py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kesehatan Mental Anda Sama Berharganya dengan Kesehatan Fisik.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Jangan biarkan kecemasan dan stres membebani hari-hari Anda sendirian. Isi pre-test lalu jadwalkan konsultasi mulai besok bersama {soloUser?.name}.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'melakukan reservasi konsultasi')}
                className="px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Reservasi Konsultasi Sekarang
              </button>

              <button
                type="button"
                onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'mengisi pre-test dan memilih jadwal')}
                className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-amber-300" />
                Isi Pre-Test Profiling
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODAL DETAIL BIO DOKTER */}
      {isBioModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setIsBioModalOpen(false)}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 cursor-pointer animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar cursor-default space-y-4 my-auto"
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {soloPsychologist?.avatarUrl || soloUser?.avatar ? (
                    <ImageWithFallback
                      src={soloPsychologist?.avatarUrl || soloUser?.avatar}
                      alt={soloUser?.name || 'Psikolog'}
                      className="w-full h-full object-cover"
                      fallback={<Stethoscope className="w-8 h-8" />}
                    />
                  ) : (
                    <Stethoscope className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{soloUser?.name}</h3>
                  <p className="text-xs text-teal-700 font-semibold">{soloPsychologist?.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Pengalaman {soloPsychologist?.experienceYears} Tahun</p>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Profil & Pendekatan:</h4>
                <p className="text-slate-600 leading-relaxed">{soloPsychologist?.bio}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Pendekatan Terapi:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {soloPsychologist?.therapyApproaches.map(app => (
                    <span key={app} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-medium border border-teal-100">
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-[11px] text-slate-600">
                <div>STR: <strong>{soloPsychologist?.strNumber}</strong> (Berlaku s/d {soloPsychologist?.strExpiry})</div>
                <div>SIP: <strong>{soloPsychologist?.sipNumber}</strong> (Berlaku s/d {soloPsychologist?.sipExpiry})</div>
                <div>Total Jam Terbang Klinis: <strong>{soloPsychologist?.clinicalHours}+ Jam</strong></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBioModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBioModalOpen(false);
                  requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'reservasi jadwal');
                }}
                className="w-full sm:w-auto px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Reservasi Jadwal
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isPrivacyModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Ringkasan Persetujuan & Privasi</h3>
              <p className="text-xs text-slate-500 mt-1">Dokumen lengkap akan dipetakan ke halaman kebijakan backend/CMS saat produksi.</p>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p><strong>Persetujuan layanan:</strong> pasien memahami bahwa sesi konsultasi dilakukan oleh psikolog/pengelola sesuai jadwal yang dikonfirmasi.</p>
              <p><strong>Penggunaan data:</strong> data diri, pre-test, pembayaran, dan riwayat sesi digunakan untuk administrasi, persiapan sesi, dan pelaporan internal pemilik praktik.</p>
              <p><strong>Batas pre-test:</strong> pre-test adalah profiling awal, bukan diagnosis otomatis atau pengganti konsultasi profesional.</p>
              <p><strong>Kerahasiaan:</strong> data klinis tidak ditampilkan ke publik dan hanya dapat diakses role yang berwenang.</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
