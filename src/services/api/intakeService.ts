import { apiClient, ApiResponse } from './client';
import { IntakeForm, TestResult } from '../../types';

export interface SubmitIntakePayload {
  appointment_id?: string;
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan' | 'Lainnya';
  occupation?: string;
  chief_complaint?: string;
  symptoms_duration?: string;
  previous_counseling_experience?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  consent_given?: boolean;
  dass21_answers?: Record<string, number>;
}

export const intakeService = {
  /**
   * Mengambil riwayat pengisian form intake pasien
   * Endpoint Laravel: GET /api/v1/patient/intake-forms
   */
  async getMyIntakeForms(): Promise<ApiResponse<IntakeForm[]>> {
    return apiClient.get<IntakeForm[]>('/patient/intake-forms');
  },

  /**
   * Mengirim jawaban form intake pre-test saat booking
   * Endpoint Laravel: POST /api/v1/patient/intake-forms
   */
  async submitIntake(payload: SubmitIntakePayload): Promise<ApiResponse<IntakeForm>> {
    return apiClient.post<IntakeForm>('/patient/intake-forms', payload);
  },

  /**
   * Psikolog melihat rincian intake & hasil tes pasien
   * Endpoint Laravel: GET /api/v1/psychologist/patients/{patientId}/intake
   */
  async getPatientIntakeForPsychologist(patientId: string): Promise<ApiResponse<{
    intake_form: IntakeForm;
    test_results: TestResult[];
  }>> {
    return apiClient.get(`/psychologist/patients/${patientId}/intake`);
  }
};
