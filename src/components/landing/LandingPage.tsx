import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PsychologistProfile } from '../../types';
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
  MessageSquare,
  Users,
  FileCheck,
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';

interface LandingPageProps {
  onSelectBooking: (psychologistId?: string, packageId?: string) => void;
  onTakeTest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectBooking, onTakeTest }) => {
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-16 pb-24">
        {/* Subtle background glow effect */}
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
                  onClick={() => requireAuth(onTakeTest, 'mengikuti tes psikologi online mandiri')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-amber-300" />
                  Tes Psikologi Online Mandiri (Gratis)
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
                      Praktik Mandiri Aktif
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    Kemenkes RI Verified
                  </span>
                </div>

                {/* Doctor Avatar & Identity */}
                <div className="flex items-center gap-4">
                  <img
                    src={soloUser?.avatar}
                    alt={soloUser?.name}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-teal-600 shadow-md shrink-0"
                  />
                  <div className="min-w-0">
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
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
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

                {/* Fee & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Biaya Sesi Online</span>
                    <span className="text-sm font-black text-slate-900">
                      Rp {soloPsychologist?.consultationFeeOnline.toLocaleString('id-ID')}
                    </span>
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
      </section>

      {/* 2. TENTANG PSIKOLOG & PENDEKATAN KLINIS (PROFIL MANDIRI 1 DOKTER) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Doctor Photo & Badges */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
              <img
                src={soloUser?.avatar}
                alt={soloUser?.name}
                className="w-full h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Psikolog Klinis Berizin Resmi
                </span>
                <h3 className="text-xl font-black mt-0.5">{soloUser?.name}</h3>
                <p className="text-xs text-slate-300">{soloPsychologist?.title}</p>
              </div>
            </div>

            {/* License & Education Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-700">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Legalisasi Kemenkes</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  STR: {soloPsychologist?.strNumber}
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
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
      <section className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-3 py-1 rounded-full">
              Pilihan Format Konsultasi
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Pilih Sesi yang Sesuai Kebutuhan Anda
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Seluruh sesi ditangani langsung secara privat oleh {soloUser?.name}. Transparan tanpa biaya tersembunyi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {packages.map(pkg => {
              const isPopular = pkg.type === 'BUNDLING_ASSESSMENT';
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl bg-white p-8 flex flex-col justify-between border transition-all ${
                    isPopular
                      ? 'border-teal-500 shadow-xl ring-2 ring-teal-500/20'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-600 text-white tracking-wide shadow-xs">
                      {pkg.badge}
                    </div>
                  )}

                  <div>
                    {/* Header Package */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100">
                        {pkg.type === 'ONLINE_CHAT' && <MessageSquare className="w-6 h-6" />}
                        {pkg.type === 'OFFLINE_CLINIC' && <Users className="w-6 h-6" />}
                        {pkg.type === 'BUNDLING_ASSESSMENT' && <FileCheck className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Durasi {pkg.durationMinutes} Menit</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-xs text-slate-400 block font-medium">Biaya Investasi Diri</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-500">/ sesi</span>
                      </div>
                    </div>

                    {/* Benefits list */}
                    <div className="space-y-3 mb-8">
                      <div className="text-xs font-bold text-slate-700">Fasilitas Sesi:</div>
                      {pkg.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => requireAuth(() => onSelectBooking(soloPsychologist?.userId, pkg.id), 'pemilihan paket')}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      isPopular
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>Pilih Paket Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INFORMASI LOKASI RUANG PRAKTIK */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Lokasi Praktik Resmi</span>
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
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Kontak Resmi & Janji Temu</h4>
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
                <span className="text-[11px] text-slate-500 font-medium font-mono">Senopati, Jakarta Selatan</span>
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
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Ulasan Pasien Nyata</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Pengalaman Konseling Bersama {soloUser?.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Seluruh ulasan berasal dari pasien terverifikasi yang telah menyelesaikan sesi konsultasi.
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
            {approvedReviews.map(rev => (
              <div
                key={rev.id}
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
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) FOOTER */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kesehatan Mental Anda Sama Berharganya dengan Kesehatan Fisik.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Jangan biarkan kecemasan dan stres membebani hari-hari Anda sendirian. Jadwalkan sesi konsultasi pertama Anda hari ini bersama {soloUser?.name}.
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
                onClick={() => requireAuth(onTakeTest, 'memulai tes psikologi DASS-21')}
                className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                Mulai Tes DASS-21 Mandiri
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODAL DETAIL BIO DOKTER */}
      {isBioModalOpen && (
        <div
          onClick={() => setIsBioModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar cursor-default space-y-4"
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={soloUser?.avatar}
                  alt={soloUser?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
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

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px] text-slate-600">
                <div>STR: <strong>{soloPsychologist?.strNumber}</strong> (Berlaku s/d {soloPsychologist?.strExpiry})</div>
                <div>SIP: <strong>{soloPsychologist?.sipNumber}</strong> (Berlaku s/d {soloPsychologist?.sipExpiry})</div>
                <div>Total Jam Terbang Klinis: <strong>{soloPsychologist?.clinicalHours}+ Jam</strong></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBioModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBioModalOpen(false);
                  requireAuth(() => onSelectBooking(soloPsychologist?.userId), 'reservasi jadwal');
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Reservasi Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
