import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartHandshake, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const Footer: React.FC = () => {
  const { setIsLoginModalOpen, landingCms } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                <ImageWithFallback src={landingCms.logoUrl} alt="" className="h-full w-full object-contain" fallback={<HeartHandshake className="w-6 h-6" />} />
              </div>
              <span className="min-w-0 break-words text-xl font-bold text-white">{landingCms.clinicName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Praktik psikologi berbasis booking terjadwal. Pasien mengisi pre-test, mengajukan jadwal minimal H+1, dan admin memverifikasi pembayaran sebelum konsultasi.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              {landingCms.instagramUrl && <a href={landingCms.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-teal-400 hover:text-white"><Instagram className="w-4 h-4" />Instagram</a>}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="text-slate-400 hover:text-white transition-colors">
                  Beranda Praktik
                </a>
              </li>
              <li>
                <a href="#packages" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Paket Layanan
                </a>
              </li>
              <li>
                <a href="#about-psychologist" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Profil Psikolog
                </a>
              </li>
              <li>
                <a href="#faq" className="text-slate-400 hover:text-teal-400 transition-colors">
                  Panduan Pasien & FAQ
                </a>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
                >
                  Masuk ke Portal Akun →
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
              <li>Pre-Test Profiling untuk Persiapan Sesi</li>
              <li>Upload Bukti DP Rp 100.000</li>
              <li>Riwayat dan Review Sesi</li>
            </ul>
          </div>

          {/* Clinic Contact & Operational */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Klinik & Operasional</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="min-w-0 break-words">{landingCms.clinicAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="min-w-0 break-words">{landingCms.clinicHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="min-w-0 break-words">{landingCms.clinicPhone} / {landingCms.clinicWhatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="min-w-0 break-words">{landingCms.clinicEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={landingCms.instagramUrl || undefined} target="_blank" rel="noreferrer" className="min-w-0 break-words">{landingCms.instagramUrl ? 'Instagram' : '-'}</a>
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
