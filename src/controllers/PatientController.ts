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
  TestResult,
  Review,
  User as UserEntity,
  UserRole
} from '../types';

export interface PatientStateCallbacks {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setIntakeForms: React.Dispatch<React.SetStateAction<Record<string, IntakeForm>>>;
  setTestResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

/**
 * PatientController (OOP Controller)
 * Orchestrates patient workflows: appointment reservations with concurrency guards,
 * pre-test submission, DASS-21 psychological test taking, booking, payments, and reviews.
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
    intakeForms: Record<string, IntakeForm>,
    testResults: TestResult[]
  ): Promise<{ success: boolean; message: string; appointment?: Appointment }> {
    try {
      const response = await PatientEndpoints.bookAppointment(
        payload,
        schedules,
        appointments,
        packages,
        users,
        intakeForms,
        testResults
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const { appointment, updatedSlot } = response.data;

      // Update state atomically
      this.callbacks.setSchedules(prev => {
        const exists = prev.some(s => s.id === updatedSlot.id);
        if (exists) {
          return prev.map(s => (s.id === updatedSlot.id ? updatedSlot : s));
        }
        return [...prev, updatedSlot];
      });
      this.callbacks.setAppointments(prev => [appointment, ...prev]);

      this.notify(
        'Pengajuan Booking Terkirim',
        `Booking ${appointment.bookingCode} menunggu verifikasi admin atas bukti DP 50%.`,
        'success'
      );

      return {
        success: true,
        message: 'Pengajuan booking berhasil dikirim dan menunggu verifikasi admin.',
        appointment
      };
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
      this.callbacks.setIntakeForms(prev => ({
        ...prev,
        [patientId]: savedIntake
      }));

      // Update appointments hasIntakeForm flag
      this.callbacks.setAppointments(prev =>
        prev.map(a => (a.patientId === patientId ? { ...a, hasIntakeForm: true } : a))
      );

      if (savedIntake.suicideRiskFlag) {
        this.notify(
          'Perhatian Khusus Disimpan',
          'Pre-test tersimpan dengan tanda perhatian khusus. Tim psikolog kami akan memberikan pendampingan intensif.',
          'warning'
        );
      } else {
        this.notify(
          'Pre-Test Tersimpan',
          'Data keluhan awal Anda telah disimpan dan booking konsultasi sudah bisa diajukan.',
          'success'
        );
      }

      return savedIntake;
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Pre-Test');
      return null;
    }
  }

  /**
   * Submit psychological test result
   */
  public async submitTestResult(
    patientId: string,
    resultData: Omit<TestResult, 'id' | 'completedAt'>
  ): Promise<TestResult | null> {
    try {
      const response = await PatientEndpoints.submitTest(patientId, resultData);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const savedResult = response.data;
      this.callbacks.setTestResults(prev => [savedResult, ...prev]);

      // Update appointments hasTestResult flag
      this.callbacks.setAppointments(prev =>
        prev.map(a => (a.patientId === patientId ? { ...a, hasTestResult: true } : a))
      );

      this.notify(
        'Hasil Tes Diterbitkan',
        `Skor ${savedResult.testCode} selesai dikalkulasi: Kategori ${savedResult.severityLevel}. Psikolog Anda dapat mengakses psikogram ini.`,
        'success'
      );

      return savedResult;
    } catch (err: any) {
      this.handleError(err, 'Gagal Memproses Hasil Tes');
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
