import { ApiClient, ApiResponse, ApiError } from './apiClient';
import { User, Review, ConsultationPackage, PsychologicalTest, Appointment, UserStatus } from '../types';

export class AdminEndpoints {
  public static readonly BASE_URL = '/api/v1/admin';

  /**
   * PUT /api/v1/admin/users/:userId/status
   */
  public static async toggleUserStatus(
    userId: string,
    status: UserStatus,
    allUsers: User[]
  ): Promise<ApiResponse<User[]>> {
    return ApiClient.put(
      `${this.BASE_URL}/users/${userId}/status`,
      { status },
      () => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) throw new ApiError('User tidak ditemukan', 404);

        return allUsers.map(u =>
          u.id === userId
            ? { ...u, status, isVerified: status === 'ACTIVE' ? true : u.isVerified }
            : u
        );
      }
    );
  }

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

  /**
   * POST /api/v1/admin/packages
   */
  public static async savePackage(
    pkg: ConsultationPackage,
    allPackages: ConsultationPackage[]
  ): Promise<ApiResponse<ConsultationPackage[]>> {
    return ApiClient.post(
      `${this.BASE_URL}/packages`,
      pkg,
      () => {
        const index = allPackages.findIndex(p => p.id === pkg.id);
        if (index >= 0) {
          const updated = [...allPackages];
          updated[index] = pkg;
          return updated;
        } else {
          return [pkg, ...allPackages];
        }
      }
    );
  }

  /**
   * DELETE /api/v1/admin/packages/:packageId
   */
  public static async deletePackage(
    packageId: string,
    allPackages: ConsultationPackage[]
  ): Promise<ApiResponse<ConsultationPackage[]>> {
    return ApiClient.delete(
      `${this.BASE_URL}/packages/${packageId}`,
      () => {
        return allPackages.filter(p => p.id !== packageId);
      }
    );
  }

  /**
   * POST /api/v1/admin/tests
   */
  public static async saveTest(
    test: PsychologicalTest,
    allTests: PsychologicalTest[]
  ): Promise<ApiResponse<PsychologicalTest[]>> {
    return ApiClient.post(
      `${this.BASE_URL}/tests`,
      test,
      () => {
        const index = allTests.findIndex(t => t.id === test.id);
        if (index >= 0) {
          const updated = [...allTests];
          updated[index] = test;
          return updated;
        } else {
          return [...allTests, test];
        }
      }
    );
  }

  /**
   * PUT /api/v1/admin/appointments/:appointmentId/status
   */
  public static async updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status'],
    allAppointments: Appointment[]
  ): Promise<ApiResponse<Appointment[]>> {
    return ApiClient.put(
      `${this.BASE_URL}/appointments/${appointmentId}/status`,
      { status },
      () => {
        return allAppointments.map(a =>
          a.id === appointmentId ? { ...a, status } : a
        );
      }
    );
  }
}

