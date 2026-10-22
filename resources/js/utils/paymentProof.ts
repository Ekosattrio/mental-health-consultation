import { Appointment, User } from '../types';

export type ProofUpload = { url: string; name: string; mimeType: string; senderName: string };
type Actor = Pick<User, 'id' | 'role' | 'name'>;
const timestamp = (value: string) => {
  const normalized = value.replace(' ', 'T');
  return Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(normalized) ? normalized : `${normalized}Z`);
};

const assertPending = (appointment: Appointment, expectedVersion: number) => {
  if (appointment.status !== 'PENDING' || appointment.paymentStatus !== 'DP_PENDING_VERIFICATION' ||
      appointment.treatmentPlanStatus === 'DISCONTINUED' || appointment.initialPaymentRecord?.verifiedAt ||
      appointment.paymentProofState === 'VERIFIED') throw new Error('Pembayaran sudah diproses; bukti tidak dapat diganti.');
  if (expectedVersion !== (appointment.paymentProofVersion || 0)) throw new Error('Versi bukti berubah. Muat ulang detail pembayaran.');
};

export const rejectInitialPaymentProof = (appointment: Appointment, actor: Actor, reason: string,
  expectedVersion: number, now = new Date()): Appointment => {
  assertPending(appointment, expectedVersion);
  if (!['ADMIN', 'PSYCHOLOGIST'].includes(actor.role) ||
      (actor.role === 'PSYCHOLOGIST' && appointment.psychologistId !== actor.id)) throw new Error('Tidak berwenang menolak bukti.');
  if (!reason.trim()) throw new Error('Alasan penolakan wajib diisi.');
  if (appointment.paymentProofState === 'REJECTED') throw new Error('Bukti ini sudah ditolak; tunggu koreksi pasien.');
  const sessionStart = Date.parse(`${appointment.date}T${appointment.startTime}:00+07:00`);
  const deadline = Math.min(sessionStart, Math.max(timestamp(appointment.createdAt) + 86400000, now.getTime() + 86400000));
  if (!Number.isFinite(deadline) || deadline <= now.getTime()) throw new Error('Jendela koreksi berakhir. Selesaikan melalui rekonsiliasi petugas.');
  return { ...appointment, paymentProofState: 'REJECTED', paymentProofRejectionReason: reason.trim(),
    paymentProofCorrectionDeadline: new Date(deadline).toISOString(),
    paymentProofSubmittedAt: appointment.paymentProofSubmittedAt || appointment.createdAt,
    paymentProofHistory: [...(appointment.paymentProofHistory || []), {
      version: expectedVersion, url: appointment.paymentProofUrl, name: appointment.paymentProofName,
      mimeType: appointment.paymentProofMimeType, senderName: appointment.transferSenderName,
      submittedAt: appointment.paymentProofLastUploadedAt || appointment.paymentProofSubmittedAt || appointment.createdAt,
      rejectedAt: now.toISOString(), rejectedByName: actor.name, rejectionReason: reason.trim()
    }] };
};

export const correctInitialPaymentProof = (appointment: Appointment, actor: Actor, proof: ProofUpload,
  expectedVersion: number, now = new Date()): Appointment => {
  assertPending(appointment, expectedVersion);
  if (actor.role !== 'PATIENT' || appointment.patientId !== actor.id) throw new Error('Hanya pemilik booking dapat memperbaiki bukti.');
  if (appointment.paymentProofState !== 'REJECTED' ||
      !appointment.paymentProofCorrectionDeadline || timestamp(appointment.paymentProofCorrectionDeadline) < now.getTime()) {
    throw new Error('Koreksi tidak tersedia atau sudah melewati batas waktu. Hubungi petugas.');
  }
  const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!allowed.includes(proof.mimeType) || !proof.url.startsWith(`data:${proof.mimeType};base64,`) ||
      proof.url.length > Math.ceil(10 * 1024 * 1024 * 4 / 3) + 100 || !proof.senderName.trim() || !proof.name.trim()) {
    throw new Error('Bukti wajib PNG/JPEG/PDF maksimal10MiB dan nama pengirim wajib diisi.');
  }
  let bytes: string;
  try { bytes = atob(proof.url.slice(proof.url.indexOf(',') + 1)); }
  catch { throw new Error('Data berkas bukti tidak valid.'); }
  const signatureMatches = proof.mimeType === 'image/png' ? bytes.startsWith('\x89PNG\r\n\x1a\n')
    : proof.mimeType === 'image/jpeg' ? bytes.startsWith('\xff\xd8\xff') : bytes.startsWith('%PDF-');
  if (!signatureMatches || bytes.length > 10 * 1024 * 1024) throw new Error('Isi berkas tidak sesuai format bukti.');
  return { ...appointment, paymentProofState: 'SUBMITTED', paymentProofVersion: expectedVersion + 1,
    paymentProofLastUploadedAt: now.toISOString(),
    paymentProofUrl: proof.url, paymentProofName: proof.name, paymentProofMimeType: proof.mimeType,
    transferSenderName: proof.senderName.trim() };
};
