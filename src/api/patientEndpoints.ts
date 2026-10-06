import { ApiClient, ApiResponse, ApiError } from './apiClient';
import {
  Appointment,
  ConsultationPackage,
  IntakeForm,
  ScheduleSlot,
  Review,
  User
} from '../types';
import { calculatePackagePayableAmount } from '../utils/discounts';

export interface BookAppointmentPayload {
  bookingSource: 'PATIENT' | 'ADMIN_WALK_IN';
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
  transferSenderName?: string;
  paymentProofUrl?: string;
  paymentChannelDetail?: string;
  paymentReference?: string;
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
    intakeForms: Record<string, IntakeForm>
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

        if (
          slot.psychologistId !== payload.psychologistId ||
          slot.date !== payload.date ||
          (payload.startTime && payload.startTime !== slot.startTime) ||
          (payload.endTime && payload.endTime !== slot.endTime)
        ) {
          throw new ApiError('Data slot tidak sesuai dengan psikolog, tanggal, atau jam yang dipilih.', 422);
        }

        const isAdminWalkIn = payload.bookingSource === 'ADMIN_WALK_IN';

        if (!isAdminWalkIn && !intakeForms[payload.patientId]) {
          throw new ApiError(
            'Pre-test wajib diisi sebelum booking. Lengkapi pre-test terlebih dahulu.',
            422
          );
        }

        const now = new Date();
        const todayDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date) || Number.isNaN(new Date(`${payload.date}T00:00:00`).getTime())) {
          throw new ApiError('Format tanggal booking tidak valid.', 422);
        }
        if (payload.date <= todayDate) {
          throw new ApiError(
            'Booking tidak bisa dilakukan untuk hari yang sama. Pilih jadwal minimal H+1.',
            422
          );
        }

        const toMinutes = (time: string) => {
          const [hour, minute] = time.split(':').map(Number);
          return hour * 60 + minute;
        };
        const requestedStart = toMinutes(slot.startTime);
        const requestedEnd = toMinutes(slot.endTime);

        // Overlapping appointment check
        const overlapping = appointments.find(
          apt => {
            if (apt.psychologistId !== payload.psychologistId || apt.date !== slot.date) return false;
            if (!(apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS' || apt.status === 'PENDING')) return false;
            return requestedStart < toMinutes(apt.endTime) && requestedEnd > toMinutes(apt.startTime);
          }
        );

        if (overlapping) {
          throw new ApiError(
            'Konflik Reservasi: Psikolog telah memiliki janji temu aktif pada jam tersebut.',
            409
          );
        }

        const selectedPkg = packages.find(p => p.id === payload.packageId);
        if (!selectedPkg || !selectedPkg.isActive) {
          throw new ApiError('Paket konsultasi tidak tersedia atau sudah dinonaktifkan.', 422);
        }

        const targetPsychologist = users.find(u => u.id === payload.psychologistId);
        if (!targetPsychologist || targetPsychologist.role !== 'PSYCHOLOGIST') {
          throw new ApiError('Psikolog tujuan tidak ditemukan.', 422);
        }

        const packagePricing = calculatePackagePayableAmount(selectedPkg);
        if (requestedEnd - requestedStart !== selectedPkg.durationMinutes) {
          throw new ApiError('Durasi slot tidak sesuai dengan durasi paket.', 422);
        }
        const subtotalAmount = packagePricing.subtotalAmount;
        const discountAmount = packagePricing.discountAmount;
        const payableAmount = packagePricing.totalAmount;
        const configuredDpAmount = Math.max(selectedPkg.dpAmount ?? 100000, 0);
        const dpAmount = Math.min(configuredDpAmount, payableAmount);
        const bookingCode = `JS-${payload.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const appointmentId = `apt-${Date.now()}`;
        const treatmentPlanId = selectedPkg.isContinuousCare
          ? `tp-${payload.patientId}-${Date.now()}`
          : undefined;

        const isFreeBooking = payableAmount === 0;
        const isFullPayment = isFreeBooking || (
          isAdminWalkIn && Boolean(payload.paymentMethod?.includes('FULL'))
        );

        if (!isAdminWalkIn && !isFreeBooking) {
          if (!payload.transferSenderName?.trim() || !payload.paymentProofUrl?.trim()) {
            throw new ApiError('Nama pengirim dan bukti pembayaran DP wajib dilengkapi.', 422);
          }
        }
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
          status: 'PENDING',
          paymentStatus: isFullPayment ? 'PAID' : 'DP_PENDING_VERIFICATION',
          subtotalAmount,
          discountCode: packagePricing.discount?.code || '',
          discountLabel: packagePricing.discount?.label || '',
          discountAmount,
          totalAmount: payableAmount,
          dpAmount,
          remainingAmount: isFullPayment ? 0 : Math.max(payableAmount - dpAmount, 0),
          paymentMethod: payload.paymentMethod?.includes('BANK_TRANSFER') || payload.paymentMethod?.includes('TRANSFER_BANK')
            ? 'BANK_TRANSFER'
            : payload.paymentMethod?.includes('QRIS')
            ? 'QRIS'
            : payload.paymentMethod?.includes('EDC')
            ? 'EDC'
            : payload.paymentMethod?.includes('OTHER')
            ? 'OTHER'
            : payload.paymentMethod?.includes('CASH')
            ? 'CASH'
            : undefined,
          paymentChannelDetail: payload.paymentChannelDetail || '',
          transferSenderName: payload.transferSenderName || '',
          paymentReference: payload.paymentReference || '',
          paymentProofUrl: payload.paymentProofUrl || '',
          treatmentPlanId,
          continuousSessionNumber: selectedPkg.isContinuousCare ? 1 : undefined,
          continuousSessionTotal: selectedPkg.isContinuousCare ? selectedPkg.sessionCount || 1 : undefined,
          meetingLocation: 'Ruang Praktik JiwaSehat Lt. 3, Jl. Senopati No. 42',
          hasIntakeForm: !!intakeForms[payload.patientId],
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

