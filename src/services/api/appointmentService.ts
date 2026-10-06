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
  pre_test_id?: string;
  payment_method?: Appointment['paymentMethod'];
  payment_channel_detail?: string;
  transfer_sender_name?: string;
  payment_reference?: string;
  consent_given: boolean;
}

export interface CreateWalkInAppointmentPayload extends CreateAppointmentPayload {
  patient_id?: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
}

export interface ReschedulePayload {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface RecordFinalPaymentPayload {
  amount: number;
  method: NonNullable<Appointment['finalPaymentMethod']>;
  channel_detail?: string;
  reference?: string;
}

export interface AppointmentReceipt {
  receipt_number: string;
  appointment: Appointment;
  issued_at: string;
  printable_url?: string;
}

export const appointmentService = {
  list(params?: AppointmentQueryParams): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/appointments', params);
  },

  getById(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  create(payload: CreateAppointmentPayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>('/appointments', payload);
  },

  createWalkIn(payload: CreateWalkInAppointmentPayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>('/admin/appointments/walk-in', payload);
  },

  confirm(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/admin/appointments/${id}/confirm`, {});
  },

  complete(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/complete`, {});
  },

  markNoShow(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/no-show`, { reason });
  },

  cancelByPsychologist(id: string, reason: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/psychologist/appointments/${id}/cancel`, { reason });
  },

  rescheduleByPatient(id: string, payload: ReschedulePayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/appointments/${id}/reschedule`, payload);
  },

  rescheduleByAdmin(id: string, payload: ReschedulePayload): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/admin/appointments/${id}/reschedule`, payload);
  },

  verifyDp(id: string, adminNotes?: string): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/admin/appointments/${id}/verify-payment`, {
      admin_notes: adminNotes
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

  uploadPaymentProof(id: string, file: File): Promise<ApiResponse<{ proof_url: string }>> {
    const formData = new FormData();
    formData.append('payment_proof', file);
    return apiClient.upload<{ proof_url: string }>(`/appointments/${id}/payment-proof`, formData);
  },

  getPatientReceipt(id: string): Promise<ApiResponse<AppointmentReceipt>> {
    return apiClient.get<AppointmentReceipt>(`/appointments/${id}/receipt`);
  },

  getAdminReceipt(id: string): Promise<ApiResponse<AppointmentReceipt>> {
    return apiClient.get<AppointmentReceipt>(`/admin/appointments/${id}/receipt`);
  }
};
