import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Check,
  Lock,
  Edit2,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import {
  loadScheduleSettings,
  computeDynamicSlotsForDate,
  SCHEDULE_SETTINGS_STORAGE_KEY,
  SCHEDULE_SETTINGS_UPDATED_EVENT
} from '../../../data/scheduleConfig';
import { calculatePackagePayableAmount } from '../../../utils/discounts';
import { calculateInitialDp } from '../../../utils/payments';
import { CONSENT_VERSION, PRIVACY_VERSION, getMinimumBookingDate } from '../../../utils/bookingPolicy';
import { ServicePicker } from '../ServicePicker';
import { Tooltip } from '../../common/Tooltip';
import { useApp } from '../../../context/AppContextCore';
import { findActivePatientHold } from '../../../utils/workflowStore';
import { INITIAL_LANDING_CMS } from '../../../data/cmsDefaults';
import {useServerAvailability} from '../../../integration/useServerAvailability';
import {calendarToView} from '../../../integration/mapping';

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
  bookAppointment: (data: any) => Promise<{ success: boolean; appointment?: Appointment; message?: string; reconciliationId?: string }>;
  submitIntakeForm?: (form: Omit<IntakeForm, 'id' | 'completedAt'>) => Promise<IntakeForm | null>;
  updateUserProfile?: (userId: string, data: Partial<User>) => void;
  onNavigateTab: (tabId: 'history' | 'overview') => void;
}

