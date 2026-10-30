import type {Workspace} from '../types/practice';
import type {PracticeScheduleSettings} from '../data/scheduleConfig';

export interface ServerSlot {start_at:string;end_at:string;label:string}
export interface ServerBridge {
  workspace: Workspace;
  refresh: () => Promise<Workspace>;
  revision: number;
  syncError?: string;
  saveCalendar: (settings:PracticeScheduleSettings) => Promise<boolean>;
  acceptConsent: (accepted:boolean) => void;
  saveProfile: (id:string, values:Record<string,unknown>) => Promise<boolean>;
  loadClinicalPatient: (id:string) => Promise<void>;
  uploadPayment: (id:string,proof:import('../utils/paymentProof').ProofUpload,amount:number) => Promise<boolean>;
}
