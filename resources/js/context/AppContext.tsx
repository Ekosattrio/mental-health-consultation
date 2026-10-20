import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  activeAdminTab: 'users' | 'reservations' | 'reviews';
  setActiveAdminTab: (tab: 'users' | 'reservations' | 'reviews') => void;

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
    paymentChannelDetail?: string;
    paymentReference?: string;
  }) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;

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
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, specificPsychologistId?: string) => void;
  toggleSlotAvailability: (slotId: string) => void;
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  deleteScheduleSlot: (slotId: string) => void;
  savePackage: (pkg: ConsultationPackage) => void;
  deletePackage: (packageId: string) => void;
  togglePackageStatus: (packageId: string) => void;
  updateAppointmentStatus: (aptId: string, status: Appointment['status']) => void;
  recordFinalPayment: (appointmentId: string, payment: {
    amount: number;
    method: NonNullable<Appointment['finalPaymentMethod']>;
    channelDetail?: string;
    reference?: string;
  }) => boolean;
  scheduleNextContinuousSession: (
    appointmentId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<boolean>;
  discontinueTreatmentPlan: (appointmentId: string, reason: string) => boolean;
  rescheduleAppointment: (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ) => Promise<boolean>;
  resetAllToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'jiwasehat_v3_';

const useDebouncedLocalStorage = <T,>(key: string, value: T, delayMs = 120) => {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [key, value, delayMs]);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence helpers
  const loadState = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [currentRole, setCurrentRole] = useState<UserRole>('GUEST');
  const [users, setUsers] = useState<UserEntity[]>(() => loadState('users', INITIAL_USERS));
  const [psychologists, setPsychologists] = useState<PsychologistProfile[]>(() => loadState('psychologists', INITIAL_PSYCHOLOGISTS));
  const [packages, setPackages] = useState<ConsultationPackage[]>(() => loadState('packages', INITIAL_PACKAGES));
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() => loadState('schedules', INITIAL_SCHEDULES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadState('appointments', INITIAL_APPOINTMENTS));
  const [intakeForms, setIntakeForms] = useState<Record<string, IntakeForm>>(() => loadState('intakeForms', INITIAL_INTAKE_FORMS));
  const [reviews, setReviews] = useState<Review[]>(() => loadState('reviews', INITIAL_REVIEWS));
  const [landingCms, setLandingCms] = useState<LandingPageCmsConfig>(() => loadState('landingCms', INITIAL_LANDING_CMS));
  const [patientCms, setPatientCms] = useState<PatientPageCmsConfig>(() => loadState('patientCms', INITIAL_PATIENT_CMS));
  const [psychologistCms, setPsychologistCms] = useState<PsychologistPageCmsConfig>(() => loadState('psychologistCms', INITIAL_PSYCHOLOGIST_CMS));
  const activeDayLocksRef = useRef<Set<string>>(new Set());

  // Global Toast Notification
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Tab controllers
  const [activePatientTab, setActivePatientTab] = useState<'overview' | 'faq' | 'booking' | 'history' | 'profile'>('overview');
  const [activePsychologistTab, setActivePsychologistTab] = useState<'overview' | 'schedule' | 'packages' | 'treatmentPlans' | 'patients' | 'finance' | 'cms' | 'history' | 'profile'>('overview');
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reservations' | 'reviews'>('reservations');

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

  useDebouncedLocalStorage('users', users);
  useDebouncedLocalStorage('psychologists', psychologists);
  useDebouncedLocalStorage('packages', packages);
  useDebouncedLocalStorage('schedules', schedules);
  useDebouncedLocalStorage('appointments', appointments);
  useDebouncedLocalStorage('intakeForms', intakeForms);
  useDebouncedLocalStorage('reviews', reviews);
  useDebouncedLocalStorage('landingCms', landingCms);
  useDebouncedLocalStorage('patientCms', patientCms);
  useDebouncedLocalStorage('psychologistCms', psychologistCms);

  useEffect(() => {
    const migrationKey = STORAGE_PREFIX + 'frontend_cleanup_v5';
    if (localStorage.getItem(migrationKey)) return;

    localStorage.removeItem(STORAGE_PREFIX + 'tests');
    localStorage.removeItem(STORAGE_PREFIX + 'testResults');
    localStorage.removeItem(STORAGE_PREFIX + 'clinicalNotes');

    setPackages(prev => prev.filter(pkg => String(pkg.type) !== 'ONLINE_TELE'));
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
  }, []);

  useEffect(() => {
    const handleCrossTabStorage = (event: StorageEvent) => {
      if (!event.newValue) return;

      try {
        if (event.key === STORAGE_PREFIX + 'appointments') {
          setAppointments(JSON.parse(event.newValue));
        }
        if (event.key === STORAGE_PREFIX + 'schedules') {
          setSchedules(JSON.parse(event.newValue));
        }
      } catch {
        // Abaikan payload storage yang rusak; state aktif tetap dipertahankan.
      }
    };

    window.addEventListener('storage', handleCrossTabStorage);
    return () => window.removeEventListener('storage', handleCrossTabStorage);
  }, []);

  const withLocalDaySlotLock = async <T,>(
    psychologistId: string,
    date: string,
    action: () => Promise<T>
  ): Promise<{ acquired: boolean; result?: T }> => {
    const lockId = `${psychologistId}:${date}`;
    const storageKey = `${STORAGE_PREFIX}day_slot_lock_${lockId}`;
    const now = Date.now();

    if (activeDayLocksRef.current.has(lockId)) {
      return { acquired: false };
    }

    try {
      const storedLock = JSON.parse(localStorage.getItem(storageKey) || 'null') as {
        token?: string;
        expiresAt?: number;
      } | null;
      if (storedLock?.expiresAt && storedLock.expiresAt > now) {
        return { acquired: false };
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    const token = `${now}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, JSON.stringify({ token, expiresAt: now + 20000 }));

    try {
      const confirmedLock = JSON.parse(localStorage.getItem(storageKey) || 'null') as { token?: string } | null;
      if (confirmedLock?.token !== token) {
        return { acquired: false };
      }
    } catch {
      return { acquired: false };
    }

    activeDayLocksRef.current.add(lockId);
    try {
      return { acquired: true, result: await action() };
    } finally {
      activeDayLocksRef.current.delete(lockId);
      try {
        const currentLock = JSON.parse(localStorage.getItem(storageKey) || 'null') as { token?: string } | null;
        if (currentLock?.token === token) {
          localStorage.removeItem(storageKey);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  };

  const withDaySlotLock = async <T,>(
    psychologistId: string,
    date: string,
    action: () => Promise<T>
  ): Promise<{ acquired: boolean; result?: T }> => {
    const lockName = `${STORAGE_PREFIX}booking:${psychologistId}:${date}`;
    if (navigator.locks?.request) {
      return navigator.locks.request(
        lockName,
        { mode: 'exclusive', ifAvailable: true },
        async lock => lock ? { acquired: true, result: await action() } : { acquired: false }
      );
    }

    return withLocalDaySlotLock(psychologistId, date, action);
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
      setPsychologists
    });
  }, []);

  const adminController = useMemo(() => {
    return new AdminController(showToast, {
      setReviews,
      setPackages,
      setAppointments
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
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    setLandingCms(prev => ({ ...prev, ...config }));
    showToast('CMS Landing Page Diperbarui', 'Perubahan konten landing page berhasil disimpan.', 'success');
  };

  const updatePatientCms = (config: Partial<PatientPageCmsConfig>) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    setPatientCms(prev => ({ ...prev, ...config }));
    showToast('CMS Halaman Pasien Diperbarui', 'Banner dan informasi krisis pasien berhasil disimpan.', 'success');
  };

  const updatePsychologistCms = (config: Partial<PsychologistPageCmsConfig>) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan CMS')) return;
    setPsychologistCms(prev => ({ ...prev, ...config }));
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
    paymentChannelDetail?: string;
    paymentReference?: string;
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
      setUsers(effectiveUsers);
      localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(effectiveUsers));
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
        return {
          success: false,
          message: 'Durasi slot tidak sesuai dengan durasi paket yang dipilih.'
        };
      }

      const availability = computeDynamicSlotsForDate(
        data.date,
        loadScheduleSettings(),
        latestAppointments,
        data.psychologistId,
        requestedDuration
      );
      const availableSlot = availability.slots.find(
        slot => slot.startTime === startTime && slot.endTime === endTime && slot.isAvailable
      );
      if (!availableSlot) {
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
          paymentMethod: isAdminWalkIn ? data.paymentMethod : 'TRANSFER_BANK_DP',
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
        const persistedAppointments = [
          result.appointment,
          ...latestAppointments.filter(item => item.id !== result.appointment?.id)
        ];
        localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(persistedAppointments));
      }

      return result;
    });

    if (!locked.acquired || !locked.result) {
      showToast(
        'Slot Sedang Diproses',
        'Tanggal ini sedang diperbarui oleh proses booking lain. Tunggu sebentar lalu pilih ulang slot.',
        'warning'
      );
      return { success: false, message: 'Slot sedang dikunci sementara oleh proses lain.' };
    }

    return locked.result;
  };

  const submitIntakeForm = (formData: Omit<IntakeForm, 'id' | 'completedAt'>) => {
    if (currentRole !== 'PATIENT' || currentUser?.id !== formData.patientId) {
      showToast('Akses Ditolak', 'Pre-test hanya dapat diisi oleh pasien untuk akunnya sendiri.', 'warning');
      return Promise.resolve(null);
    }
    return patientController.submitIntakeForm(formData.patientId, formData);
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

    patientController.submitReview({
      appointmentId: data.appointmentId,
      psychologistId: data.psychologistId,
      patientId: currentUser.id,
      patientName: currentUser.name,
      rating: data.rating,
      comment: data.comment,
      isAnonymous: data.isAnonymous,
      psychologistName: psyName
    });
  };

  const updatePsychologistProfile = (profileUpdate: Partial<PsychologistProfile>, specificPsychologistId?: string) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Perubahan profil psikolog')) return;
    const targetId = specificPsychologistId || profileUpdate.userId || currentUser?.id || '';
    if (targetId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Psikolog hanya dapat mengubah profil praktik miliknya.', 'warning');
      return;
    }
    psychologistController.updateProfile(targetId, profileUpdate, psychologists);
  };

  const toggleSlotAvailability = (slotId: string) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return;
    const slot = schedules.find(item => item.id === slotId);
    if (!slot || slot.psychologistId !== currentUser?.id) {
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
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return Promise.resolve(false);
    if (psychologistId !== currentUser?.id) {
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
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan slot praktik')) return;
    const slot = schedules.find(item => item.id === slotId);
    if (!slot || slot.psychologistId !== currentUser?.id || slot.isBooked) {
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
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    adminController.savePackage(pkg, packages);
  };

  const deletePackage = (packageId: string) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    if (appointments.some(item => item.packageId === packageId)) {
      showToast('Paket Masih Digunakan', 'Nonaktifkan paket yang sudah memiliki riwayat booking; paket tidak dapat dihapus.', 'warning');
      return;
    }
    adminController.deletePackage(packageId, packages);
  };

  const togglePackageStatus = (packageId: string) => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Pengelolaan paket konsultasi')) return;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    const updated: ConsultationPackage = { ...pkg, isActive: pkg.isActive === false ? true : false };
    adminController.savePackage(updated, packages);
  };

  const updateAppointmentStatus = (aptId: string, status: Appointment['status']) => {
    const latestAppointments = loadState<Appointment[]>('appointments', appointments);
    const target = latestAppointments.find(item => item.id === aptId);
    if (!target) {
      showToast('Janji Temu Tidak Ditemukan', 'Status tidak dapat diubah karena data sesi tidak tersedia.', 'error');
      return;
    }

    if (currentRole === 'ADMIN') {
      const confirmablePaymentStatuses: Appointment['paymentStatus'][] = ['DP_PENDING_VERIFICATION', 'PAID'];
      if (
        target.status !== 'PENDING' ||
        status !== 'CONFIRMED' ||
        !confirmablePaymentStatuses.includes(target.paymentStatus)
      ) {
        showToast('Transisi Ditolak', 'Admin hanya dapat mengonfirmasi booking berstatus menunggu.', 'warning');
        return;
      }
    } else if (currentRole === 'PSYCHOLOGIST') {
      const allowedTargetStatuses: Appointment['status'][] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];
      if (
        target.psychologistId !== currentUser?.id ||
        target.status !== 'CONFIRMED' ||
        !allowedTargetStatuses.includes(status)
      ) {
        showToast('Transisi Ditolak', 'Psikolog hanya dapat menyelesaikan, membatalkan, atau menandai no-show dari sesi terkonfirmasi miliknya.', 'warning');
        return;
      }
    } else {
      showToast('Akses Ditolak', 'Status janji temu hanya dapat diubah petugas yang berwenang.', 'warning');
      return;
    }

    adminController.updateAppointmentStatus(aptId, status, latestAppointments);
  };

  const recordFinalPayment = (
    appointmentId: string,
    payment: {
      amount: number;
      method: NonNullable<Appointment['finalPaymentMethod']>;
      channelDetail?: string;
      reference?: string;
    }
  ): boolean => {
    if (currentRole !== 'ADMIN') {
      showToast('Akses Ditolak', 'Pencatatan pelunasan hanya dapat dilakukan admin operasional.', 'warning');
      return false;
    }

    if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
      showToast('Nominal Tidak Valid', 'Nominal pelunasan yang diterima harus lebih dari Rp 0.', 'error');
      return false;
    }

    const latestAppointments = loadState<Appointment[]>('appointments', appointments);
    const target = latestAppointments.find(item => item.id === appointmentId);
    if (!target || target.paymentStatus !== 'DP_PAID') {
      showToast('Pelunasan Tidak Tersedia', 'Booking ini tidak berada pada status DP terbayar.', 'warning');
      return false;
    }

    const updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const nextAppointments = latestAppointments.map(item => (
      item.id === appointmentId
        ? {
            ...item,
            paymentStatus: 'PAID' as const,
            remainingAmount: 0,
            finalPaymentAmount: Math.round(payment.amount),
            finalPaymentMethod: payment.method,
            finalPaymentChannelDetail: payment.channelDetail?.trim() || undefined,
            finalPaymentReference: payment.reference?.trim() || undefined,
            finalPaymentRecordedAt: updatedAt,
            finalPaymentRecordedByName: currentUser?.name || 'Admin Operasional'
          }
        : item
    ));
    setAppointments(nextAppointments);
    localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(nextAppointments));

    showToast(
      'Pelunasan Dicatat',
      'Status pembayaran berubah menjadi lunas. Nominal tidak ditampilkan kembali pada portal admin.',
      'success'
    );
    return true;
  };

  const scheduleNextContinuousSession = async (
    appointmentId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Penjadwalan sesi lanjutan')) return false;

    const source = appointments.find(a => a.id === appointmentId);
    if (!source) {
      showToast('Gagal Menjadwalkan Sesi', 'Data sesi rujukan tidak ditemukan.', 'error');
      return false;
    }

    if (source.psychologistId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Paket berjalan ini bukan milik psikolog aktif.', 'warning');
      return false;
    }

    const totalSessions = source.continuousSessionTotal || 1;
    if (totalSessions <= 1) {
      showToast('Bukan Paket Berkelanjutan', 'Sesi ini bukan bagian dari paket rawat jalan multi-sesi.', 'warning');
      return false;
    }

    if (source.treatmentPlanStatus === 'DISCONTINUED') {
      showToast('Paket Sudah Dihentikan', 'Paket yang dihentikan tidak dapat menerima jadwal sesi baru.', 'warning');
      return false;
    }

    if (source.status !== 'COMPLETED') {
      showToast(
        'Sesi Belum Selesai',
        'Sesi lanjutan baru bisa dibuat setelah psikolog menandai sesi terakhir sebagai selesai.',
        'warning'
      );
      return false;
    }

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (date <= today) {
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
      const latestSource = latestAppointments.find(apt => apt.id === appointmentId) || source;
      const latestTotalSessions = latestSource.continuousSessionTotal || 1;

      if (latestSource.psychologistId !== currentUser?.id) {
        showToast('Akses Ditolak', 'Data sesi berubah dan tidak lagi dapat dikelola oleh akun aktif.', 'warning');
        return false;
      }

      if (latestSource.status !== 'COMPLETED') {
        showToast(
          'Sesi Belum Selesai',
          'Sesi lanjutan baru bisa dibuat setelah psikolog menandai sesi terakhir sebagai selesai.',
          'warning'
        );
        return false;
      }

      if (latestSource.treatmentPlanStatus === 'DISCONTINUED') {
        showToast('Paket Sudah Dihentikan', 'Paket yang dihentikan tidak dapat menerima jadwal sesi baru.', 'warning');
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

      if (nextSessionNumber > latestTotalSessions) {
        showToast('Program Sudah Lengkap', `Seluruh ${latestTotalSessions} sesi pada paket ini sudah dijadwalkan.`, 'info');
        return false;
      }

      const nextAppointment: Appointment = {
        ...latestSource,
        id: `apt-${Date.now()}-${nextSessionNumber}`,
        bookingCode: `JS-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        date,
        startTime,
        endTime,
        status: 'CONFIRMED',
        treatmentPlanId: planId,
        continuousSessionNumber: nextSessionNumber,
        continuousSessionTotal: latestTotalSessions,
        totalAmount: 0,
        dpAmount: 0,
        remainingAmount: 0,
        finalPaymentAmount: undefined,
        finalPaymentMethod: undefined,
        finalPaymentChannelDetail: undefined,
        finalPaymentReference: undefined,
        finalPaymentRecordedAt: undefined,
        finalPaymentRecordedByName: undefined,
        reviewId: undefined,
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

      setAppointments(nextAppointments);
      localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(nextAppointments));
      showToast(
        'Sesi Lanjutan Dijadwalkan',
        `Sesi ${nextSessionNumber} dari ${latestTotalSessions} berhasil dibuat pada ${date} pukul ${startTime} - ${endTime}.`,
        'success'
      );
      return true;
    });

    if (!locked.acquired) {
      showToast('Slot Sedang Diproses', 'Tanggal ini sedang diperbarui. Tunggu sebentar lalu coba lagi.', 'warning');
      return false;
    }

    return locked.result === true;
  };

  const discontinueTreatmentPlan = (appointmentId: string, reason: string): boolean => {
    if (currentRole !== 'PSYCHOLOGIST') {
      showToast('Akses Ditolak', 'Hanya psikolog/pengelola yang dapat menghentikan paket berjalan.', 'warning');
      return false;
    }

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      showToast('Alasan Wajib Diisi', 'Tuliskan alasan penghentian paket untuk audit layanan.', 'warning');
      return false;
    }

    const source = appointments.find(item => item.id === appointmentId);
    if (!source || !source.treatmentPlanId || source.psychologistId !== currentUser?.id) {
      showToast('Paket Tidak Ditemukan', 'Treatment plan untuk sesi ini tidak tersedia.', 'error');
      return false;
    }

    const discontinuedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const nextAppointments = appointments.map(item => (
      item.treatmentPlanId === source.treatmentPlanId
        ? {
            ...item,
            treatmentPlanStatus: 'DISCONTINUED' as const,
            treatmentPlanDiscontinuedAt: discontinuedAt,
            treatmentPlanDiscontinuedReason: normalizedReason
          }
        : item
    ));

    setAppointments(nextAppointments);
    localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(nextAppointments));
    showToast('Paket Dihentikan', 'Treatment plan dihentikan dan sesi lanjutan baru telah dikunci.', 'success');
    return true;
  };

  const rescheduleAppointment = async (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): Promise<boolean> => {
    if (!ensureRole(['PATIENT', 'ADMIN'], 'Reschedule janji temu')) return false;

    const targetApt = appointments.find(a => a.id === aptId);
    if (!targetApt) {
      showToast('Gagal Reschedule', 'Data jadwal janji temu tidak ditemukan.', 'error');
      return false;
    }

    if (currentRole === 'PATIENT' && targetApt.patientId !== currentUser?.id) {
      showToast('Akses Ditolak', 'Pasien hanya dapat menjadwalkan ulang janji temu miliknya.', 'warning');
      return false;
    }

    if (!(['PENDING', 'CONFIRMED'] as Appointment['status'][]).includes(targetApt.status)) {
      showToast('Reschedule Tidak Tersedia', 'Hanya booking menunggu atau terkonfirmasi yang dapat dijadwalkan ulang.', 'warning');
      return false;
    }

    const today = new Date();
    const todayDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (newDate <= todayDate) {
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
      const latestTarget = latestAppointments.find(item => item.id === aptId) || targetApt;
      if (
        !(['PENDING', 'CONFIRMED'] as Appointment['status'][]).includes(latestTarget.status) ||
        (currentRole === 'PATIENT' && latestTarget.patientId !== currentUser?.id)
      ) {
        showToast('Reschedule Dibatalkan', 'Status atau kepemilikan booking telah berubah. Muat ulang data lalu coba lagi.', 'warning');
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

      const updatedApt: Appointment = {
        ...latestTarget,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: currentRole === 'PATIENT' ? 'PENDING' : latestTarget.status,
        rescheduledAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        rescheduledByName: currentUser?.name || 'Sistem',
        rescheduledByRole: currentUser?.role || currentRole,
        rescheduleReason: reason
      };
      const nextAppointments = latestAppointments.map(item => item.id === aptId ? updatedApt : item);
      setAppointments(nextAppointments);
      localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(nextAppointments));
      return true;
    });

    if (!locked.acquired) {
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

  const resetAllToDefault = () => {
    if (!ensureRole(['PSYCHOLOGIST'], 'Reset data demo')) return;
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'psychologists');
    localStorage.removeItem(STORAGE_PREFIX + 'packages');
    localStorage.removeItem(STORAGE_PREFIX + 'tests');
    localStorage.removeItem(STORAGE_PREFIX + 'testResults');
    localStorage.removeItem(STORAGE_PREFIX + 'schedules');
    localStorage.removeItem(STORAGE_PREFIX + 'appointments');
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
    setAppointments(INITIAL_APPOINTMENTS);
    setIntakeForms(INITIAL_INTAKE_FORMS);
    setReviews(INITIAL_REVIEWS);
    setLandingCms(INITIAL_LANDING_CMS);
    setPatientCms(INITIAL_PATIENT_CMS);
    setPsychologistCms(INITIAL_PSYCHOLOGIST_CMS);
    setCurrentUserId('user-pat-1');
    setCurrentRole('GUEST');

    showToast('Data Direset', 'Seluruh data demo telah dikembalikan ke kondisi awal pabrik.', 'info');
  };

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
