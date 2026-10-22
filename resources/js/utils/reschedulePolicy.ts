import { Appointment, User } from '../types';
import { createRecordId, getPracticeDate, isValidBookingDate } from './bookingPolicy';

type RescheduleActor = Pick<User, 'id' | 'name' | 'role'>;
export type RescheduleOrigin = 'PATIENT' | 'CLINIC' | 'OWNER';
export interface RescheduleOptions {
  origin?: RescheduleOrigin;
  requestId?: string;
  requestRevision?: number;
}

export const isOpenRescheduleRequest = (appointment: Appointment): boolean =>
  ['REQUESTED', 'SLOT_SELECTION_REQUIRED'].includes(appointment.rescheduleRequest?.status || '');

export const assertRequestRevision = (appointment: Appointment, expected?: number): void => {
  if (!Number.isInteger(expected) || expected !== (appointment.rescheduleRequest?.revision || 0)) {
    throw new Error('Pengajuan sudah berubah. Periksa usulan terbaru.');
  }
};

export const getScheduleVersion = (appointment: Appointment): number =>
  appointment.scheduleVersion ?? appointment.rescheduleHistory?.length ?? 0;

export const assertScheduleVersion = (appointment: Appointment, expectedVersion?: number): void => {
  if (!Number.isInteger(expectedVersion) || expectedVersion !== getScheduleVersion(appointment)) {
    throw new Error('Jadwal sudah berubah. Tutup formulir dan periksa jadwal terbaru sebelum memilih ulang.');
  }
};

export const getPatientRescheduleCount = (appointment: Appointment): number =>
  (appointment.rescheduleHistory || []).filter(event => event.origin === 'PATIENT' || (!event.origin && event.actorRole === 'PATIENT')).length;

export const canRescheduleAppointment = (appointment: Appointment, actor: RescheduleActor, now = new Date()): boolean => {
  if (!Number.isFinite(now.getTime())) return false;
  if (['COMPLETED', 'DISCONTINUED'].includes(appointment.treatmentPlanStatus || '')) return false;
  if (actor.role === 'PATIENT' && appointment.patientId !== actor.id) return false;
  if (actor.role === 'PSYCHOLOGIST' && appointment.psychologistId !== actor.id) return false;
  if (!['PATIENT', 'ADMIN', 'PSYCHOLOGIST'].includes(actor.role)) return false;
  if (actor.role === 'PATIENT') {
    if (getPatientRescheduleCount(appointment) >= 3 || appointment.rescheduleRequest?.status === 'REQUESTED') return false;
    if (appointment.rescheduleRequest?.status === 'SLOT_SELECTION_REQUIRED') {
      const request = appointment.rescheduleRequest;
      return request.expectedScheduleVersion === getScheduleVersion(appointment) &&
        canRescheduleAppointment({ ...appointment, rescheduleRequest: undefined }, actor, new Date(request.requestedAt));
    }
    const start = new Date(`${appointment.date}T${appointment.startTime}:00+07:00`).getTime();
    if (!Number.isFinite(start)) return false;
    if (appointment.status === 'NO_SHOW') {
      const endOfWindow = new Date(`${appointment.date}T00:00:00+07:00`).getTime() + 5 * 86400000;
      if (now.getTime() >= endOfWindow) return false;
    } else if (now.getTime() >= start - 2 * 3600000) return false;
  }
  if (appointment.status === 'NO_SHOW') {
    return appointment.initialRequirementMet === true || ['DP_PAID', 'PAID'].includes(appointment.paymentStatus);
  }
  return ['PENDING', 'CONFIRMED'].includes(appointment.status);
};

