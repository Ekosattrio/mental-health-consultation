import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, PhoneCall, MessageSquare } from 'lucide-react';
import { PatientPageCmsConfig } from '../../../types';

interface FaqTabProps {
  patientCms: PatientPageCmsConfig;
  onNavigateTab: (tabId: 'booking' | 'overview') => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category: 'RESERVASI' | 'PEMBAYARAN' | 'JADWAL' | 'PRIVASI';
}

const FAQS_DATA: FaqItem[] = [
  {
    category: 'RESERVASI',
    question: 'Bagaimana cara menjadwalkan konsultasi tatap muka?',
    answer: 'Pilih paket konsultasi di tab Booking, pilih tanggal (minimal H+1), isi formulir pre-test keluhan, lalu bayar DP 50% dan unggah bukti transfer. Admin kami akan segera memverifikasi jadwal Anda.'
  },
  {
    category: 'RESERVASI',
    question: 'Apakah formulir pre-test keluhan wajib diisi?',
    answer: 'Ya, formulir pre-test keluhan wajib diisi saat proses booking agar psikolog memiliki gambaran komprehensif mengenai kondisi klinis Anda sebelum sesi dimulai.'
  },
  {
    category: 'PEMBAYARAN',
    question: 'Mengapa sistem memberlakukan pembayaran DP 50%?',
    answer: 'DP 50% diberlakukan untuk mengunci slot jadwal secara eksklusif agar tidak diisi oleh pasien lain, serta menghindarkan antrean dari pembatalan mendadak tanpa konfirmasi.'
  },
  {
    category: 'PEMBAYARAN',
    question: 'Kapan pelunasan sisa 50% biaya konsultasi dilakukan?',
    answer: 'Pelunasan sisa 50% dilakukan di meja registrasi klinik setelah sesi tatap muka selesai, baik melalui transfer bank maupun tunai/QRIS.'
  },
  {
    category: 'JADWAL',
    question: 'Bagaimana jika saya ingin mengajukan reschedule jadwal?',
    answer: 'Permintaan reschedule dapat diajukan minimal H+1 sebelum jadwal sesi dengan menghubungi admin operasional via WhatsApp atau menggunakan bantuan admin di menu Jadwal & Riwayat.'
  },
  {
    category: 'JADWAL',
    question: 'Berapa menit sebelum sesi saya harus hadir di klinik?',
    answer: 'Kami menyarankan Anda hadir 10–15 menit sebelum jadwal sesi tatap muka untuk proses verifikasi kedatangan dan kenyamanan relaksasi sebelum konsultasi.'
  },
  {
    category: 'PRIVASI',
    question: 'Apakah kerahasiaan isi cerita dan data saya terjamin?',
    answer: 'Tentu. Seluruh data rekam keluhan, hasil asesmen, dan percakapan selama sesi konsultasi dilindungi penuh oleh Kode Etik Profesi Psikologi Klinis Indonesia dan kerahasiaan medis yang ketat.'
  },
  {
    category: 'PRIVASI',
    question: 'Apakah ulasan yang saya berikan dapat bersifat anonim?',
    answer: 'Ya, Anda dapat mencentang opsi "Kirim Ulasan Anonim" saat memberikan penilaian sesi di riwayat janji temu agar nama Anda tidak dipublikasikan ke publik.'
  }
];

export const FaqTab: React.FC<FaqTabProps> = ({ patientCms, onNavigateTab }) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const categories = ['ALL', 'RESERVASI', 'PEMBAYARAN', 'JADWAL', 'PRIVASI'];

  const filteredFaqs = FAQS_DATA.filter(faq => {
    const matchesCat = activeCategory === 'ALL' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header FAQ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pusat Informasi & FAQ</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Temukan jawaban cepat seputar reservasi sesi tatap muka, DP 50%, jadwal, dan kebijakan kerahasiaan klinik.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('booking')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Reservasi Konsultasi</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'ALL' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>

          <div className="sm:w-64">
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-emerald-600 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[9px] uppercase tracking-wider mb-2 inline-block">
                      Kategori: {faq.category}
                    </span>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact Support Footer */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-center sm:text-left">
          <p className="font-bold text-emerald-950">Masih punya pertanyaan lain seputar sesi konseling?</p>
          <p className="text-emerald-700 text-[11px] mt-0.5">
            Admin operasional JiwaSehat siap membantu menjawab pertanyaan Anda via WhatsApp resmi.
          </p>
        </div>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Hubungi WhatsApp Admin</span>
        </a>
      </div>
    </div>
  );
};
