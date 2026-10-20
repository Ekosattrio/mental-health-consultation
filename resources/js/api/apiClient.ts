/**
 * Simulates REST API Client with Request/Response lifecycles, HTTP methods,
 * status codes, and latency simulation.
 * Ready to be replaced by Axios or Fetch client in production.
 */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ApiClient {
  private static latencyMs = 80; // Fast realistic local latency simulation

  /**
   * Helper to simulate network latency
   */
  private static async delay(ms: number = this.latencyMs): Promise<void> {
    if (ms <= 0) return;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format standard HTTP response
   */
  public static success<T>(data: T, message = 'OK', status = 200): ApiResponse<T> {
    return {
      data,
      status,
      message,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format standard HTTP error
   */
  public static error(message: string, status = 400): ApiResponse<null> {
    return {
      data: null,
      status,
      message,
      success: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Simulated HTTP GET
   */
  public static async get<T>(
    endpoint: string,
    resolver: () => T | Promise<T>
  ): Promise<ApiResponse<T>> {
    await this.delay();
    try {
      const data = await resolver();
      return this.success(data);
    } catch (err: any) {
      return this.error(err.message || 'Error occurred', err.status || 500);
    }
  }

  /**
   * Simulated HTTP POST
   */
  public static async post<T>(
    endpoint: string,
    payload: any,
    resolver: (payload: any) => T | Promise<T>
  ): Promise<ApiResponse<T>> {
    await this.delay();
    try {
      const data = await resolver(payload);
      return this.success(data, 'Resource created / action processed', 201);
    } catch (err: any) {
      return this.error(err.message || 'Error occurred', err.status || 400);
    }
  }

  /**
   * Simulated HTTP PUT
   */
  public static async put<T>(
    endpoint: string,
    payload: any,
    resolver: (payload: any) => T | Promise<T>
  ): Promise<ApiResponse<T>> {
    await this.delay();
    try {
      const data = await resolver(payload);
      return this.success(data, 'Resource updated successfully', 200);
    } catch (err: any) {
      return this.error(err.message || 'Error occurred', err.status || 400);
    }
  }

  /**
   * Simulated HTTP DELETE
   */
  public static async delete<T>(
    endpoint: string,
    resolver: () => T | Promise<T>
  ): Promise<ApiResponse<T>> {
    await this.delay();
    try {
      const data = await resolver();
      return this.success(data, 'Resource deleted successfully', 200);
    } catch (err: any) {
      return this.error(err.message || 'Error occurred', err.status || 400);
    }
  }
}

