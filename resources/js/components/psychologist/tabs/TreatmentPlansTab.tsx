import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { CalendarPlus, CalendarClock, CheckCircle2, CircleStop, ClipboardList, CreditCard, Search, X } from 'lucide-react';
import { RescheduleModal } from '../../patient/RescheduleModal';
import { Tooltip } from '../../common/Tooltip';
import { computeDynamicSlotsForDate, loadScheduleSettings } from '../../../data/scheduleConfig';
import { getTreatmentPlanBalance, getSessionRate, isPlanInitialPaymentVerified, getPaymentSummary } from '../../../utils/payments';
import { getMinimumBookingDate } from '../../../utils/bookingPolicy';
import { PaymentProgress } from '../../common/PaymentProgress';
import { RescheduleOptions } from '../../../utils/reschedulePolicy';
import {useServerAvailability} from '../../../integration/useServerAvailability';

interface TreatmentPlansTabProps {
  appointments: Appointment[];
  hideFinancialDetails?: boolean;
  operatorRole?: 'ADMIN' | 'PSYCHOLOGIST';
  onScheduleNextSession: (appointmentId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  onDiscontinuePlan: (appointmentId: string, reason: string) => Promise<boolean>;
  onReschedule: (appointmentId: string, date: string, startTime: string, endTime: string, reason?: string, expectedVersion?: number, options?: RescheduleOptions) => Promise<boolean>;
}

interface TreatmentPlanView {
  id: string;
  patientName: string;
  packageName: string;
  totalSessions: number;
  completedSessions: number;
  nextAppointment?: Appointment;
  lastAppointment: Appointment;
  billingAppointment?: Appointment;
  appointments: Appointment[];
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED' | 'AWAITING_SETTLEMENT';
}

const getTomorrowDate = () => {
  return getMinimumBookingDate();
};

export const TreatmentPlansTab: React.FC<TreatmentPlansTabProps> = ({
  appointments,
  hideFinancialDetails = false,
  operatorRole = 'PSYCHOLOGIST',
  onScheduleNextSession,
  onDiscontinuePlan,
  onReschedule
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const rescheduleAppointment = appointments.find(item => item.id === rescheduleId) || null;
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlanView | null>(null);
  const [nextDate, setNextDate] = useState(getTomorrowDate());
  const [nextStartTime, setNextStartTime] = useState('09:00');
  const [nextEndTime, setNextEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discontinuingPlan, setDiscontinuingPlan] = useState<TreatmentPlanView | null>(null);
  const [discontinueReason, setDiscontinueReason] = useState('');
  const serverNext=useServerAvailability(nextDate,selectedPlan?Math.max((Number(selectedPlan.lastAppointment.endTime.slice(0,2))*60+Number(selectedPlan.lastAppointment.endTime.slice(3)))-(Number(selectedPlan.lastAppointment.startTime.slice(0,2))*60+Number(selectedPlan.lastAppointment.startTime.slice(3))),30):60,selectedPlan?.lastAppointment.psychologistId??'',undefined,!!selectedPlan);

  const plans = useMemo<TreatmentPlanView[]>(() => {
    const grouped = new Map<string, Appointment[]>();

    appointments
      .filter(apt => (apt.continuousSessionTotal || 1) > 1)
      .forEach(apt => {
        const key = apt.treatmentPlanId || `${apt.patientId}-${apt.psychologistId}-${apt.packageId}-${apt.continuousSessionTotal}`;
        grouped.set(key, [...(grouped.get(key) || []), apt]);
      });

    return Array.from(grouped.entries()).map(([id, items]) => {
      const sorted = [...items].sort((a, b) => (a.continuousSessionNumber || 1) - (b.continuousSessionNumber || 1));
      const totalSessions = Math.max(...sorted.map(apt => apt.continuousSessionTotal || 1));
      const completedSessions = sorted.filter(apt => apt.status === 'COMPLETED').length;
      const activeNext = sorted
        .filter(apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS')
        .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];
      const billingAppointment = sorted[0]?.billingMode === 'PER_SESSION' ? sorted[sorted.length - 1] : sorted.find(apt => (apt.totalAmount || apt.subtotalAmount || apt.dpAmount || 0) > 0) || sorted[0];
      const discontinued = sorted.some(apt => apt.treatmentPlanStatus === 'DISCONTINUED');

      return {
        id,
        patientName: sorted[0]?.patientName || '-',
        packageName: sorted[0]?.packageName || '-',
        totalSessions,
        completedSessions,
        nextAppointment: activeNext,
        lastAppointment: sorted[sorted.length - 1],
        billingAppointment,
        appointments: sorted,
        status: discontinued ? 'DISCONTINUED' : completedSessions >= totalSessions
          ? getPaymentSummary(sorted[0], sorted).remainingAmount > 0 ? 'AWAITING_SETTLEMENT' : 'COMPLETED' : 'ACTIVE'
      };
    });
  }, [appointments]);

  const filteredPlans = plans.filter(plan => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      plan.patientName.toLowerCase().includes(q) ||
      plan.packageName.toLowerCase().includes(q)
    );
  });

