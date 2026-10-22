import { Appointment, AppointmentStatus } from '../../types';
import { apiClient, ApiResponse } from './client';

export interface AppointmentQueryParams {
  status?: AppointmentStatus | 'ALL';
  payment_status?: Appointment['paymentStatus'] | 'ALL';
  psychologist_id?: string;
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  month?: string;
  year?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateAppointmentPayload {
  psychologist_id: string;
  package_id: string;
  date: string;
  start_time: string;
  end_time: string;
  pre_test_id: string;
  slot_hold_id: string;
  expected_total_amount: number;
  payment_method?: Appointment['paymentMethod'];
  payment_channel_detail?: string;
  transfer_sender_name?: string;
  consent_given: boolean;
  consent_version: string;
  privacy_version: string;
}

export interface CreateWalkInAppointmentPayload extends Omit<CreateAppointmentPayload, 'pre_test_id' | 'slot_hold_id' | 'expected_total_amount' | 'consent_given' | 'consent_version' | 'privacy_version'> {
  patient_id?: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  initial_payment_amount: number;
  received_date?: string;
  reconciliation_id?: string;
  payment_phase: 'DP' | 'FULL';
}

export interface ReschedulePayload {
  expected_version: number;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface RecordFinalPaymentPayload {
  amount: number;
  method: NonNullable<Appointment['finalPaymentMethod']>;
  channel_detail?: string;
  purpose: 'CONSULTATION' | 'CANCELLATION_SETTLEMENT';
  received_date: string;
}

// Laravel must return this allowlist for every admin response.
export type AdminAppointment = Pick<Appointment,
  'id' | 'bookingCode' | 'patientId' | 'patientName' | 'patientEmail' |
  'psychologistId' | 'psychologistName' | 'packageId' | 'packageName' | 'packageType' |
  'date' | 'startTime' | 'endTime' | 'status' | 'paymentStatus' | 'createdAt' |
  'paymentMethod' | 'paymentChannelDetail' | 'transferSenderName' |
  'paymentProofUrl' | 'paymentProofName' | 'paymentProofMimeType' |
  'paymentVerifiedAt' | 'paymentVerifiedByName' | 'paymentVerificationNote' |
  'rescheduledAt' | 'rescheduledByName' | 'rescheduledByRole' | 'rescheduleReason' |
  'rescheduleHistory' | 'scheduleConfirmedAt' | 'scheduleConfirmedByName' |
  'scheduleVersion' |
  'treatmentPlanId' | 'treatmentPlanStatus' | 'continuousSessionNumber' | 'continuousSessionTotal' |
  'meetingLocation' | 'hasIntakeForm'>;

export interface AppointmentReceipt {
  receipt_number: string;
  appointment: Appointment;
  issued_at: string;
  printable_url?: string;
}

export interface AdminAppointmentReceipt extends Omit<AppointmentReceipt, 'appointment'> {
  appointment: AdminAppointment;
}

export const appointmentService = {
  list(params?: AppointmentQueryParams): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/appointments', params);
  },

  getById(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  listForAdmin(params?: AppointmentQueryParams): Promise<ApiResponse<AdminAppointment[]>> {
    return apiClient.get<AdminAppointment[]>('/appointments', params);
  },

  getForAdmin(id: string): Promise<ApiResponse<AdminAppointment>> {
    return apiClient.get<AdminAppointment>(`/appointments/${id}`);
  },

  create(payload: CreateAppointmentPayload, proof?: File): Promise<ApiResponse<Appointment>> {
    if (proof) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) form.append(key, typeof value === 'boolean' ? value ? '1' : '0' : String(value));
      });
      form.append('payment_proof', proof);
      return apiClient.upload<Appointment>('/appointments', form);
    }
    return apiClient.post<Appointment>('/appointments', payload);
  },

  createWalkIn(payload: CreateWalkInAppointmentPayload): Promise<ApiResponse<AdminAppointment>> {
    return apiClient.post<AdminAppointment>('/admin/appointments/walk-in', payload);
  },

  complete(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/complete`, {});
  },

  markNoShow(id: string, reason: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/no-show`, { reason });
  },

  cancelByPsychologist(id: string, reason: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/cancel`, { reason });
  },

  rescheduleByPatient(id: string, payload: ReschedulePayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/appointments/${id}/reschedule`, payload);
  },

  rescheduleByAdmin(id: string, payload: ReschedulePayload): Promise<ApiResponse<AdminAppointment>> {
    return apiClient.patch<AdminAppointment>(`/admin/appointments/${id}/reschedule`, payload);
  },

  rescheduleByPsychologist(id: string, payload: ReschedulePayload): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/reschedule`, payload);
  },

  confirmRescheduledBooking(id: string): Promise<ApiResponse<AdminAppointment>> {
    return apiClient.post<AdminAppointment>(`/admin/appointments/${id}/confirm-reschedule`, {});
  },

  verifyPaymentAndConfirm(id: string, adminNotes?: string, receivedDate?: string): Promise<ApiResponse<AdminAppointment>> {
    return apiClient.post<AdminAppointment>(`/admin/appointments/${id}/verify-payment`, {
      admin_notes: adminNotes,
      received_date: receivedDate
    });
  },

  recordFinalPayment(
    id: string,
    payload: RecordFinalPaymentPayload
  ): Promise<ApiResponse<Pick<Appointment, 'id' | 'paymentStatus' | 'finalPaymentRecordedAt'>>> {
    return apiClient.post<Pick<Appointment, 'id' | 'paymentStatus' | 'finalPaymentRecordedAt'>>(
      `/admin/appointments/${id}/final-payment`,
      payload
    );
  },

  getPatientReceipt(id: string): Promise<ApiResponse<AppointmentReceipt>> {
    return apiClient.get<AppointmentReceipt>(`/appointments/${id}/receipt`);
  },

  getAdminReceipt(id: string): Promise<ApiResponse<AdminAppointmentReceipt>> {
    return apiClient.get<AdminAppointmentReceipt>(`/admin/appointments/${id}/receipt`);
  }
};
