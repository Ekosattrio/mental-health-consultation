import { Appointment, User } from '../types';
import { computeDynamicSlotsForDate, PracticeScheduleSettings } from '../data/scheduleConfig';
import { getPracticeDate } from './bookingPolicy';
import { applyPatientReschedule, assertRequestRevision, assertScheduleVersion, requireRescheduleSlotSelection } from './reschedulePolicy';

export const reviewRescheduleAvailability = (
  appointment: Appointment, actor: Pick<User, 'id' | 'name' | 'role'>, requestId: string,
  expectedRevision: number, appointments: Appointment[], settings: PracticeScheduleSettings, now = new Date()
): { appointment: Appointment; applied: boolean } => {
  const request = appointment.rescheduleRequest;
  if (!request || request.id !== requestId || request.status !== 'REQUESTED') throw new Error('Pengajuan sudah diproses atau berubah.');
  assertRequestRevision(appointment, expectedRevision);
  assertScheduleVersion(appointment, request.expectedScheduleVersion);
  // Validate role, ownership, original eligibility and target before any state change.
  if (request.date <= getPracticeDate(now)) {
    return { appointment: requireRescheduleSlotSelection(appointment, actor, requestId,
      'Tanggal usulan telah lewat. Pilih jadwal pengganti minimal H+1.', expectedRevision, now), applied: false };
  }
  const moved = applyPatientReschedule(appointment, actor, requestId, now);
  if (appointment.status === 'NO_SHOW' && appointment.treatmentPlanId && appointments.some(item =>
    item.id !== appointment.id && item.treatmentPlanId === appointment.treatmentPlanId &&
    (['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status) ||
      (item.continuousSessionNumber || 1) > (appointment.continuousSessionNumber || 1)))) {
    throw new Error('Rencana sudah memiliki sesi lain. Periksa histori sebelum menjadwalkan ulang sesi tidak hadir.');
  }
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const availability = computeDynamicSlotsForDate(request.date, settings,
    appointments.filter(item => item.id !== appointment.id), appointment.psychologistId,
    minutes(appointment.endTime) - minutes(appointment.startTime));
  const selected = availability.slots.find(slot => slot.startTime === request.startTime && slot.endTime === request.endTime);
  if (!selected?.isAvailable) {
    return { appointment: requireRescheduleSlotSelection(appointment, actor, requestId,
      availability.reason || 'Slot usulan tidak tersedia. Pilih kembali tanggal dan jam pengganti.', expectedRevision, now), applied: false };
  }
  return { appointment: moved, applied: true };
};
