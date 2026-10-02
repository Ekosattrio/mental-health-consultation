import { apiClient, ApiResponse } from './client';
import { Appointment } from '../../types';

export interface FinancialAnalyticsSummary {
  total_cash_in: number;
  paid_transactions_count: number;
  average_per_session: number;
  pending_verification_count: number;
  potential_pending_cash: number;
  month: string;
  year: string;
}

export interface FinanceQueryParams {
  month?: string; // '01'..'12' atau 'ALL'
  year?: string; // '2026' atau 'ALL'
  search?: string;
  page?: number;
  per_page?: number;
}

export const financeService = {
  /**
   * Mendapatkan ringkasan keuangan dan analitik kas nyata
   * Endpoint Laravel: GET /api/v1/finance/summary
   */
  async getSummary(params?: { month?: string; year?: string }): Promise<ApiResponse<FinancialAnalyticsSummary>> {
    return apiClient.get<FinancialAnalyticsSummary>('/finance/summary', params);
  },

  /**
   * Mendapatkan daftar rincian mutasi transaksi kas masuk
   * Endpoint Laravel: GET /api/v1/finance/transactions
   */
  async getTransactions(params?: FinanceQueryParams): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/finance/transactions', params);
  },

  /**
   * Mengunduh file ekspor CSV laporan keuangan
   * Endpoint Laravel: GET /api/v1/finance/export
   */
  async getExportCsvUrl(params?: { month?: string; year?: string }): Promise<string> {
    const query = new URLSearchParams(params as any).toString();
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/finance/export${query ? `?${query}` : ''}`;
  }
};
