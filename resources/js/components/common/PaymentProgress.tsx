import React from 'react';
import { Appointment } from '../../types';
import { getPaymentSummary } from '../../utils/payments';

export const PaymentProgress: React.FC<{ appointment: Appointment; appointments?: Appointment[] }> = ({ appointment, appointments }) => {
  const balance = getPaymentSummary(appointment, appointments || [appointment]);
  const percentage = balance.agreedAmount > 0 ? Math.min(100, Math.round(balance.cashReceived / balance.agreedAmount * 100)) : 100;
  const money = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;
  if(appointment.serverInfo?.cashVisible===false)return <p className="text-xs text-slate-600">{appointment.initialRequirementMet?'Pembayaran awal terkonfirmasi.':'Menunggu pencatatan / verifikasi pembayaran.'} Nominal pembayaran tersimpan hanya ditampilkan kepada pasien dan psikolog.</p>;
  return (
    <div className="space-y-1.5 min-w-0 text-xs">
      <p className="font-semibold text-slate-800 break-words">{balance.label}</p>
      <p className="text-slate-700 break-words">Diterima {money(balance.cashReceived)} dari {money(balance.stopped ? balance.totalAmount : balance.agreedAmount)}</p>
      <progress value={percentage} max={100} aria-label="Progres pembayaran" className="block h-2 w-full accent-emerald-600" />
      <p className={balance.due || balance.closurePending ? 'font-semibold text-rose-700' : 'text-slate-500'}>Sisa pelunasan {money(balance.remainingByFinal)}</p>
      {appointment.paymentAgreement && <p className="text-slate-500">Tagihan terjadwal {money(balance.totalAmount)}; teralokasi {money(balance.paidAmount)}.</p>}
      {balance.prepaidAmount > 0 && <p className="text-emerald-700">{balance.stopped ? 'Dana belum teralokasi (penanganan di luar aplikasi)' : 'Prabayar sesi mendatang'} {money(balance.prepaidAmount)}</p>}
      {balance.overpaidAmount > 0 && <p className="text-amber-800">Lebih bayar {money(balance.overpaidAmount)}; penanganan di luar aplikasi, bukan biaya tambahan.</p>}
      {!balance.stopped && <p className="text-slate-500">Pelunasan paling lambat {balance.dueDate ? `${balance.dueDate} (WIB)` : `hari sesi terakhir (sesi ${balance.finalNumber})`}.</p>}
    </div>
  );
};
