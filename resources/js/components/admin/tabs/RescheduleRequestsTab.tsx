import React, { useState } from 'react';
import { Check, X, CalendarClock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Tooltip } from '../../common/Tooltip';

export const RescheduleRequestsTab: React.FC = () => {
  const { appointments, reviewPatientReschedule, reopenPatientReschedule } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const pending = appointments.filter(item => ['REQUESTED', 'SLOT_SELECTION_REQUIRED'].includes(item.rescheduleRequest?.status || ''));
  const decide = async (id: string, requestId: string, revision: number, action: 'APPROVE' | 'REJECT' | 'RESELECT') => {
    setBusy(id);
    setError('');
    try {
      if (action === 'RESELECT') {
        await reopenPatientReschedule(id, requestId, reasons[id]?.trim() || 'Silakan pilih ulang slot pengganti. Jadwal aktif tetap berlaku.', revision);
      } else {
        await reviewPatientReschedule(id, requestId, action === 'APPROVE', reasons[id], revision);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pengajuan gagal diproses.'); }
    finally { setBusy(null); }
  };
  return <section className="min-w-0 space-y-4">
    <h2 className="text-xl font-bold text-slate-900">Pengajuan Reschedule <span className="text-sm text-slate-500">({pending.length})</span></h2>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
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
        <p className="text-xs text-slate-500">Diajukan: {new Date(request.requestedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>
        {request.status === 'SLOT_SELECTION_REQUIRED' ? <p className="break-words text-sm text-amber-800">Menunggu pasien memilih ulang slot. {request.decisionReason}</p> : <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 basis-full text-xs font-semibold text-slate-600 sm:flex-1 sm:basis-auto">Catatan / Alasan Penolakan
            <input value={reasons[appointment.id] || ''} onChange={event => setReasons(current => ({ ...current, [appointment.id]: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <Tooltip content="Minta pasien memilih ulang slot"><button type="button" aria-label="Minta pasien memilih ulang slot" disabled={busy !== null} onClick={() => void decide(appointment.id, request.id, request.revision || 0, 'RESELECT')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-200 text-amber-800 disabled:opacity-40"><CalendarClock className="h-4 w-4" /></button></Tooltip>
          <Tooltip content="Tolak pengajuan"><button type="button" aria-label="Tolak pengajuan" disabled={busy !== null || !reasons[appointment.id]?.trim()} onClick={() => void decide(appointment.id, request.id, request.revision || 0, 'REJECT')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-700 disabled:opacity-40"><X className="h-4 w-4" /></button></Tooltip>
          <Tooltip content="Setujui dan periksa slot"><button type="button" aria-label="Setujui dan periksa slot" disabled={busy !== null} onClick={() => void decide(appointment.id, request.id, request.revision || 0, 'APPROVE')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 disabled:opacity-40"><Check className="h-4 w-4" /></button></Tooltip>
        </div>}
      </article>;
    })}
  </section>;
};
