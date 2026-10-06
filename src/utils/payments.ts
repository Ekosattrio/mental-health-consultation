import { Appointment } from '../types';

export const getRecordedCashIn = (appointment: Appointment): number => {
  const hasBillableValue = (appointment.totalAmount || 0) > 0 || (appointment.dpAmount || 0) > 0;
  const dpAmount = Math.max(
    appointment.dpAmount ?? (hasBillableValue ? 100000 : 0),
    0
  );

  if (appointment.paymentStatus === 'PAID') {
    if (typeof appointment.finalPaymentAmount === 'number') {
      return dpAmount + Math.max(appointment.finalPaymentAmount, 0);
    }

    return Math.max(appointment.totalAmount || 0, 0);
  }

  if (appointment.paymentStatus === 'DP_PAID') {
    return dpAmount;
  }

  return 0;
};

export const getPaymentSchemeLabel = (appointment: Appointment): string => {
  if (appointment.paymentStatus === 'PAID') {
    return typeof appointment.finalPaymentAmount === 'number'
      ? 'DP + Pelunasan'
      : 'Lunas (100%)';
  }

  if (appointment.paymentStatus === 'DP_PAID') {
    return 'DP Admin Diterima';
  }

  return 'Menunggu DP Admin';
};
