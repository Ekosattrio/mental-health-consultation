import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, IntakeForm, Appointment } from '../../types';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  AlertTriangle,
  HeartPulse,
  Moon,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  MessageSquare
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import {DashboardSkeleton,useRequestActivity} from './DataFeedback';

export interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: User | undefined;
  intakeForm?: IntakeForm;
  appointments: Appointment[];
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  intakeForm: latestIntake,
  appointments
}) => {
  const [activeTab, setActiveTab] = useState<'PRETEST' | 'APPOINTMENTS'>('PRETEST');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const activity=useRequestActivity();

  if (!isOpen || !patient) return null;

  const patientBookings = appointments.filter(item => item.patientId === patient.id);
  const snapshotBookings = patientBookings.filter(item => item.preTestSnapshot)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selectedBooking = snapshotBookings.find(item => item.id === selectedBookingId) || snapshotBookings[0];
  const intakeForm = selectedBooking?.preTestSnapshot || latestIntake;

  // Helper formatting stres
  const stressLevel = intakeForm?.currentStressLevel ?? 0;
  const getStressColor = (level: number) => {
    if (level >= 8) return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Tinggi (Butuh Perhatian Segera)' };
    if (level >= 5) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Sedang (Perlu Manajemen Stres)' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Rendah (Terkontrol)' };
  };

  const stressInfo = getStressColor(stressLevel);

  return typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="viewport-dialog bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col transition-all transform animate-scaleUp my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-detail-title"
      >
        {/* MODAL HEADER - Modern Simple Light */}
        <div className="bg-white border-b border-slate-100 p-5 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center font-black text-xl shrink-0 shadow-2xs">
                {patient.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id="patient-detail-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {patient.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Pasien Terdaftar
                  </span>
                  {intakeForm?.suicideRiskFlag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      Prioritas Pengawasan
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {patient.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {patient.phone || 'Belum ada nomor telepon'}
                  </span>
                  <span className="text-slate-400">ID: #{patient.id}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Tooltip content="Tutup Jendela (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup Detail Pasien"
                  className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* MODAL TAB NAVIGATION */}
        <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('PRETEST')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PRETEST'
                ? 'bg-white text-teal-950 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeTab === 'PRETEST' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Pre-Test & Rekam Awal</span>
            {intakeForm && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sudah Mengisi" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPOINTMENTS')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'APPOINTMENTS'
                ? 'bg-white text-teal-950 shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeTab === 'APPOINTMENTS' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Riwayat Konsultasi</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'APPOINTMENTS' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {appointments.length}
            </span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs custom-scrollbar">
          
          {/* TAB 1: PRE-TEST & IDENTITAS */}
          {activeTab === 'PRETEST' && (
            activity.clinical>0&&!intakeForm?<DashboardSkeleton compact label="Memuat pre-test pasien…"/>:intakeForm ? (
              <div className="space-y-6">
                {snapshotBookings.length > 0 && (
                  <label className="block font-bold text-slate-700">
                    Pre-test Janji Temu
                    <select value={selectedBooking?.id || ''} onChange={event => setSelectedBookingId(event.target.value)} className="mt-2 w-full border border-slate-200 rounded-lg p-2.5 bg-white text-xs">
                      {snapshotBookings.map(item => <option key={item.id} value={item.id}>{item.bookingCode} - {item.date} - {item.packageName}</option>)}
                    </select>
                  </label>
                )}
                {snapshotBookings.length === 0 && <p className="text-xs text-slate-500">Pre-test terakhir: {intakeForm.completedAt}</p>}
                {/* 1. Baris Triage: Stres & Kualitas Tidur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Tingkat Stres */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span>Tingkat Stres Pasien (Pre-Test)</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${stressInfo.badge}`}>
                        {stressLevel} / 10
                      </span>
                    </div>

                    {/* Progress Bar Stres */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${stressInfo.bg}`}
                        style={{ width: `${Math.min(stressLevel * 10, 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Status: <strong className={stressInfo.text}>{stressInfo.label}</strong>
                    </p>
                  </div>

                  {/* Card Kualitas Tidur */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span>Kualitas Tidur</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                        intakeForm.sleepQuality === 'Insomnia Akut' || intakeForm.sleepQuality === 'Buruk'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : intakeForm.sleepQuality === 'Cukup'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {intakeForm.sleepQuality}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium pt-2">
                      Pola tidur merupakan indikator stabilitas regulasi emosi dan fisik sebelum sesi intervensi.
                    </p>
                  </div>
                </div>

                {/* 2. Informasi Pribadi & Kontak Darurat */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                    Profil Sosial & Kontak Darurat
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pekerjaan</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">{intakeForm.occupation || '-'}</span>
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gender & Usia</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {intakeForm.gender || '-'} • Lahir: {intakeForm.birthDate || '-'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kontak Darurat</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {intakeForm.emergencyContact.name} ({intakeForm.emergencyContact.relationship})
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                        {intakeForm.emergencyContact.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Keluhan Utama Pasien (Chips Modern) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-sky-600" />
                    Fokus & Keluhan Utama yang Dipilih Pasien
                  </h4>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {intakeForm.primaryConcerns && intakeForm.primaryConcerns.length > 0 ? (
                      intakeForm.primaryConcerns.map((concern, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-950 border border-sky-200/80 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          {concern}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Tidak ada keluhan spesifik yang dicentang.</span>
                    )}
                  </div>
                </div>

                {/* 4. Narasi Klinis Kondisi Pasien (Quote Box Mewah) */}
                <div className="bg-sky-50/40 rounded-2xl border border-sky-100 p-5 space-y-2 border-l-4 border-l-sky-500">
                  <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    <span>Deskripsi Kondisi dari Sudut Pandang Pasien</span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic bg-white/60 p-3.5 rounded-xl border border-sky-100/60 font-medium">
                    "{intakeForm.concernDescription || 'Pasien tidak menyertakan deskripsi narasi tertulis.'}"
                  </p>
                </div>

                {/* 5. Riwayat Terapi & Ekspektasi Hasil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Riwayat Terapi / Medis Sebelumnya
                    </span>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-800">
                        {intakeForm.previousTherapy === undefined ? 'Riwayat terapi belum dikumpulkan' : intakeForm.previousTherapy ? 'Pernah Menjalani Konseling/Terapi' : 'Belum Pernah Konseling Sebelumnya'}
                      </p>
                      {intakeForm.previousDiagnosis && (
                        <p className="text-slate-600 font-medium">Diagnosis terdahulu: {intakeForm.previousDiagnosis}</p>
                      )}
                      {intakeForm.currentMedications && (
                        <p className="text-slate-500 text-[11px]">Obat saat ini: {intakeForm.currentMedications}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tujuan & Ekspektasi Pasien
                    </span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      "{intakeForm.goals || 'Tidak disebutkan secara eksplisit.'}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Formulir Pre-Test</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Pasien ini belum mengisi lembar intake pre-test di portal pasien sebelum sesi konsultasi.
                </p>
              </div>
            )
          )}

          {/* TAB 2: RIWAYAT KONSULTASI */}
          {activeTab === 'APPOINTMENTS' && (
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Konsultasi</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Pasien ini belum memiliki riwayat pemesanan jadwal sesi konsultasi.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">Kode & Paket</th>
                          <th className="py-3 px-4">Jadwal Sesi</th>
                          <th className="py-3 px-4">Lokasi Sesi</th>
                          <th className="py-3 px-4">Status Sesi</th>
                          <th className="py-3 px-4 text-right">Pembayaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-mono text-slate-500 text-[10px] block">#{apt.bookingCode}</span>
                              <span className="font-bold text-slate-900 text-xs">{apt.packageName}</span>
                            </td>

                            <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                              <span className="text-slate-800 font-bold block">{apt.date}</span>
                              <span className="text-slate-500 text-[11px]">{apt.startTime} - {apt.endTime} WIB</span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              <span className="line-clamp-1">{apt.meetingLocation}</span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                apt.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : apt.status === 'COMPLETED'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : apt.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {apt.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                apt.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.paymentStatus === 'DP_PAID'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {apt.paymentStatus === 'PAID' ? 'LUNAS' : apt.paymentStatus === 'DP_PAID' ? 'DP TERBAYAR' : apt.paymentStatus}
                              </span>
                              <span className="block text-[11px] font-mono text-slate-700 font-bold mt-0.5">
                                Rp {apt.totalAmount.toLocaleString('id-ID')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kerahasiaan catatan klinis dilindungi Kode Etik Psikologi Indonesia.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
