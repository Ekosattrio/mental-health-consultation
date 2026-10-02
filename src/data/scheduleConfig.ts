export interface DayScheduleConfig {
  dayName: string;
  dayIndex: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  isOpen: boolean;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  maxPatients: number;
  sessionDurationMinutes?: number;
}

export interface CustomDateOverride {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  maxPatients: number;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface PracticeScheduleSettings {
  weeklyDays: DayScheduleConfig[];
  holidays: string[]; // YYYY-MM-DD
  customDateOverrides: CustomDateOverride[];
}

export const DEFAULT_WEEKLY_SCHEDULE: DayScheduleConfig[] = [
  {
    dayName: 'Senin',
    dayIndex: 1,
    isOpen: true,
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 5,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Selasa',
    dayIndex: 2,
    isOpen: true,
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 5,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Rabu',
    dayIndex: 3,
    isOpen: true,
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 5,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Kamis',
    dayIndex: 4,
    isOpen: true,
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 5,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Jumat',
    dayIndex: 5,
    isOpen: true,
    startTime: '09:00',
    endTime: '16:30',
    maxPatients: 4,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Sabtu',
    dayIndex: 6,
    isOpen: true,
    startTime: '09:00',
    endTime: '13:00',
    maxPatients: 3,
    sessionDurationMinutes: 60
  },
  {
    dayName: 'Minggu',
    dayIndex: 0,
    isOpen: false,
    startTime: '09:00',
    endTime: '12:00',
    maxPatients: 0,
    sessionDurationMinutes: 60
  }
];

export const DEFAULT_HOLIDAYS = [
  '2026-10-04',
  '2026-10-11',
  '2026-10-18',
  '2026-10-25'
];

export const DEFAULT_CUSTOM_DATE_OVERRIDES: CustomDateOverride[] = [
  {
    date: '2026-10-14',
    isOpen: true,
    maxPatients: 2,
    startTime: '10:00',
    endTime: '15:00',
    note: 'Praktik Terbatas (Maks. 2 Pasien)'
  }
];

const STORAGE_KEY = 'jiwasehat_v2_practice_schedule_settings';

export const loadScheduleSettings = (): PracticeScheduleSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        weeklyDays: parsed.weeklyDays || DEFAULT_WEEKLY_SCHEDULE,
        holidays: parsed.holidays || DEFAULT_HOLIDAYS,
        customDateOverrides: parsed.customDateOverrides || DEFAULT_CUSTOM_DATE_OVERRIDES
      };
    }
  } catch (e) {
    console.error('Failed to load schedule settings', e);
  }
  return {
    weeklyDays: DEFAULT_WEEKLY_SCHEDULE,
    holidays: DEFAULT_HOLIDAYS,
    customDateOverrides: DEFAULT_CUSTOM_DATE_OVERRIDES
  };
};

export const saveScheduleSettings = (settings: PracticeScheduleSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save schedule settings', e);
  }
};

/**
 * Helper parse "HH:mm" to minutes from midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Helper format minutes from midnight to "HH:mm"
 */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Compute dynamic available slots for any given date and package duration
 */
export const computeDynamicSlotsForDate = (
  dateString: string,
  settings: PracticeScheduleSettings,
  existingAppointments: {
    date: string;
    startTime: string;
    endTime?: string;
    psychologistId: string;
    status: string;
    patientName?: string;
  }[],
  psychologistId: string,
  requestedDurationMinutes: number = 60
) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayIndex = dateObj.getDay();

  // 1. Check if date is in holiday list
  if (settings.holidays.includes(dateString)) {
    return {
      isHoliday: true,
      isQuotaFull: false,
      reason: 'Hari Libur Tambahan / Cuti Khusus',
      slots: [],
      maxPatients: 0,
      bookedCount: 0,
      remainingQuota: 0
    };
  }

  // 2. Check Custom Date Override for this specific date
  const override = settings.customDateOverrides?.find(o => o.date === dateString);

  // 3. Fallback to weekly standard configuration
  const defaultDay = settings.weeklyDays.find(d => d.dayIndex === dayIndex) || {
    dayName: 'Hari Ini',
    dayIndex,
    isOpen: dayIndex !== 0,
    startTime: '09:00',
    endTime: '17:00',
    maxPatients: 5,
    sessionDurationMinutes: 60
  };

  const isOpen = override ? override.isOpen : defaultDay.isOpen;
  const startTimeStr = (override?.startTime) || defaultDay.startTime || '09:00';
  const endTimeStr = (override?.endTime) || defaultDay.endTime || '17:00';
  const maxPatients = override ? override.maxPatients : defaultDay.maxPatients;

  if (!isOpen) {
    return {
      isHoliday: true,
      isQuotaFull: false,
      reason: override?.note
        ? `Tutup Praktik: ${override.note}`
        : `Hari ${defaultDay.dayName} adalah hari libur rutin klinik`,
      slots: [],
      maxPatients: 0,
      bookedCount: 0,
      remainingQuota: 0
    };
  }

  // 4. Filter existing active bookings for this date and psychologist
  const activeBookings = existingAppointments.filter(
    apt =>
      apt.psychologistId === psychologistId &&
      apt.date === dateString &&
      ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status)
  );

  const bookedCount = activeBookings.length;
  const remainingQuota = Math.max(0, maxPatients - bookedCount);

  // If daily patient quota has been reached
  if (bookedCount >= maxPatients) {
    return {
      isHoliday: false,
      isQuotaFull: true,
      reason: `Kuota maksimal (${maxPatients} pasien) untuk tanggal ini telah terpenuhi`,
      slots: [],
      maxPatients,
      bookedCount,
      remainingQuota: 0
    };
  }

  // 5. Generate slots using requested package duration
  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);
  const duration = requestedDurationMinutes || 60;

  // Map existing bookings into [start, end] intervals
  const bookedIntervals = activeBookings.map(apt => {
    const sMin = timeToMinutes(apt.startTime);
    const eMin = apt.endTime ? timeToMinutes(apt.endTime) : sMin + 60;
    return { start: sMin, end: eMin, patientName: apt.patientName };
  });

  const slots = [];
  let currentMin = startMinutes;

  while (currentMin + duration <= endMinutes) {
    const slotEndMin = currentMin + duration;
    const slotStartH = Math.floor(currentMin / 60);

    // Skip standard lunch break (12:00 - 13:00) if candidate slot overlaps
    if (currentMin < 780 && slotEndMin > 720) {
      currentMin = 780; // Resume after 13:00
      continue;
    }

    // Check collision with existing active bookings: [currentMin, slotEndMin) overlaps [b.start, b.end)
    const hasConflict = bookedIntervals.some(
      b => Math.max(currentMin, b.start) < Math.min(slotEndMin, b.end)
    );

    const startTimeFormatted = minutesToTime(currentMin);
    const endTimeFormatted = minutesToTime(slotEndMin);
    const periodLabel = slotStartH < 12 ? 'Pagi' : slotStartH < 15 ? 'Siang' : 'Sore';

    slots.push({
      id: `slot-${psychologistId}-${dateString}-${startTimeFormatted}`,
      psychologistId,
      date: dateString,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      durationMinutes: duration,
      isAvailable: !hasConflict && remainingQuota > 0,
      isBooked: hasConflict,
      label: periodLabel
    });

    // Advance by interval: e.g. 30 minutes increments for flexible booking start times
    currentMin += 30;
  }

  return {
    isHoliday: false,
    isQuotaFull: false,
    reason: null,
    slots,
    maxPatients,
    bookedCount,
    remainingQuota,
    isCustomDate: !!override,
    customNote: override?.note
  };
};

