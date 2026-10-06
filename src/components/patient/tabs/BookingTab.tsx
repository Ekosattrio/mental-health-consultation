import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Appointment,
  ConsultationPackage,
  IntakeForm,
  PsychologistProfile,
  ScheduleSlot,
  User,
  PackageCategory
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
  Check,
  Lock,
  Edit2,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import {
  loadScheduleSettings,
  computeDynamicSlotsForDate
} from '../../../data/scheduleConfig';
import { calculatePackagePayableAmount } from '../../../utils/discounts';

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
  submitIntakeForm?: (form: Omit<IntakeForm, 'id' | 'completedAt'>) => Promise<IntakeForm | null>;
  updateUserProfile?: (userId: string, data: Partial<User>) => void;
  onNavigateTab: (tabId: 'history' | 'overview') => void;
}

const getLocalDateString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getMinimumBookingDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
};

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
  updateUserProfile,
  onNavigateTab
}) => {
  const minimumBookingDate = getMinimumBookingDate();
  // Wizard Step: 1 = Pilih Jadwal & Paket, 2 = Isi Pre-Test, 3 = Konfirmasi
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Active packages filter (ignore legacy inactive packages)
  const activePackages = useMemo(() => {
    return packages.filter(pkg => pkg.isActive !== false);
  }, [packages]);

  // Profile Completeness Guard
  const isProfileComplete = Boolean(
    currentUser?.isProfileComplete ||
    (currentUser?.birthDate && currentUser?.gender && currentUser?.city && currentUser?.emergencyContact && currentUser?.phone)
  );

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    birthDate: currentUser?.birthDate || '1996-06-15',
    gender: (currentUser?.gender as 'Laki-laki' | 'Perempuan') || 'Laki-laki',
    city: currentUser?.city || 'Jakarta Selatan',
    occupation: currentUser?.occupation || 'Karyawan Swasta',
    emergencyContact: currentUser?.emergencyContact || ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        birthDate: currentUser.birthDate || prev.birthDate,
        gender: currentUser.gender || prev.gender,
        city: currentUser.city || prev.city,
        occupation: currentUser.occupation || prev.occupation,
        emergencyContact: currentUser.emergencyContact || prev.emergencyContact
      }));
    }
  }, [currentUser]);

  // Category Filter for Step 1
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PackageCategory>('ALL');

  // Step 1 State: Package & Schedule
  const [selectedPkgId, setSelectedPkgId] = useState(
    selectedBookingPackageId || activePackages[0]?.id || ''
  );
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(
    selectedBookingPsychologistId || psychologists[0]?.userId || ''
  );
  const [selectedDate, setSelectedDate] = useState(getMinimumBookingDate);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState({ startTime: '', endTime: '' });
  const [dateNotice, setDateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activePackages.length > 0 && !activePackages.some(pkg => pkg.id === selectedPkgId)) {
      setSelectedPkgId(activePackages[0].id);
      setSelectedSlotId('');
      setSelectedSlotTime({ startTime: '', endTime: '' });
    }
  }, [activePackages, selectedPkgId]);

  useEffect(() => {
    if (psychologists.length > 0 && !psychologists.some(item => item.userId === selectedPsychologistId)) {
      setSelectedPsychologistId(psychologists[0].userId);
      setSelectedSlotId('');
      setSelectedSlotTime({ startTime: '', endTime: '' });
    }
  }, [psychologists, selectedPsychologistId]);

  // Step 2 State: Pre-Test Form
  const [intakeData, setIntakeData] = useState({
    occupation: existingIntake?.occupation || currentUser?.occupation || 'Profesional Swasta',
    emergencyName: existingIntake?.emergencyContact?.name || currentUser?.emergencyContact?.split('-')[0]?.trim() || 'Keluarga Pasien',
    emergencyRel: existingIntake?.emergencyContact?.relationship || 'Orang Tua / Pasangan',
    emergencyPhone: existingIntake?.emergencyContact?.phone || currentUser?.emergencyContact?.match(/08\d+/)?.[0] || '0812-3344-5566',
    primaryConcerns: existingIntake?.primaryConcerns || ['Kecemasan Berlebih (Anxiety)'],
    concernDescription: existingIntake?.concernDescription || '',
    currentStressLevel: existingIntake?.currentStressLevel || 6,
    sleepQuality: existingIntake?.sleepQuality || 'Cukup',
    goals: existingIntake?.goals || 'Mendapatkan wawasan klinis dan strategi koping adaptif.'
  });

  // Step 3 State: pembayaran DP sesuai konfigurasi paket
  const [transferSenderName, setTransferSenderName] = useState(currentUser?.name || '');
  const [paymentReference, setPaymentReference] = useState('');
  const [proofName, setProofName] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingPreTest, setIsSavingPreTest] = useState(false);
  const [successApt, setSuccessApt] = useState<Appointment | null>(null);

  const currentPackage = activePackages.find(pkg => pkg.id === selectedPkgId) || activePackages[0] || packages[0];
  const psychologist = psychologists.find(psy => psy.userId === selectedPsychologistId) || psychologists[0];
  const psychologistUser = users.find(user => user.id === selectedPsychologistId);

  const packagePricing = useMemo(() => calculatePackagePayableAmount(currentPackage), [currentPackage]);
  const currentDiscount = packagePricing.discount;
  const subtotalAmount = packagePricing.subtotalAmount;
  const discountAmount = packagePricing.discountAmount;
  const payableAmount = packagePricing.totalAmount;

  const configuredDpAmount = Math.max(currentPackage?.dpAmount ?? 100000, 0);
  const dpAmount = Math.min(configuredDpAmount, payableAmount);
  const finalAmount = Math.max(payableAmount - dpAmount, 0);
  const requiresPayment = payableAmount > 0;

  // Filtered packages for display in Step 1
  const displayedPackages = useMemo(() => {
    if (selectedCategory === 'ALL') return activePackages;
    return activePackages.filter(p => p.category === selectedCategory);
  }, [activePackages, selectedCategory]);

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

    if (date < minimumBookingDate) {
      setDateNotice(`Booking tidak bisa untuk hari yang sama. Minimal tanggal pemesanan adalah ${minimumBookingDate}.`);
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

  // Handle clicking package card
  const handleSelectPackage = (pkgId: string) => {
    if (!isProfileComplete) {
      setIsProfileModalOpen(true);
      return;
    }
    setSelectedPkgId(pkgId);
  };

  // Save patient profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateUserProfile && currentUser?.id) {
      updateUserProfile(currentUser.id, {
        name: profileFormData.name.trim(),
        phone: profileFormData.phone.trim(),
        birthDate: profileFormData.birthDate,
        gender: profileFormData.gender,
        city: profileFormData.city.trim(),
        occupation: profileFormData.occupation.trim(),
        emergencyContact: profileFormData.emergencyContact.trim(),
        isProfileComplete: true
      });
    }
    setIsProfileModalOpen(false);
  };

  // Move from Step 1 to Step 2
  const handleProceedToPreTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileComplete) {
      setIsProfileModalOpen(true);
      return;
    }
    if (!selectedSlotId || !selectedSlotTime.startTime) {
      alert('Silakan pilih salah satu slot jam konsultasi yang tersedia terlebih dahulu.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Move from Step 2 to Step 3 (Save Pre-Test in Context)
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreTest(true);
    if (submitIntakeForm) {
      const savedIntake = await submitIntakeForm({
        patientId,
        birthDate: profileFormData.birthDate || '1996-06-15',
        gender: profileFormData.gender || 'Laki-laki',
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
      if (!savedIntake) {
        setIsSavingPreTest(false);
        return;
      }
    }
    setIsSavingPreTest(false);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submit booking dengan pembayaran yang dihitung dari paket aktif
  const handleFinalSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresPayment && !transferSenderName.trim()) {
      alert('Mohon cantumkan nama pemilik rekening pengirim yang melakukan transfer.');
      return;
    }
    if (requiresPayment && !proofName.trim()) {
      alert('Mohon unggah bukti pembayaran transfer DP administrasi.');
      return;
    }
    if (!consentAgreed) {
      alert('Mohon setujui informed consent dan kebijakan privasi sebelum mengirim booking.');
      return;
    }
    if (!currentPackage || !psychologist) {
      alert('Paket atau psikolog tidak tersedia. Silakan kembali dan pilih ulang layanan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await bookAppointment({
        patientId,
        patientName: profileFormData.name || currentUser?.name || 'Pasien',
        patientEmail: currentUser?.email || 'pasien@jiwasehat.id',
        psychologistId: psychologist?.userId || selectedPsychologistId,
        packageId: currentPackage.id,
        date: selectedDate,
        slotId: selectedSlotId,
        startTime: selectedSlotTime.startTime,
        endTime: selectedSlotTime.endTime,
        paymentMethod: requiresPayment ? 'TRANSFER_BANK_DP' : undefined,
        paymentChannelDetail: requiresPayment ? 'BCA - 8830-1122-3344' : undefined,
        transferSenderName: transferSenderName.trim(),
        paymentReference: paymentReference.trim(),
        paymentProofUrl: proofName.trim()
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
      {/* MODAL LENGKAPI DATA DIRI PASIEN */}
      {isProfileModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lengkapi Data Diri Pasien</h3>
                  <p className="text-[11px] text-slate-500">Wajib diisi sebelum dapat memilih paket & jadwal konsultasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileFormData.name}
                  onChange={e => setProfileFormData({ ...profileFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="Nama lengkap sesuai KTP"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFormData.phone}
                    onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileFormData.gender}
                    onChange={e => setProfileFormData({ ...profileFormData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={profileFormData.birthDate}
                    onChange={e => setProfileFormData({ ...profileFormData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Domisili <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFormData.city}
                    onChange={e => setProfileFormData({ ...profileFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: Jakarta Selatan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pekerjaan / Profesi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFormData.occupation}
                    onChange={e => setProfileFormData({ ...profileFormData, occupation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: Karyawan Swasta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kontak Darurat (Kerabat) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFormData.emergencyContact}
                    onChange={e => setProfileFormData({ ...profileFormData, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: Rina (Istri) - 0812-xxx"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Buka Pilihan Paket</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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
              {successApt.totalAmount > 0
                ? 'Pengajuan jadwal, pre-test, dan bukti pembayaran DP telah diterima untuk diverifikasi admin.'
                : 'Pengajuan jadwal dan pre-test telah diterima. Admin akan memeriksa ketersediaan dan mengonfirmasi booking.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 max-w-lg mx-auto text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">KODE BOOKING</span>
              <strong className="font-bold text-slate-900 text-sm">{successApt.bookingCode}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">NAMA PASIEN</span>
              <strong className="text-slate-900">{successApt.patientName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">PAKET LAYANAN</span>
              <strong className="text-slate-900">{successApt.packageName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">JADWAL KONSULTASI</span>
              <strong className="text-slate-900">{successApt.date} | {successApt.startTime} - {successApt.endTime} WIB</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">LOKASI PRAKTIK</span>
              <strong className="text-slate-900">{successApt.meetingLocation}</strong>
            </div>
            {!!successApt.discountAmount && successApt.discountAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-800">
                <span className="font-medium">{successApt.discountLabel || 'POTONGAN PENGELOLA'}</span>
                <strong>- Rp {successApt.discountAmount.toLocaleString('id-ID')}</strong>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">TOTAL SETELAH POTONGAN</span>
              <strong className="text-slate-900 font-bold">Rp {successApt.totalAmount.toLocaleString('id-ID')}</strong>
            </div>
            {successApt.totalAmount > 0 ? (
              <div className="flex justify-between py-1 border-b border-slate-200 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-emerald-950 font-bold block">DP PAKET</span>
                  <span className="text-[10px] text-emerald-800">Nama Rekening Pengirim: {transferSenderName || 'Terlampir'}</span>
                </div>
                <strong className="text-emerald-900 font-black text-sm">
                  Rp {(successApt.dpAmount ?? dpAmount).toLocaleString('id-ID')} (Menunggu Verifikasi)
                </strong>
              </div>
            ) : (
              <div className="flex justify-between py-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                <span>PEMBAYARAN</span>
                <strong>Tidak diperlukan</strong>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">SISA PELUNASAN DI KLINIK</span>
              <strong className="text-slate-900 font-bold">Rp {(successApt.remainingAmount ?? finalAmount).toLocaleString('id-ID')}</strong>
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
        /* WIZARD FLOW */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          {/* Breadcrumbs Header */}
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
                  Data Diri & Paket
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
                  Konfirmasi
                </span>
              </div>
            </div>
          </div>

          {/* STEP 1: PILIH PAKET & JADWAL */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToPreTest} className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 1: Lengkapi Data Diri & Pilih Paket</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pasien wajib melengkapi data diri terlebih dahulu sebelum memilih paket konsultasi dan jam praktik.
                </p>
              </div>

              {/* DATA DIRI STATUS BANNER */}
              {!isProfileComplete ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-200 rounded-xl text-amber-900 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-amber-950">
                        Data Diri Pasien Belum Lengkap
                      </h4>
                      <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                        Sesuai ketentuan standar praktik psikolog, Anda wajib mengisi data diri pasien terlebih dahulu sebelum dapat memilih paket konsultasi. Pilihan paket saat ini dikunci.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-amber-800">
                      Status: 🔒 Terkunci (Perlu Pengisian Profil)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Isi & Lengkapi Data Diri Pasien</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-200/80 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        Data Diri Pasien: {profileFormData.name || currentUser?.name} (Terverifikasi)
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        No. HP: {profileFormData.phone || currentUser?.phone} • Domisili: {profileFormData.city || currentUser?.city}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Data Diri</span>
                  </button>
                </div>
              )}

              {/* Paket Selector Cards with Category Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Pilih Paket Layanan:
                  </label>

                  {/* Filter kategori */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === 'ALL'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua ({activePackages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('KONSELING')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === 'KONSELING'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Konseling ({activePackages.filter(p => p.category === 'KONSELING').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ASESMEN')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === 'ASESMEN'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Asesmen ({activePackages.filter(p => p.category === 'ASESMEN').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('PSIKOTERAPI')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === 'PSIKOTERAPI'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Psikoterapi ({activePackages.filter(p => p.category === 'PSIKOTERAPI').length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedPackages.map(pkg => {
                    const isSelected = selectedPkgId === pkg.id;
                    const pricing = calculatePackagePayableAmount(pkg);

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg.id)}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                          !isProfileComplete
                            ? 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-90'
                            : isSelected
                            ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {!isProfileComplete && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Terkunci
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2 pr-12">
                          <div>
                            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                              {pkg.category || 'LAYANAN'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{pkg.name}</h4>
                          </div>
                        </div>

                        {pkg.badge && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {pkg.badge}
                          </span>
                        )}

                        <div className="text-emerald-700 font-black text-sm mt-1.5">
                          Rp {pricing.totalAmount.toLocaleString('id-ID')}
                          {pricing.discount && (
                            <span className="block text-[10px] text-slate-400 line-through font-bold">
                              Rp {pkg.price.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        {pricing.discount && (
                          <div className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                            {pricing.discount.label}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Durasi {pkg.durationMinutes} Menit</span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>

                        {pkg.notes && (
                          <div className="text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200 mt-2 leading-tight">
                            * {pkg.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tanggal & Slot Konsultasi */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,280px)_1fr] gap-4 lg:items-end">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Tanggal Konsultasi <span className="text-slate-400">(Minimal H+1)</span>
                      </label>
                      <input
                        type="date"
                        min={minimumBookingDate}
                        value={selectedDate}
                        onChange={e => handleDateChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      />
                      {dateNotice && (
                        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {dateNotice}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">Durasi Paket</span>
                        <strong className="text-sm text-slate-900">{currentPackage?.durationMinutes || 60} Menit</strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">Sisa Kuota</span>
                        <strong className="text-sm text-slate-900">{dynamicSchedule.remainingQuota} / {dynamicSchedule.maxPatients} Pasien</strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">Paket Dipilih</span>
                        <strong className="text-sm text-slate-900 line-clamp-1">{currentPackage?.name || 'Paket Konsultasi'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilih Jam Praktik Tersedia
                    </label>
                    <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                      {dynamicSchedule.slots.filter(slot => slot.isAvailable).length} slot tersedia
                    </span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                    {dynamicSchedule.slots.map(slot => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => handleSelectSlot(slot)}
                          className={`min-h-[58px] p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : slot.isAvailable
                              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                              : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black whitespace-nowrap">{slot.startTime} - {slot.endTime}</div>
                            <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {slot.isAvailable ? slot.label : 'Penuh'}
                            </span>
                          </div>
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white text-emerald-700 border-white'
                              : slot.isAvailable
                              ? 'border-slate-200 text-transparent'
                              : 'border-slate-200 text-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <span className="sr-only">
                            {slot.isAvailable ? slot.label : 'Penuh'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!selectedSlotId || !isProfileComplete}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Lanjut: Isi Pre-Test (Langkah 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ISI PRE-TEST */}
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
                  disabled={isSavingPreTest}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{isSavingPreTest ? 'Menyimpan Pre-Test...' : 'Lanjut: Konfirmasi Booking (Langkah 3)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: KONFIRMASI RINCIAN DAN PEMBAYARAN */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmitBooking} className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 3: Konfirmasi Rincian Booking</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {requiresPayment
                    ? `Bayar DP Rp ${dpAmount.toLocaleString('id-ID')} sesuai paket untuk mengunci jadwal, lalu unggah bukti pembayaran.`
                    : 'Paket ini tidak memerlukan pembayaran. Periksa rincian dan consent sebelum mengirim booking.'}
                </p>
              </div>

              {/* Rincian Pesanan Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Nama Pasien</span>
                  <strong className="text-slate-900">{profileFormData.name || currentUser?.name}</strong>
                </div>
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
                  <strong className="text-slate-900">Ruang Praktik JiwaSehat Senopati Lt. 3 (Tatap Muka)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">Total Biaya Paket</span>
                  <span className="font-bold text-slate-900">Rp {subtotalAmount.toLocaleString('id-ID')}</span>
                </div>

                {currentDiscount && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex justify-between text-emerald-900">
                      <span className="font-bold uppercase text-[10px]">{currentDiscount.label}</span>
                      <strong>- Rp {discountAmount.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-emerald-200 text-emerald-950">
                      <span className="font-bold uppercase text-[10px]">Total Setelah Potongan</span>
                      <span className="font-black">Rp {payableAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}

                {/* DP ADMINISTRASI HIGHLIGHT */}
                <div className="flex justify-between py-2 border-b border-slate-200 bg-emerald-50/90 p-3 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-emerald-950 font-black block">{requiresPayment ? 'DP Paket (Bayar Sekarang)' : 'Tanpa Pembayaran'}</span>
                    <span className="text-[10px] text-emerald-800">{requiresPayment ? 'Sebagai syarat mengunci jadwal dan persiapan berkas' : 'Total paket setelah diskon adalah Rp 0'}</span>
                  </div>
                  <strong className="text-emerald-900 font-black text-base">
                    Rp {dpAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <div className="flex justify-between py-1 text-slate-600">
                  <span>Sisa Pelunasan di Klinik (Saat Hadir / Selesai Sesi):</span>
                  <span className="font-bold text-slate-900">Rp {finalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {requiresPayment && (
                <>
              {/* Bank Account Info Card */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Rekening Pembayaran DP Administrasi Klinik:
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

              {/* INPUT NAMA YANG TRANSFER (WAJIB) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nama Pengirim / Pemilik Rekening Transfer <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  required={requiresPayment}
                  value={transferSenderName}
                  onChange={e => setTransferSenderName(e.target.value)}
                  placeholder="Ketik nama lengkap sesuai rekening pengirim m-banking..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Wajib dicantumkan agar bagian administrasi klinik dapat memvalidasi mutasi bank Anda dengan cepat.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Nomor Referensi / Kode Transaksi:
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={e => setPaymentReference(e.target.value)}
                  placeholder="Opsional, isi jika ada di bukti transfer..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500">
                  Nomor referensi membantu admin mencocokkan bukti pembayaran dengan mutasi bank.
                </p>
              </div>

              {/* UPLOAD BUKTI TRANSFER DP 100RB (WAJIB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Upload Bukti Pembayaran DP (Rp {dpAmount.toLocaleString('id-ID')}) <span className="text-rose-600">*</span>:
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-600">
                    Unggah tangkapan layar struk / bukti transfer sebesar Rp {dpAmount.toLocaleString('id-ID')}
                  </div>
                  <input
                    type="text"
                    required={requiresPayment}
                    value={proofName}
                    onChange={e => setProofName(e.target.value)}
                    placeholder="Ketik nama file bukti transfer (misal: bukti_dp_bca.jpg)..."
                    className="w-full max-w-sm mx-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProofName('struk_dp_bca.jpg')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                    >
                      Gunakan File Simulasi Demo (struk_dp_bca.jpg)
                    </button>
                  </div>
                </div>
              </div>
                </>
              )}

              <label className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={e => setConsentAgreed(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 mt-0.5 shrink-0"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Saya menyetujui informed consent & kebijakan privasi.</strong>
                  <br />
                  Data pre-test digunakan untuk profiling awal dan persiapan sesi konsultasi, bukan diagnosis otomatis. Data saya diproses sesuai prinsip kerahasiaan praktik psikologi.
                </span>
              </label>

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
                  disabled={isSubmitting || !proofName || !transferSenderName.trim() || !consentAgreed}
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
