import React, { useState } from 'react';
import { useApp } from '../../context/AppContextCore';
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
  ChevronDown,
  Layers,
  ClipboardList
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { PackagesTab } from './tabs/PackagesTab';
import { PatientsTab } from './tabs/PatientsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { TreatmentPlansTab } from './tabs/TreatmentPlansTab';
import { ProfileTab } from './tabs/ProfileTab';
import { AnalyticsTab } from '../admin/tabs/AnalyticsTab';
import { CmsTab } from '../admin/tabs/CmsTab';
import { ExportFinancePage } from '../admin/tabs/ExportFinancePage';
import {DashboardPanel} from '../common/DataFeedback';

type PsychologistTabId = 'overview' | 'schedule' | 'packages' | 'treatmentPlans' | 'patients' | 'finance' | 'cms' | 'history' | 'profile';

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
    intakeForms,
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
    savePackage,
    deletePackage,
    togglePackageStatus,
    updateAppointmentStatus,
    scheduleNextContinuousSession,
    discontinueTreatmentPlan,
    rescheduleAppointment,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    server
  } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  React.useEffect(()=>{if(server&&selectedPatientId)void server.loadClinicalPatient(selectedPatientId);},[selectedPatientId]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExportFinanceActive, setIsExportFinanceActive] = useState(false);

  const psychologistId = currentUser?.role === 'PSYCHOLOGIST' ? currentUser.id : '';
  const profile = currentPsychologistProfile;
  const myAppointments = currentPsychologistModel
    ? currentPsychologistModel.getAssignedAppointments(appointments)
    : appointments.filter(a => a.psychologistId === psychologistId);
  const mySchedules = currentPsychologistModel
    ? currentPsychologistModel.getScheduleSlots(schedules)
    : schedules.filter(s => s.psychologistId === psychologistId);

  const clinicalIntakeForms = React.useMemo(() => {
    const forms = Object.fromEntries(Object.entries(intakeForms).filter(([, form]) =>
      !form.formVersion || Boolean(form.appointmentId)
    ));
    appointments.filter(item => item.psychologistId === psychologistId && item.preTestSnapshot)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach(item => { forms[item.patientId] = item.preTestSnapshot!; });
    return forms;
  }, [appointments, intakeForms, psychologistId]);

  const handleNavigateTab = (tabId: PsychologistTabId) => {
    setActivePsychologistTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const tabs: Array<{ id: PsychologistTabId; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'overview', label: 'Ringkasan Praktik', icon: Activity },
    { id: 'finance', label: 'Keuangan & Uang Masuk', icon: BarChart3 },
    { id: 'schedule', label: 'Jadwal & Hari Praktik', icon: Calendar },
    { id: 'packages', label: 'Manajemen Paket', icon: Layers, badge: packages.length },
    { id: 'treatmentPlans', label: 'Paket Berjalan', icon: ClipboardList, badge: myAppointments.filter(a => (a.continuousSessionTotal || 1) > 1).length },
    { id: 'patients', label: 'Data Pasien & Pre-Test', icon: FileText },
    { id: 'cms', label: 'CMS Konten', icon: LayoutTemplate },
    { id: 'history', label: 'Riwayat Sesi', icon: History, badge: myAppointments.length },
    { id: 'profile', label: 'Profil Praktik', icon: Edit3 }
  ];

  if (isExportFinanceActive) {
    return (
      <div className="fixed inset-0 z-[999999] bg-slate-100 overflow-y-auto print:static print:p-0 print:m-0 print:bg-white print:overflow-visible">
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full max-w-full">

      {/* DESKTOP SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-full min-w-0">
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
        <main className="flex-1 min-w-0 w-full max-w-full space-y-6">
          <DashboardPanel section={activePsychologistTab}>
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

          {activePsychologistTab === 'packages' && (
            <PackagesTab
              packages={packages}
              savePackage={savePackage}
              deletePackage={deletePackage}
              togglePackageStatus={togglePackageStatus}
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
              intakeForms={clinicalIntakeForms}
              psychologistId={psychologistId}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {activePsychologistTab === 'treatmentPlans' && (
            <TreatmentPlansTab
              appointments={myAppointments}
              onScheduleNextSession={scheduleNextContinuousSession}
              onDiscontinuePlan={discontinueTreatmentPlan}
              onReschedule={rescheduleAppointment}
            />
          )}

          {activePsychologistTab === 'history' && (
            <HistoryTab
              myAppointments={myAppointments}
              onCompleteAppointment={(appointmentId) => updateAppointmentStatus(appointmentId, 'COMPLETED')}
              onMarkNoShow={(appointmentId, reason) => updateAppointmentStatus(appointmentId, 'NO_SHOW', reason)}
              onCancelAppointment={(appointmentId, reason) => updateAppointmentStatus(appointmentId, 'CANCELLED', reason)}
              onScheduleNextSession={scheduleNextContinuousSession}
              onReschedule={rescheduleAppointment}
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
          </DashboardPanel>
        </main>
      </div>
    </div>
  );
};
