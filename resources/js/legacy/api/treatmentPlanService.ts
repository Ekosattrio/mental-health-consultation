import { Appointment } from '../../types';
import { apiClient, ApiResponse } from './client';

export type TreatmentPlanStatus = 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  psychologist_id: string;
  package_id: string;
  package_name: string;
  patient_name: string;
  status: TreatmentPlanStatus;
  total_planned_sessions: number;
  completed_sessions: number;
  next_session?: Appointment | null;
  appointments?: Appointment[];
  started_at?: string | null;
  completed_at?: string | null;
  discontinued_at?: string | null;
  discontinue_reason?: string | null;
}

export interface TreatmentPlanQueryParams {
  status?: TreatmentPlanStatus | 'ALL';
  patient_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ScheduleTreatmentSessionPayload {
  date: string;
  start_time: string;
  end_time: string;
}

export const treatmentPlanService = {
  list(params?: TreatmentPlanQueryParams): Promise<ApiResponse<TreatmentPlan[]>> {
    return apiClient.get<TreatmentPlan[]>('/treatment-plans', params);
  },

  getById(id: string): Promise<ApiResponse<TreatmentPlan>> {
    return apiClient.get<TreatmentPlan>(`/treatment-plans/${id}`);
  },

  scheduleNextSession(
    id: string,
    payload: ScheduleTreatmentSessionPayload,
    idempotencyKey: string
  ): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(
      `/treatment-plans/${id}/sessions`,
      { ...payload, idempotency_key: idempotencyKey }
    );
  },

  discontinue(id: string, reason: string): Promise<ApiResponse<TreatmentPlan>> {
    return apiClient.patch<TreatmentPlan>(`/treatment-plans/${id}/discontinue`, { reason });
  }
};
