import React from 'react';
import { IntakeForm, TestResult, Appointment, PatientPageCmsConfig } from '../../../types';
import {
  Sparkles,
  PhoneCall,
  User,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface OverviewTabProps {
  patientCms: PatientPageCmsConfig;
  existingIntake: IntakeForm | undefined;
  patientTestResults: TestResult[];
  activeChatApt: Appointment | undefined;
  onNavigateTab: (tabId: 'intake' | 'tests' | 'chat' | 'booking') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  patientCms,
  existingIntake,
  patientTestResults,
  activeChatApt,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Grid: Welcome Hero Banner & 24/7 Crisis Support */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left: Welcome & Daily Mental Health Tip Card (col-span-8) */}
        <div className="xl:col-span-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
          {/* Ambient decorative glow */}
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-20 -bottom-8 w-36 h-36 bg-emerald-300/20 rounded-full blur-xl pointer-events-none" />

          {/* Welcome Text Content */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ruang Konseling & Pemulihan JiwaSehat</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              {patientCms.welcomeBannerTitle}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-2xl font-normal">
              {patientCms.welcomeBannerSubtitle}
            </p>
          </div>

          {/* Integrated Frosted Glass Daily Mental Health Tip */}
          {patientCms.dailyMentalHealthTip && (
            <div className="relative z-10 mt-6 pt-4 border-t border-white/15">
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/20 transition-all shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black tracking-wide shrink-0 shadow-xs">
                    Tips Hari Ini
                  </span>
                  <p className="text-xs sm:text-[13px] text-white/95 leading-relaxed font-medium">
                    {patientCms.dailyMentalHealthTip.replace(/^(Tips Hari Ini|Tips):\s*/i, '')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Dedicated 24/7 Crisis Hotline Card (col-span-4) */}
        <div className="xl:col-span-4 bg-gradient-to-b from-rose-50/90 via-rose-50/30 to-white rounded-3xl border border-rose-200/80 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Subtle emergency ambient glow */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-200/40 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Siaga 24 Jam Bebas Pulsa
              </span>
              <PhoneCall className="w-4 h-4 text-rose-600" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                {patientCms.crisisHotlineTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pendampingan darurat jika Anda atau kerabat membutuhkan bantuan emosional segera.
              </p>
            </div>

            {/* Quick Action Contact Cards */}
            <div className="space-y-2.5 pt-1">
              <a
                href={`tel:${patientCms.crisisHotlineNumber.replace(/[^0-9]/g, '')}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-rose-200/80 hover:border-rose-400 hover:shadow-xs text-rose-950 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Hotline Sejiwa Kemenkes</span>
                    <span className="text-xs font-black font-mono text-slate-900 group-hover:text-rose-700 transition-colors truncate block">
                      {patientCms.crisisHotlineNumber}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg shrink-0">Panggil</span>
              </a>

              <a
                href={`https://wa.me/${patientCms.crisisWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-200/80 hover:border-emerald-400 hover:shadow-xs text-emerald-950 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">WhatsApp Siaga</span>
                    <span className="text-xs font-black font-mono text-slate-900 group-hover:text-emerald-700 transition-colors truncate block">
                      {patientCms.crisisWhatsapp}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">Chat WA</span>
              </a>
            </div>
          </div>

          {/* Crisis Notice at Bottom */}
          <div className="relative z-10 pt-3.5 mt-3 border-t border-rose-100">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {patientCms.crisisNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Security & Clinical Privacy Announcement from CMS */}
      {patientCms.announcementText && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 shadow-2xs">
          <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <p className="text-xs text-emerald-950 leading-relaxed font-medium">
            {patientCms.announcementText}
          </p>
        </div>
      )}

      {/* Status Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Status Intake Form</span>
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            {existingIntake ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Lengkap & Terisi</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Belum Diisi</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {existingIntake ? `Tersimpan pada ${existingIntake.completedAt}` : 'Harap diisi sebelum sesi konseling.'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hasil DASS-21 Terakhir</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {patientTestResults.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-teal-800">
                <span className="px-2 py-0.5 rounded bg-teal-100 text-xs font-black">
                  {patientTestResults[0].severityLevel}
                </span>
                <span>(Skor {patientTestResults[0].totalScore})</span>
              </span>
            ) : (
              <span className="text-slate-400 text-sm font-semibold">Belum pernah tes</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {patientTestResults.length > 0
              ? `Evaluasi: Kecemasan ${patientTestResults[0].subscaleScores.anxiety}, Stres ${patientTestResults[0].subscaleScores.stress}`
              : 'Ikuti tes mandiri 5 menit untuk mengetahui skor.'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sesi Aktif Mendatang</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {activeChatApt ? `${activeChatApt.date}` : 'Tidak Ada'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeChatApt
              ? `${activeChatApt.startTime} - ${activeChatApt.endTime} WIB (${activeChatApt.packageType})`
              : 'Pesan jadwal konseling untuk mulai berkonsultasi.'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tingkat Stres Mandiri</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-extrabold text-slate-900">
            {existingIntake ? `${existingIntake.currentStressLevel} / 10` : 'Belum tercatat'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kualitas Tidur: {existingIntake?.sleepQuality || 'Normal'}
          </p>
        </div>
      </div>

      {/* Active Appointment Live Banner if Confirmed */}
      {activeChatApt && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Jadwal Terkonfirmasi
              </span>
              <span className="text-xs font-mono text-slate-500">#{activeChatApt.bookingCode}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {activeChatApt.packageName} dengan {activeChatApt.psychologistName}
            </h3>
            <p className="text-xs text-slate-600">
              Tanggal: <strong>{activeChatApt.date}</strong> pukul <strong>{activeChatApt.startTime} - {activeChatApt.endTime} WIB</strong> • Lokasi: {activeChatApt.meetingLocation}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('chat')}
              className="flex-1 md:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Buka Ruang Konsultasi Chat
            </button>
          </div>
        </div>
      )}

      {/* Patient Medical File Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Intake summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Rekam Medis & Riwayat Pasien
            </h4>
            <button
              onClick={() => onNavigateTab('intake')}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Edit Formulir
            </button>
          </div>

          {existingIntake ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">KELUHAN UTAMA</span>
                <div className="flex flex-wrap gap-1.5">
                  {existingIntake.primaryConcerns.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-0.5">DESKRIPSI KELUHAN</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{existingIntake.concernDescription}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">PEKERJAAN</span>
                  <span className="font-bold text-slate-800">{existingIntake.occupation}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">KONTAK DARURAT</span>
                  <span className="font-bold text-slate-800">{existingIntake.emergencyContact.name} ({existingIntake.emergencyContact.phone})</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-0.5">TUJUAN SESI</span>
                <p className="text-slate-600 italic">"{existingIntake.goals}"</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 mb-3">Formulir intake belum dilengkapi.</p>
              <button
                onClick={() => onNavigateTab('intake')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Isi Intake Form Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Right: DASS-21 Graph & Subscale Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Grafik Skor Asesmen DASS-21
            </h4>
            <button
              onClick={() => onNavigateTab('tests')}
              className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
            >
              Tes Ulang
            </button>
          </div>

          {patientTestResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Derajat Keparahan</span>
                  <div className="text-sm font-extrabold text-slate-900">
                    {patientTestResults[0].severityLevel} (Skor Total: {patientTestResults[0].totalScore})
                  </div>
                </div>
                <span className="text-xs text-slate-400">{patientTestResults[0].completedAt}</span>
              </div>

              {/* Subscale Progress Meters */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-700">Subskala Depresi</span>
                    <span className="text-rose-900">{patientTestResults[0].subscaleScores.depression} / 21</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, (patientTestResults[0].subscaleScores.depression / 21) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-700">Subskala Kecemasan (Anxiety)</span>
                    <span className="text-amber-900">{patientTestResults[0].subscaleScores.anxiety} / 21</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (patientTestResults[0].subscaleScores.anxiety / 21) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-teal-700">Subskala Stres</span>
                    <span className="text-teal-900">{patientTestResults[0].subscaleScores.stress} / 21</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${Math.min(100, (patientTestResults[0].subscaleScores.stress / 21) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 leading-relaxed">
                <strong>Rekomendasi Terapi:</strong> {patientTestResults[0].clinicalRecommendation}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 mb-3">Belum ada riwayat tes DASS-21.</p>
              <button
                onClick={() => onNavigateTab('tests')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Mulai Tes DASS-21 Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