export const rescheduleExistingAppointment = (
  appointment: Appointment,
  actor: RescheduleActor,
  date: string,
  startTime: string,
  endTime: string,
  reason: string,
  now = new Date(),
  requestedOrigin?: RescheduleOrigin
): Appointment => {
  if (!canRescheduleAppointment(appointment, actor, now)) throw new Error('Status, batas waktu, kuota, atau kepemilikan booking tidak mengizinkan reschedule.');
  if (!reason.trim()) throw new Error('Alasan perubahan jadwal wajib diisi.');
  const origin = requestedOrigin ?? (actor.role === 'PATIENT' ? 'PATIENT' : actor.role === 'PSYCHOLOGIST' ? 'OWNER' : undefined);
  if (!origin || !['PATIENT', 'CLINIC', 'OWNER'].includes(origin) || (actor.role === 'PATIENT' && origin !== 'PATIENT') ||
    (origin === 'OWNER' && actor.role !== 'PSYCHOLOGIST') || (origin === 'CLINIC' && actor.role !== 'ADMIN')) {
    throw new Error('Pilih asal perubahan jadwal sesuai kewenangan.');
  }
  if (origin === 'PATIENT' && actor.role !== 'PATIENT' &&
    (isOpenRescheduleRequest(appointment) || !canRescheduleAppointment(appointment, { ...actor, id: appointment.patientId, role: 'PATIENT' }, now))) {
    throw new Error('Permintaan pasien melewati kuota/batas waktu atau masih memiliki pengajuan aktif.');
  }
  if (!isValidBookingDate(date) || date <= getPracticeDate(now)) throw new Error('Tanggal pengganti wajib minimal H+1.');
  if (date === appointment.date && startTime === appointment.startTime && endTime === appointment.endTime) {
    throw new Error('Pilih jadwal berbeda dari jadwal aktif.');
  }
  const minutes = (time: string) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  const duration = minutes(endTime) - minutes(startTime);
  if (!Number.isFinite(duration) || duration <= 0 ||
      duration !== minutes(appointment.endTime) - minutes(appointment.startTime)) {
    throw new Error('Reschedule wajib mempertahankan durasi sesi semula.');
  }

  const at = now.toISOString();
  const status = appointment.status === 'NO_SHOW' ? 'CONFIRMED'
    : actor.role === 'PATIENT' ? 'PENDING' : appointment.status;

  // Move the same session; never create another quota, charge, or payment record.
  return {
    ...appointment,
    date, startTime, endTime, status,
    rescheduleRequest: isOpenRescheduleRequest(appointment) ? {
      ...appointment.rescheduleRequest!, status: 'REJECTED', decidedAt: at, decidedByName: actor.name,
      decisionReason: 'Jadwal diperbarui petugas; periksa jadwal terbaru.'
    } : appointment.rescheduleRequest,
    scheduleVersion: getScheduleVersion(appointment) + 1,
    ...(appointment.status === 'NO_SHOW' ? { scheduleConfirmedAt: at, scheduleConfirmedByName: actor.name } : {}),
    statusHistory: status === appointment.status ? appointment.statusHistory : [...(appointment.statusHistory || []), {
      from: appointment.status, to: status, at, actorId: actor.id, actorName: actor.name, reason: reason.trim()
    }],
    rescheduledAt: at,
    rescheduledByName: actor.name,
    rescheduledByRole: actor.role,
    rescheduleReason: reason.trim(),
    rescheduleHistory: [...(appointment.rescheduleHistory || []), {
      fromDate: appointment.date, fromStartTime: appointment.startTime, fromEndTime: appointment.endTime,
      toDate: date, toStartTime: startTime, toEndTime: endTime,
      at, actorId: actor.id, actorName: actor.name, actorRole: actor.role,
      origin, reason: reason.trim()
    }]
  };
};

