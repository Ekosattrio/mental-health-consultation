/**
 * HTTP Client Base untuk JiwaSehat API
 * Siap terintegrasi langsung dengan Laravel 12++ (Sanctum Authentication, CSRF Protection, dan RESTful Standards).
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Ambil base URL dari environment variable Vite jika ada, default ke Laravel API endpoint
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token') || localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Memberi tahu Laravel bahwa ini permintaan AJAX/SPA
      ...((customHeaders as Record<string, string>) || {})
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error: ApiErrorResponse = {
        message: (data && data.message) || response.statusText || 'Terjadi kesalahan pada server',
        errors: data && data.errors,
        status: response.status
      };
      throw error;
    }

    // Normalisasi struktur return agar konsisten dengan standar Resource API Laravel 12
    if (data && typeof data === 'object' && 'data' in data) {
      return data as ApiResponse<T>;
    }

    return {
      success: true,
      data: data as T
    };
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });

    return this.handleResponse<T>(response);
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });

    return this.handleResponse<T>(response);
  }

  public async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });

    return this.handleResponse<T>(response);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
