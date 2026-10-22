import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Tooltip } from '../../common/Tooltip';

export const RescheduleRequestsTab: React.FC = () => {
  const { appointments, reviewPatientReschedule } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const pending = appointments.filter(item => item.rescheduleRequest?.status === 'REQUESTED');
  const decide = async (id: string, requestId: string, approve: boolean) => {
    setBusy(id);
    try { await reviewPatientReschedule(id, requestId, approve, reasons[id]); }
    finally { setBusy(null); }
  };
  return <section className="min-w-0 space-y-4">
    <h2 className="text-xl font-bold text-slate-900">Pengajuan Reschedule <span className="text-sm text-slate-500">({pending.length})</span></h2>
    {!pending.length && <p className="border-y border-slate-200 py-8 text-sm text-slate-500">Tidak ada pengajuan menunggu.</p>}
    {pending.map(appointment => {
      const request = appointment.rescheduleRequest!;
      return <article key={request.id} className="min-w-0 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap justify-between gap-2"><strong>{appointment.patientName}</strong><span className="break-all text-xs text-slate-500">{appointment.bookingCode}</span></div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Jadwal Aktif</dt><dd>{appointment.date}, {appointment.startTime} - {appointment.endTime} WIB</dd></div>
          <div><dt className="text-xs text-slate-500">Usulan Pasien</dt><dd>{request.date}, {request.startTime} - {request.endTime} WIB</dd></div>
        </dl>
        <p className="break-words text-sm text-slate-600">{request.reason}</p>
        <div className="flex items-end gap-2">
          <label className="min-w-0 flex-1 text-xs font-semibold text-slate-600">Alasan Penolakan
            <input value={reasons[appointment.id] || ''} onChange={event => setReasons(current => ({ ...current, [appointment.id]: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <Tooltip content="Tolak pengajuan"><button type="button" aria-label="Tolak pengajuan" disabled={busy !== null || !reasons[appointment.id]?.trim()} onClick={() => void decide(appointment.id, request.id, false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-700 disabled:opacity-40"><X className="h-4 w-4" /></button></Tooltip>
          <Tooltip content="Setujui dan periksa slot"><button type="button" aria-label="Setujui dan periksa slot" disabled={busy !== null} onClick={() => void decide(appointment.id, request.id, true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 disabled:opacity-40"><Check className="h-4 w-4" /></button></Tooltip>
        </div>
      </article>;
    })}
  </section>;
};