  const nextSessionAvailability = useMemo(() => {
    if (!selectedPlan || !nextDate) return { slots: [], reason: '' };
    if(serverNext)return serverNext;
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    const duration = Math.max(
      toMinutes(selectedPlan.lastAppointment.endTime) - toMinutes(selectedPlan.lastAppointment.startTime),
      30
    );
    return computeDynamicSlotsForDate(
      nextDate,
      loadScheduleSettings(),
      appointments,
      selectedPlan.lastAppointment.psychologistId,
      duration
    );
  }, [appointments, nextDate, selectedPlan,serverNext]);

  const availableNextSessionSlots = useMemo(
    () => nextSessionAvailability.slots.filter(slot => slot.isAvailable),
    [nextSessionAvailability.slots]
  );

  useEffect(() => {
    if (!selectedPlan) return;
    const selectedStillAvailable = availableNextSessionSlots.some(
      slot => slot.startTime === nextStartTime && slot.endTime === nextEndTime
    );
    if (!selectedStillAvailable) {
      setNextStartTime(availableNextSessionSlots[0]?.startTime || '');
      setNextEndTime(availableNextSessionSlots[0]?.endTime || '');
    }
  }, [availableNextSessionSlots, nextEndTime, nextStartTime, selectedPlan]);

  const openScheduleModal = (plan: TreatmentPlanView) => {
    setSelectedPlan(plan);
    setNextDate(getTomorrowDate());
    setNextStartTime(plan.lastAppointment.startTime || '09:00');
    setNextEndTime(plan.lastAppointment.endTime || '10:00');
  };

