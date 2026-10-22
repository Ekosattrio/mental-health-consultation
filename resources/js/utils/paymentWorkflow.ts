import { Appointment, FinalPaymentRecord, User } from '../types';
import { createRecordId, getPracticeDate, isValidBookingDate } from './bookingPolicy';
import { calculateInitialDp, getRecordedCashIn } from './payments';

type PaymentActor = Pick<User, 'id' | 'name' | 'role'>;
export interface ReceivedPayment {
  amount: number;
  method: FinalPaymentRecord['method'];
  channelDetail?: string;
  purpose?: FinalPaymentRecord['purpose'];
  receivedDate?: string;
  idempotencyKey: string;
}

const assertReceipt = (amount: number, date: string, now: Date) => {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Nominal aktual harus berupa rupiah bulat lebih dari nol.');
  if (!isValidBookingDate(date) || date > getPracticeDate(now)) throw new Error('Tanggal penerimaan tidak valid atau berada di masa depan.');
};

const assertInvoice = (appointment: Appointment) => {
  if (!Number.isSafeInteger(appointment.totalAmount) || appointment.totalAmount < 0) throw new Error('Nilai tagihan tidak valid.');
};

export const getRequiredInitialPayment = (appointment: Appointment) =>
  appointment.billingMode === 'PER_SESSION' && (appointment.continuousSessionNumber || 1) > 1
    ? 0 : calculateInitialDp(appointment.totalAmount);

export const canRecordReceivedPayment = (appointment: Appointment): boolean =>
  (appointment.billingMode === 'PER_SESSION' || (appointment.continuousSessionNumber || 1) === 1) &&
  (['DP_PAID', 'PAID'].includes(appointment.paymentStatus) ||
    Boolean(appointment.initialPaymentRecord?.verifiedAt) ||
    (appointment.billingMode === 'PER_SESSION' && (appointment.continuousSessionNumber || 1) > 1 &&
      appointment.initialRequirementMet === true && appointment.paymentStatus === 'PENDING'));

export const verifyInitialReceipt = (appointment: Appointment, actor: PaymentActor, amount: number,
  receivedDate: string, expectedProofVersion: number, note = '', now = new Date()): Appointment => {
  if (actor.role !== 'ADMIN') throw new Error('Verifikasi pembayaran hanya dapat dilakukan Admin.');
  assertInvoice(appointment);
  if (appointment.status !== 'PENDING' || appointment.treatmentPlanStatus === 'DISCONTINUED' ||
    appointment.initialPaymentRecord?.verifiedAt || appointment.paymentProofState === 'VERIFIED') {
    throw new Error('Pembayaran awal sudah diproses atau tidak tersedia.');
  }
  if (!['DP_PENDING_VERIFICATION', 'PAID'].includes(appointment.paymentStatus) ||
    appointment.paymentProofState === 'REJECTED' || expectedProofVersion !== (appointment.paymentProofVersion || 0)) {
    throw new Error('Status atau versi bukti berubah. Periksa bukti terbaru.');
  }
  if (appointment.totalAmount > 0) {
    assertReceipt(amount, receivedDate, now);
    if (!appointment.paymentProofUrl?.trim() || !appointment.transferSenderName?.trim() || !appointment.paymentMethod) {
      throw new Error('Bukti, nama pengirim, dan metode pembayaran wajib tersedia.');
    }
    if (!['CASH', 'BANK_TRANSFER', 'QRIS', 'EDC', 'OTHER'].includes(appointment.paymentMethod)) throw new Error('Metode pembayaran tidak valid.');
  } else if (amount !== 0) throw new Error('Layanan tanpa tagihan tidak memerlukan penerimaan pembayaran.');
  const at = now.toISOString();
  const paid = amount >= appointment.totalAmount;
  const eligible = amount >= getRequiredInitialPayment(appointment);
  return { ...appointment,
    dpAmount: getRequiredInitialPayment(appointment),
    status: eligible ? 'CONFIRMED' : 'PENDING',
    paymentStatus: paid ? 'PAID' : eligible ? 'DP_PAID' : 'DP_PENDING_VERIFICATION',
    remainingAmount: Math.max(appointment.totalAmount - amount, 0), initialRequirementMet: eligible,
    paymentVerifiedAt: at, paymentVerifiedByName: actor.name, paymentVerificationNote: note.trim() || undefined,
    paymentProofState: 'VERIFIED',
    initialPaymentRecord: appointment.totalAmount > 0 ? {
      id: appointment.initialPaymentRecord?.id || createRecordId('payment'), amount,
      kind: paid ? 'FULL' : 'DP', method: appointment.paymentMethod!,
      channelDetail: appointment.paymentChannelDetail, receivedAt: receivedDate, recordedByName: actor.name, verifiedAt: at
    } : undefined,
    statusHistory: eligible ? [...(appointment.statusHistory || []), {
      from: appointment.status, to: 'CONFIRMED', at, actorId: actor.id, actorName: actor.name,
      reason: 'Pembayaran awal diverifikasi dan minimum DP terpenuhi'
    }] : appointment.statusHistory
  };
};

