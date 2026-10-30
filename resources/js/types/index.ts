export type UserRole = 'GUEST' | 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  // Profil Pasien Lengkap
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  occupation?: string;
  city?: string;
  emergencyContact?: string;
  isProfileComplete?: boolean;
}

export interface PsychologistProfile {
  userId: string;
  title: string; // e.g. "M.Psi., Psikolog Klinis Dewasa"
  strNumber: string; // Surat Tanda Registrasi Tenaga Kesehatan
  sipNumber: string; // Surat Izin Praktik Psikolog
  experienceYears: number;
  bio: string;
  specialties: string[];
  therapyApproaches: string[];
  rating: number;
  reviewCount: number;
  languages: string[];
  clinicAddress: string;
  avatarUrl?: string;
  isAvailableToday: boolean;
  education?: string[];
  strExpiry?: string;
  sipExpiry?: string;
  clinicalHours?: number;
  practicePolicy?: string;
}

export interface IntakeForm {
  id: string;
  patientId: string;
  appointmentId?: string;
  formVersion?: string;
  completedAt: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan' | 'Lainnya';
  occupation: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryConcerns: string[];
  concernDescription: string;
  previousTherapy?: boolean;
  previousDiagnosis?: string;
  currentMedications?: string;
  currentStressLevel: number; // 1 - 10
  sleepQuality: 'Baik' | 'Cukup' | 'Buruk' | 'Insomnia Akut';
  suicideRiskFlag?: boolean;
  goals: string;
}

export type PackageCategory = 'KONSELING' | 'ASESMEN' | 'PSIKOTERAPI';

export type PackageType = 'OFFLINE_CLINIC' | 'ONLINE_TELE' | 'BUNDLING_ASSESSMENT' | 'PSYCHOTHERAPY';

export interface ConsultationPackage {
  serverVersion?: number;
  id: string;
  name: string;
  category?: PackageCategory;
  type: PackageType;
  durationMinutes: number;
  price: number;
  discountType?: 'NONE' | 'PERCENT' | 'FIXED';
  discountValue?: number;
  discountLabel?: string;
  isContinuousCare?: boolean;
  sessionCount?: number;
  badge?: string;
  description: string;
  benefits: string[];
  notes?: string;
  isActive: boolean;
  iconName: string;
}

