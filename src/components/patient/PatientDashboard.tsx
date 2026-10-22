import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  History,
  HelpCircle,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { FaqTab } from './tabs/FaqTab';
import { BookingTab } from './tabs/BookingTab';
import { HistoryTab } from './tabs/HistoryTab';

type PatientTabId = 'overview' | 'faq' | 'booking' | 'history';

export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    currentPatientModel,
    packages,
    psychologists,
    users,
    schedules,
    appointments,
    intakeForms,
    reviews,
    patientCms,
    activePatientTab,
    setActivePatientTab,
    selectedBookingPackageId,
    selectedBookingPsychologistId,
    bookAppointment,
    submitIntakeForm,
    submitReview,
    updateUserProfile,
    paymentReconciliations,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const patientId = currentUser?.role === 'PATIENT' ? currentUser.id : '';
  const existingIntake = currentPatientModel
    ? currentPatientModel.getIntakeForm(intakeForms)
    : intakeForms[patientId];
  const patientAppointments = currentPatientModel
    ? currentPatientModel.getAppointments(appointments)
    : appointments.filter(a => a.patientId === patientId);
  const latestAppointment = patientAppointments[0];

  const handleNavigateTab = (tabId: PatientTabId) => {
    setActivePatientTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const patientTabs: Array<{ id: PatientTabId; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Panduan Konseling', icon: HelpCircle },
    { id: 'booking', label: 'Booking Konsultasi', icon: Calendar },
    { id: 'history', label: 'Jadwal & Riwayat', icon: History },
    { id: 'faq', label: 'FAQ & Bantuan', icon: MessageSquare }
  ];

  const currentTabObj = patientTabs.find(t => t.id === activePatientTab) || patientTabs[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full max-w-full">

      {/* DESKTOP SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full max-w-full min-w-0">
        {/* DESKTOP SIDEBAR */}
        <aside className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-60'} shrink-0 transition-all duration-200`}>
          <nav className="p-2 bg-slate-100/90 rounded-3xl border border-slate-200/80 flex flex-col gap-1 sticky top-24 shadow-2xs">
            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="w-full flex items-center justify-center p-2 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Perluas Menu' : 'Kecilkan Menu'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              {!isSidebarCollapsed && <span className="ml-2 text-xs font-bold">Kecilkan Menu</span>}
            </button>

            <div className="h-px bg-slate-200 my-0.5" />

            {patientTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activePatientTab === tab.id;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => handleNavigateTab(tab.id)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-3.5 py-2.5'
                    } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200/90'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {!isSidebarCollapsed && <span className="ml-2.5">{tab.label}</span>}
                  </button>

                  {/* Tooltip on Collapsed Mode */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                      {tab.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN TAB CONTENT */}
        <main className="flex-1 min-w-0 w-full max-w-full">
          {paymentReconciliations.filter(item => item.patientId === patientId && item.status === 'OPEN').map(item => (
            <div key={item.id} role="status" className="mb-4 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-xs text-amber-950 break-words">
              <strong>Pembayaran sedang dicocokkan: {item.id}</strong>
              <p className="mt-1">Bukti pembayaran tersimpan. Jangan transfer ulang. Hubungi admin untuk pencocokan dan jadwal pengganti.</p>
            </div>
          ))}
          {activePatientTab === 'overview' && (
            <OverviewTab
              patientCms={patientCms}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activePatientTab === 'booking' && (
            <BookingTab
              packages={packages}
              psychologists={psychologists}
              users={users}
              schedules={schedules}
              appointments={appointments}
              patientId={patientId}
              currentUser={currentUser}
              selectedBookingPackageId={selectedBookingPackageId}
              selectedBookingPsychologistId={selectedBookingPsychologistId}
              existingIntake={existingIntake}
              bookAppointment={bookAppointment}
              submitIntakeForm={submitIntakeForm}
              updateUserProfile={updateUserProfile}
              onNavigateTab={(tab) => handleNavigateTab(tab)}
            />
          )}

          {activePatientTab === 'history' && (
            <HistoryTab
              patientAppointments={patientAppointments}
              appointments={appointments}
              reviews={reviews}
              submitReview={submitReview}
              onNavigateTab={(tab) => handleNavigateTab(tab)}
            />
          )}

          {activePatientTab === 'faq' && (
            <FaqTab
              patientCms={patientCms}
              onNavigateTab={(tab) => handleNavigateTab(tab)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
