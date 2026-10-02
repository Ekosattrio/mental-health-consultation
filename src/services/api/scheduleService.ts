import { apiClient, ApiResponse } from './client';
import { ScheduleSlot } from '../../types';

export interface WeeklyScheduleItem {
  day_of_week: string; // 'Monday' | 'Tuesday' ...
  is_active: boolean;
  start_time: string; // '09:00'
  end_time: string; // '17:00'
  max_patients: number;
  session_duration_minutes: number;
}

export interface DayOffPayload {
  date: string; // YYYY-MM-DD
  reason?: string;
  max_override_patients?: number;
}

export const scheduleService = {
  /**
   * Mendapatkan jadwal mingguan dan slot psikolog
   * Endpoint Laravel: GET /api/v1/psychologists/{id}/schedules
   */
  async getSchedule(psychologistId: string): Promise<ApiResponse<ScheduleSlot[]>> {
    return apiClient.get<ScheduleSlot[]>(`/psychologists/${psychologistId}/schedules`);
  },

  /**
   * Memperbarui pengaturan jam dan kapasitas mingguan psikolog
   * Endpoint Laravel: PUT /api/v1/psychologists/{id}/schedules/weekly
   */
  async updateWeeklySchedule(
    psychologistId: string,
    schedules: WeeklyScheduleItem[]
  ): Promise<ApiResponse<WeeklyScheduleItem[]>> {
    return apiClient.put<WeeklyScheduleItem[]>(`/psychologists/${psychologistId}/schedules/weekly`, { schedules });
  },

  /**
   * Menambahkan hari libur atau kuota khusus pada tanggal tertentu
   * Endpoint Laravel: POST /api/v1/psychologists/{id}/schedules/day-off
   */
  async addDayOff(psychologistId: string, payload: DayOffPayload): Promise<ApiResponse<any>> {
    return apiClient.post(`/psychologists/${psychologistId}/schedules/day-off`, payload);
  },

  /**
   * Menghapus jadwal libur khusus
   * Endpoint Laravel: DELETE /api/v1/psychologists/{id}/schedules/day-off/{dayOffId}
   */
  async deleteDayOff(psychologistId: string, dayOffId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/psychologists/${psychologistId}/schedules/day-off/${dayOffId}`);
  },

  /**
   * Mendapatkan slot waktu yang tersedia untuk pasien pada tanggal tertentu
   * Endpoint Laravel: GET /api/v1/schedules/available-slots
   */
  async getAvailableSlots(psychologistId: string, date: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/schedules/available-slots', {
      psychologist_id: psychologistId,
      date
    });
  }
};
