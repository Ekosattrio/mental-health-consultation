import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContextCore';
import { createPatientId } from '../../utils/identifiers';
import {router,useForm} from '@inertiajs/react';
import GoogleSignIn from '../GoogleSignIn';
import {
  HeartHandshake,
  Stethoscope,
  X,
  Mail,
  User as UserIcon,
  Shield,
  Sparkles
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithEmail,
    users,
    showToast,
    server
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);

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

  const handleGoogleSso = () => {
    if(server){router.visit('/auth/google/redirect');return;}
    setIsLoading(true);
    setTimeout(() => {
      showToast('Google SSO Terhubung', 'Autentikasi dengan akun Google berhasil diverifikasi.', 'success');
      loginWithEmail('budi.santoso@gmail.com');
      setIsLoading(false);
    }, 200);
  };

  const handleQuickLogin = (email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithEmail(email);
      setIsLoading(false);
    }, 150);
  };

  return typeof document !== 'undefined' && createPortal(
    <div
      onClick={() => setIsLoginModalOpen(false)}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="viewport-dialog bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] overflow-hidden cursor-default animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header Modal */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/30">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Masuk ke JiwaSehat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cukup gunakan email Anda untuk mengakses layanan
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
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 custom-scrollbar">
          {/* Autentikasi asli menggunakan desain modal Eko. */}
          {server ? <ServerLoginForm/> : <><button
            type="button"
            onClick={handleGoogleSso}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:border-slate-300"
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span>Lanjutkan dengan Akun Google</span>
          </button>

          {/* Quick Fill Helper for Testing */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Akses Cepat Pengujian:
              </span>
              <span className="text-[10px] text-slate-400">Klik untuk masuk</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('sarah.jenkins@jiwasehat.id')}
                className="p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white disabled:opacity-50"
              >
                <Stethoscope className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">Psikolog</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('admin@jiwasehat.id')}
                className="p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Admin</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('budi.santoso@gmail.com')}
                className="p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Pasien Lama (Lengkap)</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(`pasien.baru.${createPatientId()}@gmail.com`)}
                className="p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Pasien Baru (Form Wajib)</span>
              </button>
            </div>
          </div></>}
        </div>
      </div>
    </div>,
    document.body
  );
};

function ServerLoginForm(){
  const form=useForm({email:'',password:''});
  return <div className="space-y-4"><GoogleSignIn/><form onSubmit={event=>{event.preventDefault();form.post('/login'+location.search,{onFinish:()=>form.reset('password')});}} className="space-y-3">
    <label className="block text-xs font-bold text-slate-700">Email atau username<input name="email" autoComplete="username" required value={form.data.email} onChange={e=>form.setData('email',e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"/></label>
    <label className="block text-xs font-bold text-slate-700">Kata sandi<input name="password" type="password" autoComplete="current-password" required value={form.data.password} onChange={e=>form.setData('password',e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"/></label>
    {Object.values(form.errors).map((error,index)=><p key={index} role="alert" className="text-xs text-rose-700">{error}</p>)}
    <button disabled={form.processing} className="w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white disabled:opacity-50">{form.processing?'Memproses…':'Masuk'}</button>
    <div className="flex justify-between gap-3 text-xs font-semibold text-teal-700"><button type="button" onClick={()=>router.visit('/register')}>Daftar pasien</button><button type="button" onClick={()=>router.visit('/forgot-password')}>Lupa kata sandi?</button></div>
  </form></div>;
}
