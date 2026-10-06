import { apiClient, ApiResponse } from './client';
import { Appointment } from '../../types';

export interface FinancialAnalyticsSummary {
  total_cash_in: number;
  paid_transactions_count: number;
  average_per_transaction: number;
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
   * Mengunduh file laporan dari backend agar data besar tidak diproses browser.
   */
  async downloadExport(
    format: 'pdf' | 'xlsx' | 'csv',
    params?: FinanceQueryParams
  ): Promise<Blob> {
    return apiClient.download(`/finance/export/${format}`, params);
  },

  async downloadClinicalExport(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    return apiClient.download('/finance/export/clinical', { format });
  }
};