const getLocalDateString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
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
  const { reserveBookingSlot, slotHolds, landingCms,server } = useApp();
  const initialHold = useRef(findActivePatientHold(slotHolds, patientId)).current;
  const [holdId, setHoldId] = useState(initialHold?.id || '');
  const hold = slotHolds.find(item => item.id === holdId);
  const paymentChannel = hold?.paymentChannelDetail || (server?server.workspace.payment_instructions:`${INITIAL_LANDING_CMS.bankName} - ${INITIAL_LANDING_CMS.bankAccountNumber}`);
  const accountHolder = hold?.accountHolder || (server?landingCms.bankAccountHolder:INITIAL_LANDING_CMS.bankAccountHolder);
  const [clock, setClock] = useState(Date.now());
  const [reconciliationId, setReconciliationId] = useState('');
  useEffect(() => {
    const nextExpiry = Math.min(...slotHolds.filter(item => item.status === 'HELD').map(item => Date.parse(item.expiresAt)).filter(time => time > Date.now()));
    if (!Number.isFinite(nextExpiry)) return;
    const timer = window.setTimeout(() => setClock(Date.now()), Math.max(1, nextExpiry - Date.now() + 25));
    return () => window.clearTimeout(timer);
  }, [slotHolds, clock]);
  const holdActive = hold?.status === 'HELD' && Date.parse(hold.expiresAt) > clock;
  const minimumBookingDate = getMinimumBookingDate();
  // Wizard Step: 1 = Pilih Jadwal & Paket, 2 = Isi Pre-Test, 3 = Konfirmasi
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialHold ? 3 : 1);

  // Active packages filter (ignore legacy inactive packages)
  const activePackages = useMemo(() => {
    return packages.filter(pkg => pkg.isActive !== false && (!server || server.workspace.packages.find(p=>p.id===pkg.id)?.is_bookable));
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
  }, [JSON.stringify(currentUser)]);

  // Step 1 State: Package & Schedule
  const [selectedPkgId, setSelectedPkgId] = useState(
    initialHold?.packageId || selectedBookingPackageId || activePackages[0]?.id || ''
  );
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(
    initialHold?.psychologistId || selectedBookingPsychologistId || psychologists[0]?.userId || ''
  );
  const [selectedDate, setSelectedDate] = useState(initialHold?.date || getMinimumBookingDate());
  const [selectedSlotId, setSelectedSlotId] = useState(initialHold?.id || '');
  const [selectedSlotTime, setSelectedSlotTime] = useState({ startTime: initialHold?.startTime || '', endTime: initialHold?.endTime || '' });
  const [dateNotice, setDateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep === 1 && activePackages.length > 0 && !activePackages.some(pkg => pkg.id === selectedPkgId)) {
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
    occupation: existingIntake?.occupation || currentUser?.occupation || '',
    emergencyName: existingIntake?.emergencyContact?.name || '',
    emergencyRel: existingIntake?.emergencyContact?.relationship || '',
    emergencyPhone: existingIntake?.emergencyContact?.phone || '',
    primaryConcerns: existingIntake?.primaryConcerns || [],
    concernDescription: existingIntake?.concernDescription || '',
    currentStressLevel: existingIntake?.currentStressLevel || 6,
    sleepQuality: existingIntake?.sleepQuality || '',
    goals: existingIntake?.goals || ''
  });

  // Step 3 State: pembayaran DP flat Rp100.000
  const [transferSenderName, setTransferSenderName] = useState(currentUser?.name || '');
  const [proofName, setProofName] = useState('');
  const [proofDataUrl, setProofDataUrl] = useState('');
  const [proofMimeType, setProofMimeType] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [payInFull, setPayInFull] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingPreTest, setIsSavingPreTest] = useState(false);
  const [successApt, setSuccessApt] = useState<Appointment | null>(null);
  const [preTestId, setPreTestId] = useState<string | undefined>(initialHold ? existingIntake?.id : undefined);

  const currentPackage = currentStep === 3 && hold ? hold.packageSnapshot??packages.find(pkg => pkg.id === hold.packageId)
    : activePackages.find(pkg => pkg.id === selectedPkgId) || activePackages[0];
  const previousSlotContext = useRef(`${currentPackage?.id}:${currentPackage?.durationMinutes}:${selectedPsychologistId}`);
  useEffect(() => {
    const context = `${currentPackage?.id}:${currentPackage?.durationMinutes}:${selectedPsychologistId}`;
    if (previousSlotContext.current === context) return;
    previousSlotContext.current = context;
    setSelectedSlotId('');
    setSelectedSlotTime({ startTime: '', endTime: '' });
  }, [currentPackage?.id, currentPackage?.durationMinutes, selectedPsychologistId]);
  const psychologist = psychologists.find(psy => psy.userId === selectedPsychologistId) || psychologists[0];
  const psychologistUser = users.find(user => user.id === selectedPsychologistId);

  const packagePricing = useMemo(() => calculatePackagePayableAmount(currentPackage), [currentPackage]);
  const currentDiscount = packagePricing.discount;
  const subtotalAmount = packagePricing.subtotalAmount;
  const discountAmount = packagePricing.discountAmount;
  const payableAmount = packagePricing.totalAmount;
  const quoteMatchesHold = hold?.totalAmount === payableAmount && hold?.packageId === currentPackage?.id;

  const dpAmount = calculateInitialDp(payableAmount);
  const agreedAmount = payableAmount * (currentPackage?.type === 'PSYCHOTHERAPY' ? 4 : 1);
  const initialPayAmount = payInFull ? agreedAmount : dpAmount;
  const finalAmount = Math.max(agreedAmount - initialPayAmount, 0);
  const requiresPayment = (currentStep === 3 && hold ? hold.totalAmount : payableAmount) > 0;

  const [pricingNotice, setPricingNotice] = useState('');
  const quoteKey = `${currentPackage?.id}:${payableAmount}`;
  const previousQuote = useRef(quoteKey);
  useEffect(() => {
    if (previousQuote.current !== quoteKey) {
      setConsentAgreed(false);
      if (currentStep === 3) setPricingNotice('Tarif layanan berubah. Periksa kembali rincian dan berikan persetujuan sebelum mengirim booking.');
      previousQuote.current = quoteKey;
    }
  }, [quoteKey, currentStep]);

  // Dynamic slot calculation from psychologist weekly settings and package duration
  const [scheduleSettings, setScheduleSettings] = useState(()=>server?calendarToView(server.workspace.calendar):loadScheduleSettings());
  useEffect(() => {
    if(server)return;
    const sync = () => {
      setScheduleSettings(loadScheduleSettings());
      setSelectedSlotId('');
      setSelectedSlotTime({ startTime: '', endTime: '' });
    };
    const onStorage = (event: StorageEvent) => { if (event.key === SCHEDULE_SETTINGS_STORAGE_KEY) sync(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener(SCHEDULE_SETTINGS_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SCHEDULE_SETTINGS_UPDATED_EVENT, sync);
    };
  }, []);
  const localDynamicSchedule = useMemo(() => {
    if(server)return null;
    return computeDynamicSlotsForDate(
      selectedDate,
      scheduleSettings,
      appointments,
      selectedPsychologistId,
      currentPackage?.durationMinutes || 60,
      holdId
    );
  }, [selectedDate, selectedPsychologistId, appointments, currentPackage, scheduleSettings, slotHolds, holdId, clock]);
  const serverSchedule=useServerAvailability(selectedDate,currentPackage?.durationMinutes||60,selectedPsychologistId,undefined,currentStep===1);
  const dynamicSchedule=serverSchedule??localDynamicSchedule!;

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
    setSelectedSlotId('');
    setSelectedSlotTime({ startTime: '', endTime: '' });
  };

  // Save patient profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if(server&&currentUser){const saved=await server.saveProfile(currentUser.id,{...profileFormData,name:profileFormData.name.trim(),phone:profileFormData.phone.trim()});if(saved)setIsProfileModalOpen(false);return;}
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
    if (!currentPackage || !selectedSlotId || !selectedSlotTime.startTime) {
      alert('Silakan pilih salah satu slot jam konsultasi yang tersedia terlebih dahulu.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Move from Step 2 to Step 3 (Save Pre-Test in Context)
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if(server&&!consentAgreed){setPricingNotice('Setujui persetujuan layanan sebelum membuat reservasi.');return;}
    server?.acceptConsent(consentAgreed);
    setIsSavingPreTest(true);
    try {
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
        currentStressLevel: intakeData.currentStressLevel,
        sleepQuality: intakeData.sleepQuality as any,
        goals: intakeData.goals
      });
      if (!savedIntake) {
        setIsSavingPreTest(false);
        return;
      }
      setPreTestId(savedIntake.id);
    }
    if (!currentPackage) return;
    const reserved = await reserveBookingSlot({ packageId: currentPackage.id, psychologistId: selectedPsychologistId,
      date: selectedDate, startTime: selectedSlotTime.startTime, endTime: selectedSlotTime.endTime });
    if (!reserved) {
      setPricingNotice('Slot belum berhasil direservasi. Jangan melakukan transfer; pilih kembali jadwal yang tersedia.');
      setCurrentStep(1);
      return;
    }
    setHoldId(reserved.id);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setPricingNotice(error instanceof Error ? error.message : 'Pre-test atau reservasi gagal disimpan. Coba kembali.');
    } finally {
      setIsSavingPreTest(false);
    }
  };

  // Final submit booking dengan pembayaran yang dihitung dari paket aktif
  const handleFinalSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hold) {
      setPricingNotice('Reservasi tidak tersedia. Jangan transfer ulang; hubungi admin bila sudah membayar.');
      return;
    }
    if (requiresPayment && !transferSenderName.trim()) {
      alert('Mohon cantumkan nama pemilik rekening pengirim yang melakukan transfer.');
      return;
    }
    if (requiresPayment && (!proofName.trim() || !proofDataUrl.trim())) {
      alert('Mohon unggah bukti pembayaran DP konsultasi.');
      return;
    }
    if (!consentAgreed) {
      alert('Mohon setujui informed consent dan kebijakan privasi sebelum mengirim booking.');
      return;
    }
    if (!preTestId) {
      setCurrentStep(2);
      return;
    }
    if (!psychologist) {
      alert('Paket atau psikolog tidak tersedia. Silakan kembali dan pilih ulang layanan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await bookAppointment({
        patientId,
        patientName: profileFormData.name || currentUser?.name || 'Pasien',
        patientEmail: currentUser?.email || 'pasien@jiwasehat.id',
        psychologistId: hold.psychologistId,
        packageId: hold.packageId,
        date: hold.date,
        slotId: selectedSlotId,
        startTime: hold.startTime,
        endTime: hold.endTime,
        paymentMethod: requiresPayment ? `TRANSFER_BANK_${payInFull ? 'FULL' : 'DP'}` : undefined,
        initialPaymentScope: payInFull && currentPackage?.type === 'PSYCHOTHERAPY' ? 'PLAN' : 'SESSION',
        paymentChannelDetail: requiresPayment ? paymentChannel : undefined,
        transferSenderName: transferSenderName.trim(),
        paymentProofUrl: proofDataUrl,
        paymentProofName: proofName.trim(),
        paymentProofMimeType: proofMimeType,
        preTestId,
        consentGiven: consentAgreed,
        consentVersion: CONSENT_VERSION,
        privacyVersion: PRIVACY_VERSION,
        expectedTotalAmount: payableAmount,
        slotHoldId: hold.id
      });

      if (res.success && res.appointment) {
        setSuccessApt(res.appointment);
      } else {
        if (res.reconciliationId) setReconciliationId(res.reconciliationId);
        setPricingNotice(res.message || 'Booking belum berhasil. Periksa layanan dan jadwal yang dipilih.');
      }
    } catch (err) {
      setPricingNotice(err instanceof Error ? err.message : 'Booking gagal disimpan. Jangan transfer ulang; periksa riwayat atau hubungi admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProofFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProofName('');
      setProofDataUrl('');
      setProofMimeType('');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format bukti harus JPG, PNG, WEBP, atau PDF.');
      event.target.value = '';
      return;
    }

    if (file.size > 1_500_000) {
      alert('Ukuran bukti maksimal 1,5 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setProofName(file.name);
      setProofDataUrl(reader.result);
      setProofMimeType(file.type);
    };
    reader.onerror = () => {
      alert('Bukti pembayaran gagal dibaca. Silakan pilih file lain.');
      setProofName('');
      setProofDataUrl('');
      setProofMimeType('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* MODAL LENGKAPI DATA DIRI PASIEN */}
      {isProfileModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="viewport-dialog bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn my-auto">
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
              <span className="text-slate-400 font-medium">
                {successApt.packageType === 'ONLINE_TELE' ? 'METODE SESI' : 'LOKASI PRAKTIK'}
              </span>
              <strong className="text-slate-900">{successApt.meetingLocation}</strong>
            </div>
            {!!successApt.discountAmount && successApt.discountAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-800">
                <span className="font-medium">{successApt.discountLabel || 'POTONGAN PENGELOLA'}</span>
                <strong>- Rp {successApt.discountAmount.toLocaleString('id-ID')}</strong>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">{successApt.packageType === 'PSYCHOTHERAPY' ? 'TARIF SETELAH POTONGAN' : 'TOTAL SETELAH POTONGAN'}</span>
              <strong className="text-slate-900 font-bold">{successApt.packageType === 'PSYCHOTHERAPY' ? `Rp ${Math.round(successApt.totalAmount / (successApt.billingMode === 'PER_SESSION' ? 1 : Math.max(successApt.continuousSessionTotal || 4, 4))).toLocaleString('id-ID')} / sesi` : `Rp ${successApt.totalAmount.toLocaleString('id-ID')}`}</strong>
            </div>
            {successApt.packageType === 'PSYCHOTHERAPY' && (
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-400 font-medium">KESEPAKATAN 4 SESI</span>
                <strong className="text-slate-900 font-bold">Rp {(successApt.totalAmount * 4).toLocaleString('id-ID')}</strong>
              </div>
            )}
            {successApt.totalAmount > 0 ? (
              <div className="flex flex-wrap justify-between gap-2 py-1 border-b border-slate-200 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-emerald-950 font-bold block">PENGAJUAN PEMBAYARAN AWAL</span>
                  <span className="text-[10px] text-emerald-800">Nama Rekening Pengirim: {transferSenderName || 'Terlampir'}</span>
                </div>
                <strong className="text-emerald-900 font-black text-sm">
                  Rp {initialPayAmount.toLocaleString('id-ID')} (Menunggu Verifikasi)
                </strong>
              </div>
            ) : (
              <div className="flex justify-between py-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                <span>PEMBAYARAN</span>
                <strong>Tidak diperlukan</strong>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-400 font-medium">STATUS PEMBAYARAN</span>
              <strong className="text-slate-900 font-bold">Menunggu pemeriksaan Admin</strong>
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
        <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs ${currentStep === 2 ? 'space-y-4 p-4 sm:p-5' : 'space-y-6 p-5 sm:p-8'}`}>
          {/* Breadcrumbs Header */}
          <div className={`border-b border-slate-100 ${currentStep === 2 ? 'pb-3' : 'pb-5'}`}>
            <div className="mx-auto flex max-w-xl items-center justify-between gap-2 text-xs">
              {/* Step 1 */}
              <div className="flex min-w-0 items-center gap-1.5" aria-label="Langkah 1: Data Diri dan Paket" aria-current={currentStep === 1 ? 'step' : undefined}>
                <div
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  1
                </div>
                <span className={`min-w-0 font-bold leading-4 ${currentStep === 1 ? 'text-slate-900' : 'hidden text-slate-400 sm:inline'}`}>
                  Data Diri & Paket
                </span>
              </div>

              <div className="h-0.5 min-w-3 max-w-12 flex-1 bg-slate-200" />

              {/* Step 2 */}
              <div className="flex min-w-0 items-center gap-1.5" aria-label="Langkah 2: Isi Pre-Test" aria-current={currentStep === 2 ? 'step' : undefined}>
                <div
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  2
                </div>
                <span className={`min-w-0 font-bold leading-4 ${currentStep === 2 ? 'text-slate-900' : 'hidden text-slate-400 sm:inline'}`}>
                  Isi Pre-Test
                </span>
              </div>

              <div className="h-0.5 min-w-3 max-w-12 flex-1 bg-slate-200" />

              {/* Step 3 */}
              <div className="flex min-w-0 items-center gap-1.5" aria-label="Langkah 3: Konfirmasi" aria-current={currentStep === 3 ? 'step' : undefined}>
                <div
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  3
                </div>
                <span className={`min-w-0 font-bold leading-4 ${currentStep === 3 ? 'text-slate-900' : 'hidden text-slate-400 sm:inline'}`}>
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

              <ServicePicker
                packages={activePackages}
                selectedId={selectedPkgId}
                onSelect={handleSelectPackage}
                disabled={!isProfileComplete}
              />

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
            <form onSubmit={handleProceedToPayment} className="space-y-3" aria-busy={isSavingPreTest}>
              <div>
                <h3 className="text-base font-bold text-slate-900">Langkah 2: Formulir Pre-Test Pasien</h3>
                <p className="mt-1 text-xs leading-4 text-slate-500">
                  Informasi awal untuk membantu psikolog mempersiapkan sesi konsultasi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 lg:grid-cols-4">
                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <label htmlFor="pretest-occupation" className="mb-1 block text-xs font-semibold leading-4 text-slate-700">Pekerjaan / Aktivitas Utama</label>
                  <input
                    id="pretest-occupation"
                    type="text"
                    required
                    value={intakeData.occupation}
                    onChange={e => setIntakeData({ ...intakeData, occupation: e.target.value })}
                    className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: Pegawai Swasta / Mahasiswa"
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="pretest-emergency-name" className="mb-1 block min-h-8 text-xs font-semibold leading-4 text-slate-700 sm:min-h-4">
                    Nama Kontak Darurat
                  </label>
                  <input
                    id="pretest-emergency-name"
                    type="text"
                    required
                    value={intakeData.emergencyName}
                    onChange={e => setIntakeData({ ...intakeData, emergencyName: e.target.value })}
                    className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nama kerabat"
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="pretest-emergency-relationship" className="mb-1 block min-h-8 text-xs font-semibold leading-4 text-slate-700 sm:min-h-4">Hubungan dengan Pasien</label>
                  <input id="pretest-emergency-relationship" required value={intakeData.emergencyRel} onChange={event => setIntakeData({ ...intakeData, emergencyRel: event.target.value })} placeholder="Contoh: Orang tua" className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <label htmlFor="pretest-emergency-phone" className="mb-1 block text-xs font-semibold leading-4 text-slate-700">Telepon Kontak Darurat</label>
                  <input id="pretest-emergency-phone" required type="tel" value={intakeData.emergencyPhone} onChange={event => setIntakeData({ ...intakeData, emergencyPhone: event.target.value })} placeholder="Nomor telepon kerabat" className="h-10 w-full min-w-0 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <fieldset className="min-w-0 border-t border-slate-100 pt-2">
                <legend className="pr-2 text-xs font-semibold text-slate-700">Keluhan Utama yang Dirasakan</legend>
                <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
                  {[
                    'Kecemasan Berlebih (Anxiety)',
                    'Burnout Pekerjaan',
                    'Sulit Tidur / Insomnia',
                    'Depresi & Rasa Hampa',
                    'Konflik Pasangan / Keluarga',
                    'Trauma Masa Lalu',
                    'Kesulitan Mengontrol Emosi',
                    'Lainnya'
                  ].map(concern => {
                    const isSelected = intakeData.primaryConcerns.includes(concern);
                    return (
                      <label
                        key={concern}
                        className={`flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs leading-4 transition-colors ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => handleToggleConcern(concern)} className="h-4 w-4 shrink-0 accent-emerald-600" />
                        <span className="min-w-0 break-words">{concern}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="pretest-concern-description" className="mb-1 block text-xs font-semibold leading-4 text-slate-700">Deskripsi Keluhan Lebih Lanjut</label>
                  <textarea
                    id="pretest-concern-description"
                    rows={2}
                    required
                    value={intakeData.concernDescription}
                    onChange={e => setIntakeData({ ...intakeData, concernDescription: e.target.value })}
                    placeholder="Ceritakan singkat keluhan yang Anda alami..."
                    className="block min-h-20 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="pretest-goals" className="mb-1 block text-xs font-semibold leading-4 text-slate-700">Harapan Konsultasi <span className="font-normal text-slate-400">(Opsional)</span></label>
                  <textarea id="pretest-goals" rows={2} value={intakeData.goals} onChange={event => setIntakeData({ ...intakeData, goals: event.target.value })} placeholder="Harapan Anda dari sesi konsultasi" className="block min-h-20 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs leading-4">
                    <label htmlFor="pretest-stress" className="font-semibold text-slate-700">Tingkat Stres Saat Ini</label>
                    <output htmlFor="pretest-stress" className="shrink-0 font-bold tabular-nums text-emerald-700">{intakeData.currentStressLevel}/10</output>
                  </div>
                  <input
                    id="pretest-stress"
                    type="range"
                    min={1}
                    max={10}
                    aria-valuetext={`${intakeData.currentStressLevel} dari 10`}
                    value={intakeData.currentStressLevel}
                    onChange={e => setIntakeData({ ...intakeData, currentStressLevel: Number(e.target.value) })}
                    className="block h-10 w-full accent-emerald-600"
                  />
                </div>

                <div className="min-w-0">
                  <label htmlFor="pretest-sleep" className="mb-1 block text-xs font-semibold leading-4 text-slate-700">Kualitas Tidur</label>
                  <select
                    id="pretest-sleep"
                    required
                    value={intakeData.sleepQuality}
                    onChange={e => setIntakeData({ ...intakeData, sleepQuality: e.target.value as any })}
                    className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" disabled>Pilih kualitas tidur</option>
                    <option value="Baik">Baik (Nyenyak 7-8 jam)</option>
                    <option value="Cukup">Cukup (Sering terbangun)</option>
                    <option value="Buruk">Buruk (Sulit memulai tidur)</option>
                    <option value="Insomnia Akut">Insomnia Akut (Hanya 2-3 jam)</option>
                  </select>
                </div>
              </div>

              {server&&<div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-xs text-slate-700"><details><summary className="font-bold cursor-pointer">Persetujuan layanan dan privasi</summary><p className="mt-2 whitespace-pre-wrap">{server.workspace.consent?.payload.body}</p><a href="/informasi/privacy" target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-teal-700 underline">Baca kebijakan privasi</a></details><label className="mt-3 flex gap-2"><input required type="checkbox" checked={consentAgreed} onChange={e=>setConsentAgreed(e.target.checked)}/><span>Saya menyetujui layanan, pengelolaan data, serta pengiriman jadwal/link melalui WhatsApp ke nomor profil saya. Pre-test ini untuk profiling, bukan diagnosis.</span></label></div>}
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Tooltip content="Kembali ke jadwal">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    aria-label="Kembali ke jadwal"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:w-auto sm:px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Kembali ke Jadwal</span>
                  </button>
                </Tooltip>

                <button
                  type="submit"
                  disabled={isSavingPreTest}
                  className="flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <span className="min-w-0 break-words">{isSavingPreTest ? 'Menyimpan...' : 'Konfirmasi Booking'}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: KONFIRMASI RINCIAN DAN PEMBAYARAN */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmitBooking} className="space-y-6">
              <p role="status" className={`text-xs font-semibold ${holdActive ? 'text-teal-800' : 'text-amber-800'}`}>
                {reconciliationId ? `Pencocokan pembayaran: ${reconciliationId}. Jangan transfer ulang; hubungi admin.` : holdActive
                  ? `Slot direservasi sampai ${new Date(hold!.expiresAt).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })} WIB.`
                  : 'Reservasi kedaluwarsa. Jangan transfer. Jika sudah membayar, unggah bukti untuk pencocokan admin.'}
              </p>
              <div>
                <h3 className="text-xl font-black text-slate-900">Langkah 3: Konfirmasi Rincian Booking</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {requiresPayment
                    ? `DP Rp ${dpAmount.toLocaleString('id-ID')} mengurangi biaya konsultasi. Unggah bukti sebelum reservasi berakhir.`
                    : 'Paket ini tidak memerlukan pembayaran. Periksa rincian dan consent sebelum mengirim booking.'}
                </p>
              </div>

              {/* Rincian Pesanan Card */}
              {pricingNotice && <p role="alert" className="text-xs text-amber-800">{pricingNotice}</p>}
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
                  <span className="text-slate-400 font-bold uppercase">
                    {currentPackage?.type === 'ONLINE_TELE' ? 'Metode Sesi' : 'Lokasi Praktik'}
                  </span>
                  <strong className="text-slate-900">
                    {currentPackage?.type === 'ONLINE_TELE'
                      ? 'Telelayanan - detail media sesi dikirim setelah booking dikonfirmasi'
                      : landingCms.clinicAddress}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-400 font-bold uppercase">{currentPackage?.type === 'PSYCHOTHERAPY' ? 'Tarif per Sesi' : 'Total Biaya Paket'}</span>
                  <span className="font-bold text-slate-900">Rp {(currentPackage?.type === 'PSYCHOTHERAPY' ? packagePricing.unitPrice : subtotalAmount).toLocaleString('id-ID')}</span>
                </div>

                {currentPackage?.type === 'PSYCHOTHERAPY' && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">Tagihan sesi pertama (rangkaian {packagePricing.sessionCount} sesi)</span>
                    <span className="font-bold text-slate-900">Rp {subtotalAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

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

                {requiresPayment && <label className="block py-2 text-xs font-bold text-slate-700">
                  Pembayaran awal
                  <select value={payInFull ? 'FULL' : 'DP'} onChange={event => setPayInFull(event.target.value === 'FULL')} disabled={Boolean(proofDataUrl) || isSubmitting || Boolean(reconciliationId)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm">
                    <option value="DP">DP Rp {dpAmount.toLocaleString('id-ID')} sekali di awal</option>
                    <option value="FULL">{currentPackage?.type === 'PSYCHOTHERAPY' ? 'Lunas 4 sesi' : 'Lunas layanan'} Rp {agreedAmount.toLocaleString('id-ID')}</option>
                  </select>
                </label>}
                {currentPackage?.type === 'PSYCHOTHERAPY' && <p className="py-2 text-xs text-slate-600">Kesepakatan 4 sesi x Rp {payableAmount.toLocaleString('id-ID')} = Rp {agreedAmount.toLocaleString('id-ID')}. Tarif ini tetap untuk rangkaian ini. Sesi dijadwalkan bertahap.</p>}
                <div className="flex flex-wrap justify-between gap-2 py-2 border-b border-slate-200 bg-emerald-50/90 p-3 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-emerald-950 font-black block">{requiresPayment ? payInFull ? 'Bayar Penuh di Awal' : 'DP Awal (Bayar Sekarang)' : 'Tanpa Pembayaran'}</span>
                    <span className="text-[10px] text-emerald-800">{requiresPayment ? 'Sebagai syarat mengunci jadwal dan persiapan berkas' : 'Total paket setelah diskon adalah Rp 0'}</span>
                  </div>
                  <strong className="text-emerald-900 font-black text-base">
                    Rp {initialPayAmount.toLocaleString('id-ID')}
                  </strong>
                </div>

                <div className="flex flex-wrap justify-between gap-2 py-1 text-slate-600">
                  <span>Sisa pelunasan paling lambat hari sesi terakhir:</span>
                  <span className="font-bold text-slate-900">Rp {finalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

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

              {requiresPayment && !consentAgreed && <p className="text-xs text-sky-800">Persetujuan diperlukan sebelum pembayaran.</p>}
              {requiresPayment && (
                <>
              {/* Bank Account Info Card */}
              {holdActive && quoteMatchesHold && consentAgreed && !reconciliationId && <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Rekening Pembayaran Konsultasi:
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 break-words">{paymentChannel}</div>
                    <div className="text-[11px] text-slate-500 break-words">a.n. {accountHolder}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                    Transfer Bank
                  </span>
                </div>
              </div>

              }
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

              {/* UPLOAD BUKTI TRANSFER DP SESUAI PAKET (WAJIB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Upload Bukti Pembayaran (Rp {initialPayAmount.toLocaleString('id-ID')}) <span className="text-rose-600">*</span>:
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-600">
                    Unggah tangkapan layar struk / bukti transfer sebesar Rp {initialPayAmount.toLocaleString('id-ID')}. Status terbayar muncul setelah verifikasi Admin.
                  </div>
                  <input
                    type="file"
                    required={requiresPayment}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleProofFileChange}
                    className="block w-full max-w-sm mx-auto text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-emerald-800 hover:file:bg-emerald-200"
                  />
                  <p className="text-[10px] text-slate-500">JPG, PNG, WEBP, atau PDF. Maksimal 1,5 MB.</p>
                  {proofName && (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="max-w-[16rem] truncate">{proofName}</span>
                    </div>
                  )}
                </div>
              </div>
                </>
              )}


              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => server?onNavigateTab('history'):setCurrentStep(2)}
                  disabled={isSubmitting || Boolean(proofDataUrl) || Boolean(reconciliationId)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{server?'Lihat Jadwal & Riwayat':'Ubah Pre-Test'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(reconciliationId) || (requiresPayment && (!proofDataUrl || !transferSenderName.trim())) || !consentAgreed}
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
