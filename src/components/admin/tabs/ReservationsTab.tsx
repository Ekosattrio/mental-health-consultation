import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  CalendarPlus,
  Search,
  Download,
  X,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Printer,
  Sparkles,
  User,
  CalendarClock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';
import { computeDynamicSlotsForDate, loadScheduleSettings } from '../../../data/scheduleConfig';

interface ReservationsTabProps {
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: any) => void;
}

const getLocalDateString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getTomorrowDateValue = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
};

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  appointments,
  updateAppointmentStatus
}) => {
  const { users, packages, bookAppointment, rescheduleAppointment, recordFinalPayment, showToast } = useApp();

  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [resSearchQuery, resStatusFilter]);

  // Modal Walk-In Booking
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [patientMode, setPatientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    users.find(u => u.role === 'PATIENT')?.id || ''
  );
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    packages[0]?.id || ''
  );
  const [walkInDate, setWalkInDate] = useState<string>(
    getTomorrowDateValue()
  );
  const [walkInTime, setWalkInTime] = useState<string>('10:00 - 11:00');
  const [walkInPaymentType, setWalkInPaymentType] = useState<'PAID' | 'DP_PAID'>('PAID');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC'>('CASH');
  const [walkInBankName, setWalkInBankName] = useState('BCA');
  const [walkInTransferSender, setWalkInTransferSender] = useState('');
  const [walkInPaymentReference, setWalkInPaymentReference] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [receiptApt, setReceiptApt] = useState<Appointment | null>(null);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 - 11:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [settlementApt, setSettlementApt] = useState<Appointment | null>(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementMethod, setSettlementMethod] = useState<NonNullable<Appointment['finalPaymentMethod']>>('CASH');
  const [settlementChannel, setSettlementChannel] = useState('');
  const [settlementReference, setSettlementReference] = useState('');

  const defaultPsychologistId = users.find(u => u.role === 'PSYCHOLOGIST' && u.status === 'ACTIVE')?.id || '';

  useEffect(() => {
    const firstActivePackage = packages.find(pkg => pkg.isActive);
    if (firstActivePackage && !packages.some(pkg => pkg.id === selectedPackageId && pkg.isActive)) {
      setSelectedPackageId(firstActivePackage.id);
    }
  }, [packages, selectedPackageId]);

  const getTomorrowDate = () => {
    return getTomorrowDateValue();
  };

  const selectedWalkInPackage = packages.find(pkg => pkg.id === selectedPackageId && pkg.isActive);
  const walkInTimeOptions = useMemo(() => {
    if (!walkInDate || !defaultPsychologistId || !selectedWalkInPackage) return [];
    const availability = computeDynamicSlotsForDate(
      walkInDate,
      loadScheduleSettings(),
      appointments,
      defaultPsychologistId,
      selectedWalkInPackage.durationMinutes
    );
    return availability.slots
      .filter(slot => slot.isAvailable)
      .map(slot => `${slot.startTime} - ${slot.endTime}`);
  }, [appointments, defaultPsychologistId, selectedWalkInPackage, walkInDate]);

  useEffect(() => {
    if (!walkInTimeOptions.includes(walkInTime)) {
      setWalkInTime(walkInTimeOptions[0] || '');
    }
  }, [walkInTime, walkInTimeOptions]);

  const rescheduleTimeOptions = useMemo(() => {
    if (!rescheduleApt || !rescheduleDate) return [];
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    const duration = Math.max(toMinutes(rescheduleApt.endTime) - toMinutes(rescheduleApt.startTime), 30);
    const availability = computeDynamicSlotsForDate(
      rescheduleDate,
      loadScheduleSettings(),
      appointments.filter(item => item.id !== rescheduleApt.id),
      rescheduleApt.psychologistId,
      duration
    );
    return availability.slots
      .filter(slot => slot.isAvailable)
      .map(slot => `${slot.startTime} - ${slot.endTime}`);
  }, [appointments, rescheduleApt, rescheduleDate]);

  useEffect(() => {
    if (rescheduleApt && !rescheduleTimeOptions.includes(rescheduleTime)) {
      setRescheduleTime(rescheduleTimeOptions[0] || '');
    }
  }, [rescheduleApt, rescheduleTime, rescheduleTimeOptions]);

  const openRescheduleModal = (apt: Appointment) => {
    setRescheduleApt(apt);
    setRescheduleDate(getTomorrowDate());
    setRescheduleTime(`${apt.startTime} - ${apt.endTime}`);
    setRescheduleReason('');
  };

  const handleConfirmPayment = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'CONFIRMED');
    setReceiptApt({
      ...apt,
      status: 'CONFIRMED',
      paymentStatus: apt.paymentStatus === 'PAID' ? 'PAID' : 'DP_PAID'
    });
  };

  const openSettlementModal = (apt: Appointment) => {
    setSettlementApt(apt);
    setSettlementAmount('');
    setSettlementMethod('CASH');
    setSettlementChannel('');
    setSettlementReference('');
  };

  const handleRecordSettlement = (event: React.FormEvent) => {
    event.preventDefault();
    if (!settlementApt) return;

    const success = recordFinalPayment(settlementApt.id, {
      amount: Number(settlementAmount),
      method: settlementMethod,
      channelDetail: settlementChannel,
      reference: settlementReference
    });

    if (success) {
      setSettlementApt(null);
      setSettlementAmount('');
      setSettlementChannel('');
      setSettlementReference('');
    }
  };

  const handleSubmitReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rescheduleApt) return;

    if (!rescheduleTime) {
      showToast('Slot Tidak Tersedia', 'Tidak ada jam praktik yang tersedia pada tanggal baru.', 'warning');
      return;
    }

    const times = rescheduleTime.split(' - ');
    const startTime = times[0]?.trim() || rescheduleApt.startTime;
    const endTime = times[1]?.trim() || rescheduleApt.endTime;

    setIsSubmittingReschedule(true);
    try {
      const success = await rescheduleAppointment(
        rescheduleApt.id,
        rescheduleDate,
        startTime,
        endTime,
        rescheduleReason.trim() || 'Dibantu reschedule oleh admin'
      );

      if (success) {
        setRescheduleApt(null);
        setRescheduleReason('');
      }
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const existingPatients = useMemo(() => {
    return users.filter(u => u.role === 'PATIENT');
  }, [users]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const q = resSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q);
      const matchesStatus = resStatusFilter === 'ALL' || apt.status === resStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, resSearchQuery, resStatusFilter]);

  const handleExportCsv = () => {
    const headers = ['Kode Booking', 'Pasien', 'Paket', 'Tanggal', 'Jam', 'Tipe', 'Status', 'Pembayaran'];
    const rows = filteredAppointments.map(a => [
      `"${a.bookingCode}"`,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.packageName.replace(/"/g, '""')}"`,
      `"${a.date}"`,
      `"${a.startTime} - ${a.endTime}"`,
      `"${a.packageType}"`,
      `"${a.status}"`,
      `"${a.paymentStatus}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Reservasi_JiwaSehat_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWalkIn(true);

    try {
      if (!walkInTime || !selectedWalkInPackage) {
        showToast('Jadwal Tidak Tersedia', 'Tidak ada jam praktik tersisa untuk tanggal atau paket yang dipilih.', 'warning');
        return;
      }

      let patientId = selectedPatientId;
      let patientName = '';
      let patientEmail = '';

      if (patientMode === 'EXISTING') {
        const existingPat = users.find(u => u.id === selectedPatientId);
        if (!existingPat) {
          showToast('Data Pasien Belum Dipilih', 'Silakan pilih pasien terdaftar yang tersedia.', 'error');
          setIsSubmittingWalkIn(false);
          return;
        }
        patientName = existingPat.name;
        patientEmail = existingPat.email;
      } else {
        if (!newPatientName.trim() || !newPatientPhone.trim()) {
          showToast('Data Belum Lengkap', 'Nama dan nomor WhatsApp pasien walk-in wajib diisi.', 'error');
          setIsSubmittingWalkIn(false);
          return;
        }
        patientId = `user-pat-walkin-${Date.now()}`;
        patientName = newPatientName.trim();
        patientEmail = newPatientEmail.trim() || `${newPatientName.toLowerCase().replace(/\s+/g, '')}@walkin.jiwasehat.id`;
      }

      const targetPkg = selectedWalkInPackage;
      const times = walkInTime.split(' - ');
      const startTime = times[0]?.trim() || '10:00';
      const endTime = times[1]?.trim() || '11:00';
      const isFullPayment = walkInPaymentType === 'PAID';
      const paymentPhase = isFullPayment ? 'FULL' : 'DP';
      const paymentMethod = `${walkInPaymentMethod}_${paymentPhase}`;
      const paymentChannelDetail =
        walkInPaymentMethod === 'BANK_TRANSFER'
          ? `${walkInBankName}${walkInPaymentReference.trim() ? ` - Ref ${walkInPaymentReference.trim()}` : ''}`
          : walkInPaymentMethod === 'QRIS'
          ? `QRIS Klinik${walkInPaymentReference.trim() ? ` - Ref ${walkInPaymentReference.trim()}` : ''}`
          : walkInPaymentMethod === 'EDC'
          ? `Mesin EDC Klinik${walkInPaymentReference.trim() ? ` - Ref ${walkInPaymentReference.trim()}` : ''}`
          : 'Tunai Kasir Klinik';
      if (walkInPaymentMethod === 'BANK_TRANSFER' && !walkInTransferSender.trim()) {
        showToast('Data Pembayaran Belum Lengkap', 'Nama pengirim/pemilik rekening wajib diisi untuk pembayaran bank.', 'error');
        setIsSubmittingWalkIn(false);
        return;
      }

      const transferSenderName =
        walkInPaymentMethod === 'CASH'
          ? 'Kasir Klinik (Tunai)'
          : walkInTransferSender.trim() || patientName;

      if (walkInPaymentMethod !== 'CASH' && !transferSenderName.trim()) {
        showToast('Data Pembayaran Belum Lengkap', 'Nama pengirim/pemilik rekening wajib diisi untuk pembayaran non-tunai.', 'error');
        setIsSubmittingWalkIn(false);
        return;
      }

      const res = await bookAppointment({
        patientId,
        patientName,
        patientEmail,
        patientPhone: patientMode === 'NEW' ? newPatientPhone.trim() : undefined,
        psychologistId: defaultPsychologistId,
        packageId: targetPkg.id,
        date: walkInDate,
        slotId: `slot-walkin-${Date.now()}`,
        paymentMethod,
        startTime,
        endTime,
        transferSenderName,
        paymentChannelDetail,
        paymentReference: walkInPaymentReference.trim(),
        paymentProofUrl: `Walk-in ${paymentChannelDetail}`
      });

      if (res.success && res.appointment) {
        // Otomatis verifikasi dan konfirmasi booking walk-in oleh admin
        updateAppointmentStatus(res.appointment.id, 'CONFIRMED');
        setReceiptApt({
          ...res.appointment,
          status: 'CONFIRMED',
          paymentStatus: walkInPaymentType
        });
        showToast(
          'Booking Walk-In Berhasil',
          `Jadwal untuk ${patientName} berhasil dibuat dengan kode #${res.appointment.bookingCode}.`,
          'success'
        );
        setIsWalkInModalOpen(false);
        // Reset form
        setNewPatientName('');
        setNewPatientPhone('');
        setNewPatientEmail('');
        setWalkInTransferSender('');
        setWalkInPaymentReference('');
      } else {
        showToast('Gagal Membuat Booking', res.message || 'Terjadi kendala sistem.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Gagal memproses reservasi walk-in.', 'error');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = useMemo(() => {
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, startIndex, itemsPerPage]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking, Verifikasi Pembayaran, dan Bantuan Reschedule</h3>
            <p className="text-xs text-slate-500">
              Admin memantau booking, memverifikasi pembayaran, dan mengonfirmasi reservasi. Status selesai konsultasi ditandai oleh psikolog.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              {filteredAppointments.length} dari {appointments.length} booking
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Verifikasi Pembayaran Pasien</strong>
              Booking baru berstatus <em>Pending</em> wajib diverifikasi setelah bukti pembayaran administrasi valid.
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/90 text-xs text-purple-900 flex items-start gap-2.5">
            <UserPlus className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">Bantuan Booking Pasien Langsung (Walk-In)</strong>
              Daftarkan pasien yang datang langsung ke meja resepsionis klinik secara instan.
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs active:scale-95"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Buat Booking Pasien Langsung</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Tooltip content="Download Data CSV Reservasi" position="bottom">
              <button
                type="button"
                onClick={handleExportCsv}
                aria-label="Download Data CSV Reservasi"
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ekspor CSV</span>
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={resSearchQuery}
              onChange={e => setResSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama pasien, atau psikolog..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 overflow-x-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map(st => (
              <button
                key={st}
                onClick={() => setResStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  resStatusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="md:hidden divide-y divide-slate-100 border-y border-slate-200">
          {paginatedAppointments.length === 0 ? (
            <div className="py-10 px-4 text-center text-xs text-slate-400">
              Tidak ditemukan reservasi yang cocok dengan kriteria filter.
            </div>
          ) : paginatedAppointments.map(apt => (
            <article key={apt.id} className="p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-black text-slate-900 truncate">{apt.patientName}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{apt.bookingCode}</div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${
                  apt.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.status === 'COMPLETED'
                    ? 'bg-slate-200 text-slate-800'
                    : apt.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {apt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="min-w-0">
                  <span className="block text-slate-400 font-bold uppercase">Paket</span>
                  <span className="block text-slate-800 font-semibold mt-0.5 line-clamp-2">{apt.packageName}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase">Jadwal</span>
                  <span className="block text-slate-800 font-semibold mt-0.5">{apt.date}</span>
                  <span className="block text-slate-500">{apt.startTime} - {apt.endTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  apt.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.paymentStatus === 'DP_PAID'
                    ? 'bg-sky-100 text-sky-800'
                    : apt.paymentStatus === 'DP_PENDING_VERIFICATION'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {apt.paymentStatus}
                </span>
                <div className="flex items-center gap-2">
                  {apt.status === 'PENDING' && (
                    <button type="button" onClick={() => handleConfirmPayment(apt)} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi reservasi">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                    <button type="button" onClick={() => openRescheduleModal(apt)} className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Reschedule jadwal pasien">
                      <CalendarClock className="w-4 h-4" />
                    </button>
                  )}
                  {apt.paymentStatus === 'DP_PAID' && (
                    <button type="button" onClick={() => openSettlementModal(apt)} className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center" aria-label="Catat pelunasan">
                      <CreditCard className="w-4 h-4" />
                    </button>
                  )}
                  {(apt.status === 'CONFIRMED' || apt.paymentStatus === 'DP_PAID' || apt.paymentStatus === 'PAID') && (
                    <button type="button" onClick={() => setReceiptApt(apt)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center" aria-label="Print receipt">
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full min-w-[760px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Paket</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan reservasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{apt.packageName}</div>
                      {apt.continuousSessionTotal && apt.continuousSessionTotal > 1 && (
                        <div className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                          Sesi {apt.continuousSessionNumber || 1}/{apt.continuousSessionTotal}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {apt.date} {apt.startTime}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'COMPLETED'
                            ? 'bg-slate-200 text-slate-800'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.paymentStatus === 'DP_PENDING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-800'
                            : apt.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.paymentStatus === 'DP_PAID'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {apt.paymentStatus}
                      </span>
                      {apt.transferSenderName && (
                        <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                          Pengirim: {apt.transferSenderName}
                        </div>
                      )}
                      {apt.paymentChannelDetail && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Metode: {apt.paymentMethod || 'MANUAL'} - {apt.paymentChannelDetail}
                        </div>
                      )}
                      {apt.paymentReference && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Ref: {apt.paymentReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'PENDING' && (
                          <Tooltip content="Verifikasi Pembayaran & Konfirmasi Booking" position="top">
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(apt)}
                              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Konfirmasi Reservasi"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                          <Tooltip content="Bantu Reschedule Jadwal Pasien" position="top">
                            <button
                              type="button"
                              onClick={() => openRescheduleModal(apt)}
                              className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Reschedule Jadwal Pasien"
                            >
                              <CalendarClock className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {apt.paymentStatus === 'DP_PAID' && (
                          <Tooltip content="Catat Pelunasan yang Diterima" position="top">
                            <button
                              type="button"
                              onClick={() => openSettlementModal(apt)}
                              className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Catat pelunasan"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {(apt.status === 'CONFIRMED' || apt.paymentStatus === 'DP_PAID' || apt.paymentStatus === 'PAID') && (
                          <Tooltip content="Print Receipt / Simpan PDF" position="top">
                            <button
                              type="button"
                              onClick={() => setReceiptApt(apt)}
                              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {apt.status !== 'PENDING' && apt.status !== 'CONFIRMED' && apt.paymentStatus !== 'DP_PAID' && apt.paymentStatus !== 'PAID' && (
                          <span className="text-[10px] font-bold text-slate-400">Tidak ada aksi</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredAppointments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, filteredAppointments.length)}</strong> dari{' '}
              <strong className="text-slate-800">{filteredAppointments.length}</strong> reservasi
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL BUAT BOOKING PASIEN LANGSUNG (WALK-IN BOOKING) */}
      {isWalkInModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp my-auto">
            {/* Modal Header Modern Simple Light */}
            <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold shrink-0">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Buat Booking Pasien Langsung (Walk-In)</h3>
                  <p className="text-xs text-slate-500">
                    Daftarkan sesi konsultasi untuk pasien yang datang langsung ke meja registrasi.
                  </p>
                </div>
              </div>

              <Tooltip content="Tutup Form (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateWalkInBooking} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              
              {/* Pilihan Tipe Pasien (Terdaftar vs Walk-in Baru) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Status Pasien
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatientMode('EXISTING')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      patientMode === 'EXISTING'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <User className="w-4 h-4 text-purple-600" />
                    <span>Pasien Terdaftar ({existingPatients.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPatientMode('NEW')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      patientMode === 'NEW'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    <span>Pasien Walk-In Baru</span>
                  </button>
                </div>
              </div>

              {/* Form Input Pasien */}
              {patientMode === 'EXISTING' ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Pilih Pasien Terdaftar *</label>
                  <select
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {existingPatients.map(pat => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.email} - {pat.phone || 'No HP -'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider block">
                    Data Identitas Pasien Walk-In Baru
                  </span>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                    <input
                      type="text"
                      required
                      value={newPatientName}
                      onChange={e => setNewPatientName(e.target.value)}
                      placeholder="Contoh: Anisa Rahmawati"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nomor WhatsApp / HP *</label>
                      <input
                        type="tel"
                        required
                        value={newPatientPhone}
                        onChange={e => setNewPatientPhone(e.target.value)}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Email (Opsional)</label>
                      <input
                        type="email"
                        value={newPatientEmail}
                        onChange={e => setNewPatientEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pilihan Paket */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Pilihan Paket Layanan *</label>
                  <select
                    value={selectedPackageId}
                    onChange={e => setSelectedPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {packages.filter(pkg => pkg.isActive).map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.durationMinutes} mnt)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal & Waktu Sesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Tanggal Sesi Konsultasi (Minimal H+1) *</label>
                  <input
                    type="date"
                    required
                    min={getTomorrowDateValue()}
                    value={walkInDate}
                    onChange={e => setWalkInDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Pilihan Jam / Sesi *</label>
                  <select
                    value={walkInTime}
                    onChange={e => setWalkInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {walkInTimeOptions.map(timeRange => (
                      <option key={timeRange} value={timeRange}>{timeRange} WIB</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metode Pembayaran di Tempat */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Status Pembayaran Pasien di Meja Resepsionis
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInPaymentType('PAID')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      walkInPaymentType === 'PAID'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Lunas di Tempat</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500 block">
                      Pasien dinyatakan lunas sesuai arahan psikolog/pengelola.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWalkInPaymentType('DP_PAID')}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      walkInPaymentType === 'DP_PAID'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-sky-700 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bayar DP Administrasi</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500 block">
                      Pasien membayar DP administrasi sesuai arahan psikolog/pengelola.
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { id: 'CASH', label: 'Cash', hint: 'Tunai kasir' },
                    { id: 'BANK_TRANSFER', label: 'Bank', hint: 'Transfer bank' },
                    { id: 'QRIS', label: 'QRIS', hint: 'Scan kode' },
                    { id: 'EDC', label: 'EDC', hint: 'Debit/Kredit' }
                  ] as Array<{ id: 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC'; label: string; hint: string }>).map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setWalkInPaymentMethod(method.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        walkInPaymentMethod === method.id
                          ? 'bg-white border-purple-400 text-purple-950 shadow-2xs ring-1 ring-purple-200'
                          : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-black block">{method.label}</span>
                      <span className="text-[10px] text-slate-500">{method.hint}</span>
                    </button>
                  ))}
                </div>

                {walkInPaymentMethod === 'BANK_TRANSFER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Bank Tujuan / Asal Transfer</label>
                      <select
                        value={walkInBankName}
                        onChange={e => setWalkInBankName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                        <option value="CIMB Niaga">CIMB Niaga</option>
                        <option value="BSI">BSI</option>
                        <option value="Bank Lainnya">Bank Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Pengirim / Pemilik Rekening *</label>
                      <input
                        type="text"
                        required={walkInPaymentMethod === 'BANK_TRANSFER'}
                        value={walkInTransferSender}
                        onChange={e => setWalkInTransferSender(e.target.value)}
                        placeholder="Nama di mutasi rekening"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {walkInPaymentMethod !== 'CASH' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nomor Referensi / Catatan Transaksi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={walkInPaymentReference}
                      onChange={e => setWalkInPaymentReference(e.target.value)}
                      placeholder="Contoh: no referensi transfer, approval code EDC, atau kode QRIS"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingWalkIn ? 'Memproses...' : 'Terbitkan Booking Walk-In'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {settlementApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Catat Pelunasan</h3>
                  <p className="text-xs text-slate-500">Masukkan uang yang benar-benar diterima kasir.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettlementApt(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup pencatatan pelunasan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSettlement} className="p-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Kode Booking</span>
                  <strong className="text-slate-900">{settlementApt.bookingCode}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Pasien</span>
                  <strong className="text-slate-900 text-right">{settlementApt.patientName}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                  <strong className="text-sky-700">DP sudah dikonfirmasi</strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal Pelunasan Diterima (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  value={settlementAmount}
                  onChange={event => setSettlementAmount(event.target.value)}
                  placeholder="Masukkan nominal yang diterima"
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Metode Pelunasan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash' },
                    { id: 'BANK_TRANSFER', label: 'Bank' },
                    { id: 'QRIS', label: 'QRIS' },
                    { id: 'EDC', label: 'EDC' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSettlementMethod(method.id as NonNullable<Appointment['finalPaymentMethod']>)}
                      className={`min-h-10 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer ${
                        settlementMethod === method.id
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {settlementMethod !== 'CASH' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank / Channel</label>
                    <input
                      type="text"
                      value={settlementChannel}
                      onChange={event => setSettlementChannel(event.target.value)}
                      placeholder="Contoh: BCA / QRIS"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Referensi (Opsional)</label>
                    <input
                      type="text"
                      value={settlementReference}
                      onChange={event => setSettlementReference(event.target.value)}
                      placeholder="Kode transaksi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-amber-950">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <p className="text-[11px] leading-relaxed">
                  Setelah disimpan, nominal masuk ke laporan psikolog dan tidak dapat dibaca kembali dari portal admin.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementApt(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Pelunasan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {rescheduleApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Bantu Reschedule Pasien</h3>
                  <p className="text-xs text-slate-500">
                    Perubahan jadwal akan tercatat atas nama admin yang sedang login.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleApt(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup reschedule"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-5 space-y-4 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Pasien</span>
                  <strong className="text-slate-900 text-right">{rescheduleApt.patientName}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Jadwal Lama</span>
                  <strong className="text-slate-900 text-right">
                    {rescheduleApt.date} ({rescheduleApt.startTime} - {rescheduleApt.endTime} WIB)
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">Paket</span>
                  <strong className="text-slate-900 text-right">{rescheduleApt.packageName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Baru (Minimal H+1)</label>
                  <input
                    type="date"
                    required
                    min={getTomorrowDate()}
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jam Baru</label>
                  <select
                    value={rescheduleTime}
                    onChange={e => setRescheduleTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    {rescheduleTimeOptions.length === 0 ? (
                      <option value="">Tidak ada slot tersedia</option>
                    ) : rescheduleTimeOptions.map(timeRange => (
                      <option key={timeRange} value={timeRange}>{timeRange} WIB</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan Alasan Reschedule</label>
                <textarea
                  rows={3}
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  placeholder="Contoh: pasien meminta bantuan admin karena tidak bisa akses portal."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReschedule}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>{isSubmittingReschedule ? 'Menyimpan...' : 'Simpan Reschedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {receiptApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full my-auto overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div>
                <h3 className="text-base font-black text-slate-900">Receipt Pembayaran</h3>
                <p className="text-xs text-slate-500">Untuk screenshot atau print sebagai PDF.</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptApt(null)}
                className="w-9 h-9 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                aria-label="Tutup receipt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">JiwaSehat</h4>
                  <p className="text-slate-500">Bukti administrasi pembayaran dan konfirmasi jadwal.</p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900">RCPT-{receiptApt.bookingCode}</span>
                  <span className="text-slate-500">{receiptApt.createdAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Pasien</span>
                  <p className="font-bold text-slate-900">{receiptApt.patientName}</p>
                  <p className="text-slate-500">{receiptApt.patientEmail}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Jadwal</span>
                  <p className="font-bold text-slate-900">{receiptApt.date}</p>
                  <p className="text-slate-500">{receiptApt.startTime} - {receiptApt.endTime} WIB</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                  <div className="p-3">Rincian</div>
                  <div className="p-3 text-right">Data</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Paket</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.packageName}</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Status Pembayaran</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.paymentStatus}</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Metode</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.paymentMethod || 'MANUAL'}</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Channel</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.paymentChannelDetail || '-'}</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Pengirim / Kasir</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.transferSenderName || '-'}</div>
                </div>
                <div className="grid grid-cols-2 border-t border-slate-100">
                  <div className="p-3 font-bold text-slate-600">Referensi</div>
                  <div className="p-3 text-right font-bold text-slate-900">{receiptApt.paymentReference || '-'}</div>
                </div>
                {receiptApt.finalPaymentRecordedAt && (
                  <div className="grid grid-cols-2 border-t border-slate-100">
                    <div className="p-3 font-bold text-slate-600">Pelunasan</div>
                    <div className="p-3 text-right font-bold text-emerald-700">
                      Tercatat {receiptApt.finalPaymentRecordedAt}
                    </div>
                  </div>
                )}
              </div>

              {receiptApt.rescheduledAt && (
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950">
                  <span className="text-[10px] font-black uppercase text-sky-700">Audit Reschedule</span>
                  <p className="font-bold">
                    Diubah oleh {receiptApt.rescheduledByName || '-'} ({receiptApt.rescheduledByRole || '-'}) pada {receiptApt.rescheduledAt}
                  </p>
                  <p className="text-sky-800">{receiptApt.rescheduleReason || 'Tanpa catatan tambahan.'}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Simpan PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
