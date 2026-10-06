import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../../types';
import { CalendarPlus, CheckCircle2, ClipboardList, Search, X } from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface TreatmentPlansTabProps {
  appointments: Appointment[];
  onScheduleNextSession: (appointmentId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
}

interface TreatmentPlanView {
  id: string;
  patientName: string;
  packageName: string;
  totalSessions: number;
  completedSessions: number;
  nextAppointment?: Appointment;
  lastAppointment: Appointment;
  appointments: Appointment[];
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
}

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export const TreatmentPlansTab: React.FC<TreatmentPlansTabProps> = ({
  appointments,
  onScheduleNextSession
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlanView | null>(null);
  const [nextDate, setNextDate] = useState(getTomorrowDate());
  const [nextStartTime, setNextStartTime] = useState('09:00');
  const [nextEndTime, setNextEndTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const totalSessions = sorted[0]?.continuousSessionTotal || sorted.length;
      const completedSessions = sorted.filter(apt => apt.status === 'COMPLETED').length;
      const activeNext = sorted
        .filter(apt => apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS')
        .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];
      const discontinued = sorted.every(apt => apt.status === 'CANCELLED' || apt.status === 'NO_SHOW');

      return {
        id,
        patientName: sorted[0]?.patientName || '-',
        packageName: sorted[0]?.packageName || '-',
        totalSessions,
        completedSessions,
        nextAppointment: activeNext,
        lastAppointment: sorted[sorted.length - 1],
        appointments: sorted,
        status: completedSessions >= totalSessions ? 'COMPLETED' : discontinued ? 'DISCONTINUED' : 'ACTIVE'
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPlans.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-semibold">
            Belum ada paket multi-sesi yang berjalan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[920px] text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Pasien</th>
                    <th className="py-3 px-4">Paket</th>
                    <th className="py-3 px-4 w-48">Progress Sesi</th>
                    <th className="py-3 px-4">Sesi Berikutnya</th>
                    <th className="py-3 px-4 text-center">Sesi Lanjut</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlans.map(plan => {
                    const percent = Math.round((plan.completedSessions / plan.totalSessions) * 100);
                    const canScheduleNext = plan.status === 'ACTIVE' && !plan.nextAppointment && plan.completedSessions < plan.totalSessions;
                    const nextSessionNumber = Math.min(plan.completedSessions + 1, plan.totalSessions);

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
                            {plan.status === 'COMPLETED' ? 'Selesai' : plan.status === 'DISCONTINUED' ? 'Dihentikan' : 'Aktif'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <Tooltip content={canScheduleNext ? 'Jadwalkan sesi berikutnya' : 'Sesi berikutnya sudah ada / paket selesai'} position="left">
                            <button
                              type="button"
                              disabled={!canScheduleNext}
                              onClick={() => openScheduleModal(plan)}
                              className="w-8.5 h-8.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                              aria-label="Jadwalkan sesi berikutnya"
                            >
                              {canScheduleNext ? <CalendarPlus className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-semibold">
              <span>Menampilkan {filteredPlans.length} paket berjalan dari {plans.length} total paket multi-sesi.</span>
              <span>Appointment sesi lanjutan dibuat bertahap supaya kalender tetap ringan dan fleksibel.</span>
            </div>
          </>
        )}
      </div>

      {selectedPlan && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
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
              <button type="button" onClick={closeScheduleModal} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">
                Tutup
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
