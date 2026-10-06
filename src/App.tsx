import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PsychologistDashboard } from './components/psychologist/PsychologistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { PatientProfileCompletionPage } from './components/patient/PatientProfileCompletionPage';

const AppContent: React.FC = () => {
  const { currentRole, currentUser, startBookingFlow } = useApp();

  const isPendingProfileCompletion = currentRole === 'PATIENT' && currentUser && !currentUser.isProfileComplete;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 w-full max-w-full">
      <Navbar />

      <main className="flex-1 w-full max-w-full">
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
      </main>

      {currentRole === 'GUEST' && <Footer />}
      <ToastContainer />
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

