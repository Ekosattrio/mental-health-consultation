import React from 'react';
import { Appointment } from '../../types';

const auditTime = (value: string) => {
  if (!/(?:Z|[+-]\d\d:\d\d)$/.test(value)) return value;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? `${date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB` : value;
};

export const RescheduleAudit: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  if (!appointment.rescheduleHistory?.length && !appointment.rescheduledAt) return null;
  return <section className="border-t border-sky-200 pt-3 text-xs leading-5 text-slate-700" aria-label="Riwayat perubahan jadwal">
    <h4 className="mb-2 font-bold text-sky-800">Riwayat Reschedule</h4>
    {appointment.rescheduleHistory?.length ? <ol className="space-y-3 border-l-2 border-sky-200 pl-3">
      {appointment.rescheduleHistory.map((event, index) => <li key={`${event.at}-${index}`} className="break-words">
        <p className="font-semibold">{event.actorName} ({event.actorRole})</p>
        {event.origin && <p className="text-slate-500">Asal: {event.origin === 'PATIENT' ? 'Permintaan pasien' : event.origin === 'CLINIC' ? 'Klinik' : 'Psikolog'}</p>}
        <p>{event.fromDate}, {event.fromStartTime} - {event.fromEndTime} WIB</p>
        <p className="font-medium text-sky-800">Menjadi {event.toDate}, {event.toStartTime} - {event.toEndTime} WIB</p>
        <p className="whitespace-pre-line">{event.reason}</p>
        <p className="text-[11px] text-slate-500">{auditTime(event.at)}</p>
      </li>)}
    </ol> : <><p>Diubah oleh {appointment.rescheduledByName || '-'} ({appointment.rescheduledByRole || '-'}) pada {auditTime(appointment.rescheduledAt!)}</p><p>{appointment.rescheduleReason || 'Tanpa catatan tambahan.'}</p></>}
  </section>;
};
