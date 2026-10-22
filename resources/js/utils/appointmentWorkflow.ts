import { Appointment, User } from '../types';
import { getPlanBillingBalance, getTreatmentPlanBalance } from './payments';
import { isOpenRescheduleRequest } from './reschedulePolicy';

export const cancelPaidPlan = (
  appointments: Appointment[],
  appointmentId: string,
  actor: Pick<User, 'id' | 'name' | 'role'>,
  reason: string
): { appointments?: Appointment[]; error?: string } => {
  const source = appointments.find(item => item.id === appointmentId);
  if (!['ADMIN', 'PSYCHOLOGIST'].includes(actor.role) || !source ||
      (actor.role === 'PSYCHOLOGIST' && source.psychologistId !== actor.id)) {
    return { error: 'Hanya petugas berwenang yang dapat membatalkan layanan.' };
  }
  if (!reason.trim()) return { error: 'Alasan pembatalan wajib diisi.' };
  if ((source.continuousSessionTotal || 1) > 1 && !source.treatmentPlanId) {
    return { error: 'Data legacy belum memiliki ID rencana. Hubungan rencana harus diperbaiki sebelum pembatalan seluruh sesi.' };
  }
  if (source.treatmentPlanStatus === 'COMPLETED' || source.treatmentPlanStatus === 'DISCONTINUED' ||
      (!source.treatmentPlanId && ['COMPLETED', 'CANCELLED'].includes(source.status))) {
    return { error: 'Layanan ini sudah berakhir.' };
  }
  const related = appointments.filter(item => source.treatmentPlanId
    ? item.treatmentPlanId === source.treatmentPlanId
    : item.id === source.id);
  const billing = related.find(item => (item.continuousSessionNumber || 1) === 1);
  if (!billing || related.some(item => item.psychologistId !== source.psychologistId || item.patientId !== source.patientId)) {
    return { error: 'Data rencana atau pembayaran tidak lengkap.' };
  }
  const billable = related.filter(item => item.billingMode === 'PER_SESSION' || (item.continuousSessionNumber || 1) === 1);
  if (billable.some(item => item.paymentAgreement ? getTreatmentPlanBalance(item, related).remainingAmount > 0
    : item.totalAmount > 0 && item.paymentStatus !== 'PAID') || getPlanBillingBalance(related).remainingAmount > 0) {
    return { error: 'Seluruh biaya harus lunas sebelum layanan dapat dibatalkan. Minta admin mencatat pelunasan terlebih dahulu.' };
  }
  const at = new Date().toISOString();
  const ids = new Set(related.map(item => item.id));
  return {
    appointments: appointments.map(item => {
      if (!ids.has(item.id)) return item;
      const shouldCancel = item.status !== 'COMPLETED' && item.status !== 'CANCELLED';
      return {
        ...item,
        ...(source.treatmentPlanId ? {
          treatmentPlanStatus: 'DISCONTINUED' as const,
          treatmentPlanDiscontinuedAt: at,
          treatmentPlanDiscontinuedById: actor.id,
          treatmentPlanDiscontinuedByName: actor.name,
          treatmentPlanDiscontinuedReason: reason.trim()
        } : {}),
        status: shouldCancel ? 'CANCELLED' as const : item.status,
        rescheduleRequest: isOpenRescheduleRequest(item) ? {
          ...item.rescheduleRequest!, status: 'REJECTED' as const, decidedAt: at,
          decidedByName: actor.name, decisionReason: 'Layanan dihentikan setelah pelunasan.'
        } : item.rescheduleRequest,
        statusHistory: shouldCancel ? [...(item.statusHistory || []), {
          from: item.status, to: 'CANCELLED' as const, at,
          actorId: actor.id, actorName: actor.name, reason: reason.trim()
        }] : item.statusHistory
      };
    })
  };
};
