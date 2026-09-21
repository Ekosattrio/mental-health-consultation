import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PsychologistDashboard } from './components/psychologist/PsychologistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectureBlueprint } from './components/architecture/ArchitectureBlueprint';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';

const AppContent: React.FC = () => {
  const { currentRole, viewMode, startBookingFlow, startTestFlow } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="flex-1">
        {viewMode === 'BLUEPRINT' ? (
          <ArchitectureBlueprint />
        ) : (
          <>
            {currentRole === 'GUEST' && (
              <LandingPage
                onSelectBooking={(psychologistId, packageId) => startBookingFlow(psychologistId, packageId)}
                onTakeTest={() => startTestFlow()}
              />
            )}
            {currentRole === 'PATIENT' && <PatientDashboard />}
            {currentRole === 'PSYCHOLOGIST' && <PsychologistDashboard />}
            {currentRole === 'ADMIN' && <AdminDashboard />}
          </>
        )}
      </main>

      <Footer />
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

