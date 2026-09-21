import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  BarChart3,
  Users,
  CreditCard,
  Star,
  Layers,
  FileCheck,
  LayoutTemplate
} from 'lucide-react';

import { AnalyticsTab } from './tabs/AnalyticsTab';
import { UsersTab } from './tabs/UsersTab';
import { ReservationsTab } from './tabs/ReservationsTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { PackagesTab } from './tabs/PackagesTab';
import { TestsTab } from './tabs/TestsTab';
import { CmsTab } from './tabs/CmsTab';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    psychologists,
    packages,
    tests,
    appointments,
    reviews,
    analytics,
    landingCms,
    patientCms,
    psychologistCms,
    activeAdminTab,
    setActiveAdminTab,
    toggleUserStatus,
    approveReview,
    rejectReview,
    savePackage,
    deletePackage,
    updateAppointmentStatus,
    updateLandingCms,
    updatePatientCms,
    updatePsychologistCms,
    updatePsychologistProfile,
    saveTest
  } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Header Card */}
      <div className="bg-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden mb-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/30 border-2 border-purple-400/40">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-800 text-purple-200 border border-purple-700">
                  Super Admin Panel
                </span>
                <span className="text-xs text-purple-300 font-mono">ID: #admin-portal</span>
              </div>
              <h1 className="text-2xl font-black mt-1 tracking-tight">Pusat Kontrol JiwaSehat</h1>
              <p className="text-xs text-purple-200 mt-0.5">
                Kelola verifikasi STR psikolog, moderasi review pasien, monitoring reservasi, dan instrumen asesmen.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Info */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-xl bg-purple-900/80 border border-purple-700 text-xs text-purple-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>
                Review Menunggu: <strong className="text-white font-bold">{analytics.pendingReviews}</strong>
              </span>
            </div>
            <button
              onClick={() => setActiveAdminTab('packages')}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Kelola Paket
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Side Tab Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Vertical Side Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible custom-scrollbar sticky top-20">
            {[
              { id: 'analytics', label: 'Laporan & Analitik', icon: BarChart3 },
              { id: 'cms', label: 'CMS Konten (3 Halaman)', icon: LayoutTemplate },
              { id: 'users', label: 'User & Verifikasi', icon: Users },
              { id: 'reservations', label: 'Monitoring Reservasi', icon: CreditCard },
              { id: 'reviews', label: 'Moderasi Review', icon: Star },
              { id: 'packages', label: 'Manajemen Paket', icon: Layers },
              { id: 'tests', label: 'Instrumen Tes', icon: FileCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'reviews' && analytics.pendingReviews > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-amber-100 text-amber-800' : 'bg-amber-200/70 text-amber-900'
                      }`}
                    >
                      {analytics.pendingReviews}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area: Modular Dynamic Tab Renderer */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {activeAdminTab === 'analytics' && (
            <AnalyticsTab
              analytics={analytics}
              psychologists={psychologists}
              users={users}
              appointments={appointments}
              reviews={reviews}
              onNavigateTab={setActiveAdminTab}
            />
          )}

          {activeAdminTab === 'cms' && (
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

          {activeAdminTab === 'users' && (
            <UsersTab
              users={users}
              psychologists={psychologists}
              toggleUserStatus={toggleUserStatus}
            />
          )}

          {activeAdminTab === 'reservations' && (
            <ReservationsTab
              appointments={appointments}
              updateAppointmentStatus={updateAppointmentStatus}
            />
          )}

          {activeAdminTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              psychologists={psychologists}
              users={users}
              approveReview={approveReview}
              rejectReview={rejectReview}
            />
          )}

          {activeAdminTab === 'packages' && (
            <PackagesTab
              packages={packages}
              savePackage={savePackage}
              deletePackage={deletePackage}
            />
          )}

          {activeAdminTab === 'tests' && (
            <TestsTab
              tests={tests}
              saveTest={saveTest}
            />
          )}
        </main>
      </div>
    </div>
  );
};
