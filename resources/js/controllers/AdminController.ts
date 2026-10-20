import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import { AdminEndpoints } from '../api/adminEndpoints';
import {
  Review,
  ConsultationPackage,
  Appointment
} from '../types';

export interface AdminStateCallbacks {
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  setPackages: React.Dispatch<React.SetStateAction<ConsultationPackage[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

/**
 * AdminController (OOP Controller)
 * Orchestrates administrative governance: user lifecycle management, review moderation,
 * consultation package catalog CRUD and appointment operations.
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

  /**
   * Save (create or update) consultation package
   */
  public async savePackage(
    pkg: ConsultationPackage,
    allPackages: ConsultationPackage[]
  ): Promise<void> {
    try {
      const response = await AdminEndpoints.savePackage(pkg, allPackages);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setPackages(response.data);
      this.notify('Paket Konsultasi Disimpan', `Paket "${pkg.name}" berhasil diperbarui.`, 'success');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Paket');
    }
  }

  /**
   * Delete consultation package
   */
  public async deletePackage(
    packageId: string,
    allPackages: ConsultationPackage[]
  ): Promise<void> {
    try {
      const response = await AdminEndpoints.deletePackage(packageId, allPackages);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setPackages(response.data);
      this.notify('Paket Dihapus', 'Paket layanan telah dihapus dari katalog.', 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menghapus Paket');
    }
  }

  /**
   * Update appointment status
   */
  public async updateAppointmentStatus(
    aptId: string,
    status: Appointment['status'],
    allAppointments: Appointment[]
  ): Promise<void> {
    try {
      const response = await AdminEndpoints.updateAppointmentStatus(
        aptId,
        status,
        allAppointments
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const adjustedAppointments = response.data.map(apt => {
        if (apt.id !== aptId) return apt;
        if (status === 'CONFIRMED') {
          return {
            ...apt,
            paymentStatus: apt.paymentStatus === 'PAID'
              ? 'PAID'
              : 'DP_PAID' as Appointment['paymentStatus']
          };
        }
        return apt;
      });

      this.callbacks.setAppointments(adjustedAppointments);
      this.notify('Status Reservasi Diperbarui', `Janji temu diperbarui menjadi ${status}.`, 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Mengubah Status');
    }
  }
}
