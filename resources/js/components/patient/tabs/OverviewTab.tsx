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
  History,
  CheckCircle2
} from 'lucide-react';

interface OverviewTabProps {
  patientCms: PatientPageCmsConfig;
  onNavigateTab: (tabId: 'booking' | 'history' | 'faq') => void;
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
    question: 'Bagaimana skema pembayaran DP dan pelunasannya?',
    answer: 'DP Rp 100.000 mengurangi total biaya layanan. Admin memeriksa bukti sebelum mengonfirmasi booking. Pembayaran psikoterapi setelah sesi pertama dapat bertahap sesuai kesepakatan; untuk penghentian layanan seluruh biaya harus lunas.'
  },
  {
    category: 'Reschedule',
    question: 'Apakah saya bisa mengajukan perubahan jadwal (reschedule)?',
    answer: 'Pilih tanggal pengganti minimal keesokan hari (H+1 dari hari pengajuan) melalui Jadwal & Riwayat Saya atau minta bantuan admin. Pembayaran yang sudah tercatat tetap berlaku tanpa DP kedua.'
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
      title: 'Bayar DP & Upload Bukti',
      badge: 'Kunci Slot',
      desc: 'Transfer DP flat Rp 100.000 dan lampirkan bukti pembayaran untuk diperiksa admin.',
      icon: CreditCard
    },
    {
      step: 4,
      title: 'Ikuti Sesi Konsultasi',
      badge: 'Privat & Terjadwal',
      desc: 'Ikuti petunjuk sesuai metode paket: hadir lebih awal untuk tatap muka atau gunakan detail media sesi telelayanan yang telah dikonfirmasi.',
      icon: Building
    },
    {
      step: 5,
      title: 'Pelunasan & Ulasan',
      badge: 'Selesai Konseling',
      desc: 'Selesaikan sisa biaya paket setelah sesi berakhir dan berikan ulasan kepuasan secara transparan atau anonim.',
      icon: Star
    }
  ];

  return (
    <div className="space-y-4">
      {(patientCms.dailyMentalHealthTip || patientCms.announcementText) && <div className="space-y-1 border-l-2 border-teal-500 bg-teal-50/60 px-3 py-2 text-xs leading-5 text-slate-700">
        {patientCms.dailyMentalHealthTip && <p className="whitespace-pre-line break-words">{patientCms.dailyMentalHealthTip}</p>}
        {patientCms.announcementText && <p className="whitespace-pre-line break-words font-medium">{patientCms.announcementText}</p>}
      </div>}
      {/* 1. COMPACT HERO BANNER & QUICK ACTIONS */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Panduan Layanan & FAQ Pasien</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {patientCms.welcomeBannerTitle}
            </h1>
            <p className="text-xs text-emerald-50/90 leading-relaxed">
              {patientCms.welcomeBannerSubtitle}
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

        {/* KOLOM KANAN: PANDUAN PERSIAPAN SESI & HOTLINE SIAGA */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card Persiapan Sesi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Building className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Persiapan Sesi Konsultasi
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sesuai Metode Paket
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Periksa Metode dan Detail Sesi</strong>
                  <span className="text-[11px] text-slate-500">Hadir 10-15 menit lebih awal untuk tatap muka atau siapkan perangkat dan media sesi yang dikonfirmasi untuk telelayanan.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Bukti Transfer DP Rp 100.000</strong>
                  <span className="text-[11px] text-slate-500">Pastikan bukti transfer DP konsultasi sudah diunggah saat booking dan berstatus terkonfirmasi.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Siapkan Ruang yang Privat</strong>
                  <span className="text-[11px] text-slate-500">Ruang klinik disiapkan privat; untuk telelayanan, pilih tempat tenang agar sesi berlangsung nyaman dan rahasia.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Butuh info lebih lanjut seputar tanya jawab?</span>
              <button
                type="button"
                onClick={() => onNavigateTab('faq')}
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
                {patientCms.crisisHotlineTitle}
              </h4>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {patientCms.crisisNotice}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:${patientCms.crisisHotlineNumber.replace(/[^0-9]/g, '')}`}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{patientCms.crisisHotlineNumber}</span>
              </a>
              <a
                href={`https://wa.me/${patientCms.crisisWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Kontak Bantuan</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
