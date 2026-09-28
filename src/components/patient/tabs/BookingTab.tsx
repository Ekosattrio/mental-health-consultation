import React, { useState, useEffect } from 'react';
import {
  ConsultationPackage,
  PsychologistProfile,
  User,
  ScheduleSlot,
  Appointment
} from '../../../types';
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
  CalendarX2,
  Lock,
  ArrowRight,
  Building2,
  Wallet
} from 'lucide-react';

const MONTH_NAMES = [
  { value: 0, label: 'Januari' },
  { value: 1, label: 'Februari' },
  { value: 2, label: 'Maret' },
  { value: 3, label: 'April' },
  { value: 4, label: 'Mei' },
  { value: 5, label: 'Juni' },
  { value: 6, label: 'Juli' },
  { value: 7, label: 'Agustus' },
  { value: 8, label: 'September' },
  { value: 9, label: 'Oktober' },
  { value: 10, label: 'November' },
  { value: 11, label: 'Desember' }
];

const AVAILABLE_YEARS = [2026, 2027, 2028];

interface BookingTabProps {
  packages: ConsultationPackage[];
  psychologists: PsychologistProfile[];
  users: User[];
  schedules: ScheduleSlot[];
  appointments: Appointment[];
  patientId: string;
  currentUser: User | null;
  selectedBookingPackageId?: string;
  selectedBookingPsychologistId?: string;
  bookAppointment: (data: any) => Promise<{ success: boolean; appointment?: Appointment; message?: string }>;
  onNavigateTab: (tabId: 'chat' | 'history') => void;
}

// Indonesian National Holidays & Clinic Day-off Catalog
const NATIONAL_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-28': 'Tahun Baru Imlek 2577',
  '2026-03-19': 'Hari Suci Nyepi (Tahun Baru Saka 1948)',
  '2026-03-20': 'Hari Raya Idul Fitri 1447 H',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H',
  '2026-04-03': 'Wafat Isa Almasih (Jumat Agung)',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-31': 'Hari Raya Waisak 2570',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam (1 Muharram 1448 H)',
  '2026-08-17': 'HUT Kemerdekaan RI ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal'
};

export const checkIsHoliday = (dateStr: string): { isHoliday: boolean; holidayName?: string; isSunday: boolean } => {
  if (!dateStr || !dateStr.includes('-')) return { isHoliday: false, isSunday: false };
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);

  // Sunday is weekly regular clinic holiday
  if (dateObj.getDay() === 0) {
    return { isHoliday: true, isSunday: true, holidayName: 'Libur Rutin Mingguan Klinik (Hari Minggu)' };
  }

  if (NATIONAL_HOLIDAYS_2026[dateStr]) {
    return { isHoliday: true, isSunday: false, holidayName: NATIONAL_HOLIDAYS_2026[dateStr] };
  }

  return { isHoliday: false, isSunday: false };
};

