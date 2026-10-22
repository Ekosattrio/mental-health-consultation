import { Appointment } from '../types';
import { PracticeScheduleSettings, timeToMinutes, resolvePracticeDay } from '../data/scheduleConfig';

export const findScheduleConflicts = (
  settings: PracticeScheduleSettings,
  appointments: Appointment[],
  psychologistId: string
): string[] => {
  const grouped = new Map<string, Appointment[]>();
  appointments.filter(item => item.psychologistId === psychologistId &&
    ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(item.status) &&
    new Date(`${item.date}T${item.endTime}:00+07:00`).getTime() > Date.now())
    .forEach(item => grouped.set(item.date, [...(grouped.get(item.date) || []), item]));
  const conflicts: string[] = [];
  grouped.forEach((items, date) => {
    const resolved = resolvePracticeDay(date, settings);
    const isOpen = resolved.isOpen;
    const codes = items.slice(0, 3).map(item => item.bookingCode).join(', ');
    if (!isOpen) {
      conflicts.push(`${date}: masih ada booking aktif (${codes}).`);
      return;
    }
    const start = timeToMinutes(resolved.startTime);
    const end = timeToMinutes(resolved.endTime);
    const quota = resolved.maxPatients;
    if (items.length > quota) conflicts.push(`${date}: ${items.length} booking aktif melebihi kuota baru ${quota}.`);
    items.forEach(item => {
      const from = timeToMinutes(item.startTime);
      const to = timeToMinutes(item.endTime);
      if (from < start || to > end || (from < 780 && to > 720)) {
        conflicts.push(`${date}: ${item.bookingCode} berada di luar jam praktik atau beririsan dengan waktu istirahat.`);
      }
    });
  });
  return conflicts;
};
