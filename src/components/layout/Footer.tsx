import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartHandshake, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setViewMode, switchRole } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">JiwaSehat</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Praktik psikologi berbasis booking terjadwal. Pasien mengisi pre-test, mengajukan jadwal minimal H+1, dan admin memverifikasi pembayaran sebelum konsultasi.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-teal-400 font-bold border border-slate-700">
                <Instagram className="w-4 h-4" /> Instagram: @jiwasehat.id
              </span>
            </div>
          </div>

          {/* Quick Links Role Switch */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Simulasi Peran</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    switchRole('GUEST');
                    setViewMode('PLATFORM');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Tamu / Landing Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('PATIENT');
                    setViewMode('PLATFORM');
                  }}
                  className="hover:text-teal-400 transition-colors"
                >
                  Dashboard Pasien (Klien)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('PSYCHOLOGIST');
                    setViewMode('PLATFORM');
                  }}
                  className="hover:text-sky-400 transition-colors"
                >
                  Dashboard Psikolog & EMR
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRole('ADMIN');
                    setViewMode('PLATFORM');
                  }}
                  className="hover:text-purple-400 transition-colors"
                >
                  Panel Administrator
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setViewMode('BLUEPRINT')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Blueprint Arsitektur & RBAC →
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Service Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Layanan Klinis</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Booking Konsultasi H+1</li>
              <li>Pre-Test Sebelum Konsultasi</li>
              <li>Sesi Praktik Terjadwal</li>
              <li>Assessment Tambahan Jika Ditugaskan</li>
              <li>Upload Bukti DP 50%</li>
              <li>Riwayat dan Review Sesi</li>
            </ul>
          </div>

          {/* Clinic Contact & Operational */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Klinik & Operasional</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan 12190</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Senin - Sabtu: 08:00 - 21:00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>(021) 765-4321 / WhatsApp CS</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>konseling@jiwasehat.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-teal-400 shrink-0" />
                <span>@jiwasehat.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 JiwaSehat Mental Health Technologies. Seluruh Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Pemberitahuan: Layanan ini bukan pengganti penanganan darurat unit gawat darurat medis.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
