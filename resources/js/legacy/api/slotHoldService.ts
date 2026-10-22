import { apiClient, ApiResponse } from './client';

export interface SlotHold {
  id: string;
  status: 'HELD' | 'PAYMENT_REVIEW' | 'CONVERTED' | 'EXPIRED' | 'RELEASED';
  psychologist_id: string;
  package_id: string;
  date: string;
  start_time: string;
  end_time: string;
  expires_at: string;
  server_time: string;
  package_version: string;
  total_amount: number;
  dp_amount: number;
  payment_channel_detail?: string;
  account_holder?: string;
}

// Production contract; LocalStorage does not provide a server reservation.
export const slotHoldService = {
  create(payload: {
    psychologist_id: string; package_id: string; date: string;
    start_time: string; end_time: string; idempotency_key: string;
  }): Promise<ApiResponse<SlotHold>> {
    return apiClient.post<SlotHold>('/slot-holds', payload);
  },
  get(id: string): Promise<ApiResponse<SlotHold>> {
    return apiClient.get<SlotHold>(`/slot-holds/${id}`);
  },
  release(id: string): Promise<ApiResponse<{ id: string; status: 'RELEASED' }>> {
    return apiClient.post<{ id: string; status: 'RELEASED' }>(`/slot-holds/${id}/release`, {});
  }
};
