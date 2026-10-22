import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  ExternalLink,
  FileCheck2
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';
import { ImageWithFallback } from '../../common/ImageWithFallback';
import { computeDynamicSlotsForDate, loadScheduleSettings, SCHEDULE_SETTINGS_STORAGE_KEY, SCHEDULE_SETTINGS_UPDATED_EVENT } from '../../../data/scheduleConfig';
import { getScheduleVersion } from '../../../utils/reschedulePolicy';
import { createRecordId, getMinimumBookingDate, getPracticeDate } from '../../../utils/bookingPolicy';
import { csvRow, downloadCsv } from '../../../utils/exportEncoding';
import { PaymentReconciliation } from '../../../utils/workflowStore';
import { getCashInDate } from '../../../utils/payments';

interface ReservationsTabProps {
  appointments: Appointment[];
}

const getLocalDateString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getTomorrowDateValue = () => {
  return getMinimumBookingDate();
};

const isViewableProofUrl = (value?: string) => (
  Boolean(value) && (value!.startsWith('data:') || /^https?:\/\//i.test(value!))
);

const isImageProof = (value?: string, mimeType?: string) => (
  Boolean(value) && (
    mimeType?.startsWith('image/') ||
    value!.startsWith('data:image/') ||
    /\.(?:jpe?g|png|webp)(?:\?.*)?$/i.test(value!)
  )
);

const canVerifyBookingPayment = (appointment: Appointment) => (
  appointment.status === 'PENDING' &&
  appointment.treatmentPlanStatus !== 'DISCONTINUED' &&
  (appointment.paymentStatus === 'DP_PENDING_VERIFICATION' || appointment.paymentStatus === 'PAID' ||
    (Boolean(appointment.rescheduledAt) && appointment.paymentStatus === 'DP_PAID'))
);

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  appointments
}) => {
  const {
    users,
    currentUser,
    packages,
    bookAppointment,
    rescheduleAppointment,
    verifyPaymentAndConfirmBooking,
    confirmRescheduledBooking,
    recordFinalPayment,
    paymentReconciliations,
    slotHolds,
    landingCms,
    showToast
  } = useApp();

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
  const [reconciliation, setReconciliation] = useState<PaymentReconciliation | null>(null);
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
  const [walkInPaymentType, setWalkInPaymentType] = useState<'PAID' | 'DP_PAID'>('DP_PAID');
  const [walkInAmount, setWalkInAmount] = useState('');
  const [walkInReceivedDate, setWalkInReceivedDate] = useState(getPracticeDate());
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC'>('CASH');
  const [walkInBankName, setWalkInBankName] = useState('BCA');
  const [walkInTransferSender, setWalkInTransferSender] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const walkInSubmitting = useRef(false);
  const recordingPayment = useRef(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const receiptApt = appointments.find(item => item.id === receiptId) || null;
  const setReceiptApt = (item: Appointment | null) => setReceiptId(item?.id || null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const rescheduleApt = appointments.find(item => item.id === rescheduleId) || null;
  const setRescheduleApt = (item: Appointment | null) => setRescheduleId(item?.id || null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 - 11:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleVersion, setRescheduleVersion] = useState<number>();
  const [scheduleSettings, setScheduleSettings] = useState(loadScheduleSettings);
  useEffect(() => {
    const sync = () => setScheduleSettings(loadScheduleSettings());
    const storage = (event: StorageEvent) => { if (event.key === SCHEDULE_SETTINGS_STORAGE_KEY) sync(); };
    window.addEventListener('storage', storage);
    window.addEventListener(SCHEDULE_SETTINGS_UPDATED_EVENT, sync);
    return () => { window.removeEventListener('storage', storage); window.removeEventListener(SCHEDULE_SETTINGS_UPDATED_EVENT, sync); };
  }, []);
  const staleReschedule = Boolean(rescheduleApt && getScheduleVersion(rescheduleApt) !== rescheduleVersion);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const settlementApt = appointments.find(item => item.id === settlementId) || null;
  const setSettlementApt = (item: Appointment | null) => setSettlementId(item?.id || null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementDate, setSettlementDate] = useState(getPracticeDate());
  const [settlementMethod, setSettlementMethod] = useState<NonNullable<Appointment['finalPaymentMethod']>>('CASH');
  const [settlementChannel, setSettlementChannel] = useState('');
  const [isCancellationSettlement, setIsCancellationSettlement] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const verificationApt = appointments.find(item => item.id === verificationId) || null;
  const setVerificationApt = (item: Appointment | null) => setVerificationId(item?.id || null);
  const [verificationNote, setVerificationNote] = useState('');
  const [verificationDate, setVerificationDate] = useState(getPracticeDate());
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

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

  useEffect(() => {
    if (selectedWalkInPackage?.type === 'PSYCHOTHERAPY') {
      setWalkInPaymentType('DP_PAID');
    }
  }, [selectedWalkInPackage?.type]);
  const walkInTimeOptions = useMemo(() => {
    if (!walkInDate || !defaultPsychologistId || !selectedWalkInPackage) return [];
    const availability = computeDynamicSlotsForDate(
      walkInDate,
      scheduleSettings,
      appointments,
      defaultPsychologistId,
      selectedWalkInPackage.durationMinutes
    );
    return availability.slots
      .filter(slot => slot.isAvailable)
      .map(slot => `${slot.startTime} - ${slot.endTime}`);
  }, [appointments, defaultPsychologistId, selectedWalkInPackage, walkInDate, scheduleSettings, slotHolds]);

  useEffect(() => {
    if (!walkInTimeOptions.includes(walkInTime)) {
      setWalkInTime('');
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
      scheduleSettings,
      appointments.filter(item => item.id !== rescheduleApt.id),
      rescheduleApt.psychologistId,
      duration
    );
    return availability.slots
      .filter(slot => slot.isAvailable)
      .map(slot => `${slot.startTime} - ${slot.endTime}`);
  }, [appointments, rescheduleApt, rescheduleDate, scheduleSettings, slotHolds]);

  useEffect(() => {
    if (rescheduleApt && !rescheduleTimeOptions.includes(rescheduleTime)) {
      setRescheduleTime('');
    }
  }, [rescheduleApt, rescheduleTime, rescheduleTimeOptions]);

  const openRescheduleModal = (apt: Appointment) => {
    setRescheduleApt(apt);
    setRescheduleVersion(getScheduleVersion(apt));
    setRescheduleDate(getTomorrowDate());
    setRescheduleTime(`${apt.startTime} - ${apt.endTime}`);
    setRescheduleReason('');
  };

  const handleConfirmPayment = (apt: Appointment) => {
    setVerificationApt(apt);
    setVerificationNote('');
    setVerificationDate(apt.initialPaymentRecord?.receivedAt ? getCashInDate(apt.initialPaymentRecord.receivedAt) : getPracticeDate());
  };

  const handleVerifyPayment = async () => {
    if (!verificationApt) return;
    const isReconfirmation = Boolean(verificationApt.rescheduledAt) && ['DP_PAID', 'PAID'].includes(verificationApt.paymentStatus);
    if (!isReconfirmation && !verificationDate) {
      showToast('Tanggal Belum Diisi', 'Isi tanggal penerimaan pembayaran sebelum konfirmasi.', 'warning');
      return;
    }
    setIsVerifyingPayment(true);
    const success = isReconfirmation ? await confirmRescheduledBooking(verificationApt.id)
      : await verifyPaymentAndConfirmBooking(verificationApt.id, verificationNote, verificationDate);
    setIsVerifyingPayment(false);

    if (success) {
      const verifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setReceiptApt({
        ...verificationApt,
        status: 'CONFIRMED',
        paymentStatus: verificationApt.paymentStatus === 'PAID' || (!isReconfirmation && (verificationApt.dpAmount || 0) >= verificationApt.totalAmount) ? 'PAID' : 'DP_PAID',
        paymentVerifiedAt: isReconfirmation ? verificationApt.paymentVerifiedAt : verifiedAt,
        paymentVerifiedByName: isReconfirmation ? verificationApt.paymentVerifiedByName : currentUser?.name || 'Admin Operasional',
        paymentVerificationNote: isReconfirmation ? verificationApt.paymentVerificationNote : verificationNote.trim() || undefined
      });
      setVerificationApt(null);
      setVerificationNote('');
    }
  };

  const openSettlementModal = (apt: Appointment) => {
    setSettlementApt(apt);
    setSettlementAmount('');
    setSettlementDate(getPracticeDate());
    setSettlementMethod('CASH');
    setSettlementChannel('');
    setIsCancellationSettlement(false);
  };

  const handleRecordSettlement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settlementApt || recordingPayment.current) return;
    recordingPayment.current = true;
    setIsRecordingPayment(true);
    try {

    const success = await recordFinalPayment(settlementApt.id, {
      amount: Number(settlementAmount),
      method: settlementMethod,
      channelDetail: settlementChannel,
      purpose: isCancellationSettlement ? 'CANCELLATION_SETTLEMENT' : 'CONSULTATION',
      receivedDate: settlementDate
    });

    if (success) {
      setSettlementApt(null);
      setSettlementAmount('');
      setSettlementChannel('');
    }
    } catch (error) {
      showToast('Pembayaran Belum Dicatat', error instanceof Error ? error.message : 'Periksa riwayat sebelum mencoba kembali.', 'error');
    } finally {
      recordingPayment.current = false;
      setIsRecordingPayment(false);
    }
  };

  const handleSubmitReschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rescheduleApt) return;

    if (staleReschedule || !rescheduleTime || !rescheduleTimeOptions.includes(rescheduleTime)) {
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
        rescheduleReason.trim() || 'Dibantu reschedule oleh admin',
        rescheduleVersion
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
    const rows = filteredAppointments.map(a => csvRow([
      a.bookingCode, a.patientName, a.packageName, a.date,
      `${a.startTime} - ${a.endTime}`, a.packageType, a.status, a.paymentStatus
    ]));

    downloadCsv(`Daftar_Reservasi_JiwaSehat_${new Date().toISOString().slice(0, 10)}.csv`, [csvRow(headers), ...rows]);
  };

  const handleCreateWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (walkInSubmitting.current) return;
    walkInSubmitting.current = true;
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
        patientId = createRecordId('user-pat-walkin');
        patientName = newPatientName.trim();
        patientEmail = newPatientEmail.trim() || `${newPatientName.toLowerCase().replace(/\s+/g, '')}@walkin.jiwasehat.id`;
      }

      const targetPkg = selectedWalkInPackage;
      const times = walkInTime.split(' - ');
      const startTime = times[0]?.trim() || '10:00';
      const endTime = times[1]?.trim() || '11:00';
      const isFullPayment = !reconciliation && targetPkg.type !== 'PSYCHOTHERAPY' && walkInPaymentType === 'PAID';
      const paymentPhase = isFullPayment ? 'FULL' : 'DP';
      const paymentMethod = reconciliation ? 'BANK_TRANSFER_DP' : `${walkInPaymentMethod}_${paymentPhase}`;
      const paymentChannelDetail =
        walkInPaymentMethod === 'BANK_TRANSFER'
          ? walkInBankName
          : walkInPaymentMethod === 'QRIS'
          ? 'QRIS Klinik'
          : walkInPaymentMethod === 'EDC'
          ? 'Mesin EDC Klinik'
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
        slotId: createRecordId('slot-walkin'),
        paymentMethod,
        startTime,
        endTime,
        transferSenderName,
        paymentChannelDetail,
        initialPaymentAmount: Number(walkInAmount),
        initialPaymentReceivedDate: walkInReceivedDate,
        reconciliationId: reconciliation?.id,
        paymentProofUrl: `Walk-in ${paymentChannelDetail}`
      });

      if (res.success && res.appointment) {
        setWalkInAmount('');
        setIsWalkInModalOpen(false);
        setReconciliation(null);
        const verified = await verifyPaymentAndConfirmBooking(
          res.appointment.id,
          'Pembayaran diterima dan dicatat langsung oleh admin saat pendaftaran walk-in.',
          walkInReceivedDate
        );
        if (!verified) {
          showToast('Booking Menunggu Verifikasi', 'Booking sudah tersimpan. Lanjutkan verifikasi dari daftar reservasi; jangan membuat booking kedua.', 'warning');
          setIsSubmittingWalkIn(false);
          return;
        }
        setReceiptApt({
          ...res.appointment,
          status: 'CONFIRMED',
          paymentStatus: isFullPayment || (res.appointment.dpAmount || 0) >= res.appointment.totalAmount ? 'PAID' : 'DP_PAID',
          paymentVerifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          paymentVerifiedByName: currentUser?.name || 'Admin Operasional',
          paymentVerificationNote: 'Pembayaran diterima dan dicatat langsung oleh admin saat pendaftaran walk-in.'
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
        setWalkInAmount('');
        setNewPatientEmail('');
        setWalkInTransferSender('');
      } else {
        showToast('Gagal Membuat Booking', res.message || 'Terjadi kendala sistem.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Gagal memproses reservasi walk-in.', 'error');
    } finally {
      walkInSubmitting.current = false;
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
      {paymentReconciliations.some(item => item.status === 'OPEN') && <section className="border-b border-amber-200 pb-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Pencocokan Pembayaran</h3>
        {paymentReconciliations.filter(item => item.status === 'OPEN').map(item => {
          const originalHold = slotHolds.find(hold => hold.id === item.holdId);
          return <article key={item.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2 text-xs">
            <p className="font-semibold break-words">{item.patientName} - {item.id}</p>
            <p>Pengirim: {item.transferSenderName}. Cocokkan bukti dan mutasi sebelum konfirmasi. Jangan meminta pembayaran kedua.</p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={item.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-800 underline"><ExternalLink className="w-4 h-4" />Buka bukti</a>
              <button type="button" disabled={!originalHold} className="inline-flex items-center gap-1 font-semibold text-teal-800 disabled:opacity-40" onClick={() => {
                if (!originalHold) return;
                setReconciliation(item);
                setPatientMode('EXISTING');
                setSelectedPatientId(item.patientId);
                setSelectedPackageId(originalHold.packageId);
                setWalkInDate(getTomorrowDateValue());
                setWalkInPaymentType('DP_PAID');
                setWalkInPaymentMethod('BANK_TRANSFER');
                setWalkInTransferSender(item.transferSenderName);
                setWalkInAmount('');
                setWalkInReceivedDate(getCashInDate(item.createdAt));
                setIsWalkInModalOpen(true);
              }}><CalendarPlus className="w-4 h-4" />Siapkan jadwal pengganti</button>
            </div>
          </article>;
        })}
      </section>}
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
            onClick={() => { setReconciliation(null); setIsWalkInModalOpen(true); }}
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
                  {canVerifyBookingPayment(apt) && (
                    <button type="button" onClick={() => handleConfirmPayment(apt)} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi reservasi">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                    <button type="button" onClick={() => openRescheduleModal(apt)} className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Reschedule jadwal pasien">
                      <CalendarClock className="w-4 h-4" />
                    </button>
                  )}
                  {apt.paymentStatus === 'DP_PAID' && (apt.continuousSessionNumber || 1) === 1 && apt.treatmentPlanStatus !== 'DISCONTINUED' && (
                    <button type="button" onClick={() => openSettlementModal(apt)} className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center" aria-label="Catat pembayaran">
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
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canVerifyBookingPayment(apt) && (
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
                        {apt.paymentStatus === 'DP_PAID' && (apt.continuousSessionNumber || 1) === 1 && apt.treatmentPlanStatus !== 'DISCONTINUED' && (
                          <Tooltip content="Catat Pembayaran yang Diterima" position="top">
                            <button
                              type="button"
                              onClick={() => openSettlementModal(apt)}
                              className="w-8 h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Catat pembayaran"
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
                    onChange={e => {
                      setSelectedPackageId(e.target.value);
                      if (packages.find(pkg => pkg.id === e.target.value)?.type === 'PSYCHOTHERAPY') {
                        setWalkInPaymentType('DP_PAID');
                      }
                    }}
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
                    <option value="" disabled>Pilih jam konsultasi</option>
                    {walkInTimeOptions.map(timeRange => (
                      <option key={timeRange} value={timeRange}>{timeRange} WIB</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="block text-xs font-bold text-slate-700">
                Nominal Diterima (Rp) *
                <input required type="number" min="0" step="1" autoComplete="off" value={walkInAmount} onChange={event => setWalkInAmount(event.target.value)} className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2.5" placeholder="Uang yang benar-benar diterima" />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Tanggal Uang Diterima *
                <input required type="date" max={getPracticeDate()} value={walkInReceivedDate} onChange={event => setWalkInReceivedDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5" />
              </label>
              {/* Metode Pembayaran di Tempat */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Status Pembayaran Pasien di Meja Resepsionis
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInPaymentType('PAID')}
                    disabled={Boolean(reconciliation) || selectedWalkInPackage?.type === 'PSYCHOTHERAPY'}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      selectedWalkInPackage?.type === 'PSYCHOTHERAPY' ? 'opacity-40 cursor-not-allowed' :
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
                      Catat seluruh uang yang diterima sebagai pembayaran lunas.
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
                      <span>Bayar DP Awal</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500 block">
                      DP mengurangi biaya pertemuan sesuai arahan psikolog/pengelola.
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

              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
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
                  <h3 className="text-base font-extrabold text-slate-900">Catat Pembayaran</h3>
                  <p className="text-xs text-slate-500">Masukkan uang yang benar-benar diterima kasir.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettlementApt(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup pencatatan pembayaran"
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

              <label className="block text-xs font-bold text-slate-700">
                Tanggal Uang Diterima
                <input required type="date" max={getPracticeDate()} value={settlementDate} onChange={event => setSettlementDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5" />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={isCancellationSettlement} onChange={event => setIsCancellationSettlement(event.target.checked)} />
                Pembayaran untuk penghentian layanan
              </label>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal Diterima (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={settlementAmount}
                  onChange={event => setSettlementAmount(event.target.value)}
                  placeholder="Masukkan nominal yang diterima"
                  autoComplete="off"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Metode Pembayaran</label>
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
                <div className="animate-fadeIn">
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
                </div>
              )}

              {settlementMethod === 'QRIS' && landingCms.qrisImageUrl && <ImageWithFallback src={landingCms.qrisImageUrl} alt="QRIS kasir praktik" className="mx-auto h-48 w-48 max-w-full object-contain" fallback={<p className="text-xs text-amber-800">Gambar QRIS tidak dapat dimuat.</p>} />}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-amber-950">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <p className="text-[11px] leading-relaxed">
                  Setelah disimpan, nominal masuk ke laporan psikolog dan tidak dapat dibaca kembali dari portal admin.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementApt(null)}
                  disabled={isRecordingPayment}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Pembayaran
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
              {staleReschedule && <p role="alert" className="text-amber-800">Jadwal sudah berubah. Tutup formulir dan periksa jadwal terbaru sebelum memilih ulang.</p>}
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
                    <option value="" disabled>Pilih jam baru</option>
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

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReschedule || staleReschedule || !rescheduleTime || !rescheduleTimeOptions.includes(rescheduleTime)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
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

      {verificationApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900">{verificationApt.rescheduledAt && ['DP_PAID', 'PAID'].includes(verificationApt.paymentStatus) ? 'Konfirmasi Perubahan Jadwal' : 'Verifikasi Bukti Pembayaran'}</h3>
                  <p className="text-xs text-slate-500 truncate">{verificationApt.bookingCode} - {verificationApt.patientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerificationApt(null)}
                disabled={isVerifyingPayment}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center disabled:opacity-50"
                aria-label="Tutup verifikasi pembayaran"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {verificationApt.rescheduledAt && ['DP_PAID', 'PAID'].includes(verificationApt.paymentStatus) && (
                <p className="text-xs text-emerald-700">Pembayaran sudah terverifikasi. Konfirmasi ini hanya menyetujui jadwal baru tanpa DP tambahan.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-[10px] font-black uppercase text-slate-400">Booking</span>
                  <p className="font-bold text-slate-900 mt-1">{verificationApt.packageName}</p>
                  <p className="text-slate-600 mt-0.5">{verificationApt.date}, {verificationApt.startTime} - {verificationApt.endTime} WIB</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-[10px] font-black uppercase text-slate-400">Transaksi</span>
                  <p className="font-bold text-slate-900 mt-1">{verificationApt.paymentMethod || 'Tanpa pembayaran'}</p>
                  <p className="text-slate-600 mt-0.5">{verificationApt.paymentChannelDetail || '-'}</p>
                </div>
              </div>

              <div className="text-xs">
                <span className="block text-[10px] font-black uppercase text-slate-400">Nama Pengirim</span>
                <p className="font-bold text-slate-900 mt-1">{verificationApt.transferSenderName || '-'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400">Bukti Pembayaran</span>
                    <span className="block text-xs font-bold text-slate-800 mt-0.5">
                      {verificationApt.paymentProofName || (
                        isViewableProofUrl(verificationApt.paymentProofUrl)
                          ? 'Bukti pembayaran terlampir'
                          : verificationApt.paymentProofUrl || 'Tidak diperlukan'
                      )}
                    </span>
                  </div>
                  {isViewableProofUrl(verificationApt.paymentProofUrl) && (
                    <a
                      href={verificationApt.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0"
                      aria-label="Buka bukti pembayaran"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {isImageProof(verificationApt.paymentProofUrl, verificationApt.paymentProofMimeType) ? (
                  <div className="p-3 bg-slate-100">
                    <img
                      src={verificationApt.paymentProofUrl}
                      alt={`Bukti pembayaran ${verificationApt.bookingCode}`}
                      className="w-full max-h-80 object-contain rounded-lg bg-white border border-slate-200"
                    />
                  </div>
                ) : isViewableProofUrl(verificationApt.paymentProofUrl) ? (
                  <div className="p-5 text-center text-xs text-slate-500">
                    Gunakan tombol buka untuk memeriksa dokumen bukti pembayaran.
                  </div>
                ) : verificationApt.paymentProofUrl ? (
                  <div className="p-5 text-center text-xs text-amber-700 bg-amber-50">
                    Data lama hanya menyimpan nama bukti. Admin perlu mencocokkan transaksi dengan mutasi rekening atau catatan penerimaan langsung.
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-slate-500">
                    Booking tanpa tagihan tidak memerlukan bukti pembayaran.
                  </div>
                )}
              </div>

              <div>
                {!(verificationApt.rescheduledAt && ['DP_PAID', 'PAID'].includes(verificationApt.paymentStatus)) && <label className="block text-xs font-bold text-slate-700 mb-4">
                  Tanggal Uang Diterima
                  <input required type="date" max={getPracticeDate()} value={verificationDate} onChange={event => setVerificationDate(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5" />
                </label>}
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Verifikasi (Opsional)</label>
                <textarea
                  rows={3}
                  value={verificationNote}
                  onChange={event => setVerificationNote(event.target.value)}
                  placeholder="Contoh: nama pengirim sesuai dengan bukti dan mutasi bank."
                  className="w-full resize-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerificationApt(null)}
                disabled={isVerifyingPayment}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold disabled:opacity-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifyingPayment}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerifyingPayment ? 'Menyimpan...' : verificationApt.rescheduledAt && ['DP_PAID', 'PAID'].includes(verificationApt.paymentStatus) ? 'Konfirmasi Jadwal Baru' : 'Verifikasi & Konfirmasi Booking'}</span>
              </button>
            </div>
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
                {receiptApt.finalPaymentRecordedAt && (
                  <div className="grid grid-cols-2 border-t border-slate-100">
                    <div className="p-3 font-bold text-slate-600">Pembayaran Masuk</div>
                    <div className="p-3 text-right font-bold text-emerald-700">
                      Tercatat {receiptApt.finalPaymentRecordedAt}
                    </div>
                  </div>
                )}
                {receiptApt.paymentVerifiedAt && (
                  <div className="grid grid-cols-2 border-t border-slate-100">
                    <div className="p-3 font-bold text-slate-600">Diverifikasi</div>
                    <div className="p-3 text-right font-bold text-emerald-700">
                      {receiptApt.paymentVerifiedByName || 'Admin'} - {receiptApt.paymentVerifiedAt}
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

            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptApt(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
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
