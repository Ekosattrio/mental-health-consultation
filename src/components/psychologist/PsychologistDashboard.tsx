import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  FileText,
  MessageSquare,
  History,
  Activity,
  Edit3
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { PatientsTab } from './tabs/PatientsTab';
import { ChatTab } from './tabs/ChatTab';
import { HistoryTab } from './tabs/HistoryTab';
import { ProfileTab } from './tabs/ProfileTab';

export const PsychologistDashboard: React.FC = () => {
  const {
    currentUser,
    currentPsychologistModel,
    currentPsychologistProfile,
    users,
    schedules,
    appointments,
    testResults,
    intakeForms,
    clinicalNotes,
    chatMessages,
    psychologistCms,
    activePsychologistTab,
    setActivePsychologistTab,
    updatePsychologistProfile,
    toggleSlotAvailability,
    addScheduleSlot,
    deleteScheduleSlot,
    saveClinicalNotes,
    sendChatMessage
  } = useApp();

  const psychologistId = currentUser?.id || 'user-psy-1';
  const profile = currentPsychologistProfile;

  // Filter psychologist appointments & schedules via OOP domain methods
  const myAppointments = currentPsychologistModel
    ? currentPsychologistModel.getAssignedAppointments(appointments)
    : appointments.filter(a => a.psychologistId === psychologistId);
  const mySchedules = currentPsychologistModel
    ? currentPsychologistModel.getScheduleSlots(schedules)
    : schedules.filter(s => s.psychologistId === psychologistId);
  const activeChatApt =
    currentPsychologistModel?.getActiveConsultations(appointments)[0] ||
    myAppointments.find(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS') ||
    myAppointments[0];

  // Shared patient selection for EMR & SOAP
  const [selectedPatientId, setSelectedPatientId] = useState<string>('user-pat-1');

  const handleOpenEmr = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePsychologistTab('patients');
  };

  const handleOpenChat = () => {
    setActivePsychologistTab('chat');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Psychologist Header Card */}
      <div className="bg-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-800 text-sky-200 border border-sky-700">
                  Portal Praktik Psikolog Klinis
                </span>
                <span className="text-xs text-sky-300 font-mono">ID: #{psychologistId}</span>
              </div>
              <h1 className="text-2xl font-black mt-1 tracking-tight">{currentUser?.name}</h1>
              <p className="text-xs text-sky-200 mt-0.5">
                {profile?.title} • SIP: {profile?.sipNumber} • STR: {profile?.strNumber}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActivePsychologistTab('schedule')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-sky-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Atur Slot Jadwal
            </button>
            <button
              onClick={() => setActivePsychologistTab('patients')}
              className="px-4 py-2.5 bg-sky-800/80 hover:bg-sky-800 text-white font-bold rounded-xl text-xs border border-sky-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              EMR & Catatan SOAP
            </button>
            {activeChatApt && (
              <button
                onClick={() => setActivePsychologistTab('chat')}
                className="px-4 py-2.5 bg-white text-sky-950 hover:bg-sky-50 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-sky-700" />
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
              { id: 'overview', label: 'Ringkasan Praktik', icon: Activity },
              { id: 'schedule', label: 'Jadwal & Slot', icon: Calendar },
              { id: 'patients', label: 'Rekam Medis & EMR', icon: FileText },
              { id: 'chat', label: 'Ruang Chat', icon: MessageSquare },
              { id: 'history', label: 'Riwayat Sesi', icon: History },
              { id: 'profile', label: 'Profil Praktik', icon: Edit3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activePsychologistTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePsychologistTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'history' && myAppointments.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {myAppointments.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area: Modular Dynamic Tab Renderer */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {activePsychologistTab === 'overview' && (
            <OverviewTab
              myAppointments={myAppointments}
              mySchedules={mySchedules}
              profile={profile}
              activeChatApt={activeChatApt}
              psychologistCms={psychologistCms}
              onOpenEmr={handleOpenEmr}
              onOpenChat={handleOpenChat}
            />
          )}

          {activePsychologistTab === 'schedule' && (
            <ScheduleTab
              mySchedules={mySchedules}
              psychologistId={psychologistId}
              addScheduleSlot={addScheduleSlot}
              toggleSlotAvailability={toggleSlotAvailability}
              deleteScheduleSlot={deleteScheduleSlot}
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

          {activePsychologistTab === 'chat' && (
            <ChatTab
              activeChatApt={activeChatApt}
              chatMessages={chatMessages}
              sendChatMessage={sendChatMessage}
              onOpenSoap={handleOpenEmr}
            />
          )}

          {activePsychologistTab === 'history' && (
            <HistoryTab myAppointments={myAppointments} />
          )}

          {activePsychologistTab === 'profile' && (
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
