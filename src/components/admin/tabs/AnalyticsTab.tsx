import React, { useState, useMemo } from 'react';
import { Appointment, User, PsychologistProfile, Review, AnalyticsSummary } from '../../../types';
import { ExportFinanceModal } from './ExportFinanceModal';
import { Tooltip } from '../../common/Tooltip';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Filter,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsTabProps {
  analytics: AnalyticsSummary;
  psychologists: PsychologistProfile[];
  users: User[];
  appointments: Appointment[];
  reviews: Review[];
  onOpenExportPage?: () => void;
}

const MONTH_OPTIONS = [
  { value: 'ALL', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

const YEAR_OPTIONS = [
  { value: 'ALL', label: 'Semua Tahun' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' }
];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  appointments,
  onOpenExportPage
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const itemsPerPage = 8;

  // Filter appointments based on Month and Year
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    if (selectedYear !== 'ALL') {
      result = result.filter(a => a.date.startsWith(selectedYear));
    }

    if (selectedMonth !== 'ALL') {
      result = result.filter(a => {
        const parts = a.date.split('-');
        return parts.length >= 2 && parts[1] === selectedMonth;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.patientName.toLowerCase().includes(q) ||
          a.bookingCode.toLowerCase().includes(q) ||
          a.packageName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [appointments, selectedYear, selectedMonth, searchQuery]);

  // Financial Calculations
  const paidTransactions = filteredAppointments.filter(
    a => a.paymentStatus === 'PAID' || a.paymentStatus === 'DP_PAID'
  );

  const pendingVerificationTransactions = filteredAppointments.filter(
    a => a.paymentStatus === 'DP_PENDING_VERIFICATION' || a.paymentStatus === 'PENDING'
  );

  const totalCashIn = paidTransactions.reduce((acc, a) => {
    if (a.paymentStatus === 'PAID') return acc + (a.totalAmount || 0);
    return acc + Math.ceil((a.totalAmount || 0) * 0.5);
  }, 0);

  const potentialPendingCash = pendingVerificationTransactions.reduce((acc, a) => {
    return acc + Math.ceil((a.totalAmount || 0) * 0.5);
  }, 0);

  const avgPerSession = paidTransactions.length > 0 ? Math.round(totalCashIn / paidTransactions.length) : 0;

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['Tanggal', 'Kode Booking', 'Pasien', 'Paket', 'Skema Pembayaran', 'Nominal Masuk (Rp)', 'Status'];
    const rows = filteredAppointments.map(a => {
      const isPaid = a.paymentStatus === 'PAID';
      const isDpPaid = a.paymentStatus === 'DP_PAID';
      const nominalMasuk = isPaid
        ? a.totalAmount
        : isDpPaid
        ? Math.ceil(a.totalAmount * 0.5)
        : 0;
      const skema = isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%';
      const status = isPaid ? 'Lunas' : isDpPaid ? 'DP 50% Diterima' : 'Verifikasi';

      return [
        `"${a.date}"`,
        `"${a.bookingCode}"`,
        `"${a.patientName.replace(/"/g, '""')}"`,
        `"${a.packageName.replace(/"/g, '""')}"`,
        `"${skema}"`,
        nominalMasuk,
        `"${status}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_JiwaSehat_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isFilterActive = selectedMonth !== 'ALL' || selectedYear !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedMonth('ALL');
    setSelectedYear('2026');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Filter Periode Modern SaaS yang Stabil */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Laporan Keuangan & Uang Masuk Praktik
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Arus Kas Nyata
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Pencatatan uang masuk dari pembayaran DP 50% dan pelunasan sesi konsultasi pasien.
          </p>
        </div>

        {/* Filter Bar: Dropdown Bulan & Tahun + Tombol Buka Modal Ekspor */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Bulan */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Tahun */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button (Icon + Tooltip) */}
          {isFilterActive && (
            <Tooltip content="Reset Filter Periode" position="bottom">
              <button
                type="button"
                onClick={handleResetFilters}
                aria-label="Reset Filter Periode"
                className="w-8.5 h-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}

          {/* Tombol Ekspor & Cetak Lengkap (Icon + Tooltip - Satu Tema Teal/Emerald Halus) */}
          <Tooltip content="Buka Ruang Cetak & Ekspor (Kop Resmi / Excel)" position="bottom">
            <button
              type="button"
              onClick={() => {
                if (onOpenExportPage) {
                  onOpenExportPage();
                } else {
                  setIsExportModalOpen(true);
                }
              }}
              aria-label="Buka Ruang Cetak Dokumen Kop Resmi & Ekspor Excel"
              className="w-8.5 h-8.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-900 border border-teal-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-teal-700" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 2. 3 Kartu Metrik Padat, Stabil, & Berwarna Halus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        {/* Total Uang Masuk */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/60 to-white rounded-2xl border border-emerald-200/80 shadow-2xs h-full min-h-[125px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Uang Masuk (Terverifikasi)
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                Rp
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Rp {totalCashIn.toLocaleString('id-ID')}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 mt-2 block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{paidTransactions.length} transaksi pembayaran diterima</span>
          </span>
        </div>

        {/* Rata-rata per Sesi */}
        <div className="p-4 bg-gradient-to-br from-sky-50/60 to-white rounded-2xl border border-sky-200/80 shadow-2xs h-full min-h-[125px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                Rata-rata Masuk per Sesi
              </span>
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Rp {avgPerSession.toLocaleString('id-ID')}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
            Rata-rata dari seluruh paket terbayar
          </span>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="p-4 bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-200/80 shadow-2xs h-full min-h-[125px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Menunggu Verifikasi Bukti
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-1 tracking-tight">
              {pendingVerificationTransactions.length} Booking
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 mt-2 block">
            Potensi DP: Rp {potentialPendingCash.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* 4. Tabel Rincian Transaksi Terkelola dengan Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Daftar Transaksi ({filteredAppointments.length})
            </h3>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari pasien, kode booking..."
              className="w-full pl-8 pr-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Tanggal & Kode</th>
                <th className="py-2.5 px-4">Pasien</th>
                <th className="py-2.5 px-4">Paket Konsultasi</th>
                <th className="py-2.5 px-4">Skema Pembayaran</th>
                <th className="py-2.5 px-4">Nominal Masuk</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada transaksi untuk filter yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map(apt => {
                  const isPaid = apt.paymentStatus === 'PAID';
                  const isDpPaid = apt.paymentStatus === 'DP_PAID';
                  const nominalMasuk = isPaid
                    ? apt.totalAmount
                    : isDpPaid
                    ? Math.ceil(apt.totalAmount * 0.5)
                    : 0;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{apt.date}</div>
                        <span className="text-[10px] text-slate-400 font-semibold">#{apt.bookingCode}</span>
                      </td>

                      <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {apt.patientName}
                      </td>

                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {apt.packageName}
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap font-medium text-slate-600">
                        {isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%'}
                      </td>

                      <td className="py-2.5 px-4 font-black text-slate-900 whitespace-nowrap text-xs">
                        {nominalMasuk > 0 ? `Rp ${nominalMasuk.toLocaleString('id-ID')}` : '-'}
                      </td>

                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            Lunas
                          </span>
                        ) : isDpPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-bold text-[10px]">
                            DP 50% Diterima
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                            Verifikasi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ekspor & Cetak Laporan Keuangan Ber-Kop Surat Resmi */}
      <ExportFinanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        appointments={appointments}
      />
    </div>
  );
};
