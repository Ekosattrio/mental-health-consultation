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

export interface DayOff extends DayOffPayload {
  id: string;
  psychologist_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleOverridePayload {
  date: string;
  is_open: boolean;
  start_time?: string;
  end_time?: string;
  max_patients: number;
  note?: string;
}

export interface AvailableSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const scheduleService = {
  /**
   * Mendapatkan jadwal mingguan dan slot psikolog
   * Endpoint Laravel: GET /api/v1/psychologists/{id}/schedules
   */
  async getSchedule(psychologistId: string): Promise<ApiResponse<ScheduleSlot[]>> {
    return apiClient.get<ScheduleSlot[]>(`/psychologists/${psychologistId}/schedules`);
  },

  async getWeeklySchedule(psychologistId: string): Promise<ApiResponse<WeeklyScheduleItem[]>> {
    return apiClient.get<WeeklyScheduleItem[]>(`/psychologists/${psychologistId}/schedules/weekly`);
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
  async addDayOff(psychologistId: string, payload: DayOffPayload): Promise<ApiResponse<DayOff>> {
    return apiClient.post<DayOff>(`/psychologists/${psychologistId}/schedules/day-off`, payload);
  },

  async upsertDateOverride(
    psychologistId: string,
    payload: ScheduleOverridePayload
  ): Promise<ApiResponse<ScheduleOverridePayload>> {
    return apiClient.put<ScheduleOverridePayload>(
      `/psychologists/${psychologistId}/schedules/date-overrides/${payload.date}`,
      payload
    );
  },

  async deleteDateOverride(psychologistId: string, date: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/psychologists/${psychologistId}/schedules/date-overrides/${date}`);
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
  async getAvailableSlots(
    psychologistId: string,
    date: string,
    durationMinutes: number
  ): Promise<ApiResponse<AvailableSlot[]>> {
    return apiClient.get<AvailableSlot[]>('/schedules/available-slots', {
      psychologist_id: psychologistId,
      date,
      duration_minutes: durationMinutes
    });
  }
};
