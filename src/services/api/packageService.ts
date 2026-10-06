import { ConsultationPackage, PackageCategory, PackageType } from '../../types';
import { apiClient, ApiResponse } from './client';

export interface PackageQueryParams {
  category?: PackageCategory | 'ALL';
  is_active?: boolean;
  is_continuous_care?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UpsertPackagePayload {
  name: string;
  category: PackageCategory;
  type: PackageType;
  duration_minutes: number;
  price: number;
  dp_amount?: number;
  discount_type?: 'NONE' | 'PERCENT' | 'FIXED';
  discount_value?: number;
  discount_label?: string;
  is_continuous_care: boolean;
  session_count: number;
  badge?: string;
  description: string;
  benefits: string[];
  notes?: string;
  is_active: boolean;
  icon_name?: string;
}

export const packageService = {
  list(params?: PackageQueryParams): Promise<ApiResponse<ConsultationPackage[]>> {
    return apiClient.get<ConsultationPackage[]>('/packages', params);
  },

  getById(id: string): Promise<ApiResponse<ConsultationPackage>> {
    return apiClient.get<ConsultationPackage>(`/packages/${id}`);
  },

  create(payload: UpsertPackagePayload): Promise<ApiResponse<ConsultationPackage>> {
    return apiClient.post<ConsultationPackage>('/packages', payload);
  },

  update(id: string, payload: UpsertPackagePayload): Promise<ApiResponse<ConsultationPackage>> {
    return apiClient.put<ConsultationPackage>(`/packages/${id}`, payload);
  },

  setActive(id: string, isActive: boolean): Promise<ApiResponse<ConsultationPackage>> {
    return apiClient.patch<ConsultationPackage>(`/packages/${id}/status`, {
      is_active: isActive
    });
  },

  delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/packages/${id}`);
  }
};
