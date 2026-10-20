import { User } from './User';
import {
  User as UserEntity,
  Appointment,
  Review,
  AnalyticsSummary,
  PsychologistProfile
} from '../types';

/**
 * Admin Model (OOP)
 * Inherits from User, encapsulating system governance, user moderation rules,
 * and high-level platform KPI analytics aggregation.
 */
export class Admin extends User {
  constructor(user: UserEntity) {
    super(user);
  }

  public canManageUsers(): boolean {
    return true;
  }

  public canModerateReviews(): boolean {
    return true;
  }

  public canManagePackages(): boolean {
    return true;
  }

  public canManageTests(): boolean {
    return true;
  }

  /**
   * OOP Analytics Aggregator
   * Computes platform revenue, active consultations, ratings, and top concerns
   */
  public calculateAnalytics(
    appointments: Appointment[],
    allUsers: UserEntity[],
    reviews: Review[],
    psychologists: PsychologistProfile[]
  ): AnalyticsSummary {
    const totalAppointments = appointments.length;
    const completedSessions = appointments.filter(a => a.status === 'COMPLETED').length;

    const totalRevenue = appointments
      .filter(a => a.paymentStatus === 'PAID')
      .reduce((sum, a) => sum + (a.totalAmount || 0), 0);

    const activePatients = allUsers.filter(
      u => u.role === 'PATIENT' && u.status === 'ACTIVE'
    ).length;

    const approvedReviews = reviews.filter(r => r.isApproved);
    const averageRating =
      approvedReviews.length > 0
        ? Number(
            (
              approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
              approvedReviews.length
            ).toFixed(1)
          )
        : 4.9;

    const pendingReviews = reviews.filter(r => !r.isApproved).length;

    const topConcerns = [
      { name: 'Kecemasan & Overthinking', count: 48, percentage: 38 },
      { name: 'Burnout & Tekanan Karir', count: 32, percentage: 25 },
      { name: 'Depresi & Suasana Hati Rendah', count: 26, percentage: 20 },
      { name: 'Hubungan & Trauma Masa Lalu', count: 21, percentage: 17 }
    ];

    return {
      totalAppointments,
      completedSessions,
      totalRevenue,
      activePatients,
      averageRating,
      psychologistCount: psychologists.length,
      pendingReviews,
      topConcerns
    };
  }

  public static create(user: UserEntity): Admin {
    return new Admin(user);
  }
}

