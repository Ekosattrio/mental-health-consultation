import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { AdminTabId } from '../components/admin/navigation';
import { createPatientId } from '../utils/identifiers';
import {
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
import {
  INITIAL_USERS,
  INITIAL_PSYCHOLOGISTS,
  INITIAL_PACKAGES,
  INITIAL_INTAKE_FORMS,
  INITIAL_SCHEDULES,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_LANDING_CMS,
  INITIAL_PATIENT_CMS,
  INITIAL_PSYCHOLOGIST_CMS
} from '../data/mockData';
import {
  computeDynamicSlotsForDate,
  loadScheduleSettings,
  resetScheduleSettings
} from '../data/scheduleConfig';
import { getNextSessionBilling, isPlanInitialPaymentVerified, getCashInDate, resolvePaymentAccount, syncPaymentAllocations, getPaymentSummary } from '../utils/payments';
import { appendReceivedPayment, verifyInitialReceipt, ReceivedPayment } from '../utils/paymentWorkflow';
import { calculatePackagePayableAmount } from '../utils/discounts';
import { cancelPaidPlan } from '../utils/appointmentWorkflow';
import { rejectInitialPaymentProof, correctInitialPaymentProof, ProofUpload } from '../utils/paymentProof';
import { canRescheduleAppointment, rescheduleExistingAppointment, assertScheduleVersion, requestPatientReschedule,
  RescheduleOptions, assertRequestRevision, requireRescheduleSlotSelection, isOpenRescheduleRequest } from '../utils/reschedulePolicy';
import { reviewRescheduleAvailability } from '../utils/rescheduleApproval';
import { AccountProfileInput, updateOwnAccountProfile } from '../utils/accountProfile';
import { persistBrowserValue, validateLandingCms, mergePatientCms } from '../utils/cms';
import { createRecordId, getPracticeDate, isValidBookingDate } from '../utils/bookingPolicy';
import { BookingHold, PaymentReconciliation, WORKFLOW_STORAGE_KEY, COMPAT_WORKFLOW_STORAGE_KEY, WORKFLOW_UPDATED_EVENT, STORAGE_ERROR_EVENT,
  readWorkflowState, commitWorkflow, withWorkflowLock, savePaymentReconciliation, findActivePatientHold } from '../utils/workflowStore';

// OOP Domain Models
import {
  User,
  Patient,
  Psychologist,
  Admin
} from '../models';

// OOP Controllers
import {
  AuthController,
  PatientController,
  PsychologistController,
  AdminController
} from '../controllers';

interface AppContextType {
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
  authController: AuthController;
  patientController: PatientController;
  psychologistController: PsychologistController;
  adminController: AdminController;

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
  updateLandingCms: (config: Partial<LandingPageCmsConfig>) => void;
  updatePatientCms: (config: Partial<PatientPageCmsConfig>) => void;
  updatePsychologistCms: (config: Partial<PsychologistPageCmsConfig>) => void;

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
  }) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, specificPsychologistId?: string) => Promise<boolean>;
  toggleSlotAvailability: (slotId: string) => void;
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  deleteScheduleSlot: (slotId: string) => void;
  savePackage: (pkg: ConsultationPackage) => void;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'jiwasehat_v3_';

