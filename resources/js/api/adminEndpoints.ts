import { ApiClient, ApiResponse, ApiError } from './apiClient';
import { Review } from '../types';

export class AdminEndpoints {
  public static readonly BASE_URL = '/api/v1/admin';

  /**
   * PUT /api/v1/admin/reviews/:reviewId/moderate
   */
  public static async moderateReview(
    reviewId: string,
    action: 'APPROVE' | 'REJECT',
    allReviews: Review[]
  ): Promise<ApiResponse<Review[]>> {
    return ApiClient.put(
      `${this.BASE_URL}/reviews/${reviewId}/moderate`,
      { action },
      () => {
        const review = allReviews.find(r => r.id === reviewId);
        if (!review) throw new ApiError('Ulasan tidak ditemukan', 404);

        if (action === 'APPROVE') {
          return allReviews.map(r => (r.id === reviewId ? { ...r, isApproved: true } : r));
        } else {
          return allReviews.filter(r => r.id !== reviewId);
        }
      }
    );
  }
}

