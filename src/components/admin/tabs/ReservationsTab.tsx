import React, { useMemo, useState } from 'react';
import { Appointment } from '../../../types';
import { CalendarPlus, Search, Download, Printer } from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface ReservationsTabProps {
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: any) => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  appointments,
  updateAppointmentStatus
}) => {
  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState('ALL');

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const q = resSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.psychologistName.toLowerCase().includes(q);
      const matchesStatus = resStatusFilter === 'ALL' || apt.status === resStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, resSearchQuery, resStatusFilter]);

  const handleExportCsv = () => {
    const headers = ['Kode Booking', 'Pasien', 'Psikolog', 'Paket', 'Tanggal', 'Jam', 'Tipe', 'Status', 'Pembayaran', 'Total (Rp)'];
    const rows = filteredAppointments.map(a => [
      `"${a.bookingCode}"`,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.psychologistName.replace(/"/g, '""')}"`,
      `"${a.packageName.replace(/"/g, '""')}"`,
      `"${a.date}"`,
      `"${a.startTime} - ${a.endTime}"`,
      `"${a.packageType}"`,
      `"${a.status}"`,
      `"${a.paymentStatus}"`,
      a.totalAmount || 0
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Reservasi_JiwaSehat_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking, Verifikasi DP, dan Bantuan Reschedule</h3>
            <p className="text-xs text-slate-500">
              Admin memantau booking, memverifikasi bukti pembayaran, mengubah status, dan membantu pasien walk-in atau reschedule.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              {filteredAppointments.length} dari {appointments.length} booking
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong className="block mb-1">Verifikasi DP 50%</strong>
            Pending booking hanya boleh confirmed setelah bukti DP valid.
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong className="block mb-1">Bantuan Booking Walk-in</strong>
            Admin dapat membookingkan pasien yang datang langsung.
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
            <strong className="block mb-1">Request Reschedule</strong>
            Reschedule tetap minimal H+1 dan mengikuti slot psikolog.
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Buat Booking Pasien Langsung
          </button>

          <div className="flex items-center gap-1.5">
            <Tooltip content="Download Data CSV Reservasi" position="bottom">
              <button
                type="button"
                onClick={handleExportCsv}
                aria-label="Download Data CSV Reservasi"
                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-700" />
              </button>
            </Tooltip>

            <Tooltip content="Cetak Jadwal Reservasi" position="bottom">
              <button
                type="button"
                onClick={handlePrint}
                aria-label="Cetak Jadwal Reservasi"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-700" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={resSearchQuery}
              onChange={e => setResSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama pasien, atau psikolog..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 overflow-x-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => (
              <button
                key={st}
                onClick={() => setResStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  resStatusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Psikolog</th>
                <th className="py-3 px-4">Paket</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan reservasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">{apt.psychologistName.split(',')[0]}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{apt.packageName}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Rp {apt.totalAmount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {apt.date} {apt.startTime}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'COMPLETED'
                            ? 'bg-slate-200 text-slate-800'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.paymentStatus === 'DP_PENDING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-800'
                            : apt.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {apt.paymentStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">DP 50% + pelunasan setelah sesi</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {apt.status === 'PENDING' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Verifikasi & Confirm
                          </button>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                          <button
                            className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Bantu Reschedule
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
