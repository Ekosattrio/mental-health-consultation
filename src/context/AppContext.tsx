import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User as UserEntity,
  UserRole,
  UserStatus,
  PsychologistProfile,
  ConsultationPackage,
  PsychologicalTest,
  ScheduleSlot,
  Appointment,
  TestResult,
  IntakeForm,
  ClinicalNote,
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
  INITIAL_TESTS,
  INITIAL_INTAKE_FORMS,
  INITIAL_TEST_RESULTS,
  INITIAL_SCHEDULES,
  INITIAL_APPOINTMENTS,
  INITIAL_CLINICAL_NOTES,
  INITIAL_REVIEWS,
  INITIAL_LANDING_CMS,
  INITIAL_PATIENT_CMS,
  INITIAL_PSYCHOLOGIST_CMS
} from '../data/mockData';

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
  tests: PsychologicalTest[];
  schedules: ScheduleSlot[];
  appointments: Appointment[];
  testResults: TestResult[];
  intakeForms: Record<string, IntakeForm>;
  clinicalNotes: Record<string, ClinicalNote>;
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
  viewMode: 'PLATFORM' | 'BLUEPRINT';
  setViewMode: (mode: 'PLATFORM' | 'BLUEPRINT') => void;
  activePatientTab: 'overview' | 'faq' | 'booking' | 'tests' | 'intake' | 'history' | 'profile';
  setActivePatientTab: (tab: 'overview' | 'faq' | 'booking' | 'tests' | 'intake' | 'history' | 'profile') => void;
  activePsychologistTab: 'overview' | 'schedule' | 'patients' | 'finance' | 'cms' | 'history' | 'profile';
  setActivePsychologistTab: (tab: 'overview' | 'schedule' | 'patients' | 'finance' | 'cms' | 'history' | 'profile') => void;
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
  loginAs: (role: UserRole, specificUserId?: string) => void;
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
  bookAppointment: (data: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    psychologistId: string;
    packageId: string;
    date: string;
    slotId: string;
    paymentMethod?: string;
    startTime?: string;
    endTime?: string;
  }) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;

  submitIntakeForm: (formData: Omit<IntakeForm, 'id' | 'completedAt'>) => Promise<IntakeForm | null>;
  submitTestResult: (resultData: Omit<TestResult, 'id' | 'completedAt'>) => Promise<TestResult | null>;
  saveClinicalNotes: (appointmentId: string, notes: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ClinicalNote | null>;
  submitReview: (reviewData: {
    appointmentId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
  }) => void;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  toggleUserStatus: (userId: string, status: UserStatus) => void;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, specificPsychologistId?: string) => void;
  toggleSlotAvailability: (slotId: string) => void;
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  deleteScheduleSlot: (slotId: string) => void;
  savePackage: (pkg: ConsultationPackage) => void;
  deletePackage: (packageId: string) => void;
  saveTest: (test: PsychologicalTest) => void;
  updateAppointmentStatus: (aptId: string, status: Appointment['status']) => void;
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
  const [viewMode, setViewMode] = useState<'PLATFORM' | 'BLUEPRINT'>('PLATFORM');
  const [users, setUsers] = useState<UserEntity[]>(() => loadState('users', INITIAL_USERS));
  const [psychologists, setPsychologists] = useState<PsychologistProfile[]>(() => loadState('psychologists', INITIAL_PSYCHOLOGISTS));
  const [packages, setPackages] = useState<ConsultationPackage[]>(() => loadState('packages', INITIAL_PACKAGES));
  const [tests, setTests] = useState<PsychologicalTest[]>(() => loadState('tests', INITIAL_TESTS));
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() => loadState('schedules', INITIAL_SCHEDULES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadState('appointments', INITIAL_APPOINTMENTS));
  const [testResults, setTestResults] = useState<TestResult[]>(() => loadState('testResults', INITIAL_TEST_RESULTS));
  const [intakeForms, setIntakeForms] = useState<Record<string, IntakeForm>>(() => loadState('intakeForms', INITIAL_INTAKE_FORMS));
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, ClinicalNote>>(() => loadState('clinicalNotes', INITIAL_CLINICAL_NOTES));
  const [reviews, setReviews] = useState<Review[]>(() => loadState('reviews', INITIAL_REVIEWS));
  const [landingCms, setLandingCms] = useState<LandingPageCmsConfig>(() => loadState('landingCms', INITIAL_LANDING_CMS));
  const [patientCms, setPatientCms] = useState<PatientPageCmsConfig>(() => loadState('patientCms', INITIAL_PATIENT_CMS));
  const [psychologistCms, setPsychologistCms] = useState<PsychologistPageCmsConfig>(() => loadState('psychologistCms', INITIAL_PSYCHOLOGIST_CMS));

  // Global Toast Notification
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Tab controllers
  const [activePatientTab, setActivePatientTab] = useState<'overview' | 'faq' | 'booking' | 'tests' | 'intake' | 'history' | 'profile'>('overview');
  const [activePsychologistTab, setActivePsychologistTab] = useState<'overview' | 'schedule' | 'patients' | 'finance' | 'cms' | 'history' | 'profile'>('overview');
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reservations' | 'reviews'>('reservations');

  // Current active user ID
  const [currentUserId, setCurrentUserId] = useState<string>('user-pat-1');

  // Flow State
  const [selectedBookingPackageId, setSelectedBookingPackageId] = useState<string | undefined>();
  const [selectedBookingPsychologistId, setSelectedBookingPsychologistId] = useState<string | undefined>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'psychologists', JSON.stringify(psychologists));
  }, [psychologists]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'packages', JSON.stringify(packages));
  }, [packages]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'tests', JSON.stringify(tests));
  }, [tests]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'schedules', JSON.stringify(schedules));
  }, [schedules]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'testResults', JSON.stringify(testResults));
  }, [testResults]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'intakeForms', JSON.stringify(intakeForms));
  }, [intakeForms]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'clinicalNotes', JSON.stringify(clinicalNotes));
  }, [clinicalNotes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'reviews', JSON.stringify(reviews));
  }, [reviews]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'landingCms', JSON.stringify(landingCms));
  }, [landingCms]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'patientCms', JSON.stringify(patientCms));
  }, [patientCms]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'psychologistCms', JSON.stringify(psychologistCms));
  }, [psychologistCms]);

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

  const currentUser = currentRole === 'GUEST' ? null : users.find(u => u.id === currentUserId) || users[0];

  const currentPsychologistProfile =
    psychologists.find(p => p.userId === (currentUser?.id ?? 'user-psy-1')) || psychologists[0];

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
      setIsLoginModalOpen,
      setViewMode
    });
  }, []);

  const patientController = useMemo(() => {
    return new PatientController(showToast, {
      setAppointments,
      setSchedules,
      setIntakeForms,
      setTestResults,
      setReviews
    });
  }, []);

  const psychologistController = useMemo(() => {
    return new PsychologistController(showToast, {
      setSchedules,
      setClinicalNotes,
      setAppointments,
      setPsychologists
    });
  }, []);

  const adminController = useMemo(() => {
    return new AdminController(showToast, {
      setUsers,
      setReviews,
      setPackages,
      setTests,
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

    setActivePatientTab('booking');
    setViewMode('PLATFORM');
    showToast('Pre-Test & Booking', 'Lengkapi pre-test singkat, lalu pilih jadwal konsultasi minimal H+1.', 'info');
  };

  const startTestFlow = () => {
    if (currentRole === 'GUEST' || !currentUser) {
      showToast(
        'Masuk Terlebih Dahulu',
        'Silakan masuk atau daftar akun terlebih dahulu untuk mengikuti asesmen tes psikologi.',
        'info'
      );
      openAuthModal('LOGIN');
      return;
    }

    setActivePatientTab('tests');
    setViewMode('PLATFORM');
    showToast('Asesmen DASS-21', 'Mulai pengisian tes psikologi mandiri 21 butir.', 'info');
  };

  const updateLandingCms = (config: Partial<LandingPageCmsConfig>) => {
    setLandingCms(prev => ({ ...prev, ...config }));
    showToast('CMS Landing Page Diperbarui', 'Perubahan konten landing page berhasil disimpan.', 'success');
  };

  const updatePatientCms = (config: Partial<PatientPageCmsConfig>) => {
    setPatientCms(prev => ({ ...prev, ...config }));
    showToast('CMS Halaman Pasien Diperbarui', 'Banner dan informasi krisis pasien berhasil disimpan.', 'success');
  };

  const updatePsychologistCms = (config: Partial<PsychologistPageCmsConfig>) => {
    setPsychologistCms(prev => ({ ...prev, ...config }));
    showToast('CMS Halaman Dokter Diperbarui', 'Panduan klinis dan SOP dokter berhasil disimpan.', 'success');
  };

  const loginAs = (role: UserRole, specificUserId?: string) => {
    authController.loginAs(role, specificUserId, users);
    if (role === 'PATIENT' && (selectedBookingPackageId || selectedBookingPsychologistId)) {
      setActivePatientTab('booking');
    }
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password?: string;
  }) => {
    return authController.register(userData, users);
  };

  const logout = () => {
    authController.logout();
  };

  const switchRole = (role: UserRole, specificUserId?: string) => {
    authController.loginAs(role, specificUserId, users);
  };

  const switchPatientUser = (patientId: string) => {
    setCurrentUserId(patientId);
    const targetUser = users.find(u => u.id === patientId);
    showToast('Ganti Pasien', `Aktif sebagai ${targetUser?.name || 'Pasien'}. Data intake dan tes diperbarui.`);
  };

  // -------------------------------------------------------------
  // ACTION FACADES
  // -------------------------------------------------------------
  const bookAppointment = (data: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    psychologistId: string;
    packageId: string;
    date: string;
    slotId: string;
    paymentMethod?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    return patientController.bookAppointment(
      data,
      schedules,
      appointments,
      packages,
      users,
      intakeForms,
      testResults
    );
  };

  const submitIntakeForm = (formData: Omit<IntakeForm, 'id' | 'completedAt'>) => {
    return patientController.submitIntakeForm(formData.patientId, formData);
  };

  const submitTestResult = (resultData: Omit<TestResult, 'id' | 'completedAt'>) => {
    return patientController.submitTestResult(resultData.patientId, resultData);
  };

  const submitReview = (data: {
    appointmentId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
  }) => {
    const targetPsychologist = psychologists.find(p => p.userId === data.psychologistId);
    const targetUser = users.find(u => u.id === data.psychologistId);
    const psyName = targetUser?.name || targetPsychologist?.title || 'Psikolog JiwaSehat';

    patientController.submitReview({
      appointmentId: data.appointmentId,
      psychologistId: data.psychologistId,
      patientId: currentUser?.id || 'user-pat-1',
      patientName: currentUser?.name || 'Pasien',
      rating: data.rating,
      comment: data.comment,
      isAnonymous: data.isAnonymous,
      psychologistName: psyName
    });
  };

  const saveClinicalNotes = (
    appointmentId: string,
    notes: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    return psychologistController.saveClinicalNotes(appointmentId, notes, clinicalNotes);
  };

  const updatePsychologistProfile = (profileUpdate: Partial<PsychologistProfile>, specificPsychologistId?: string) => {
    const targetId = specificPsychologistId || profileUpdate.userId || currentUser?.id || 'user-psy-1';
    psychologistController.updateProfile(targetId, profileUpdate, psychologists);
  };

  const toggleSlotAvailability = (slotId: string) => {
    psychologistController.toggleSlotAvailability(slotId, schedules);
  };

  const addScheduleSlot = (
    psychologistId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    return psychologistController.addScheduleSlot(
      psychologistId,
      date,
      startTime,
      endTime,
      schedules
    );
  };

  const deleteScheduleSlot = (slotId: string) => {
    psychologistController.deleteScheduleSlot(slotId, schedules);
  };

  const toggleUserStatus = (userId: string, status: UserStatus) => {
    adminController.toggleUserStatus(userId, status, users);
  };

  const approveReview = (reviewId: string) => {
    adminController.approveReview(reviewId, reviews);
  };

  const rejectReview = (reviewId: string) => {
    adminController.rejectReview(reviewId, reviews);
  };

  const savePackage = (pkg: ConsultationPackage) => {
    adminController.savePackage(pkg, packages);
  };

  const deletePackage = (packageId: string) => {
    adminController.deletePackage(packageId, packages);
  };

  const saveTest = (test: PsychologicalTest) => {
    adminController.saveTest(test, tests);
  };

  const updateAppointmentStatus = (aptId: string, status: Appointment['status']) => {
    adminController.updateAppointmentStatus(aptId, status, appointments);
  };

  const rescheduleAppointment = async (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): Promise<boolean> => {
    const aptIndex = appointments.findIndex(a => a.id === aptId);
    if (aptIndex === -1) {
      showToast('Gagal Reschedule', 'Data jadwal janji temu tidak ditemukan.', 'error');
      return false;
    }

    const targetApt = appointments[aptIndex];
    const updatedApt: Appointment = {
      ...targetApt,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'CONFIRMED'
    };

    const nextAppointments = [...appointments];
    nextAppointments[aptIndex] = updatedApt;
    setAppointments(nextAppointments);

    showToast(
      'Reschedule Berhasil!',
      `Sesi konsultasi Anda berhasil dipindahkan ke tanggal ${newDate} pukul ${newStartTime} - ${newEndTime} WIB.`,
      'success'
    );
    return true;
  };

  const resetAllToDefault = () => {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'psychologists');
    localStorage.removeItem(STORAGE_PREFIX + 'packages');
    localStorage.removeItem(STORAGE_PREFIX + 'tests');
    localStorage.removeItem(STORAGE_PREFIX + 'schedules');
    localStorage.removeItem(STORAGE_PREFIX + 'appointments');
    localStorage.removeItem(STORAGE_PREFIX + 'testResults');
    localStorage.removeItem(STORAGE_PREFIX + 'intakeForms');
    localStorage.removeItem(STORAGE_PREFIX + 'clinicalNotes');
    localStorage.removeItem(STORAGE_PREFIX + 'reviews');
    localStorage.removeItem(STORAGE_PREFIX + 'landingCms');
    localStorage.removeItem(STORAGE_PREFIX + 'patientCms');
    localStorage.removeItem(STORAGE_PREFIX + 'psychologistCms');

    setUsers(INITIAL_USERS);
    setPsychologists(INITIAL_PSYCHOLOGISTS);
    setPackages(INITIAL_PACKAGES);
    setTests(INITIAL_TESTS);
    setSchedules(INITIAL_SCHEDULES);
    setAppointments(INITIAL_APPOINTMENTS);
    setTestResults(INITIAL_TEST_RESULTS);
    setIntakeForms(INITIAL_INTAKE_FORMS);
    setClinicalNotes(INITIAL_CLINICAL_NOTES);
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
        tests,
        schedules,
        appointments,
        testResults,
        intakeForms,
        clinicalNotes,
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
        viewMode,
        setViewMode,
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
        registerUser,
        logout,
        switchRole,
        switchPatientUser,
        showToast,
        dismissToast,
        bookAppointment,
        submitIntakeForm,
        submitTestResult,
        saveClinicalNotes,
        submitReview,
        approveReview,
        rejectReview,
        toggleUserStatus,
        updatePsychologistProfile,
        toggleSlotAvailability,
        addScheduleSlot,
        deleteScheduleSlot,
        savePackage,
        deletePackage,
        saveTest,
        updateAppointmentStatus,
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
