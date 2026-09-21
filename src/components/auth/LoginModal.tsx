import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  HeartHandshake,
  UserCheck,
  Stethoscope,
  X,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    authModalTab,
    setAuthModalTab,
    loginAs,
    registerUser,
    users,
    showToast
  } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('budi.santoso@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('PATIENT');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTermsAgreed, setRegTermsAgreed] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear error on tab or modal change
  useEffect(() => {
    setErrorMessage(null);
  }, [authModalTab, isLoginModalOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isLoginModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLoginModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, setIsLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const matched = users.find(u => u.email.toLowerCase() === emailTrimmed);

    if (matched) {
      loginAs(matched.role, matched.id);
    } else {
      setErrorMessage('Akun dengan email ini belum terdaftar. Silakan gunakan tab "Daftar" atau pilih akun demo di menu titik 3 (⋮).');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setErrorMessage('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!regTermsAgreed) {
      setErrorMessage('Anda harus menyetujui syarat & ketentuan layanan medis.');
      return;
    }

    const res = await registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      password: regPassword || 'password123'
    });

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div
      onClick={() => setIsLoginModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] overflow-hidden cursor-default"
      >
        {/* Fixed Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {authModalTab === 'LOGIN' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authModalTab === 'LOGIN'
                    ? 'Akses sesi konsultasi dan rekam medis Anda'
                    : 'Mulai langkah sehat mental bersama JiwaSehat'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auth Tab Switcher (Masuk vs Daftar) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('LOGIN');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authModalTab === 'LOGIN'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('REGISTER');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authModalTab === 'REGISTER'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Daftar (Register)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body with Sleek Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 custom-scrollbar">
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* 1. FORM LOGIN */}
          {authModalTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Reset Sandi', 'Tautan pemulihan kata sandi telah dikirim ke email Anda.', 'info')}
                    className="text-[11px] text-teal-700 hover:underline font-semibold cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Masuk ke Akun</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('REGISTER')}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Daftar sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. FORM REGISTER (DAFTAR) */}
          {authModalTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="rian.pratama@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daftar Sebagai:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('PATIENT')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      regRole === 'PATIENT'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs">Pasien / Klien</div>
                      <div className="text-[10px] text-slate-400 font-normal">Konseling & Tes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('PSYCHOLOGIST')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      regRole === 'PSYCHOLOGIST'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold ring-1 ring-sky-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="text-xs">Psikolog Klinis</div>
                      <div className="text-[10px] text-slate-400 font-normal">Praktik Medis</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={regTermsAgreed}
                  onChange={e => setRegTermsAgreed(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 rounded mt-0.5 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  Saya menyetujui <strong>Syarat & Ketentuan</strong> serta jaminan <strong>Kerahasiaan Medis HIMPSI</strong>.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Daftar Akun Baru</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <p className="text-xs text-slate-500">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('LOGIN')}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Fixed Footer Note */}
        <div className="pt-3 pb-3.5 px-6 sm:px-8 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Tip Demo:</strong> Untuk beralih ke akun demo (*Budi Santoso, Siti Amanda, dr. Sarah, Admin*), gunakan menu <strong>titik 3 (⋮)</strong> di navigasi atas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