  const closeScheduleModal = () => {
    setSelectedPlan(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    const selectedSlotAvailable = availableNextSessionSlots.some(
      slot => slot.startTime === nextStartTime && slot.endTime === nextEndTime
    );
    if (!selectedSlotAvailable) return;
    setIsSubmitting(true);
    const success = await onScheduleNextSession(
      selectedPlan.lastAppointment.id,
      nextDate,
      nextStartTime,
      nextEndTime
    );
    setIsSubmitting(false);
    if (success) closeScheduleModal();
  };

  const handleDiscontinue = async () => {
    if (!discontinuingPlan) return;
    const success = await onDiscontinuePlan(discontinuingPlan.lastAppointment.id, discontinueReason);
    if (success) {
      setDiscontinuingPlan(null);
      setDiscontinueReason('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Paket Berjalan</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Rencana Terapi / Paket Berjalan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau progres paket multi-sesi, sesi selesai, jadwal berikutnya, dan status rencana terapi pasien.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari pasien atau paket..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-transparent md:bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-xs overflow-hidden">
        {filteredPlans.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-semibold">
            Belum ada paket multi-sesi yang berjalan.
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {filteredPlans.map(plan => {
                const percent = Math.round((plan.completedSessions / plan.totalSessions) * 100);
                const lastSessionDone = plan.lastAppointment.status === 'COMPLETED';
                const paymentReady = isPlanInitialPaymentVerified(plan.lastAppointment, plan.appointments);
                const canScheduleNext = plan.status === 'ACTIVE' && paymentReady && lastSessionDone && !plan.nextAppointment && plan.completedSessions < plan.totalSessions;
                const billingApt = plan.billingAppointment;
                const balance = billingApt ? getTreatmentPlanBalance(billingApt, plan.appointments) : null;
                const payableAmount = balance?.totalAmount || 0;
                const remainingAmount = balance?.remainingAmount || 0;

                return (
                  <article key={plan.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-slate-900 truncate">{plan.patientName}</h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5 line-clamp-2">{plan.packageName}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-black border ${
                        plan.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : plan.status === 'DISCONTINUED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {plan.status === 'COMPLETED' ? 'Selesai & lunas' : plan.status === 'AWAITING_SETTLEMENT' ? 'Menunggu pelunasan' : plan.status === 'DISCONTINUED' ? 'Dihentikan' : 'Aktif'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                        <span>{plan.completedSessions} dari {plan.totalSessions} sesi selesai</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <dt className="font-bold text-slate-400 uppercase">Sesi Berikutnya</dt>
                        <dd className="font-black text-slate-800 mt-1">
                          {plan.nextAppointment
                            ? `${plan.nextAppointment.date}, ${plan.nextAppointment.startTime}`
                            : 'Belum dijadwalkan'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-400 uppercase">Pembayaran</dt>
                        <dd className="font-black text-slate-800 mt-1">{hideFinancialDetails ? 'Tagihan per sesi' : <>Rp {(billingApt ? Math.round(getSessionRate(billingApt)) : 0).toLocaleString('id-ID')}{billingApt?.packageType === 'PSYCHOTHERAPY' ? ' / sesi' : ''}</>}</dd>
                        <dd className="mt-2">{!hideFinancialDetails && billingApt && <PaymentProgress appointment={billingApt} appointments={plan.appointments} />}</dd>
                      </div>
                    </dl>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-slate-500">Sesi {Math.min(plan.completedSessions + 1, plan.totalSessions)} / {plan.totalSessions}</span>
                      <div className="flex items-center gap-2">
                        {plan.status === 'ACTIVE' && plan.lastAppointment.status === 'NO_SHOW' && !plan.nextAppointment && (
                          <Tooltip content="Konfirmasi jadwal pengganti tanpa DP tambahan">
                            <button type="button" onClick={() => setRescheduleId(plan.lastAppointment.id)} className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi dan jadwalkan ulang sesi tidak hadir">
                              <CalendarClock className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        <button
                          type="button"
                          disabled={plan.status !== 'ACTIVE'||operatorRole!=='PSYCHOLOGIST'}
                          onClick={() => { setDiscontinuingPlan(plan); setDiscontinueReason(''); }}
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
                          aria-label={`Hentikan paket ${plan.patientName}`}
                        >
                          <CircleStop className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!canScheduleNext||operatorRole!=='PSYCHOLOGIST'}
                          onClick={() => openScheduleModal(plan)}
                          className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
                          aria-label={`Jadwalkan sesi berikutnya untuk ${plan.patientName}`}
                        >
                          {canScheduleNext ? <CalendarPlus className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[1080px] text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Pasien</th>
                    <th className="py-3 px-4">Paket</th>
                    <th className="py-3 px-4 w-48">Progress Sesi</th>
                    <th className="py-3 px-4">Sesi Berikutnya</th>
                    <th className="py-3 px-4">Pembayaran Paket</th>
                    <th className="py-3 px-4 text-center">Sesi Lanjut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlans.map(plan => {
                    const percent = Math.round((plan.completedSessions / plan.totalSessions) * 100);
                    const lastSessionDone = plan.lastAppointment.status === 'COMPLETED';
                    const paymentReady = isPlanInitialPaymentVerified(plan.lastAppointment, plan.appointments);
                    const canScheduleNext = plan.status === 'ACTIVE' && paymentReady && lastSessionDone && !plan.nextAppointment && plan.completedSessions < plan.totalSessions;
                    const nextSessionNumber = Math.min(plan.completedSessions + 1, plan.totalSessions);
                    const billingApt = plan.billingAppointment;
                    const subtotalAmount = billingApt?.subtotalAmount ?? billingApt?.totalAmount ?? 0;
                    const discountAmount = billingApt?.discountAmount || 0;
                    const balance = billingApt ? getTreatmentPlanBalance(billingApt, plan.appointments) : null;
                    const payableAmount = balance?.totalAmount ?? Math.max(subtotalAmount - discountAmount, 0);
                    const remainingAmount = balance?.remainingAmount || 0;
                    const scheduleTooltip = canScheduleNext
                      ? 'Jadwalkan sesi berikutnya'
                      : plan.nextAppointment
                      ? 'Sesi berikutnya sudah ada'
                      : plan.status === 'COMPLETED'
                      ? 'Paket sudah selesai'
                      : !paymentReady
                      ? 'Pembayaran awal paket belum diverifikasi admin'
                      : !lastSessionDone
                      ? plan.lastAppointment.status === 'NO_SHOW'
                        ? 'Konfirmasi manual dan jadwalkan ulang sesi yang sama tanpa DP tambahan.'
                        : 'Selesaikan sesi yang terjadwal sebelum menjadwalkan sesi berikutnya.'
                      : 'Sesi tidak bisa dijadwalkan';

                    return (
                      <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 align-middle">
                          <div>
                            <span className="font-black text-slate-900 text-sm block">{plan.patientName}</span>
                            <span className="text-[11px] text-slate-400 font-semibold">Plan: {plan.id}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <span className="font-bold text-slate-800 line-clamp-2">{plan.packageName}</span>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span>{plan.completedSessions}/{plan.totalSessions} selesai</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  plan.status === 'COMPLETED'
                                    ? 'bg-emerald-500'
                                    : plan.status === 'DISCONTINUED'
                                    ? 'bg-rose-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          {plan.nextAppointment ? (
                            <div>
                              <span className="font-black text-slate-900 block">{plan.nextAppointment.date}</span>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {plan.nextAppointment.startTime} - {plan.nextAppointment.endTime} WIB
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-semibold italic">Belum dijadwalkan</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="min-w-40 space-y-1">{hideFinancialDetails ? <span>Tagihan per sesi</span> : <>
                            <div className="flex items-center gap-1.5 text-slate-900 font-black">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Rp {(billingApt ? Math.round(getSessionRate(billingApt)) : 0).toLocaleString('id-ID')}{billingApt?.packageType === 'PSYCHOTHERAPY' ? ' / sesi' : ''}</span>
                            </div>
                            {discountAmount > 0 && (
                              <span className="block text-[10px] font-bold text-emerald-700">
                                {billingApt?.discountLabel || 'Potongan Pengelola'}: - Rp {discountAmount.toLocaleString('id-ID')}
                              </span>
                            )}
                            <span className="block text-[10px] font-semibold text-slate-500">
                              {billingApt?.initialPaymentRecord?.kind === 'FULL' ? 'Pembayaran langsung lunas' : `DP Rp ${(billingApt?.dpAmount || 0).toLocaleString('id-ID')}`}
                            </span>
                            {billingApt && <PaymentProgress appointment={billingApt} appointments={plan.appointments} />}</>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center min-w-[4.5rem] px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-black">
                            {nextSessionNumber} / {plan.totalSessions}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            plan.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : plan.status === 'DISCONTINUED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {plan.status === 'COMPLETED' ? 'Selesai & lunas' : plan.status === 'AWAITING_SETTLEMENT' ? 'Menunggu pelunasan' : plan.status === 'DISCONTINUED' ? 'Dihentikan' : 'Aktif'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {plan.status === 'ACTIVE' && plan.lastAppointment.status === 'NO_SHOW' && !plan.nextAppointment && (
                              <Tooltip content="Konfirmasi jadwal pengganti tanpa DP tambahan" position="left">
                                <button type="button" onClick={() => setRescheduleId(plan.lastAppointment.id)} className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center" aria-label="Konfirmasi dan jadwalkan ulang sesi tidak hadir">
                                  <CalendarClock className="w-4 h-4" />
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip content="Hentikan paket berjalan" position="left">
                              <button
                                type="button"
                                disabled={plan.status !== 'ACTIVE'||operatorRole!=='PSYCHOLOGIST'}
                                onClick={() => { setDiscontinuingPlan(plan); setDiscontinueReason(''); }}
                                className="w-8.5 h-8.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer"
                                aria-label="Hentikan paket berjalan"
                              >
                                <CircleStop className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content={scheduleTooltip} position="left">
                              <button
                                type="button"
                                disabled={!canScheduleNext||operatorRole!=='PSYCHOLOGIST'}
                                onClick={() => openScheduleModal(plan)}
                                className="w-8.5 h-8.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                                aria-label="Jadwalkan sesi berikutnya"
                              >
                                {canScheduleNext ? <CalendarPlus className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 md:mt-0 px-4 py-3 bg-slate-50 border border-slate-200 md:border-x-0 md:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold rounded-xl md:rounded-none">
              <span>Menampilkan {filteredPlans.length} paket berjalan dari {plans.length} total paket multi-sesi.</span>
              <span>Appointment sesi lanjutan dibuat bertahap supaya kalender tetap ringan dan fleksibel.</span>
            </div>
          </>
        )}
      </div>

      <RescheduleModal
        operatorRole={operatorRole}
        key={rescheduleId || 'closed'}
        isOpen={Boolean(rescheduleAppointment)}
        onClose={() => setRescheduleId(null)}
        appointment={rescheduleAppointment}
        appointments={appointments}
        onConfirmReschedule={onReschedule}
        requiresAdminConfirmation={false}
      />

      {selectedPlan && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="viewport-dialog w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Jadwalkan Sesi Berikutnya</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPlan.patientName} - {selectedPlan.packageName}</p>
              </div>
              <button
                type="button"
                onClick={closeScheduleModal}
                className="w-9 h-9 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                aria-label="Tutup modal jadwal sesi lanjutan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal</label>
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
              <p className="text-[11px] text-slate-500">
                Selesaikan sesi yang terjadwal sebelum menjadwalkan sesi berikutnya. Slot mengikuti jam kerja, hari libur, kuota harian, durasi paket, dan jadwal aktif lain.
              </p>
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 bg-slate-50/70">
              <button type="button" onClick={closeScheduleModal} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">
                Tutup
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting || availableNextSessionSlots.length === 0 || !nextStartTime || !nextEndTime} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {discontinuingPlan && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="viewport-dialog w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Hentikan Paket Berjalan</h3>
                <p className="text-xs text-slate-500 mt-0.5">{discontinuingPlan.patientName} - {discontinuingPlan.packageName}</p>
              </div>
              <button type="button" onClick={() => setDiscontinuingPlan(null)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center" aria-label="Tutup konfirmasi penghentian paket">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-600 mb-4">Pembayaran wajib lunas. Seluruh sisa jadwal dibatalkan; histori sesi selesai tetap tersimpan.</p>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Alasan Penghentian *</label>
              <textarea
                value={discontinueReason}
                onChange={event => setDiscontinueReason(event.target.value)}
                rows={4}
                placeholder="Catat alasan penghentian paket untuk audit layanan."
                className="w-full resize-none px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button type="button" onClick={() => setDiscontinuingPlan(null)} className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600">Batal</button>
              <button type="button" onClick={handleDiscontinue} disabled={!discontinueReason.trim()} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed">Hentikan Paket</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
