import React, { useMemo, useState, useEffect } from 'react';
import {
  Appointment,
  ConsultationPackage,
  IntakeForm,
  PsychologistProfile,
  ScheduleSlot,
  User
} from '../../../types';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Upload,
  ShieldCheck,
  ClipboardCheck,
  UserCheck,
  Building,
  Check
} from 'lucide-react';
import {
  loadScheduleSettings,
  computeDynamicSlotsForDate
} from '../../../data/scheduleConfig';

interface BookingTabProps {
  packages: ConsultationPackage[];
  psychologists: PsychologistProfile[];
  users: User[];
  schedules: ScheduleSlot[];
  appointments: Appointment[];
  patientId: string;
  currentUser: User | null;
  selectedBookingPackageId?: string;
  selectedBookingPsychologistId?: string;
  existingIntake?: IntakeForm;
  bookAppointment: (data: any) => Promise<{ success: boolean; appointment?: Appointment; message?: string }>;
  submitIntakeForm?: (form: Omit<IntakeForm, 'id' | 'completedAt'>) => void;
  onNavigateTab: (tabId: 'history' | 'overview') => void;
}

const MIN_BOOKING_DATE = '2026-10-03';

export const BookingTab: React.FC<BookingTabProps> = ({
  packages,
  psychologists,
  users,
  appointments,
  patientId,
  currentUser,
  selectedBookingPackageId,
  selectedBookingPsychologistId,
  existingIntake,
  bookAppointment,
  submitIntakeForm,
  onNavigateTab
}) => {
  // Wizard Step: 1 = Pilih Jadwal & Paket, 2 = Isi Pre-Test, 3 = Pembayaran DP 50%
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Package & Schedule
  const [selectedPkgId, setSelectedPkgId] = useState(selectedBookingPackageId || packages[0]?.id || '');
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(selectedBookingPsychologistId || psychologists[0]?.userId || 'user-psy-1');
  const [selectedDate, setSelectedDate] = useState(MIN_BOOKING_DATE);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState({ startTime: '', endTime: '' });
  const [dateNotice, setDateNotice] = useState<string | null>(null);

  // Step 2 State: Pre-Test Form
  const [intakeData, setIntakeData] = useState({
    occupation: existingIntake?.occupation || 'Profesional Swasta',
    emergencyName: existingIntake?.emergencyContact?.name || 'Keluarga Pasien',
    emergencyRel: existingIntake?.emergencyContact?.relationship || 'Orang Tua / Pasangan',
    emergencyPhone: existingIntake?.emergencyContact?.phone || '0812-3344-5566',
    primaryConcerns: existingIntake?.primaryConcerns || ['Kecemasan Berlebih (Anxiety)'],
    concernDescription: existingIntake?.concernDescription || '',
    currentStressLevel: existingIntake?.currentStressLevel || 6,
    sleepQuality: existingIntake?.sleepQuality || 'Cukup',
    goals: existingIntake?.goals || 'Mendapatkan wawasan klinis dan strategi koping adaptif.'
  });

  // Step 3 State: Payment DP
  const [proofName, setProofName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successApt, setSuccessApt] = useState<Appointment | null>(null);

  const currentPackage = packages.find(pkg => pkg.id === selectedPkgId) || packages[0];
  const psychologist = psychologists.find(psy => psy.userId === selectedPsychologistId) || psychologists[0];
  const psychologistUser = users.find(user => user.id === selectedPsychologistId);

  const dpAmount = Math.ceil((currentPackage?.price || 0) * 0.5);
  const finalAmount = Math.max((currentPackage?.price || 0) - dpAmount, 0);

  // Dynamic slot calculation from psychologist weekly settings and package duration
  const scheduleSettings = loadScheduleSettings();
  const dynamicSchedule = useMemo(() => {
    return computeDynamicSlotsForDate(
      selectedDate,
      scheduleSettings,
      appointments,
      selectedPsychologistId,
      currentPackage?.durationMinutes || 60
    );
  }, [selectedDate, selectedPsychologistId, appointments, currentPackage]);

  const handleDateChange = (date: string) => {
    setSelectedSlotId('');
    setSelectedSlotTime({ startTime: '', endTime: '' });

    if (date < MIN_BOOKING_DATE) {
      setDateNotice(`Booking tidak bisa untuk hari yang sama. Minimal tanggal pemesanan adalah ${MIN_BOOKING_DATE}.`);
      return;
    }

    setDateNotice(null);
    setSelectedDate(date);
  };

  const handleSelectSlot = (slot: { id: string; startTime: string; endTime: string; isAvailable: boolean }) => {
    if (!slot.isAvailable) return;
    setSelectedSlotId(slot.id);
    setSelectedSlotTime({ startTime: slot.startTime, endTime: slot.endTime });
  };

  const handleToggleConcern = (concern: string) => {
    setIntakeData(prev => {
      const exists = prev.primaryConcerns.includes(concern);
      const updated = exists
        ? prev.primaryConcerns.filter(c => c !== concern)
        : [...prev.primaryConcerns, concern];
      return { ...prev, primaryConcerns: updated.length > 0 ? updated : [concern] };
    });
  };

  // Move from Step 1 to Step 2
  const handleProceedToPreTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedSlotTime.startTime) {
      alert('Silakan pilih salah satu slot jam konsultasi yang tersedia terlebih dahulu.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Move from Step 2 to Step 3 (Save Pre-Test in Context)
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitIntakeForm) {
      submitIntakeForm({
        patientId,
        birthDate: '1996-06-15',
        gender: 'Laki-laki',
        occupation: intakeData.occupation,
        emergencyContact: {
          name: intakeData.emergencyName,
          relationship: intakeData.emergencyRel,
          phone: intakeData.emergencyPhone
        },
        primaryConcerns: intakeData.primaryConcerns,
        concernDescription: intakeData.concernDescription,
        previousTherapy: false,
        currentMedications: 'Tidak ada',
        currentStressLevel: intakeData.currentStressLevel,
        sleepQuality: intakeData.sleepQuality as any,
        suicideRiskFlag: false,
        goals: intakeData.goals
      });
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit Booking
  const handleFinalSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await bookAppointment({
        patientId,
        patientName: currentUser?.name || 'Pasien',
        patientEmail: currentUser?.email || 'pasien@jiwasehat.id',
        psychologistId: selectedPsychologistId,
        packageId: selectedPkgId,
        date: selectedDate,
        slotId: selectedSlotId,
        startTime: selectedSlotTime.startTime,
        endTime: selectedSlotTime.endTime,
        paymentMethod: 'TRANSFER_BANK_DP_50'
      });

      if (res.success && res.appointment) {
        setSuccessApt(res.appointment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SUCCESS CONFIRMATION SCREEN */}
      {successApt ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              Pengajuan Reservasi Terkirim
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Booking Berhasil Dibuat!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Terima kasih. Pengajuan booking dan formulir pre-test Anda telah kami terima untuk diverifikasi oleh admin.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">KODE BOOKING</span>
              <strong className="font-bold text-slate-900 text-sm">{successApt.bookingCode}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">PAKET LAYANAN</span>
              <strong className="text-slate-900">{successApt.packageName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">JADWAL KONSULTASI</span>
              <strong className="text-slate-900">{successApt.date} • {successApt.startTime} - {successApt.endTime} WIB</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">LOKASI PRAKTIK</span>
              <strong className="text-slate-900">{successApt.meetingLocation}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">TAGIHAN DP 50%</span>
              <strong className="text-emerald-700 font-bold text-sm">Rp {dpAmount.toLocaleString('id-ID')} (Menunggu Verifikasi)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">STATUS PRE-TEST</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Terlampir Lengkap
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Buka Status & Riwayat Saya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* WIZARD FLOW (NEXT - NEXT - PRETEST - BOOKING) */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          {/* Wizard Step Breadcrumbs Header */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between max-w-xl mx-auto text-xs">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  1
                </div>
                <span className={`font-bold ${currentStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Jadwal & Paket
                </span>
              </div>

              <div className="w-12 h-0.5 bg-slate-200" />

              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  2
                </div>
                <span className={`font-bold ${currentStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                  Isi Pre-Test
                </span>
              </div>

              <div className="w-12 h-0.5 bg-slate-200" />

              {/* Step 3 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  3
                </div>
                <span className={`font-bold ${currentStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                  DP 50% & Kirim
                </span>
              </div>
            </div>
          </div>

          {/* STEP 1: PILIH PAKET & JADWAL */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToPreTest} className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 1: Pilih Paket & Waktu Konsultasi</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan jenis paket konsultasi dan jadwal sesi temu. Pemesanan wajib minimal H+1.
                </p>
              </div>

              {/* Paket Selector Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Pilih Paket Layanan:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map(pkg => {
                    const isSelected = selectedPkgId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{pkg.name}</span>
                          {pkg.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-emerald-700 font-black text-sm mt-1">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tanggal Konsultasi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tanggal Konsultasi (Minimal H+1):
                </label>
                <input
                  type="date"
                  min={MIN_BOOKING_DATE}
                  value={selectedDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                {dateNotice && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {dateNotice}
                  </p>
                )}
              </div>

              {/* Dynamic Slots Grid */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Pilih Jam Praktik Tersedia ({currentPackage?.durationMinutes || 60} Menit):
                  </label>
                  {!dynamicSchedule.isHoliday && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-semibold text-slate-500">
                        Sisa Kuota Hari Ini: <strong className="text-slate-900">{dynamicSchedule.remainingQuota} dari {dynamicSchedule.maxPatients} Pasien</strong>
                      </span>
                    </div>
                  )}
                </div>

                {dynamicSchedule.isHoliday ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Jadwal Tidak Tersedia: {dynamicSchedule.reason}</span>
                  </div>
                ) : dynamicSchedule.isQuotaFull ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{dynamicSchedule.reason}</span>
                  </div>
                ) : dynamicSchedule.slots.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl text-xs">
                    Tidak ada slot waktu pada tanggal ini. Silakan pilih tanggal lain.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {dynamicSchedule.slots.map(slot => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => handleSelectSlot(slot)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : slot.isAvailable
                              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                              : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-xs font-bold">{slot.startTime} - {slot.endTime}</div>
                          <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {slot.isAvailable ? slot.label : 'Penuh'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!selectedSlotId}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Lanjut: Isi Pre-Test (Langkah 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ISI PRE-TEST (SEBELUM KIRIM BOOKING) */}
          {currentStep === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 2: Formulir Pre-Test Pasien</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data keluhan awal untuk membantu psikolog mempersiapkan intervensi klinis yang tepat sasaran.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan / Aktivitas Utama</label>
                  <input
                    type="text"
                    required
                    value={intakeData.occupation}
                    onChange={e => setIntakeData({ ...intakeData, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    placeholder="Contoh: Pegawai Swasta / Mahasiswa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kontak Darurat (Nama & No. HP Kerabat)
                  </label>
                  <input
                    type="text"
                    required
                    value={intakeData.emergencyName}
                    onChange={e => setIntakeData({ ...intakeData, emergencyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    placeholder="Contoh: Rina (Istri) - 0812-xxxx-xxxx"
                  />
                </div>
              </div>

              {/* Keluhan Utama (Pills) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Keluhan Utama yang Dirasakan:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Kecemasan Berlebih (Anxiety)',
                    'Burnout Pekerjaan',
                    'Sulit Tidur / Insomnia',
                    'Depresi & Rasa Hampa',
                    'Konflik Pasangan / Keluarga',
                    'Trauma Masa Lalu',
                    'Kesulitan Mengontrol Emosi'
                  ].map(concern => {
                    const isSelected = intakeData.primaryConcerns.includes(concern);
                    return (
                      <button
                        key={concern}
                        type="button"
                        onClick={() => handleToggleConcern(concern)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {concern}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Keluhan Lebih Lanjut</label>
                <textarea
                  rows={3}
                  required
                  value={intakeData.concernDescription}
                  onChange={e => setIntakeData({ ...intakeData, concernDescription: e.target.value })}
                  placeholder="Ceritakan secara singkat apa yang sedang Anda hadapi akhir-akhir ini..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkat Stres Saat Ini ({intakeData.currentStressLevel}/10)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={intakeData.currentStressLevel}
                    onChange={e => setIntakeData({ ...intakeData, currentStressLevel: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kualitas Tidur</label>
                  <select
                    value={intakeData.sleepQuality}
                    onChange={e => setIntakeData({ ...intakeData, sleepQuality: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <option value="Baik">Baik (Nyenyak 7-8 jam)</option>
                    <option value="Cukup">Cukup (Sering terbangun)</option>
                    <option value="Buruk">Buruk (Sulit memulai tidur)</option>
                    <option value="Insomnia Akut">Insomnia Akut (Hanya 2-3 jam)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Jadwal</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Lanjut: Pembayaran DP 50% (Langkah 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: KONFIRMASI RINCIAN & PEMBAYARAN DP 50% */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmitBooking} className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 3: Konfirmasi Rincian & DP 50%</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa rincian pesanan dan selesaikan pembayaran DP 50% di awal sebelum mengirim booking.
                </p>
              </div>

              {/* Rincian Pesanan Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Psikolog</span>
                  <strong className="text-slate-900">{psychologistUser?.name || 'dr. Sarah Jenkins, M.Psi.'}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Paket Layanan</span>
                  <strong className="text-slate-900">{currentPackage?.name}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Jadwal Sesi</span>
                  <strong className="text-slate-900">{selectedDate} pukul {selectedSlotTime.startTime} - {selectedSlotTime.endTime} WIB</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Lokasi Praktik</span>
                  <strong className="text-slate-900">JiwaSehat Clinic Center (Tatap Muka)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Total Biaya Paket</span>
                  <span className="font-bold text-slate-900">Rp {(currentPackage?.price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-emerald-950 font-black block">DP 50% (Bayar Sekarang)</span>
                    <span className="text-[10px] text-emerald-800">Menjadi syarat konfirmasi booking jadwal</span>
                  </div>
                  <strong className="text-emerald-900 font-black text-base">
                    Rp {dpAmount.toLocaleString('id-ID')}
                  </strong>
                </div>
                <div className="flex justify-between py-1 text-slate-500">
                  <span>Pelunasan 50% (Setelah Konsultasi Selesai):</span>
                  <span className="font-bold text-slate-900">Rp {finalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Bank Account Info Card */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Rekening Resmi Pembayaran DP Klinik:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">BCA - 8830-1122-3344</div>
                    <div className="text-[11px] text-slate-500">a.n. PT JiwaSehat Konseling Mandiri</div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                    BCA
                  </span>
                </div>
              </div>

              {/* Upload Bukti Transfer DP */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Bukti Transfer DP 50%:
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-600">
                    Unggah tangkapan layar struk / bukti transfer bank
                  </div>
                  <input
                    type="text"
                    required
                    value={proofName}
                    onChange={e => setProofName(e.target.value)}
                    placeholder="Ketik nama file bukti transfer (misal: transfer_bca_dp.jpg)..."
                    className="w-full max-w-sm mx-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProofName('struk_dp_bca_02okt.jpg')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                    >
                      Gunakan File Simulasi Demo
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Ubah Pre-Test</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !proofName}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Mengirim Booking...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim Booking Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
