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
  ChatMessage,
  Review,
  User as UserEntity,
  UserRole
} from '../types';

export interface PatientStateCallbacks {
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setIntakeForms: React.Dispatch<React.SetStateAction<Record<string, IntakeForm>>>;
  setTestResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

/**
 * PatientController (OOP Controller)
 * Orchestrates patient workflows: appointment reservations with concurrency guards,
 * intake assessment submission, DASS-21 psychological test taking, live chat, and reviews.
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
        'Reservasi Berhasil!',
        `Janji temu ${appointment.bookingCode} berhasil dikonfirmasi. Silakan simpan E-Ticket Anda.`,
        'success'
      );

      return {
        success: true,
        message: 'Janji temu berhasil dikonfirmasi.',
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
          'Data intake tersimpan dengan tanda perhatian khusus. Tim psikolog kami akan memberikan pendampingan intensif.',
          'warning'
        );
      } else {
        this.notify(
          'Formulir Intake Tersimpan',
          'Data keluhan dan riwayat medis Anda telah disinkronkan ke rekam klinis psikolog.',
          'success'
        );
      }

      return savedIntake;
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Intake');
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
   * Send chat message & trigger realistic auto-reply based on role
   */
  public async sendChatMessage(
    appointmentId: string,
    senderId: string,
    senderName: string,
    text: string,
    senderRole: 'PATIENT' | 'PSYCHOLOGIST' | 'SYSTEM' = 'PATIENT',
    activeAppointment?: Appointment
  ): Promise<void> {
    try {
      const response = await PatientEndpoints.sendChatMessage(appointmentId, {
        appointmentId,
        senderId,
        senderRole,
        senderName,
        text
      });

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const newMsg = response.data;
      this.callbacks.setChatMessages(prev => ({
        ...prev,
        [appointmentId]: [...(prev[appointmentId] || []), newMsg]
      }));

      // If PATIENT sends a message, simulate realistic psychologist response
      if (senderRole === 'PATIENT') {
        setTimeout(() => {
          const replies = [
            'Terima kasih sudah berbagi. Saya mendengarkan dengan seksama dan mengerti perasaan Anda. Mari kita telaah pemicunya perlahan.',
            'Apa yang Anda alami adalah reaksi yang sangat wajar terhadap tekanan beban pikiran saat ini. Coba tarik napas dalam 4 hitungan.',
            'Catatan ini sangat membantu saya memahami pola kecemasan Anda. Apakah ada kejadian spesifik kemarin yang memicunya?',
            'Saya sangat mengapresiasi keterbukaan Anda. Mari kita fokus pada hal-hal yang berada di bawah kendali Anda terlebih dahulu.'
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          const replyMsg: ChatMessage = {
            id: `msg-reply-${Date.now()}`,
            appointmentId,
            senderId: activeAppointment?.psychologistId || 'user-psy-1',
            senderRole: 'PSYCHOLOGIST',
            senderName: activeAppointment?.psychologistName || 'dr. Sarah Jenkins, M.Psi., Psikolog',
            text: randomReply,
            timestamp: replyTime,
            isRead: true
          };

          this.callbacks.setChatMessages(curr => ({
            ...curr,
            [appointmentId]: [...(curr[appointmentId] || []), replyMsg]
          }));
        }, 1400);
      } else if (senderRole === 'PSYCHOLOGIST') {
        // When DOCTOR sends message, simulate realistic PATIENT acknowledgment response
        setTimeout(() => {
          const patientReplies = [
            'Baik dok, terima kasih banyak sarannya. Saya akan coba praktikkan teknik pernapasan dan relaksasi ini.',
            'Mengerti dok. Saya merasa jauh lebih lega setelah mendengar penjelasan dan arahan dokter.',
            'Iya dok, betul sekali, hal itu memang sering memicu cemas saya belakangan ini.',
            'Siap dok, saya catat untuk evaluasi di sesi kita berikutnya. Terima kasih banyak.'
          ];
          const randomPatientReply = patientReplies[Math.floor(Math.random() * patientReplies.length)];
          const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          const replyMsg: ChatMessage = {
            id: `msg-patient-reply-${Date.now()}`,
            appointmentId,
            senderId: activeAppointment?.patientId || 'user-pat-1',
            senderRole: 'PATIENT',
            senderName: activeAppointment?.patientName || 'Budi Santoso',
            text: randomPatientReply,
            timestamp: replyTime,
            isRead: true
          };

          this.callbacks.setChatMessages(curr => ({
            ...curr,
            [appointmentId]: [...(curr[appointmentId] || []), replyMsg]
          }));
        }, 1500);
      }
    } catch (err: any) {
      this.handleError(err, 'Gagal Mengirim Pesan');
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
