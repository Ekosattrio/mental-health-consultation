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
  consultationFeeOnline: number;
  consultationFeeOffline: number;
  languages: string[];
  clinicAddress: string;
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

export type PackageType = 'OFFLINE_CLINIC' | 'BUNDLING_ASSESSMENT';

export interface ConsultationPackage {
  id: string;
  name: string;
  type: PackageType;
  durationMinutes: number;
  price: number;
  badge?: string;
  description: string;
  benefits: string[];
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

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
  totalAmount: number;
  meetingLocation: string; // Virtual Room ID or Clinic Room
  hasIntakeForm: boolean;
  hasTestResult: boolean;
  createdAt: string;
  clinicalNotesId?: string;
  reviewId?: string;
}

export interface QuestionOption {
  label: string;
  score: number;
}

export interface Question {
  id: number;
  text: string;
  subscale?: 'Depresi' | 'Kecemasan' | 'Stres' | 'Umum';
  options: QuestionOption[];
}

export interface PsychologicalTest {
  id: string;
  code: 'DASS-21' | 'PHQ-9' | 'GAD-7';
  title: string;
  shortDescription: string;
  instruction: string;
  estimatedMinutes: number;
  questionCount: number;
  questions: Question[];
  subscales?: string[];
  scoringFormula: string;
}

export interface TestResult {
  id: string;
  patientId: string;
  patientName: string;
  testId: string;
  testCode: string;
  testTitle: string;
  completedAt: string;
  totalScore: number;
  subscaleScores: {
    depression?: number;
    anxiety?: number;
    stress?: number;
  };
  severityLevel: 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' | 'SANGAT_BERAT';
  interpretation: string;
  clinicalRecommendation: string;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  patientId: string;
  psychologistId: string;
  sessionDate: string;
  // SOAP Format
  subjective: string; // Keluhan subyektif pasien
  objective: string;   // Observasi perilaku klinis, afek, kontak mata
  assessment: string;  // Analisis diagnosis sementara / dinamika psikologis
  plan: string;        // Rencana intervensi, pekerjaan rumah / sesi lanjutan
  prognosis: 'Baik' | 'Perlu Pemantauan' | 'Butuh Rujukan Psikiater';
  requiresPsychiatristReferral: boolean;
  createdAt: string;
  updatedAt: string;
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

