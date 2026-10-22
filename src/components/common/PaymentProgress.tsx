import React from 'react';
import { Appointment } from '../../types';
import { getTreatmentPlanBalance } from '../../utils/payments';

export const PaymentProgress: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const balance = getTreatmentPlanBalance(appointment);
  const percentage = balance.totalAmount > 0 ? Math.min(100, Math.round(balance.paidAmount / balance.totalAmount * 100)) : 100;
  const money = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  return (
    <div className="space-y-1.5 min-w-0 text-xs">
      <p className="font-semibold text-slate-800 break-words">Terbayar {money(balance.paidAmount)} dari {money(balance.totalAmount)}</p>
      <progress value={percentage} max={100} aria-label="Progres pembayaran" className="block h-2 w-full accent-emerald-600" />
      <p className="text-slate-500">Sisa {money(balance.remainingAmount)}</p>
    </div>
  );
};
