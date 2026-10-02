import React, { useState, useMemo } from 'react';
import { Appointment } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  ArrowLeft,
  Table,
  Check,
  RotateCcw,
  Layers,
  Eye
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface ExportFinancePageProps {
  appointments: Appointment[];
  onBack: () => void;
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

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const PRINT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara cetak / simpan PDF agar rapi & pas di lembar kertas A4?',
    answer:
      'Tekan tombol "Cetak Dokumen Resmi / Simpan PDF". Pada jendela pratinjau browser, pilih Destination: "Save as PDF", Paper Size: "A4", dan nonaktifkan centang "Headers and footers" browser agar dokumen tampil bersih dengan nomor halaman resmi dari sistem.'
  },
  {
    id: 'faq-2',
    question: 'Bagaimana sistem membagi dokumen menjadi beberapa halaman (Next Page)?',
    answer:
      'Sistem otomatis membagi data per lembar kertas A4 standar. Halaman pertama memuat Kop Surat Dinas Lengkap dan 10-12 transaksi awal, halaman sambungan memuat kelanjutan transaksi, dan halaman terakhir memuat Rekap Total Akumulasi serta Tanda Tangan Penanggung Jawab Praktik.'
  },
  {
    id: 'faq-3',
    question: 'Apakah pratinjau Excel dibatasi dan apakah berkas .xls tetap 100% lengkap?',
    answer:
      'Ya! Demi kenyamanan dan kecepatan tampilan, pratinjau spreadsheet di layar dibatasi 10 baris per halaman dengan tombol navigasi Prev/Next. Namun saat Anda menekan tombol "Download Berkas Excel (.xls)", seluruh 100% data transaksi akan diekspor lengkap tanpa ada yang terpotong.'
  },
  {
    id: 'faq-4',
    question: 'Di mana saya bisa mengedit Kop Surat (Nama Klinik, SIP, STR, Alamat)?',
    answer:
      'Kop Surat Resmi dapat diubah kapan saja melalui menu CMS Konten > Tab Dokter / Psikolog > Bagian "3. Pengaturan Kop Surat Resmi Laporan & Dokumen Cetak". Seluruh perubahan yang disimpan akan langsung otomatis diterapkan pada pratinjau PDF dan file Excel ini.'
  }
];

