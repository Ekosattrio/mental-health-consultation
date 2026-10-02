import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  BarChart3,
  Calendar,
  Edit3,
  FileText,
  History,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { PatientsTab } from './tabs/PatientsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { ProfileTab } from './tabs/ProfileTab';
import { AnalyticsTab } from '../admin/tabs/AnalyticsTab';
import { CmsTab } from '../admin/tabs/CmsTab';
import { ExportFinancePage } from '../admin/tabs/ExportFinancePage';

type PsychologistTabId = 'overview' | 'schedule' | 'patients' | 'finance' | 'cms' | 'history' | 'profile';

export const PsychologistDashboard: React.FC = () => {
  const {
    currentUser,
    currentPsychologistModel,
    currentPsychologistProfile,
    users,
    psychologists,
    packages,
    appointments,
    reviews,
    analytics,
    schedules,
    testResults,
    intakeForms,
    clinicalNotes,
    landingCms,
    patientCms,
    psychologistCms,
    activePsychologistTab,
    setActivePsychologistTab,
    updateLandingCms,
    updatePatientCms,
    updatePsychologistCms,
    updatePsychologistProfile,
    toggleSlotAvailability,
    addScheduleSlot,
    deleteScheduleSlot,
    saveClinicalNotes
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('user-pat-1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExportFinanceActive, setIsExportFinanceActive] = useState(false);

  const psychologistId = currentUser?.id || 'user-psy-1';
  const profile = currentPsychologistProfile;
  const myAppointments = currentPsychologistModel
    ? currentPsychologistModel.getAssignedAppointments(appointments)
    : appointments.filter(a => a.psychologistId === psychologistId);
  const mySchedules = currentPsychologistModel
    ? currentPsychologistModel.getScheduleSlots(schedules)
    : schedules.filter(s => s.psychologistId === psychologistId);

  const handleNavigateTab = (tabId: PsychologistTabId) => {
    setActivePsychologistTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const tabs: Array<{ id: PsychologistTabId; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'overview', label: 'Ringkasan Praktik', icon: Activity },
    { id: 'finance', label: 'Keuangan & Uang Masuk', icon: BarChart3 },
    { id: 'schedule', label: 'Jadwal & Hari Praktik', icon: Calendar },
    { id: 'patients', label: 'Data Pasien & Pre-Test', icon: FileText },
    { id: 'cms', label: 'CMS Konten', icon: LayoutTemplate },
    { id: 'history', label: 'Riwayat Sesi', icon: History, badge: myAppointments.length }
  ];

  if (isExportFinanceActive) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 print:p-0 print:m-0 print:max-w-none">
          <ExportFinancePage
            appointments={appointments}
            onBack={() => setIsExportFinanceActive(false)}
          />
        </div>
      </div>
    );
  }

  const currentTabObj = tabs.find(t => t.id === activePsychologistTab) || tabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

      {/* MOBILE COLLAPSIBLE DRAWER NAV BAR */}
      <div className="lg:hidden mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2">
              <currentTabObj.icon className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800">{currentTabObj.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span>{isMobileMenuOpen ? 'Tutup' : 'Pilih Menu'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2 animate-fadeIn">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activePsychologistTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateTab(tab.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {!!tab.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 shrink-0">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* DESKTOP SIDEBAR */}
        <aside className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-64'} shrink-0 transition-all duration-200`}>
          <nav className="p-2 bg-slate-100/90 rounded-3xl border border-slate-200/80 flex flex-col gap-1.5 sticky top-24 shadow-2xs">
            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="w-full flex items-center justify-center p-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Perluas Menu' : 'Kecilkan Menu'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              {!isSidebarCollapsed && <span className="ml-2 text-xs font-bold">Kecilkan Menu</span>}
            </button>

            <div className="h-px bg-slate-200 my-0.5" />

            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activePsychologistTab === tab.id;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => handleNavigateTab(tab.id)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-3'
                    } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-sky-950 shadow-xs border border-slate-200/90'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && <span>{tab.label}</span>}
                    </div>

                    {!isSidebarCollapsed && !!tab.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on Collapsed Mode */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                      {tab.label} {!!tab.badge && `(${tab.badge})`}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN TAB CONTENT */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {activePsychologistTab === 'overview' && (
            <OverviewTab
              myAppointments={myAppointments}
              mySchedules={mySchedules}
              profile={profile}
              activeAppointment={myAppointments[0]}
              psychologistCms={psychologistCms}
              onOpenEmr={patientId => {
                setSelectedPatientId(patientId);
                handleNavigateTab('patients');
              }}
            />
          )}

          {activePsychologistTab === 'finance' && (
            <AnalyticsTab
              analytics={analytics}
              psychologists={psychologists}
              users={users}
              appointments={appointments}
              reviews={reviews}
              onOpenExportPage={() => setIsExportFinanceActive(true)}
            />
          )}

          {activePsychologistTab === 'schedule' && (
            <ScheduleTab
              mySchedules={mySchedules}
              psychologistId={psychologistId}
              appointments={appointments}
              packages={packages}
              addScheduleSlot={addScheduleSlot}
              toggleSlotAvailability={toggleSlotAvailability}
              deleteScheduleSlot={deleteScheduleSlot}
            />
          )}

          {activePsychologistTab === 'cms' && (
            <CmsTab
              cmsConfig={landingCms}
              patientCms={patientCms}
              psychologistCms={psychologistCms}
              psychologists={psychologists}
              users={users}
              updateLandingCms={updateLandingCms}
              updatePatientCms={updatePatientCms}
              updatePsychologistCms={updatePsychologistCms}
              updatePsychologistProfile={updatePsychologistProfile}
            />
          )}

          {activePsychologistTab === 'patients' && (
            <PatientsTab
              users={users}
              appointments={appointments}
              intakeForms={intakeForms}
              clinicalNotes={clinicalNotes}
              testResults={testResults}
              psychologistId={psychologistId}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
              saveClinicalNotes={saveClinicalNotes}
            />
          )}

          {activePsychologistTab === 'history' && (
            <HistoryTab
              myAppointments={myAppointments}
            />
          )}

          {activePsychologistTab === 'profile' && profile && (
            <ProfileTab
              profile={profile}
              currentUser={currentUser}
              psychologistId={psychologistId}
              updatePsychologistProfile={updatePsychologistProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
};