const useDebouncedLocalStorage = <T,>(key: string, value: T, delayMs = 120) => {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      } catch {
        window.dispatchEvent(new Event(STORAGE_ERROR_EVENT));
      }
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [key, value, delayMs]);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence helpers
  const loadState = <T,>(key: string, defaultVal: T): T => {
    if (key === 'appointments') return readWorkflowState().appointments as T;
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (key === 'users') {
        const stored = item ? JSON.parse(item) as UserEntity[] : defaultVal as UserEntity[];
        return [...stored, ...readWorkflowState().walkInPatients.filter(user => !stored.some(existing => existing.id === user.id))] as T;
      }
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [currentRole, setCurrentRole] = useState<UserRole>('GUEST');
  const [baseUsers, setBaseUsers] = useState<UserEntity[]>(() => loadState('users', INITIAL_USERS));
  const [workflow, setWorkflow] = useState(readWorkflowState);
  const appointments = workflow.appointments;
  const users = useMemo(() => [...baseUsers, ...workflow.walkInPatients.filter(item => !baseUsers.some(user => user.id === item.id))], [baseUsers, workflow.walkInPatients]);
  const setUsers: React.Dispatch<React.SetStateAction<UserEntity[]>> = action => {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'users');
    const stored = raw ? JSON.parse(raw) as UserEntity[] : baseUsers;
    const current = [...stored, ...readWorkflowState().walkInPatients.filter(item => !stored.some(user => user.id === item.id))];
    const next = typeof action === 'function' ? action(current) : action;
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(next));
    setBaseUsers(next);
  };
  const setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>> = action => {
    const next = commitWorkflow(current => ({ ...current,
      appointments: typeof action === 'function' ? action(current.appointments) : action
    }));
    setWorkflow(next);
  };
  const [psychologists, setPsychologistsState] = useState<PsychologistProfile[]>(() => loadState('psychologists', INITIAL_PSYCHOLOGISTS));
  const setPsychologists: React.Dispatch<React.SetStateAction<PsychologistProfile[]>> = action => {
    const current = loadState('psychologists', INITIAL_PSYCHOLOGISTS);
    const next = typeof action === 'function' ? action(current) : action;
    persistBrowserValue('psychologists', next);
    setPsychologistsState(next);
  };
  const [packages, setPackagesState] = useState<ConsultationPackage[]>(() => loadState('packages', INITIAL_PACKAGES));
  const setPackages: React.Dispatch<React.SetStateAction<ConsultationPackage[]>> = action => {
    const current = loadState<ConsultationPackage[]>('packages', INITIAL_PACKAGES);
    const next = typeof action === 'function' ? action(current) : action;
    localStorage.setItem(STORAGE_PREFIX + 'packages', JSON.stringify(next));
    setPackagesState(next);
  };
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() => loadState('schedules', INITIAL_SCHEDULES));
  const [intakeForms, setIntakeForms] = useState<Record<string, IntakeForm>>(() => loadState('intakeForms', INITIAL_INTAKE_FORMS));
  const [reviews, setReviews] = useState<Review[]>(() => loadState('reviews', INITIAL_REVIEWS));
  const [landingCms, setLandingCms] = useState<LandingPageCmsConfig>(() => ({ ...INITIAL_LANDING_CMS, ...loadState('landingCms', INITIAL_LANDING_CMS) }));
  const [patientCms, setPatientCms] = useState<PatientPageCmsConfig>(() => mergePatientCms(INITIAL_PATIENT_CMS, loadState('patientCms', INITIAL_PATIENT_CMS)));
  const [psychologistCms, setPsychologistCms] = useState<PsychologistPageCmsConfig>(() => ({ ...INITIAL_PSYCHOLOGIST_CMS, ...loadState('psychologistCms', INITIAL_PSYCHOLOGIST_CMS) }));

  // Global Toast Notification
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Tab controllers
  const [activePatientTab, setActivePatientTab] = useState<'overview' | 'faq' | 'booking' | 'history' | 'profile'>('overview');
  const [activePsychologistTab, setActivePsychologistTab] = useState<'overview' | 'schedule' | 'packages' | 'treatmentPlans' | 'patients' | 'finance' | 'cms' | 'history' | 'profile'>('overview');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabId>('reservations');

  // Current active user ID
  const [currentUserId, setCurrentUserId] = useState<string>('user-pat-1');

  // Sidebar Collapse state (shared across dashboards & navbar)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  // Flow State
  const [selectedBookingPackageId, setSelectedBookingPackageId] = useState<string | undefined>();
  const [selectedBookingPsychologistId, setSelectedBookingPsychologistId] = useState<string | undefined>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useDebouncedLocalStorage('schedules', schedules);
  useDebouncedLocalStorage('intakeForms', intakeForms);
  useDebouncedLocalStorage('reviews', reviews);

  useEffect(() => {
    void withWorkflowLock(() => {
      const migrationKey = STORAGE_PREFIX + 'frontend_cleanup_v5';
      if (localStorage.getItem(migrationKey)) return;
  
      localStorage.removeItem(STORAGE_PREFIX + 'tests');
      localStorage.removeItem(STORAGE_PREFIX + 'testResults');
      localStorage.removeItem(STORAGE_PREFIX + 'clinicalNotes');
  
      setPsychologists(prev => prev.map(profile => {
        const cleaned = { ...profile } as unknown as Record<string, unknown>;
        delete cleaned.consultationFeeOnline;
        delete cleaned.consultationFeeOffline;
        return cleaned as unknown as PsychologistProfile;
      }));
      setAppointments(prev => prev.map(item => {
        const cleaned = { ...item } as unknown as Record<string, unknown>;
        delete cleaned.hasTestResult;
        return cleaned as unknown as Appointment;
      }));
      localStorage.setItem(migrationKey, new Date().toISOString());
    }).catch(() => window.dispatchEvent(new Event(STORAGE_ERROR_EVENT)));
  }, []);

  useEffect(() => {
    void withWorkflowLock(() => {
      const migrationKey = STORAGE_PREFIX + 'flat_dp_cleanup_v6';
      if (localStorage.getItem(migrationKey)) return;
  
      setPackages(prev => prev.map(pkg => {
        const cleaned = { ...pkg } as unknown as Record<string, unknown>;
        delete cleaned.dpAmount;
        return cleaned as unknown as ConsultationPackage;
      }));
      localStorage.setItem(migrationKey, new Date().toISOString());
    }).catch(() => window.dispatchEvent(new Event(STORAGE_ERROR_EVENT)));
  }, []);

  useEffect(() => {
    void withWorkflowLock(() => {
      const migrationKey = STORAGE_PREFIX + 'service_catalog_v7';
      if (localStorage.getItem(migrationKey)) return;
  
      const officialCatalog = INITIAL_PACKAGES.filter(pkg =>
        pkg.id.startsWith('pkg-konseling-') ||
        pkg.id.startsWith('pkg-asesmen-') ||
        pkg.id.startsWith('pkg-tes-') ||
        pkg.id === 'pkg-psikoterapi-intensif'
      );
      setPackages(prev => {
        const previousById = new Map(prev.map(pkg => [pkg.id, pkg] as const));
        const officialIds = new Set(officialCatalog.map(pkg => pkg.id));
        const synchronizedCatalog = officialCatalog.map(pkg => {
          const previous = previousById.get(pkg.id);
          if (!previous) return pkg;
  
          return {
            ...pkg,
            isActive: previous.isActive,
            discountType: previous.discountType,
            discountValue: previous.discountValue,
            discountLabel: previous.discountLabel
          };
        });
        const customAndLegacyPackages = prev.filter(pkg => !officialIds.has(pkg.id));
  
        return [...synchronizedCatalog, ...customAndLegacyPackages];
      });
      localStorage.setItem(migrationKey, new Date().toISOString());
    }).catch(() => window.dispatchEvent(new Event(STORAGE_ERROR_EVENT)));
  }, []);

  useEffect(() => {
    void withWorkflowLock(() => {
      const migrationKey = STORAGE_PREFIX + 'payment_reference_cleanup_v8';
      if (localStorage.getItem(migrationKey)) return;
  
      setAppointments(prev => prev.map(appointment => {
        const cleaned = { ...appointment } as unknown as Record<string, unknown>;
        delete cleaned.paymentReference;
        delete cleaned.finalPaymentReference;
        return cleaned as unknown as Appointment;
      }));
      localStorage.setItem(migrationKey, new Date().toISOString());
    }).catch(() => window.dispatchEvent(new Event(STORAGE_ERROR_EVENT)));
  }, []);

  useEffect(() => {
    void withWorkflowLock(() => {
      const migrationKey = STORAGE_PREFIX + 'psychotherapy_unit_price_v9';
      if (localStorage.getItem(migrationKey)) return;
  
      const officialPsychotherapy = INITIAL_PACKAGES.find(pkg => pkg.id === 'pkg-psikoterapi-intensif');
      const previousPsychotherapy = loadState<ConsultationPackage[]>('packages', INITIAL_PACKAGES)
        .find(pkg => pkg.id === 'pkg-psikoterapi-intensif');
      if (officialPsychotherapy) {
        setPackages(prev => prev.map(pkg => pkg.id === officialPsychotherapy.id
          ? {
              ...officialPsychotherapy,
              isActive: pkg.isActive,
              discountType: pkg.discountType,
              discountValue: pkg.discountType === 'FIXED' && (previousPsychotherapy?.price || 0) > officialPsychotherapy.price
                ? Math.round((pkg.discountValue || 0) / 4)
                : pkg.discountValue,
              discountLabel: pkg.discountLabel
            }
          : pkg));
      }
      localStorage.setItem(migrationKey, new Date().toISOString());
    }).catch(() => window.dispatchEvent(new Event(STORAGE_ERROR_EVENT)));
  }, []);

  useEffect(() => {
    const handleCrossTabStorage = (event: StorageEvent) => {
      if (!event.newValue) return;

      try {
        if (event.key === STORAGE_PREFIX + 'users') setBaseUsers(JSON.parse(event.newValue));
        if (event.key === STORAGE_PREFIX + 'schedules') {
          setSchedules(JSON.parse(event.newValue));
        }
        if (event.key === STORAGE_PREFIX + 'packages') {
          setPackagesState(JSON.parse(event.newValue));
        }
        if (event.key === STORAGE_PREFIX + 'psychologists') setPsychologistsState(JSON.parse(event.newValue));
        if (event.key === STORAGE_PREFIX + 'landingCms') setLandingCms({ ...INITIAL_LANDING_CMS, ...JSON.parse(event.newValue) });
        if (event.key === STORAGE_PREFIX + 'patientCms') setPatientCms(mergePatientCms(INITIAL_PATIENT_CMS, JSON.parse(event.newValue)));
        if (event.key === STORAGE_PREFIX + 'psychologistCms') setPsychologistCms({ ...INITIAL_PSYCHOLOGIST_CMS, ...JSON.parse(event.newValue) });
      } catch {
        // Abaikan payload storage yang rusak; state aktif tetap dipertahankan.
      }
    };

    window.addEventListener('storage', handleCrossTabStorage);
    return () => window.removeEventListener('storage', handleCrossTabStorage);
  }, []);

  const withDaySlotLock = async <T,>(
    _psychologistId: string,
    _date: string,
    action: () => Promise<T>
  ): Promise<{ acquired: boolean; result?: T; error?: string }> => {
    try {
      return await withWorkflowLock(async () => ({ acquired: true, result: await action() }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Coba kembali setelah memeriksa riwayat.';
      showToast('Transaksi Belum Disimpan', message, 'error');
      return { acquired: false, error: message };
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4000);
  };

  const dismissToast = () => {
    setToast(null);
  };

  const runWorkflowMutation = async <T,>(action: () => Promise<T> | T, fallback: T): Promise<T> => {
    try {
      return await withWorkflowLock(action);
    } catch (error) {
      showToast('Transaksi Belum Disimpan', error instanceof Error ? error.message : 'Periksa riwayat sebelum mencoba kembali.', 'error');
      return fallback;
    }
  };

  useEffect(() => {
    const sync = () => {
      try { setWorkflow(readWorkflowState()); }
      catch { showToast('Penyimpanan Bermasalah', 'Data tidak dapat dibaca. Jangan mengirim pembayaran baru; hubungi pengelola.', 'error'); }
    };
    const storage = (event: StorageEvent) => { if (event.key === WORKFLOW_STORAGE_KEY || event.key === COMPAT_WORKFLOW_STORAGE_KEY) sync(); };
    const storageError = () => showToast('Gagal Menyimpan', 'Penyimpanan browser penuh atau tidak tersedia. Perubahan belum tersimpan; periksa riwayat sebelum mencoba lagi.', 'error');
    window.addEventListener(WORKFLOW_UPDATED_EVENT, sync);
    window.addEventListener('storage', storage);
    window.addEventListener(STORAGE_ERROR_EVENT, storageError);
    return () => {
      window.removeEventListener(WORKFLOW_UPDATED_EVENT, sync);
      window.removeEventListener('storage', storage);
      window.removeEventListener(STORAGE_ERROR_EVENT, storageError);
    };
  }, []);

  const ensureRole = (allowedRoles: UserRole[], actionLabel: string): boolean => {
    if (allowedRoles.includes(currentRole) && currentUser?.role === currentRole) return true;
    showToast('Akses Ditolak', `${actionLabel} tidak tersedia untuk role aktif.`, 'warning');
    return false;
  };

  const currentUser = currentRole === 'GUEST'
    ? null
    : users.find(u => u.id === currentUserId && u.role === currentRole) || null;

  const currentPsychologistProfile =
    currentRole === 'PSYCHOLOGIST' && currentUser
      ? psychologists.find(p => p.userId === currentUser.id) || null
      : null;

  // -------------------------------------------------------------
  // OOP DOMAIN MODELS
  // -------------------------------------------------------------
  const currentUserModel = useMemo(() => {
    return currentUser ? User.create(currentUser) : null;
  }, [currentUser]);

  const currentPatientModel = useMemo(() => {
    return currentUser && currentUser.role === 'PATIENT' ? Patient.create(currentUser) : null;
  }, [currentUser]);

  const currentPsychologistModel = useMemo(() => {
    return currentUser && currentPsychologistProfile
      ? Psychologist.create(currentUser, currentPsychologistProfile)
      : null;
  }, [currentUser, currentPsychologistProfile]);

  const currentAdminModel = useMemo(() => {
    return currentUser && currentUser.role === 'ADMIN' ? Admin.create(currentUser) : null;
  }, [currentUser]);

  // -------------------------------------------------------------
  // OOP CONTROLLERS
  // -------------------------------------------------------------
  const authController = useMemo(() => {
    return new AuthController(showToast, {
      setCurrentRole,
      setCurrentUserId,
      setUsers,
      setPsychologists,
      setIsLoginModalOpen
    });
  }, []);

  const patientController = useMemo(() => {
    return new PatientController(showToast, {
      setAppointments,
      setSchedules,
      setIntakeForms,
      setReviews
    });
  }, []);

  const psychologistController = useMemo(() => {
    return new PsychologistController(showToast, {
      setSchedules,
      setPsychologists,
      setPackages
    });
  }, []);

  const adminController = useMemo(() => {
    return new AdminController(showToast, {
      setReviews
    });
  }, []);

  // -------------------------------------------------------------
  // NAVIGATION & AUTH
  // -------------------------------------------------------------
  const openAuthModal = (tab: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthModalTab(tab);
    setIsLoginModalOpen(true);
  };

  const startBookingFlow = (psychologistId?: string, packageId?: string) => {
    if (packageId) setSelectedBookingPackageId(packageId);
    if (psychologistId) setSelectedBookingPsychologistId(psychologistId);

    if (currentRole === 'GUEST' || !currentUser) {
      showToast(
        'Masuk Terlebih Dahulu',
        'Silakan masuk atau daftar akun terlebih dahulu untuk melakukan reservasi konsultasi.',
        'info'
      );
      openAuthModal('LOGIN');
      return;
    }

    if (currentRole !== 'PATIENT') {
      showToast('Akses Ditolak', 'Booking mandiri hanya tersedia untuk akun pasien.', 'warning');
      return;
    }

    setActivePatientTab('booking');
    showToast('Pre-Test & Booking', 'Lengkapi pre-test singkat, lalu pilih jadwal konsultasi minimal H+1.', 'info');
  };

  const startTestFlow = () => {
    if (currentRole === 'GUEST' || !currentUser) {
      showToast(
        'Masuk Terlebih Dahulu',
        'Silakan masuk atau daftar akun terlebih dahulu untuk mengisi pre-test dan booking konsultasi.',
        'info'
      );
      openAuthModal('LOGIN');
      return;
    }

    if (currentRole !== 'PATIENT') {
      showToast('Akses Ditolak', 'Pre-test hanya tersedia untuk akun pasien.', 'warning');
      return;
    }

    setActivePatientTab('booking');
    showToast('Pre-Test Profiling', 'Lengkapi pre-test singkat di alur booking konsultasi.', 'info');
  };

  const updateLandingCms = (config: Partial<LandingPageCmsConfig>) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    if (currentRole === 'ADMIN') {
      const allowed: Array<keyof LandingPageCmsConfig> = ['clinicName', 'clinicAddress', 'clinicHours', 'clinicPhone', 'clinicWhatsapp', 'clinicEmail', 'instagramUrl', 'logoUrl', 'heroTitle', 'heroSubtitle', 'sliderTitle', 'sliderSubtitle'];
      if (Object.keys(config).some(key => !allowed.includes(key as keyof LandingPageCmsConfig))) {
        showToast('Akses Ditolak', 'Admin hanya dapat mengubah konten administratif publik.', 'warning');
        return;
      }
    }
    try {
      const next = validateLandingCms({ ...INITIAL_LANDING_CMS, ...loadState('landingCms', INITIAL_LANDING_CMS), ...config });
      setLandingCms(persistBrowserValue('landingCms', next));
    } catch (error) {
      showToast('CMS Belum Disimpan', error instanceof Error ? error.message : 'Penyimpanan gagal.', 'error');
      return;
    }
    showToast('CMS Landing Page Diperbarui', 'Perubahan konten landing page berhasil disimpan.', 'success');
  };

  const updatePatientCms = (config: Partial<PatientPageCmsConfig>) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    try {
      setPatientCms(persistBrowserValue('patientCms', mergePatientCms(INITIAL_PATIENT_CMS, { ...loadState('patientCms', INITIAL_PATIENT_CMS), ...config })));
    } catch {
      showToast('CMS Belum Disimpan', 'Penyimpanan gagal. Perubahan belum diterapkan.', 'error');
      return;
    }
    showToast('CMS Halaman Pasien Diperbarui', 'Banner dan informasi krisis pasien berhasil disimpan.', 'success');
  };

  const updatePsychologistCms = (config: Partial<PsychologistPageCmsConfig>) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    try {
      setPsychologistCms(persistBrowserValue('psychologistCms', { ...INITIAL_PSYCHOLOGIST_CMS, ...loadState('psychologistCms', INITIAL_PSYCHOLOGIST_CMS), ...config }));
    } catch {
      showToast('CMS Belum Disimpan', 'Penyimpanan gagal. Perubahan belum diterapkan.', 'error');
      return;
    }
    showToast('CMS Halaman Dokter Diperbarui', 'Panduan klinis dan SOP dokter berhasil disimpan.', 'success');
  };

  const loginAs = (role: UserRole, specificUserId?: string, userList?: UserEntity[]) => {
    const listToUse = userList || users;
    authController.loginAs(role, specificUserId, listToUse);
    if (role === 'PATIENT' && (selectedBookingPackageId || selectedBookingPsychologistId)) {
      setActivePatientTab('booking');
    }
  };

  const loginWithEmail = (email: string): { isNew: boolean; user: UserEntity } => {
    const trimmed = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === trimmed);
    if (existing) {
      if (existing.status === 'BLOCKED') {
        showToast('Akun Ditangguhkan', 'Akun ini tidak dapat masuk. Silakan hubungi pengelola.', 'error');
        setIsLoginModalOpen(true);
        return { isNew: false, user: existing };
      }
      loginAs(existing.role, existing.id);
      setIsLoginModalOpen(false);
      if (existing.role === 'PATIENT') {
        if (existing.isProfileComplete) {
          showToast('Selamat Datang Kembali!', `Halo ${existing.name}, Anda berhasil masuk ke akun.`, 'success');
        } else {
          showToast('Lengkapi Data Diri', 'Harap lengkapi formulir data diri pasien Anda untuk melanjutkan.', 'info');
        }
      }
      return { isNew: false, user: existing };
    } else {
      const newId = createPatientId();
      const newUser: UserEntity = {
        id: newId,
        email: email.trim(),
        name: email.split('@')[0],
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        phone: '',
        isVerified: true,
        createdAt: new Date().toISOString().slice(0, 10),
        isProfileComplete: false
      };
      const nextUsers = [newUser, ...users];
      setUsers(nextUsers);
      loginAs('PATIENT', newId, nextUsers);
      setIsLoginModalOpen(false);
      showToast('Akun Baru Dibuat', 'Silakan lengkapi data diri Anda pada formulir berikut.', 'info');
      return { isNew: true, user: newUser };
    }
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
  }) => {
    if (userData.role !== 'PATIENT') {
      showToast('Registrasi Ditolak', 'Registrasi publik hanya tersedia untuk akun pasien.', 'warning');
      return Promise.resolve({ success: false, message: 'Registrasi publik hanya untuk pasien.' });
    }
    return authController.register({ ...userData, role: 'PATIENT' }, users);
  };

  const logout = () => {
    authController.logout();
  };

  const switchRole = (role: UserRole, specificUserId?: string) => {
    authController.loginAs(role, specificUserId, users);
  };

  const switchPatientUser = (patientId: string) => {
    if (currentRole !== 'PATIENT') {
      showToast('Akses Ditolak', 'Pergantian akun pasien hanya tersedia pada mode demo pasien.', 'warning');
      return;
    }
    const targetUser = users.find(u => u.id === patientId && u.role === 'PATIENT');
    if (!targetUser || targetUser.status === 'BLOCKED') {
      showToast('Pasien Tidak Tersedia', 'Akun pasien tidak ditemukan atau sedang ditangguhkan.', 'warning');
      return;
    }
    setCurrentUserId(patientId);
    showToast('Ganti Pasien', `Aktif sebagai ${targetUser?.name || 'Pasien'}. Data pre-test diperbarui.`);
  };

  const updateUserProfile = (userId: string, data: Partial<UserEntity>) => {
    if (currentRole !== 'PATIENT' || currentUser?.id !== userId) {
      showToast('Akses Ditolak', 'Pasien hanya dapat mengubah profil miliknya sendiri.', 'warning');
      return;
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    showToast('Profil Diperbarui', 'Data diri pasien berhasil disimpan.', 'success');
  };

  // -------------------------------------------------------------
  // ACTION FACADES
  // -------------------------------------------------------------
  const saveAccountProfile = (data: AccountProfileInput): Promise<boolean> => runWorkflowMutation(() => {
    if (!currentUser || !ensureRole(['PATIENT', 'ADMIN', 'PSYCHOLOGIST'], 'Perubahan profil akun')) return false;
    const latest = loadState<UserEntity[]>('users', users);
    const target = latest.find(user => user.id === currentUser.id);
    if (!target) throw new Error('Akun tidak ditemukan. Masuk ulang sebelum melanjutkan.');
    const updated = updateOwnAccountProfile(target, currentUser, data);
    setUsers(latest.map(user => user.id === updated.id ? updated : user));
    showToast('Profil Disimpan', 'Perubahan profil akun berhasil disimpan.', 'success');
    return true;
  }, false);

  const reserveBookingSlot: AppContextType['reserveBookingSlot'] = async data => runWorkflowMutation(() => {
    if (!ensureRole(['PATIENT'], 'Reservasi slot') || !currentUser?.isProfileComplete) return null;
    if (!isValidBookingDate(data.date) || data.date <= getPracticeDate()) {
      showToast('Tanggal Tidak Valid', 'Reservasi konsultasi wajib minimal H+1.', 'warning');
      return null;
    }
    const state = readWorkflowState();
    if (state.reconciliations.some(item => item.patientId === currentUser.id && item.status === 'OPEN')) {
      showToast('Pembayaran Sedang Dicocokkan', 'Hubungi admin untuk menyelesaikan pembayaran sebelumnya. Jangan transfer ulang.', 'warning');
      return null;
    }
    const pkg = loadState<ConsultationPackage[]>('packages', packages).find(item => item.id === data.packageId && item.isActive);
    if (!pkg) throw new Error('Layanan sudah tidak tersedia. Pilih layanan lain.');
    const ownHold = findActivePatientHold(state.holds, currentUser.id);
    const totalAmount = calculatePackagePayableAmount(pkg).totalAmount;
    if (ownHold) {
      if (Date.parse(ownHold.expiresAt) > Date.now() && ownHold.packageId === data.packageId && ownHold.date === data.date && ownHold.startTime === data.startTime &&
          ownHold.endTime === data.endTime && ownHold.totalAmount === totalAmount) return ownHold;
      throw new Error('Proses booking belum selesai. Buka Booking Konsultasi untuk menyelesaikannya. Jika sudah transfer, jangan melakukan pembayaran ulang.');
    }
    const available = computeDynamicSlotsForDate(data.date, loadScheduleSettings(), state.appointments, data.psychologistId, pkg.durationMinutes, ownHold?.id);
    if (!available.slots.some(slot => slot.isAvailable && slot.startTime === data.startTime && slot.endTime === data.endTime)) {
      throw new Error('Slot sudah tidak tersedia. Pilih jadwal lain sebelum melakukan transfer.');
    }
    const minutes = Math.min(60, Math.max(1, Number(import.meta.env.VITE_MOCK_HOLD_MINUTES) || 15));
    const bank = { ...INITIAL_LANDING_CMS, ...loadState('landingCms', INITIAL_LANDING_CMS) };
    const hold: BookingHold = { ...data, id: createRecordId('hold'), patientId: currentUser.id, totalAmount,
      paymentChannelDetail: `${bank.bankName} - ${bank.bankAccountNumber}`, accountHolder: bank.bankAccountHolder,
      expiresAt: new Date(Date.now() + minutes * 60000).toISOString(), status: 'HELD' };
    // Keep expired holds intact so a late proof from an older tab can still be reconciled.
    commitWorkflow(current => ({ ...current, holds: [hold, ...current.holds] }));
    return hold;
  }, null);

  const bookAppointment = async (data: {
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
  }) => {
    if (!ensureRole(['PATIENT', 'ADMIN'], 'Pembuatan booking')) {
      return { success: false, message: 'Role aktif tidak memiliki izin membuat booking.' };
    }

    const isAdminWalkIn = currentRole === 'ADMIN';
    let effectiveUsers = loadState<UserEntity[]>('users', users);
    let effectivePatient = isAdminWalkIn
      ? effectiveUsers.find(user => user.id === data.patientId && user.role === 'PATIENT')
      : effectiveUsers.find(user => user.id === currentUser?.id && user.role === 'PATIENT');

    if (!isAdminWalkIn && (!effectivePatient || effectivePatient.id !== currentUser?.id)) {
      return { success: false, message: 'Identitas pasien aktif tidak valid.' };
    }

    if (effectivePatient?.status === 'BLOCKED') {
      return { success: false, message: 'Akun pasien sedang ditangguhkan.' };
    }

    const registerWalkInPatient = isAdminWalkIn && !effectivePatient;

    if (isAdminWalkIn && !effectivePatient) {
      const normalizedName = data.patientName.trim();
      const normalizedPhone = data.patientPhone?.trim() || '';
      if (!normalizedName || !normalizedPhone) {
        return { success: false, message: 'Nama dan nomor WhatsApp pasien walk-in wajib diisi.' };
      }

      const duplicateEmail = data.patientEmail.trim()
        ? effectiveUsers.find(user => user.email.toLowerCase() === data.patientEmail.trim().toLowerCase())
        : undefined;
      if (duplicateEmail) {
        return { success: false, message: 'Email sudah digunakan akun lain. Pilih pasien terdaftar atau gunakan email berbeda.' };
      }

      effectivePatient = {
        id: data.patientId,
        email: data.patientEmail.trim(),
        name: normalizedName,
        phone: normalizedPhone,
        role: 'PATIENT',
        avatar: '',
        status: 'ACTIVE',
        isVerified: true,
        isProfileComplete: false,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      effectiveUsers = [effectivePatient, ...effectiveUsers];
    }

    if (!effectivePatient) {
      return { success: false, message: 'Data pasien tidak ditemukan.' };
    }

    const storedSchedules = loadState<ScheduleSlot[]>('schedules', schedules);
    const selectedSlot = storedSchedules.find(slot => slot.id === data.slotId);
    const startTime = data.startTime || selectedSlot?.startTime || '';
    const endTime = data.endTime || selectedSlot?.endTime || '';

    if (!startTime || !endTime) {
      return { success: false, message: 'Rentang waktu slot tidak valid.' };
    }

    const locked = await withDaySlotLock(data.psychologistId, data.date, async () => {
      const currentWorkflow = readWorkflowState();
      effectiveUsers = loadState<UserEntity[]>('users', users);
      if (registerWalkInPatient) {
        if (effectiveUsers.some(user => user.id === effectivePatient.id || user.email.toLowerCase() === effectivePatient.email.toLowerCase())) {
          return { success: false, message: 'Pasien sudah terdaftar selama proses berlangsung. Pilih pasien terdaftar sebelum melanjutkan.' };
        }
        effectiveUsers = [effectivePatient, ...effectiveUsers];
      } else {
        const latestPatient = effectiveUsers.find(user => user.id === effectivePatient.id && user.role === 'PATIENT' && user.status !== 'BLOCKED');
        if (!latestPatient) return { success: false, message: 'Data atau status pasien berubah. Muat ulang sebelum melanjutkan.' };
        effectivePatient = latestPatient;
      }
      const hold = currentWorkflow.holds.find(item => item.id === data.slotHoldId && item.patientId === currentUser?.id);
      const reconcilePayment = () => {
        const record = savePaymentReconciliation(hold!, effectivePatient, {
          paymentProofUrl: data.paymentProofUrl!, paymentProofName: data.paymentProofName,
          paymentProofMimeType: data.paymentProofMimeType, transferSenderName: data.transferSenderName!
        });
        return { success: false, reconciliationId: record.id, message: 'Bukti tersimpan untuk pencocokan admin. Jangan transfer ulang; admin akan membantu menentukan jadwal yang sesuai.' };
      };
      const paymentCase = data.reconciliationId ? currentWorkflow.reconciliations.find(item => item.id === data.reconciliationId) : undefined;
      if (data.reconciliationId && (!isAdminWalkIn || !paymentCase || paymentCase.status !== 'OPEN' || paymentCase.patientId !== effectivePatient.id)) {
        return { success: false, message: 'Kasus pembayaran sudah diproses atau tidak sesuai dengan pasien.' };
      }
      if (!isAdminWalkIn) {
        if (hold?.status === 'CONVERTED' && hold.appointmentId) {
          const existing = currentWorkflow.appointments.find(item => item.id === hold.appointmentId && item.patientId === currentUser?.id);
          if (existing) return { success: true, message: 'Booking sudah tersimpan sebelumnya.', appointment: existing };
        }
        if (!hold || hold.status !== 'HELD' || hold.packageId !== data.packageId || hold.psychologistId !== data.psychologistId ||
            hold.date !== data.date || hold.startTime !== startTime || hold.endTime !== endTime) {
          return { success: false, message: 'Reservasi slot tidak valid. Jangan transfer ulang; periksa riwayat dan hubungi admin bila sudah membayar.' };
        }
        if (Date.parse(hold.expiresAt) <= Date.now()) {
          if (!data.paymentProofUrl || !data.transferSenderName?.trim()) {
            return { success: false, message: 'Reservasi kedaluwarsa. Pilih slot kembali sebelum melakukan transfer.' };
          }
          return reconcilePayment();
        }
      }
      const latestAppointments = loadState<Appointment[]>('appointments', appointments);
      const latestSchedules = loadState<ScheduleSlot[]>('schedules', schedules);
      const latestPackages = loadState<ConsultationPackage[]>('packages', packages);
      const selectedPackage = latestPackages.find(item => item.id === data.packageId && item.isActive);
      const toMinutes = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        return hour * 60 + minute;
      };
      const requestedDuration = toMinutes(endTime) - toMinutes(startTime);

      if (!selectedPackage || requestedDuration !== selectedPackage.durationMinutes) {
        if (hold && data.paymentProofUrl && data.transferSenderName?.trim()) return reconcilePayment();
        return {
          success: false,
          message: 'Durasi slot tidak sesuai dengan durasi paket yang dipilih.'
        };
      }

      if (hold && hold.totalAmount !== calculatePackagePayableAmount(selectedPackage).totalAmount) {
        if (data.paymentProofUrl && data.transferSenderName?.trim()) return reconcilePayment();
        return { success: false, message: 'Tarif berubah sejak reservasi. Lepaskan reservasi hanya jika belum transfer, lalu periksa penawaran baru. Jika sudah transfer, kirim bukti untuk pencocokan.' };
      }

      const availability = computeDynamicSlotsForDate(
        data.date,
        loadScheduleSettings(),
        latestAppointments,
        data.psychologistId,
        requestedDuration,
        hold?.id
      );
      const availableSlot = availability.slots.find(
        slot => slot.startTime === startTime && slot.endTime === endTime && slot.isAvailable
      );
      if (!availableSlot) {
        if (hold && data.paymentProofUrl && data.transferSenderName?.trim()) return reconcilePayment();
        return {
          success: false,
          message: availability.reason || 'Slot sudah tidak tersedia, berada di luar jam praktik, atau kuota telah penuh.'
        };
      }

      const result = await patientController.bookAppointment(
        {
          ...data,
          bookingSource: isAdminWalkIn ? 'ADMIN_WALK_IN' : 'PATIENT',
          patientId: effectivePatient.id,
          patientName: effectivePatient.name,
          patientEmail: effectivePatient.email,
          paymentMethod: isAdminWalkIn ? data.paymentMethod : data.paymentMethod?.includes('FULL') ? 'TRANSFER_BANK_FULL' : 'TRANSFER_BANK_DP',
          paymentChannelDetail: !isAdminWalkIn && hold?.paymentChannelDetail ? hold.paymentChannelDetail : data.paymentChannelDetail,
          paymentProofUrl: paymentCase?.paymentProofUrl || data.paymentProofUrl,
          paymentProofName: paymentCase?.paymentProofName || data.paymentProofName,
          paymentProofMimeType: paymentCase?.paymentProofMimeType || data.paymentProofMimeType,
          startTime,
          endTime
        },
        latestSchedules,
        latestAppointments,
        latestPackages,
        effectiveUsers,
        loadState<Record<string, IntakeForm>>('intakeForms', intakeForms)
      );

      if (result.success && result.appointment) {
        if (result.appointment.packageType !== 'ONLINE_TELE') {
          result.appointment = { ...result.appointment, meetingLocation: loadState('landingCms', INITIAL_LANDING_CMS).clinicAddress };
        }
        if (hold && Date.parse(hold.expiresAt) <= Date.now()) {
          if (data.paymentProofUrl && data.transferSenderName?.trim()) return reconcilePayment();
          return { success: false, message: 'Reservasi kedaluwarsa sebelum booking disimpan. Pilih kembali slot sebelum melanjutkan.' };
        }
        commitWorkflow(current => ({ ...current,
          appointments: [result.appointment!, ...current.appointments.filter(item => item.id !== result.appointment!.id)],
          walkInPatients: registerWalkInPatient && !current.walkInPatients.some(user => user.id === effectivePatient.id)
            ? [...current.walkInPatients, effectivePatient] : current.walkInPatients,
          holds: current.holds.map(item => item.id === (hold?.id || paymentCase?.holdId) ? { ...item, status: 'CONVERTED', appointmentId: result.appointment!.id } : item),
          reconciliations: current.reconciliations.map(item => item.id === paymentCase?.id
            ? { ...item, status: 'BOOKED', appointmentId: result.appointment!.id, paymentProofUrl: '' } : item)
        }));
        showToast('Booking Tersimpan', 'Jadwal menunggu verifikasi pembayaran admin.', 'success');
      }

      if (!result.success && hold && data.paymentProofUrl && data.transferSenderName?.trim()) return reconcilePayment();
      return result;
    });

    if (!locked.acquired || !locked.result) {
      if (locked.error) return { success: false, message: locked.error };
      showToast(
        'Slot Sedang Diproses',
        'Tanggal ini sedang diperbarui oleh proses booking lain. Tunggu sebentar lalu pilih ulang slot.',
        'warning'
      );
      return { success: false, message: 'Slot sedang dikunci sementara oleh proses lain.' };
    }

    return locked.result;
  };

  const submitIntakeForm = async (formData: Omit<IntakeForm, 'id' | 'completedAt'>) => {
    if (currentRole !== 'PATIENT' || currentUser?.id !== formData.patientId) {
      showToast('Akses Ditolak', 'Pre-test hanya dapat diisi oleh pasien untuk akunnya sendiri.', 'warning');
      return null;
    }
    return runWorkflowMutation(async () => {
      const saved = await patientController.submitIntakeForm(formData.patientId, formData);
      if (saved) {
        const latest = loadState<Record<string, IntakeForm>>('intakeForms', intakeForms);
        const next = { ...latest, [formData.patientId]: saved };
        localStorage.setItem(STORAGE_PREFIX + 'intakeForms', JSON.stringify(next));
        setIntakeForms(next);
        showToast('Pre-Test Tersimpan', 'Data profiling tersimpan. Lanjutkan konfirmasi booking.', 'success');
      }
      return saved;
    }, null);
  };

  const submitReview = (data: {
    appointmentId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
  }) => {
    if (currentRole !== 'PATIENT' || !currentUser) {
      showToast('Akses Ditolak', 'Ulasan hanya dapat dikirim oleh pasien.', 'warning');
      return;
    }

    const appointment = appointments.find(item => item.id === data.appointmentId);
    if (!appointment || appointment.patientId !== currentUser.id || appointment.status !== 'COMPLETED') {
      showToast('Ulasan Belum Tersedia', 'Ulasan hanya dapat dikirim setelah sesi selesai.', 'warning');
      return;
    }

    if (appointment.psychologistId !== data.psychologistId) {
      showToast('Data Tidak Sesuai', 'Psikolog pada ulasan tidak sesuai dengan data sesi.', 'warning');
      return;
    }

    if (appointment.reviewId || reviews.some(review => review.appointmentId === data.appointmentId)) {
      showToast('Ulasan Sudah Ada', 'Satu sesi hanya dapat memiliki satu ulasan aktif.', 'info');
      return;
    }

    if (data.rating < 1 || data.rating > 5 || !data.comment.trim()) {
      showToast('Ulasan Belum Lengkap', 'Pilih rating 1-5 dan tulis komentar sebelum mengirim.', 'warning');
      return;
    }

    const targetPsychologist = psychologists.find(p => p.userId === data.psychologistId);
    const targetUser = users.find(u => u.id === data.psychologistId);
    const psyName = targetUser?.name || targetPsychologist?.title || 'Psikolog JiwaSehat';

    void runWorkflowMutation(() => patientController.submitReview({
      appointmentId: data.appointmentId,
      psychologistId: data.psychologistId,
      patientId: currentUser.id,
      patientName: currentUser.name,
      rating: data.rating,
      comment: data.comment,
      isAnonymous: data.isAnonymous,
      psychologistName: psyName
    }), undefined);
  };

  const updatePsychologistProfile = (profileUpdate: Partial<PsychologistProfile>, specificPsychologistId?: string): Promise<boolean> => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Perubahan profil psikolog')) return Promise.resolve(false);
    const targetId = specificPsychologistId || profileUpdate.userId || currentUser?.id || '';
    if (targetId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Psikolog hanya dapat mengubah profil praktik miliknya.', 'warning');
      return Promise.resolve(false);
    }
    return runWorkflowMutation(() => psychologistController.updateProfile(targetId, { ...profileUpdate, userId: targetId }, loadState('psychologists', INITIAL_PSYCHOLOGISTS)), false);
  };

  const toggleSlotAvailability = (slotId: string) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return;
    const slot = schedules.find(item => item.id === slotId);
    if (!slot || (currentRole === 'PSYCHOLOGIST' && slot.psychologistId !== currentUser?.id)) {
      showToast('Slot Tidak Ditemukan', 'Slot bukan milik psikolog aktif.', 'warning');
      return;
    }
    psychologistController.toggleSlotAvailability(slotId, schedules);
  };

  const addScheduleSlot = (
    psychologistId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return Promise.resolve(false);
    if (currentRole === 'PSYCHOLOGIST' && psychologistId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Psikolog hanya dapat menambah slot pada jadwal miliknya.', 'warning');
      return Promise.resolve(false);
    }
    return psychologistController.addScheduleSlot(
      psychologistId,
      date,
      startTime,
      endTime,
      schedules
    );
  };

  const deleteScheduleSlot = (slotId: string) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return;
    const slot = schedules.find(item => item.id === slotId);
    if (!slot || (currentRole === 'PSYCHOLOGIST' && slot.psychologistId !== currentUser?.id) || slot.isBooked) {
      showToast('Slot Tidak Dapat Dihapus', 'Slot tidak ditemukan, bukan milik Anda, atau sudah terisi.', 'warning');
      return;
    }
    psychologistController.deleteScheduleSlot(slotId, schedules);
  };

  const approveReview = (reviewId: string) => {
    if (!ensureRole(['ADMIN'], 'Moderasi ulasan')) return;
    adminController.approveReview(reviewId, reviews);
  };

  const rejectReview = (reviewId: string) => {
    if (!ensureRole(['ADMIN'], 'Moderasi ulasan')) return;
    adminController.rejectReview(reviewId, reviews);
  };

  const savePackage = (pkg: ConsultationPackage) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    void runWorkflowMutation(() => psychologistController.savePackage(pkg, loadState('packages', packages)), undefined);
  };

  const deletePackage = (packageId: string) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    void runWorkflowMutation(async () => {
    const current = readWorkflowState();
    if (current.appointments.some(item => item.packageId === packageId) || current.holds.some(item => item.packageId === packageId && item.status === 'HELD')) {
      showToast('Paket Masih Digunakan', 'Nonaktifkan paket yang sudah memiliki riwayat booking; paket tidak dapat dihapus.', 'warning');
      return;
    }
    await psychologistController.deletePackage(packageId, loadState('packages', packages));
    }, undefined);
  };

  const togglePackageStatus = (packageId: string) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    void runWorkflowMutation(async () => {
    const current = loadState<ConsultationPackage[]>('packages', packages);
    const pkg = current.find(p => p.id === packageId);
    if (!pkg) return;
    const updated: ConsultationPackage = { ...pkg, isActive: pkg.isActive === false ? true : false };
    await psychologistController.savePackage(updated, current);
    }, undefined);
  };

  const updateAppointmentStatusUnlocked = (aptId: string, status: Appointment['status'], reason?: string): boolean => {
    const latestAppointments = loadState<Appointment[]>('appointments', appointments);
    const target = latestAppointments.find(item => item.id === aptId);
    if (!target) {
      showToast('Janji Temu Tidak Ditemukan', 'Status tidak dapat diubah karena data sesi tidak tersedia.', 'error');
      return false;
    }

    if (status === 'CANCELLED' && currentUser) {
      const result = cancelPaidPlan(latestAppointments, aptId, currentUser, reason || '');
      if (!result.appointments) {
        showToast('Pembatalan Ditolak', result.error || 'Layanan tidak dapat dibatalkan.', 'warning');
        return false;
      }
      setAppointments(result.appointments);
      showToast('Layanan Dibatalkan', 'Seluruh sisa jadwal dibatalkan dan rencana dihentikan. Histori sesi selesai dan pembayaran tetap tersimpan.', 'success');
      return true;
    }

    if (currentUser && ['ADMIN', 'PSYCHOLOGIST'].includes(currentRole)) {
      const allowedTargetStatuses: Appointment['status'][] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (
        (currentRole === 'PSYCHOLOGIST' && target.psychologistId !== currentUser.id) ||
        target.status !== 'CONFIRMED' ||
        !allowedTargetStatuses.includes(status)
      ) {
        showToast('Transisi Ditolak', 'Petugas hanya dapat memproses sesi terkonfirmasi dengan hak akses yang sesuai.', 'warning');
        return false;
      }
      if (target.treatmentPlanStatus === 'DISCONTINUED') {
        showToast('Rencana Dihentikan', 'Sesi pada rencana yang dihentikan tidak dapat diproses.', 'warning');
        return false;
      }
      if (['NO_SHOW', 'COMPLETED'].includes(status) && isOpenRescheduleRequest(target)) {
        showToast('Pengajuan Belum Diputuskan', 'Selesaikan pengajuan reschedule pasien sebelum menetapkan no-show.', 'warning');
        return false;
      }
      if (status === 'NO_SHOW' && (!reason?.trim() || new Date(`${target.date}T${target.startTime}:00+07:00`).getTime() > Date.now())) {
        showToast('No-show Ditolak', 'Alasan wajib diisi dan jadwal sesi harus sudah dimulai.', 'warning');
        return false;
      }
      if (status === 'COMPLETED') {
        const scheduledEnd = new Date(`${target.date}T${target.endTime}:00+07:00`);
        if (Number.isNaN(scheduledEnd.getTime()) || scheduledEnd.getTime() > Date.now()) {
          showToast(
            'Sesi Belum Berakhir',
            'Status selesai hanya dapat diberikan setelah waktu konsultasi berakhir.',
            'warning'
          );
          return false;
        }
      }
    } else {
      showToast('Akses Ditolak', 'Status janji temu hanya dapat diubah petugas yang berwenang.', 'warning');
      return false;
    }

    let nextAppointments = latestAppointments.map(item => (
      item.id === aptId ? { ...item, status, statusHistory: [...(item.statusHistory || []), {
        from: item.status, to: status, at: new Date().toISOString(),
        actorId: currentUser!.id, actorName: currentUser!.name, reason: reason?.trim()
      }] } : item
    ));

    if (status === 'COMPLETED' && target.treatmentPlanId) {
      const planAppointments = nextAppointments.filter(
        item => item.treatmentPlanId === target.treatmentPlanId
      );
      const totalSessions = Math.max(
        target.continuousSessionTotal || 1,
        ...planAppointments.map(item => item.continuousSessionTotal || 1)
      );
      const completedSessions = planAppointments.filter(item => item.status === 'COMPLETED').length;

      if (completedSessions >= totalSessions) {
        nextAppointments = nextAppointments.map(item => (
          item.treatmentPlanId === target.treatmentPlanId
            ? { ...item, treatmentPlanStatus: 'COMPLETED' as const }
            : item
        ));
      }
    }

    setAppointments(nextAppointments);
    const summary = getPaymentSummary(nextAppointments.find(item => item.id === aptId)!, nextAppointments);
    showToast('Status Sesi Diperbarui', summary.closurePending
      ? 'Pertemuan selesai dicatat. Layanan masih menunggu pelunasan melalui Admin.'
      : `Status sesi berhasil diubah menjadi ${status}.`, summary.closurePending ? 'warning' : 'success');
    return true;
  };

  const updateAppointmentStatus = (...args: Parameters<typeof updateAppointmentStatusUnlocked>): Promise<boolean> =>
    runWorkflowMutation(() => updateAppointmentStatusUnlocked(...args), false);

  const confirmRescheduledBookingUnlocked = (appointmentId: string): boolean => {
    if (!ensureRole(['ADMIN'], 'Konfirmasi ulang jadwal')) return false;
    const latest = loadState<Appointment[]>('appointments', appointments);
    const target = latest.find(item => item.id === appointmentId);
    if (!target || target.status !== 'PENDING' || !target.rescheduledAt ||
        target.treatmentPlanStatus === 'DISCONTINUED' || !['DP_PAID', 'PAID'].includes(target.paymentStatus)) {
      showToast('Konfirmasi Ditolak', 'Jadwal ini tidak menunggu konfirmasi ulang dengan pembayaran terverifikasi.', 'warning');
      return false;
    }
    const at = new Date().toISOString();
    const next = latest.map(item => item.id === appointmentId ? {
      ...item, status: 'CONFIRMED' as const,
      scheduleConfirmedAt: at, scheduleConfirmedByName: currentUser!.name,
      statusHistory: [...(item.statusHistory || []), {
        from: item.status, to: 'CONFIRMED' as const, at,
        actorId: currentUser!.id, actorName: currentUser!.name, reason: 'Konfirmasi ulang jadwal setelah reschedule'
      }]
    } : item);
    setAppointments(next);
    showToast('Jadwal Dikonfirmasi', 'Pembayaran yang sudah terverifikasi tetap berlaku tanpa DP kedua.', 'success');
    return true;
  };

  const confirmRescheduledBooking = (...args: Parameters<typeof confirmRescheduledBookingUnlocked>): Promise<boolean> =>
    runWorkflowMutation(() => confirmRescheduledBookingUnlocked(...args), false);

  const verifyPaymentAndConfirmBookingUnlocked = async (
    appointmentId: string,
    note?: string,
    receivedDate?: string,
    expectedProofVersion?: number,
    receivedAmount?: number
  ): Promise<boolean> => {
    if (currentRole !== 'ADMIN' || !currentUser) {
      showToast('Akses Ditolak', 'Verifikasi pembayaran hanya dapat dilakukan admin operasional.', 'warning');
      return false;
    }

    const latestAppointments = loadState<Appointment[]>('appointments', appointments);
    const target = latestAppointments.find(item => item.id === appointmentId);
    if (!target) {
      showToast('Booking Tidak Ditemukan', 'Data booking tidak tersedia atau sudah berubah.', 'error');
      return false;
    }

    if (target.status !== 'PENDING' || target.treatmentPlanStatus === 'DISCONTINUED') {
      showToast('Booking Sudah Diproses', 'Hanya booking berstatus menunggu yang dapat diverifikasi.', 'warning');
      return false;
    }

    if (target.rescheduledAt && ['DP_PAID', 'PAID'].includes(target.paymentStatus)) {
      return confirmRescheduledBookingUnlocked(appointmentId);
    }
    if (target.paymentProofState === 'REJECTED' || expectedProofVersion !== (target.paymentProofVersion || 0)) {
      showToast('Bukti Belum Dapat Diverifikasi', 'Bukti ditolak atau versinya berubah. Periksa kembali bukti terbaru.', 'warning');
      return false;
    }
    if (receivedDate && (!isValidBookingDate(receivedDate) || receivedDate > getPracticeDate())) {
      showToast('Tanggal Tidak Valid', 'Tanggal penerimaan pembayaran tidak boleh berada di masa depan.', 'warning');
      return false;
    }

    if (!(['DP_PENDING_VERIFICATION', 'PAID'] as Appointment['paymentStatus'][]).includes(target.paymentStatus)) {
      showToast('Pembayaran Belum Diajukan', 'Belum ada pembayaran yang dapat diverifikasi untuk booking ini.', 'warning');
      return false;
    }

    if (
      target.paymentStatus === 'DP_PENDING_VERIFICATION' &&
      (!target.paymentProofUrl?.trim() || !target.transferSenderName?.trim() || !target.paymentMethod)
    ) {
      showToast(
        'Bukti Pembayaran Tidak Lengkap',
        'Bukti, nama pengirim, dan metode pembayaran wajib tersedia sebelum konfirmasi.',
        'error'
      );
      return false;
    }

    const updated = verifyInitialReceipt(target, currentUser,
      receivedAmount ?? target.initialPaymentRecord?.amount ?? (target.totalAmount === 0 ? 0 : NaN),
      receivedDate || (target.initialPaymentRecord?.receivedAt ? getCashInDate(target.initialPaymentRecord.receivedAt) : getPracticeDate()), expectedProofVersion ?? -1, note);
    const nextAppointments = latestAppointments.map(item => item.id === appointmentId ? updated : item);

    setAppointments(syncPaymentAllocations(nextAppointments));
    showToast(
      'Pembayaran Terverifikasi',
      updated.initialRequirementMet ? 'Pembayaran tercatat dan booking dikonfirmasi.' : 'Penerimaan dicatat. Booking tetap menunggu sampai minimum DP terpenuhi.',
      'success'
    );
    return true;
  };

  const verifyPaymentAndConfirmBooking = (...args: Parameters<typeof verifyPaymentAndConfirmBookingUnlocked>): Promise<boolean> =>
    runWorkflowMutation(() => verifyPaymentAndConfirmBookingUnlocked(...args), false);

  const rejectPaymentProof: AppContextType['rejectPaymentProof'] = (id, reason, version) => runWorkflowMutation(() => {
    if (!currentUser || !ensureRole(['ADMIN'], 'Penolakan bukti')) return false;
    const latest = readWorkflowState().appointments;
    const source = latest.find(item => item.id === id);
    if (!source) return false;
    const rejected = rejectInitialPaymentProof(source, currentUser, reason, version);
    setAppointments(latest.map(item => item.id === id ? rejected : item));
    showToast('Bukti Ditolak', 'Alasan dan histori disimpan. Pasien dapat mengirim koreksi sebelum batas waktu.', 'success');
    return true;
  }, false);

  const correctPaymentProof: AppContextType['correctPaymentProof'] = (id, proof, version) => runWorkflowMutation(() => {
    if (!currentUser || !ensureRole(['PATIENT'], 'Koreksi bukti')) return false;
    const latest = readWorkflowState().appointments;
    const source = latest.find(item => item.id === id);
    if (!source) return false;
    const corrected = correctInitialPaymentProof(source, currentUser, proof, version);
    setAppointments(latest.map(item => item.id === id ? corrected : item));
    showToast('Koreksi Terkirim', 'Bukti terbaru menunggu pemeriksaan. Batas waktu asal tidak diulang.', 'success');
    return true;
  }, false);

  const recordFinalPaymentUnlocked = (
    appointmentId: string,
    payment: ReceivedPayment
  ): boolean => {
    if (currentRole !== 'ADMIN') {
      showToast('Akses Ditolak', 'Pencatatan pembayaran hanya dapat dilakukan admin operasional.', 'warning');
      return false;
    }

    if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0) {
      showToast('Nominal Tidak Valid', 'Nominal yang diterima harus lebih dari Rp 0.', 'error');
      return false;
    }
    if (payment.receivedDate && (!isValidBookingDate(payment.receivedDate) || payment.receivedDate > getPracticeDate())) {
      showToast('Tanggal Tidak Valid', 'Tanggal penerimaan pembayaran tidak boleh berada di masa depan.', 'warning');
      return false;
    }

    const latestAppointments = loadState<Appointment[]>('appointments', appointments);
    const target = latestAppointments.find(item => item.id === appointmentId);
    if (!target || !currentUser) {
      showToast('Pembayaran Tidak Tersedia', 'Booking tidak ditemukan.', 'warning');
      return false;
    }
    const account = resolvePaymentAccount(target, latestAppointments);
    const updated = appendReceivedPayment(account, currentUser, payment);
    if (updated === account) return true;
    const nextAppointments = latestAppointments.map(item => (
      item.id === account.id
        ? updated
        : target.billingMode !== 'PER_SESSION' && target.treatmentPlanId && item.treatmentPlanId === target.treatmentPlanId
          ? { ...item, paymentStatus: updated.paymentStatus, initialRequirementMet: updated.initialRequirementMet }
          : item
    ));
    const allocated = syncPaymentAllocations(nextAppointments);
    setAppointments(allocated);

    showToast(
      'Pembayaran Dicatat',
      getPaymentSummary(allocated.find(item => item.id === account.id)!, allocated).remainingByFinal === 0
        ? 'Pembayaran seluruh layanan lunas. Nominal tidak ditampilkan kembali pada portal admin.'
        : 'Pembayaran sebagian tercatat. Nominal tidak ditampilkan kembali pada portal admin.',
      'success'
    );
    return true;
  };

  const recordFinalPayment = (...args: Parameters<typeof recordFinalPaymentUnlocked>): Promise<boolean> =>
    runWorkflowMutation(() => recordFinalPaymentUnlocked(...args), false);

  const scheduleNextContinuousSession = async (
    appointmentId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Penjadwalan sesi lanjutan')) return false;

    const source = appointments.find(a => a.id === appointmentId);
    if (!source) {
      showToast('Gagal Menjadwalkan Sesi', 'Data sesi rujukan tidak ditemukan.', 'error');
      return false;
    }

    if (currentRole === 'PSYCHOLOGIST' && source.psychologistId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Paket berjalan ini bukan milik psikolog aktif.', 'warning');
      return false;
    }

    const totalSessions = source.continuousSessionTotal || 1;
    if (totalSessions <= 1) {
      showToast('Bukan Paket Berkelanjutan', 'Sesi ini bukan bagian dari paket rawat jalan multi-sesi.', 'warning');
      return false;
    }

    if (source.packageType === 'PSYCHOTHERAPY' && (source.continuousSessionNumber || 1) >= 4) {
      showToast('Rencana Awal Selesai', 'Untuk terapi lanjutan, pasien membuat booking psikoterapi baru.', 'info');
      return false;
    }

    if (source.treatmentPlanStatus === 'DISCONTINUED') {
      showToast('Paket Sudah Dihentikan', 'Paket yang dihentikan tidak dapat menerima jadwal sesi baru.', 'warning');
      return false;
    }

    if (source.treatmentPlanStatus === 'COMPLETED') {
      showToast('Paket Sudah Selesai', 'Seluruh sesi paket ini sudah diselesaikan.', 'info');
      return false;
    }

    if (!isPlanInitialPaymentVerified(source, appointments)) {
      showToast(
        'Pembayaran Belum Terverifikasi',
        'Sesi lanjutan hanya dapat dijadwalkan setelah pembayaran awal paket diverifikasi admin.',
        'warning'
      );
      return false;
    }

    if (source.status !== 'COMPLETED') {
      showToast(
        'Sesi Belum Selesai',
        'Selesaikan sesi yang terjadwal sebelum menjadwalkan sesi berikutnya.',
        'warning'
      );
      return false;
    }

    const today = getPracticeDate();
    if (!isValidBookingDate(date) || date <= today) {
      showToast('Tanggal Tidak Valid', 'Sesi lanjutan harus dijadwalkan minimal H+1.', 'warning');
      return false;
    }

    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    if (endMinutes <= startMinutes) {
      showToast('Jam Tidak Valid', 'Jam selesai harus lebih besar dari jam mulai.', 'warning');
      return false;
    }

    const duration = endMinutes - startMinutes;
    const originalDuration = toMinutes(source.endTime) - toMinutes(source.startTime);
    if (duration !== originalDuration) {
      showToast('Durasi Tidak Sesuai', `Durasi sesi lanjutan harus ${originalDuration} menit.`, 'warning');
      return false;
    }
    const locked = await withDaySlotLock(source.psychologistId, date, async () => {
      const latestAppointments = loadState<Appointment[]>('appointments', appointments);
      const latestSource = latestAppointments.find(apt => apt.id === appointmentId);
      if (!latestSource) {
        showToast('Sesi Tidak Ditemukan', 'Data sesi telah berubah. Muat ulang daftar sebelum melanjutkan.', 'warning');
        return false;
      }
      const latestTotalSessions = latestSource.continuousSessionTotal || 1;

      if (currentRole === 'PSYCHOLOGIST' && latestSource.psychologistId !== currentUser?.id) {
        showToast('Akses Ditolak', 'Data sesi berubah dan tidak lagi dapat dikelola oleh akun aktif.', 'warning');
        return false;
      }

      if (latestSource.status !== 'COMPLETED') {
        showToast(
          'Sesi Belum Selesai',
          'Selesaikan sesi yang terjadwal sebelum menjadwalkan sesi berikutnya.',
          'warning'
        );
        return false;
      }

      if (latestSource.treatmentPlanStatus === 'DISCONTINUED') {
        showToast('Paket Sudah Dihentikan', 'Paket yang dihentikan tidak dapat menerima jadwal sesi baru.', 'warning');
        return false;
      }

      if (latestSource.treatmentPlanStatus === 'COMPLETED') {
        showToast('Paket Sudah Selesai', 'Seluruh sesi paket ini sudah diselesaikan.', 'info');
        return false;
      }

      if (!isPlanInitialPaymentVerified(latestSource, latestAppointments)) {
        showToast('Pembayaran Belum Terverifikasi', 'Status pembayaran paket berubah. Muat ulang data lalu periksa kembali.', 'warning');
        return false;
      }

      const availability = computeDynamicSlotsForDate(
        date,
        loadScheduleSettings(),
        latestAppointments,
        latestSource.psychologistId,
        duration
      );
      const selectedSlot = availability.slots.find(
        slot => slot.startTime === startTime && slot.endTime === endTime
      );

      if (!selectedSlot?.isAvailable) {
        showToast(
          'Slot Tidak Tersedia',
          availability.reason || 'Slot bentrok, berada di luar jam praktik, atau kuota harian sudah penuh.',
          'error'
        );
        return false;
      }

      const activeStatuses: Appointment['status'][] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];
      const planId = latestSource.treatmentPlanId ||
        `tp-${latestSource.patientId}-${latestSource.packageId}-${latestSource.bookingCode}`;
      const planAppointments = latestAppointments.filter(apt => {
        if (latestSource.treatmentPlanId) return apt.treatmentPlanId === latestSource.treatmentPlanId;
        return (
          apt.patientId === latestSource.patientId &&
          apt.psychologistId === latestSource.psychologistId &&
          apt.packageId === latestSource.packageId &&
          apt.continuousSessionTotal === latestSource.continuousSessionTotal
        );
      });
      const billingAppointment = planAppointments.find(apt => (apt.continuousSessionNumber || 1) === 1) || latestSource;

      const existingActiveNext = planAppointments.find(
        apt => apt.id !== latestSource.id && activeStatuses.includes(apt.status)
      );
      if (existingActiveNext) {
        showToast(
          'Sesi Berikutnya Sudah Ada',
          `Paket ini sudah punya sesi aktif pada ${existingActiveNext.date} pukul ${existingActiveNext.startTime} - ${existingActiveNext.endTime}.`,
          'info'
        );
        return false;
      }

      const lastScheduledNumber = Math.max(
        latestSource.continuousSessionNumber || 1,
        ...planAppointments.map(apt => apt.continuousSessionNumber || 1)
      );
      const nextSessionNumber = lastScheduledNumber + 1;
      if ((latestSource.continuousSessionNumber || 1) !== lastScheduledNumber ||
          planAppointments.some(item => item.status !== 'COMPLETED')) {
        showToast('Periksa Sesi Terakhir', 'Selesaikan atau pulihkan sesi terakhir sebelum membuat sesi berikutnya.', 'warning');
        return false;
      }

      if (latestSource.packageType === 'PSYCHOTHERAPY' && nextSessionNumber > 4) {
        showToast('Rencana Awal Selesai', 'Sesi berikutnya harus melalui booking psikoterapi baru.', 'info');
        return false;
      }

      if (nextSessionNumber > latestTotalSessions) {
        showToast('Program Sudah Lengkap', `Seluruh ${latestTotalSessions} sesi pada paket ini sudah dijadwalkan.`, 'info');
        return false;
      }

      const sessionBilling = getNextSessionBilling(latestSource, loadState<ConsultationPackage[]>('packages', packages).find(item => item.id === latestSource.packageId));
      const nextAppointment: Appointment = {
        ...latestSource,
        id: `apt-${Date.now()}-${nextSessionNumber}`,
        bookingCode: `JS-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        date,
        startTime,
        endTime,
        status: 'CONFIRMED',
        paymentStatus: latestSource.billingMode === 'PER_SESSION' ? ((sessionBilling.totalAmount || 0) === 0 ? 'PAID' : 'PENDING') : billingAppointment.paymentStatus,
        treatmentPlanId: planId,
        treatmentPlanStatus: 'ACTIVE',
        continuousSessionNumber: nextSessionNumber,
        continuousSessionTotal: latestTotalSessions,
        totalAmount: 0,
        dpAmount: 0,
        remainingAmount: 0,
        subtotalAmount: 0,
        discountAmount: 0,
        discountCode: undefined,
        discountLabel: undefined,
        ...sessionBilling,
        scheduleVersion: 0,
        initialRequirementMet: true,
        initialPaymentRecord: undefined,
        paymentMethod: undefined,
        paymentChannelDetail: undefined,
        transferSenderName: undefined,
        paymentProofUrl: undefined,
        paymentProofName: undefined,
        paymentProofMimeType: undefined,
        paymentProofState: undefined,
        paymentProofVersion: undefined,
        paymentProofSubmittedAt: undefined,
        paymentProofLastUploadedAt: undefined,
        paymentProofCorrectionDeadline: undefined,
        paymentProofRejectionReason: undefined,
        paymentProofHistory: undefined,
        rescheduleRequest: undefined,
        rescheduleRequestHistory: undefined,
        paymentVerifiedAt: undefined,
        paymentVerifiedByName: undefined,
        paymentVerificationNote: undefined,
        finalPaymentAmount: undefined,
        finalPaymentRecords: undefined,
        finalPaymentMethod: undefined,
        finalPaymentChannelDetail: undefined,
        finalPaymentRecordedAt: undefined,
        finalPaymentRecordedByName: undefined,
        reviewId: undefined,
        rescheduledAt: undefined,
        rescheduledByName: undefined,
        rescheduledByRole: undefined,
        rescheduleReason: undefined,
        rescheduleHistory: [],
        scheduleConfirmedAt: new Date().toISOString(),
        scheduleConfirmedByName: currentUser!.name,
        statusHistory: [{
          from: 'PENDING', to: 'CONFIRMED', at: new Date().toISOString(),
          actorId: currentUser!.id, actorName: currentUser!.name,
          reason: 'Penjadwalan sesi lanjutan dengan pembayaran rencana terverifikasi'
        }],
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      const nextAppointments = [
        nextAppointment,
        ...latestAppointments.map(apt => (
          planAppointments.some(item => item.id === apt.id) && !apt.treatmentPlanId
            ? { ...apt, treatmentPlanId: planId }
            : apt
        ))
      ];

      setAppointments(syncPaymentAllocations(nextAppointments));
      showToast(
        'Sesi Lanjutan Dijadwalkan',
        `Sesi ${nextSessionNumber} dari ${latestTotalSessions} berhasil dibuat pada ${date} pukul ${startTime} - ${endTime}.`,
        'success'
      );
      return true;
    });

    if (!locked.acquired) {
      if (locked.error) return false;
      showToast('Slot Sedang Diproses', 'Tanggal ini sedang diperbarui. Tunggu sebentar lalu coba lagi.', 'warning');
      return false;
    }

    return locked.result === true;
  };

  const discontinueTreatmentPlan = async (appointmentId: string, reason: string): Promise<boolean> => {
    if (currentRole !== 'PSYCHOLOGIST') {
      showToast('Akses Ditolak', 'Hanya psikolog/pengelola yang dapat menghentikan paket berjalan.', 'warning');
      return false;
    }

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      showToast('Alasan Wajib Diisi', 'Tuliskan alasan penghentian paket untuk audit layanan.', 'warning');
      return false;
    }

    const source = loadState<Appointment[]>('appointments', appointments).find(item => item.id === appointmentId);
    if (!source || !source.treatmentPlanId || source.psychologistId !== currentUser?.id) {
      showToast('Paket Tidak Ditemukan', 'Treatment plan untuk sesi ini tidak tersedia.', 'error');
      return false;
    }

    return updateAppointmentStatus(appointmentId, 'CANCELLED', normalizedReason);
  };

  const rescheduleAppointment = async (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string,
    expectedVersion?: number,
    options?: RescheduleOptions
  ): Promise<boolean> => {
    if (!ensureRole(['PATIENT', 'ADMIN', 'PSYCHOLOGIST'], 'Reschedule janji temu')) return false;
    if (!reason?.trim()) {
      showToast('Alasan Wajib Diisi', 'Isi alasan perubahan jadwal untuk histori.', 'warning');
      return false;
    }

    const targetApt = appointments.find(a => a.id === aptId);
    if (!targetApt) {
      showToast('Gagal Reschedule', 'Data jadwal janji temu tidak ditemukan.', 'error');
      return false;
    }

    if (!currentUser || !canRescheduleAppointment(targetApt, currentUser)) {
      showToast('Reschedule Tidak Tersedia', 'Periksa status, kepemilikan, batas tiga kali, H-2 jam, atau empat hari setelah no-show.', 'warning');
      return false;
    }

    const todayDate = getPracticeDate();
    if (!isValidBookingDate(newDate) || newDate <= todayDate) {
      showToast('Tanggal Tidak Valid', 'Reschedule harus memilih tanggal minimal H+1.', 'warning');
      return false;
    }

    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    const duration = toMinutes(newEndTime) - toMinutes(newStartTime);
    if (duration <= 0) {
      showToast('Jam Tidak Valid', 'Jam selesai harus lebih besar dari jam mulai.', 'warning');
      return false;
    }
    const originalDuration = toMinutes(targetApt.endTime) - toMinutes(targetApt.startTime);
    if (duration !== originalDuration) {
      showToast(
        'Durasi Tidak Sesuai',
        `Reschedule harus mempertahankan durasi sesi ${originalDuration} menit.`,
        'warning'
      );
      return false;
    }

    const locked = await withDaySlotLock(targetApt.psychologistId, newDate, async () => {
      const latestAppointments = loadState<Appointment[]>('appointments', appointments);
      const latestTarget = latestAppointments.find(item => item.id === aptId);
      if (!latestTarget) {
        showToast('Booking Tidak Ditemukan', 'Data booking telah berubah. Muat ulang daftar sebelum melanjutkan.', 'warning');
        return false;
      }
      if (!canRescheduleAppointment(latestTarget, currentUser)) {
        showToast('Reschedule Dibatalkan', 'Status atau kepemilikan booking telah berubah. Muat ulang data lalu coba lagi.', 'warning');
        return false;
      }
      assertScheduleVersion(latestTarget, expectedVersion);
      if (currentRole === 'PATIENT') {
        if (options?.origin && options.origin !== 'PATIENT') throw new Error('Pasien tidak dapat mengubah asal pengajuan.');
        if (latestTarget.rescheduleRequest?.status === 'SLOT_SELECTION_REQUIRED' && options?.requestId !== latestTarget.rescheduleRequest.id) {
          throw new Error('Pengajuan sudah berubah. Periksa data terbaru.');
        }
        const requested = requestPatientReschedule(latestTarget, currentUser, newDate, newStartTime, newEndTime, reason, new Date(), options?.requestRevision);
        setAppointments(latestAppointments.map(item => item.id === aptId ? requested : item));
        return true;
      }
      if (latestTarget.status === 'NO_SHOW' && latestTarget.treatmentPlanId && latestAppointments.some(item =>
        item.id !== aptId && item.treatmentPlanId === latestTarget.treatmentPlanId &&
        (['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status) ||
          (item.continuousSessionNumber || 1) > (latestTarget.continuousSessionNumber || 1))
      )) {
        showToast('Periksa Rencana Terapi', 'Rencana ini sudah memiliki sesi lain. Periksa histori sebelum menjadwalkan ulang sesi tidak hadir.', 'warning');
        return false;
      }
      const otherAppointments = latestAppointments.filter(item => item.id !== aptId);
      const availability = computeDynamicSlotsForDate(
        newDate,
        loadScheduleSettings(),
        otherAppointments,
        latestTarget.psychologistId,
        duration
      );
      const selectedSlot = availability.slots.find(
        slot => slot.startTime === newStartTime && slot.endTime === newEndTime
      );

      if (!selectedSlot?.isAvailable) {
        showToast(
          'Slot Tidak Tersedia',
          availability.reason || 'Slot baru bentrok, berada di luar jam praktik, atau kuota harian sudah penuh.',
          'error'
        );
        return false;
      }

      const updatedApt = rescheduleExistingAppointment(latestTarget, currentUser, newDate, newStartTime, newEndTime, reason, new Date(), options?.origin);
      const nextAppointments = latestAppointments.map(item => item.id === aptId ? updatedApt : item);
      setAppointments(nextAppointments);
      return true;
    });

    if (!locked.acquired) {
      if (locked.error) return false;
      showToast('Slot Sedang Diproses', 'Tanggal tujuan sedang diperbarui. Tunggu sebentar lalu coba lagi.', 'warning');
      return false;
    }

    if (!locked.result) return false;

    showToast(
      'Reschedule Berhasil!',
      currentRole === 'PATIENT'
        ? `Pengajuan perubahan jadwal ke ${newDate} pukul ${newStartTime} - ${newEndTime} WIB dikirim untuk dikonfirmasi admin.`
        : `Jadwal pasien berhasil dipindahkan ke ${newDate} pukul ${newStartTime} - ${newEndTime} WIB.`,
      'success'
    );
    return true;
  };

  const reopenPatientReschedule: AppContextType['reopenPatientReschedule'] = (id, requestId, reason, revision) => runWorkflowMutation(() => {
    if (!currentUser || !ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Pemilihan ulang slot')) return false;
    const latest = readWorkflowState().appointments;
    const target = latest.find(item => item.id === id);
    if (!target) return false;
    const reopened = requireRescheduleSlotSelection(target, currentUser, requestId, reason, revision);
    setAppointments(latest.map(item => item.id === id ? reopened : item));
    showToast('Pemilihan Ulang Dibuka', 'Pasien dapat memilih ulang dari riwayat booking. Jadwal aktif tetap berlaku.', 'success');
    return true;
  }, false);

  const reviewPatientReschedule: AppContextType['reviewPatientReschedule'] = async (appointmentId, requestId, approve, reason, expectedRevision) => {
    if (!ensureRole(['ADMIN', 'PSYCHOLOGIST'], 'Review reschedule')) return false;
    return runWorkflowMutation(() => {
      const latest = readWorkflowState().appointments;
      const target = latest.find(item => item.id === appointmentId);
      if (!target?.rescheduleRequest || target.rescheduleRequest.id !== requestId || target.rescheduleRequest.status !== 'REQUESTED') return false;
      assertRequestRevision(target, expectedRevision);
      if (currentRole === 'PSYCHOLOGIST' && target.psychologistId !== currentUser?.id) return false;
      if (approve) {
        const result = reviewRescheduleAvailability(target, currentUser!, requestId, expectedRevision!, latest, loadScheduleSettings());
        setAppointments(latest.map(item => item.id === appointmentId ? result.appointment : item));
        showToast(result.applied ? 'Jadwal Diperbarui' : 'Pemilihan Ulang Dibuka',
          result.applied ? 'Usulan pasien disetujui tanpa DP tambahan.' : 'Pasien dapat memilih ulang dari riwayat booking. Jadwal aktif tetap berlaku.',
          result.applied ? 'success' : 'warning');
        return result.applied;
      }
      if (!reason?.trim()) throw new Error('Alasan penolakan wajib diisi.');
      setAppointments(latest.map(item => item.id === appointmentId ? { ...item,
        rescheduleRequest: { ...target.rescheduleRequest!, status: 'REJECTED',
          decidedAt: new Date().toISOString(), decidedByName: currentUser!.name, decisionReason: reason.trim() } } : item));
      return true;
    }, false);
  };

  const resetAllToDefaultUnlocked = () => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Reset data demo')) return;
    setWorkflow(commitWorkflow(() => ({ appointments: INITIAL_APPOINTMENTS, holds: [], walkInPatients: [], reconciliations: [] })));
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'psychologists');
    localStorage.removeItem(STORAGE_PREFIX + 'packages');
    localStorage.removeItem(STORAGE_PREFIX + 'tests');
    localStorage.removeItem(STORAGE_PREFIX + 'testResults');
    localStorage.removeItem(STORAGE_PREFIX + 'schedules');
    localStorage.removeItem(STORAGE_PREFIX + 'intakeForms');
    localStorage.removeItem(STORAGE_PREFIX + 'clinicalNotes');
    localStorage.removeItem(STORAGE_PREFIX + 'reviews');
    localStorage.removeItem(STORAGE_PREFIX + 'landingCms');
    localStorage.removeItem(STORAGE_PREFIX + 'patientCms');
    localStorage.removeItem(STORAGE_PREFIX + 'psychologistCms');
    resetScheduleSettings();

    setUsers(INITIAL_USERS);
    setPsychologists(INITIAL_PSYCHOLOGISTS);
    setPackages(INITIAL_PACKAGES);
    setSchedules(INITIAL_SCHEDULES);
    setIntakeForms(INITIAL_INTAKE_FORMS);
    setReviews(INITIAL_REVIEWS);
    setLandingCms(INITIAL_LANDING_CMS);
    setPatientCms(INITIAL_PATIENT_CMS);
    setPsychologistCms(INITIAL_PSYCHOLOGIST_CMS);
    setCurrentUserId('user-pat-1');
    setCurrentRole('GUEST');

    showToast('Data Direset', 'Seluruh data demo telah dikembalikan ke kondisi awal pabrik.', 'info');
  };

  const resetAllToDefault = (): Promise<void> => runWorkflowMutation(resetAllToDefaultUnlocked, undefined);

  // OOP Analytics computation
  const analytics: AnalyticsSummary = useMemo(() => {
    const dummyAdmin = Admin.create(
      users.find(u => u.role === 'ADMIN') || {
        id: 'adm-fallback',
        email: 'admin@jiwasehat.id',
        name: 'Admin',
        role: 'ADMIN',
        avatar: '',
        status: 'ACTIVE',
        isVerified: true,
        createdAt: '2026-01-01'
      }
    );
    return dummyAdmin.calculateAnalytics(appointments, users, reviews, psychologists);
  }, [appointments, users, reviews, psychologists]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentPsychologistProfile,
        users,
        psychologists,
        packages,
        schedules,
        appointments,
        slotHolds: workflow.holds,
        paymentReconciliations: workflow.reconciliations,
        reserveBookingSlot,
        intakeForms,
        reviews,
        analytics,
        toast,
        currentUserModel,
        currentPatientModel,
        currentPsychologistModel,
        currentAdminModel,
        authController,
        patientController,
        psychologistController,
        adminController,
        landingCms,
        patientCms,
        psychologistCms,
        updateLandingCms,
        updatePatientCms,
        updatePsychologistCms,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        activePatientTab,
        setActivePatientTab,
        activePsychologistTab,
        setActivePsychologistTab,
        activeAdminTab,
        setActiveAdminTab,
        selectedBookingPackageId,
        selectedBookingPsychologistId,
        setSelectedBookingPackageId,
        setSelectedBookingPsychologistId,
        startBookingFlow,
        startTestFlow,
        isLoginModalOpen,
        setIsLoginModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        loginAs,
        loginWithEmail,
        registerUser,
        logout,
        switchRole,
        switchPatientUser,
        showToast,
        dismissToast,
        updateUserProfile,
        saveAccountProfile,
        bookAppointment,
        submitIntakeForm,
        submitReview,
        approveReview,
        rejectReview,
        updatePsychologistProfile,
        toggleSlotAvailability,
        addScheduleSlot,
        deleteScheduleSlot,
        savePackage,
        deletePackage,
        togglePackageStatus,
        updateAppointmentStatus,
        confirmRescheduledBooking,
        reviewPatientReschedule,
        verifyPaymentAndConfirmBooking,
        reopenPatientReschedule,
        rejectPaymentProof,
        correctPaymentProof,
        recordFinalPayment,
        scheduleNextContinuousSession,
        discontinueTreatmentPlan,
        rescheduleAppointment,
        resetAllToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
