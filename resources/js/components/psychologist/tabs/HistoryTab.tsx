import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, CheckCheck, History, CalendarPlus, CalendarClock, X, UserX, XCircle } from 'lucide-react';
import { RescheduleModal } from '../../patient/RescheduleModal';
import { Tooltip } from '../../common/Tooltip';
import { computeDynamicSlotsForDate, loadScheduleSettings } from '../../../data/scheduleConfig';
import { isPlanInitialPaymentVerified } from '../../../utils/payments';
import { getMinimumBookingDate } from '../../../utils/bookingPolicy';
import { RescheduleOptions } from '../../../utils/reschedulePolicy';
import {useServerAvailability} from '../../../integration/useServerAvailability';

interface HistoryTabProps {
  myAppointments: Appointment[];
  operatorLabel?: string;
  operatorRole?: 'ADMIN' | 'PSYCHOLOGIST';
  onCompleteAppointment: (appointmentId: string) => Promise<boolean>;
  onMarkNoShow: (appointmentId: string, reason: string) => Promise<boolean>;
  onCancelAppointment: (appointmentId: string, reason: string) => Promise<boolean>;
  onScheduleNextSession: (appointmentId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  onReschedule: (appointmentId: string, date: string, startTime: string, endTime: string, reason?: string, expectedVersion?: number, options?: RescheduleOptions) => Promise<boolean>;
}

const getTomorrowDate = () => {
  return getMinimumBookingDate();
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  myAppointments,
  operatorLabel = 'Psikolog',
  operatorRole = 'PSYCHOLOGIST',
  onCompleteAppointment,
  onMarkNoShow,
  onCancelAppointment,
  onScheduleNextSession,
  onReschedule
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const rescheduleAppointment = myAppointments.find(item => item.id === rescheduleId) || null;
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
  const [statusReason, setStatusReason] = useState('');
  useEffect(() => { setStatusReason(''); }, [pendingStatusAction]);
  const itemsPerPage = 8;
  const serverNext=useServerAvailability(nextDate,nextSessionSource?Math.max((Number(nextSessionSource.endTime.slice(0,2))*60+Number(nextSessionSource.endTime.slice(3)))-(Number(nextSessionSource.startTime.slice(0,2))*60+Number(nextSessionSource.startTime.slice(3))),30):60,nextSessionSource?.psychologistId??'',undefined,!!nextSessionSource);

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

  const nextSessionAvailability = useMemo(() => {
    if (!nextSessionSource || !nextDate) return { slots: [], reason: '' };
    if(serverNext)return serverNext;
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    const duration = Math.max(
      toMinutes(nextSessionSource.endTime) - toMinutes(nextSessionSource.startTime),
      30
    );
    return computeDynamicSlotsForDate(
      nextDate,
      loadScheduleSettings(),
      myAppointments,
      nextSessionSource.psychologistId,
      duration
    );
  }, [myAppointments, nextDate, nextSessionSource,serverNext]);

  const availableNextSessionSlots = useMemo(
    () => nextSessionAvailability.slots.filter(slot => slot.isAvailable),
    [nextSessionAvailability.slots]
  );

  useEffect(() => {
    if (!nextSessionSource) return;
    const selectedStillAvailable = availableNextSessionSlots.some(
      slot => slot.startTime === nextStartTime && slot.endTime === nextEndTime
    );
    if (!selectedStillAvailable) {
      setNextStartTime(availableNextSessionSlots[0]?.startTime || '');
      setNextEndTime(availableNextSessionSlots[0]?.endTime || '');
    }
  }, [availableNextSessionSlots, nextEndTime, nextSessionSource, nextStartTime]);

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
    if(operatorRole!=='PSYCHOLOGIST')return false;
    const currentNumber = apt.continuousSessionNumber || 1;
    const totalSessions = apt.continuousSessionTotal || 1;
    if (
      apt.status !== 'COMPLETED' ||
      apt.treatmentPlanStatus === 'DISCONTINUED' ||
      !isPlanInitialPaymentVerified(apt, myAppointments) ||
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
    const selectedSlotAvailable = availableNextSessionSlots.some(
      slot => slot.startTime === nextStartTime && slot.endTime === nextEndTime
    );
    if (!selectedSlotAvailable) return;
    setIsSchedulingNext(true);
    const success = await onScheduleNextSession(nextSessionSource.id, nextDate, nextStartTime, nextEndTime);
    setIsSchedulingNext(false);
    if (success) closeNextSessionModal();
  };

  const confirmStatusAction = async () => {
    if (!pendingStatusAction) return;
    const { appointment, type } = pendingStatusAction;
    const success = await (type === 'COMPLETE' ? onCompleteAppointment(appointment.id)
      : type === 'NO_SHOW' ? onMarkNoShow(appointment.id, statusReason)
      : onCancelAppointment(appointment.id, statusReason));
    if (success) setPendingStatusAction(null);
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-indigo-700">
                  {apt.continuousSessionTotal && apt.continuousSessionTotal > 1
                    ? `Sesi ${apt.continuousSessionNumber || 1}/${apt.continuousSessionTotal}`
                    : 'Sesi tunggal'}
                </span>
                <div className="flex items-center gap-2">
                  {['CONFIRMED', 'NO_SHOW'].includes(apt.status) && !['DISCONTINUED', 'COMPLETED'].includes(apt.treatmentPlanStatus || '') && (
                    <Tooltip content="Konfirmasi dan jadwalkan ulang tanpa DP tambahan">
                      <button type="button" onClick={() => setRescheduleId(apt.id)} className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi dan jadwalkan ulang">
                        <CalendarClock className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  )}
                  {operatorRole==='PSYCHOLOGIST'&&apt.status === 'CONFIRMED' && (
                    <>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'COMPLETE' })} className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Tandai sesi selesai">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'NO_SHOW' })} className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center" aria-label="Tandai pasien tidak hadir">
                        <UserX className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center" aria-label="Batalkan seluruh layanan setelah lunas" title="Batalkan seluruh layanan setelah lunas">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {operatorRole==='PSYCHOLOGIST'&&apt.status==='IN_PROGRESS'&&<Tooltip content="Selesaikan sesi yang sedang berlangsung"><button type="button" onClick={()=>setPendingStatusAction({appointment:apt,type:'COMPLETE'})} className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Tandai sesi selesai"><CheckCheck className="w-4 h-4"/></button></Tooltip>}
                  {canScheduleNextSession(apt) && (
                    <button type="button" onClick={() => openNextSessionModal(apt)} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center" aria-label="Jadwalkan sesi berikutnya">
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  )}
                  {operatorRole==='PSYCHOLOGIST'&&['PENDING', 'NO_SHOW'].includes(apt.status) && apt.treatmentPlanStatus !== 'DISCONTINUED' && (
                    <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center" aria-label="Batalkan seluruh layanan setelah lunas" title="Batalkan seluruh layanan setelah lunas">
                      <XCircle className="w-4 h-4" />
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
                <th className="py-3 px-4 text-right">Aksi {operatorLabel}</th>
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
                        {operatorRole==='PSYCHOLOGIST'&&apt.status === 'CONFIRMED' && (
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
                            <Tooltip content="Batalkan seluruh layanan setelah lunas" position="left">
                              <button
                                type="button"
                                onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })}
                                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                aria-label="Batalkan seluruh layanan setelah lunas"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </>
                        )}

                        {operatorRole==='PSYCHOLOGIST'&&apt.status==='IN_PROGRESS'&&<Tooltip content="Selesaikan sesi yang sedang berlangsung"><button type="button" onClick={()=>setPendingStatusAction({appointment:apt,type:'COMPLETE'})} className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center" aria-label="Tandai sesi selesai"><CheckCheck className="w-4 h-4"/></button></Tooltip>}
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

                        {['CONFIRMED', 'NO_SHOW'].includes(apt.status) && !['DISCONTINUED', 'COMPLETED'].includes(apt.treatmentPlanStatus || '') && (
                          <Tooltip content="Konfirmasi dan jadwalkan ulang tanpa DP tambahan">
                            <button type="button" onClick={() => setRescheduleId(apt.id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi dan jadwalkan ulang">
                              <CalendarClock className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {operatorRole==='PSYCHOLOGIST'&&['PENDING', 'NO_SHOW'].includes(apt.status) && apt.treatmentPlanStatus !== 'DISCONTINUED' && (
                          <Tooltip content="Batalkan seluruh layanan setelah lunas">
                            <button type="button" onClick={() => setPendingStatusAction({ appointment: apt, type: 'CANCEL' })} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center" aria-label="Batalkan seluruh layanan setelah lunas">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        {apt.status === 'CANCELLED' && (
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
          <div className="viewport-dialog w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
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
                Petugas menjadwalkan pertemuan lanjutan setelah sesi sebelumnya selesai agar slot klinik tetap akurat dan tidak mengunci jadwal berlebihan.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Sesi Lanjutan</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={e => setNextDate(e.target.value)}
                  min={getTomorrowDate()}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Slot Praktik Tersedia</label>
                {availableNextSessionSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {availableNextSessionSlots.map(slot => {
                      const selected = slot.startTime === nextStartTime && slot.endTime === nextEndTime;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setNextStartTime(slot.startTime);
                            setNextEndTime(slot.endTime);
                          }}
                          className={`min-h-11 px-3 py-2 rounded-xl border text-xs font-black transition-colors ${
                            selected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900">
                    {nextSessionAvailability.reason || 'Tidak ada slot tersedia pada tanggal ini. Pilih tanggal lain.'}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 bg-slate-50/70">
              <button
                type="button"
                onClick={closeNextSessionModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleScheduleNext}
                disabled={isSchedulingNext || availableNextSessionSlots.length === 0 || !nextStartTime || !nextEndTime}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSchedulingNext ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <RescheduleModal
        operatorRole={operatorRole}
        key={rescheduleId || 'closed'}
        isOpen={Boolean(rescheduleAppointment)}
        onClose={() => setRescheduleId(null)}
        appointment={rescheduleAppointment}
        appointments={myAppointments}
        onConfirmReschedule={onReschedule}
        requiresAdminConfirmation={false}
      />

      {pendingStatusAction && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="viewport-dialog w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
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
              {pendingStatusAction.type === 'NO_SHOW' && 'Catat ketidakhadiran setelah konfirmasi manual. Sesi tidak otomatis selesai atau dibatalkan; psikolog dapat menetapkan jadwal pengganti tanpa DP tambahan.'}
              {pendingStatusAction.type === 'CANCEL' && 'Seluruh sisa jadwal pada rencana ini akan dibatalkan dan layanan dihentikan. Pembayaran wajib lunas terlebih dahulu.'}
              {pendingStatusAction.type !== 'COMPLETE' && (
                <label className="block mt-4 text-xs font-bold">
                  Alasan *
                  <textarea value={statusReason} onChange={event => setStatusReason(event.target.value)} rows={3} className="mt-2 w-full border border-slate-200 rounded-lg p-3 resize-none" />
                </label>
              )}
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setPendingStatusAction(null)} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600">Kembali</button>
              <button
                type="button"
                onClick={confirmStatusAction}
                disabled={pendingStatusAction.type !== 'COMPLETE' && !statusReason.trim()}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-white text-xs font-bold ${
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
