import { ApiClient, ApiResponse, ApiError } from './apiClient';
import {
  Appointment,
  ConsultationPackage,
  IntakeForm,
  ScheduleSlot,
  TestResult,
  ChatMessage,
  Review,
  User
} from '../types';

export interface BookAppointmentPayload {
  patientId: string;
  patientName: string;
  patientEmail: string;
  psychologistId: string;
  packageId: string;
  date: string;
  slotId: string;
  paymentMethod?: string;
  startTime?: string;
  endTime?: string;
}

export class PatientEndpoints {
  public static readonly BASE_URL = '/api/v1/patients';

  /**
   * POST /api/v1/appointments/book
   * Concurrency-safe slot lock and double-booking guard
   */
  public static async bookAppointment(
    payload: BookAppointmentPayload,
    schedules: ScheduleSlot[],
    appointments: Appointment[],
    packages: ConsultationPackage[],
    users: User[],
    intakeForms: Record<string, IntakeForm>,
    testResults: TestResult[]
  ): Promise<ApiResponse<{ appointment: Appointment; updatedSlot: ScheduleSlot }>> {
    return ApiClient.post(
      '/api/v1/appointments/book',
      payload,
      () => {
        let slot = schedules.find(s => s.id === payload.slotId);
        if (!slot) {
          // Dynamic/custom generated slot support for any custom date
          const match = payload.slotId.match(/(\d{2}[:.]\d{2})[-_](\d{2}[:.]\d{2})/);
          const start = payload.startTime || (match ? match[1].replace('.', ':') : '09:00');
          const end = payload.endTime || (match ? match[2].replace('.', ':') : '10:00');
          slot = {
            id: payload.slotId,
            psychologistId: payload.psychologistId,
            date: payload.date,
            startTime: start,
            endTime: end,
            isAvailable: true,
            isBooked: false
          };
        }

        if (!slot.isAvailable || slot.isBooked) {
          throw new ApiError(
            'Bentrok Jadwal Terdeteksi! Slot waktu ini baru saja dipesan oleh pasien lain atau dinonaktifkan.',
            409
          );
        }

        // Overlapping appointment check
        const overlapping = appointments.find(
          apt =>
            apt.psychologistId === payload.psychologistId &&
            apt.date === slot.date &&
            apt.startTime === slot.startTime &&
            (apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS' || apt.status === 'PENDING')
        );

        if (overlapping) {
          throw new ApiError(
            'Konflik Reservasi: Psikolog telah memiliki janji temu aktif pada jam tersebut.',
            409
          );
        }

        const selectedPkg = packages.find(p => p.id === payload.packageId) || packages[0];
        const targetPsychologist = users.find(u => u.id === payload.psychologistId);
        const bookingCode = `JS-${payload.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const appointmentId = `apt-${Date.now()}`;

        const appointment: Appointment = {
          id: appointmentId,
          bookingCode,
          patientId: payload.patientId,
          patientName: payload.patientName,
          patientEmail: payload.patientEmail,
          psychologistId: payload.psychologistId,
          psychologistName: targetPsychologist?.name || 'dr. Sarah Jenkins, M.Psi.',
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          packageType: selectedPkg.type,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          totalAmount: selectedPkg.price,
          meetingLocation:
            selectedPkg.type === 'OFFLINE_CLINIC'
              ? 'Klinik JiwaSehat Ruang Lavender Lt. 3'
              : `Room-Live-${bookingCode.slice(-4)}`,
          hasIntakeForm: !!intakeForms[payload.patientId],
          hasTestResult: testResults.some(r => r.patientId === payload.patientId),
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        const updatedSlot: ScheduleSlot = {
          ...slot,
          isAvailable: false,
          isBooked: true,
          appointmentId
        };

        return { appointment, updatedSlot };
      }
    );
  }

  /**
   * POST /api/v1/patients/:id/intake
   */
  public static async submitIntake(
    patientId: string,
    formData: Omit<IntakeForm, 'id' | 'completedAt'>
  ): Promise<ApiResponse<IntakeForm>> {
    return ApiClient.post(
      `${this.BASE_URL}/${patientId}/intake`,
      formData,
      () => {
        const intake: IntakeForm = {
          ...formData,
          id: `intake-${Date.now()}`,
          patientId,
          completedAt: new Date().toISOString().slice(0, 10)
        };
        return intake;
      }
    );
  }

  /**
   * POST /api/v1/patients/:id/tests/submit
   */
  public static async submitTest(
    patientId: string,
    resultData: Omit<TestResult, 'id' | 'completedAt'>
  ): Promise<ApiResponse<TestResult>> {
    return ApiClient.post(
      `${this.BASE_URL}/${patientId}/tests/submit`,
      resultData,
      () => {
        const newResult: TestResult = {
          ...resultData,
          id: `tr-${Date.now()}`,
          completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        return newResult;
      }
    );
  }

  /**
   * POST /api/v1/chat/send
   */
  public static async sendChatMessage(
    appointmentId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ApiResponse<ChatMessage>> {
    return ApiClient.post(
      `/api/v1/chat/${appointmentId}/messages`,
      message,
      () => {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const newMsg: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: timeNow,
          isRead: false
        };
        return newMsg;
      }
    );
  }

  /**
   * POST /api/v1/reviews/submit
   */
  public static async submitReview(
    reviewData: {
      appointmentId: string;
      psychologistId: string;
      patientId: string;
      patientName: string;
      rating: number;
      comment: string;
      isAnonymous: boolean;
      psychologistName: string;
    }
  ): Promise<ApiResponse<Review>> {
    return ApiClient.post(
      '/api/v1/reviews/submit',
      reviewData,
      () => {
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          appointmentId: reviewData.appointmentId,
          patientId: reviewData.patientId,
          patientName: reviewData.patientName,
          isAnonymous: reviewData.isAnonymous,
          anonymousAlias: reviewData.isAnonymous
            ? `Pasien ${reviewData.patientName.charAt(0)}***`
            : undefined,
          psychologistId: reviewData.psychologistId,
          psychologistName: reviewData.psychologistName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          isApproved: false, // moderated by admin
          createdAt: new Date().toISOString().slice(0, 10)
        };
        return newReview;
      }
    );
  }
}

