export const PRE_TEST_VERSION = 'profiling-v1';
export const CONSENT_VERSION = 'consent-2026-10-21';
export const PRIVACY_VERSION = 'privacy-2026-10-21';

export const createRecordId = (prefix: string): string => {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
};

export const getPracticeDate = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export const getMinimumBookingDate = (): string => {
  const date = new Date(`${getPracticeDate()}T00:00:00+07:00`);
  return getPracticeDate(new Date(date.getTime() + 86400000));
};

export const isValidBookingDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00+07:00`);
  return Number.isFinite(date.getTime()) && getPracticeDate(date) === value;
};

export const timeSlotKey = (slot: { start: string; end: string }): string => `${slot.start}-${slot.end}`;

export const findTimeSlot = <T extends { start: string; end: string }>(slots: T[], key: string): T | undefined =>
  slots.find(slot => timeSlotKey(slot) === key);