/**
 * Detailed Availability & Remaining Time Summary for any Date
 */
export const getScheduleAvailabilitySummary = (
  dateString: string,
  settings: PracticeScheduleSettings,
  existingAppointments: {
    id?: string;
    date: string;
    startTime: string;
    endTime?: string;
    psychologistId: string;
    status: string;
    patientName?: string;
    packageName?: string;
  }[],
  psychologistId: string,
  requestedDurationMinutes: number = 60
) => {
  const dynamicRes = computeDynamicSlotsForDate(
    dateString,
    settings,
    existingAppointments,
    psychologistId,
    requestedDurationMinutes
  );

  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayIndex = dateObj.getDay();

  const override = settings.customDateOverrides?.find(o => o.date === dateString);
  const defaultDay = settings.weeklyDays.find(d => d.dayIndex === dayIndex) || DEFAULT_WEEKLY_SCHEDULE[1];

  const startTimeStr = (override?.startTime) || defaultDay.startTime || '09:00';
  const endTimeStr = (override?.endTime) || defaultDay.endTime || '17:00';

  const startMinutes = timeToMinutes(startTimeStr);
  const endMinutes = timeToMinutes(endTimeStr);
  const totalOperatingMinutes = Math.max(0, endMinutes - startMinutes);

  const activeBookings = existingAppointments
    .filter(
      apt =>
        apt.psychologistId === psychologistId &&
        apt.date === dateString &&
        ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status)
    )
    .map(apt => {
      const sMin = timeToMinutes(apt.startTime);
      const eMin = apt.endTime ? timeToMinutes(apt.endTime) : sMin + 60;
      return {
        id: apt.id,
        patientName: apt.patientName || 'Pasien',
        packageName: apt.packageName || 'Konsultasi',
        startTime: apt.startTime,
        endTime: apt.endTime || minutesToTime(eMin),
        startMinutes: sMin,
        endMinutes: eMin,
        durationMinutes: Math.max(0, eMin - sMin),
        status: apt.status
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const totalBookedMinutes = activeBookings.reduce((sum, b) => sum + b.durationMinutes, 0);
  const remainingFreeMinutes = Math.max(0, totalOperatingMinutes - totalBookedMinutes);

  const availableSlots = dynamicRes.slots.filter(s => s.isAvailable);
  const canAcceptMorePatients = !dynamicRes.isHoliday && !dynamicRes.isQuotaFull && availableSlots.length > 0;

  return {
    date: dateString,
    isOpen: !dynamicRes.isHoliday,
    isHoliday: dynamicRes.isHoliday,
    isQuotaFull: dynamicRes.isQuotaFull,
    reason: dynamicRes.reason,
    isCustomDate: dynamicRes.isCustomDate,
    customNote: dynamicRes.customNote,
    maxPatients: dynamicRes.maxPatients,
    bookedCount: dynamicRes.bookedCount,
    remainingQuota: dynamicRes.remainingQuota,
    operatingHours: {
      startTime: startTimeStr,
      endTime: endTimeStr,
      totalHours: Number((totalOperatingMinutes / 60).toFixed(1))
    },
    totalOperatingMinutes,
    totalBookedMinutes,
    remainingFreeMinutes,
    activeBookings,
    availableSlots,
    canAcceptMorePatients
  };
};
