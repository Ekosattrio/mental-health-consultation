import { apiClient, ApiResponse } from './client';
import { Review } from '../../types';

export interface SubmitReviewPayload {
  appointment_id: string;
  rating: number; // 1-5
  comment: string;
  is_anonymous?: boolean;
}

export interface ModerateReviewPayload {
  status: 'APPROVED' | 'REJECTED';
  admin_notes?: string;
}

export const reviewService = {
  /**
   * Mengambil daftar ulasan (untuk landing page publik atau tabel moderasi admin)
   * Endpoint Laravel: GET /api/v1/reviews
   */
  async getReviews(params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
    rating?: number;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<Review[]>> {
    return apiClient.get<Review[]>('/reviews', params);
  },

  /**
   * Pasien mengirim ulasan setelah sesi konsultasi COMPLETED
   * Endpoint Laravel: POST /api/v1/reviews
   */
  async submitReview(payload: SubmitReviewPayload): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>('/reviews', payload);
  },

  /**
   * Admin memoderasi ulasan (terima / tolak)
   * Endpoint Laravel: PATCH /api/v1/reviews/{id}/moderate
   */
  async moderateReview(reviewId: string, payload: ModerateReviewPayload): Promise<ApiResponse<Review>> {
    return apiClient.patch<Review>(`/reviews/${reviewId}/moderate`, payload);
  }
};