export const appendReceivedPayment = (appointment: Appointment, actor: PaymentActor, payment: ReceivedPayment,
  now = new Date()): Appointment => {
  if (actor.role !== 'ADMIN') throw new Error('Penerimaan pembayaran hanya dapat dicatat Admin.');
  if (appointment.paymentAgreement && appointment.paymentAgreement.accountAppointmentId !== appointment.id) {
    throw new Error('Penerimaan rangkaian harus dicatat ke ledger awal, bukan disalin ke sesi lanjutan.');
  }
  assertInvoice(appointment);
  if (!payment.idempotencyKey?.trim()) throw new Error('Identitas pencatatan pembayaran wajib tersedia.');
  const existing = appointment.finalPaymentRecords?.find(record => record.idempotencyKey === payment.idempotencyKey);
  if (existing) {
    if (existing.amount !== payment.amount || existing.method !== payment.method ||
      (existing.channelDetail || '') !== (payment.channelDetail?.trim() || '') ||
      existing.receivedAt !== (payment.receivedDate || getPracticeDate(now)) ||
      (existing.purpose || 'CONSULTATION') !== (payment.purpose || 'CONSULTATION')) {
      throw new Error('Identitas pembayaran sudah digunakan untuk penerimaan berbeda.');
    }
    return appointment;
  }
  if (!canRecordReceivedPayment(appointment)) throw new Error('Pembayaran awal belum diverifikasi atau bukan tagihan sesi ini.');
  const date = payment.receivedDate || getPracticeDate(now);
  assertReceipt(payment.amount, date, now);
  if (!['CASH', 'BANK_TRANSFER', 'QRIS', 'EDC', 'OTHER'].includes(payment.method)) throw new Error('Metode pembayaran tidak valid.');
  const initialShortfall = appointment.initialPaymentRecord?.verifiedAt && appointment.initialRequirementMet === false;
  const previous = appointment.finalPaymentRecords?.length ? appointment.finalPaymentRecords :
    (appointment.finalPaymentAmount || 0) > 0 ? [{
      id: `payment-legacy-${appointment.id}`, amount: appointment.finalPaymentAmount!,
      method: appointment.finalPaymentMethod || 'CASH' as const, channelDetail: appointment.finalPaymentChannelDetail,
      recordedAt: appointment.finalPaymentRecordedAt || appointment.createdAt,
      recordedByName: appointment.finalPaymentRecordedByName || 'Admin Operasional'
    }] : [];
  const at = now.toISOString();
  // Preserve legacy full-payment cash before introducing an explicit additional-receipt ledger.
  const legacyInitial = !appointment.initialPaymentRecord && !previous.length && appointment.paymentStatus === 'PAID'
    ? { id: `initial-legacy-${appointment.id}`, amount: getRecordedCashIn(appointment), kind: 'FULL' as const,
        method: appointment.paymentMethod || 'CASH' as const, receivedAt: appointment.paymentVerifiedAt || appointment.createdAt,
        verifiedAt: appointment.paymentVerifiedAt || at, recordedByName: appointment.paymentVerifiedByName || actor.name }
    : appointment.initialPaymentRecord;
  const records = [...previous, { id: createRecordId('payment'), idempotencyKey: payment.idempotencyKey,
    amount: payment.amount, method: payment.method, channelDetail: payment.channelDetail?.trim() || undefined,
    receivedAt: date, recordedAt: at, recordedByName: actor.name, purpose: payment.purpose || 'CONSULTATION' as const }];
  const paidAmount = getRecordedCashIn(appointment) + payment.amount;
  if (!Number.isSafeInteger(paidAmount)) throw new Error('Akumulasi penerimaan melebihi batas nominal yang didukung.');
  const eligible = paidAmount >= getRequiredInitialPayment(appointment);
  const confirmInitial = initialShortfall && eligible && appointment.status === 'PENDING' && appointment.treatmentPlanStatus !== 'DISCONTINUED';
  return { ...appointment, initialPaymentRecord: legacyInitial,
    paymentStatus: paidAmount >= appointment.totalAmount ? 'PAID' : eligible ? 'DP_PAID' : 'DP_PENDING_VERIFICATION',
    initialRequirementMet: eligible, remainingAmount: Math.max(appointment.totalAmount - paidAmount, 0),
    status: confirmInitial ? 'CONFIRMED' : appointment.status,
    statusHistory: confirmInitial ? [...(appointment.statusHistory || []), {
      from: appointment.status, to: 'CONFIRMED', at, actorId: actor.id, actorName: actor.name, reason: 'Kekurangan DP telah terpenuhi'
    }] : appointment.statusHistory,
    finalPaymentRecords: records, finalPaymentAmount: records.reduce((sum, record) => sum + record.amount, 0),
    finalPaymentMethod: payment.method, finalPaymentChannelDetail: payment.channelDetail?.trim() || undefined,
    finalPaymentRecordedAt: at, finalPaymentRecordedByName: actor.name
  };
};
