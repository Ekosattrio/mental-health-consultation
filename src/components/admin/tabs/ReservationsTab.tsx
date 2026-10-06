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
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface ReservationsTabProps {
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: any) => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  appointments,
  updateAppointmentStatus
}) => {
  const { users, packages, bookAppointment, showToast } = useApp();

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
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string>(
    users.find(u => u.role === 'PSYCHOLOGIST')?.id || 'user-psy-1'
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    packages[0]?.id || ''
  );
  const [walkInDate, setWalkInDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [walkInTime, setWalkInTime] = useState<string>('10:00 - 11:00');
  const [walkInPaymentType, setWalkInPaymentType] = useState<'PAID' | 'DP_PAID'>('PAID');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'EDC'>('CASH');
  const [walkInBankName, setWalkInBankName] = useState('BCA');
  const [walkInTransferSender, setWalkInTransferSender] = useState('');
  const [walkInPaymentReference, setWalkInPaymentReference] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  const psychologistUsers = useMemo(() => {
    return users.filter(u => u.role === 'PSYCHOLOGIST');
  }, [users]);

  const existingPatients = useMemo(() => {
    return users.filter(u => u.role === 'PATIENT');
  }, [users]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const q = resSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.psychologistName.toLowerCase().includes(q);
      const matchesStatus = resStatusFilter === 'ALL' || apt.status === resStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, resSearchQuery, resStatusFilter]);

  const handleExportCsv = () => {
    const headers = ['Kode Booking', 'Pasien', 'Psikolog', 'Paket', 'Tanggal', 'Jam', 'Tipe', 'Status', 'Pembayaran', 'Total (Rp)'];
    const rows = filteredAppointments.map(a => [
      `"${a.bookingCode}"`,
      `"${a.patientName.replace(/"/g, '""')}"`,
      `"${a.psychologistName.replace(/"/g, '""')}"`,
      `"${a.packageName.replace(/"/g, '""')}"`,
      `"${a.date}"`,
      `"${a.startTime} - ${a.endTime}"`,
      `"${a.packageType}"`,
      `"${a.status}"`,
      `"${a.paymentStatus}"`,
      a.totalAmount || 0
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

      const targetPkg = packages.find(p => p.id === selectedPackageId) || packages[0];
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
        psychologistId: selectedPsychologistId,
        packageId: targetPkg.id,
        date: walkInDate,
        slotId: `slot-walkin-${Date.now()}`,
        paymentMethod,
        startTime,
        endTime,
        dpAmount: targetPkg.dpAmount || 100000,
        transferSenderName,
        paymentChannelDetail,
        paymentReference: walkInPaymentReference.trim(),
        paymentProofUrl: `Walk-in ${paymentChannelDetail}`
      });

      if (res.success && res.appointment) {
        // Otomatis verifikasi dan konfirmasi booking walk-in oleh admin
        updateAppointmentStatus(res.appointment.id, 'CONFIRMED');
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

  const activeSelectedPackage = packages.find(p => p.id === selectedPackageId) || packages[0];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Booking, Verifikasi DP, dan Bantuan Reschedule</h3>
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
              <strong className="block mb-0.5">Verifikasi DP Pasien (Rp 100.000)</strong>
              Booking baru berstatus <em>Pending</em> wajib diverifikasi setelah bukti transfer DP administrasi valid.
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

        <div className="overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full min-w-[760px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Psikolog</th>
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
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan reservasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4 text-slate-700">{apt.psychologistName.split(',')[0]}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{apt.packageName}</div>
                      {apt.continuousSessionTotal && apt.continuousSessionTotal > 1 && (
                        <div className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                          Sesi {apt.continuousSessionNumber || 1}/{apt.continuousSessionTotal}
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Rp {apt.totalAmount.toLocaleString('id-ID')}
                      </div>
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
                      <div className="text-[10px] text-slate-500 mt-1">
                        DP Admin Rp {(apt.dpAmount || 100000).toLocaleString('id-ID')}
                      </div>
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
                          <Tooltip content="Verifikasi DP & Konfirmasi Booking" position="top">
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Konfirmasi Reservasi"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {apt.status !== 'PENDING' && (
                          <span className="text-[10px] font-bold text-slate-400">
                            Tidak ada aksi
                          </span>
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

              {/* Pilihan Psikolog & Paket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Psikolog yang Melayani *</label>
                  <select
                    value={selectedPsychologistId}
                    onChange={e => setSelectedPsychologistId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {psychologistUsers.map(psy => (
                      <option key={psy.id} value={psy.id}>
                        {psy.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Pilihan Paket Layanan *</label>
                  <select
                    value={selectedPackageId}
                    onChange={e => setSelectedPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.durationMinutes} mnt) - Rp {pkg.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rincian Tarif & DP Paket */}
              {activeSelectedPackage && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Tarif Total Paket:</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      Rp {activeSelectedPackage.price.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Ketentuan DP Administrasi:</span>
                    <strong className="text-purple-700 font-mono text-sm">
                      Rp {(activeSelectedPackage.dpAmount || 100000).toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              )}

              {/* Tanggal & Waktu Sesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Tanggal Sesi Konsultasi *</label>
                  <input
                    type="date"
                    required
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
                    <option value="09:00 - 10:00">09:00 - 10:00 WIB (Pagi)</option>
                    <option value="10:30 - 11:30">10:30 - 11:30 WIB (Pagi)</option>
                    <option value="13:00 - 14:00">13:00 - 14:00 WIB (Siang)</option>
                    <option value="14:30 - 15:30">14:30 - 15:30 WIB (Siang)</option>
                    <option value="16:00 - 17:00">16:00 - 17:00 WIB (Sore)</option>
                    <option value="19:00 - 20:00">19:00 - 20:00 WIB (Malam)</option>
                  </select>
                </div>
              </div>

              {/* Metode Pembayaran di Tempat */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Nominal Pembayaran Pasien di Meja Resepsionis
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
                      Kasir Klinik / EDC / Tunai Penuh
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
                      DP Rp 100.000 (Pelunasan nanti)
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
    </div>
  );
};
