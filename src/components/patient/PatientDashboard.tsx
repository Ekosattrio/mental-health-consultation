import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  FileCheck,
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
  ArrowRight,
  MessageSquare
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { FaqTab } from './tabs/FaqTab';
import { BookingTab } from './tabs/BookingTab';
import { TestsTab } from './tabs/TestsTab';
import { HistoryTab } from './tabs/HistoryTab';

type PatientTabId = 'overview' | 'faq' | 'booking' | 'tests' | 'history';

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
    tests,
    reviews,
    patientCms,
    activePatientTab,
    setActivePatientTab,
    selectedBookingPackageId,
    selectedBookingPsychologistId,
    bookAppointment,
    submitIntakeForm,
    submitTestResult,
    submitReview
  } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const patientId = currentUser?.id || 'user-pat-1';
  const existingIntake = currentPatientModel
    ? currentPatientModel.getIntakeForm(intakeForms)
    : intakeForms[patientId];
  const patientAppointments = currentPatientModel
    ? currentPatientModel.getAppointments(appointments)
    : appointments.filter(a => a.patientId === patientId);
  const latestAppointment = patientAppointments[0];

  React.useEffect(() => {
    if ((activePatientTab as string) === 'intake') {
      setActivePatientTab('booking');
    }
  }, [activePatientTab, setActivePatientTab]);

  const handleNavigateTab = (tabId: PatientTabId) => {
    setActivePatientTab(tabId as any);
    setIsMobileMenuOpen(false);
  };

  const patientTabs: Array<{ id: PatientTabId; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Panduan Konseling', icon: HelpCircle },
    { id: 'booking', label: 'Booking Konsultasi', icon: Calendar },
    { id: 'history', label: 'Jadwal & Riwayat', icon: History },
    { id: 'tests', label: 'Assessment Tambahan', icon: FileCheck },
    { id: 'faq', label: 'FAQ & Bantuan', icon: MessageSquare }
  ];

  const currentTabObj = patientTabs.find(t => t.id === activePatientTab) || patientTabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

      {/* MOBILE COLLAPSIBLE DRAWER NAV BAR (Screen < lg) */}
      <div className="lg:hidden mb-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2">
              <currentTabObj.icon className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">{currentTabObj.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Tutup Menu</span>
                </>
              ) : (
                <>
                  <Menu className="w-3.5 h-3.5" />
                  <span>Pilih Menu ▾</span>
                </>
              )}
            </button>
          </div>

          {/* Drawer Menu List */}
          {isMobileMenuOpen && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
              {patientTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activePatientTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
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
        <main className="flex-1 min-w-0 w-full">
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
              onNavigateTab={(tab) => handleNavigateTab(tab)}
            />
          )}

          {activePatientTab === 'tests' && (
            <TestsTab
              tests={tests}
              patientId={patientId}
              currentUser={currentUser}
              submitTestResult={submitTestResult}
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
