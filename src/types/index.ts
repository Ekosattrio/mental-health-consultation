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
  previousTherapy: boolean;
  previousDiagnosis?: string;
  currentMedications: string;
  currentStressLevel: number; // 1 - 10
  sleepQuality: 'Baik' | 'Cukup' | 'Buruk' | 'Insomnia Akut';
  suicideRiskFlag: boolean;
  goals: string;
}

export type PackageCategory = 'KONSELING' | 'ASESMEN' | 'PSIKOTERAPI';

export type PackageType = 'OFFLINE_CLINIC' | 'BUNDLING_ASSESSMENT' | 'PSYCHOTHERAPY';

export interface ConsultationPackage {
  id: string;
  name: string;
  category?: PackageCategory;
  type: PackageType;
  durationMinutes: number;
  price: number;
  dpAmount?: number;
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

export interface Appointment {
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
  dpAmount?: number;
  remainingAmount?: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC' | 'OTHER';
  paymentChannelDetail?: string;
  transferSenderName?: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  finalPaymentAmount?: number;
  finalPaymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC' | 'OTHER';
  finalPaymentChannelDetail?: string;
  finalPaymentReference?: string;
  finalPaymentRecordedAt?: string;
  finalPaymentRecordedByName?: string;
  rescheduledAt?: string;
  rescheduledByName?: string;
  rescheduledByRole?: UserRole;
  rescheduleReason?: string;
  treatmentPlanId?: string;
  treatmentPlanStatus?: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  treatmentPlanDiscontinuedAt?: string;
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

