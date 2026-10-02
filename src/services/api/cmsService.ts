import { apiClient, ApiResponse } from './client';
import { LandingPageCmsConfig, PatientPageCmsConfig, PsychologistPageCmsConfig } from '../../types';

export const cmsService = {
  /**
   * Mengambil konten CMS Landing Page publik
   * Endpoint Laravel: GET /api/v1/cms/landing
   */
  async getLandingCms(): Promise<ApiResponse<LandingPageCmsConfig>> {
    return apiClient.get<LandingPageCmsConfig>('/cms/landing');
  },

  /**
   * Memperbarui konten CMS Landing Page (Admin/Psikolog)
   * Endpoint Laravel: PUT /api/v1/cms/landing
   */
  async updateLandingCms(payload: Partial<LandingPageCmsConfig>): Promise<ApiResponse<LandingPageCmsConfig>> {
    return apiClient.put<LandingPageCmsConfig>('/cms/landing', payload);
  },

  /**
   * Mengambil konten CMS panduan pasien
   * Endpoint Laravel: GET /api/v1/cms/patient
   */
  async getPatientCms(): Promise<ApiResponse<PatientPageCmsConfig>> {
    return apiClient.get<PatientPageCmsConfig>('/cms/patient');
  },

  /**
   * Memperbarui konten CMS panduan pasien
   * Endpoint Laravel: PUT /api/v1/cms/patient
   */
  async updatePatientCms(payload: Partial<PatientPageCmsConfig>): Promise<ApiResponse<PatientPageCmsConfig>> {
    return apiClient.put<PatientPageCmsConfig>('/cms/patient', payload);
  },

  /**
   * Mengambil panduan & SOP psikolog
   * Endpoint Laravel: GET /api/v1/cms/psychologist
   */
  async getPsychologistCms(): Promise<ApiResponse<PsychologistPageCmsConfig>> {
    return apiClient.get<PsychologistPageCmsConfig>('/cms/psychologist');
  },

  /**
   * Memperbarui panduan & SOP psikolog
   * Endpoint Laravel: PUT /api/v1/cms/psychologist
   */
  async updatePsychologistCms(payload: Partial<PsychologistPageCmsConfig>): Promise<ApiResponse<PsychologistPageCmsConfig>> {
    return apiClient.put<PsychologistPageCmsConfig>('/cms/psychologist', payload);
  }
};
