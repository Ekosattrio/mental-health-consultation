import { Appointment, ConsultationPackage } from '../types';
import { getPracticeDate } from './bookingPolicy';
import { calculatePackagePayableAmount } from './discounts';

export interface CashInReportRow extends Appointment {
  sourceAppointmentId: string;
  cashInAmount: number;
  cashInKind: 'DP' | 'FULL' | 'INSTALLMENT';
  cashInOccurredAt: string;
  cashInDateEstimated: boolean;
}

export const FLAT_DP_AMOUNT = 100000;

// DP awal flat dan mengurangi biaya; lanjutan/reschedule memakai ledger asal.
export const calculateInitialDp = (totalAmount: number): number => {
  const normalizedTotal = Math.max(totalAmount, 0);
  return normalizedTotal === 0 ? 0 : Math.min(FLAT_DP_AMOUNT, normalizedTotal);
};

export const getRecordedCashIn = (appointment: Appointment | CashInReportRow): number => {
  if ('cashInAmount' in appointment) return Math.max(appointment.cashInAmount, 0);
  if (appointment.paymentAgreement && appointment.id !== appointment.paymentAgreement.accountAppointmentId) return 0;
  if (appointment.initialPaymentRecord) {
    if (!appointment.initialPaymentRecord.verifiedAt) return 0;
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

export const resolvePaymentAccount = (appointment: Appointment, appointments: Appointment[]): Appointment => {
  if (!appointment.paymentAgreement) return appointment;
  const account = appointments.find(item => item.id === appointment.paymentAgreement!.accountAppointmentId);
  if (!account || account.treatmentPlanId !== appointment.treatmentPlanId ||
    account.patientId !== appointment.patientId || account.psychologistId !== appointment.psychologistId ||
    account.packageId !== appointment.packageId || !appointment.treatmentPlanId ||
    (account.continuousSessionNumber || 1) !== 1 || !account.paymentAgreement ||
    account.paymentAgreement.accountAppointmentId !== account.id ||
    account.paymentAgreement.sessionAmount !== appointment.paymentAgreement.sessionAmount ||
    account.paymentAgreement.sessionCount !== appointment.paymentAgreement.sessionCount) {
    throw new Error('Ledger rangkaian tidak lengkap. Muat ulang sebelum memproses pembayaran.');
  }
  return account;
};

export const getTreatmentPlanBalance = (billingAppointment: Appointment, appointments: Appointment[] = [billingAppointment]) => {
  const totalAmount = Math.max(billingAppointment.totalAmount || 0, 0);
  const agreement = billingAppointment.paymentAgreement;
  const cash = getRecordedCashIn(agreement ? resolvePaymentAccount(billingAppointment, appointments) : billingAppointment);
  const paidAmount = agreement ? Math.min(totalAmount, Math.max(0,
    cash - ((billingAppointment.continuousSessionNumber || 1) - 1) * agreement.sessionAmount)) : cash;
  return { totalAmount, paidAmount, remainingAmount: Math.max(totalAmount - paidAmount, 0) };
};

// Allocation is a view of existing receipts, never another cash-in transaction.
export const syncPaymentAllocations = (appointments: Appointment[]): Appointment[] => appointments.map(item => {
  if (!item.paymentAgreement) return item;
  const account = resolvePaymentAccount(item, appointments);
  if (!account.initialPaymentRecord?.verifiedAt) return item;
  const balance = getTreatmentPlanBalance(item, appointments);
  const eligible = getRecordedCashIn(account) >= calculateInitialDp(account.totalAmount);
  return { ...item, remainingAmount: balance.remainingAmount, initialRequirementMet: eligible,
    paymentStatus: balance.remainingAmount === 0 ? 'PAID' as const : eligible ? 'DP_PAID' as const : 'DP_PENDING_VERIFICATION' as const };
});

export const resolveBillingAppointment = (appointment: Appointment, appointments: Appointment[]): Appointment => {
  if (!appointment.treatmentPlanId || appointment.billingMode === 'PER_SESSION') return appointment;
  return appointments.find(item => item.treatmentPlanId === appointment.treatmentPlanId &&
    (item.continuousSessionNumber || 1) === 1) || appointment;
};

export const getSessionRate = (appointment: Appointment): number =>
  appointment.packageType === 'PSYCHOTHERAPY' && appointment.billingMode !== 'PER_SESSION'
    ? appointment.totalAmount / Math.max(appointment.continuousSessionTotal || 4, 4)
    : appointment.totalAmount;

export const getPlanBillingBalance = (appointments: Appointment[]) => {
  const billing = new Map(appointments.map(item => {
    const account = resolveBillingAppointment(item, appointments);
    return [account.id, account];
  }));
  return [...billing.values()].reduce((total, item) => {
    const balance = getTreatmentPlanBalance(item, appointments);
    return { totalAmount: total.totalAmount + balance.totalAmount,
      paidAmount: total.paidAmount + balance.paidAmount,
      remainingAmount: total.remainingAmount + balance.remainingAmount };
  }, { totalAmount: 0, paidAmount: 0, remainingAmount: 0 });
};

export const getPaymentSummary = (appointment: Appointment, appointments: Appointment[], now = new Date()) => {
  const related = appointments.filter(item => appointment.treatmentPlanId
    ? item.treatmentPlanId === appointment.treatmentPlanId && item.patientId === appointment.patientId
    : item.id === appointment.id);
  const balance = getPlanBillingBalance(related);
  const agreement = appointment.paymentAgreement;
  const account = agreement ? resolvePaymentAccount(appointment, related) : resolveBillingAppointment(appointment, related);
  const cashReceived = agreement ? getRecordedCashIn(account) : [...new Map(related.map(item => {
    const bill = resolveBillingAppointment(item, related); return [bill.id, bill];
  })).values()].reduce((sum, bill) => sum + getRecordedCashIn(bill), 0);
  const agreedAmount = agreement ? agreement.sessionAmount * agreement.sessionCount : balance.totalAmount;
  const finalNumber = agreement?.sessionCount || appointment.continuousSessionTotal || 1;
  const last = related.find(item => (item.continuousSessionNumber || 1) === finalNumber);
  const stopped = related.some(item => item.treatmentPlanStatus === 'DISCONTINUED' || item.status === 'CANCELLED');
  const dueDate = last?.date;
  const sessionsCompleted = related.filter(item => item.status === 'COMPLETED').length >= finalNumber;
  const remainingByFinal = Math.max((stopped ? balance.totalAmount : agreedAmount) - cashReceived, 0);
  const closurePending = sessionsCompleted && balance.remainingAmount > 0;
  const due = !stopped && remainingByFinal > 0 && Boolean(dueDate && getPracticeDate(now) >= dueDate);
  const overpaidAmount = Math.max(cashReceived - agreedAmount, 0);
  const label = stopped ? 'Layanan dihentikan' : closurePending ? 'Pertemuan selesai, menunggu pelunasan'
    : due ? 'Wajib pelunasan sesi terakhir' : remainingByFinal === 0 ? 'Lunas seluruh layanan'
    : 'Pembayaran bertahap';
  return { ...balance, cashReceived, agreedAmount, remainingByFinal, dueDate, due, closurePending, label,
    finalNumber, prepaidAmount: Math.max(Math.min(cashReceived, agreedAmount) - balance.totalAmount, 0),
    overpaidAmount, stopped };
};

export const isPlanInitialPaymentVerified = (appointment: Appointment, appointments: Appointment[]): boolean => {
  const first = appointment.treatmentPlanId ? appointments.find(item =>
    item.treatmentPlanId === appointment.treatmentPlanId && (item.continuousSessionNumber || 1) === 1) : appointment;
  return Boolean(first && (first.paymentAgreement
    ? first.initialPaymentRecord?.verifiedAt && getRecordedCashIn(first) >= calculateInitialDp(first.totalAmount)
    : ['DP_PAID', 'PAID'].includes(first.paymentStatus)));
};

export const getNextSessionBilling = (source: Appointment, pkg?: ConsultationPackage): Partial<Appointment> => {
  if (source.billingMode !== 'PER_SESSION') return {
    totalAmount: 0, subtotalAmount: 0, discountAmount: 0, dpAmount: 0, remainingAmount: 0,
    discountCode: undefined, discountLabel: undefined
  };
  if (source.paymentAgreement) {
    const terms = source.paymentAgreement;
    return { billingMode: 'PER_SESSION', totalAmount: terms.sessionAmount,
      subtotalAmount: terms.sessionSubtotal, discountAmount: terms.sessionDiscount,
      discountCode: undefined, discountLabel: terms.discountLabel,
      remainingAmount: terms.sessionAmount, dpAmount: 0 };
  }
  if (!pkg?.isActive || pkg.id !== source.packageId || pkg.type !== 'PSYCHOTHERAPY') {
    throw new Error('Layanan psikoterapi tidak aktif. Periksa katalog sebelum menjadwalkan sesi berikutnya.');
  }
  const duration = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  if (pkg.durationMinutes !== duration(source.endTime) - duration(source.startTime)) {
    throw new Error('Durasi katalog berubah. Selaraskan layanan dengan praktisi sebelum menjadwalkan sesi.');
  }
  const pricing = calculatePackagePayableAmount(pkg);
  return { billingMode: 'PER_SESSION', totalAmount: pricing.totalAmount,
    subtotalAmount: pricing.subtotalAmount, discountAmount: pricing.discountAmount,
    discountCode: pricing.discount?.code, discountLabel: pricing.discount?.label,
    remainingAmount: pricing.totalAmount, dpAmount: 0 };
};

export const getPaymentSchemeLabel = (appointment: Appointment | CashInReportRow): string => {
  if ('cashInKind' in appointment) {
    return appointment.cashInKind === 'DP' ? 'DP' : appointment.cashInKind === 'FULL'
      ? appointment.paymentAgreement ? 'Pembayaran Awal Rangkaian' : 'Pembayaran Lunas' : 'Cicilan / Pelunasan';
  }
  if (appointment.initialRequirementMet === false && appointment.initialPaymentRecord?.verifiedAt) return 'Menunggu Kekurangan DP';
  if (appointment.billingMode === 'PER_SESSION' && (appointment.continuousSessionNumber || 1) > 1) {
    return appointment.paymentStatus === 'PAID' ? 'Lunas Sesi' : 'Pembayaran Sesi (Tanpa DP Baru)';
  }
  if (appointment.paymentAgreement && appointment.initialPaymentRecord?.kind === 'FULL') return 'Pembayaran awal / prabayar rangkaian';
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
  if (((appointment.continuousSessionNumber || 1) > 1 && appointment.billingMode !== 'PER_SESSION') || getRecordedCashIn(appointment) <= 0) return [];
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
