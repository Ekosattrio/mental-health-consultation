import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  HeartHandshake,
  Shield,
  UserCheck,
  Stethoscope,
  BookOpen,
  RotateCcw,
  Sparkles,
  ChevronDown,
  MoreVertical,
  LogIn,
  LogOut,
  Laptop,
  Check,
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    users,
    loginAs,
    viewMode,
    setViewMode,
    resetAllToDefault,
    openAuthModal,
    logout
  } = useApp();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const demoAccounts = [
    {
      role: 'PATIENT' as UserRole,
      id: 'user-pat-1',
      name: 'Budi Santoso',
      label: 'Pasien (Anxiety & Stres)',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      role: 'PATIENT' as UserRole,
      id: 'user-pat-2',
      name: 'Siti Amanda',
      label: 'Pasien (Insomnia & Overthinking)',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      role: 'PSYCHOLOGIST' as UserRole,
      id: 'user-psy-1',
      name: 'dr. Sarah Jenkins, M.Psi.',
      label: 'Psikolog Klinis Dewasa',
      icon: <Stethoscope className="w-4 h-4 text-sky-600" />,
      color: 'bg-sky-50 text-sky-900 border-sky-200'
    },
    {
      role: 'PSYCHOLOGIST' as UserRole,
      id: 'user-psy-2',
      name: 'Dr. Adrian Pratama, M.Psi.',
      label: 'Psikolog Stres Kerja & Karier',
      icon: <Stethoscope className="w-4 h-4 text-sky-600" />,
      color: 'bg-sky-50 text-sky-900 border-sky-200'
    },
    {
      role: 'ADMIN' as UserRole,
      id: 'user-adm-1',
      name: 'Super Admin JiwaSehat',
      label: 'Administrator Sistem & Moderasi',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-900 border-purple-200'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Title */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setViewMode('PLATFORM')}
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">JiwaSehat</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                  Berlisensi Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Praktik Mandiri Psikolog Klinis • dr. Sarah Jenkins, M.Psi.
              </p>
            </div>
          </div>

          {/* Right Controls: Auth Buttons & 3-Dots Dropdown */}
          <div className="flex items-center gap-2">
            {/* If GUEST: Show unified 'Masuk / Daftar' Button */}
            {currentRole === 'GUEST' ? (
              <button
                onClick={() => openAuthModal('LOGIN')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Daftar</span>
              </button>
            ) : (
              /* If Logged In: Current User Pill & Dropdown */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-all text-left cursor-pointer"
                >
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser?.name}
                    </div>
                    <div className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">
                      {currentRole === 'PATIENT' ? 'Pasien' : currentRole === 'PSYCHOLOGIST' ? 'Psikolog' : 'Admin'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3-DOTS DROPDOWN: Demo Accounts Picker, View Mode Switcher, & Reset */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  moreMenuOpen || viewMode === 'BLUEPRINT'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Pilihan Akun Demo & Tampilan Sistem (⋮)"
                aria-label="Menu Titik Tiga"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in-50 duration-150 max-h-[85vh] overflow-y-auto">
                  {/* Section 1: Akun Demo Testing */}
                  <div className="px-2 pt-1 pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Pilih Akun Demo (Testing)
                      </p>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                        1-Klik Masuk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uji setiap alur dari sudut pandang peran yang berbeda:
                    </p>
                  </div>

                  <div className="space-y-1">
                    {demoAccounts.map(acc => {
                      const isActive = currentUser?.id === acc.id && currentRole === acc.role;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            loginAs(acc.role, acc.id);
                            setMoreMenuOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between border ${
                            isActive
                              ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-500'
                              : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-100 shrink-0">
                              {acc.icon}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{acc.name}</span>
                                {isActive && (
                                  <span className="text-[9px] bg-teal-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{acc.label}</div>
                            </div>
                          </div>

                          {isActive && <Check className="w-4 h-4 text-teal-600" />}
                        </button>
                      );
                    })}

                    {currentRole !== 'GUEST' && (
                      <button
                        onClick={() => {
                          logout();
                          setMoreMenuOpen(false);
                        }}
                        className="w-full mt-1 p-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Kembali ke Mode Publik / Tamu</span>
                      </button>
                    )}
                  </div>

                  {/* Section 2: Mode Tampilan (Interaktif vs Blueprint) */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                      Mode Tampilan Kerja
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setViewMode('PLATFORM');
                          setMoreMenuOpen(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          viewMode === 'PLATFORM'
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span>Interaktif</span>
                      </button>

                      <button
                        onClick={() => {
                          setViewMode('BLUEPRINT');
                          setMoreMenuOpen(false);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          viewMode === 'BLUEPRINT'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Blueprint</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 3: Reset Data Simulasi */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        resetAllToDefault();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>Kembalikan Data Simulasi ke Default</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
