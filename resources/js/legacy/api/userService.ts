import { PsychologistProfile, User, UserStatus } from '../../types';
import { apiClient, ApiResponse } from './client';

export interface UserQueryParams {
  role?: User['role'] | 'ALL';
  status?: UserStatus | 'ALL';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PatientProfilePayload {
  name: string;
  phone: string;
  birth_date: string;
  gender: string;
  city: string;
  occupation: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const userService = {
  listForAdmin(params?: UserQueryParams): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/admin/users', params);
  },

  getByIdForOwner(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/psychologist/users/${id}`);
  },

  getMyProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/patients/me/profile');
  },

  updateMyPatientProfile(payload: PatientProfilePayload): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/patients/me/profile', payload);
  },

  getPsychologistProfile(id: string): Promise<ApiResponse<PsychologistProfile>> {
    return apiClient.get<PsychologistProfile>(`/psychologists/${id}/profile`);
  },

  updatePsychologistProfile(
    id: string,
    payload: Partial<PsychologistProfile>
  ): Promise<ApiResponse<PsychologistProfile>> {
    return apiClient.put<PsychologistProfile>(`/psychologists/${id}/profile`, payload);
  },

  uploadPsychologistAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.upload<{ avatar_url: string }>('/psychologists/me/avatar', formData);
  },

  deletePsychologistAvatar(): Promise<ApiResponse<null>> {
    return apiClient.delete<null>('/psychologists/me/avatar');
  }
};