export interface ScheduleSlot {
  id: string;
  psychologistId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface FinalPaymentRecord {
  id: string;
  idempotencyKey?: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC' | 'OTHER';
  channelDetail?: string;
  recordedAt: string;
  receivedAt?: string;
  recordedByName: string;
  purpose?: 'CONSULTATION' | 'CANCELLATION_SETTLEMENT';
}

export interface InitialPaymentRecord {
  id: string;
  amount: number;
  kind: 'DP' | 'FULL';
  method: NonNullable<Appointment['paymentMethod']>;
  channelDetail?: string;
  receivedAt: string;
  recordedByName?: string;
  verifiedAt?: string;
}

export interface BookingConsent {
  documentVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  patientId: string;
}

export interface AppointmentStatusEvent {
  from: AppointmentStatus;
  to: AppointmentStatus;
  at: string;
  actorId: string;
  actorName: string;
  reason?: string;
}

export interface Appointment {
  serverInfo?: {
    rawStatus:string; billingId?:string; paymentId?:string; paymentVersion?:number;
    totalDue:number; allocated:number; cashReceived:number; remaining:number; initialDue:number;
    cashVisible:boolean; sourceBillId?:string; invoiceIds:string[]; receiptIds:string[];
    payments:{id:string;amount:number;at:string;method:string;actor:string;reversal:boolean}[];
  };
  id: string;
  bookingCode: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  psychologistId: string;
  psychologistName: string;
  packageId: string;
  packageName: string;
  packageType: PackageType;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentStatus: 'PENDING' | 'DP_PENDING_VERIFICATION' | 'DP_PAID' | 'FINAL_PENDING_VERIFICATION' | 'PAID' | 'REFUNDED';
  subtotalAmount?: number;
  discountCode?: string;
  discountLabel?: string;
  discountAmount?: number;
  totalAmount: number;
  billingMode?: 'PER_SESSION' | 'PLAN_TOTAL';
  paymentAgreement?: {
    version: 1;
    accountAppointmentId: string;
    agreedAt: string;
    sessionCount: number;
    sessionAmount: number;
    sessionSubtotal: number;
    sessionDiscount: number;
    discountLabel?: string;
    durationMinutes: number;
  };
  dpAmount?: number;
  remainingAmount?: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC' | 'OTHER';
  paymentChannelDetail?: string;
  transferSenderName?: string;
  paymentProofUrl?: string;
  paymentProofName?: string;
  paymentProofMimeType?: string;
  paymentProofState?: 'SUBMITTED' | 'REJECTED' | 'VERIFIED';
  paymentProofVersion?: number;
  paymentProofSubmittedAt?: string;
  paymentProofLastUploadedAt?: string;
  paymentProofCorrectionDeadline?: string;
  paymentProofRejectionReason?: string;
  paymentProofHistory?: {
    version: number;
    url?: string;
    name?: string;
    mimeType?: string;
    senderName?: string;
    submittedAt: string;
    rejectedAt: string;
    rejectedByName: string;
    rejectionReason: string;
  }[];
  paymentVerifiedAt?: string;
  paymentVerifiedByName?: string;
  paymentVerificationNote?: string;
  finalPaymentAmount?: number;
  finalPaymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC' | 'OTHER';
  finalPaymentChannelDetail?: string;
  finalPaymentRecordedAt?: string;
  finalPaymentRecordedByName?: string;
  finalPaymentRecords?: FinalPaymentRecord[];
  initialPaymentRecord?: InitialPaymentRecord;
  rescheduledAt?: string;
  scheduleVersion?: number;
  initialRequirementMet?: boolean;
  rescheduleRequest?: {
    id: string;
    requestedAt: string;
    expectedScheduleVersion: number;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    status: 'REQUESTED' | 'SLOT_SELECTION_REQUIRED' | 'APPLIED' | 'REJECTED';
    revision?: number;
    lastSubmittedAt?: string;
    decidedAt?: string;
    decidedByName?: string;
    decisionReason?: string;
  };
  rescheduleRequestHistory?: NonNullable<Appointment['rescheduleRequest']>[];
  rescheduledByName?: string;
  rescheduledByRole?: UserRole;
  rescheduleReason?: string;
  rescheduleHistory?: {
    fromDate: string;
    fromStartTime: string;
    fromEndTime: string;
    toDate: string;
    toStartTime: string;
    toEndTime: string;
    at: string;
    actorId: string;
    actorName: string;
    actorRole: UserRole;
    origin?: 'PATIENT' | 'CLINIC' | 'OWNER';
    reason: string;
  }[];
  scheduleConfirmedAt?: string;
  scheduleConfirmedByName?: string;
  statusHistory?: AppointmentStatusEvent[];
  preTestId?: string;
  preTestSnapshot?: IntakeForm;
  consent?: BookingConsent;
  treatmentPlanId?: string;
  treatmentPlanStatus?: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  treatmentPlanDiscontinuedAt?: string;
  treatmentPlanDiscontinuedById?: string;
  treatmentPlanDiscontinuedByName?: string;
  treatmentPlanDiscontinuedReason?: string;
  continuousSessionNumber?: number;
  continuousSessionTotal?: number;
  meetingLocation: string;
  hasIntakeForm: boolean;
  createdAt: string;
  reviewId?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  isAnonymous: boolean;
  anonymousAlias?: string;
  psychologistId: string;
  psychologistName: string;
  rating: number; // 1 to 5
  comment: string;
  isApproved: boolean; // moderated by Admin
  createdAt: string;
}

export interface AnalyticsSummary {
  totalAppointments: number;
  completedSessions: number;
  totalRevenue: number;
  activePatients: number;
  averageRating: number;
  psychologistCount: number;
  pendingReviews: number;
  topConcerns: { name: string; count: number; percentage: number }[];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
}

export interface LandingPageCmsConfig {
  ctaTitle?:string;
  ctaSubtitle?:string;
  footerText?:string;
  faqs?:{q:string;a:string}[];
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  sliderTitle: string;
  sliderSubtitle: string;
  sliderIntervalSeconds: number;
  sliderAutoPlay: boolean;
  clinicName: string;
  clinicAddress: string;
  clinicHours: string;
  clinicPhone: string;
  clinicWhatsapp: string;
  clinicEmail: string;
  logoUrl?: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
  qrisImageUrl?: string;
  clinicKopLogoUrl?: string;
  instagramUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

export interface PatientPageCmsConfig {
  welcomeBannerTitle: string;
  welcomeBannerSubtitle: string;
  dailyMentalHealthTip: string;
  crisisHotlineTitle: string;
  crisisHotlineNumber: string;
  crisisWhatsapp: string;
  crisisNotice: string;
  announcementText: string;
}

export interface PsychologistPageCmsConfig {
  guidelinesTitle: string;
  guidelinesContent: string;
  announcementTitle: string;
  announcementContent: string;
  remunerationPolicy: string;
  clinicalSupervisorContact: string;

  // Kop Surat Resmi Laporan Keuangan & Dokumen Dinas
  letterheadClinicName: string;
  letterheadDoctorName: string;
  letterheadSipNumber: string;
  letterheadStrNumber: string;
  letterheadAddress: string;
  letterheadPhone: string;
  letterheadEmail: string;
  letterheadWebsite: string;
  letterheadCity: string;
  letterheadSignerRole: string;
}

