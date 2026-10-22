import { ApiClient, ApiResponse, ApiError } from './apiClient';
import { ConsultationPackage, ScheduleSlot, PsychologistProfile } from '../types';

export class PsychologistEndpoints {
  public static readonly BASE_URL = '/api/v1/psychologists';
  public static readonly PACKAGE_BASE_URL = '/api/v1/packages';

  /**
   * POST /api/v1/psychologists/:id/schedules/slot
   */
  public static async addScheduleSlot(
    psychologistId: string,
    date: string,
    startTime: string,
    endTime: string,
    existingSchedules: ScheduleSlot[]
  ): Promise<ApiResponse<ScheduleSlot>> {
    return ApiClient.post(
      `${this.BASE_URL}/${psychologistId}/schedules/slot`,
      { date, startTime, endTime },
      () => {
        const isDuplicate = existingSchedules.some(
          s =>
            s.psychologistId === psychologistId &&
            s.date === date &&
            s.startTime === startTime
        );

        if (isDuplicate) {
          throw new ApiError('Slot jadwal untuk jam ini sudah ada di kalender.', 409);
        }

        const newSlot: ScheduleSlot = {
          id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          psychologistId,
          date,
          startTime,
          endTime,
          isAvailable: true,
          isBooked: false
        };

        return newSlot;
      }
    );
  }

  /**
   * PUT /api/v1/psychologists/:id/schedules/slot/:slotId/availability
   */
  public static async toggleSlotAvailability(
    slotId: string,
    currentSchedules: ScheduleSlot[]
  ): Promise<ApiResponse<ScheduleSlot[]>> {
    return ApiClient.put(
      `${this.BASE_URL}/schedules/slot/${slotId}/availability`,
      {},
      () => {
        const slot = currentSchedules.find(s => s.id === slotId);
        if (!slot) throw new ApiError('Slot jadwal tidak ditemukan', 404);
        if (slot.isBooked) {
          throw new ApiError('Slot yang sudah terpesan pasien tidak dapat dinonaktifkan.', 400);
        }

        return currentSchedules.map(s =>
          s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s
        );
      }
    );
  }

  /**
   * DELETE /api/v1/psychologists/:id/schedules/slot/:slotId
   */
  public static async deleteScheduleSlot(
    slotId: string,
    currentSchedules: ScheduleSlot[]
  ): Promise<ApiResponse<ScheduleSlot[]>> {
    return ApiClient.delete(
      `${this.BASE_URL}/schedules/slot/${slotId}`,
      () => {
        const slot = currentSchedules.find(s => s.id === slotId);
        if (!slot) throw new ApiError('Slot tidak ditemukan', 404);
        if (slot.isBooked) {
          throw new ApiError('Slot yang sudah terpesan oleh pasien tidak boleh dihapus.', 400);
        }

        return currentSchedules.filter(s => s.id !== slotId);
      }
    );
  }

  /**
   * PUT /api/v1/psychologists/:id/profile
   */
  public static async updateProfile(
    psychologistId: string,
    profileData: Partial<PsychologistProfile>,
    allProfiles: PsychologistProfile[]
  ): Promise<ApiResponse<PsychologistProfile[]>> {
    return ApiClient.put(
      `${this.BASE_URL}/${psychologistId}/profile`,
      profileData,
      () => {
        return allProfiles.map(p =>
          p.userId === psychologistId ? { ...p, ...profileData } : p
        );
      }
    );
  }

  /**
   * POST /api/v1/packages atau PUT /api/v1/packages/:packageId
   */
  public static async savePackage(
    pkg: ConsultationPackage,
    allPackages: ConsultationPackage[]
  ): Promise<ApiResponse<ConsultationPackage[]>> {
    const index = allPackages.findIndex(item => item.id === pkg.id);
    if (index < 0) {
      return ApiClient.post(this.PACKAGE_BASE_URL, pkg, () => [pkg, ...allPackages]);
    }

    return ApiClient.put(
      `${this.PACKAGE_BASE_URL}/${pkg.id}`,
      pkg,
      () => {
        const updated = [...allPackages];
        updated[index] = pkg;
        return updated;
      }
    );
  }

  /**
   * DELETE /api/v1/packages/:packageId
   */
  public static async deletePackage(
    packageId: string,
    allPackages: ConsultationPackage[]
  ): Promise<ApiResponse<ConsultationPackage[]>> {
    return ApiClient.delete(
      `${this.PACKAGE_BASE_URL}/${packageId}`,
      () => allPackages.filter(item => item.id !== packageId)
    );
  }
}

