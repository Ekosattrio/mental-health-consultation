import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Star,
  Users,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

import { UsersTab } from './tabs/UsersTab';
import { ReservationsTab } from './tabs/ReservationsTab';
import { ReviewsTab } from './tabs/ReviewsTab';

type AdminTabId = 'users' | 'reservations' | 'reviews';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    psychologists,
    appointments,
    reviews,
    analytics,
    activeAdminTab,
    setActiveAdminTab,
    toggleUserStatus,
    approveReview,
    rejectReview,
    updateAppointmentStatus,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingBookings = appointments.filter(apt => apt.status === 'PENDING').length;
  const pendingReviews = analytics.pendingReviews;

  const adminTabs: Array<{ id: AdminTabId; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'reservations', label: 'Booking & Verifikasi', icon: CalendarCheck, badge: pendingBookings },
    { id: 'users', label: 'Monitoring User', icon: Users },
    { id: 'reviews', label: 'Moderasi Review', icon: Star, badge: pendingReviews }
  ];

  const handleNavigateTab = (tabId: AdminTabId) => {
    setActiveAdminTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const currentTabObj = adminTabs.find(t => t.id === activeAdminTab) || adminTabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

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

            {adminTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;

              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => handleNavigateTab(tab.id)}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-3'
                    } rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-purple-950 shadow-xs border border-slate-200/90'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && <span>{tab.label}</span>}
                    </div>

                    {!isSidebarCollapsed && !!tab.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
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
          {activeAdminTab === 'reservations' && (
            <ReservationsTab
              appointments={appointments}
              updateAppointmentStatus={updateAppointmentStatus}
            />
          )}

          {activeAdminTab === 'users' && (
            <UsersTab
              users={users}
              psychologists={psychologists}
              toggleUserStatus={toggleUserStatus}
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
        </main>
      </div>
    </div>
  );
};
