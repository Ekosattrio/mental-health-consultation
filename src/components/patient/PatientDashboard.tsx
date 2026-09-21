import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  FileCheck,
  MessageSquare,
  History,
  Activity,
  User
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { BookingTab } from './tabs/BookingTab';
import { TestsTab } from './tabs/TestsTab';
import { IntakeTab } from './tabs/IntakeTab';
import { ChatTab } from './tabs/ChatTab';
import { HistoryTab } from './tabs/HistoryTab';

export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    currentPatientModel,
    packages,
    psychologists,
    users,
    schedules,
    appointments,
    testResults,
    intakeForms,
    tests,
    chatMessages,
    reviews,
    patientCms,
    activePatientTab,
    setActivePatientTab,
    selectedBookingPackageId,
    selectedBookingPsychologistId,
    bookAppointment,
    submitIntakeForm,
    submitTestResult,
    sendChatMessage,
    submitReview
  } = useApp();

  const patientId = currentUser?.id || 'user-pat-1';
  const existingIntake = currentPatientModel
    ? currentPatientModel.getIntakeForm(intakeForms)
    : intakeForms[patientId];
  const patientAppointments = currentPatientModel
    ? currentPatientModel.getAppointments(appointments)
    : appointments.filter(a => a.patientId === patientId);
  const patientTestResults = currentPatientModel
    ? currentPatientModel.getTestResults(testResults)
    : testResults.filter(r => r.patientId === patientId);

  // Active appointment for live chat (either confirmed or in_progress, or the most recent)
  const activeChatApt =
    currentPatientModel?.getActiveAppointment(appointments) ||
    patientAppointments.find(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS') ||
    patientAppointments[0];

  const handleNavigateTab = (tabId: any) => {
    setActivePatientTab(tabId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Patient Header Card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-700/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Portal Pasien (Klien)
                </span>
                <span className="text-xs text-emerald-300 font-mono">ID: #{patientId}</span>
              </div>
              <h2 className="text-2xl font-black mt-1 tracking-tight">{currentUser?.name}</h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {currentUser?.email} • Keluhan Utama: {existingIntake?.primaryConcerns?.[0] || 'Anxiety & Workplace Burnout'}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActivePatientTab('booking')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Booking Konsultasi
            </button>
            <button
              onClick={() => setActivePatientTab('tests')}
              className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs border border-emerald-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              Tes Mandiri DASS-21
            </button>
            {activeChatApt && (
              <button
                onClick={() => setActivePatientTab('chat')}
                className="px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                Ruang Chat Sesi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Side Tab Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Vertical Side Tabs */}
        <aside className="w-full lg:w-60 shrink-0">
          <nav className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible custom-scrollbar sticky top-20">
            {[
              { id: 'overview', label: 'Ringkasan Pasien', icon: Activity },
              { id: 'booking', label: 'Booking Konsultasi', icon: Calendar },
              { id: 'tests', label: 'Asesmen DASS-21', icon: FileCheck },
              { id: 'intake', label: 'Formulir Intake', icon: User },
              { id: 'chat', label: 'Ruang Chat', icon: MessageSquare },
              { id: 'history', label: 'Riwayat & Ulasan', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activePatientTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePatientTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'history' && patientAppointments.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {patientAppointments.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area: Modular Dynamic Tab Renderer */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {activePatientTab === 'overview' && (
            <OverviewTab
              patientCms={patientCms}
              existingIntake={existingIntake}
              patientTestResults={patientTestResults}
              activeChatApt={activeChatApt}
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
              bookAppointment={bookAppointment}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activePatientTab === 'tests' && (
            <TestsTab
              tests={tests}
              patientId={patientId}
              currentUser={currentUser}
              submitTestResult={submitTestResult}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activePatientTab === 'intake' && (
            <IntakeTab
              patientId={patientId}
              currentUser={currentUser}
              existingIntake={existingIntake}
              submitIntakeForm={submitIntakeForm}
            />
          )}

          {activePatientTab === 'chat' && (
            <ChatTab
              activeChatApt={activeChatApt}
              chatMessages={chatMessages}
              sendChatMessage={sendChatMessage}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activePatientTab === 'history' && (
            <HistoryTab
              patientAppointments={patientAppointments}
              appointments={appointments}
              reviews={reviews}
              submitReview={submitReview}
              onNavigateTab={handleNavigateTab}
            />
          )}
        </main>
      </div>
    </div>
  );
};
