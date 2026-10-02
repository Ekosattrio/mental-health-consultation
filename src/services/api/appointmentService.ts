import { apiClient, ApiResponse } from './client';
import { Appointment } from '../../types';

export interface CreateAppointmentPayload {
  psychologist_id: string;
  package_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  session_type: 'ONLINE' | 'OFFLINE';
  intake_answers?: Record<string, any>;
  dass21_scores?: {
    depression: number;
    anxiety: number;
    stress: number;
  };
}

export interface VerifyPaymentPayload {
  payment_status: 'DP_PAID' | 'PAID' | 'FAILED';
  proof_file?: string;
  admin_notes?: string;
}

export interface ReschedulePayload {
  new_date: string;
  new_time: string;
  reason?: string;
}

export interface AppointmentQueryParams {
  status?: string;
  payment_status?: string;
  psychologist_id?: string;
  patient_id?: string;
  month?: string;
  year?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const appointmentService = {
  /**
   * Mendapatkan daftar appointment/booking dengan filter dan pagination
   * Endpoint Laravel: GET /api/v1/appointments
   */
  async getAppointments(params?: AppointmentQueryParams): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/appointments', params);
  },

  /**
   * Mendapatkan rincian appointment berdasarkan ID
   * Endpoint Laravel: GET /api/v1/appointments/{id}
   */
  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  /**
   * Membuat booking sesi konsultasi baru oleh pasien
   * Endpoint Laravel: POST /api/v1/appointments
   */
  async createAppointment(payload: CreateAppointmentPayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>('/appointments', payload);
  },

  /**
   * Memperbarui status appointment (CONFIRMED, COMPLETED, CANCELLED)
   * Endpoint Laravel: PATCH /api/v1/appointments/{id}/status
   */
  async updateStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    return apiClient.patch<Appointment>(`/appointments/${id}/status`, { status });
  },

  /**
   * Memverifikasi pembayaran DP atau pelunasan oleh Admin
   * Endpoint Laravel: POST /api/v1/appointments/{id}/verify-payment
   */
  async verifyPayment(id: string, payload: VerifyPaymentPayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/appointments/${id}/verify-payment`, payload);
  },

  /**
   * Mengajukan reschedule jadwal konsultasi
   * Endpoint Laravel: POST /api/v1/appointments/{id}/reschedule
   */
  async reschedule(id: string, payload: ReschedulePayload): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(`/appointments/${id}/reschedule`, payload);
  },

  /**
   * Mengunggah bukti transfer DP 50% oleh pasien
   * Endpoint Laravel: POST /api/v1/appointments/{id}/upload-proof
   */
  async uploadPaymentProof(id: string, formData: FormData): Promise<ApiResponse<{ proof_url: string }>> {
    // Note: upload multipart/form-data
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || '/api/v1'}/appointments/${id}/upload-proof`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return response.json();
  }
};
