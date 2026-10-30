import React, { lazy, Suspense } from 'react';
import {useApp} from '../context/AppContextCore';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { ToastContainer } from './common/ToastContainer';
import { LoginModal } from './auth/LoginModal';
import {DashboardSkeleton,WorkspaceActivityNotice} from './common/DataFeedback';

const LandingPage = lazy(() => import('./landing/LandingPage').then(module => ({ default: module.LandingPage })));
const PatientDashboard = lazy(() => import('./patient/PatientDashboard').then(module => ({ default: module.PatientDashboard })));
const PsychologistDashboard = lazy(() => import('./psychologist/PsychologistDashboard').then(module => ({ default: module.PsychologistDashboard })));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const PatientProfileCompletionPage = lazy(() => import('./patient/PatientProfileCompletionPage').then(module => ({ default: module.PatientProfileCompletionPage })));

export const AppContent: React.FC = () => {
  const { currentRole, currentUser, startBookingFlow } = useApp();

  const isPendingProfileCompletion = currentRole === 'PATIENT' && currentUser && !currentUser.isProfileComplete;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 w-full max-w-full">
      <Navbar />
      <ToastContainer />
      <WorkspaceActivityNotice />

      <main className="flex-1 w-full max-w-full">
        <Suspense fallback={<DashboardSkeleton/>}>
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
