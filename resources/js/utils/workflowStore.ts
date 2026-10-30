import { Appointment, User, ConsultationPackage } from '../types';
import { INITIAL_APPOINTMENTS } from '../data/mockData';
import { createRecordId } from './bookingPolicy';

export const WORKFLOW_STORAGE_KEY = 'jiwasehat_v3_appointments';
export const COMPAT_WORKFLOW_STORAGE_KEY = 'jiwasehat_v3_workflow_v1';
export const WORKFLOW_UPDATED_EVENT = 'jiwasehat:workflow-updated';
export const STORAGE_ERROR_EVENT = 'jiwasehat:storage-error';

export interface BookingHold {
  packageSnapshot?: ConsultationPackage;
  id: string;
  patientId: string;
  psychologistId: string;
  packageId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  expiresAt: string;
  status: 'HELD' | 'CONVERTED' | 'RECONCILIATION' | 'RELEASED';
  appointmentId?: string;
  paymentChannelDetail?: string;
  accountHolder?: string;
}

export interface PaymentReconciliation {
  id: string;
  holdId: string;
  patientId: string;
  patientName: string;
  paymentProofUrl: string;
  paymentProofName?: string;
  paymentProofMimeType?: string;
  transferSenderName: string;
  createdAt: string;
  status: 'OPEN' | 'BOOKED';
  appointmentId?: string;
}

export interface WorkflowState {
  appointments: Appointment[];
  holds: BookingHold[];
  walkInPatients: User[];
  reconciliations: PaymentReconciliation[];
}

export const findActivePatientHold = (holds: BookingHold[], patientId: string, now = Date.now()): BookingHold | undefined =>
  holds.find(hold => hold.patientId === patientId && hold.status === 'HELD' && Date.parse(hold.expiresAt) > now);

export const readWorkflowState = (): WorkflowState => {
  const raw = localStorage.getItem(COMPAT_WORKFLOW_STORAGE_KEY) || localStorage.getItem(WORKFLOW_STORAGE_KEY);
  if (raw) {
    const value = JSON.parse(raw) as WorkflowState | Appointment[];
    if (Array.isArray(value)) return { appointments: value, holds: [], walkInPatients: [], reconciliations: [] };
    if (!Array.isArray(value.appointments) || !Array.isArray(value.holds) ||
        !Array.isArray(value.walkInPatients) || !Array.isArray(value.reconciliations)) {
      throw new Error('Penyimpanan alur tidak valid. Data tidak direset otomatis; hubungi pengelola.');
    }
    return value;
  }
  return { appointments: INITIAL_APPOINTMENTS, holds: [], walkInPatients: [], reconciliations: [] };
};

// One atomic storage write for appointments, holds, walk-in identity, and reconciliation proof.
export const commitWorkflow = (update: (current: WorkflowState) => WorkflowState): WorkflowState => {
  try {
    const next = update(readWorkflowState());
    const key = localStorage.getItem(COMPAT_WORKFLOW_STORAGE_KEY) ? COMPAT_WORKFLOW_STORAGE_KEY : WORKFLOW_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(WORKFLOW_UPDATED_EVENT));
    return next;
  } catch (error) {
    window.dispatchEvent(new Event(STORAGE_ERROR_EVENT));
    throw new Error('Data belum tersimpan. Penyimpanan browser mungkin penuh/tidak tersedia. Jangan bayar atau mengirim ulang sebelum memeriksa riwayat.', { cause: error });
  }
};

export const withWorkflowLock = async <T>(action: () => Promise<T> | T): Promise<T> => {
  if (!navigator.locks?.request) {
    throw new Error('Browser ini belum mendukung penguncian transaksi prototype. Gunakan browser terbaru melalui localhost/HTTPS atau backend produksi.');
  }
  return navigator.locks.request('jiwasehat:workflow-mutation', { mode: 'exclusive' }, action);
};

export const savePaymentReconciliation = (
  hold: BookingHold,
  patient: Pick<User, 'id' | 'name'>,
  proof: Pick<PaymentReconciliation, 'paymentProofUrl' | 'paymentProofName' | 'paymentProofMimeType' | 'transferSenderName'>
): PaymentReconciliation => {
  const existing = readWorkflowState().reconciliations.find(item => item.holdId === hold.id);
  if (existing) return existing;
  const record: PaymentReconciliation = { ...proof, id: createRecordId('reconcile'), holdId: hold.id,
    patientId: patient.id, patientName: patient.name, createdAt: new Date().toISOString(), status: 'OPEN' };
  commitWorkflow(current => ({ ...current,
    holds: current.holds.map(item => item.id === hold.id ? { ...item, status: 'RECONCILIATION' } : item),
    reconciliations: [...current.reconciliations, record]
  }));
  return record;
};

export const activeHoldAppointments = (state: WorkflowState, excludeHoldId?: string): Appointment[] => state.holds
  .filter(hold => hold.id !== excludeHoldId && hold.status === 'HELD' && Date.parse(hold.expiresAt) > Date.now())
  .map(hold => ({
    id: hold.id, psychologistId: hold.psychologistId, date: hold.date,
    startTime: hold.startTime, endTime: hold.endTime, status: 'PENDING', bookingCode: 'Reservasi sementara'
  } as Appointment));
