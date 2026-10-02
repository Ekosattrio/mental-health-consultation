import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  X,
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface ExportFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
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
  { value: '2026', label: 'Tahun 2026' },
  { value: '2025', label: 'Tahun 2025' }
];

export const ExportFinanceModal: React.FC<ExportFinanceModalProps> = ({
  isOpen,
  onClose,
  appointments
}) => {
  const { psychologistCms } = useApp();

  const clinicName = psychologistCms?.letterheadClinicName || 'Praktik Mandiri Psikolog Klinis JiwaSehat';
  const doctorName = psychologistCms?.letterheadDoctorName || 'dr. Sarah Jenkins, M.Psi., Psikolog';
  const sipNumber = psychologistCms?.letterheadSipNumber || 'SIP.503/042-DPMPTSP/2022';
  const strNumber = psychologistCms?.letterheadStrNumber || 'STR-PSI-2021-09842';
  const clinicAddress = psychologistCms?.letterheadAddress || 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190';
  const clinicPhone = psychologistCms?.letterheadPhone || '(021) 7890-1234';
  const clinicEmail = psychologistCms?.letterheadEmail || 'klinik@jiwasehat.id';
  const clinicCity = psychologistCms?.letterheadCity || 'Jakarta';
  const signerRole = psychologistCms?.letterheadSignerRole || 'Psikolog Penanggung Jawab Praktik';
  // Mode Filter: 'MONTH_YEAR' | 'DATE_RANGE' | 'ALL'
  const [filterMode, setFilterMode] = useState<'MONTH_YEAR' | 'DATE_RANGE' | 'ALL'>('MONTH_YEAR');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // Filter seluruh appointments (TIDAK terpotong oleh pagination)
  const filteredData = useMemo(() => {
    let result = appointments;

    if (filterMode === 'MONTH_YEAR') {
      if (selectedYear !== 'ALL') {
        result = result.filter(a => a.date.startsWith(selectedYear));
      }
      if (selectedMonth !== 'ALL') {
        result = result.filter(a => {
          const parts = a.date.split('-');
          return parts.length >= 2 && parts[1] === selectedMonth;
        });
      }
    } else if (filterMode === 'DATE_RANGE') {
      if (startDate) {
        result = result.filter(a => a.date >= startDate);
      }
      if (endDate) {
        result = result.filter(a => a.date <= endDate);
      }
    }

    // Urutkan berdasarkan tanggal terbaru
    return [...result].sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Transaksi Terverifikasi
  const paidTransactions = useMemo(() => {
    return filteredData.filter(
      a => a.paymentStatus === 'PAID' || a.paymentStatus === 'DP_PAID'
    );
  }, [filteredData]);

  const totalCashIn = useMemo(() => {
    return paidTransactions.reduce((acc, a) => {
      if (a.paymentStatus === 'PAID') return acc + (a.totalAmount || 0);
      return acc + Math.ceil((a.totalAmount || 0) * 0.5);
    }, 0);
  }, [paidTransactions]);

  const avgPerSession = paidTransactions.length > 0 ? Math.round(totalCashIn / paidTransactions.length) : 0;

  // Tanggal terbit dokumen
  const printDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getPeriodeLabel = () => {
    if (filterMode === 'MONTH_YEAR') {
      const monthLabel = MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label || 'Semua Bulan';
      const yearLabel = selectedYear === 'ALL' ? 'Semua Tahun' : selectedYear;
      return `${monthLabel} ${yearLabel}`;
    }
    if (filterMode === 'DATE_RANGE') {
      return `Rentang: ${startDate} s/d ${endDate}`;
    }
    return 'Seluruh Riwayat Praktik';
  };

  // Unduh CSV / Excel
  const handleDownloadCsv = () => {
    const headers = [
      'No',
      'Tanggal',
      'Kode Booking',
      'Nama Pasien',
      'Paket Konsultasi',
      'Skema Pembayaran',
      'Nominal Masuk (Rp)',
      'Status Verifikasi'
    ];

    const rows = filteredData.map((a, idx) => {
      const isPaid = a.paymentStatus === 'PAID';
      const isDpPaid = a.paymentStatus === 'DP_PAID';
      const nominalMasuk = isPaid
        ? a.totalAmount
        : isDpPaid
        ? Math.ceil(a.totalAmount * 0.5)
        : 0;
      const skema = isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%';
      const status = isPaid ? 'Lunas' : isDpPaid ? 'DP 50% Diterima' : 'Verifikasi Bukti';

      return [
        idx + 1,
        `"${a.date}"`,
        `"${a.bookingCode}"`,
        `"${a.patientName.replace(/"/g, '""')}"`,
        `"${a.packageName.replace(/"/g, '""')}"`,
        `"${skema}"`,
        nominalMasuk,
        `"${status}"`
      ].join(',');
    });

    // Tambah footer total
    rows.push([
      '',
      '',
      '',
      '"TOTAL AKUMULASI"',
      '',
      '',
      totalCashIn,
      ''
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Keuangan_JiwaSehat_${filterMode}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 print:p-0 print:bg-white print:static print:z-auto">
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200/90 max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:max-h-none print:w-full print:max-w-none"
      >
        {/* Modal Top Control Bar */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Pratinjau & Ekspor Laporan Keuangan
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Format resmi ber-kop klinik untuk cetak PDF, pratinjau, atau unduh spreadsheet CSV.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip content="Download File CSV / Excel" position="bottom">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  aria-label="Download File CSV"
                  className="w-8.5 h-8.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>

              <Tooltip content="Cetak / Simpan Dokumen PDF" position="bottom">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  aria-label="Cetak atau Simpan PDF"
                  className="w-8.5 h-8.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                </button>
              </Tooltip>

              <Tooltip content="Tutup Pratinjau (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="w-8.5 h-8.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Opsi Pilihan Filter Ekspor */}
          <div className="mt-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Mode Filter Data:</span>
              </span>

              {/* Mode Selector */}
              <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFilterMode('MONTH_YEAR')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterMode === 'MONTH_YEAR'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan & Tahun
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('DATE_RANGE')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterMode === 'DATE_RANGE'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rentang Tanggal
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Data
                </button>
              </div>
            </div>

            {/* Sub-Filter Controls */}
            {filterMode === 'MONTH_YEAR' && (
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold">Bulan:</span>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold">Tahun:</span>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  Tertangkap: <strong>{filteredData.length} transaksi</strong>
                </span>
              </div>
            )}

            {filterMode === 'DATE_RANGE' && (
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold">Dari:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold">Sampai:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                  />
                </div>

                <span className="text-[11px] text-slate-500 font-medium">
                  Tertangkap: <strong>{filteredData.length} transaksi</strong>
                </span>
              </div>
            )}

            {filterMode === 'ALL' && (
              <div className="pt-1 text-xs text-slate-600">
                Menampilkan seluruh riwayat transaksi praktik sejak awal pembukuan (<strong>{filteredData.length} transaksi</strong>).
              </div>
            )}
          </div>

          {/* DOKUMEN CETAK BER-KOP RESMI (LIVE PREVIEW) */}
          <div className="mt-4 p-5 sm:p-7 bg-white rounded-2xl border-2 border-slate-300 shadow-inner space-y-4 print:p-0 print:border-none print:shadow-none">
            {/* Kop Surat Resmi */}
            <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-sm">
                  JS
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase">
                  {clinicName}
                </h2>
              </div>
              <p className="text-xs font-bold text-slate-700">
                Praktisi Penanggung Jawab: {doctorName}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                SIP: {sipNumber} • STR: {strNumber} • Layanan Berizin Resmi
              </p>
              <p className="text-[10px] text-slate-500">
                {clinicAddress} • Telp: {clinicPhone} • Email: {clinicEmail}
              </p>
            </div>

            {/* Judul Dokumen & Periode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-slate-100 gap-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Dokumen
                </span>
                <span className="text-sm font-black text-slate-900">
                  LAPORAN ARUS KAS MASUK KONSULTASI
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Periode Laporan
                </span>
                <span className="font-extrabold text-emerald-800">
                  {getPeriodeLabel()}
                </span>
              </div>
            </div>

            {/* Ringkasan Angka Kas (3 Kolom Ringkas) */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Total Kas Masuk</span>
                <span className="text-base font-black text-emerald-700">
                  Rp {totalCashIn.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Transaksi Terbayar</span>
                <span className="text-base font-black text-slate-900">
                  {paidTransactions.length} Sesi
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Rata-rata per Sesi</span>
                <span className="text-base font-black text-sky-700">
                  Rp {avgPerSession.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Tabel Seluruh Transaksi yang Tertangkap */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-[10px] font-black text-slate-700 uppercase border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-2.5 text-center border-r border-slate-200">No</th>
                    <th className="py-2 px-3 border-r border-slate-200">Tanggal</th>
                    <th className="py-2 px-3 border-r border-slate-200">Kode</th>
                    <th className="py-2 px-3 border-r border-slate-200">Pasien</th>
                    <th className="py-2 px-3 border-r border-slate-200">Paket Konsultasi</th>
                    <th className="py-2 px-3 border-r border-slate-200">Skema Pembayaran</th>
                    <th className="py-2 px-3 text-right border-r border-slate-200">Uang Masuk</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                        Tidak ada transaksi yang cocok dengan filter tanggal/periode yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((a, idx) => {
                      const isPaid = a.paymentStatus === 'PAID';
                      const isDpPaid = a.paymentStatus === 'DP_PAID';
                      const nominalMasuk = isPaid
                        ? a.totalAmount
                        : isDpPaid
                        ? Math.ceil(a.totalAmount * 0.5)
                        : 0;

                      return (
                        <tr key={a.id} className="hover:bg-slate-50 text-[11px]">
                          <td className="py-1.5 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-200 font-semibold text-slate-800 whitespace-nowrap">
                            {a.date}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                            #{a.bookingCode}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                            {a.patientName}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">
                            {a.packageName}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">
                            {isPaid ? 'Lunas 100%' : isDpPaid ? 'DP 50%' : 'Menunggu DP'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-black text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            {nominalMasuk > 0 ? `Rp ${nominalMasuk.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            {isPaid ? (
                              <span className="font-bold text-emerald-700">Lunas</span>
                            ) : isDpPaid ? (
                              <span className="font-bold text-sky-700">DP Diterima</span>
                            ) : (
                              <span className="font-bold text-amber-700">Verifikasi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-100/80 font-black border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right text-slate-900">
                      TOTAL PENERIMAAN KAS NYATA:
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 text-sm">
                      Rp {totalCashIn.toLocaleString('id-ID')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Lembar Tanda Tangan Resmi */}
            <div className="pt-6 flex justify-between items-end text-xs">
              <div className="text-[11px] text-slate-400">
                Dokumen resmi sistem internal {clinicName}.
                <br />
                Dicetak pada: {printDateFormatted} WIB.
              </div>

              <div className="text-center w-52 space-y-12">
                <div>
                  <span className="text-[11px] text-slate-600 block">{clinicCity}, {printDateFormatted}</span>
                  <span className="text-[11px] font-bold text-slate-800 block">{signerRole}</span>
                </div>
                <div>
                  <div className="font-black text-slate-900 underline text-xs">
                    {doctorName}
                  </div>
                  <span className="text-[10px] text-slate-500 block">SIP: {sipNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            Total <strong>{filteredData.length} baris data</strong> siap diekspor.
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Tutup Jendela Pratinjau (Esc)" position="top">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </Tooltip>

            <Tooltip content="Unduh berkas spreadsheet CSV (UTF-8 BOM)" position="top">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel / CSV</span>
              </button>
            </Tooltip>

            <Tooltip content="Cetak langsung atau simpan dokumen ber-kop PDF" position="top">
              <button
                type="button"
                onClick={handlePrintDocument}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
