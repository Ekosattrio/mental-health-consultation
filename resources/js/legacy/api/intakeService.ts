import { IntakeForm } from '../../types';
import { apiClient, ApiResponse } from './client';

export interface UpsertPreTestPayload {
  birth_date?: string;
  gender?: string;
  occupation?: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primary_concerns: string[];
  concern_description: string;
  previous_therapy: boolean;
  previous_diagnosis?: string;
  current_medications?: string;
  current_stress_level: number;
  sleep_quality: IntakeForm['sleepQuality'];
  suicide_risk_flag: boolean;
  goals: string;
  consent_given: boolean;
}

export const intakeService = {
  listMine(): Promise<ApiResponse<IntakeForm[]>> {
    return apiClient.get<IntakeForm[]>('/patient/pre-tests');
  },

  getMineById(id: string): Promise<ApiResponse<IntakeForm>> {
    return apiClient.get<IntakeForm>(`/patient/pre-tests/${id}`);
  },

  create(payload: UpsertPreTestPayload): Promise<ApiResponse<IntakeForm>> {
    return apiClient.post<IntakeForm>('/patient/pre-tests', payload);
  },

  update(id: string, payload: UpsertPreTestPayload): Promise<ApiResponse<IntakeForm>> {
    return apiClient.put<IntakeForm>(`/patient/pre-tests/${id}`, payload);
  },

  getPatientPreTest(patientId: string): Promise<ApiResponse<IntakeForm>> {
    return apiClient.get<IntakeForm>(`/psychologist/patients/${patientId}/pre-test`);
  }
};
