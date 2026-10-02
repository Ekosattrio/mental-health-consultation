import { apiClient, ApiResponse } from './client';
import { User } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role?: 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN';
}

export interface AuthResponseData {
  user: User;
  token: string;
  token_type: string;
}

export const authService = {
  /**
   * Login pengguna menggunakan kredensial email & password
   * Endpoint Laravel: POST /api/v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<AuthResponseData>('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  /**
   * Registrasi pasien baru
   * Endpoint Laravel: POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<AuthResponseData>('/auth/register', payload);
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response;
  },

  /**
   * Mendapatkan profil pengguna aktif yang sedang login
   * Endpoint Laravel: GET /api/v1/auth/me
   */
  async me(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Memperbarui profil akun pengguna aktif
   * Endpoint Laravel: PUT /api/v1/auth/profile
   */
  async updateProfile(payload: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/auth/profile', payload);
  },

  /**
   * Logout dan invalidasi token Sanctum
   * Endpoint Laravel: POST /api/v1/auth/logout
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      return await apiClient.post<null>('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  }
};
