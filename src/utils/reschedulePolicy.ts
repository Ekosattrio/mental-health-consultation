import { Appointment, User } from '../types';
import { getPracticeDate, isValidBookingDate } from './bookingPolicy';

type RescheduleActor = Pick<User, 'id' | 'name' | 'role'>;

export const getScheduleVersion = (appointment: Appointment): number =>
  appointment.scheduleVersion ?? appointment.rescheduleHistory?.length ?? 0;

export const assertScheduleVersion = (appointment: Appointment, expectedVersion?: number): void => {
  if (!Number.isInteger(expectedVersion) || expectedVersion !== getScheduleVersion(appointment)) {
    throw new Error('Jadwal sudah berubah. Tutup formulir dan periksa jadwal terbaru sebelum memilih ulang.');
  }
};

export const canRescheduleAppointment = (appointment: Appointment, actor: RescheduleActor): boolean => {
  if (['COMPLETED', 'DISCONTINUED'].includes(appointment.treatmentPlanStatus || '')) return false;
  if (actor.role === 'PATIENT' && appointment.patientId !== actor.id) return false;
  if (actor.role === 'PSYCHOLOGIST' && appointment.psychologistId !== actor.id) return false;
  if (!['PATIENT', 'ADMIN', 'PSYCHOLOGIST'].includes(actor.role)) return false;
  if (appointment.status === 'NO_SHOW') {
    return actor.role === 'PSYCHOLOGIST' && ['DP_PAID', 'PAID'].includes(appointment.paymentStatus);
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
  if (!canRescheduleAppointment(appointment, actor)) throw new Error('Status atau kepemilikan booking tidak mengizinkan reschedule.');
  if (!reason.trim()) throw new Error('Alasan perubahan jadwal wajib diisi.');
  if (!isValidBookingDate(date) || date <= getPracticeDate(now)) throw new Error('Tanggal pengganti wajib minimal H+1.');
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
      at, actorId: actor.id, actorName: actor.name, actorRole: actor.role, reason: reason.trim()
    }]
  };
};
