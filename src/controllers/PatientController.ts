import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import {
  PatientEndpoints,
  BookAppointmentPayload
} from '../api/patientEndpoints';
import {
  Appointment,
  ConsultationPackage,
  IntakeForm,
  ScheduleSlot,
  Review,
  User as UserEntity,
  UserRole
} from '../types';

export interface PatientStateCallbacks {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setIntakeForms: React.Dispatch<React.SetStateAction<Record<string, IntakeForm>>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

/**
 * PatientController (OOP Controller)
 * Orchestrates patient workflows: appointment reservations with concurrency guards,
 * pre-test profiling submission, booking, payments, and reviews.
 */
export class PatientController extends BaseController {
  private callbacks: PatientStateCallbacks;

  constructor(notify: ToastCallback, callbacks: PatientStateCallbacks) {
    super(notify);
    this.callbacks = callbacks;
  }

  /**
   * Book appointment with double-booking prevention guard
   */
  public async bookAppointment(
    payload: BookAppointmentPayload,
    schedules: ScheduleSlot[],
    appointments: Appointment[],
    packages: ConsultationPackage[],
    users: UserEntity[],
    intakeForms: Record<string, IntakeForm>
  ): Promise<{ success: boolean; message: string; appointment?: Appointment; updatedSlot?: ScheduleSlot }> {
    try {
      const response = await PatientEndpoints.bookAppointment(
        payload,
        schedules,
        appointments,
        packages,
        users,
        intakeForms
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const { appointment, updatedSlot } = response.data;
      return { success: true, message: 'Booking siap disimpan.', appointment, updatedSlot };
    } catch (err: any) {
      this.handleError(err, 'Gagal Reservasi');
      return {
        success: false,
        message: err?.message || 'Gagal memproses booking'
      };
    }
  }

  /**
   * Submit intake form
   */
  public async submitIntakeForm(
    patientId: string,
    formData: Omit<IntakeForm, 'id' | 'completedAt'>
  ): Promise<IntakeForm | null> {
    try {
      const response = await PatientEndpoints.submitIntake(patientId, formData);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const savedIntake = response.data;
      return savedIntake;
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Pre-Test');
      return null;
    }
  }

  /**
   * Submit client review
   */
  public async submitReview(reviewData: {
    appointmentId: string;
    psychologistId: string;
    patientId: string;
    patientName: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    psychologistName: string;
  }): Promise<void> {
    try {
      const response = await PatientEndpoints.submitReview(reviewData);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const newReview = response.data;
      this.callbacks.setReviews(prev => [newReview, ...prev]);

      this.callbacks.setAppointments(prev =>
        prev.map(a => (a.id === reviewData.appointmentId ? { ...a, reviewId: newReview.id } : a))
      );

      this.notify(
        'Ulasan Terkirim',
        'Terima kasih atas penilaian Anda! Ulasan Anda telah diteruskan ke sistem moderasi.',
        'success'
      );
    } catch (err: any) {
      this.handleError(err, 'Gagal Mengirim Ulasan');
    }
  }
}
