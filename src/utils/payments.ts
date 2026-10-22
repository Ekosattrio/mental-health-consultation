import { Appointment } from '../types';
import { getPracticeDate } from './bookingPolicy';

export interface CashInReportRow extends Appointment {
  sourceAppointmentId: string;
  cashInAmount: number;
  cashInKind: 'DP' | 'FULL' | 'INSTALLMENT';
  cashInOccurredAt: string;
  cashInDateEstimated: boolean;
}

export const FLAT_DP_AMOUNT = 100000;

export const calculateInitialDp = (totalAmount: number): number => {
  const normalizedTotal = Math.max(totalAmount, 0);
  return normalizedTotal === 0 ? 0 : Math.min(FLAT_DP_AMOUNT, normalizedTotal);
};

export const getRecordedCashIn = (appointment: Appointment | CashInReportRow): number => {
  if ('cashInAmount' in appointment) return Math.max(appointment.cashInAmount, 0);
  if (appointment.initialPaymentRecord) {
    if (!appointment.initialPaymentRecord.verifiedAt || !['DP_PAID', 'PAID'].includes(appointment.paymentStatus)) return 0;
    const finalAmount = appointment.finalPaymentRecords?.length
      ? appointment.finalPaymentRecords.reduce((sum, record) => sum + Math.max(record.amount, 0), 0)
      : Math.max(appointment.finalPaymentAmount || 0, 0);
    return Math.max(appointment.initialPaymentRecord.amount, 0) + finalAmount;
  }
  const hasBillableValue = (appointment.totalAmount || 0) > 0 || (appointment.dpAmount || 0) > 0;
  const dpAmount = Math.max(
    appointment.dpAmount ?? (hasBillableValue ? FLAT_DP_AMOUNT : 0),
    0
  );

  if (appointment.paymentStatus === 'PAID') {
    if (appointment.finalPaymentRecords?.length) {
      return dpAmount + appointment.finalPaymentRecords.reduce((sum, record) => sum + Math.max(record.amount, 0), 0);
    }
    if (typeof appointment.finalPaymentAmount === 'number') {
      return dpAmount + Math.max(appointment.finalPaymentAmount, 0);
    }

    return Math.max(appointment.totalAmount || 0, 0);
  }

  if (appointment.paymentStatus === 'DP_PAID') {
    return dpAmount + (appointment.finalPaymentRecords?.length
      ? appointment.finalPaymentRecords.reduce((sum, record) => sum + Math.max(record.amount, 0), 0)
      : Math.max(appointment.finalPaymentAmount || 0, 0));
  }

  return 0;
};

export const getTreatmentPlanBalance = (billingAppointment: Appointment) => {
  const totalAmount = Math.max(billingAppointment.totalAmount || 0, 0);
  const paidAmount = getRecordedCashIn(billingAppointment);
  return { totalAmount, paidAmount, remainingAmount: Math.max(totalAmount - paidAmount, 0) };
};

export const getPaymentSchemeLabel = (appointment: Appointment | CashInReportRow): string => {
  if ('cashInKind' in appointment) {
    return appointment.cashInKind === 'DP' ? 'DP' : appointment.cashInKind === 'FULL' ? 'Pembayaran Lunas' : 'Cicilan / Pelunasan';
  }
  if (appointment.initialPaymentRecord?.kind === 'FULL') return 'Lunas (100%)';
  if (appointment.paymentStatus === 'PAID') {
    return appointment.finalPaymentRecords?.length || typeof appointment.finalPaymentAmount === 'number'
      ? 'DP + Pelunasan'
      : 'Lunas (100%)';
  }

  if (appointment.paymentStatus === 'DP_PAID') {
    return appointment.finalPaymentRecords?.length ? 'DP + Cicilan' : 'DP Admin Diterima';
  }

  return 'Menunggu DP Admin';
};

export const getCashInDate = (timestamp: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) return timestamp;
  const normalized = timestamp.replace(' ', 'T');
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(normalized) ? normalized : `${normalized}Z`);
  return Number.isFinite(date.getTime()) ? getPracticeDate(date) : '';
};

export const formatCashInDate = (row: Appointment): string =>
  `${row.date}${'cashInDateEstimated' in row && row.cashInDateEstimated ? ' (estimasi)' : ''}`;

export const buildCashInReportRows = (appointments: Appointment[]): CashInReportRow[] => appointments.flatMap(appointment => {
  if ((appointment.continuousSessionNumber || 1) > 1 || getRecordedCashIn(appointment) <= 0) return [];
  const rows: CashInReportRow[] = [];
  const append = (id: string, amount: number, kind: CashInReportRow['cashInKind'], timestamp?: string, estimated = false) => {
    if (amount <= 0) return;
    const knownDate = timestamp ? getCashInDate(timestamp) : '';
    const occurredAt = knownDate ? timestamp! : appointment.createdAt;
    rows.push({
      ...appointment, id, sourceAppointmentId: appointment.id,
      date: getCashInDate(occurredAt), cashInAmount: amount, cashInKind: kind,
      cashInOccurredAt: occurredAt, cashInDateEstimated: estimated || !knownDate
    });
  };
  const finalRecords = appointment.finalPaymentRecords?.length ? appointment.finalPaymentRecords :
    (appointment.finalPaymentAmount || 0) > 0 ? [{
      id: `legacy-final-${appointment.id}`, amount: appointment.finalPaymentAmount!,
      recordedAt: appointment.finalPaymentRecordedAt, receivedAt: undefined
    }] : [];
  const finalAmount = finalRecords.reduce((sum, record) => sum + Math.max(record.amount, 0), 0);
  const initial = appointment.initialPaymentRecord;
  append(initial?.id || `initial-${appointment.id}`, getRecordedCashIn(appointment) - finalAmount,
    initial?.kind || (appointment.paymentStatus === 'PAID' && finalAmount === 0 ? 'FULL' : 'DP'),
    initial?.receivedAt || appointment.paymentVerifiedAt, !initial?.receivedAt);
  finalRecords.forEach(record => append(record.id, record.amount, 'INSTALLMENT', record.receivedAt || record.recordedAt, !record.receivedAt));
  return rows;
}).sort((a, b) => b.cashInOccurredAt.localeCompare(a.cashInOccurredAt));
