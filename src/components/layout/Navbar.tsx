import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  User as UserIcon,
  Calendar,
  History,
  FileText,
  BarChart3,
  Phone,
  Mail,
  X,
  Edit3,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

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
    logout,
    setActivePatientTab,
    setActivePsychologistTab,
    setActiveAdminTab,
    showToast
  } = useApp();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Form state for profile modal
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContact: 'Bpk. Rahmat (0812-9988-7766)',
    notes: 'Riwayat keluhan cemas ringan & jadwal fleksibel.'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        phone: currentUser.phone || '0812-3456-7890',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

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
      label: 'Psikolog / Pengelola Praktik Mandiri',
      icon: <Stethoscope className="w-4 h-4 text-sky-600" />,
      color: 'bg-sky-50 text-sky-900 border-sky-200'
    },
    {
      role: 'ADMIN' as UserRole,
      id: 'user-adm-1',
      name: 'Admin Operasional JiwaSehat',
      label: 'Admin Booking, Verifikasi, Moderasi',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-900 border-purple-200'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden">
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
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all text-left cursor-pointer group"
                >
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${
                      currentRole === 'PATIENT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : currentRole === 'PSYCHOLOGIST'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {currentRole === 'PATIENT' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : currentRole === 'PSYCHOLOGIST' ? (
                        <Stethoscope className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      currentRole === 'PATIENT' ? 'bg-emerald-500' : currentRole === 'PSYCHOLOGIST' ? 'bg-sky-500' : 'bg-purple-500'
                    }`} />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-black text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">
                      {currentUser?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <span>{currentRole === 'PATIENT' ? 'Pasien' : currentRole === 'PSYCHOLOGIST' ? 'Psikolog' : 'Admin'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[9px] text-slate-400">ID: #{currentUser?.id}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180 text-teal-600' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-84 sm:w-88 rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-3.5 z-50 animate-in fade-in-50 duration-150">
                    {/* 1. Header Profil Pengguna */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${
                        currentRole === 'PATIENT'
                          ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                          : currentRole === 'PSYCHOLOGIST'
                          ? 'bg-sky-100/70 text-sky-800 border-sky-200'
                          : 'bg-purple-100/70 text-purple-800 border-purple-200'
                      }`}>
                        {currentRole === 'PATIENT' ? (
                          <UserIcon className="w-5 h-5" />
                        ) : currentRole === 'PSYCHOLOGIST' ? (
                          <Stethoscope className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            currentRole === 'PATIENT'
                              ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200'
                              : currentRole === 'PSYCHOLOGIST'
                              ? 'bg-sky-100/70 text-sky-900 border-sky-200'
                              : 'bg-purple-100/70 text-purple-900 border-purple-200'
                          }`}>
                            {currentRole === 'PATIENT' ? 'Pasien Terdaftar' : currentRole === 'PSYCHOLOGIST' ? 'Psikolog & Pengelola' : 'Admin Operasional'}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mt-1 truncate">{currentUser?.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                    </div>

                    {/* 2. Info Status Ringkas */}
                    <div className="my-2.5 px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-100/80 text-[11px] text-slate-600 flex items-center justify-between">
                      {currentRole === 'PATIENT' ? (
                        <>
                          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pre-Test Terisi</span>
                          </span>
                          <span className="text-slate-400 font-medium">WhatsApp: {currentUser?.phone || '0812-3456-7890'}</span>
                        </>
                      ) : currentRole === 'PSYCHOLOGIST' ? (
                        <>
                          <span className="flex items-center gap-1.5 text-sky-700 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>SIP.503/042-DPMPTSP/2022</span>
                          </span>
                          <span className="text-slate-400 font-medium">Klinik Aktif</span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Akses Monitoring Penuh</span>
                          </span>
                          <span className="text-slate-400 font-medium">Super Admin</span>
                        </>
                      )}
                    </div>

                    {/* 3. Tombol Utama: Buka Detail Profil Lengkap */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full mb-2 p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/70 text-teal-900 border border-teal-200/80 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-teal-700" />
                        <span>Buka Detail Profil & Akun</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                    </button>



                    {/* 5. Logout Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-bold cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          <span>Keluar dari Akun (Logout)</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {/* MODAL DETAIL PROFIL PENGGUNA LENGKAP VIA CREATEPORTAL */}
      {isProfileModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50 duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 my-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${
                  currentRole === 'PATIENT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentRole === 'PSYCHOLOGIST'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {currentRole === 'PATIENT' ? (
                    <UserIcon className="w-6 h-6" />
                  ) : currentRole === 'PSYCHOLOGIST' ? (
                    <Stethoscope className="w-6 h-6" />
                  ) : (
                    <Shield className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">{currentUser?.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      ID: #{currentUser?.id}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-semibold text-teal-700">
                      {currentRole === 'PATIENT' ? 'Pasien Terdaftar' : currentRole === 'PSYCHOLOGIST' ? 'Psikolog Klinis' : 'Admin Operasional'}
                    </span>
                  </div>
                </div>
              </div>
              <Tooltip content="Tutup Jendela (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  aria-label="Tutup"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            {/* Modal Body Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Profil Disimpan', 'Data profil Anda telah berhasil diperbarui.', 'success');
                setIsProfileModalOpen(false);
              }}
              className="py-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) => setProfileFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    value={profileFormData.email}
                    onChange={(e) => setProfileFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={profileFormData.phone}
                    onChange={(e) => setProfileFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              {currentRole === 'PATIENT' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kontak Darurat (Keluarga / Kerabat)
                    </label>
                    <input
                      type="text"
                      value={profileFormData.emergencyContact}
                      onChange={(e) => setProfileFormData(p => ({ ...p, emergencyContact: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Singkat / Riwayat
                    </label>
                    <textarea
                      rows={2}
                      value={profileFormData.notes}
                      onChange={(e) => setProfileFormData(p => ({ ...p, notes: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600 bg-slate-50/50 resize-none"
                    />
                  </div>
                </>
              )}

              {currentRole === 'PSYCHOLOGIST' && (
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-sky-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Izin Praktik & Legalitas Klinis</span>
                  </div>
                  <p className="text-[11px] text-sky-800">
                    STR: STR-PSI-2021-09842 • SIP: SIP.503/042-DPMPTSP/2022
                  </p>
                  <p className="text-[10px] text-sky-700">
                    Praktik Mandiri Psikolog Klinis Dewasa & Interpersonal.
                  </p>
                </div>
              )}

              {currentRole === 'ADMIN' && (
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Otoritas Administrator Operasional</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Memiliki wewenang verifikasi transfer DP 50%, monitoring status user, dan moderasi kelayakan ulasan pasien.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