export const ExportFinancePage: React.FC<ExportFinancePageProps> = ({
  appointments,
  onBack
}) => {
  const { psychologistCms } = useApp();

  // Konfigurasi Kop Surat Resmi dari CMS
  const clinicName = psychologistCms?.letterheadClinicName || 'Praktik Mandiri Psikolog Klinis JiwaSehat';
  const doctorName = psychologistCms?.letterheadDoctorName || 'dr. Sarah Jenkins, M.Psi., Psikolog';
  const sipNumber = psychologistCms?.letterheadSipNumber || 'SIP.503/042-DPMPTSP/2022';
  const strNumber = psychologistCms?.letterheadStrNumber || 'STR-PSI-2021-09842';
  const clinicAddress = psychologistCms?.letterheadAddress || 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190';
  const clinicPhone = psychologistCms?.letterheadPhone || '(021) 7890-1234';
  const clinicEmail = psychologistCms?.letterheadEmail || 'klinik@jiwasehat.id';
  const clinicWebsite = psychologistCms?.letterheadWebsite || 'www.jiwasehat.id';
  const clinicCity = psychologistCms?.letterheadCity || 'Jakarta';
  const signerRole = psychologistCms?.letterheadSignerRole || 'Psikolog Penanggung Jawab Praktik';

  // Format Ekspor: 'PDF' (Kop Resmi) | 'EXCEL' (Tabel Spreadsheet)
  const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL'>('PDF');

  // Filter Mode
  const [filterMode, setFilterMode] = useState<'MONTH_YEAR' | 'DATE_RANGE' | 'ALL'>('MONTH_YEAR');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // Accordion FAQ (Single-Open)
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // State Pagination Pratinjau PDF A4
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfViewMode, setPdfViewMode] = useState<'SINGLE' | 'ALL'>('SINGLE');

  // State Pagination Pratinjau Excel Spreadsheet
  const [excelCurrentPage, setExcelCurrentPage] = useState<number>(1);
  const EXCEL_PAGE_SIZE = 10;

  // Filter Data Transaksi (100% utuh)
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

    // Urutkan tanggal terbaru lebih dulu
    return [...result].sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Reset pagination saat filter data berubah
  useMemo(() => {
    setPdfCurrentPage(1);
    setExcelCurrentPage(1);
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  // Transaksi Terbayar
  const paidTransactions = useMemo(() => {
    return filteredData.filter(
      a => a.paymentStatus === 'PAID' || a.paymentStatus === 'DP_PAID'
    );
  }, [filteredData]);

  // Total Uang Masuk
  const totalCashIn = useMemo(() => {
    return paidTransactions.reduce((acc, a) => {
      if (a.paymentStatus === 'PAID') return acc + (a.totalAmount || 0);
      return acc + Math.ceil((a.totalAmount || 0) * 0.5);
    }, 0);
  }, [paidTransactions]);

  const avgPerSession = paidTransactions.length > 0 ? Math.round(totalCashIn / paidTransactions.length) : 0;

  // Tanggal terbit
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

  // =========================================================================
  // SISTEM PEMBAGIAN HALAMAN PDF A4 (CHUNKS)
  // =========================================================================
  // Halaman 1 memiliki Kop Surat Resmi & Judul -> kapasitas ideal: 10 transaksi
  // Halaman 2 dan seterusnya memiliki Kop Ringkas -> kapasitas ideal: 15 transaksi
  const pdfPages = useMemo(() => {
    if (filteredData.length === 0) {
      return [
        {
          pageNumber: 1,
          items: [] as Appointment[],
          startIndex: 0,
          isFirstPage: true,
          isLastPage: true
        }
      ];
    }

    const pages = [];
    const PAGE_1_CAPACITY = 10;
    const OTHER_PAGE_CAPACITY = 15;

    if (filteredData.length <= PAGE_1_CAPACITY) {
      pages.push({
        pageNumber: 1,
        items: filteredData,
        startIndex: 0,
        isFirstPage: true,
        isLastPage: true
      });
      return pages;
    }

    // Halaman 1
    pages.push({
      pageNumber: 1,
      items: filteredData.slice(0, PAGE_1_CAPACITY),
      startIndex: 0,
      isFirstPage: true,
      isLastPage: false
    });

    let currentIdx = PAGE_1_CAPACITY;
    let pageNum = 2;

    while (currentIdx < filteredData.length) {
      const nextIdx = currentIdx + OTHER_PAGE_CAPACITY;
      const slice = filteredData.slice(currentIdx, nextIdx);
      const isLast = nextIdx >= filteredData.length;

      pages.push({
        pageNumber: pageNum,
        items: slice,
        startIndex: currentIdx,
        isFirstPage: false,
        isLastPage: isLast
      });

      currentIdx = nextIdx;
      pageNum++;
    }

    return pages;
  }, [filteredData]);

  const pdfTotalPages = pdfPages.length;

  // Pastikan current page valid
  const safePdfPage = Math.min(Math.max(pdfCurrentPage, 1), pdfTotalPages);

  // =========================================================================
  // SISTEM PAGINATION PRATINJAU EXCEL
  // =========================================================================
  const excelTotalPages = Math.ceil(filteredData.length / EXCEL_PAGE_SIZE) || 1;
  const safeExcelPage = Math.min(Math.max(excelCurrentPage, 1), excelTotalPages);
  const excelPageData = useMemo(() => {
    const start = (safeExcelPage - 1) * EXCEL_PAGE_SIZE;
    return filteredData.slice(start, start + EXCEL_PAGE_SIZE);
  }, [filteredData, safeExcelPage]);

  // Download Berkas Excel Natively Compatible (.xls) (100% Seluruh Data)
  const handleDownloadExcel = () => {
    const rowsHtml = filteredData
      .map((a, idx) => {
        const isPaid = a.paymentStatus === 'PAID';
        const isDpPaid = a.paymentStatus === 'DP_PAID';
        const nominalMasuk = isPaid
          ? a.totalAmount
          : isDpPaid
          ? Math.ceil(a.totalAmount * 0.5)
          : 0;
        const skema = isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%';
        const status = isPaid ? 'Lunas Terverifikasi' : isDpPaid ? 'DP Diterima' : 'Verifikasi Bukti';

        return `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${a.date}</td>
            <td style="font-family: monospace;">${a.bookingCode}</td>
            <td><strong>${a.patientName}</strong></td>
            <td>${a.packageName}</td>
            <td>${skema}</td>
            <td style="text-align: right; mso-number-format: '\\Rp\\ #\\,##0';">${nominalMasuk}</td>
            <td style="text-align: center;">${status}</td>
          </tr>
        `;
      })
      .join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Arus Kas JiwaSehat</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <style>
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th { background-color: #107c41; color: #ffffff; font-weight: bold; border: 1px solid #0d5f32; padding: 10px 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; }
          .title { font-size: 16pt; font-weight: bold; color: #107c41; margin-bottom: 4px; }
          .subtitle { font-size: 10pt; color: #64748b; margin-bottom: 4px; }
          .meta { font-size: 9pt; color: #94a3b8; margin-bottom: 12px; }
          .total-row { background-color: #e6f4ea; font-weight: bold; border-top: 2px solid #107c41; border-bottom: 3px double #107c41; }
        </style>
      </head>
      <body>
        <div class="title">${clinicName.toUpperCase()}</div>
        <div class="subtitle">Laporan Resmi Arus Kas & Uang Masuk • Periode: ${getPeriodeLabel()}</div>
        <div class="meta">${doctorName} • SIP: ${sipNumber} • STR: ${strNumber} • Dicetak: ${printDateFormatted}</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th style="width: 100px;">Tanggal</th>
              <th style="width: 130px;">Kode Booking</th>
              <th style="width: 180px;">Nama Pasien</th>
              <th style="width: 180px;">Paket Konsultasi</th>
              <th style="width: 140px;">Skema Bayar</th>
              <th style="width: 150px; text-align: right;">Nominal Masuk (Rp)</th>
              <th style="width: 140px; text-align: center;">Status Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="6" style="text-align: right; padding-right: 12px;">TOTAL AKUMULASI UANG MASUK</td>
              <td style="text-align: right; mso-number-format: '\\Rp\\ #\\,##0'; font-size: 12pt;">${totalCashIn}</td>
              <td style="text-align: center;">${filteredData.length} Transaksi</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelTemplate], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Keuangan_JiwaSehat_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Unduh CSV Tradisional (100% Seluruh Data)
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
        `"${a.patientName}"`,
        `"${a.packageName}"`,
        `"${skema}"`,
        nominalMasuk,
        `"${status}"`
      ].join(',');
    });

    rows.push([
      '',
      '',
      '',
      '"TOTAL AKUMULASI"',
      '',
      '',
      totalCashIn,
      `"${filteredData.length} Transaksi"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `Laporan_Keuangan_JiwaSehat_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* STYLE KHUSUS PRINT A4 DENGAN PAGE-BREAK OTOMATIS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden, header, nav, footer, [data-no-print] {
            display: none !important;
          }
          .pdf-a4-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 0 20mm 0 !important;
            width: 100% !important;
            min-height: auto !important;
            display: block !important;
          }
          .pdf-a4-sheet:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
            margin-bottom: 0 !important;
          }
        }
      `}</style>

      {/* 1. TOP BAR NAVIGASI RUANG EKSPOR (PRINT HIDDEN) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Kembali ke Laporan Keuangan"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Laporan</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Ruang Cetak & Pratinjau Ekspor Keuangan
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                Live Preview
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Atur format dokumen resmi kop klinik (PDF) atau lembar kerja spreadsheet (Excel).
            </p>
          </div>
        </div>

        {/* Quick Action Preview Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="text-[11px] text-slate-400">Format Aktif:</span>
          <span
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              exportFormat === 'PDF'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {exportFormat === 'PDF' ? (
              <FileText className="w-3.5 h-3.5" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>{exportFormat === 'PDF' ? 'PDF Resmi Kop Klinik' : 'Excel Spreadsheet (.xls)'}</span>
          </span>
        </div>
      </div>

      {/* 2. DUA KOLOM: SIDEBAR PENGATURAN & FAQ (KIRI) VS WORKSPACE PRATINJAU (KANAN) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI: SIDEBAR PENGATURAN & FAQ (PRINT HIDDEN)                      */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-96 shrink-0 space-y-4 print:hidden">
          {/* Card A: Pilihan Format Ekspor */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 block">Pilih Format Pratinjau & Ekspor:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('PDF')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  exportFormat === 'PDF'
                    ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className={`w-5 h-5 ${exportFormat === 'PDF' ? 'text-rose-600' : 'text-slate-400'}`} />
                  {exportFormat === 'PDF' && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">PDF Resmi</div>
                  <div className="text-[10px] text-slate-500">Kop Surat Dinas A4</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('EXCEL')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  exportFormat === 'EXCEL'
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileSpreadsheet
                    className={`w-5 h-5 ${exportFormat === 'EXCEL' ? 'text-emerald-700' : 'text-slate-400'}`}
                  />
                  {exportFormat === 'EXCEL' && <Check className="w-4 h-4 text-emerald-700" />}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Excel Tabel</div>
                  <div className="text-[10px] text-slate-500">Workbook (.xls / .xlsx)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card B: Filter Rentang Tanggal Data */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Rentang Waktu Transaksi:</span>
              </label>
            </div>

            {/* Segmented Mode Selector */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('MONTH_YEAR')}
                className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  filterMode === 'MONTH_YEAR'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan/Tahun
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('DATE_RANGE')}
                className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  filterMode === 'DATE_RANGE'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rentang
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Data
              </button>
            </div>

            {/* Filter Inputs Berdasarkan Mode */}
            {filterMode === 'MONTH_YEAR' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Bulan:</label>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Tahun:</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  >
                    {YEAR_OPTIONS.map(y => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {filterMode === 'DATE_RANGE' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Mulai Dari:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Sampai:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {filterMode === 'ALL' && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
                Menangkap seluruh mutasi arus kas dari awal klinik beroperasi.
              </div>
            )}
          </div>

          {/* Card C: Ringkasan Metrik & Tombol Eksekusi Aksi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Data Transaksi:</span>
                <strong className="text-slate-900">{filteredData.length} baris</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Akumulasi Uang Masuk:</span>
                <strong className="text-emerald-700 font-black">
                  Rp {totalCashIn.toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rata-rata per Sesi:</span>
                <strong className="text-slate-800">Rp {avgPerSession.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Tombol Eksekusi Berdasarkan Format yang Dipilih */}
            {exportFormat === 'PDF' ? (
              <button
                type="button"
                onClick={handlePrintDocument}
                className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Printer className="w-4 h-4 text-teal-300" />
                <span>Cetak Dokumen Resmi / Simpan PDF</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Download Berkas Excel (.xls)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Format Mentah CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Card D: FAQ & Panduan Cara Mencetak & Ekspor */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-black text-slate-900">FAQ & Panduan Ekspor</h3>
            </div>

            <div className="space-y-1.5">
              {PRINT_FAQS.map(faq => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-all bg-slate-50/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-2.5 text-left flex items-center justify-between gap-2 text-[11px] font-bold text-slate-800 hover:text-teal-800 transition-colors cursor-pointer"
                    >
                      <span className="leading-snug">{faq.question}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-teal-700' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-2.5 pb-2.5 pt-0.5 text-[11px] text-slate-600 font-medium leading-relaxed border-t border-slate-200/60 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: WORKSPACE PRATINJAU INTERAKTIF                               */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {exportFormat === 'PDF' ? (
            /* =================================================================== */
            /* PRATINJAU PDF BER-KOP SURAT RESMI DINAS DENGAN PAGINATION A4        */
            /* =================================================================== */
            <div className="space-y-4">
              {/* Toolbar Navigasi Halaman Dokumen A4 (Print Hidden) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lembar Kertas A4</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Total: <strong className="text-slate-800">{pdfTotalPages} Halaman</strong> (
                    {filteredData.length} Transaksi)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Tampilan: Single Sheet vs All Sheets */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPdfViewMode('SINGLE')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        pdfViewMode === 'SINGLE'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Per Halaman</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfViewMode('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        pdfViewMode === 'ALL'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Semua Halaman</span>
                    </button>
                  </div>

                  {/* Navigasi Next/Prev Page (hanya aktif di mode SINGLE) */}
                  {pdfViewMode === 'SINGLE' && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPdfCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={safePdfPage <= 1}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-bold text-slate-800 px-2">
                        {safePdfPage} / {pdfTotalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => setPdfCurrentPage(prev => Math.min(prev + 1, pdfTotalPages))}
                        disabled={safePdfPage >= pdfTotalPages}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Halaman Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RENDER LEMBARAN A4 (DI LAYAR & PRINT) */}
              <div className="space-y-6 print:space-y-0">
                {pdfPages.map((page, pageIdx) => {
                  const isVisibleOnScreen =
                    pdfViewMode === 'ALL' || page.pageNumber === safePdfPage;

                  return (
                    <div
                      key={page.pageNumber}
                      className={`pdf-a4-sheet bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md max-w-4xl mx-auto transition-all ${
                        isVisibleOnScreen ? 'block' : 'hidden print:block'
                      }`}
                      style={{ minHeight: '840px' }}
                    >
                      {/* HEADER KOP SURAT */}
                      {page.isFirstPage ? (
                        /* Halaman 1: KOP SURAT LENGKAP DINAS DARI CMS */
                        <div className="border-b-4 border-double border-slate-900 pb-4 mb-5 text-center relative">
                          <div className="flex items-center justify-center gap-3 mb-1">
                            <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-xl shadow-xs">
                              JS
                            </div>
                            <div className="text-left">
                              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                {clinicName}
                              </h2>
                              <span className="text-xs font-bold text-teal-800 block mt-0.5">
                                {doctorName}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-600 font-medium space-y-0.5 mt-2">
                            <p>
                              SIP: <strong>{sipNumber}</strong> • STR: <strong>{strNumber}</strong>
                            </p>
                            <p>
                              {clinicAddress} • Telp: {clinicPhone}
                            </p>
                            <p>
                              Email: {clinicEmail} • Website Resmi: {clinicWebsite}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Halaman 2+: KOP SAMBUNGAN RINGKAS */
                        <div className="border-b-2 border-slate-800 pb-2 mb-4 flex items-center justify-between text-xs font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-teal-800 text-white text-[10px] font-black flex items-center justify-center">
                              JS
                            </span>
                            <span className="uppercase text-[11px]">{clinicName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            Laporan Arus Kas (Sambungan Hal. {page.pageNumber})
                          </span>
                        </div>
                      )}

                      {/* JUDUL DOKUMEN & PERIODE (HANYA HALAMAN 1) */}
                      {page.isFirstPage && (
                        <div className="text-center my-4 space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase underline">
                            Laporan Resmi Arus Kas & Uang Masuk Praktik
                          </h3>
                          <p className="text-xs font-semibold text-slate-600">
                            Periode Laporan: <strong>{getPeriodeLabel()}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Dokumen dicetak secara resmi pada sistem JiwaSehat per {printDateFormatted}
                          </p>
                        </div>
                      )}

                      {/* TABEL DATA PADA LEMBAR INI */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-300">
                          <thead className="bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border-b border-slate-300">
                            <tr>
                              <th className="py-2 px-2.5 border-r border-slate-300 text-center w-10">No</th>
                              <th className="py-2 px-2.5 border-r border-slate-300">Tanggal</th>
                              <th className="py-2 px-2.5 border-r border-slate-300">Kode Booking</th>
                              <th className="py-2 px-2.5 border-r border-slate-300">Nama Pasien</th>
                              <th className="py-2 px-2.5 border-r border-slate-300">Layanan Konsultasi</th>
                              <th className="py-2 px-2.5 border-r border-slate-300">Skema Bayar</th>
                              <th className="py-2 px-2.5 text-right">Nominal Masuk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {page.items.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                                  Tidak ada mutasi transaksi pada kriteria filter ini.
                                </td>
                              </tr>
                            ) : (
                              page.items.map((item, index) => {
                                const isPaid = item.paymentStatus === 'PAID';
                                const isDpPaid = item.paymentStatus === 'DP_PAID';
                                const nominalMasuk = isPaid
                                  ? item.totalAmount
                                  : isDpPaid
                                  ? Math.ceil(item.totalAmount * 0.5)
                                  : 0;
                                const skema = isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%';

                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/60">
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 text-center text-slate-500 font-medium">
                                      {page.startIndex + index + 1}
                                    </td>
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">
                                      {item.date}
                                    </td>
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                                      {item.bookingCode}
                                    </td>
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 font-bold text-slate-800">
                                      {item.patientName}
                                    </td>
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 text-slate-700">
                                      {item.packageName}
                                    </td>
                                    <td className="py-1.5 px-2.5 border-r border-slate-200 text-slate-600 font-medium">
                                      {skema}
                                    </td>
                                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                      Rp {nominalMasuk.toLocaleString('id-ID')}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>

                          {/* BARIS TOTAL AKUMULASI HANYA PADA HALAMAN TERAKHIR */}
                          {page.isLastPage && (
                            <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-400 text-slate-900">
                              <tr>
                                <td colSpan={6} className="py-2 px-2.5 text-right border-r border-slate-300">
                                  TOTAL AKUMULASI DANA MASUK ({filteredData.length} Transaksi)
                                </td>
                                <td className="py-2 px-2.5 text-right font-black text-sm text-emerald-800 whitespace-nowrap">
                                  Rp {totalCashIn.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      {/* BLOK TANDA TANGAN LEGALITAS (HANYA PADA HALAMAN TERAKHIR) */}
                      {page.isLastPage && (
                        <div className="pt-8 flex justify-between items-end text-xs">
                          <div className="text-[10px] text-slate-400 leading-relaxed">
                            Dokumen resmi internal {clinicName}.
                            <br />
                            Dicetak pada: {printDateFormatted} WIB.
                          </div>

                          <div className="text-center w-60 space-y-10">
                            <div>
                              <span className="text-[11px] text-slate-600 block">
                                {clinicCity}, {printDateFormatted}
                              </span>
                              <span className="text-[11px] font-bold text-slate-800 block">
                                {signerRole}
                              </span>
                            </div>
                            <div>
                              <div className="font-black text-slate-900 underline text-xs">
                                {doctorName}
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                SIP: {sipNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FOOTER LEMBAR RESMI: NOMOR HALAMAN */}
                      <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>{clinicName} • Laporan Arus Kas</span>
                        <span className="font-bold text-slate-600">
                          Halaman {page.pageNumber} dari {pdfTotalPages}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* PRATINJAU EXCEL SPREADSHEET DENGAN PAGINATION RINGKAS               */
            /* =================================================================== */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
              {/* Excel Header Bar */}
              <div className="bg-[#107c41] text-white p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight">
                      Laporan_Arus_Kas_JiwaSehat.xlsx - Microsoft Excel
                    </div>
                    <div className="text-[10px] text-emerald-100 font-medium">
                      Worksheet: Sheet1 (Mutasi Arus Kas) • {filteredData.length} Total Transaksi
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="px-3.5 py-1.5 bg-white text-[#107c41] hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Berkas .xls (100% Data)</span>
                </button>
              </div>

              {/* Excel Mini Ribbon / Formula Info */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    fx
                  </span>
                  <span className="text-slate-600 font-medium truncate">
                    =SUM(G2:G{filteredData.length + 1}) → Rp {totalCashIn.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Info Baris & Navigasi Pagination Excel */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">
                    Baris {(safeExcelPage - 1) * EXCEL_PAGE_SIZE + 1} -{' '}
                    {Math.min(safeExcelPage * EXCEL_PAGE_SIZE, filteredData.length)} dari{' '}
                    <strong>{filteredData.length} baris</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setExcelCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={safeExcelPage <= 1}
                      className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Baris Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold px-1.5 text-slate-700">
                      {safeExcelPage} / {excelTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExcelCurrentPage(prev => Math.min(prev + 1, excelTotalPages))}
                      disabled={safeExcelPage >= excelTotalPages}
                      className="p-1 rounded bg-white hover:bg-slate-200 border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Baris Selanjutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Excel Table Viewer (10 Baris per Lembar Pratinjau) */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-[#107c41] text-white font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3 border border-emerald-800 text-center w-12">A (No)</th>
                      <th className="py-2 px-3 border border-emerald-800">B (Tanggal)</th>
                      <th className="py-2 px-3 border border-emerald-800">C (Kode Booking)</th>
                      <th className="py-2 px-3 border border-emerald-800">D (Nama Pasien)</th>
                      <th className="py-2 px-3 border border-emerald-800">E (Layanan Konsultasi)</th>
                      <th className="py-2 px-3 border border-emerald-800">F (Skema Bayar)</th>
                      <th className="py-2 px-3 border border-emerald-800 text-right">G (Nominal Masuk)</th>
                      <th className="py-2 px-3 border border-emerald-800 text-center">H (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {excelPageData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 italic text-xs">
                          Tidak ada data yang ditemukan untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      excelPageData.map((item, idx) => {
                        const isPaid = item.paymentStatus === 'PAID';
                        const isDpPaid = item.paymentStatus === 'DP_PAID';
                        const nominalMasuk = isPaid
                          ? item.totalAmount
                          : isDpPaid
                          ? Math.ceil(item.totalAmount * 0.5)
                          : 0;
                        const skema = isPaid ? 'Lunas (100%)' : isDpPaid ? 'DP (50%)' : 'Menunggu DP 50%';
                        const status = isPaid ? 'Lunas' : isDpPaid ? 'DP Diterima' : 'Verifikasi';

                        return (
                          <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="py-1.5 px-3 border border-slate-200 text-center text-slate-400">
                              {(safeExcelPage - 1) * EXCEL_PAGE_SIZE + idx + 1}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 text-slate-800 whitespace-nowrap">
                              {item.date}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                              {item.bookingCode}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 font-bold text-slate-800">
                              {item.patientName}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 text-slate-700">
                              {item.packageName}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 text-slate-600">
                              {skema}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 text-right font-bold text-slate-900 whitespace-nowrap">
                              Rp {nominalMasuk.toLocaleString('id-ID')}
                            </td>
                            <td className="py-1.5 px-3 border border-slate-200 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-[#e6f4ea] font-bold border-t-2 border-[#107c41] text-slate-900">
                    <tr>
                      <td colSpan={6} className="py-2.5 px-3 text-right border border-emerald-300 text-xs">
                        TOTAL AKUMULASI (FORMULA SUM 100% DATA)
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-sm text-emerald-900 border border-emerald-300 whitespace-nowrap">
                        Rp {totalCashIn.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center border border-emerald-300 text-[11px]">
                        {filteredData.length} Baris Total
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Bottom Sheet Tab Bar & Export Hint */}
              <div className="bg-slate-100 border-t border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="px-3 py-1 bg-white border border-slate-300 rounded-t-lg font-bold text-emerald-800 text-[11px] shadow-2xs">
                    📗 Sheet1 (Mutasi Arus Kas)
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center text-slate-400 font-bold">
                    +
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Pratinjau dibatasi 10 baris per halaman • Tombol <strong>Download Berkas .xls</strong> di atas mengekspor 100% seluruh {filteredData.length} data.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