export const requestPatientReschedule = (appointment: Appointment, actor: RescheduleActor,
  date: string, startTime: string, endTime: string, reason: string, now = new Date(), expectedRequestRevision?: number): Appointment => {
  if (actor.role !== 'PATIENT' || !canRescheduleAppointment(appointment, actor, now)) {
    throw new Error('Pengajuan tidak tersedia: periksa batas tiga kali, H-2 jam, atau empat hari setelah no-show.');
  }
  // Validasi tujuan/durasi yang sama, tanpa memindahkan slot atau mengurangi kuota.
  rescheduleExistingAppointment(appointment, actor, date, startTime, endTime, reason, now);
  const selecting = appointment.rescheduleRequest?.status === 'SLOT_SELECTION_REQUIRED';
  if (selecting) assertRequestRevision(appointment, expectedRequestRevision);
  return { ...appointment,
    rescheduleRequestHistory: [...(appointment.rescheduleRequestHistory || []), ...(appointment.rescheduleRequest ? [appointment.rescheduleRequest] : [])],
    rescheduleRequest: { id: selecting ? appointment.rescheduleRequest!.id : createRecordId('reschedule'),
    requestedAt: selecting ? appointment.rescheduleRequest!.requestedAt : now.toISOString(),
    lastSubmittedAt: now.toISOString(), revision: selecting ? (appointment.rescheduleRequest!.revision || 0) + 1 : 0,
    expectedScheduleVersion: getScheduleVersion(appointment),
    date, startTime, endTime, reason: reason.trim(), status: 'REQUESTED' } };
};

export const applyPatientReschedule = (appointment: Appointment, actor: RescheduleActor,
  requestId: string, now = new Date()): Appointment => {
  const request = appointment.rescheduleRequest;
  if (!['ADMIN', 'PSYCHOLOGIST'].includes(actor.role) || !request || request.id !== requestId || request.status !== 'REQUESTED') {
    throw new Error('Pengajuan sudah diproses atau tidak berwenang.');
  }
  assertScheduleVersion(appointment, request.expectedScheduleVersion);
  if (getPatientRescheduleCount(appointment) >= 3) throw new Error('Kuota reschedule pasien sudah habis.');
  if (!canRescheduleAppointment({ ...appointment, rescheduleRequest: undefined },
    { id: appointment.patientId, name: appointment.patientName, role: 'PATIENT' }, new Date(request.requestedAt))) {
    throw new Error('Pengajuan asal tidak memenuhi syarat reschedule pasien.');
  }
  const moved = rescheduleExistingAppointment(appointment, actor, request.date, request.startTime, request.endTime,
    request.reason, now, actor.role === 'ADMIN' ? 'CLINIC' : 'OWNER');
  return { ...moved, rescheduleRequest: { ...request, status: 'APPLIED',
    decidedAt: now.toISOString(), decidedByName: actor.name },
    rescheduleHistory: moved.rescheduleHistory!.map((event, index, events) =>
      index === events.length - 1 ? { ...event, origin: 'PATIENT' as const } : event) };
};

export const requireRescheduleSlotSelection = (appointment: Appointment, actor: RescheduleActor,
  requestId: string, reason: string, expectedRevision: number, now = new Date()): Appointment => {
  const request = appointment.rescheduleRequest;
  if (!['ADMIN', 'PSYCHOLOGIST'].includes(actor.role) ||
    (actor.role === 'PSYCHOLOGIST' && appointment.psychologistId !== actor.id) ||
    !request || request.id !== requestId || request.status !== 'REQUESTED' || !reason.trim()) {
    throw new Error('Pengajuan tidak dapat dibuka untuk pemilihan ulang slot.');
  }
  if (!canRescheduleAppointment(appointment, actor, now)) throw new Error('Booking tidak lagi dapat dijadwalkan ulang.');
  assertScheduleVersion(appointment, request.expectedScheduleVersion);
  assertRequestRevision(appointment, expectedRevision);
  return { ...appointment,
    rescheduleRequestHistory: [...(appointment.rescheduleRequestHistory || []), request],
    rescheduleRequest: { ...request, revision: (request.revision || 0) + 1, status: 'SLOT_SELECTION_REQUIRED',
      decidedAt: now.toISOString(), decidedByName: actor.name, decisionReason: reason.trim() }
  };
};
