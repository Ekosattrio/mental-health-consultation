import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import { AdminEndpoints } from '../api/adminEndpoints';
import { Review } from '../types';

export interface AdminStateCallbacks {
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

/**
 * AdminController (OOP Controller)
 * Orchestrates review moderation for the current mock layer.
 */
export class AdminController extends BaseController {
  private callbacks: AdminStateCallbacks;

  constructor(notify: ToastCallback, callbacks: AdminStateCallbacks) {
    super(notify);
    this.callbacks = callbacks;
  }

  /**
   * Approve patient review for public display
   */
  public async approveReview(reviewId: string, allReviews: Review[]): Promise<void> {
    try {
      const response = await AdminEndpoints.moderateReview(
        reviewId,
        'APPROVE',
        allReviews
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setReviews(response.data);
      this.notify('Ulasan Disetujui', 'Ulasan kini tampil di halaman publik dan profil psikolog.', 'success');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyetujui Ulasan');
    }
  }

  /**
   * Reject & remove inappropriate patient review
   */
  public async rejectReview(reviewId: string, allReviews: Review[]): Promise<void> {
    try {
      const response = await AdminEndpoints.moderateReview(
        reviewId,
        'REJECT',
        allReviews
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setReviews(response.data);
      this.notify('Ulasan Ditolak', 'Ulasan telah dihapus dari sistem moderasi.', 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menolak Ulasan');
    }
  }

}
