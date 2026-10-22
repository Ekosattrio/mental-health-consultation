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
import { calculateInitialDp } from '../utils/payments';
import { CONSENT_VERSION, PRIVACY_VERSION, PRE_TEST_VERSION, createRecordId, getPracticeDate, isValidBookingDate } from '../utils/bookingPolicy';

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
  paymentProofName?: string;
  paymentProofMimeType?: string;
  paymentChannelDetail?: string;
  preTestId?: string;
  consentGiven?: boolean;
  consentVersion?: string;
  privacyVersion?: string;
  initialPaymentAmount?: number;
  initialPaymentReceivedDate?: string;
  expectedTotalAmount?: number;
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

        if (slot.isBooked && !appointments.some(appointment =>
          appointment.id === slot!.appointmentId &&
          appointment.date === slot!.date && appointment.startTime === slot!.startTime &&
          ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.status)
        )) {
          slot = { ...slot, isAvailable: true, isBooked: false, appointmentId: undefined };
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

        const preTest = intakeForms[payload.patientId];
        if (!isAdminWalkIn && (!preTest || preTest.patientId !== payload.patientId || preTest.id !== payload.preTestId || preTest.appointmentId ||
          appointments.some(appointment => appointment.preTestId === payload.preTestId))) {
          throw new ApiError(
            'Pre-test wajib diisi sebelum booking. Lengkapi pre-test terlebih dahulu.',
            422
          );
        }

        if (!isAdminWalkIn && (payload.consentGiven !== true || payload.consentVersion !== CONSENT_VERSION || payload.privacyVersion !== PRIVACY_VERSION)) {
          throw new ApiError('Persetujuan informed consent dan privasi versi aktif wajib diberikan.', 422);
        }
        const patient = users.find(user => user.id === payload.patientId && user.role === 'PATIENT');
        if (!patient || patient.status === 'BLOCKED' || (!isAdminWalkIn && !patient.isProfileComplete)) {
          throw new ApiError('Profil pasien belum lengkap atau tidak tersedia.', 422);
        }

        const todayDate = getPracticeDate();
        if (!isValidBookingDate(payload.date)) {
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

        if (selectedPkg.type === 'PSYCHOTHERAPY' && appointments.some(appointment =>
          appointment.patientId === payload.patientId &&
          appointment.packageId === selectedPkg.id &&
          appointment.packageType === 'PSYCHOTHERAPY' &&
          (appointment.continuousSessionNumber || 1) === 1 &&
          appointment.treatmentPlanStatus !== 'COMPLETED' &&
          appointment.treatmentPlanStatus !== 'DISCONTINUED'
        )) {
          throw new ApiError('Rencana psikoterapi sebelumnya masih berjalan. Booking lagi setelah empat sesi selesai.', 422);
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
        if (!isAdminWalkIn && payload.expectedTotalAmount !== payableAmount) {
          throw new ApiError('Tarif layanan berubah. Muat ulang katalog dan periksa kembali rincian sebelum mengirim booking.', 409);
        }
        const dpAmount = calculateInitialDp(payableAmount);
        const bookingCode = `JS-${payload.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const appointmentId = createRecordId('apt');
        const isMultiSession = selectedPkg.type === 'PSYCHOTHERAPY' || selectedPkg.isContinuousCare;
        const plannedSessions = selectedPkg.type === 'PSYCHOTHERAPY' ? 4 : selectedPkg.sessionCount || 1;
        const treatmentPlanId = isMultiSession
          ? `tp-${payload.patientId}-${Date.now()}`
          : undefined;

        const isFreeBooking = payableAmount === 0;
        const isFullPayment = isFreeBooking || (
          isAdminWalkIn && Boolean(payload.paymentMethod?.includes('FULL'))
        );
        const initialAmount = isAdminWalkIn ? payload.initialPaymentAmount || 0 : dpAmount;
        if (isAdminWalkIn && payload.initialPaymentReceivedDate && (!isValidBookingDate(payload.initialPaymentReceivedDate) || payload.initialPaymentReceivedDate > getPracticeDate())) {
          throw new ApiError('Tanggal penerimaan pembayaran tidak valid atau berada di masa depan.', 422);
        }
        if (isAdminWalkIn && (!Number.isInteger(initialAmount) || initialAmount !== (isFullPayment ? payableAmount : dpAmount))) {
          throw new ApiError('Nominal penerimaan tidak sesuai dengan jenis pembayaran. Periksa jumlah yang benar-benar diterima dan kesepakatan pasien.', 422);
        }
        const initialMethod: NonNullable<Appointment['paymentMethod']> =
          payload.paymentMethod?.includes('BANK_TRANSFER') || payload.paymentMethod?.includes('TRANSFER_BANK') ? 'BANK_TRANSFER'
          : payload.paymentMethod?.includes('QRIS') ? 'QRIS'
          : payload.paymentMethod?.includes('EDC') ? 'EDC'
          : payload.paymentMethod?.includes('OTHER') ? 'OTHER' : 'CASH';

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
          paymentStatus: isFreeBooking ? 'PAID' : 'DP_PENDING_VERIFICATION',
          subtotalAmount,
          discountCode: packagePricing.discount?.code || '',
          discountLabel: packagePricing.discount?.label || '',
          discountAmount,
          totalAmount: payableAmount,
          billingMode: selectedPkg.type === 'PSYCHOTHERAPY' ? 'PER_SESSION' : 'PLAN_TOTAL',
          dpAmount,
          remainingAmount: isFreeBooking ? 0 : payableAmount,
          initialPaymentRecord: isAdminWalkIn && initialAmount > 0 ? {
            id: createRecordId('payment'), amount: initialAmount, kind: isFullPayment ? 'FULL' : 'DP',
            method: initialMethod, channelDetail: payload.paymentChannelDetail,
            receivedAt: payload.initialPaymentReceivedDate || new Date().toISOString()
          } : undefined,
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
          paymentProofUrl: payload.paymentProofUrl || '',
          paymentProofName: payload.paymentProofName || '',
          paymentProofMimeType: payload.paymentProofMimeType || '',
          paymentProofState: 'SUBMITTED',
          paymentProofVersion: 1,
          paymentProofSubmittedAt: new Date().toISOString(),
          treatmentPlanId,
          treatmentPlanStatus: isMultiSession ? 'ACTIVE' : undefined,
          continuousSessionNumber: isMultiSession ? 1 : undefined,
          continuousSessionTotal: isMultiSession ? plannedSessions : undefined,
          meetingLocation: selectedPkg.type === 'ONLINE_TELE'
            ? 'Telelayanan - detail media sesi dikirim setelah booking dikonfirmasi'
            : 'Ruang Praktik JiwaSehat Lt. 3, Jl. Senopati No. 42',
          hasIntakeForm: !isAdminWalkIn,
          preTestId: !isAdminWalkIn ? preTest.id : undefined,
          preTestSnapshot: !isAdminWalkIn ? { ...structuredClone(preTest), appointmentId } : undefined,
          consent: !isAdminWalkIn ? {
            documentVersion: CONSENT_VERSION,
            privacyVersion: PRIVACY_VERSION,
            acceptedAt: new Date().toISOString(),
            patientId: payload.patientId
          } : undefined,
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
        if (!formData.occupation.trim() || !formData.primaryConcerns.length || !formData.concernDescription.trim() ||
            !formData.emergencyContact.name.trim() || !formData.emergencyContact.relationship.trim() || !formData.emergencyContact.phone.trim() ||
            !Number.isInteger(formData.currentStressLevel) || formData.currentStressLevel < 1 || formData.currentStressLevel > 10 ||
            !['Baik', 'Cukup', 'Buruk', 'Insomnia Akut'].includes(formData.sleepQuality)) {
          throw new ApiError('Lengkapi pekerjaan, kontak darurat, keluhan utama, deskripsi, tingkat stres, dan kualitas tidur.', 422);
        }
        const intake: IntakeForm = {
          ...formData,
          id: createRecordId('intake'),
          patientId,
          appointmentId: undefined,
          formVersion: PRE_TEST_VERSION,
          completedAt: new Date().toISOString()
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

