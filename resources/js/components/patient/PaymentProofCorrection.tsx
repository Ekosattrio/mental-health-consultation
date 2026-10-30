import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Appointment } from '../../types';
import { useApp } from '../../context/AppContextCore';
import { ProofUpload } from '../../utils/paymentProof';

export const PaymentProofCorrection: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const { correctPaymentProof,server } = useApp();
  const firstUpload=!!server&&!appointment.paymentProofUrl;
  const [amount,setAmount]=useState(String(appointment.serverInfo?.initialDue||100000));
  const [proof, setProof] = useState<ProofUpload | null>(null);
  const [sender, setSender] = useState(appointment.transferSenderName || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectionVersion = useRef(0);
  const select = (file?: File) => {
    const version = ++selectionVersion.current;
    setProof(null); setError('');
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Pilih PNG/JPEG/PDF maksimal10MiB.'); return;
    }
    const reader = new FileReader();
    reader.onerror = () => { if (version === selectionVersion.current) setError('Berkas tidak dapat dibaca.'); };
    reader.onload = () => { if (version === selectionVersion.current) setProof({ url: String(reader.result), mimeType: file.type, name: file.name, senderName: sender }); };
    reader.readAsDataURL(file);
  };
  return <div className="space-y-3 border-t border-amber-200 pt-4 text-sm">
    <p className="font-semibold text-amber-900">{firstUpload?'Unggah bukti pembayaran':'Bukti perlu diperbaiki'}</p>
    <p className="break-words text-slate-600">{appointment.paymentProofRejectionReason}</p>
    {!firstUpload&&<p className="text-xs text-slate-500">Batas koreksi: {appointment.paymentProofCorrectionDeadline ? new Date(appointment.paymentProofCorrectionDeadline).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-'} WIB</p>}
    {firstUpload&&<><p className="text-xs text-slate-500">{server.workspace.payment_instructions} · DP Rp100.000 sekali di awal mengurangi biaya layanan.</p><label className="block text-xs font-semibold">Nominal yang ditransfer<input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"/></label></>}
    <label className="block text-xs font-semibold text-slate-600">Nama Pengirim<input value={sender} onChange={event => setSender(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
    <input aria-label="Bukti pembayaran pengganti" type="file" accept="image/png,image/jpeg,application/pdf" onChange={event => select(event.target.files?.[0])} className="block w-full max-w-full text-xs" />
    {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    <button type="button" disabled={busy || !proof || !sender.trim()} onClick={async () => {
      if (!proof) return;
      setBusy(true);
      try { const saved = firstUpload?await server!.uploadPayment(appointment.id,{...proof,senderName:sender},Number(amount)):await correctPaymentProof(appointment.id, { ...proof, senderName: sender }, appointment.paymentProofVersion || 0); if (!saved) setError('Bukti belum tersimpan. Periksa versi dan batas waktu.'); }
      finally { setBusy(false); }
    }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"><Upload className="h-4 w-4" />{firstUpload?'Kirim Bukti Pembayaran':'Kirim Koreksi Bukti'}</button>
  </div>;
};
