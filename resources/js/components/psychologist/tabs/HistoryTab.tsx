import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, CheckCheck, History, CalendarPlus, X, UserX, XCircle } from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface HistoryTabProps {
  myAppointments: Appointment[];
  onCompleteAppointment: (appointmentId: string) => void;
  onMarkNoShow: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onScheduleNextSession: (appointmentId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
}

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  myAppointments,
  onCompleteAppointment,
  onMarkNoShow,
  onCancelAppointment,
  onScheduleNextSession
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [nextSessionSource, setNextSessionSource] = useState<Appointment | null>(null);
  const [nextDate, setNextDate] = useState(getTomorrowDate());
  const [nextStartTime, setNextStartTime] = useState('09:00');
  const [nextEndTime, setNextEndTime] = useState('10:00');
  const [isSchedulingNext, setIsSchedulingNext] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<{
    appointment: Appointment;
    type: 'COMPLETE' | 'NO_SHOW' | 'CANCEL';
  } | null>(null);
  const itemsPerPage = 8;

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredAppointments = useMemo(() => {
    return myAppointments.filter(apt => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.packageName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myAppointments, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = useMemo(() => {
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, startIndex, itemsPerPage]);

  const getPlanAppointments = (apt: Appointment) => {
    if (apt.treatmentPlanId) {
      return myAppointments.filter(item => item.treatmentPlanId === apt.treatmentPlanId);
    }

    return myAppointments.filter(item =>
      item.patientId === apt.patientId &&
      item.psychologistId === apt.psychologistId &&
      item.packageId === apt.packageId &&
      item.continuousSessionTotal === apt.continuousSessionTotal
    );
  };

  const canScheduleNextSession = (apt: Appointment) => {
    const currentNumber = apt.continuousSessionNumber || 1;
    const totalSessions = apt.continuousSessionTotal || 1;
    if (
      apt.status !== 'COMPLETED' ||
      apt.treatmentPlanStatus === 'DISCONTINUED' ||
      totalSessions <= 1 ||
      currentNumber >= totalSessions
    ) return false;

    const planAppointments = getPlanAppointments(apt);
    const hasNextSession = planAppointments.some(item => (item.continuousSessionNumber || 1) === currentNumber + 1);
    return !hasNextSession;
  };

  const openNextSessionModal = (apt: Appointment) => {
    setNextSessionSource(apt);
    setNextDate(getTomorrowDate());
    setNextStartTime(apt.startTime || '09:00');
    setNextEndTime(apt.endTime || '10:00');
  };

  const closeNextSessionModal = () => {
    setNextSessionSource(null);
    setIsSchedulingNext(false);
  };

  const handleScheduleNext = async () => {
    if (!nextSessionSource) return;
    setIsSchedulingNext(true);
    const success = await onScheduleNextSession(nextSessionSource.id, nextDate, nextStartTime, nextEndTime);
    setIsSchedulingNext(false);
    if (success) closeNextSessionModal();
  };

  const confirmStatusAction = () => {
    if (!pendingStatusAction) return;
    const { appointment, type } = pendingStatusAction;
    if (type === 'COMPLETE') onCompleteAppointment(appointment.id);
    if (type === 'NO_SHOW') onMarkNoShow(appointment.id);
    if (type === 'CANCEL') onCancelAppointment(appointment.id);
    setPendingStatusAction(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekap Histori Seluruh Sesi Konseling</h3>
              <p className="text-xs text-slate-500">
                Histori jadwal dan dokumentasi status sesi konsultasi psikologi yang telah ditangani.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              Total {filteredAppointments.length} Sesi
            </span>
          </div>
        </div>

        {/* Filter & Search Bar: Search di Kiri, Filter di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama pasien, atau nama paket..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 overflow-x-auto">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'COMPLETED', label: 'Selesai' },
              { id: 'CONFIRMED', label: 'Terkonfirmasi' },
              { id: 'PENDING', label: 'Menunggu' },
              { id: 'NO_SHOW', label: 'Tidak Hadir' },
              { id: 'CANCELLED', label: 'Batal' }
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:hidden divide-y divide-slate-100 border-y border-slate-200">
          {paginatedAppointments.length === 0 ? (
            <div className="py-10 px-4 text-center text-xs text-slate-400">
              Tidak ditemukan riwayat sesi konseling yang cocok.
            </div>
          ) : paginatedAppointments.map(apt => (
            <article key={apt.id} className="p-4 bg-white space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-black text-slate-900 truncate">{apt.patientName}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{apt.bookingCode}</div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 ${
                  apt.status === 'COMPLETED'
                    ? 'bg-slate-200 text-slate-800'
                    : apt.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : apt.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : apt.status === 'NO_SHOW'
                    ? 'bg-orange-100 text-orange-800'
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
                <span className="text-[10px] font-bold text-indigo-700">
                  {apt.continuousSessionTotal && apt.continuousSessionTotal > 1
                    ? `Sesi ${apt.continuousSessionNumber || 1}/${apt.continuousSessionTotal}`
                    : 'Sesi tunggal'}
                </span>
                <div className="flex items-center gap-2">
                  {apt.status === 'CONFIRMED' && (
                    <>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'COMPLETE' })} className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Tandai sesi selesai">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'NO_SHOW' })} className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center" aria-label="Tandai pasien tidak hadir">
                        <UserX className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center" aria-label="Batalkan sesi">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {canScheduleNextSession(apt) && (
                    <button type="button" onClick={() => openNextSessionModal(apt)} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center" aria-label="Jadwalkan sesi berikutnya">
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  )}
                  {apt.status === 'COMPLETED' && !canScheduleNextSession(apt) && (
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center" aria-label="Sesi sudah selesai">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Tabel Data */}
        <div className="hidden md:block overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full min-w-[700px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Kode Booking</th>
                <th className="py-3 px-4">Pasien</th>
                <th className="py-3 px-4">Paket Layanan</th>
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Psikolog</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ditemukan riwayat sesi konseling yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt, idx) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{apt.bookingCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{apt.packageName}</div>
                      {apt.continuousSessionTotal && apt.continuousSessionTotal > 1 && (
                        <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                          Sesi {apt.continuousSessionNumber || 1} dari {apt.continuousSessionTotal}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {apt.date} ({apt.startTime} - {apt.endTime})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'COMPLETED'
                            ? 'bg-slate-200 text-slate-800'
                            : apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : apt.status === 'NO_SHOW'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'CONFIRMED' && (
                          <>
                            <Tooltip content="Tandai sesi konsultasi selesai" position="left">
                              <button
                                type="button"
                                onClick={() => setPendingStatusAction({ appointment: apt, type: 'COMPLETE' })}
                                className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                aria-label="Tandai sesi konsultasi selesai"
                              >
                                <CheckCheck className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Tandai pasien tidak hadir" position="left">
                              <button
                                type="button"
                                onClick={() => setPendingStatusAction({ appointment: apt, type: 'NO_SHOW' })}
                                className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                aria-label="Tandai pasien tidak hadir"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Batalkan sesi oleh psikolog" position="left">
                              <button
                                type="button"
                                onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })}
                                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                aria-label="Batalkan sesi oleh psikolog"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </>
                        )}

                        {canScheduleNextSession(apt) && (
                          <Tooltip content="Jadwalkan sesi berikutnya" position="left">
                            <button
                              type="button"
                              onClick={() => openNextSessionModal(apt)}
                              className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                              aria-label="Jadwalkan sesi berikutnya"
                            >
                              <CalendarPlus className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}

                        {apt.status === 'COMPLETED' && !canScheduleNextSession(apt) && (
                          <Tooltip content="Sesi sudah selesai" position="left">
                            <span
                              className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center"
                              aria-label="Sesi sudah selesai"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          </Tooltip>
                        )}

                        {apt.status !== 'CONFIRMED' && apt.status !== 'COMPLETED' && (
                          <span className="text-[11px] text-slate-400 font-semibold">-</span>
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
              <strong className="text-slate-800">{filteredAppointments.length}</strong> sesi
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
                      ? 'bg-sky-600 text-white shadow-2xs'
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

      {nextSessionSource && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Jadwalkan Sesi Berikutnya</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesi {(nextSessionSource.continuousSessionNumber || 1) + 1} dari {nextSessionSource.continuousSessionTotal} untuk {nextSessionSource.patientName}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeNextSessionModal}
                className="w-9 h-9 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                aria-label="Tutup modal jadwal sesi lanjutan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-xs text-indigo-900">
                Sistem tidak membuat semua sesi sekaligus. Psikolog menjadwalkan pertemuan lanjutan setelah sesi sebelumnya selesai agar slot klinik tetap akurat dan tidak mengunci jadwal berlebihan.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Sesi Lanjutan</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={e => setNextDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Mulai</label>
                  <input
                    type="time"
                    value={nextStartTime}
                    onChange={e => setNextStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Selesai</label>
                  <input
                    type="time"
                    value={nextEndTime}
                    onChange={e => setNextEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/70">
              <button
                type="button"
                onClick={closeNextSessionModal}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleScheduleNext}
                disabled={isSchedulingNext}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSchedulingNext ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {pendingStatusAction && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Konfirmasi Status Sesi</h3>
                <p className="text-xs text-slate-500 mt-0.5">{pendingStatusAction.appointment.bookingCode} - {pendingStatusAction.appointment.patientName}</p>
              </div>
              <button type="button" onClick={() => setPendingStatusAction(null)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center" aria-label="Tutup konfirmasi status sesi">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 leading-relaxed">
              {pendingStatusAction.type === 'COMPLETE' && 'Pastikan konsultasi benar-benar selesai sebelum mengubah status sesi.'}
              {pendingStatusAction.type === 'NO_SHOW' && 'Pasien akan dicatat tidak hadir. Status ini memengaruhi progres paket berjalan.'}
              {pendingStatusAction.type === 'CANCEL' && 'Sesi akan dibatalkan oleh psikolog. Tindakan ini tidak tersedia untuk admin.'}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingStatusAction(null)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600">Kembali</button>
              <button
                type="button"
                onClick={confirmStatusAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold ${
                  pendingStatusAction.type === 'COMPLETE' ? 'bg-sky-600' : pendingStatusAction.type === 'NO_SHOW' ? 'bg-orange-600' : 'bg-rose-600'
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
