import React, { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

const LandingPage = lazy(() => import('./components/landing/LandingPage').then(module => ({ default: module.LandingPage })));
const PatientDashboard = lazy(() => import('./components/patient/PatientDashboard').then(module => ({ default: module.PatientDashboard })));
const PsychologistDashboard = lazy(() => import('./components/psychologist/PsychologistDashboard').then(module => ({ default: module.PsychologistDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const PatientProfileCompletionPage = lazy(() => import('./components/patient/PatientProfileCompletionPage').then(module => ({ default: module.PatientProfileCompletionPage })));

const AppContent: React.FC = () => {
  const { currentRole, currentUser, startBookingFlow } = useApp();

  const isPendingProfileCompletion = currentRole === 'PATIENT' && currentUser && !currentUser.isProfileComplete;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 w-full max-w-full">
      <Navbar />
      <ToastContainer />

      <main className="flex-1 w-full max-w-full">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center" aria-label="Memuat halaman"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin" /></div>}>
          {isPendingProfileCompletion ? (
            <PatientProfileCompletionPage />
          ) : (
            <>
              {currentRole === 'GUEST' && (
                <LandingPage
                  onSelectBooking={(psychologistId, packageId) => startBookingFlow(psychologistId, packageId)}
                />
              )}
              {currentRole === 'PATIENT' && <PatientDashboard />}
              {currentRole === 'PSYCHOLOGIST' && <PsychologistDashboard />}
              {currentRole === 'ADMIN' && <AdminDashboard />}
            </>
          )}
        </Suspense>
      </main>

      {currentRole === 'GUEST' && <Footer />}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
    <AppProvider>
      <AppContent />
    </AppProvider>
    </AppErrorBoundary>
  );
}

