import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Printer, X, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export interface PrintColumn<T = any> {
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface OfficialPrintModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentSubtitle?: string;
  periodLabel?: string;
  columns: PrintColumn<T>[];
  data: T[];
  summaryNode?: React.ReactNode;
  signerTitle?: string;
}

export const OfficialPrintModal: React.FC<OfficialPrintModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentSubtitle,
  periodLabel,
  columns,
  data,
  summaryNode,
  signerTitle
}) => {
  const { psychologistCms } = useApp();

  if (!isOpen) return null;

  // Konfigurasi Kop Surat Resmi dari CMS
  const clinicName = psychologistCms?.letterheadClinicName || 'Praktik Mandiri Psikolog Klinis JiwaSehat';
  const doctorName = psychologistCms?.letterheadDoctorName || 'dr. Sarah Jenkins, M.Psi., Psikolog';
  const sipNumber = psychologistCms?.letterheadSipNumber || 'SIP.503/042-DPMPTSP/2022';
  const strNumber = psychologistCms?.letterheadStrNumber || 'STR-PSI-2021-09842';
  const clinicAddress = psychologistCms?.letterheadAddress || 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190';
  const clinicPhone = psychologistCms?.letterheadPhone || '(021) 7890-1234';
  const clinicEmail = psychologistCms?.letterheadEmail || 'klinik@jiwasehat.id';

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      {/* Container Preview Dialog */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar (Modern Simple Light - Screen Only) */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pratinjau Cetak Dokumen Resmi</h3>
              <p className="text-xs text-slate-500">Standar Kop Surat Resmi Praktik & Tabel A4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 Preview) */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible custom-scrollbar">
          {/* 1. KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shrink-0 print:border print:border-slate-800">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                    {clinicName}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-teal-800">
                    {doctorName}
                  </h2>
                  <div className="text-[11px] text-slate-600 font-semibold space-x-2 mt-0.5">
                    <span>{sipNumber}</span>
                    <span>•</span>
                    <span>{strNumber}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {clinicAddress} • Telp: {clinicPhone} • Email: {clinicEmail}
                  </p>
                </div>
              </div>
            </div>
            {/* Garis Ganda Standar Surat Dinas */}
            <div className="mt-3 border-t-2 border-slate-900 pt-0.5">
              <div className="border-t border-slate-900" />
            </div>
          </div>

          {/* 2. JUDUL DOKUMEN */}
          <div className="text-center my-6 space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
              {documentTitle}
            </h2>
            {documentSubtitle && (
              <p className="text-xs text-slate-600 font-medium">
                {documentSubtitle}
              </p>
            )}
            {periodLabel && (
              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 mt-1">
                {periodLabel}
              </div>
            )}
          </div>

          {/* 3. TABEL DATA */}
          <div className="mb-6 border border-slate-300 rounded-xl overflow-hidden print:rounded-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase">
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className={`py-2.5 px-3 border-r border-slate-300 last:border-r-0 ${col.headerClassName || ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-6 text-center text-slate-400 italic">
                      Tidak ada data yang tersedia untuk dicetak.
                    </td>
                  </tr>
                ) : (
                  data.map((item, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50">
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className={`py-2 px-3 border-r border-slate-200 last:border-r-0 ${col.className || ''}`}
                        >
                          {col.accessor(item, rowIdx)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 4. SUMMARY KEUANGAN / AGREGAT (OPSIONAL) */}
          {summaryNode && (
            <div className="mb-8">
              {summaryNode}
            </div>
          )}

          {/* 5. TANDA TANGAN PENANGGUNG JAWAB RESMI */}
          <div className="pt-6 flex justify-end">
            <div className="w-64 text-center text-xs space-y-1">
              <p className="text-slate-600">Jakarta Selatan, {todayFormatted}</p>
              <p className="text-slate-800 font-bold">
                {signerTitle || 'Penanggung Jawab Pelayanan Klinis'}
              </p>

              {/* Ruang Tanda Tangan */}
              <div className="h-20 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Cap Klinik]</span>
              </div>

              <div className="border-t border-slate-400 pt-1">
                <p className="font-bold text-slate-900 underline text-sm">{doctorName}</p>
                <p className="text-[11px] text-slate-600 font-semibold">{sipNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
