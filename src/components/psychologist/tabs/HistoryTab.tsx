import React from 'react';
import { Appointment } from '../../../types';

interface HistoryTabProps {
  myAppointments: Appointment[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ myAppointments }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Rekap Histori Seluruh Sesi Konseling</h3>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Paket Layanan</th>
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan Medis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat sesi konseling.
                  </td>
                </tr>
              ) : (
                myAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{apt.packageName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {apt.date} ({apt.startTime} - {apt.endTime})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'COMPLETED'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {apt.clinicalNotesId ? (
                        <span className="text-emerald-700 font-bold">Tersimpan (SOAP)</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Belum Ditulis</span>
                      )}
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

