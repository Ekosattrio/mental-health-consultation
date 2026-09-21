import React, { useState, useMemo } from 'react';
import { Appointment } from '../../../types';
import { Search } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pengawasan Reservasi & Status Transaksi</h3>
            <p className="text-xs text-slate-500">
              Pantau seluruh janji temu antara pasien dan psikolog secara transparan.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              Menampilkan {filteredAppointments.length} dari {appointments.length} Reservasi
            </span>
          </div>
        </div>

        {/* Filter & Search for Appointments */}
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

          {/* Status Filter */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(st => (
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
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Psikolog</th>
                <th className="py-3 px-4">Paket & Biaya</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Status Sesi</th>
                <th className="py-3 px-4 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan reservasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">{apt.psychologistName.split(',')[0]}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{apt.packageName}</div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Rp {apt.totalAmount.toLocaleString('id-ID')} ({apt.paymentStatus})
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {apt.status !== 'COMPLETED' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        {apt.status !== 'CANCELLED' && (
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