export const BookingTab: React.FC<BookingTabProps> = ({
  packages,
  psychologists,
  users,
  schedules,
  appointments,
  patientId,
  currentUser,
  selectedBookingPackageId,
  selectedBookingPsychologistId,
  bookAppointment,
  onNavigateTab
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(selectedBookingPackageId || packages[0]?.id || 'pkg-chat-1');
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string>(selectedBookingPsychologistId || psychologists[0]?.userId || 'user-psy-1');

  useEffect(() => {
    if (selectedBookingPackageId) {
      setSelectedPkgId(selectedBookingPackageId);
    }
  }, [selectedBookingPackageId]);

  useEffect(() => {
    if (selectedBookingPsychologistId) {
      setSelectedPsychologistId(selectedBookingPsychologistId);
    }
  }, [selectedBookingPsychologistId]);

  // Date selection state (default to 2026-09-16)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedSlotTimes, setSelectedSlotTimes] = useState<{ start: string; end: string }>({ start: '09:00', end: '10:00' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('QRIS (BCA / GoPay / OVO)');

  // Modal states
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentCountdown, setPaymentCountdown] = useState<number>(899); // 14:59
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [bookingSuccessModalApt, setBookingSuccessModalApt] = useState<Appointment | null>(null);
  const [holidayNotice, setHolidayNotice] = useState<string | null>(null);

  // Check holiday status for currently selected date
  const holidayInfo = checkIsHoliday(selectedDate);

  // Timer countdown simulation inside Payment Gateway
  useEffect(() => {
    let timer: any;
    if (isPaymentGatewayOpen && paymentCountdown > 0) {
      timer = setInterval(() => {
        setPaymentCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaymentGatewayOpen, paymentCountdown]);

  // Format countdown mm:ss
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine available slots for the selected date & psychologist
  // If no slots exist in pre-seeded schedules, dynamically generate standard clinic slots (unless holiday)
  const existingClinicSlots = schedules.filter(
    s => s.psychologistId === selectedPsychologistId && s.date === selectedDate
  );

  let activeAvailableSlots: Array<ScheduleSlot & { periodLabel?: string }> = [];

  if (!holidayInfo.isHoliday) {
    if (existingClinicSlots.length > 0) {
      activeAvailableSlots = existingClinicSlots.map(s => {
        const hour = parseInt(s.startTime.split(':')[0], 10);
        const periodLabel = hour < 12 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';
        return { ...s, periodLabel };
      });
    } else {
      // Standard consultation slots for custom chosen dates
      const standardHours = [
        { start: '09:00', end: '10:00', period: 'Pagi' },
        { start: '10:30', end: '11:30', period: 'Pagi' },
        { start: '13:30', end: '14:30', period: 'Siang' },
        { start: '15:00', end: '16:00', period: 'Sore' },
        { start: '16:30', end: '17:30', period: 'Sore' },
        { start: '19:00', end: '20:00', period: 'Malam' }
      ];

      activeAvailableSlots = standardHours.map(slotTime => {
        // Check if there is an overlapping active appointment
        const isConflict = appointments.some(
          a =>
            a.psychologistId === selectedPsychologistId &&
            a.date === selectedDate &&
            a.startTime === slotTime.start &&
            (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'PENDING')
        );

        const customSlotId = `slot-gen-${selectedDate}-${slotTime.start.replace(':', '.')}-${slotTime.end.replace(':', '.')}`;

        return {
          id: customSlotId,
          psychologistId: selectedPsychologistId,
          date: selectedDate,
          startTime: slotTime.start,
          endTime: slotTime.end,
          isAvailable: !isConflict,
          isBooked: isConflict,
          periodLabel: slotTime.period
        };
      });
    }
  }

  // Selected details
  const currentSelectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];
  const targetPsychologist = psychologists.find(p => p.userId === selectedPsychologistId);
  const targetUserObj = users.find(u => u.id === selectedPsychologistId);

  // Handle clicking a date in the calendar
  const handleSelectDate = (dateString: string) => {
    const check = checkIsHoliday(dateString);
    if (check.isHoliday) {
      setHolidayNotice(`⛔ Tanggal ${dateString} adalah ${check.holidayName}. Klinik libur konsultasi. Silakan pilih hari Senin s/d Sabtu.`);
      return;
    }

    setHolidayNotice(null);
    setSelectedDate(dateString);
    setSelectedSlotId('');

    // Keep calendar view synchronized if selected via quick pills or input
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      setCalendarViewMonth(new Date(y, m, 1));
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCalendarViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleMonthChange = (newMonth: number) => {
    setCalendarViewMonth(prev => new Date(prev.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCalendarViewMonth(prev => new Date(newYear, prev.getMonth(), 1));
  };

  const handleResetToCurrentMonth = () => {
    setCalendarViewMonth(new Date(2026, 8, 1)); // September 2026
  };

  // Build calendar matrix for current view month
  const viewYear = calendarViewMonth.getFullYear();
  const viewMonth = calendarViewMonth.getMonth();
  const monthName = calendarViewMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Days grid
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null); // Empty leading cells
  }
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const formattedDate = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: day,
      dateString: formattedDate,
      holiday: checkIsHoliday(formattedDate)
    });
  }

  // Handle opening the payment gateway simulator modal
  const handleOpenPaymentGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || holidayInfo.isHoliday) return;
    setPaymentCountdown(899);
    setIsPaymentGatewayOpen(true);
  };

  // Handle simulated payment completion
  const handleSimulatePaymentSuccess = async () => {
    setIsProcessingPayment(true);

    try {
      const res = await bookAppointment({
        patientId,
        patientName: currentUser?.name || 'Pasien',
        patientEmail: currentUser?.email || 'pasien@mail.com',
        psychologistId: selectedPsychologistId,
        packageId: selectedPkgId,
        date: selectedDate,
        slotId: selectedSlotId,
        paymentMethod: selectedPaymentMethod,
        startTime: selectedSlotTimes.start,
        endTime: selectedSlotTimes.end
      });

      setTimeout(() => {
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (res.success && res.appointment) {
          setBookingSuccessModalApt(res.appointment);
          setSelectedSlotId('');
        }
      }, 1200);
    } catch (err) {
      setIsProcessingPayment(false);
      setIsPaymentGatewayOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="py-4 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Praktik Mandiri • dr. Sarah Jenkins, M.Psi.</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Booking Jadwal Konsultasi Psikologi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Konsultasi privat bersama dr. Sarah Jenkins, M.Psi. Pilih paket sesi, tentukan tanggal & jam praktik, lalu lakukan pembayaran instan.
            </p>
          </div>
        </div>

        <form onSubmit={handleOpenPaymentGateway} className="space-y-6 mt-6">
          {/* DEDICATED SOLO PRACTITIONER CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <img
                src={targetUserObj?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160'}
                alt={targetUserObj?.name || 'dr. Sarah Jenkins, M.Psi.'}
                className="w-14 h-14 rounded-2xl object-cover shrink-0 border-2 border-emerald-500 shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    {targetUserObj?.name || 'dr. Sarah Jenkins, M.Psi., Psikolog'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                    Praktisi Utama
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                  {targetPsychologist?.title || 'Psikolog Klinis Dewasa & Hubungan Interpersonal'}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-1">
                  <span>STR: {targetPsychologist?.strNumber || 'STR-PSI-2021-09842'}</span>
                  <span>•</span>
                  <span>SIP: {targetPsychologist?.sipNumber || 'SIP.503/042-DPMPTSP/2022'}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">10 Thn Pengalaman</span>
                </div>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-emerald-100 pt-2.5 sm:pt-0 sm:pl-4 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skor Pasien</span>
              <div className="text-base font-black text-slate-900 flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span>{targetPsychologist?.rating || 4.9}</span>
                <span className="text-[11px] text-slate-500 font-normal">({targetPsychologist?.reviewCount || 12} ulasan)</span>
              </div>
            </div>
          </div>

          {/* STEP 1: CHOOSE PACKAGE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Pilih Jenis Paket Konsultasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                    selectedPkgId === pkg.id
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {pkg.badge}
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-2">{pkg.name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pkg.durationMinutes} Menit Sesi</span>
                  </div>
                  <div className="text-base font-black text-emerald-700 mt-2">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: CUSTOM DATE SELECTION (EXCLUDING SUNDAYS & HOLIDAYS) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Pilih Tanggal Konsultasi (Bebas Pilih Kapan Saja)
              </label>
              <p className="text-[11px] text-slate-500">
                Praktik beroperasi aktif <strong>Senin s/d Sabtu</strong>. Hari Minggu & Hari Libur Nasional libur praktik.
              </p>
            </div>

            {/* Quick Date Shortcut Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Akses Cepat:</span>
              {[
                { date: '2026-09-16', label: 'Rabu (16 Sep)' },
                { date: '2026-09-17', label: 'Kamis (17 Sep)' },
                { date: '2026-09-18', label: 'Jumat (18 Sep)' },
                { date: '2026-09-19', label: 'Sabtu (19 Sep)' },
                { date: '2026-09-21', label: 'Senin Depan (21 Sep)' },
                { date: '2026-09-22', label: 'Selasa Depan (22 Sep)' }
              ].map(item => {
                const isItemHoliday = checkIsHoliday(item.date).isHoliday;
                const isSelected = selectedDate === item.date;

                return (
                  <button
                    key={item.date}
                    type="button"
                    disabled={isItemHoliday}
                    onClick={() => handleSelectDate(item.date)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isItemHoliday
                        ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Interactive Monthly Visual Calendar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              {/* Calendar Month & Year Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl shrink-0">
                    <Calendar className="w-4 h-4" />
                  </span>

                  {/* Dropdown Input Bulan */}
                  <div className="relative">
                    <select
                      value={viewMonth}
                      onChange={e => handleMonthChange(parseInt(e.target.value, 10))}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-900 text-xs sm:text-sm font-black rounded-xl border border-slate-200 transition-all cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
                    >
                      {MONTH_NAMES.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Dropdown Input Tahun */}
                  <div className="relative">
                    <select
                      value={viewYear}
                      onChange={e => handleYearChange(parseInt(e.target.value, 10))}
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-900 text-xs sm:text-sm font-black rounded-xl border border-slate-200 transition-all cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
                    >
                      {AVAILABLE_YEARS.map(y => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Quick Jump to Current Month Button */}
                  {(viewMonth !== 8 || viewYear !== 2026) && (
                    <button
                      type="button"
                      onClick={handleResetToCurrentMonth}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200/80 bg-emerald-50/50 transition-all cursor-pointer shadow-2xs"
                    >
                      Ke Bulan Ini
                    </button>
                  )}
                </div>

                {/* Step Chevron Navigation */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Bulan Lalu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                    title="Bulan Berikutnya"
                  >
                    <span className="hidden sm:inline">Bulan Depan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 text-center text-xs font-bold mb-1">
                <div className="text-rose-600">Min</div>
                <div className="text-slate-600">Sen</div>
                <div className="text-slate-600">Sel</div>
                <div className="text-slate-600">Rab</div>
                <div className="text-slate-600">Kam</div>
                <div className="text-slate-600">Jum</div>
                <div className="text-slate-600">Sab</div>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarCells.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-xl" />;
                  }

                  const { dayNumber, dateString, holiday } = cell;
                  const isSelected = selectedDate === dateString;
                  const isHoliday = holiday.isHoliday;

                  return (
                    <button
                      key={dateString}
                      type="button"
                      disabled={isHoliday}
                      onClick={() => handleSelectDate(dateString)}
                      title={isHoliday ? holiday.holidayName : `Pilih tanggal ${dateString}`}
                      className={`h-11 sm:h-12 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 scale-[1.03] z-10'
                          : isHoliday
                          ? 'bg-rose-50/50 border border-rose-100/70 text-rose-300 cursor-not-allowed opacity-75'
                          : 'bg-slate-50/70 border border-slate-200/60 hover:border-emerald-400 hover:bg-emerald-50/60 text-slate-800'
                      }`}
                    >
                      <span className={isSelected ? 'text-white' : isHoliday ? 'text-rose-400 line-through' : 'text-slate-800'}>
                        {dayNumber}
                      </span>
                      {isHoliday && (
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-tighter scale-90">
                          Libur
                        </span>
                      )}
                      {!isHoliday && isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend & Active Date Confirmation Banner */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
                    Terpilih
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block" />
                    Tersedia (Sen - Sab)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-200 inline-block" />
                    Libur (Minggu & Nasional)
                  </span>
                </div>

                <div className="text-right">
                  {holidayInfo.isHoliday ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs">
                      <CalendarX2 className="w-3.5 h-3.5 text-rose-600" />
                      Libur: {holidayInfo.holidayName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Holiday Alert Warning if user tried to pick holiday */}
            {holidayNotice && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{holidayNotice}</p>
              </div>
            )}
          </div>

          {/* STEP 3: CHOOSE TIME SLOT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Pilih Jam Konsultasi (Slot Waktu Tersedia)
              </label>
              <span className="text-[11px] text-slate-400">Zona Waktu: WIB (Jakarta)</span>
            </div>

            {holidayInfo.isHoliday ? (
              <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <CalendarX2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-rose-900">Klinik Libur pada Tanggal Terpilih</h4>
                <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                  {holidayInfo.holidayName}. Tidak ada jadwal praktik dokter yang tersedia. Silakan pilih tanggal lain di kalender atas.
                </p>
              </div>
            ) : activeAvailableSlots.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                Semua slot jadwal pada tanggal ini telah penuh terisi. Silakan pilih tanggal lain.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {activeAvailableSlots.map(slot => {
                  const isUnavailable = !slot.isAvailable || slot.isBooked;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setSelectedSlotTimes({ start: slot.startTime, end: slot.endTime });
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center relative cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                          : isUnavailable
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <span className={`text-[10px] block font-semibold mb-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {slot.periodLabel || 'Sesi'}
                      </span>
                      <div className="font-mono text-[13px]">
                        {slot.startTime}
                      </div>
                      <div className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {isUnavailable ? 'Sudah Dipesan' : 'Tersedia'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 4: CHOOSE PAYMENT METHOD */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Pilih Metode Pembayaran (Payment Gateway Simulator)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'QRIS (BCA / GoPay / OVO)', icon: QrCode, desc: 'Scan QRIS Instan Semua Aplikasi' },
                { id: 'Virtual Account BCA', icon: Building2, desc: 'Verifikasi Otomatis 1 Detik' },
                { id: 'Virtual Account Mandiri', icon: Building2, desc: 'Konfirmasi Otomatis Livin Mandiri' }
              ].map(m => {
                const MIcon = m.icon;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                      selectedPaymentMethod === m.id
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-600/30'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <MIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{m.id}</div>
                      <div className="text-[10px] text-slate-500">{m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON BAR */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Total Tagihan Konsultasi</span>
              <span className="text-2xl font-black text-slate-900">
                Rp {currentSelectedPkg.price.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="submit"
              disabled={!selectedSlotId || holidayInfo.isHoliday}
              className={`px-8 py-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                selectedSlotId && !holidayInfo.isHoliday
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Lanjut ke Pembayaran Gateway (Rp {currentSelectedPkg.price.toLocaleString('id-ID')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* PAYMENT GATEWAY SIMULATION MODAL (MIDTRANS / XENDIT STYLE)               */}
      {/* ========================================================================= */}
      {isPaymentGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight">JiwaSehat Payment Gateway</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Mode Simulasi Pembayaran Instan</span>
                  </div>
                </div>
              </div>

              {/* 15-Minute Countdown Timer */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Sisa Waktu Bayar</span>
                <div className="font-mono text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatCountdown(paymentCountdown)}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
              {/* Invoice Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-slate-800">INV-202609-{Math.floor(10000 + Math.random() * 90000)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Layanan:</span>
                  <strong className="text-slate-800">{currentSelectedPkg.name} ({currentSelectedPkg.durationMinutes} Menit)</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Psikolog:</span>
                  <strong className="text-slate-800">{targetUserObj?.name || 'dr. Sarah Jenkins, M.Psi.'}</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Jadwal Sesi:</span>
                  <strong className="text-emerald-700">{selectedDate} • {selectedSlotTimes.start} - {selectedSlotTimes.end} WIB</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Total Pembayaran:</span>
                  <span className="text-base font-black text-emerald-700">Rp {currentSelectedPkg.price.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Dynamic Payment Channel Instructions */}
              {selectedPaymentMethod.includes('QRIS') && (
                <div className="text-center space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-xs">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QRIS Standar Bank Indonesia</span>
                  </div>

                  {/* Simulated QRIS Code SVG */}
                  <div className="w-44 h-44 mx-auto bg-white p-3 border-2 border-slate-900 rounded-2xl flex flex-col items-center justify-center shadow-xs">
                    <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-slate-900 rounded-lg">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${i % 2 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-white' : 'bg-slate-900'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p className="font-bold text-slate-800">NMID: ID10202688920199 • PT JIWA SEHAT INDONESIA</p>
                    <p>Buka aplikasi GoPay, OVO, Dana, ShopeePay, atau BCA Mobile & scan QR di atas.</p>
                  </div>
                </div>
              )}

              {selectedPaymentMethod.includes('Virtual Account') && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{selectedPaymentMethod}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Otomatis</span>
                  </div>

                  <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Nomor Virtual Account</span>
                      <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                        8801 2026 8892 4101
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('8801202688924101')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVa ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Transfer tepat sejumlah <strong>Rp {currentSelectedPkg.price.toLocaleString('id-ID')}</strong> melalui m-Banking atau ATM. Transaksi akan terkonfirmasi otomatis dalam 1 detik.
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-900">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Transaksi dienkripsi 256-bit SSL dan terhubung dengan simulator webhook gateway.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPaymentGatewayOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-white text-xs font-bold transition-all cursor-pointer"
              >
                Batalkan
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleSimulatePaymentSuccess}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Webhook Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulasikan Pembayaran Berhasil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* E-TICKET CONFIRMATION MODAL                                               */}
      {/* ========================================================================= */}
      {bookingSuccessModalApt && (
        <div
          onClick={() => setBookingSuccessModalApt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden cursor-default"
          >
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Pembayaran Lunas & Jadwal Terkunci
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">E-Ticket Konsultasi JiwaSehat</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kode Tiket: <strong>{bookingSuccessModalApt.bookingCode}</strong></p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Nama Pasien:</span>
                  <strong className="text-slate-900">{bookingSuccessModalApt.patientName}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Psikolog Pendamping:</span>
                  <strong className="text-slate-900">{bookingSuccessModalApt.psychologistName}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jadwal Sesi:</span>
                  <strong className="text-emerald-800 font-bold">{bookingSuccessModalApt.date} • {bookingSuccessModalApt.startTime} - {bookingSuccessModalApt.endTime} WIB</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jenis Layanan:</span>
                  <strong className="text-slate-900">{bookingSuccessModalApt.packageName}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ruang Konsultasi:</span>
                  <strong className="text-indigo-700 font-mono">{bookingSuccessModalApt.meetingLocation}</strong>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                  <span>Status Pembayaran:</span>
                  <span className="text-emerald-700 font-black">LUNAS (Verified via Gateway)</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Slot jadwal telah diamankan secara eksklusif. Ruang konsultasi chat terenkripsi telah aktif.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setBookingSuccessModalApt(null);
                  onNavigateTab('chat');
                }}
                className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Buka Ruang Chat Sekarang
              </button>
              <button
                onClick={() => {
                  setBookingSuccessModalApt(null);
                  onNavigateTab('history');
                }}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Lihat Riwayat & E-Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
