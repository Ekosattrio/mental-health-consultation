import {createContext,useContext} from 'react';
import type React from 'react';
import type { AdminTabId } from '../components/admin/navigation';
import type {
  User as UserEntity,
  UserRole,
  PsychologistProfile,
  ConsultationPackage,
  ScheduleSlot,
  Appointment,
  IntakeForm,
  Review,
  AnalyticsSummary,
  ToastNotification,
  LandingPageCmsConfig,
  PatientPageCmsConfig,
  PsychologistPageCmsConfig
} from '../types';
import type {ReceivedPayment} from '../utils/paymentWorkflow';
import type {ProofUpload} from '../utils/paymentProof';
import type {RescheduleOptions} from '../utils/reschedulePolicy';
import type {AccountProfileInput} from '../utils/accountProfile';
import type {BookingHold, PaymentReconciliation} from '../utils/workflowStore';
import type {
  User,
  Patient,
  Psychologist,
  Admin
} from '../models';
import type {
  AuthController,
  PatientController,
  PsychologistController,
  AdminController
} from '../controllers';

export interface AppContextType {
  server?: import('../integration/types').ServerBridge;
  // Domain Entities
  currentUser: UserEntity | null;
  currentRole: UserRole;
  currentPsychologistProfile: PsychologistProfile | null;
  users: UserEntity[];
  psychologists: PsychologistProfile[];
  packages: ConsultationPackage[];
  schedules: ScheduleSlot[];
  appointments: Appointment[];
  slotHolds: BookingHold[];
  paymentReconciliations: PaymentReconciliation[];
  reserveBookingSlot: (data: { packageId: string; psychologistId: string; date: string; startTime: string; endTime: string }) => Promise<BookingHold | null>;
  intakeForms: Record<string, IntakeForm>;
  reviews: Review[];
  analytics: AnalyticsSummary;
  toast: ToastNotification | null;

  // OOP Domain Models (Encapsulated)
  currentUserModel: User | null;
  currentPatientModel: Patient | null;
  currentPsychologistModel: Psychologist | null;
  currentAdminModel: Admin | null;

  // OOP Controllers (MVC Architecture)
  authController: AuthController | null;
  patientController: PatientController | null;
  psychologistController: PsychologistController | null;
  adminController: AdminController | null;

  // Navigation & View
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  activePatientTab: 'overview' | 'faq' | 'booking' | 'history' | 'profile';
  setActivePatientTab: (tab: 'overview' | 'faq' | 'booking' | 'history' | 'profile') => void;
  activePsychologistTab: 'overview' | 'schedule' | 'packages' | 'treatmentPlans' | 'patients' | 'finance' | 'cms' | 'history' | 'profile';
  setActivePsychologistTab: (tab: 'overview' | 'schedule' | 'packages' | 'treatmentPlans' | 'patients' | 'finance' | 'cms' | 'history' | 'profile') => void;
  activeAdminTab: AdminTabId;
  setActiveAdminTab: (tab: AdminTabId) => void;

  // Landing Page CMS
  // Multi-Page CMS (Landing, Patient, Psychologist)
  landingCms: LandingPageCmsConfig;
  patientCms: PatientPageCmsConfig;
  psychologistCms: PsychologistPageCmsConfig;
  updateLandingCms: (config: Partial<LandingPageCmsConfig>) => void | Promise<boolean>;
  updatePatientCms: (config: Partial<PatientPageCmsConfig>) => void | Promise<boolean>;
  updatePsychologistCms: (config: Partial<PsychologistPageCmsConfig>) => void | Promise<boolean>;

  // Flow State
  selectedBookingPackageId?: string;
  selectedBookingPsychologistId?: string;
  setSelectedBookingPackageId: (id?: string) => void;
  setSelectedBookingPsychologistId: (id?: string) => void;
  startBookingFlow: (psychologistId?: string, packageId?: string) => void;
  startTestFlow: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  authModalTab: 'LOGIN' | 'REGISTER';
  setAuthModalTab: (tab: 'LOGIN' | 'REGISTER') => void;
  openAuthModal: (tab?: 'LOGIN' | 'REGISTER') => void;
  loginAs: (role: UserRole, specificUserId?: string, userList?: UserEntity[]) => void;
  loginWithEmail: (email: string) => { isNew: boolean; user: UserEntity };
  registerUser: (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Action Facades (Controller Facades for Backward Compatibility)
  switchRole: (role: UserRole, specificUserId?: string) => void;
  switchPatientUser: (patientId: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  dismissToast: () => void;
  updateUserProfile: (userId: string, data: Partial<UserEntity>) => void;
  saveAccountProfile: (data: AccountProfileInput) => Promise<boolean>;
  bookAppointment: (data: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    psychologistId: string;
    packageId: string;
    date: string;
    slotId: string;
    paymentMethod?: string;
    startTime?: string;
    endTime?: string;
    transferSenderName?: string;
    paymentProofUrl?: string;
    paymentProofName?: string;
    paymentProofMimeType?: string;
    paymentChannelDetail?: string;
    preTestId?: string;
    consentGiven?: boolean;
    consentVersion?: string;
    privacyVersion?: string;
    initialPaymentAmount?: number;
    initialPaymentScope?: 'SESSION' | 'PLAN';
    initialPaymentReceivedDate?: string;
    expectedTotalAmount?: number;
    slotHoldId?: string;
    reconciliationId?: string;
  }) => Promise<{ success: boolean; message: string; appointment?: Appointment; reconciliationId?: string }>;

  submitIntakeForm: (formData: Omit<IntakeForm, 'id' | 'completedAt'>) => Promise<IntakeForm | null>;
  submitReview: (reviewData: {
    appointmentId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
  }) => void | Promise<boolean>;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, specificPsychologistId?: string) => Promise<boolean>;
  toggleSlotAvailability: (slotId: string) => void;
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  deleteScheduleSlot: (slotId: string) => void;
  savePackage: (pkg: ConsultationPackage) => void | Promise<boolean>;
  deletePackage: (packageId: string) => void;
  togglePackageStatus: (packageId: string) => void;
  updateAppointmentStatus: (aptId: string, status: Appointment['status'], reason?: string) => Promise<boolean>;
  confirmRescheduledBooking: (appointmentId: string) => Promise<boolean>;
  reviewPatientReschedule: (appointmentId: string, requestId: string, approve: boolean, reason?: string, expectedRevision?: number) => Promise<boolean>;
  reopenPatientReschedule: (appointmentId: string, requestId: string, reason: string, expectedRevision: number) => Promise<boolean>;
  verifyPaymentAndConfirmBooking: (appointmentId: string, note?: string, receivedDate?: string, expectedProofVersion?: number, receivedAmount?: number) => Promise<boolean>;
  rejectPaymentProof: (appointmentId: string, reason: string, expectedVersion: number) => Promise<boolean>;
  correctPaymentProof: (appointmentId: string, proof: ProofUpload, expectedVersion: number) => Promise<boolean>;
  recordFinalPayment: (appointmentId: string, payment: ReceivedPayment) => Promise<boolean>;
  scheduleNextContinuousSession: (
    appointmentId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<boolean>;
  discontinueTreatmentPlan: (appointmentId: string, reason: string) => Promise<boolean>;
  rescheduleAppointment: (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string,
    expectedVersion?: number,
    options?: RescheduleOptions
  ) => Promise<boolean>;
  resetAllToDefault: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
