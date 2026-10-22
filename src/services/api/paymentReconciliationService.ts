import { PaymentReconciliation } from '../../utils/workflowStore';
import { apiClient, ApiResponse } from './client';

// Server must authorize each case and replace proof data URLs with private signed URLs.
export const paymentReconciliationService = {
  list(params?: { status?: 'OPEN' | 'BOOKED'; page?: number; per_page?: number }): Promise<ApiResponse<PaymentReconciliation[]>> {
    return apiClient.get<PaymentReconciliation[]>('/payment-reconciliations', params);
  },
  create(holdId: string, senderName: string, proof: File, idempotencyKey: string): Promise<ApiResponse<PaymentReconciliation>> {
    const form = new FormData();
    form.append('slot_hold_id', holdId);
    form.append('transfer_sender_name', senderName);
    form.append('payment_proof', proof);
    form.append('idempotency_key', idempotencyKey);
    return apiClient.upload<PaymentReconciliation>('/payment-reconciliations', form);
  }
};
