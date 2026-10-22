import { readXsrfCookie } from '../../utils/csrf';

export interface PaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export const mapApiResponse = <T, U>(
  response: ApiResponse<T>,
  mapper: (data: T) => U
): ApiResponse<U> => ({
  ...response,
  data: mapper(response.data)
});

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string[]>;

  constructor(payload: ApiErrorResponse) {
    super(payload.message);
    this.name = 'HttpError';
    this.status = payload.status;
    this.errors = payload.errors;
  }
}

type RequestBody = unknown;

class ApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private csrfRequest: Promise<void> | null = null;

  constructor() {
    this.baseUrl = String(import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
    this.timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private buildUrl(endpoint: string, params?: object): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    if (!params) return url;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private buildHeaders(body?: RequestBody, customHeaders: HeadersInit = {}): Headers {
    const headers = new Headers(customHeaders);
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    if (String(import.meta.env.VITE_SANCTUM_CSRF || 'false') === 'true') {
      try {
        const token = readXsrfCookie(document.cookie);
        if (token) headers.set('X-XSRF-TOKEN', token);
      } catch {
        throw new HttpError({ message: 'Token sesi tidak valid. Masuk kembali untuk memperbarui sesi.', status: 419 });
      }
    }

    if (body !== undefined && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    return headers;
  }

  private normalizeResponse<T>(payload: unknown): ApiResponse<T> {
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload
    ) {
      return payload as ApiResponse<T>;
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
      const resource = payload as {
        data: T;
        message?: string;
        meta?: PaginationMeta;
      };
      return {
        success: true,
        message: resource.message,
        data: resource.data,
        meta: resource.meta
      };
    }

    return { success: true, data: payload as T };
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 204) {
      return { success: true, data: null as T };
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const errorPayload = payload && typeof payload === 'object'
        ? payload as { message?: string; errors?: Record<string, string[]> }
        : {};
      throw new HttpError({
        message: errorPayload.message || String(payload || response.statusText || 'Permintaan gagal'),
        errors: errorPayload.errors,
        status: response.status
      });
    }

    return this.normalizeResponse<T>(payload);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: {
      params?: object;
      body?: RequestBody;
      headers?: HeadersInit;
      signal?: AbortSignal;
    } = {}
  ): Promise<ApiResponse<T>> {
    const timeoutController = new AbortController();
    const timeoutId = window.setTimeout(() => timeoutController.abort(), this.timeoutMs);
    const abortFromCaller = () => timeoutController.abort();
    if (options.signal?.aborted) timeoutController.abort();
    options.signal?.addEventListener('abort', abortFromCaller, { once: true });

    try {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && String(import.meta.env.VITE_SANCTUM_CSRF || 'false') === 'true' && !readXsrfCookie(document.cookie)) {
        if (!this.csrfRequest) this.csrfRequest = this.initCsrf(timeoutController.signal).finally(() => { this.csrfRequest = null; });
        await this.csrfRequest;
      }
      const response = await fetch(this.buildUrl(endpoint, options.params), {
        method,
        credentials: 'include',
        headers: this.buildHeaders(options.body, options.headers),
        body: options.body !== undefined
          ? options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body)
          : undefined,
        signal: timeoutController.signal
      });
      return await this.parseResponse<T>(response);
    } catch (error) {
      if (error instanceof URIError) throw new HttpError({ message: 'Token sesi tidak valid. Masuk kembali untuk memperbarui sesi.', status: 419 });
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (options.signal?.aborted) {
          throw new HttpError({
            message: 'Permintaan dibatalkan.',
            status: 499
          });
        }
        throw new HttpError({
          message: 'Permintaan terlalu lama. Silakan coba kembali.',
          status: 408
        });
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      options.signal?.removeEventListener('abort', abortFromCaller);
    }
  }

  public async initCsrf(signal?: AbortSignal): Promise<void> {
    const apiMarker = '/api/v1';
    const markerIndex = this.baseUrl.indexOf(apiMarker);
    const origin = markerIndex >= 0 ? this.baseUrl.slice(0, markerIndex) : '';
    const response = await fetch(`${origin}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      signal,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!response.ok) {
      throw new HttpError({
        message: 'Gagal menyiapkan sesi autentikasi.',
        status: response.status
      });
    }
  }

  public get<T>(endpoint: string, params?: object, signal?: AbortSignal) {
    return this.request<T>('GET', endpoint, { params, signal });
  }

  public post<T>(endpoint: string, body?: RequestBody, signal?: AbortSignal) {
    return this.request<T>('POST', endpoint, { body, signal });
  }

  public put<T>(endpoint: string, body?: RequestBody, signal?: AbortSignal) {
    return this.request<T>('PUT', endpoint, { body, signal });
  }

  public patch<T>(endpoint: string, body?: RequestBody, signal?: AbortSignal) {
    return this.request<T>('PATCH', endpoint, { body, signal });
  }

  public delete<T>(endpoint: string, signal?: AbortSignal) {
    return this.request<T>('DELETE', endpoint, { signal });
  }

  public upload<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST') {
    return this.request<T>(method, endpoint, { body: formData });
  }

  public async download(endpoint: string, params?: object): Promise<Blob> {
    const response = await fetch(this.buildUrl(endpoint, params), {
      method: 'GET',
      credentials: 'include',
      headers: this.buildHeaders()
    });
    if (!response.ok) {
      await this.parseResponse<never>(response);
    }
    return response.blob();
  }
}

export const apiClient = new ApiClient();
