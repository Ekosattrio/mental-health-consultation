import { Appointment, User } from '../types';
import { createRecordId, getPracticeDate, isValidBookingDate } from './bookingPolicy';

type RescheduleActor = Pick<User, 'id' | 'name' | 'role'>;

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
  if (['COMPLETED', 'DISCONTINUED'].includes(appointment.treatmentPlanStatus || '')) return false;
  if (actor.role === 'PATIENT' && appointment.patientId !== actor.id) return false;
  if (actor.role === 'PSYCHOLOGIST' && appointment.psychologistId !== actor.id) return false;
  if (!['PATIENT', 'ADMIN', 'PSYCHOLOGIST'].includes(actor.role)) return false;
  if (actor.role === 'PATIENT') {
    if (getPatientRescheduleCount(appointment) >= 3 || appointment.rescheduleRequest?.status === 'REQUESTED') return false;
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
  now = new Date()
): Appointment => {
  if (!canRescheduleAppointment(appointment, actor, now)) throw new Error('Status, batas waktu, kuota, atau kepemilikan booking tidak mengizinkan reschedule.');
  if (!reason.trim()) throw new Error('Alasan perubahan jadwal wajib diisi.');
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
    rescheduleRequest: appointment.rescheduleRequest?.status === 'REQUESTED' ? {
      ...appointment.rescheduleRequest, status: 'REJECTED', decidedAt: at, decidedByName: actor.name,
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
      origin: actor.role === 'PATIENT' ? 'PATIENT' : actor.role === 'ADMIN' ? 'CLINIC' : 'OWNER', reason: reason.trim()
    }]
  };
};

export const requestPatientReschedule = (appointment: Appointment, actor: RescheduleActor,
  date: string, startTime: string, endTime: string, reason: string, now = new Date()): Appointment => {
  if (actor.role !== 'PATIENT' || !canRescheduleAppointment(appointment, actor, now)) {
    throw new Error('Pengajuan tidak tersedia: periksa batas tiga kali, H-2 jam, atau empat hari setelah no-show.');
  }
  // Validasi tujuan/durasi yang sama, tanpa memindahkan slot atau mengurangi kuota.
  rescheduleExistingAppointment(appointment, actor, date, startTime, endTime, reason, now);
  return { ...appointment,
    rescheduleRequestHistory: [...(appointment.rescheduleRequestHistory || []), ...(appointment.rescheduleRequest ? [appointment.rescheduleRequest] : [])],
    rescheduleRequest: { id: createRecordId('reschedule'),
    requestedAt: now.toISOString(), expectedScheduleVersion: getScheduleVersion(appointment),
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
  const moved = rescheduleExistingAppointment(appointment, actor, request.date, request.startTime, request.endTime, request.reason, now);
  return { ...moved, rescheduleRequest: { ...request, status: 'APPLIED',
    decidedAt: now.toISOString(), decidedByName: actor.name },
    rescheduleHistory: moved.rescheduleHistory!.map((event, index, events) =>
      index === events.length - 1 ? { ...event, origin: 'PATIENT' as const } : event) };
};
