import React, { useState } from 'react';
import { PsychologistProfile, User, Appointment, Review } from '../../../types';
import {
  Star,
  TrendingUp,
  AlertTriangle,
  Award,
  BarChart3,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Percent,
  Receipt,
  FileText,
  X,
  Printer,
  Building2
} from 'lucide-react';

interface AnalyticsTabProps {
  analytics: {
    totalRevenue: number;
    completedSessions: number;
    totalAppointments: number;
    activePatients: number;
    averageRating: number;
    topConcerns: Array<{ name: string; count: number; percentage: number }>;
  };
  psychologists: PsychologistProfile[];
  users: User[];
  appointments: Appointment[];
  reviews: Review[];
  onNavigateTab?: (tabId: 'reviews' | 'users') => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analytics,
  psychologists,
  users,
  appointments,
  reviews,
  onNavigateTab
}) => {
  // 1. Rating Category Filter: 'all' | 'top' | 'low'
  const [ratingFilter, setRatingFilter] = useState<'all' | 'top' | 'low'>('all');

  // 2. Revenue Share Ratio State (Default 70% to Psychologist, 30% to Clinic)
  const [psychologistSharePercent, setPsychologistSharePercent] = useState<number>(70);

  // 3. Slip Modal State
  const [selectedSlipDoctorId, setSelectedSlipDoctorId] = useState<string | null>(null);
  const [slipDownloadedToast, setSlipDownloadedToast] = useState<boolean>(false);

  // Financial Calculations
  const paidAppointments = appointments.filter(a => a.paymentStatus === 'PAID');
  const totalGrossRevenue = paidAppointments.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
  const clinicSharePercent = 100 - psychologistSharePercent;

  // Aggregate shares
  const totalPsychologistShare = Math.round(totalGrossRevenue * (psychologistSharePercent / 100));
  const netClinicRevenue = totalGrossRevenue - totalPsychologistShare;
  const clinicMargin = totalGrossRevenue > 0 ? Math.round((netClinicRevenue / totalGrossRevenue) * 100) : 0;
  const avgSessionRevenue = paidAppointments.length > 0 ? Math.round(totalGrossRevenue / paidAppointments.length) : 0;

  // Breakdown per psychologist
  const psychologistFinancials = psychologists.map(psy => {
    const userObj = users.find(u => u.id === psy.userId);
    const psyPaidApts = appointments.filter(
      a => a.psychologistId === psy.userId && a.paymentStatus === 'PAID'
    );
    const psyTotalApts = appointments.filter(a => a.psychologistId === psy.userId);
    const psyGrossRevenue = psyPaidApts.reduce((sum, a) => sum + (a.totalAmount || 0), 0);
    const psyShare = Math.round(psyGrossRevenue * (psychologistSharePercent / 100));
    const clinicShare = psyGrossRevenue - psyShare;

    return {
      psy,
      userObj,
      name: userObj?.name || psy.title,
      avatar: userObj?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      title: psy.title,
      sipNumber: psy.sipNumber,
      strNumber: psy.strNumber,
      paidSessionsCount: psyPaidApts.length,
      totalSessionsCount: psyTotalApts.length,
      grossRevenue: psyGrossRevenue,
      psychologistShare: psyShare,
      clinicShare: clinicShare,
      paidAppointments: psyPaidApts,
      bankAccount: 'Bank Mandiri • 137-00-198273-1'
    };
  });

  // Calculate statistics for each psychologist's ratings
  const psychologistRatingStats = psychologists.map(psy => {
    const userObj = users.find(u => u.id === psy.userId);
    const psyApts = appointments.filter(a => a.psychologistId === psy.userId);
    const psyReviews = reviews.filter(r => r.psychologistId === psy.userId);

    const avgRating =
      psyReviews.length > 0
        ? Number((psyReviews.reduce((acc, r) => acc + r.rating, 0) / psyReviews.length).toFixed(1))
        : psy.rating;

    const fiveStarCount = psyReviews.filter(r => r.rating === 5).length;
    const fourStarCount = psyReviews.filter(r => r.rating === 4).length;
    const threeAndBelowCount = psyReviews.filter(r => r.rating <= 3).length;

    const category: 'TOP' | 'GOOD' | 'LOW' =
      avgRating >= 4.8 ? 'TOP' : avgRating >= 4.5 ? 'GOOD' : 'LOW';

    return {
      psy,
      userObj,
      name: userObj?.name || psy.title,
      avatar: userObj?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      title: psy.title,
      rating: avgRating,
      reviewCount: psyReviews.length > 0 ? psyReviews.length : psy.reviewCount,
      totalSessions: psyApts.length,
      fiveStarCount,
      fourStarCount,
      threeAndBelowCount,
      recentReviews: psyReviews.slice(0, 2),
      category
    };
  });

  // Sort descending by rating
  psychologistRatingStats.sort((a, b) => b.rating - a.rating);

  const filteredRatingStats = psychologistRatingStats.filter(item => {
    if (ratingFilter === 'top') return item.category === 'TOP';
    if (ratingFilter === 'low') return item.category === 'LOW';
    return true;
  });

  const topRatedCount = psychologistRatingStats.filter(s => s.category === 'TOP').length;
  const lowRatedCount = psychologistRatingStats.filter(s => s.category === 'LOW').length;

  const activeSlipDoctor = psychologistFinancials.find(p => p.psy.userId === selectedSlipDoctorId);

  const handlePrintSlip = () => {
    setSlipDownloadedToast(true);
    setTimeout(() => setSlipDownloadedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP KEY METRICS: OMZET, BERSIH KLINIK & SHARE PSIKOLOG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Revenue */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Omzet Bruto Konsultasi</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            Rp {totalGrossRevenue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{paidAppointments.length} Sesi Terbayar</span>
            <span className="font-semibold text-slate-700">Rata-rata Rp {avgSessionRevenue.toLocaleString('id-ID')}/sesi</span>
          </div>
        </div>

        {/* Card 2: Share Psikolog */}
        <div className="p-5 bg-white rounded-3xl border border-purple-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Bagi Hasil Psikolog</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-2">
            Rp {totalPsychologistShare.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-purple-700 mt-2 pt-2 border-t border-purple-100">
            <span className="font-semibold">Porsi: {psychologistSharePercent}% Omzet</span>
            <span>Tutup Buku Tgl 25</span>
          </div>
        </div>

        {/* Card 3: Net Clinic Revenue */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 rounded-3xl border border-emerald-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Pendapatan Bersih Klinik</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-2">
            Rp {netClinicRevenue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800 mt-2 pt-2 border-t border-emerald-200/60">
            <span className="font-bold">Margin Bersih: {clinicMargin}%</span>
            <span>Operasional & Fasilitas</span>
          </div>
        </div>

        {/* Card 4: Kepuasan & Pasien */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kepuasan & Pasien</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {analytics.averageRating} ★
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{analytics.activePatients} Pasien Terlayani</span>
            <span>{topRatedCount} Psikolog Top</span>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SECTION 1: PERHITUNGAN BERSIH KLINIK & REVENUE SHARE PSIKOLOG */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Transparansi Finansial & Remunerasi</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Perhitungan Bersih Klinik & Bagi Hasil Mitra Psikolog
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian pembagian hasil sesi konsultasi berbayar antara hak honorarium psikolog klinis dan pendapatan bersih operasional klinik.
            </p>
          </div>

          {/* Interactive Ratio Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start lg:self-center">
            <span className="text-[11px] font-bold text-slate-500 pl-2 pr-1">Skema Rasio:</span>
            {[
              { label: '70% : 30%', psy: 70, desc: 'Standar Industri' },
              { label: '75% : 25%', psy: 75, desc: 'Insentif Senior' },
              { label: '80% : 20%', psy: 80, desc: 'SOP JiwaSehat' }
            ].map(tier => (
              <button
                key={tier.psy}
                type="button"
                onClick={() => setPsychologistSharePercent(tier.psy)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  psychologistSharePercent === tier.psy
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={tier.desc}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Projection Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Alokasi Honorarium Mitra:</span>
            <span className="text-base font-black text-purple-700 block mt-0.5">
              Rp {totalPsychologistShare.toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Didistribusikan ke {psychologists.length} psikolog berlisensi sesuai sesi yang telah selesai.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Laba Bersih Klinik:</span>
            <span className="text-base font-black text-emerald-700 block mt-0.5">
              Rp {netClinicRevenue.toLocaleString('id-ID')}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Untuk pemeliharaan klinik fisik Senopati, server rekam medis EMR, dan operasional staf.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Jadwal Pencairan (Payout):</span>
            <span className="text-base font-black text-slate-800 block mt-0.5">
              Tanggal 25 Tiap Bulan
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Sesuai SK Direksi Klinik JiwaSehat No. 04/SK-KEU/2026.
            </p>
          </div>
        </div>

        {/* Tabel Rekapitulasi Rinci Per-Psikolog */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mitra Psikolog</th>
                <th className="py-3 px-4 text-center">Sesi Terbayar</th>
                <th className="py-3 px-4 text-right">Omzet Konsultasi</th>
                <th className="py-3 px-4 text-right bg-purple-50/40 text-purple-900">
                  Share Psikolog ({psychologistSharePercent}%)
                </th>
                <th className="py-3 px-4 text-right bg-emerald-50/40 text-emerald-900">
                  Bersih Klinik ({clinicSharePercent}%)
                </th>
                <th className="py-3 px-4 text-center">Status Payout</th>
                <th className="py-3 px-4 text-center">Slip Honor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {psychologistFinancials.map(doc => {
                return (
                  <tr key={doc.psy.userId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Doctor Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate leading-tight">
                            {doc.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            SIP: {doc.sipNumber || 'SIP-2024-JKT'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sesi Terbayar */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 text-[11px]">
                        {doc.paidSessionsCount} Sesi
                      </span>
                    </td>

                    {/* Omzet Sesi */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {doc.grossRevenue.toLocaleString('id-ID')}
                    </td>

                    {/* Hak Psikolog */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-purple-800 bg-purple-50/30">
                      Rp {doc.psychologistShare.toLocaleString('id-ID')}
                    </td>

                    {/* Hak Bersih Klinik */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800 bg-emerald-50/30">
                      Rp {doc.clinicShare.toLocaleString('id-ID')}
                    </td>

                    {/* Status Payout */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Siap Ditransfer
                      </span>
                    </td>

                    {/* Slip Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedSlipDoctorId(doc.psy.userId)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 text-slate-600 text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-3 px-4">TOTAL KESELURUHAN</td>
                <td className="py-3 px-4 text-center">{paidAppointments.length} Sesi</td>
                <td className="py-3 px-4 text-right font-mono font-black">
                  Rp {totalGrossRevenue.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-purple-900 bg-purple-100/60">
                  Rp {totalPsychologistShare.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-emerald-900 bg-emerald-100/60">
                  Rp {netClinicRevenue.toLocaleString('id-ID')}
                </td>
                <td colSpan={2} className="py-3 px-4 text-center text-slate-500 text-[11px]">
                  Tutup Buku: 25 September 2026
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. DEDICATED SECTION 2: GRAFIK & ANALISIS RATING PSIKOLOG (BAGUS VS KURANG) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Monitoring Kinerja & Kualitas Layanan</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Analisis Komparasi Rating Psikolog
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporan visual perbandingan skor kepuasan pasien. Mengidentifikasi psikolog berprestasi (Rating Bagus) dan yang memerlukan bimbingan supervisi klinis (Rating Kurang).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRatingFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({psychologists.length})
            </button>
            <button
              type="button"
              onClick={() => setRatingFilter('top')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                ratingFilter === 'top'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Rating Bagus ({topRatedCount})
            </button>
            <button
              type="button"
              onClick={() => setRatingFilter('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                ratingFilter === 'low'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Butuh Evaluasi ({lowRatedCount})
            </button>
          </div>
        </div>

        {/* Visual Bar Chart per Psychologist */}
        <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Psikolog & Kredensial Praktik</span>
            <span>Skala Skor Kepuasan Pasien (Maksimal 5.0 ★)</span>
          </div>

          <div className="space-y-3.5">
            {psychologistRatingStats.map(item => {
              const ratingPercent = Math.min(100, Math.round((item.rating / 5.0) * 100));
              const isTop = item.category === 'TOP';
              const isLow = item.category === 'LOW';

              return (
                <div
                  key={item.psy.userId}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-purple-300 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{item.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isTop && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Bagus (Top Performer)
                        </span>
                      )}
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Perlu Evaluasi
                        </span>
                      )}
                      <div className="flex items-center gap-1 font-mono font-black text-slate-900 text-sm">
                        <Star className={`w-3.5 h-3.5 ${isTop ? 'fill-amber-400 text-amber-400' : isLow ? 'fill-rose-500 text-rose-500' : 'fill-teal-500 text-teal-500'}`} />
                        <span>{item.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({item.reviewCount} ulasan)</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isTop
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          : isLow
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-teal-400 to-teal-600'
                      }`}
                      style={{ width: `${ratingPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Evaluation Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rincian Audit Kepuasan Pasien ({filteredRatingStats.length} Psikolog)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRatingStats.map(item => {
              const isTop = item.category === 'TOP';
              const isLow = item.category === 'LOW';

              return (
                <div
                  key={item.psy.userId}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isTop
                      ? 'bg-emerald-50/20 border-emerald-200/80 shadow-2xs'
                      : isLow
                      ? 'bg-rose-50/30 border-rose-200/90 shadow-2xs'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-900 truncate">{item.name}</h5>
                        <p className="text-[11px] text-purple-700 font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">STR: {item.psy.strNumber}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                        <Star className={`w-3.5 h-3.5 ${isTop ? 'fill-amber-400 text-amber-400' : isLow ? 'fill-rose-500 text-rose-500' : 'fill-teal-500 text-teal-500'}`} />
                        <span>{item.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.reviewCount} ulasan</span>
                    </div>
                  </div>

                  {/* Diagnostic Banner */}
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                      isTop
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : isLow
                        ? 'bg-rose-100/80 border-rose-200 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {isTop ? (
                      <>
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Kategori Bagus: Kinerja prima & direkomendasikan promosi program klinik.</span>
                      </>
                    ) : isLow ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Kategori Kurang: Dijadwalkan untuk sesi evaluasi supervisi klinis HIMPSI.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Kategori Standar: Performa konsisten memenuhi pedoman operasional klinik.</span>
                      </>
                    )}
                  </div>

                  {/* Star breakdown */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block">5 Bintang</span>
                      <span className="font-black text-emerald-700">{item.fiveStarCount}</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block">4 Bintang</span>
                      <span className="font-black text-teal-700">{item.fourStarCount}</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-bold block">≤ 3 Bintang</span>
                      <span className={`font-black ${item.threeAndBelowCount > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-400'}`}>
                        {item.threeAndBelowCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DEDICATED SECTION 3: DEMOGRAFI KELUHAN PSIKOLOGIS PASIEN */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Demografi Keluhan Psikologis Pasien</h3>
        <p className="text-xs text-slate-500 mb-6">Distribusi masalah utama yang dilaporkan saat mengisi formulir intake.</p>

        <div className="space-y-4">
          {analytics.topConcerns.map(item => (
            <div key={item.name}>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{item.name}</span>
                <span className="text-slate-500">
                  {item.count} kasus ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MODAL SLIP RINCIAN BAGI HASIL PSIKOLOG */}
      {selectedSlipDoctorId && activeSlipDoctor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-snug">
                    Slip Remunerasi & Bagi Hasil Mitra
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Periode: September 2026 • Tutup Buku: 25 Sep 2026
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlipDoctorId(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor Info Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activeSlipDoctor.avatar}
                  alt={activeSlipDoctor.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <span className="font-bold text-slate-900 block">{activeSlipDoctor.name}</span>
                  <span className="text-[11px] text-slate-500 block">{activeSlipDoctor.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">SIP: {activeSlipDoctor.sipNumber}</span>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-500">
                <span className="block font-bold text-slate-700">{activeSlipDoctor.bankAccount}</span>
                <span>Atas Nama Dokter Terdaftar</span>
              </div>
            </div>

            {/* Financial Breakdown Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Total Sesi Konsultasi Berbayar</span>
                <span className="font-bold text-slate-900">{activeSlipDoctor.paidSessionsCount} Sesi Selesai</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Total Omzet Kotor Sesi (Gross Revenue)</span>
                <span className="font-bold font-mono text-slate-900">
                  Rp {activeSlipDoctor.grossRevenue.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-emerald-700">
                <span>Bagian Bersih Manajemen Klinik ({clinicSharePercent}%)</span>
                <span className="font-bold font-mono text-emerald-800">
                  - Rp {activeSlipDoctor.clinicShare.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-2.5 bg-purple-50 px-3.5 rounded-xl border border-purple-200 text-purple-950 font-bold">
                <span>Hak Bersih Diterima Psikolog ({psychologistSharePercent}%)</span>
                <span className="text-base font-black font-mono text-purple-900">
                  Rp {activeSlipDoctor.psychologistShare.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Toast Notification if Downloaded */}
            {slipDownloadedToast && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Slip remunerasi resmi berhasil dicetak dan diunduh (PDF).</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSlipDoctorId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh Slip PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
