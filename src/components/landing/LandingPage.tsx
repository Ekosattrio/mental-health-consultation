import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PsychologistProfile } from '../../types';
import {
  Heart,
  ShieldCheck,
  Calendar,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Users,
  FileCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play
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

  const [selectedPsychologist, setSelectedPsychologist] = useState<PsychologistProfile | null>(null);
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState<string>('Semua');

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
  const allSpecialties = ['Semua', 'Anxiety & Panic Attack', 'Depresi & Burnout', 'Relationship & Family', 'Krisis Eksistensial'];

  const filteredPsychologists = psychologists.filter(p => {
    if (activeSpecialtyFilter === 'Semua') return true;
    return p.specialties.includes(activeSpecialtyFilter);
  });

  // Available Today Psychologists Slider state
  const availablePsychologists = psychologists.filter(p => p.isAvailableToday);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  // Auto-play Slider Timer with infinite loop
  useEffect(() => {
    if (!landingCms.sliderAutoPlay || availablePsychologists.length <= 1 || isSliderHovered) {
      return;
    }
    const intervalSec = Math.max(landingCms.sliderIntervalSeconds || 4, 2);
    const timer = setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % availablePsychologists.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [landingCms.sliderAutoPlay, landingCms.sliderIntervalSeconds, availablePsychologists.length, isSliderHovered]);

  const handlePrevSlide = () => {
    setActiveSlideIndex(prev => (prev === 0 ? availablePsychologists.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex(prev => (prev + 1) % availablePsychologists.length);
  };

  const activeSlidePsychologist = availablePsychologists[activeSlideIndex] || availablePsychologists[0];
  const activeSlideUser = users.find(u => u.id === activeSlidePsychologist?.userId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white pt-16 pb-24">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
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
                  onClick={() => requireAuth(() => onSelectBooking(), 'melakukan reservasi jadwal')}
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
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-teal-200/80">Psikolog Ber-SIP & STR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.9 / 5.0</div>
                  <div className="text-xs text-teal-200/80">Rating dari 350+ Sesi</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Terenkripsi</div>
                  <div className="text-xs text-teal-200/80">Kerahasiaan Medis Terjamin</div>
                </div>
              </div>
            </div>

            {/* Hero Carousel: Psikolog Siap Sedia Hari Ini (Di samping Jumbotron) */}
            <div className="lg:col-span-5">
              <div
                className="relative rounded-3xl bg-white text-slate-800 shadow-2xl border border-white/40 p-6 sm:p-7 backdrop-blur-xl transition-all"
                onMouseEnter={() => setIsSliderHovered(true)}
                onMouseLeave={() => setIsSliderHovered(false)}
              >
                {/* Header Carousel: Title, Pulse & Nav Buttons */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {landingCms.sliderTitle}
                    </span>
                  </div>

                  {/* Navigation Arrows & Counter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {activeSlideIndex + 1}/{availablePsychologists.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevSlide}
                        aria-label="Previous Slide"
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer active:scale-90"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        aria-label="Next Slide"
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer active:scale-90"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Psychologist Info */}
                {activeSlidePsychologist && activeSlideUser ? (
                  <div className="mt-5 space-y-4">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div className="relative shrink-0">
                        <img
                          src={activeSlideUser.avatar}
                          alt={activeSlideUser.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold shadow-xs">
                          Aktif
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                          {activeSlideUser.name}
                        </h3>
                        <p className="text-xs text-teal-700 font-semibold truncate">
                          {activeSlidePsychologist.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                          <span className="flex items-center text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                            {activeSlidePsychologist.rating.toFixed(1)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium">
                            {activeSlidePsychologist.experienceYears} Thn Pengalaman
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2 px-1">
                      "{activeSlidePsychologist.bio}"
                    </p>

                    {/* Specialties Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {activeSlidePsychologist.specialties.slice(0, 3).map(sp => (
                        <span
                          key={sp}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-100"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>

                    {/* Fee & Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Sesi Online Terenkripsi</span>
                        <span className="text-sm font-black text-slate-900">
                          Rp {activeSlidePsychologist.consultationFeeOnline.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPsychologist(activeSlidePsychologist)}
                          className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Bio
                        </button>
                        <button
                          onClick={() => requireAuth(() => onSelectBooking(activeSlidePsychologist.userId), 'reservasi konsultasi hari ini')}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Booking Hari Ini
                        </button>
                      </div>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {availablePsychologists.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlideIndex(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activeSlideIndex === idx
                              ? 'w-6 bg-teal-600'
                              : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Tidak ada psikolog bertugas hari ini.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PROFIL & BIOGRAFI SELURUH PSIKOLOG */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Tenaga Profesional Berlisensi</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Temui Seluruh Psikolog Klinis Kami</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Seluruh psikolog di JiwaSehat memiliki Surat Izin Praktik Psikologi (SIPP) dan teregistrasi resmi di Majelis Psikologi HIMPSI.
            </p>
          </div>

          {/* Filter Specialties */}
          <div className="flex flex-wrap gap-1.5">
            {allSpecialties.map(spec => (
              <button
                key={spec}
                onClick={() => setActiveSpecialtyFilter(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeSpecialtyFilter === spec
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Psychologist Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPsychologists.map(profile => {
            const user = users.find(u => u.id === profile.userId);
            return (
              <div
                key={profile.userId}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                          {profile.isAvailableToday ? 'Siap Hari Ini' : 'Tersedia'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 truncate">{user?.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{profile.title}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs py-2 border-y border-slate-100">
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{profile.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({profile.reviewCount} ulasan)</span>
                    </div>
                    <span className="text-slate-500 font-medium">{profile.experienceYears} Thn Pengalaman</span>
                  </div>

                  {/* Specialties Pills */}
                  <div className="mt-4 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Keahlian:</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.specialties.slice(0, 3).map(sp => (
                        <span key={sp} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPsychologist(profile)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Lihat Detail Bio
                  </button>

                  <button
                    onClick={() => requireAuth(() => onSelectBooking(profile.userId), 'reservasi konsultasi')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Booking Jadwal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. KATALOG PAKET KONSULTASI */}
      <section className="py-20 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-100/70 px-3 py-1 rounded-full">
              Pilihan Paket Layanan
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Pilih Format Konsultasi Sesuai Kebutuhan</h2>
            <p className="text-sm text-slate-600 mt-2">
              Transparan tanpa biaya tersembunyi. Didukung jaminan penjadwalan tepat waktu dan ruang privat bersertifikasi.
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
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-600 text-white tracking-wide shadow-sm">
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
                      <div className="text-xs font-bold text-slate-700">Fasilitas yang Didapatkan:</div>
                      {pkg.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => requireAuth(() => onSelectBooking(undefined, pkg.id), 'pemilihan paket')}
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

      {/* 4. INFORMASI LOKASI & KONTAK KLINIK (FROM CMS) */}
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
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Jam Operasional Klinik</h4>
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
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Kontak Resmi & Helpdesk</h4>
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
              {/* Map header overlay */}
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">{landingCms.clinicName}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium font-mono">Lat: -6.2341, Long: 106.8094</span>
              </div>

              {/* Graphic Mock Map */}
              <div className="h-84 sm:h-96 w-full bg-slate-800 relative flex items-center justify-center p-8">
                {/* SVG Map Grid Aesthetic */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Road vectors simulation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-12 bg-slate-700/60 rotate-12 absolute" />
                  <div className="h-full w-12 bg-slate-700/60 -rotate-24 absolute" />
                  <div className="w-3/4 h-8 bg-teal-500/20 rotate-45 absolute rounded-full blur-xs" />
                </div>

                {/* Clinic Pin Centerpiece */}
                <div className="relative z-10 text-center animate-bounce duration-1000">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-2xl ring-4 ring-white">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className="mt-3 px-3 py-1 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-xl border border-slate-200">
                    {landingCms.clinicName}
                  </div>
                </div>

                {/* Map Bottom Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 text-white text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-400 font-bold">Rute Terbaik:</span>
                    <span className="text-slate-300">5 Menit dari SCBD via Jl. Suryo / Jl. Gunawarman</span>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-teal-300 hover:text-white font-semibold underline"
                  >
                    <span>Buka di Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONI & RATING PUBLIK */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Ulasan Pasien Nyata</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Pengalaman Pasien Setelah Konsultasi</h2>
              <p className="text-sm text-slate-500 mt-1">
                Klien memiliki hak penuh untuk memilih opsi anonimitas saat mengisi review demi privasi mutlak.
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
                <div className="text-xs text-teal-700 font-medium mt-0.5">Berdasarkan {approvedReviews.length + 320} ulasan terverifikasi</div>
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
                      Konsultasi dengan {rev.psychologistName.split(',')[0]}
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
              Jangan biarkan kecemasan dan stres membebani hari-hari Anda sendirian. Jadwalkan sesi konsultasi pertama Anda hari ini dengan psikolog tepercaya.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => requireAuth(() => onSelectBooking(), 'melakukan reservasi konsultasi')}
                className="px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Reservasi Konsultasi Sekarang
              </button>

              <button
                onClick={() => requireAuth(onTakeTest, 'memulai tes psikologi DASS-21')}
                className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-300" />
                Mulai Tes DASS-21
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODAL DETAIL BIO PSIKOLOG (FREE ACCESS FOR GUEST) */}
      {selectedPsychologist && (
        <div
          onClick={() => setSelectedPsychologist(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar cursor-default"
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={users.find(u => u.id === selectedPsychologist.userId)?.avatar}
                  alt="Psikolog"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {users.find(u => u.id === selectedPsychologist.userId)?.name}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold">{selectedPsychologist.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Pengalaman {selectedPsychologist.experienceYears} Tahun</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPsychologist(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Biografi Klinis</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{selectedPsychologist.bio}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor SIP:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPsychologist.sipNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor STR:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPsychologist.strNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bahasa Konsultasi:</span>
                  <span className="font-medium text-slate-800">{selectedPsychologist.languages.join(', ')}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendekatan Terapi</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPsychologist.therapyApproaches.map(appr => (
                    <span key={appr} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium">
                      {appr}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tarif Sesi Online</span>
                  <span className="text-lg font-extrabold text-teal-800">
                    Rp {selectedPsychologist.consultationFeeOnline.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const id = selectedPsychologist.userId;
                    setSelectedPsychologist(null);
                    requireAuth(() => onSelectBooking(id), 'reservasi jadwal');
                  }}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Pilih Jadwal & Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
