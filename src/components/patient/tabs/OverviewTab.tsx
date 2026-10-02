import React, { useState } from 'react';
import { PatientPageCmsConfig } from '../../../types';
import {
  Sparkles,
  Calendar,
  ClipboardCheck,
  CreditCard,
  Building,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  FileCheck,
  History,
  CheckCircle2
} from 'lucide-react';

interface OverviewTabProps {
  patientCms: PatientPageCmsConfig;
  onNavigateTab: (tabId: 'booking' | 'tests' | 'history') => void;
}

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Reservasi',
    question: 'Mengapa booking konsultasi wajib dilakukan minimal H+1?',
    answer: 'Aturan minimal H+1 diterapkan agar psikolog memiliki waktu cukup mempelajari hasil pre-test keluhan Anda sebelum sesi, serta memastikan ruang praktik klinik steril dan siap.'
  },
  {
    category: 'Pre-Test',
    question: 'Kapan dan bagaimana saya harus mengisi formulir Pre-Test?',
    answer: 'Formulir Pre-Test terintegrasi langsung pada Langkah ke-2 saat Anda melakukan booking. Anda tidak perlu mencari form terpisah. Data ini penting untuk persiapan intervensi klinis.'
  },
  {
    category: 'Pembayaran',
    question: 'Bagaimana skema pembayaran DP 50% dan pelunasannya?',
    answer: 'Untuk mengunci slot jadwal, pasien mentransfer DP 50% dan mengunggah bukti transfer. Sisa pelunasan 50% diselesaikan setelah sesi konsultasi tatap muka selesai.'
  },
  {
    category: 'Reschedule',
    question: 'Apakah saya bisa mengajukan perubahan jadwal (reschedule)?',
    answer: 'Bisa melalui menu "Jadwal & Riwayat Saya" minimal H+1 dari tanggal sesi sebelumnya, atau menghubungi admin jika terdapat kendala mendadak.'
  },
  {
    category: 'Privasi',
    question: 'Apakah data keluhan dan riwayat konseling saya terjamin rahasia?',
    answer: 'Sangat aman dan terenkripsi. Seluruh data keluhan awal dan catatan sesi dilindungi kode etik kerahasiaan psikologi klinis dan standar perlindungan data kesehatan.'
  }
];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  patientCms,
  onNavigateTab
}) => {
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('ALL');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const categories = ['ALL', 'Reservasi', 'Pre-Test', 'Pembayaran', 'Reschedule', 'Privasi'];

  const filteredFaqs = FAQS.filter(faq => {
    if (activeFaqCategory === 'ALL') return true;
    return faq.category === activeFaqCategory;
  });

  const steps = [
    {
      step: 1,
      title: 'Pilih Jadwal & Paket',
      badge: 'Minimal H+1',
      desc: 'Tentukan paket konsultasi dan tanggal sesi minimal H+1. Jam praktik aktif langsung tersinkronisasi otomatis.',
      icon: Calendar
    },
    {
      step: 2,
      title: 'Isi Pre-Test Keluhan',
      badge: 'Wajib Diisi',
      desc: 'Lengkapi keluhan utama, skala stres, dan kontak darurat di Langkah 2 wizard booking tanpa form terpisah.',
      icon: ClipboardCheck
    },
    {
      step: 3,
      title: 'Bayar DP 50% & Upload Bukti',
      badge: 'Kunci Slot',
      desc: 'Transfer 50% biaya paket ke rekening klinik dan lampirkan bukti transfer untuk diverifikasi admin.',
      icon: CreditCard
    },
    {
      step: 4,
      title: 'Sesi Tatap Muka di Klinik',
      badge: 'Privat & Offline',
      desc: 'Hadir 10 menit lebih awal di JiwaSehat Center. Sesi berlangsung privat tatap muka bersama psikolog berizin SIP.',
      icon: Building
    },
    {
      step: 5,
      title: 'Pelunasan 50% & Ulasan',
      badge: 'Selesai Konseling',
      desc: 'Selesaikan sisa 50% setelah sesi berakhir dan berikan ulasan kepuasan secara transparan atau anonim.',
      icon: Star
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. COMPACT HERO BANNER & QUICK ACTIONS */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Panduan Layanan & FAQ Pasien</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Selamat Datang di Portal Konseling JiwaSehat
            </h1>
            <p className="text-xs text-emerald-50/90 leading-relaxed">
              Panduan terpadu reservasi sesi tatap muka bersama dr. Sarah Jenkins, M.Psi., Psikolog.
            </p>
          </div>

          {/* 3 Quick Action Buttons: Compact & Direct */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('booking')}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-950" />
              <span>Booking Jadwal</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('history')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-emerald-200" />
              <span>Jadwal Saya</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('tests')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-teal-200" />
              <span>Tes DASS-21</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN BALANCED LAYOUT: ALUR KONSELING (KIRI) & FAQ (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* KOLOM KIRI: 5 LANGKAH ALUR KONSELING (RAPAT & BERGARIS) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>5 Langkah Alur Konseling</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alur baku dari pemesanan jadwal hingga penyelesaian sesi.
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-200">
              SOP Klinik
            </span>
          </div>

          {/* Stepper Timeline: Compact, Modern, High Contrast */}
          <div className="space-y-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = activeStepTab === s.step;

              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStepTab(s.step)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-400 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/90 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {s.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-900'}`}>
                          {s.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-600 shrink-0">
                          {s.badge}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-0.5 ${isSelected ? 'text-emerald-900' : 'text-slate-500'}`}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Siap untuk memulai sesi pertama Anda?</span>
            <button
              type="button"
              onClick={() => onNavigateTab('booking')}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Formulir Booking</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: PANDUAN PERSIAPAN KLINIK & HOTLINE SIAGA */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card Persiapan Sesi Tatap Muka */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Building className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Persiapan Hadir di Klinik
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tatap Muka Privat
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Hadir 10–15 Menit Lebih Awal</strong>
                  <span className="text-[11px] text-slate-500">Memberikan waktu untuk proses check-in, penyesuaian diri, dan relaksasi sebelum sesi dimulai.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Bukti Transfer DP 50%</strong>
                  <span className="text-[11px] text-slate-500">Pastikan bukti transfer DP 50% sudah diunggah saat booking dan berstatus terkonfirmasi.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Ruang Konseling Privat & Kedap Suara</strong>
                  <span className="text-[11px] text-slate-500">Sesi berlangsung aman dan bebas stigma dengan jaminan kerahasiaan medis psikolog klinis.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Butuh info lebih lanjut seputar tanya jawab?</span>
              <button
                type="button"
                onClick={() => onNavigateTab('booking')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Pertanyaan di Tab FAQ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* HOTLINE BANTUAN KRISIS & SIAGA DARURAT (BEBAS BUG / TEKS DUPLIKAT) */}
          <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                Layanan Bantuan Krisis & Kontak Siaga 24 Jam
              </h4>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Jika Anda atau kerabat sedang mengalami krisis emosional mendalam, serangan panik berat, atau membutuhkan pendampingan darurat, silakan segera hubungi hotline siaga berikut (bebas pulsa) atau hubungi WhatsApp layanan krisis kami:
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${patientCms.crisisHotlineNumber.replace(/[^0-9]/g, '')}`}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Hotline Bebas Pulsa ({patientCms.crisisHotlineNumber})</span>
              </a>
              <a
                href={`https://wa.me/${patientCms.crisisWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Siaga 24 Jam</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
